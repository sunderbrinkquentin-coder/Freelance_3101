/**
 * src/services/cvUploadService.ts
 * Unified Upload Logic - SDK-Only Flow
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
    // STEP 1: Upload file to Supabase Storage via SDK
    // ─────────────────────────────────────────────────────────────────────
    const sanitizedFileName = sanitizeFileName(file.name);
    const filePath = `${STORAGE_CONFIG.UPLOAD_PATH_PREFIX}/${Date.now()}_${sanitizedFileName}`;

    console.log('[cvUploadService] Uploading file to storage via SDK:', {
      path: filePath,
      sizeMB: (file.size / 1024 / 1024).toFixed(2),
    });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(CV_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('[cvUploadService] Storage upload error:', uploadError);
      throw new Error(`Upload fehlgeschlagen: ${uploadError.message}`);
    }

    if (!uploadData?.path) {
      throw new Error('Upload fehlgeschlagen: Keine Pfad-Daten erhalten');
    }

    const normalizeStoragePath = (p: string): string => {
      const prefix = `${CV_BUCKET}/`;
      let normalized = p;
      while (normalized.startsWith(prefix)) {
        normalized = normalized.slice(prefix.length);
      }
      return normalized;
    };

    const storagePath = normalizeStoragePath(uploadData.path);
    console.log('[cvUploadService] File uploaded to storage:', { storagePath });

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2: Generate URLs
    // ─────────────────────────────────────────────────────────────────────
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
    // STEP 3: Create database entry
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] Creating database entry...');

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
    // STEP 4: Update status to processing
    // ─────────────────────────────────────────────────────────────────────
    await supabase.from('stored_cvs').update({
      status: 'processing',
      make_sent_at: new Date().toISOString(),
    }).eq('id', uploadId);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 5: Trigger Make.com via Edge Function (using SDK invoke)
    // ─────────────────────────────────────────────────────────────────────
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const callbackUrl = `${supabaseUrl}/functions/v1/make-cv-callback`;

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

    console.log('[cvUploadService] Triggering CV check via Edge Function (functions.invoke)');

    const { data: fnData, error: fnError } = await supabase.functions.invoke('trigger-cv-check', {
      body: makePayload,
    });

    if (fnError) {
      console.error('[cvUploadService] Edge function error:', fnError);
      await supabase.from('stored_cvs').update({
        status: 'failed',
        error_message: `Edge function error: ${fnError.message}`,
      }).eq('id', uploadId);
    } else {
      console.log('[cvUploadService] Edge function response:', fnData);
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
