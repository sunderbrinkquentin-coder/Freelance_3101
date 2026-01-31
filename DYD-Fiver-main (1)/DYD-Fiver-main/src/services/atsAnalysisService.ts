/**
 * ATS Analysis Service
 *
 * Handles saving and retrieving ATS analysis results from Supabase
 */

import { supabase } from '../lib/supabase';
import { AtsResult } from '../types/ats';

export interface SavedAnalysis {
  id: string;
  user_id: string;
  upload_id: string | null;
  cv_id: string | null;
  ats_score: number;
  category_scores: Record<string, number>;
  feedback: Record<string, string>;
  recommendations: Record<string, string>;
  extracted_cv_data: any;
  analysis_data: AtsResult;
  created_at: string;
  updated_at: string;
}

/**
 * Save ATS analysis to dashboard
 */
export async function saveAnalysisToDashboard(
  userId: string,
  uploadId: string,
  score: number,
  categoryScores: Record<string, number>,
  feedback: Record<string, string>,
  recommendations: Record<string, string>,
  analysisData: AtsResult,
  extractedCvData?: any
): Promise<{ success: boolean; error?: string; analysisId?: string }> {
  try {
    const { data, error } = await supabase
      .from('ats_analyses')
      .upsert({
        user_id: userId,
        upload_id: uploadId,
        ats_score: score,
        category_scores: categoryScores,
        feedback,
        recommendations,
        analysis_data: analysisData,
        extracted_cv_data: extractedCvData || {},
      })
      .select('id')
      .single();

    if (error) {
      console.error('[ATS Analysis] Save error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, analysisId: data.id };
  } catch (error: any) {
    console.error('[ATS Analysis] Unexpected error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Link a CV to an analysis
 */
export async function linkCvToAnalysis(
  analysisId: string,
  cvId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('ats_analyses')
      .update({ cv_id: cvId })
      .eq('id', analysisId)
      .eq('user_id', userId);

    if (error) {
      console.error('[ATS Analysis] Link error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[ATS Analysis] Unexpected error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all saved analyses for a user
 */
export async function getUserAnalyses(
  userId: string
): Promise<{ success: boolean; analyses?: SavedAnalysis[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('ats_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ATS Analysis] Fetch error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, analyses: data || [] };
  } catch (error: any) {
    console.error('[ATS Analysis] Unexpected error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a specific analysis by ID
 */
export async function getAnalysisById(
  analysisId: string,
  userId: string
): Promise<{ success: boolean; analysis?: SavedAnalysis; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('ats_analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('[ATS Analysis] Fetch error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, analysis: data };
  } catch (error: any) {
    console.error('[ATS Analysis] Unexpected error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete an analysis
 */
export async function deleteAnalysis(
  analysisId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('ats_analyses')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', userId);

    if (error) {
      console.error('[ATS Analysis] Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[ATS Analysis] Unexpected error:', error);
    return { success: false, error: error.message };
  }
}
