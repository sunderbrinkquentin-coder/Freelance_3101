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
    type: file.type,
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

    console.log('[cvUploadService] 📤 Uploading file:', {
      path: filePath,
      size: file.size,
      sizeKB: (file.size / 1024).toFixed(2),
      sizeMB: (file.size / 1024 / 1024).toFixed(2)
    });

    const uploadStartTime = Date.now();
    console.log('[cvUploadService] 🚀 Starting storage upload...');

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(CV_BUCKET)
      .upload(filePath, file, {
        cacheControl: STORAGE_CONFIG.CACHE_CONTROL,
        upsert: false,
      });

    const uploadDuration = Date.now() - uploadStartTime;

    if (uploadError) {
      console.error('[cvUploadService] ❌ Upload failed:', {
        error: uploadError,
        message: uploadError.message,
        statusCode: uploadError.statusCode
      });
      throw new Error(`Upload fehlgeschlagen: ${uploadError.message}`);
    }

    if (!uploadData?.path) {
      console.error('[cvUploadService] ❌ Upload returned no data');
      throw new Error('Upload fehlgeschlagen: Keine Daten erhalten');
    }

    console.log('[cvUploadService] ✅ File uploaded to storage:', {
      path: uploadData.path,
      duration: `${uploadDuration}ms`
    });

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2a: Generate Public URL
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] 🔗 Generating public URL...');
    const { data: publicUrlData } = supabase.storage
      .from(CV_BUCKET)
      .getPublicUrl(uploadData.path);

    const publicUrl = publicUrlData?.publicUrl ?? null;

    if (!publicUrl) {
      console.error('[cvUploadService] ❌ Public URL generation failed');
      throw new Error('Konnte keine öffentliche URL für die Analyse generieren.');
    }

    console.log('[cvUploadService] ✅ Public URL generated:', {
      url: publicUrl,
      length: publicUrl.length
    });

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
        file_name: file.name,
        file_url: fileUrl,
        original_file_url: fileUrl,
        file_path: uploadData.path
      })
      .select('id')
      .single();

    if (dbError || !dbData?.id) {
      console.error('[CV-UPLOAD INSERT ERROR] Full error details:', {
        error: dbError,
        message: dbError?.message,
        details: dbError?.details,
        hint: dbError?.hint,
        code: dbError?.code,
        userId,
        sessionId,
        fileName: file.name,
        filePath: uploadData.path
      });
      throw new Error(`Datenbank-Fehler: ${dbError?.message || 'Unbekannter Fehler'}`);
    }

    const uploadId = dbData.id;
    console.log('[cvUploadService] ✅ Database entry created:', uploadId);

    // Verify we can read the record back immediately
    const { data: verifyData, error: verifyError } = await supabase
      .from('stored_cvs')
      .select('id, user_id, status, source')
      .eq('id', uploadId)
      .maybeSingle();

    if (verifyError) {
      console.error('[CV-UPLOAD VERIFY ERROR] Cannot read back record:', {
        uploadId,
        error: verifyError,
        message: verifyError?.message,
        details: verifyError?.details,
        hint: verifyError?.hint
      });
    } else if (!verifyData) {
      console.error('[CV-UPLOAD VERIFY ERROR] Record not found after insert:', uploadId);
    } else {
      console.log('[cvUploadService] ✅ Verified record readable:', verifyData);
    }

    // ─────────────────────────────────────────────────────────────────────
    // STEP 4: Trigger Make.com Webhook (NON-BLOCKING - Fire and Forget)
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] 🔍 Validating webhook configuration...');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const callbackUrl = `${supabaseUrl}/functions/v1/make-cv-callback`;
    console.log('[cvUploadService] 📌 Callback URL:', callbackUrl);

    let webhookUrl: string | null = null;
    try {
      webhookUrl = getMakeWebhookUrl();
      console.log('[cvUploadService] ✅ Webhook URL loaded from config');
    } catch (error) {
      console.warn('[cvUploadService] ⚠️ Primary URL failed:', error);
      webhookUrl = getSafeWebhookUrlForService();
      if (webhookUrl) {
        console.log('[cvUploadService] ✅ Using fallback webhook URL');
      }
    }

    if (!webhookUrl) {
      console.error('[cvUploadService] ❌ Webhook URL not configured - cannot trigger analysis');
      const errorMsg = 'Webhook URL nicht konfiguriert. Bitte kontaktiere den Support.';
      await supabase.from('stored_cvs').update({
        status: 'failed',
        error_message: errorMsg
      }).eq('id', uploadId);
      console.log('[cvUploadService] 📝 Updated record to failed status');
    } else {
      console.log('[cvUploadService] ✅ Webhook URL configured:', maskWebhookUrl(webhookUrl));

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

      console.log('[cvUploadService] 📤 Webhook payload prepared:', {
        upload_id: makePayload.upload_id,
        file_name: makePayload.file_name,
        source: makePayload.source,
        file_url_length: makePayload.file_url?.length || 0,
        has_fallback_url: !!makePayload.file_url_fallback,
        callback_url: callbackUrl,
      });

      // Set status to processing immediately
      console.log('[cvUploadService] 🚀 Updating status to processing...');
      const now = new Date().toISOString();
      await supabase.from('stored_cvs')
        .update({
          status: 'processing',
          make_sent_at: now
        })
        .eq('id', uploadId);

      console.log('[cvUploadService] ✅ Updated record to processing status');

      // Trigger webhook in background (non-blocking - fire and forget)
      // DO NOT await this call - let it run in background
      console.log('[cvUploadService] 🚀 Starting webhook call in background (non-blocking)...');
      triggerMakeWebhook(webhookUrl, makePayload).catch(error => {
        console.error('[cvUploadService] Background webhook error (non-critical):', error);
      });
      console.log('[cvUploadService] ✅ Webhook call started in background');
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

interface MakeWebhookPayload {
  upload_id: string;
  file_url: string;
  file_url_fallback: string | null;
  file_name: string;
  source: string;
  user_id: string | null;
  session_id: string | null;
  callback_url: string;
  timestamp: string;
}

/**
 * Background async function to trigger Make webhook with retry logic
 * Does not block the main flow
 * Retries up to 3 times on network/timeout failures
 *
 * IMPORTANT: Sends JSON payload with file_url (not FormData with File blob)
 * This prevents CORS issues with large file uploads and allows Make.com to download
 * the file directly from Supabase Storage using the provided URL.
 */
async function triggerMakeWebhook(
  webhookUrl: string,
  payload: MakeWebhookPayload
): Promise<void> {
  const MAX_RETRIES = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const payloadSize = JSON.stringify(payload).length;
      console.log(`[triggerMakeWebhook] 📤 Sending JSON payload to Make.com (attempt ${attempt}/${MAX_RETRIES})...`, {
        upload_id: payload.upload_id,
        file_name: payload.file_name,
        source: payload.source,
        file_url_length: payload.file_url?.length || 0,
        has_fallback_url: !!payload.file_url_fallback,
        payload_size_bytes: payloadSize,
        payload_size_kb: (payloadSize / 1024).toFixed(2),
        webhookUrl: maskWebhookUrl(webhookUrl),
      });

      const startTime = Date.now();
      console.log('[triggerMakeWebhook] 🚀 Sending POST with JSON...');

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120000),
      });

      const duration = Date.now() - startTime;

      console.log(`[triggerMakeWebhook] 📡 Response received (${duration}ms):`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        let responseText = '';
        try {
          responseText = await response.text();
        } catch (e) {
          responseText = '(could not read response)';
        }

        console.error('[triggerMakeWebhook] ❌ Make webhook failed:', {
          upload_id: payload.upload_id,
          status: response.status,
          statusText: response.statusText,
          response: responseText.substring(0, 300),
          attempt,
        });

        if (response.status >= 500 && attempt < MAX_RETRIES) {
          console.log(`[triggerMakeWebhook] 🔄 Retrying due to server error...`);
          lastError = new Error(`Server error ${response.status}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        const errorMsg = `Make.com webhook returned ${response.status}: ${response.statusText}`;
        const { error: updateError } = await supabase
          .from('stored_cvs')
          .update({
            status: 'failed',
            error_message: errorMsg,
          })
          .eq('id', payload.upload_id);

        if (updateError) {
          console.error('[triggerMakeWebhook] Failed to update error status:', updateError);
        } else {
          console.log('[triggerMakeWebhook] 📝 Updated record to failed status');
        }
        return;
      }

      let responseData = null;
      try {
        const responseText = await response.text();
        if (responseText.trim()) {
          responseData = JSON.parse(responseText);
        }
      } catch (e) {
        console.warn('[triggerMakeWebhook] Could not parse response body (this is OK)');
      }

      console.log('[triggerMakeWebhook] ✅ Webhook successfully triggered:', {
        upload_id: payload.upload_id,
        duration: `${duration}ms`,
        response_status: response.status,
        hasResponse: !!responseData,
        attempt,
      });
      return;

    } catch (error: any) {
      lastError = error;
      const isTimeout = error.name === 'TimeoutError' || error.message?.includes('timeout');

      console.warn(`[triggerMakeWebhook] ⚠️ Attempt ${attempt} failed:`, {
        upload_id: payload.upload_id,
        errorType: error.name,
        errorMessage: error.message,
        isTimeout,
      });

      if (isTimeout && attempt === MAX_RETRIES) {
        console.log('[triggerMakeWebhook] ⏱️ Webhook timeout after 120s - marking as processing (will be updated via callback)');
        await supabase
          .from('stored_cvs')
          .update({
            status: 'processing',
            error_message: 'Analysis in progress - Make.com is processing your CV',
          })
          .eq('id', payload.upload_id);
        return;
      }

      if (attempt < MAX_RETRIES) {
        const delay = 1000 * attempt;
        console.log(`[triggerMakeWebhook] 🔄 Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('[triggerMakeWebhook] 💥 All retry attempts failed:', {
    upload_id: payload.upload_id,
    errorType: lastError?.name,
    errorMessage: lastError?.message,
  });

  const errorMsg = `Webhook trigger failed after ${MAX_RETRIES} attempts: ${lastError?.message}`;
  await supabase
    .from('stored_cvs')
    .update({
      status: 'processing',
      error_message: errorMsg,
    })
    .eq('id', payload.upload_id);

  console.log('[triggerMakeWebhook] 📝 Marked as processing despite errors (waiting for callback)');
}