/**
 * Make.com CV Suggestion Service
 * Sends CV draft data to Make.com to generate an optimized CV suggestion
 *
 * 🔥 WICHTIG: cv_draft ist nur der Payload-Key-Name für Make
 * In der Datenbank landet alles in stored_cvs.cv_data
 */

import { CVBuilderData } from '../types/cvBuilder';

export interface MakeCvSuggestionRequest {
  session_id: string;
  user_id: string;
  cv_draft: CVBuilderData; // Make-Payload-Key (wird in stored_cvs.cv_data gespeichert)
}

export interface MakeCvSuggestionResponse {
  status: 'success' | 'error';
  message?: string;
  cv_data?: {
    title: string;
    sections: any[];
    insights?: string[];
  };
  cv_id?: string;
  error?: string;
}

/**
 * Request optimized CV suggestion from Make.com
 */
export async function requestCvSuggestion(
  request: MakeCvSuggestionRequest
): Promise<MakeCvSuggestionResponse> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('[MAKE-CV-SUGGESTION] 🚀 Requesting CV suggestion...');
  console.log('[MAKE-CV-SUGGESTION] Session ID:', request.session_id);
  console.log('[MAKE-CV-SUGGESTION] User ID:', request.user_id);
  console.log('═══════════════════════════════════════════════════════════');

  try {
    const webhookUrl = import.meta.env.VITE_MAKE_CV_SUGGESTION_WEBHOOK_URL;

    if (!webhookUrl) {
      throw new Error('Make.com CV Suggestion Webhook URL nicht konfiguriert');
    }

    if (webhookUrl.includes('YOUR_WEBHOOK_ID_HERE') || webhookUrl.includes('placeholder')) {
      throw new Error(
        'Bitte konfiguriere die VITE_MAKE_CV_SUGGESTION_WEBHOOK_URL in der .env Datei'
      );
    }

    console.log('[MAKE-CV-SUGGESTION] 🌐 Sending request to Make.com...');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('[MAKE-CV-SUGGESTION] 📡 Response received');
    console.log('[MAKE-CV-SUGGESTION] Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MAKE-CV-SUGGESTION] ❌ Error response:', errorText);
      throw new Error(`Make.com returned ${response.status}: ${errorText}`);
    }

    // SAFE JSON parsing
    let data: MakeCvSuggestionResponse;
    try {
      const responseText = await response.text();
      console.log('[MAKE-CV-SUGGESTION] Raw response (first 500 chars):', responseText.substring(0, 500));

      if (!responseText.trim()) {
        throw new Error('Empty response from Make.com');
      }

      data = JSON.parse(responseText);
      console.log('[MAKE-CV-SUGGESTION] ✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('[MAKE-CV-SUGGESTION] ❌ JSON parse error:', parseError);
      throw new Error('Make.com hat eine ungültige Antwort gesendet');
    }

    console.log('[MAKE-CV-SUGGESTION] ✅ Response data:', {
      status: data.status,
      hasEditorData: !!data.editor_data,
      hasCvId: !!data.cv_id,
    });

    if (data.status !== 'success') {
      throw new Error(data.error || 'CV-Generierung fehlgeschlagen');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('[MAKE-CV-SUGGESTION] ✅ SUCCESS');
    console.log('═══════════════════════════════════════════════════════════');

    return data;
  } catch (error: any) {
    console.log('═══════════════════════════════════════════════════════════');
    console.error('[MAKE-CV-SUGGESTION] ❌ ERROR');
    console.error('[MAKE-CV-SUGGESTION]', error);
    console.log('═══════════════════════════════════════════════════════════');

    return {
      status: 'error',
      error: error.message || 'Ein unerwarteter Fehler ist aufgetreten',
    };
  }
}
