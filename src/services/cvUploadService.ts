/**
 * src/services/cvUploadService.ts
 * Unified Upload Logic (Aligned with Supabase schema)
 */

import { supabase } from '../lib/supabase';
import { CV_BUCKET, STORAGE_CONFIG } from '../config/storage';
import { 
  getMakeWebhookUrl, 
  validateMakeWebhookUrl, 
  getSafeWebhookUrlForService, 
  maskWebhookUrl 
} from '../config/makeWebhook';
import type { UploadResult, UploadOptions } from '../types/cvUpload';

/**
 * Sanitize filename for Supabase Storage
 */
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
}

/**
 * Upload CV and create database record - Complete Flow
 * * 1. Upload file to Supabase Storage (public bucket)
 * 2. Generate signed URL (1 hour validity)
 * 3. Create database entry in stored_cvs table
 * 4. Trigger Make.com webhook with metadata
 * 5. Return uploadId and fileUrl
 */
export async function uploadCvAndCreateRecord(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { source = 'check', userId = null, sessionId = null } = options;

  console.log('[cvUploadService] ▶️ Starting upload:', {
    fileName: file.name,
    size: file.size,
    source,
  });

  try {
    // ─────────────────────────────────────────────────────────────────────
    // STEP 1: Upload to Supabase Storage
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] 📤 Uploading to bucket:', CV_BUCKET);

    const timestamp = Date.now();
    const sanitizedFileName = sanitizeFileName(file.name);
    const filePath = `${STORAGE_CONFIG.UPLOAD_PATH_PREFIX}/${timestamp}_${sanitizedFileName}`;

    console.log('[cvUploadService] 📤 File path:', filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(CV_BUCKET)
      .upload(filePath, file, {
        cacheControl: STORAGE_CONFIG.CACHE_CONTROL,
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error('[cvUploadService] Upload failed:', uploadError);
      throw new Error('Datei-Upload in Supabase fehlgeschlagen.');
    }

    console.log('[cvUploadService] ✅ File uploaded to storage:', uploadData.path);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2: Generate Signed URL (1 hour validity for Make.com)
    // ─────────────────────────────────────────────────────────────────────
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(CV_BUCKET)
      .createSignedUrl(uploadData.path, 3600);

    const fileUrl = signedUrlData?.signedUrl ?? null;

    if (signedUrlError || !fileUrl) {
      console.error('[cvUploadService] Signed URL failed:', signedUrlError);
      throw new Error('Konnte keine temporäre URL für die Analyse generieren.');
    }

    console.log('[cvUploadService] ✅ Signed URL generated');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 3: Create Database Entry (status = 'pending')
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] 📝 Creating database entry...');

    const { data: dbData, error: dbError } = await supabase
      .from('stored_cvs')
      .insert({
        user_id: userId,
        session_id: sessionId,
        status: 'pending',
        source: 'check',
        file_name: file.name
      })
      .select('id')
      .single();

    if (dbError || !dbData?.id) {
      console.error('[CV-UPLOAD INSERT ERROR]', dbError);
      throw new Error(`Datenbank-Fehler: ${dbError.message}`);
    }

    const uploadId = dbData.id;
    console.log('[cvUploadService] ✅ Database entry created:', uploadId);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 4: Trigger Make.com Webhook
    // ─────────────────────────────────────────────────────────────────────
    console.log('[CV-CHECK] 🔍 Validating webhook configuration...');

    const webhookValidation = validateMakeWebhookUrl();
    let webhookUrl: string | null = null;

    try {
      webhookUrl = getMakeWebhookUrl();
    } catch (error) {
      console.warn('[CV-CHECK] Primary URL failed, using fallback');
      webhookUrl = getSafeWebhookUrlForService();
    }

    if (!webhookUrl) {
      console.error('[CV-CHECK] ❌ Keine Webhook-URL gefunden!');
      await supabase.from('stored_cvs').update({
        status: 'failed',
        error_message: 'Webhook URL missing'
      }).eq('id', uploadId);
    } else {
      console.log('[CV-CHECK] ✅ Webhook URL resolved:', maskWebhookUrl(webhookUrl));

      try {
        // Get Supabase URL for callback function
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const callbackUrl = `${supabaseUrl}/functions/v1/make-cv-callback`;

        // Build JSON payload instead of FormData
        const payload = {
          upload_id: uploadId,
          file_url: fileUrl,
          file_name: file.name,
          source: 'check',
          user_id: userId || null,
          session_id: sessionId || null,
          callback_url: callbackUrl,
          timestamp: new Date().toISOString(),
        };

        console.log('[CV-CHECK] 📤 Triggering Make webhook with payload:', {
          upload_id: payload.upload_id,
          file_name: payload.file_name,
          source: payload.source,
          user_id: payload.user_id ? '[redacted]' : 'null',
          callback_url: callbackUrl,
        });

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log('[CV-CHECK] 📨 Webhook response received:', response.status, response.statusText);

        if (!response.ok) {
          const responseText = await response.text();
          console.error('[CV-CHECK] Webhook failed:', responseText);

          await supabase.from('stored_cvs').update({
            status: 'failed',
            error_message: `Webhook failed with status ${response.status}`
          }).eq('id', uploadId);
        } else {
          console.log('[CV-CHECK] ✅ Webhook POST successful - Make.com is now processing');
          await supabase.from('stored_cvs')
            .update({
              status: 'processing',
              make_sent_at: new Date().toISOString()
            })
            .eq('id', uploadId);
        }
      } catch (webhookError: any) {
        console.error('[CV-CHECK] Exception during webhook:', webhookError);
        await supabase.from('stored_cvs').update({
          status: 'failed',
          error_message: webhookError.message
        }).eq('id', uploadId);
      }
    }

    // ─────────────────────────────────────────────────────────────────────
    // SUCCESS
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] ✅ Upload complete:', { uploadId, fileUrl });

    return {
      success: true,
      uploadId,
      fileUrl,
    };

  } catch (error: any) {
    console.error('[cvUploadService] ❌ Fatal error:', error);
    return {
      success: false,
      error: error?.message || 'Ein unerwarteter Fehler ist aufgetreten',
    };
  }
}