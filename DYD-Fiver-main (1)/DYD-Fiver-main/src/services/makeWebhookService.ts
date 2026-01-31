/**
 * Make.com Webhook Integration Service
 * Handles CV upload and analysis via Make scenario
 */

import { assertMakeWebhookConfigured } from '../config/make';

export interface MakeUploadResponse {
  success: boolean;
  temp_id: string;
  message?: string;
  error?: string;
}

export interface MakeAnalysisResult {
  temp_id: string;
  original_file_url: string;
  vision_text: string;
  ats_json: {
    overallScore: number;
    categories: {
      structure: { score: number; feedback: string };
      content: { score: number; feedback: string };
      atsCompatibility: { score: number; feedback: string };
      design: { score: number; feedback: string };
    };
    strengths: string[];
    improvements: string[];
  };
}

/**
 * Upload CV to Make.com webhook using FormData
 * 
 * @param file - PDF or DOCX file to upload
 * @param tempId - Unique temp_id for tracking
 * @param userId - Optional user_id for authenticated users
 * @returns Promise with upload result
 */
export async function uploadCVToMake(
  file: File,
  tempId: string,
  userId?: string
): Promise<MakeUploadResponse> {
  console.log('═══════════════════════════════════════════════════════');
  console.log('[CV-CHECK] 🚀 UPLOAD STARTED');
  console.log('[CV-CHECK] File:', {
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    sizeBytes: file.size
  });
  console.log('[CV-CHECK] Temp ID:', tempId);
  console.log('[CV-CHECK] User ID:', userId || 'anonymous');
  console.log('═══════════════════════════════════════════════════════');

  try {
    // Get and validate webhook URL
    const webhookUrl = assertMakeWebhookConfigured();
    
    // Check for placeholder
    if (webhookUrl.includes('placeholder')) {
      console.error('[CV-CHECK] ❌ PLACEHOLDER URL DETECTED!');
      throw new Error(
        'Make.com Webhook URL ist noch ein Platzhalter. ' +
        'Bitte ersetze "placeholder-webhook-id" in der .env mit deiner echten Make.com Webhook-ID.'
      );
    }

    console.log('[CV-CHECK] ✅ Webhook URL validated');
    console.log('[CV-CHECK] URL:', webhookUrl);

    // Build FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('temp_id', tempId);
    if (userId) {
      formData.append('user_id', userId);
    }

    console.log('[CV-CHECK] 📦 FormData prepared:');
    console.log('[CV-CHECK]   - file: File object');
    console.log('[CV-CHECK]   - temp_id:', tempId);
    if (userId) {
      console.log('[CV-CHECK]   - user_id:', userId);
    }

    // Send to Make.com
    console.log('[CV-CHECK] 🌐 Sending POST request to Make.com...');
    console.log('[CV-CHECK] Target URL:', webhookUrl);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formData
      // NO Content-Type header - browser sets it automatically with boundary
    });

    console.log('[CV-CHECK] 📡 Response received:');
    console.log('[CV-CHECK]   - Status:', response.status);
    console.log('[CV-CHECK]   - Status Text:', response.statusText);
    console.log('[CV-CHECK]   - OK:', response.ok);
    console.log('[CV-CHECK]   - Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorText = 'No error body';
      try {
        errorText = await response.text();
        console.error('[CV-CHECK] ❌ Error response body:', errorText);
      } catch (e) {
        console.error('[CV-CHECK] ❌ Could not read error body');
      }
      
      throw new Error(
        `Make.com Webhook returned ${response.status} ${response.statusText}. ` +
        `Error: ${errorText}`
      );
    }

    // Try to parse response
    let responseBody: any = null;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseBody = await response.json();
        console.log('[CV-CHECK] 📄 JSON response:', responseBody);
      } else {
        const textResponse = await response.text();
        console.log('[CV-CHECK] 📄 Text response:', textResponse);
        responseBody = { raw: textResponse };
      }
    } catch (parseError) {
      console.warn('[CV-CHECK] ⚠️ Could not parse response (this is OK)');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('[CV-CHECK] ✅ UPLOAD SUCCESSFUL');
    console.log('═══════════════════════════════════════════════════════');

    return {
      success: true,
      temp_id: tempId,
      message: responseBody?.message || 'Upload erfolgreich - Make.com wird den CV jetzt analysieren'
    };
  } catch (error: any) {
    console.log('═══════════════════════════════════════════════════════');
    console.error('[CV-CHECK] ❌ UPLOAD ERROR');
    console.error('[CV-CHECK] Error type:', error.name);
    console.error('[CV-CHECK] Error message:', error.message);
    console.error('[CV-CHECK] Full error:', error);
    console.log('═══════════════════════════════════════════════════════');

    let userMessage = error.message;
    
    // Make error messages more user-friendly
    if (error.message.includes('Failed to fetch')) {
      userMessage = 
        'Verbindung zu Make.com fehlgeschlagen. ' +
        'Bitte prüfe deine Internet-Verbindung und die Webhook-URL.';
    } else if (error.message.includes('placeholder')) {
      userMessage = error.message; // Already user-friendly
    }

    return {
      success: false,
      temp_id: tempId,
      error: userMessage || 'Fehler beim Hochladen. Bitte versuche es erneut.'
    };
  }
}

// Re-export config functions
export { isMakeWebhookConfigured } from '../config/make';
