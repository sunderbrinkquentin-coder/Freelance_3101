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
    // STEP 2a: Generate Public URL
    // ─────────────────────────────────────────────────────────────────────
    const { data: publicUrlData } = supabase.storage
      .from(CV_BUCKET)
      .getPublicUrl(uploadData.path);

    const publicUrl = publicUrlData?.publicUrl ?? null;

    if (!publicUrl) {
      console.error('[cvUploadService] Public URL failed');
      throw new Error('Konnte keine öffentliche URL für die Analyse generieren.');
    }

    console.log('[cvUploadService] ✅ Public URL generated:', publicUrl);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2b: Generate Signed URL (1 hour validity as fallback)
    // ─────────────────────────────────────────────────────────────────────
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(CV_BUCKET)
      .createSignedUrl(uploadData.path, 3600);

    const signedUrl = signedUrlData?.signedUrl ?? null;

    if (signedUrlError || !signedUrl) {
      console.error('[cvUploadService] Signed URL failed (using public URL instead):', signedUrlError);
    } else {
      console.log('[cvUploadService] ✅ Signed URL generated as fallback');
    }

    // Nutze Public URL, aber halte Signed URL als Fallback
    const fileUrl = publicUrl;
    const fileUrlFallback = signedUrl;

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
    // STEP 4: Trigger Make.com Webhook (Async - dont wait for response)
    // ─────────────────────────────────────────────────────────────────────
    console.log('[CV-CHECK] 🔍 Validating webhook configuration...');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const callbackUrl = `${supabaseUrl}/functions/v1/make-cv-callback`;

    let webhookUrl: string | null = null;
    try {
      webhookUrl = getMakeWebhookUrl();
    } catch (error) {
      console.warn('[CV-CHECK] Primary URL failed, trying fallback');
      webhookUrl = getSafeWebhookUrlForService();
    }

    if (!webhookUrl) {
      console.error('[CV-CHECK] ❌ Webhook URL nicht konfiguriert');
      await supabase.from('stored_cvs').update({
        status: 'failed',
        error_message: 'Webhook URL nicht konfiguriert'
      }).eq('id', uploadId);
    } else {
      console.log('[CV-CHECK] ✅ Webhook URL:', maskWebhookUrl(webhookUrl));

      // Build Make.com Webhook Payload
      const makePayload = {
        upload_id: uploadId,
        file_url: fileUrl,
        file_url_fallback: fileUrlFallback,
        file_name: file.name,
        source: 'check',
        user_id: userId || null,
        session_id: sessionId || null,
        callback_url: callbackUrl,
        timestamp: new Date().toISOString(),
      };

      console.log('[CV-CHECK] 📤 Webhook payload prepared:', {
        upload_id: makePayload.upload_id,
        file_name: makePayload.file_name,
        source: makePayload.source,
        has_file_url: !!makePayload.file_url,
        has_fallback_url: !!makePayload.file_url_fallback,
      });

      // Trigger webhook in background (dont wait)
      triggerMakeWebhook(webhookUrl, makePayload, uploadId).catch((err) => {
        console.error('[CV-CHECK] Background webhook error:', err);
      });

      // Update status to processing immediately
      await supabase.from('stored_cvs')
        .update({
          status: 'processing',
          make_sent_at: new Date().toISOString()
        })
        .eq('id', uploadId)
        .catch((err) => {
          console.error('[CV-CHECK] Failed to update processing status:', err);
        });
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

/**
 * Background async function to trigger Make webhook
 * Does not block the main flow
 */
async function triggerMakeWebhook(
  webhookUrl: string,
  payload: any,
  uploadId: string
): Promise<void> {
  try {
    console.log('[triggerMakeWebhook] 📨 Sending webhook to Make.com...');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error('[triggerMakeWebhook] ❌ Make webhook failed:', {
        status: response.status,
        statusText: response.statusText,
        response: responseText.substring(0, 200),
      });

      // Update database with error
      await supabase
        .from('stored_cvs')
        .update({
          status: 'failed',
          error_message: `Make webhook failed with status ${response.status}`,
        })
        .eq('id', uploadId)
        .catch((err) => {
          console.error('[triggerMakeWebhook] Failed to update error status:', err);
        });

      return;
    }

    console.log('[triggerMakeWebhook] ✅ Make webhook sent successfully');
  } catch (error: any) {
    console.error('[triggerMakeWebhook] 💥 Exception:', error.message);

    // Update database with error
    await supabase
      .from('stored_cvs')
      .update({
        status: 'failed',
        error_message: `Webhook trigger failed: ${error.message}`,
      })
      .eq('id', uploadId)
      .catch((err) => {
        console.error('[triggerMakeWebhook] Failed to update error status:', err);
      });
  }
}