// src/services/cvUploadService.ts

import { supabase } from '../lib/supabase';
import { CV_BUCKET, STORAGE_CONFIG } from '../config/storage';
import { getMakeWebhookUrl, validateMakeWebhookUrl, maskWebhookUrl } from '../config/makeWebhook';
import type { UploadResult, UploadOptions } from '../types/cvUpload';

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
}

export async function uploadCvAndCreateRecord(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { source = 'upload', userId = null, sessionId = null } = options;

  try {
    // 1. Storage Upload
    const timestamp = Date.now();
    const sanitizedFileName = sanitizeFileName(file.name);
    const filePath = `${STORAGE_CONFIG.UPLOAD_PATH_PREFIX}/${timestamp}_${sanitizedFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(CV_BUCKET)
      .upload(filePath, file, { cacheControl: STORAGE_CONFIG.CACHE_CONTROL, upsert: false });

    if (uploadError || !uploadData) throw new Error('Supabase Storage Upload fehlgeschlagen');

    // 2. Signed URL (Damit Make die Datei lesen kann)
    const { data: signedUrlData } = await supabase.storage
      .from(CV_BUCKET)
      .createSignedUrl(uploadData.path, 3600);
    const fileUrl = signedUrlData?.signedUrl ?? null;

    // 3. Database Entry in stored_cvs
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

    if (dbError || !dbData?.id) throw new Error(`DB Error: ${dbError?.message}`);
    const uploadId = dbData.id;

    // 4. Trigger Make.com (KRITISCHER FIX)
    let webhookUrl = "HIER_DEINE_MAKE_URL_EINSETZEN"; // Backup: Hart kodiert falls Config leer
    
    try {
        const configUrl = getMakeWebhookUrl();
        if (configUrl) webhookUrl = configUrl;
    } catch (e) { console.warn("Config URL nicht gefunden, nutze Fallback"); }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_id', uploadId);
    formData.append('file_url', fileUrl || '');
    formData.append('source', 'check');
    if (userId) formData.append('user_id', userId);

    console.log('[CV-CHECK] 📤 Sende an Make:', uploadId);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
      // Content-Type NICHT setzen
    });

    if (response.ok) {
      await supabase.from('stored_cvs').update({ status: 'processing' }).eq('id', uploadId);
      console.log('[CV-CHECK] ✅ Make hat empfangen');
    } else {
      console.error('[CV-CHECK] ❌ Make Fehler Status:', response.status);
    }

    return { success: true, uploadId, fileUrl };

  } catch (error: any) {
    console.error('[cvUploadService] ❌ Fataler Fehler:', error);
    return { success: false, error: error.message };
  }
}
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
      const statusCode = (uploadError as any)?.status || (uploadError as any)?.statusCode;
      console.error('[cvUpload] upload failed', {
        bucket: CV_BUCKET,
        path: filePath,
        message: uploadError?.message || 'Unknown error',
        statusCode,
      });
      throw new Error('CV upload failed');
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
      const statusCode = (signedUrlError as any)?.status || (signedUrlError as any)?.statusCode;
      console.error('[cvUpload] signed url failed', {
        bucket: CV_BUCKET,
        path: uploadData.path,
        message: signedUrlError?.message || 'Unknown error',
        statusCode,
      });
      throw new Error('Could not generate signed URL for uploaded CV');
    }

    console.log('[cvUploadService] ✅ Signed URL generated (1 hour validity)');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 3: Create Database Entry (status = 'pending')
    // ─────────────────────────────────────────────────────────────────────
    console.log('[cvUploadService] 📝 Creating database entry...');

  // NEU: Zentrales Speichern in stored_cvs
const insertData = {
  user_id: userId,
  session_id: sessionId,
  status: 'pending',
  source: 'check', // Markiert, dass dieser Record durch den Check-Flow erstellt wurde
  file_name: file.name,
  // cv_data bleibt initial leer {}, wird später von Make befüllt
};

const { data: dbData, error: dbError } = await supabase
  .from('stored_cvs') // ✅ Neue zentrale Tabelle
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
    console.log('[CV-CHECK] Validation result:', webhookValidation);

    // Try to get webhook URL (with fallback)
    let webhookUrl: string | null = null;
    try {
      webhookUrl = getMakeWebhookUrl();
    } catch (error) {
      console.warn('[CV-CHECK] Primary URL retrieval failed, trying fallback...');
      webhookUrl = getSafeWebhookUrlForService();
    }

    if (!webhookUrl) {
      console.error('[CV-CHECK WEBHOOK ERROR] No webhook URL available (not in environment)');

      await supabase
        .from('stored_cvs')
        .update({
          status: 'failed',
          error_message: 'Make.com webhook URL not configured'
        })
        .eq('id', uploadId);

      console.warn(
        '[CV-CHECK] ⚠️ Webhook URL missing - webhook will not be triggered'
      );
    } else {
      console.log('[CV-CHECK] ✅ Webhook URL resolved:', maskWebhookUrl(webhookUrl));

      try {
        // Build FormData with actual file (Make.com needs the file, not just metadata)
// src/services/cvUploadService.ts

// ... im try-block des Webhooks ...
const formData = new FormData();
formData.append('file', file);
formData.append('upload_id', uploadId); // Dies ist nun die ID aus stored_cvs
formData.append('file_url', fileUrl);
formData.append('source', 'check');    // Wichtig für die Logik in Make
if (userId) {
  formData.append('user_id', userId);
}

        console.log('[CV-CHECK] 📤 Triggering Make webhook with FormData...', {
          webhook_url_masked: maskWebhookUrl(webhookUrl),
          upload_id: uploadId,
          file_name: file.name,
          file_size: file.size,
          user_id: userId || 'anonymous',
          payload_fields: ['file', 'upload_id', 'file_url', userId ? 'user_id' : null].filter(Boolean),
        });

        const response = await fetch(webhookUrl, {
          method: 'POST',
          body: formData,
          // NO Content-Type header - browser sets it automatically with boundary
        });

        console.log('[CV-CHECK] 📨 Webhook response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        });

        if (!response.ok) {
          console.error('[CV-CHECK WEBHOOK ERROR] Webhook call failed with status:', {
            status: response.status,
            statusText: response.statusText,
          });

          // Try to read error response for debugging
          try {
            const responseText = await response.text();
            if (responseText) {
              console.error('[CV-CHECK] Webhook error response:', responseText.substring(0, 200));
            }
          } catch (readError) {
            console.warn('[CV-CHECK] Could not read error response:', readError);
          }

          await supabase
            .from('stored_cvs')
            .update({
              status: 'failed',
              error_message: `Webhook failed with status ${response.status}`
            })
            .eq('id', uploadId);

          console.warn('[CV-CHECK] ⚠️ Webhook HTTP error but continuing to analysis page');
        } else {
          console.log('[CV-CHECK] ✅ Webhook POST successful (status 200)');

          console.log('[CV-CHECK] 🔄 Updating database status to processing...');
          const { error: updateError } = await supabase
            .from('stored_cvs')
            .update({ status: 'processing' })
            .eq('id', uploadId);

          if (updateError) {
            console.error('[CV-CHECK] Error updating status to processing:', updateError);
          } else {
            console.log('[CV-CHECK] ✅ Database status updated to processing');
          }
        }
      } catch (webhookError: any) {
        console.error('[CV-CHECK WEBHOOK ERROR] Exception during webhook call:', {
          error: webhookError?.message || webhookError,
          type: webhookError?.name || 'Unknown',
        });

        await supabase
          .from('stored_cvs')
          .update({
            status: 'failed',
            error_message: `Webhook error: ${webhookError?.message || 'Unknown error'}`
          })
          .eq('id', uploadId);

        console.warn('[CV-CHECK] ⚠️ Webhook exception but continuing to analysis page');
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

