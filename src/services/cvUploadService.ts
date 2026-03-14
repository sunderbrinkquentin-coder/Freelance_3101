/**
 * src/services/cvUploadService.ts
 * Unified Upload Logic - Synchronous Flow (No Placeholder)
 */

import { supabase } from '../lib/supabase';
import { CV_BUCKET, STORAGE_CONFIG } from '../config/storage';
import {
  getMakeWebhookUrl,
  getSafeWebhookUrlForService,
  maskWebhookUrl
} from '../config/makeWebhook';
import type { UploadResult, UploadOptions } from '../types/cvUpload';

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
 * Upload CV and create database record - Synchronous Flow
 * 1. Upload file to Supabase Storage
 * 2. Generate public URL + signed URL
 * 3. Create database entry with all data (status = 'pending')
 * 4. Trigger Make.com webhook
 * 5. Return uploadId for navigation
 */
export async function uploadCvAndCreateRecord(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { source = 'check', userId = null, tempId = null } = options;

  console.log('[cvUploadService] Starting upload:', {
    fileName: file.name,
    size: file.size,
    type: file.type,
    source,
  });

  try {
    // ─────────────────────────────────────────────────────────────────────
    // STEP 1: Upload file to Supabase Storage
    // ─────────────────────────────────────────────────────────────────────
    const sanitizedFileName = sanitizeFileName(file.name);
    const filePath = `${STORAGE_CONFIG.UPLOAD_PATH_PREFIX}/${Date.now()}_${sanitizedFileName}`;

    console.log('[cvUploadService] Uploading file to storage:', {
      path: filePath,
      sizeMB: (file.size / 1024 / 1024).toFixed(2),
    });

    const uploadStartTime = Date.now();
    let uploadData: any = null;
    let uploadError: any = null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!token) {
        throw new Error('No authentication token available');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${CV_BUCKET}/${filePath}`;

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
      uploadData = { path: strippedPath };

    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('abort')) {
        console.warn('[cvUploadService] Fetch aborted, trying SDK fallback...');
      } else {
        console.warn('[cvUploadService] Fetch upload failed, trying SDK fallback:', fetchError.message);
      }

      const { data, error } = await supabase.storage.from(CV_BUCKET).upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      uploadData = data;
      uploadError = error;
    }

    const uploadDuration = Date.now() - uploadStartTime;

    if (uploadError) {
      throw new Error(`Upload fehlgeschlagen: ${uploadError.message}`);
    }

    if (!uploadData?.path) {
      throw new Error('Upload fehlgeschlagen: Keine Daten erhalten');
    }

    console.log('[cvUploadService] File uploaded to storage:', {
      path: uploadData.path,
      duration: `${uploadDuration}ms`,
    });

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2: Generate URLs
    // ─────────────────────────────────────────────────────────────────────
    const storagePath = uploadData.path;
    const { data: { publicUrl } } = supabase.storage.from(CV_BUCKET).getPublicUrl(storagePath);

    const { data: signedUrlData } = await supabase.storage
      .from(CV_BUCKET)
      .createSignedUrl(storagePath, 3600);

    const signedUrl = signedUrlData?.signedUrl ?? null;
    const fileUrl = publicUrl;

    console.log('[cvUploadService] URLs generated:', {
      publicUrl: fileUrl.substring(0, 60) + '...',
      hasSignedUrl: !!signedUrl,
    });

    // ─────────────────────────────────────────────────────────────────────
    // STEP 3: Create database entry with complete data
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] Creating database entry with complete data...');

    const { data: dbData, error: dbError } = await supabase
      .from('stored_cvs')
      .insert({
        user_id: userId,
        temp_id: tempId,
        session_id: tempId,
        status: 'pending',
        source: 'check',
        file_name: file.name,
        file_url: fileUrl,
        original_file_url: fileUrl,
        file_path: storagePath,
      })
      .select('id')
      .single();

    if (dbError || !dbData?.id) {
      console.error('[cvUploadService] Database insert error:', {
        error: dbError,
        message: dbError?.message,
        code: dbError?.code,
        userId,
        tempId,
      });
      throw new Error(`Datenbank-Fehler: ${dbError?.message || 'Unbekannter Fehler'}`);
    }

    const uploadId = dbData.id;
    console.log('[cvUploadService] Database entry created with ID:', uploadId);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 4: Trigger Make.com Webhook
    // ─────────────────────────────────────────────────────────────────────
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const callbackUrl = `${supabaseUrl}/functions/v1/make-cv-callback`;

    let webhookUrl: string | null = null;
    try {
      webhookUrl = getMakeWebhookUrl();
    } catch {
      webhookUrl = getSafeWebhookUrlForService();
    }

    if (!webhookUrl) {
      const errorMsg = 'Webhook URL nicht konfiguriert. Bitte kontaktiere den Support.';
      await supabase.from('stored_cvs').update({
        status: 'failed',
        error_message: errorMsg,
      }).eq('id', uploadId);
      throw new Error(errorMsg);
    }

    console.log('[cvUploadService] Triggering Make.com webhook:', maskWebhookUrl(webhookUrl));

    const makePayload = {
      upload_id: uploadId,
      file_url: fileUrl,
      file_url_fallback: signedUrl,
      file_name: file.name,
      source: 'check',
      user_id: userId || null,
      temp_id: tempId || null,
      callback_url: callbackUrl,
      timestamp: new Date().toISOString(),
    };

    await supabase.from('stored_cvs').update({
      status: 'processing',
      make_sent_at: new Date().toISOString(),
    }).eq('id', uploadId);

    const makeResponse = await triggerMakeWebhook(webhookUrl, makePayload, uploadId, file);

    if (makeResponse) {
      const updateData: any = {
        status: makeResponse.status || 'completed',
        updated_at: new Date().toISOString(),
      };

      if (makeResponse.ats_json) updateData.ats_json = makeResponse.ats_json;
      if (makeResponse.vision_text) updateData.vision_text = makeResponse.vision_text;
      if (makeResponse.error_message) updateData.error_message = makeResponse.error_message;
      if (makeResponse.status === 'completed') updateData.processed_at = new Date().toISOString();

      await supabase.from('stored_cvs').update(updateData).eq('id', uploadId);
      console.log('[cvUploadService] Updated record with Make.com response');
    }

    console.log('[cvUploadService] Upload complete:', { uploadId, fileUrl });

    return {
      success: true,
      uploadId,
      fileUrl,
    };

  } catch (error: any) {
    console.error('[cvUploadService] Upload failed:', error);
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
  temp_id: string | null;
  callback_url: string;
  timestamp: string;
}

interface MakeResponse {
  status: string;
  ats_json?: any;
  vision_text?: string;
  error_message?: string;
}

async function triggerMakeWebhook(
  webhookUrl: string,
  payload: MakeWebhookPayload,
  uploadId: string,
  file?: File
): Promise<MakeResponse | null> {
  const MAX_RETRIES = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[triggerMakeWebhook] Sending to Make.com (attempt ${attempt}/${MAX_RETRIES}):`, {
        upload_id: payload.upload_id,
        file_name: payload.file_name,
        format: file ? 'FormData' : 'JSON',
        webhookUrl: maskWebhookUrl(webhookUrl),
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      let body: FormData | string;
      let headers: Record<string, string> = {};

      if (file) {
        const formData = new FormData();
        formData.append('file', file, payload.file_name);
        formData.append('upload_id', payload.upload_id);
        formData.append('file_url', payload.file_url);
        if (payload.file_url_fallback) formData.append('file_url_fallback', payload.file_url_fallback);
        formData.append('file_name', payload.file_name);
        formData.append('source', payload.source);
        if (payload.user_id) formData.append('user_id', payload.user_id);
        if (payload.temp_id) formData.append('temp_id', payload.temp_id);
        formData.append('callback_url', payload.callback_url);
        formData.append('timestamp', payload.timestamp);
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(payload);
      }

      let response: Response;
      try {
        response = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      console.log(`[triggerMakeWebhook] Response (attempt ${attempt}):`, {
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => '(unreadable)');
        console.error('[triggerMakeWebhook] Webhook failed:', {
          status: response.status,
          response: responseText.substring(0, 300),
        });

        if (response.status >= 500 && attempt < MAX_RETRIES) {
          lastError = new Error(`Server error ${response.status}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }

        await supabase.from('stored_cvs').update({
          status: 'failed',
          error_message: `Make.com webhook returned ${response.status}: ${response.statusText}`,
        }).eq('id', uploadId);

        return null;
      }

      let responseData: MakeResponse | null = null;
      try {
        const responseText = await response.text();
        if (responseText.trim()) {
          responseData = JSON.parse(responseText) as MakeResponse;
          console.log('[triggerMakeWebhook] Parsed response:', {
            status: responseData?.status,
            has_ats_json: !!responseData?.ats_json,
            has_vision_text: !!responseData?.vision_text,
          });
        }
      } catch (parseErr) {
        console.warn('[triggerMakeWebhook] Could not parse response body:', parseErr);
      }

      console.log('[triggerMakeWebhook] Webhook triggered successfully');
      return responseData;

    } catch (error: any) {
      lastError = error;
      const isAbort = error.name === 'AbortError';

      console.warn(`[triggerMakeWebhook] Attempt ${attempt} failed:`, {
        errorType: error.name,
        errorMessage: error.message,
        isTimeout: isAbort,
      });

      if (isAbort && attempt === MAX_RETRIES) {
        console.log('[triggerMakeWebhook] Timeout after 120s - record remains in processing state');
        await supabase.from('stored_cvs').update({
          status: 'processing',
          error_message: 'Analysis in progress - Make.com is processing your CV',
        }).eq('id', uploadId);
        return null;
      }

      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error('[triggerMakeWebhook] All retry attempts failed:', lastError?.message);

  await supabase.from('stored_cvs').update({
    status: 'processing',
    error_message: `Webhook trigger failed after ${MAX_RETRIES} attempts: ${lastError?.message}`,
  }).eq('id', uploadId);

  return null;
}
