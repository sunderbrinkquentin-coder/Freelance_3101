/**
 * src/services/cvUploadService.ts
 * Unified Upload Logic - Synchronous Flow (No Placeholder)
 */

import { supabase } from '../lib/supabase';
import { CV_BUCKET, STORAGE_CONFIG } from '../config/storage';
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
      if (data?.path) {
        const strippedSdkPath = data.path.startsWith(`${CV_BUCKET}/`)
          ? data.path.slice(CV_BUCKET.length + 1)
          : data.path;
        uploadData = { ...data, path: strippedSdkPath };
      } else {
        uploadData = data;
      }
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
    const normalizeStoragePath = (p: string): string => {
      const prefix = `${CV_BUCKET}/`;
      let normalized = p;
      while (normalized.startsWith(prefix)) {
        normalized = normalized.slice(prefix.length);
      }
      return normalized;
    };
    const storagePath = normalizeStoragePath(uploadData.path);
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
    // STEP 4: Trigger Make.com via Edge Function (server-side proxy)
    // ─────────────────────────────────────────────────────────────────────
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const callbackUrl = `${supabaseUrl}/functions/v1/make-cv-callback`;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/trigger-cv-check`;

    console.log('[cvUploadService] Triggering CV check via Edge Function');

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

    await triggerCvCheckEdgeFunction(edgeFunctionUrl, makePayload, uploadId);

    console.log('[cvUploadService] Upload complete, webhook sent:', { uploadId, fileUrl });

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

interface CVCheckEdgePayload {
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

async function triggerCvCheckEdgeFunction(
  edgeFunctionUrl: string,
  payload: CVCheckEdgePayload,
  uploadId: string
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    console.log('[triggerCvCheckEdgeFunction] Calling edge function:', { upload_id: payload.upload_id });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '(unreadable)');
      console.error('[triggerCvCheckEdgeFunction] Edge function error:', {
        status: response.status,
        body: errorText.substring(0, 300),
      });
      await supabase.from('stored_cvs').update({
        status: 'failed',
        error_message: `Edge function returned ${response.status}: ${errorText.substring(0, 200)}`,
      }).eq('id', uploadId);
      return;
    }

    console.log('[triggerCvCheckEdgeFunction] Edge function called successfully');

  } catch (error: any) {
    const isAbort = error.name === 'AbortError';
    console.warn('[triggerCvCheckEdgeFunction] Failed:', {
      errorType: error.name,
      errorMessage: error.message,
    });

    if (isAbort) {
      console.log('[triggerCvCheckEdgeFunction] Timeout - record remains in processing state');
    } else {
      await supabase.from('stored_cvs').update({
        status: 'processing',
        error_message: `Edge function call failed: ${error.message}`,
      }).eq('id', uploadId);
    }
  }
}
