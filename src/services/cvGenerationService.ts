/**
 * CV Generation Service - Make.com Integration
 * Sends wizard data to Make.com and receives optimized CV
 *
 * 🔥 WICHTIG: cv_draft ist nur der Payload-Key-Name für Make
 * In der Datenbank landet alles in stored_cvs.cv_data
 */

import { CVBuilderData } from '../types/cvBuilder';
import { getMakeGeneratorWebhookUrl } from '../config/makeWebhook';

export interface CVGenerationRequest {
  session_id: string;
  user_id: string;
  cv_draft: CVBuilderData; // Make-Payload-Key (wird in stored_cvs.cv_data gespeichert)
}

export interface CVGenerationResponse {
  status: 'success' | 'error';
  cv_document_id?: string;
  editor_data?: {
    title?: string;
    sections?: any[];
    content?: any;
  };
  insights?: string[];
  error?: string;
}

/**
 * Send CV draft to Make.com webhook
 * 🔥 IMPROVED: Bessere Fehlerbehandlung für fehlende Webhook-URL
 */
export async function generateOptimizedCV(
  request: CVGenerationRequest
): Promise<CVGenerationResponse> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('[CV-GENERATION] 🚀 Generating optimized CV...');
  console.log('[CV-GENERATION] Session ID:', request.session_id);
  console.log('[CV-GENERATION] User ID:', request.user_id);
  console.log('═══════════════════════════════════════════════════════════');

  try {
    // 1. Validate webhook URL exists
    let webhookUrl: string;
    try {
      webhookUrl = getMakeGeneratorWebhookUrl();
      console.log('[CV-GENERATION] ✅ Webhook URL configured');
    } catch (urlError: any) {
      console.error('[CV-GENERATION] ❌ Webhook URL not configured:', urlError.message);
      return {
        status: 'error',
        error: 'Make.com Webhook ist nicht konfiguriert. Bitte setze VITE_MAKE_WEBHOOK_CVGENERATOR in der .env Datei.',
      };
    }

    // 2. Validate request data
    if (!request.cv_draft || Object.keys(request.cv_draft).length === 0) {
      console.error('[CV-GENERATION] ❌ Empty CV draft data');
      return {
        status: 'error',
        error: 'CV-Daten sind leer oder ungültig',
      };
    }

    console.log('[CV-GENERATION] Sending request to Make.com...');

    // 3. Send request to Make.com
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('[CV-GENERATION] Response status:', response.status);

    // 4. Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CV-GENERATION] ❌ HTTP Error:', response.status, errorText);

      let errorMessage = `Make.com Webhook-Fehler (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Make.com Webhook nicht gefunden. Bitte prüfe die Webhook-URL.';
      } else if (response.status === 500) {
        errorMessage = 'Make.com Server-Fehler. Bitte versuche es später erneut.';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'Make.com Authentifizierung fehlgeschlagen.';
      } else if (errorText) {
        errorMessage = `Make.com Fehler: ${errorText.substring(0, 200)}`;
      }

      return {
        status: 'error',
        error: errorMessage,
      };
    }

    // 5. Parse JSON response safely
    let data: CVGenerationResponse;
    try {
      const responseText = await response.text();
      console.log('[CV-GENERATION] Raw response (first 500 chars):', responseText.substring(0, 500));

      if (!responseText.trim()) {
        console.error('[CV-GENERATION] ❌ Empty response from Make.com');
        return {
          status: 'error',
          error: 'Make.com hat eine leere Antwort gesendet',
        };
      }

      data = JSON.parse(responseText);
      console.log('[CV-GENERATION] ✅ JSON parsed successfully');
    } catch (parseError: any) {
      console.error('[CV-GENERATION] ❌ JSON parse error:', parseError);
      return {
        status: 'error',
        error: 'Make.com hat eine ungültige Antwort gesendet: ' + parseError.message,
      };
    }

    // 6. Validate response data
    console.log('[CV-GENERATION] ✅ Response received:', {
      status: data.status,
      hasDocumentId: !!data.cv_document_id,
      hasEditorData: !!data.editor_data,
      insightsCount: data.insights?.length || 0,
    });

    if (data.status !== 'success') {
      const errorMsg = data.error || 'CV-Generierung ist fehlgeschlagen';
      console.error('[CV-GENERATION] ❌ Make.com returned error status:', errorMsg);
      return {
        status: 'error',
        error: errorMsg,
      };
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('[CV-GENERATION] ✅ SUCCESS');
    console.log('═══════════════════════════════════════════════════════════');

    return data;
  } catch (error: any) {
    console.log('═══════════════════════════════════════════════════════════');
    console.error('[CV-GENERATION] ❌ UNEXPECTED ERROR:', error);
    console.log('═══════════════════════════════════════════════════════════');

    // Better error messages for common network errors
    let errorMessage = error.message || 'Ein unerwarteter Fehler ist aufgetreten';

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Netzwerkfehler: Konnte Make.com nicht erreichen. Bitte prüfe deine Internetverbindung.';
    } else if (error.name === 'AbortError') {
      errorMessage = 'Anfrage wurde abgebrochen. Bitte versuche es erneut.';
    }

    return {
      status: 'error',
      error: errorMessage,
    };
  }
}

// 🔥 ENTFERNT: saveCVToDatabase - nicht mehr verwendet
// Make.com schreibt direkt in stored_cvs.cv_data via Supabase API
