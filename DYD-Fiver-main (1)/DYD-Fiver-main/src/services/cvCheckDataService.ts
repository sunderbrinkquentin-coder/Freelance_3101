/**
 * CV Check Data Service
 *
 * Handles saving CV data from CV-Check/Upload to Supabase
 */

import { supabase } from '../lib/supabase';
import { CVBuilderData } from '../types/cvBuilder';
import { v4 as uuidv4 } from 'uuid';

/**
 * 🔥 FIX: Save CV data from check/upload to stored_cvs table (not cv_records)
 */
export async function saveCVFromCheck(
  cvData: CVBuilderData,
  uploadId?: string
): Promise<{ success: boolean; cvId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const cvId = uuidv4();

    const cvRecord = {
      id: cvId,
      user_id: user?.id || null,
      cv_data: cvData,
      job_data: {},
      is_paid: false,
      source: 'check' as const,
      status: 'draft' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('[CVCheckDataService] Saving CV to stored_cvs:', cvId);

    const { data, error } = await supabase
      .from('stored_cvs')
      .insert([cvRecord])
      .select()
      .single();

    if (error) {
      console.error('[CVCheckDataService] Error saving CV:', error);
      return { success: false, error: error.message };
    }

    console.log('[CVCheckDataService] CV saved successfully:', data.id);
    return { success: true, cvId: data.id };
  } catch (error: any) {
    console.error('[CVCheckDataService] Unexpected error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update existing CV with extracted data from analysis
 */
export async function updateCVWithAnalysisData(
  cvId: string,
  cvData: CVBuilderData
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[CVCheckDataService] Updating stored_cvs with analysis data:', cvId);

    const { error } = await supabase
      .from('stored_cvs')
      .update({
        cv_data: cvData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cvId);

    if (error) {
      console.error('[CVCheckDataService] Error updating stored_cvs:', error);
      return { success: false, error: error.message };
    }

    console.log('[CVCheckDataService] stored_cvs updated successfully');
    return { success: true };
  } catch (error: any) {
    console.error('[CVCheckDataService] Unexpected error:', error);
    return { success: false, error: error.message };
  }
}
