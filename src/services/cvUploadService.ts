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
 * Removes all special characters, spaces, and non-ASCII characters
 * Only allows: a-z, A-Z, 0-9, dot (.), hyphen (-)
 */
function sanitizeFileName(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  const nameWithoutExt = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';

  const cleanName = nameWithoutExt
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9.-]/g, '')
    .replace(/\.+/g, '.')
    .replace(/-+/g, '-')
    .replace(/^[-.]|[-.]$/g, '');

  const cleanExt = extension.toLowerCase().replace(/[^a-z0-9.]/g, '');

  return cleanName + cleanExt || 'file.pdf';
}

/**
 * Upload CV and create database record - Complete Flow
 * 1. Create placeholder database entry (status = 'uploading')
 * 2. Return uploadId immediately for navigation
 * 3. Upload file to Supabase Storage in background
 * 4. Generate public URL and verify accessibility
 * 5. Generate signed URL as fallback (1 hour validity)
 * 6. Trigger Make.com webhook with metadata (synchronous)
 * 7. Update status to processing/completed
 */
export async function uploadCvAndCreateRecord(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { source = 'check', userId = null, tempId = null } = options;

  console.log('[cvUploadService] ▶️ Starting upload:', {
    fileName: file.name,
    size: file.size,
    type: file.type,
    source,
  });

  try {
    // ─────────────────────────────────────────────────────────────────────
    // STEP 1: Create Database Entry FIRST (status = 'uploading')
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] 📝 Creating placeholder database entry...');

    let dbData: { id: string } | null = null;
    let dbError: any = null;
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      const insertPromise = supabase
        .from('stored_cvs')
        .insert({
          user_id: userId,
          temp_id: tempId,
          session_id: tempId,
          status: 'uploading',
          source: 'check',
          file_name: file.name,
        })
        .select('id')
        .single();

      const insertTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB_TIMEOUT: Datenbankverbindung unterbrochen. Bitte lade die Seite neu.')), 15000)
      );

      const result = await Promise.race([insertPromise, insertTimeout]) as Awaited<typeof insertPromise>;
      dbData = result.data;
      dbError = result.error;

      if (!dbError || dbError.name !== 'AbortError') break;

      retries++;
      console.warn(`[cvUploadService] AbortError on insert attempt ${retries}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 300 * retries));
    }

    if (dbError || !dbData?.id) {
      console.error('[CV-UPLOAD INSERT ERROR] Full error details:', {
        error: dbError,
        message: dbError?.message,
        details: dbError?.details,
        hint: dbError?.hint,
        code: dbError?.code,
        userId,
        tempId,
        fileName: file.name,
      });
      throw new Error(`Datenbank-Fehler: ${dbError?.message || 'Unbekannter Fehler'}`);
    }

    const uploadId = dbData.id;
    console.log('[cvUploadService] ✅ Placeholder created with ID:', uploadId);

    // Start background upload process (non-blocking)
    continueUploadInBackground(uploadId, file, userId, tempId).catch((err) => {
      console.error('[cvUploadService] Background upload failed:', err);
    });

    // Return immediately for navigation
    console.log('[cvUploadService] ✅ Returning uploadId for immediate navigation');
    return {
      success: true,
      uploadId,
      fileUrl: null,
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
 * Continue upload process in background after returning uploadId
 */
async function continueUploadInBackground(
  uploadId: string,
  file: File,
  userId: string | null,
  tempId: string | null
): Promise<void> {
  try {
    // ─────────────────────────────────────────────────────────────────────
    // STEP 2: Upload to Supabase Storage
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] 📤 Uploading to bucket:', CV_BUCKET);

    const sanitizedFileName = sanitizeFileName(file.name);
    const pathPrefix = tempId || `anon_${Date.now()}`;
    const filePath = `${pathPrefix}/${sanitizedFileName}`;

    console.log('[cvUploadService] 📤 Uploading file:', {
      path: filePath,
      size: file.size,
      sizeKB: (file.size / 1024).toFixed(2),
      sizeMB: (file.size / 1024 / 1024).toFixed(2)
    });

    const uploadStartTime = Date.now();
    console.log('[cvUploadService] 🚀 Starting storage upload with fetch fallback...');

    let uploadData: any = null;
    let uploadError: any = null;

    try {
      const uploadPromise = (async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!token) {
          throw new Error('No authentication token available');
        }

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const uploadUrl = `${supabaseUrl}/storage/v1/object/${CV_BUCKET}/${filePath}`;

        console.log('[cvUploadService] 📤 Using fetch API for upload to:', uploadUrl);

        const uploadAbortController = new AbortController();
        const uploadAbortTimeout = setTimeout(() => uploadAbortController.abort(), 85000);

        let response: Response;
        try {
          response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Content-Type': file.type,
              'x-upsert': 'true',
            },
            body: file,
            signal: uploadAbortController.signal,
          });
        } finally {
          clearTimeout(uploadAbortTimeout);
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        const rawKey: string = result.Key || filePath;
        const strippedPath = rawKey.startsWith(`${CV_BUCKET}/`)
          ? rawKey.slice(CV_BUCKET.length + 1)
          : rawKey;
        return { path: strippedPath };
      })();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('BROWSER_BLOCK: Upload timeout after 90 seconds')), 90000);
      });

      uploadData = await Promise.race([uploadPromise, timeoutPromise]);
      console.log('[cvUploadService] ✅ Fetch-based upload succeeded');

    } catch (error: any) {
      if (error.message?.includes('BROWSER_BLOCK')) {
        console.warn('[cvUploadService] ⚠️ Browser blocking detected, attempting SDK fallback...');

        const fallbackPromise = supabase.storage.from(CV_BUCKET).upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

        const timeoutPromise2 = new Promise<any>((_, reject) => {
          setTimeout(() => reject(new Error('SDK upload also timed out')), 60000);
        });

        try {
          const result = await Promise.race([fallbackPromise, timeoutPromise2]);
          uploadData = result.data;
          uploadError = result.error;
        } catch (fallbackError) {
          console.error('[cvUploadService] ❌ Both upload methods failed');
          uploadError = fallbackError;
        }
      } else {
        uploadError = error;
      }
    }

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
    // STEP 2: Generate Public URL
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] 🔗 Generating public URL...');

    const { data: { publicUrl } } = supabase.storage.from(CV_BUCKET).getPublicUrl(filePath);

    console.log('[cvUploadService] ✅ Public URL generated:', {
      url: publicUrl,
      filePath,
      length: publicUrl.length
    });

    // ─────────────────────────────────────────────────────────────────────
    // STEP 3: Generate Signed URL (1 hour validity as fallback)
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
    // STEP 4: Update Database Entry with file URLs (status = 'pending')
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] 📝 Updating database entry with file URLs...');

    const { error: updateError } = await supabase
      .from('stored_cvs')
      .update({
        status: 'pending',
        file_url: fileUrl,
        original_file_url: fileUrl,
        file_path: uploadData.path
      })
      .eq('id', uploadId);

    if (updateError) {
      console.error('[cvUploadService] ❌ Failed to update database entry:', updateError);
      throw new Error(`Datenbank-Update fehlgeschlagen: ${updateError.message}`);
    }

    console.log('[cvUploadService] ✅ Database entry updated with file URLs');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 5: Trigger Make.com Webhook (Synchronous with Immediate Response)
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
      throw new Error(errorMsg);
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
        temp_id: tempId || null,
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

      // IMPORTANT: Make.com returns results SYNCHRONOUSLY, not via callback!
      // We must await and process the response immediately
      console.log('[cvUploadService] 🚀 Triggering Make.com webhook and waiting for response...');
      const makeResponse = await triggerMakeWebhook(webhookUrl, makePayload);

      if (makeResponse) {
        console.log('[cvUploadService] 📊 Received response from Make.com:', {
          status: makeResponse.status,
          has_ats_json: !!makeResponse.ats_json,
          has_vision_text: !!makeResponse.vision_text,
        });

        // Update database with results immediately
        const updateData: any = {
          status: makeResponse.status || 'completed',
          updated_at: new Date().toISOString(),
        };

        if (makeResponse.ats_json) {
          updateData.ats_json = makeResponse.ats_json;
        }

        if (makeResponse.vision_text) {
          updateData.vision_text = makeResponse.vision_text;
        }

        if (makeResponse.error_message) {
          updateData.error_message = makeResponse.error_message;
        }

        if (makeResponse.status === 'completed') {
          updateData.processed_at = new Date().toISOString();
        }

        const { error: updateError } = await supabase
          .from('stored_cvs')
          .update(updateData)
          .eq('id', uploadId);

        if (updateError) {
          console.error('[cvUploadService] Failed to update with Make response:', updateError);
        } else {
          console.log('[cvUploadService] ✅ Successfully updated record with Make.com results');
        }
      } else {
        console.log('[cvUploadService] ⚠️ No response from Make.com - record remains in processing state');
      }
    }

    // ─────────────────────────────────────────────────────────────────────
    // SUCCESS
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] ✅ Background upload complete:', { uploadId, fileUrl });

  } catch (error: any) {
    console.error('[cvUploadService] ❌ Background upload failed:', error);

    try {
      await supabase
        .from('stored_cvs')
        .update({
          status: 'failed',
          error_message: error?.message || 'Upload fehlgeschlagen',
        })
        .eq('id', uploadId);
    } catch (dbErr) {
      console.error('[cvUploadService] ❌ Could not mark record as failed:', dbErr);
    }

    throw error;
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
interface MakeResponse {
  status: string;
  ats_json?: any;
  vision_text?: string;
  error_message?: string;
}

async function triggerMakeWebhook(
  webhookUrl: string,
  payload: MakeWebhookPayload
): Promise<MakeResponse | null> {
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      let response: Response;
      try {
        response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

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
        return null;
      }

      let responseData: MakeResponse | null = null;
      try {
        const responseText = await response.text();
        console.log('[triggerMakeWebhook] 📄 Raw response:', responseText.substring(0, 500));

        if (responseText.trim()) {
          responseData = JSON.parse(responseText) as MakeResponse;
          console.log('[triggerMakeWebhook] 📊 Parsed response data:', {
            status: responseData?.status,
            has_ats_json: !!responseData?.ats_json,
            has_vision_text: !!responseData?.vision_text,
            has_error: !!responseData?.error_message,
          });
        }
      } catch (e) {
        console.warn('[triggerMakeWebhook] Could not parse response body:', e);
      }

      console.log('[triggerMakeWebhook] ✅ Webhook successfully triggered:', {
        upload_id: payload.upload_id,
        duration: `${duration}ms`,
        response_status: response.status,
        hasResponse: !!responseData,
        attempt,
      });

      return responseData;

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
        return null;
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
  return null;
}