/**
 * CV Generation Service - Make.com Integration
 * Sends wizard data to Make.com and receives optimized CV
 *
 * 🔥 WICHTIG: cv_draft ist nur der Payload-Key-Name für Make
 * In der Datenbank landet alles in stored_cvs.cv_data
 */

import { CVBuilderData } from '../types/cvBuilder';

const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/tgu7hpllgy3nyslrp2qf5fcjsc06vkuq';

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
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('[CV-GENERATION] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CV-GENERATION] Error response:', errorText);
      throw new Error(`Make.com returned ${response.status}: ${errorText}`);
    }

    // SAFE JSON parsing
    let data: CVGenerationResponse;
    try {
      const responseText = await response.text();
      console.log('[CV-GENERATION] Raw response (first 500 chars):', responseText.substring(0, 500));

      if (!responseText.trim()) {
        throw new Error('Empty response from Make.com');
      }

      data = JSON.parse(responseText);
      console.log('[CV-GENERATION] ✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('[CV-GENERATION] ❌ JSON parse error:', parseError);
      throw new Error('Make.com hat eine ungültige Antwort gesendet');
    }

    console.log('[CV-GENERATION] ✅ Response received:', {
      status: data.status,
      hasDocumentId: !!data.cv_document_id,
      hasEditorData: !!data.editor_data,
      insightsCount: data.insights?.length || 0,
    });

    if (data.status !== 'success') {
      throw new Error(data.error || 'CV generation failed');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('[CV-GENERATION] ✅ SUCCESS');
    console.log('═══════════════════════════════════════════════════════════');

    return data;
  } catch (error: any) {
    console.log('═══════════════════════════════════════════════════════════');
    console.error('[CV-GENERATION] ❌ ERROR:', error);
    console.log('═══════════════════════════════════════════════════════════');

    return {
      status: 'error',
      error: error.message || 'Ein unerwarteter Fehler ist aufgetreten',
    };
  }
}

// 🔥 ENTFERNT: saveCVToDatabase - nicht mehr verwendet
// Make.com schreibt direkt in stored_cvs.cv_data via Supabase API
