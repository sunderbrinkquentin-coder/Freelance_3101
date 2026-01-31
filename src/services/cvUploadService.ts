/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CV UPLOAD SERVICE - Unified Upload Logic (Aligned with Supabase schema)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * CVs are always stored in the public Supabase bucket 'cv-uploads'.
 * file_path stores the storage path, not a URL.
 *
 * USAGE:
 *   const result = await uploadCvAndCreateRecord(file, { source: 'check' });
 *   if (result.success && result.uploadId) {
 *     navigate(`/cv-analysis?uploadId=${result.uploadId}`);
 *   }
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { supabase } from '../lib/supabase';
import { CV_BUCKET, STORAGE_CONFIG } from '../config/storage';
import { MAKE_WEBHOOK_URL, validateMakeWebhookUrl } from '../config/makeWebhook';
import type { UploadResult, UploadOptions } from '../types/cvUpload';

/**
 * Sanitize filename for Supabase Storage
 */
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
}

/**
 * Upload CV and create database record - Complete Flow
 *
 * 1. Upload file to Supabase Storage (public bucket 'cv-uploads')
 * 2. Generate public URL using getPublicUrl()
 * 3. Create database entry in cv_uploads table
 * 4. Trigger Make.com webhook with metadata
 * 5. Return uploadId and fileUrl
 */
export async function uploadCvAndCreateRecord(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { source = 'upload', userId = null, sessionId = null } = options;

  console.log('[cvUploadService] ▶️ Starting upload:', {
    fileName: file.name,
    size: file.size,
    source,
  });

  try {
    // ─────────────────────────────────────────────────────────────────────
    // STEP 1: Upload to Supabase Storage (public bucket)
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
      console.error('[CV-UPLOAD STORAGE ERROR]', uploadError);
      return {
        success: false,
        error: `Upload fehlgeschlagen: ${uploadError?.message || 'Unbekannter Fehler'}`,
      };
    }

    console.log('[cvUploadService] ✅ File uploaded to storage:', uploadData.path);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2: Generate Signed URL (1 hour validity)
    // ─────────────────────────────────────────────────────────────────────
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(CV_BUCKET)
      .createSignedUrl(uploadData.path, 3600);

    const fileUrl = signedUrlData?.signedUrl ?? null;

    if (signedUrlError || !fileUrl) {
      console.error('[cvUploadService] ❌ Failed to generate signed URL:', signedUrlError);
      return {
        success: false,
        error: 'Konnte keine öffentliche URL generieren',
      };
    }

    console.log('[cvUploadService] ✅ Signed URL generated (1 hour validity):', fileUrl);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 3: Create Database Entry (status = 'pending')
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] 📝 Creating database entry...');

    const insertData = {
      user_id: userId,
      session_id: sessionId,
      status: 'pending',
    };

    console.log('[cvUploadService] 📝 Insert data (sanitized):', {
      ...insertData,
    });

    const { data: dbData, error: dbError } = await supabase
      .from('cv_uploads')
      .insert(insertData)
      .select('id')
      .single();

    if (dbError || !dbData?.id) {
      console.error('[CV-UPLOAD INSERT ERROR]', dbError);
      return {
        success: false,
        error: `Datenbank-Fehler: ${dbError?.message || 'Unbekannter Fehler'}`,
      };
    }

    const uploadId = dbData.id as string;
    console.log('[cvUploadService] ✅ Database entry created:', uploadId);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 4: Trigger Make.com Webhook (CV-Check Contract)
    // ─────────────────────────────────────────────────────────────────────
    console.log('[CV-CHECK] 🔍 Validating webhook configuration...');

    const webhookValidation = validateMakeWebhookUrl();

    if (!webhookValidation.ok) {
      console.error('[CV-CHECK WEBHOOK ERROR] Validation failed:', webhookValidation);

      await supabase
        .from('cv_uploads')
        .update({
          status: 'failed',
        })
        .eq('id', uploadId);

      console.warn(
        '[CV-CHECK] ⚠️ Continuing without webhook - user will see error on analysis page'
      );
    } else {
      console.log('[CV-CHECK] ✅ Webhook validation passed');
      console.log('[CV-CHECK] 🎯 Webhook URL:', MAKE_WEBHOOK_URL);

      try {
        const webhookPayload = {
          upload_id: uploadId,
          file_url: fileUrl,
          user_id: userId || null,
        };

        console.log('[CV-CHECK] 📤 Triggering Make webhook...', {
          url: MAKE_WEBHOOK_URL,
          payload: {
            upload_id: uploadId,
            file_url: `${fileUrl.substring(0, 60)}...`,
            user_id: userId || 'anonymous',
          },
        });

        const response = await fetch(MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
        });

        console.log('[CV-CHECK] 📨 Webhook response status:', response.status);

        if (!response.ok) {
          console.error('[CV-CHECK WEBHOOK ERROR] Failed with status:', response.status);

          await supabase
            .from('stored_cvs')
            .update({
              status: 'failed',
            })
            .eq('id', uploadId);

          console.warn('[CV-CHECK] ⚠️ Webhook failed but continuing to analysis page');
        } else {
          console.log('[CV-CHECK] ✅ Webhook triggered successfully');

          console.log('[CV-CHECK] 🔄 Updating status to processing...');
          await supabase
            .from('cv_uploads')
            .update({ status: 'processing' })
            .eq('id', uploadId);

          console.log('[CV-CHECK] ✅ Status updated to processing');
        }
      } catch (webhookError) {
        console.error('[CV-CHECK WEBHOOK ERROR] Exception occurred:', webhookError);

        await supabase
          .from('stored_cvs')
          .update({
            status: 'failed',
          })
          .eq('id', uploadId);

        console.warn('[CV-CHECK] ⚠️ Webhook error but continuing to analysis page');
      }
    }

    // ─────────────────────────────────────────────────────────────────────
    // SUCCESS
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] ✅ Upload complete:', { uploadId, fileUrl });

    // Wichtig: uploadId + fileUrl zurückgeben, damit die Analysepage laden kann
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

