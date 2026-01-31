/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GET CV UPLOAD - Load Analysis Results from Supabase (Aligned with schema)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * TABLE: cv_uploads
 * RELATED TABLE: ats_analyses (via upload_id foreign key)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { supabase } from '../lib/supabase';

/**
 * CV Upload Data Structure (matches cv_uploads table)
 */
export interface CvUpload {
  id: string;
  user_id: string | null;
  session_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  status: string;
  analysis_status?: string | null; // Deprecated: use 'status' instead
  ats_json?: any;
  vision_text?: string | null;
  error_message?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * ATS Analysis Data Structure (from ats_analyses table)
 */
export interface AtsAnalysis {
  id: string;
  upload_id: string;
  ats_score: number | null;
  analysis_data: any | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Combined result with upload + analysis
 */
export interface CvUploadWithAnalysis extends CvUpload {
  ats_analysis: AtsAnalysis | null;
}

/**
 * Load a single CV upload by ID from Supabase with its ATS analysis
 *
 * @param uploadId - The UUID of the CV upload (cv_uploads.id)
 * @returns CvUploadWithAnalysis object or null if not found
 */
export async function getCvUploadById(uploadId: string): Promise<CvUploadWithAnalysis | null> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('[GET-CV-UPLOAD] 🔍 Loading upload data...');
  console.log('[GET-CV-UPLOAD] Upload ID:', uploadId);
  console.log('[GET-CV-UPLOAD] Table: stored_cvs');

  try {
    // Load cv_upload
    const { data: uploadData, error: uploadError } = await supabase
      .from('stored_cvs')
      .select('*')
      .eq('id', uploadId)
      .maybeSingle();

    if (uploadError) {
      console.error('[GET-CV-UPLOAD] ❌ Supabase error:', uploadError);
      throw new Error(`Supabase query failed: ${uploadError.message}`);
    }

    if (!uploadData) {
      console.warn('[GET-CV-UPLOAD] ⚠️ No record found for uploadId:', uploadId);
      return null;
    }

    console.log('[GET-CV-UPLOAD] ✅ Upload data loaded');
    console.log('[GET-CV-UPLOAD] Status:', uploadData.status || uploadData.analysis_status);

    // Load ATS analysis if available
    const { data: analysisData, error: analysisError } = await supabase
      .from('ats_analyses')
      .select('*')
      .eq('upload_id', uploadId)
      .maybeSingle();

    if (analysisError) {
      console.warn('[GET-CV-UPLOAD] ⚠️ Could not load ATS analysis:', analysisError);
    }

    console.log('[GET-CV-UPLOAD] ✅ Analysis loaded:', !!analysisData);
    console.log('═══════════════════════════════════════════════════════════');

    return {
      ...uploadData,
      ats_analysis: analysisData || null,
    };
  } catch (error: any) {
    console.error('[GET-CV-UPLOAD] ❌ Fatal error:', error);
    console.log('═══════════════════════════════════════════════════════════');
    throw error;
  }
}
