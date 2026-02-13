/**
 * CV Check Service - Complete Flow Management
 * Handles CV upload to Make.com, analysis fetching from Supabase, and optimization flow
 */

import { supabase } from '../lib/supabase';
import { getMakeWebhookUrl, validateMakeWebhookUrl } from '../config/makeWebhook';

// ============================================================================
// Types
// ============================================================================

export interface CVAnalysisResult {
  overallScore: number;
  categories: {
    structure: { score: number; feedback: string; improvement?: string };
    content: { score: number; feedback: string; improvement?: string };
    atsCompatibility: { score: number; feedback: string; improvement?: string };
    design: { score: number; feedback: string; improvement?: string };
  };
  strengths: string[];
  improvements: string[];
}

export interface CVUploadRecord {
  id: string;
  temp_id: string;
  user_id: string | null;
  original_file_url: string | null;
  vision_text: string | null;
  ats_json: CVAnalysisResult | null;
  created_at: string;
  updated_at: string;
}

export interface CvCheckResponse {
  success: boolean;
  temp_id: string; // Actually contains uploadId (kept for backward compatibility)
  message?: string;
  error?: string;
  data?: CVAnalysisResult;
}

// ============================================================================
// Upload CV to Make.com
// ============================================================================

/**
 * Upload CV to Make.com webhook for analysis
 *
 * @param file - PDF or DOCX file to analyze
 * @param uploadId - Optional upload_id (will be generated if not provided)
 * @param userId - Optional user_id for authenticated users
 * @returns Promise with upload result containing uploadId
 */
export async function uploadCvForCheck(
  file: File,
  uploadId?: string,
  userId?: string
): Promise<CvCheckResponse> {
  console.log('═══════════════════════════════════════════════════════');
  console.log('[CV-CHECK] 🚀 Upload CV für Check gestartet');
  console.log('[CV-CHECK] File:', {
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    sizeBytes: file.size
  });

  // Generate uploadId if not provided
  const finalUploadId = uploadId || crypto.randomUUID();
  console.log('[CV-CHECK] Upload ID:', finalUploadId);
  console.log('[CV-CHECK] User ID:', userId || 'anonymous');

  // Validate webhook URL
  const validation = validateMakeWebhookUrl();
  if (!validation.ok) {
    console.error('[CV-CHECK] ❌ Webhook validation failed:', validation.message);
    return {
      success: false,
      temp_id: finalUploadId,
      error: validation.message
    };
  }

  console.log('[CV-CHECK] ✅ Webhook URL validated');

  try {
    const webhookUrl = getMakeWebhookUrl();
    console.log('[CV-CHECK] URL:', webhookUrl);

    // Build FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_id', finalUploadId);
    if (userId) {
      formData.append('user_id', userId);
    }

    console.log('[CV-CHECK] 📦 FormData prepared:');
    console.log('[CV-CHECK]   - file: File object');
    console.log('[CV-CHECK]   - upload_id:', finalUploadId);
    if (userId) {
      console.log('[CV-CHECK]   - user_id:', userId);
    }

    // Send to Make.com
    console.log('[CV-CHECK] 🌐 Sende POST Request an Make.com...');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
      // NO Content-Type header - browser sets it automatically with boundary
    });

    console.log('[CV-CHECK] 📡 Response empfangen:');
    console.log('[CV-CHECK]   - Status:', response.status);
    console.log('[CV-CHECK]   - Status Text:', response.statusText);
    console.log('[CV-CHECK]   - OK:', response.ok);

    if (!response.ok) {
      let errorText = 'Keine Fehlermeldung verfügbar';
      try {
        errorText = await response.text();
        console.error('[CV-CHECK] ❌ Error Response Body:', errorText);
      } catch (e) {
        console.error('[CV-CHECK] ❌ Konnte Error Body nicht lesen');
      }

      throw new Error(
        `Make.com Webhook returned ${response.status} ${response.statusText}. Error: ${errorText}`
      );
    }

    // SAFE response parsing
    let responseData: any = null;
    try {
      const textResponse = await response.text();
      console.log('[CV-CHECK] 📄 Raw Response (first 500 chars):', textResponse.substring(0, 500));

      if (textResponse.trim()) {
        // Try to parse as JSON
        try {
          responseData = JSON.parse(textResponse);
          console.log('[CV-CHECK] ✅ JSON Response parsed successfully');
        } catch (jsonError) {
          console.log('[CV-CHECK] 📄 Response is not JSON, treating as text');
          responseData = { raw: textResponse };
        }
      }
    } catch (parseError) {
      console.warn('[CV-CHECK] ⚠️ Could not read response (this is OK)');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('[CV-CHECK] ✅ UPLOAD ERFOLGREICH');
    console.log('[CV-CHECK] Make.com wird den CV jetzt analysieren...');
    console.log('═══════════════════════════════════════════════════════');

    return {
      success: true,
      temp_id: finalUploadId,
      message: responseData?.message || 'Upload erfolgreich - Make.com analysiert deinen CV jetzt',
      data: responseData?.ats_json || null
    };
  } catch (error: any) {
    console.log('═══════════════════════════════════════════════════════');
    console.error('[CV-CHECK] ❌ UPLOAD ERROR');
    console.error('[CV-CHECK] Error Type:', error.name);
    console.error('[CV-CHECK] Error Message:', error.message);
    console.error('[CV-CHECK] Full Error:', error);
    console.log('═══════════════════════════════════════════════════════');

    let userMessage = error.message;

    // Make error messages user-friendly
    if (error.message.includes('Failed to fetch')) {
      userMessage =
        'Verbindung zu Make.com fehlgeschlagen. ' +
        'Bitte prüfe deine Internet-Verbindung und die Webhook-URL.';
    } else if (error.message.includes('NetworkError')) {
      userMessage =
        'Netzwerkfehler beim Verbinden zu Make.com. ' +
        'Bitte versuche es später erneut.';
    }

    return {
      success: false,
      temp_id: finalUploadId,
      error: userMessage || 'Fehler beim Hochladen. Bitte versuche es erneut.'
    };
  }
}

// ============================================================================
// Fetch Analysis from Supabase
// ============================================================================

/**
 * Fetch CV analysis by id from Supabase stored_cvs
 * Returns null if not found or still processing
 */
export async function fetchAnalysisById(
  uploadId: string
): Promise<CVUploadRecord | null> {
  console.log('[CV-CHECK] 🔍 Fetching analysis for id:', uploadId);

  try {
    const { data, error } = await supabase
      .from('stored_cvs')
      .select('id, status, ats_json, error_message, processed_at, file_name')
      .eq('id', uploadId)
      .maybeSingle();

    if (error) {
      console.error('[CV-CHECK] ❌ Query error:', error);
      throw error;
    }

    if (!data) {
      console.log('[CV-CHECK] ⏳ Keine Daten gefunden (noch in Bearbeitung)');
      return null;
    }

    console.log('[CV-CHECK] ✅ Daten gefunden:', {
      id: data.id,
      status: data.status,
      has_ats_json: !!data.ats_json,
      file_name: data.file_name
    });

    // Return if status is 'completed' OR if ats_json exists
    const isCompleted = data.status === 'completed' || !!data.ats_json;

    if (!isCompleted) {
      console.log('[CV-CHECK] ⏳ Status:', data.status, '(waiting for completed)');
      return null;
    }

    // Validate ats_json structure
    if (!data.ats_json || typeof data.ats_json !== 'object') {
      console.error('[CV-CHECK] ❌ Invalid ats_json structure');
      return null;
    }

    return data as any;
  } catch (error: any) {
    console.error('[CV-CHECK] ❌ Fetch error:', error);
    throw new Error(`Fehler beim Laden der Analyse: ${error.message}`);
  }
}

// ============================================================================
// Polling
// ============================================================================

/**
 * Poll for analysis completion
 * Polls every intervalMs until maxAttempts or analysis is found
 *
 * @param uploadId - The id from stored_cvs to poll for
 * @param onProgress - Callback for progress updates
 * @param onComplete - Callback when analysis is complete
 * @param onTimeout - Callback when polling times out
 * @param intervalMs - Polling interval in milliseconds (default: 3000)
 * @param maxAttempts - Maximum number of attempts (default: 40 = 2 minutes)
 * @returns Cleanup function to stop polling
 */
export async function pollForAnalysis(
  uploadId: string,
  onProgress: (attempt: number, maxAttempts: number) => void,
  onComplete: (result: CVUploadRecord) => void,
  onTimeout: () => void,
  intervalMs: number = 3000,
  maxAttempts: number = 40
): Promise<() => void> {
  console.log('[CV-CHECK] 🔄 Starting polling for id:', uploadId);
  console.log('[CV-CHECK] Polling config:', {
    intervalMs,
    maxAttempts,
    totalTimeSeconds: (intervalMs * maxAttempts) / 1000
  });

  let attempts = 0;

  const intervalId = setInterval(async () => {
    attempts++;
    console.log(`[CV-CHECK] 🔄 Polling attempt ${attempts}/${maxAttempts}...`);
    onProgress(attempts, maxAttempts);

    if (attempts >= maxAttempts) {
      console.error('[CV-CHECK] ❌ Polling timeout reached');
      clearInterval(intervalId);
      onTimeout();
      return;
    }

    try {
      const result = await fetchAnalysisById(uploadId);

      if (result && result.ats_json) {
        console.log('[CV-CHECK] ✅ Analyse komplett!');
        clearInterval(intervalId);
        onComplete(result);
      } else if (result && (result as any).status === 'failed') {
        console.error('[CV-CHECK] ❌ Analyse fehlgeschlagen');
        clearInterval(intervalId);
        onTimeout();
      }
    } catch (error) {
      console.error('[CV-CHECK] ❌ Polling error:', error);
    }
  }, intervalMs);

  return () => {
    console.log('[CV-CHECK] 🛑 Polling stopped manually');
    clearInterval(intervalId);
  };
}

// ============================================================================
// Link CV to User
// ============================================================================

/**
 * Update user_id for an uploaded CV record
 * Called after user registration to link anonymous CV to user
 */
export async function linkCVToUser(
  uploadId: string,
  userId: string
): Promise<boolean> {
  console.log('[CV-CHECK] 🔗 Linking CV to user:', { uploadId, userId });

  try {
    const { error } = await supabase
      .from('stored_cvs')
      .update({ user_id: userId, updated_at: new Date().toISOString() })
      .eq('id', uploadId);

    if (error) {
      console.error('[CV-CHECK] ❌ Link error:', error);
      return false;
    }

    console.log('[CV-CHECK] ✅ Successfully linked CV to user');
    return true;
  } catch (error: any) {
    console.error('[CV-CHECK] ❌ Link error:', error);
    return false;
  }
}
