// src/services/makeIntegrationService.ts

/**
 * Make.com Integration Service
 *
 * CV-CHECK  -> Tabelle: stored_cvs (source: 'check')
 * CV-OPTIMIERUNG (Wizard/Erstellung) -> Tabelle: stored_cvs (source: 'wizard')
 *
 * Wichtig:
 * - Wir fassen nichts an deiner Ergebnis-UI an.
 * - Wir sorgen nur dafür, dass die richtigen Tabellen gelesen werden,
 *   damit der CV-Check im Dashboard auftaucht und die Daten konsistent sind.
 */

import { supabase } from '../lib/supabase';

// ============================================================================
// Types – an deine DB angelehnt, müssen nicht 100 % exakt sein, nur grob
// ============================================================================

export interface CVUploadFromMake {
  id?: string;
  temp_id: string | null;
  user_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  ats_json: any | null;
  vision_text: string | null;
  original_file_url: string | null;
  processed_at: string | null;
  error_message: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface StoredCVFromMake {
  id?: string;
  session_id: string | null;
  user_id: string | null;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  cv_data: any;
  // editor_data ist bei dir inzwischen im Feld cv_data enthalten,
  // deshalb machen wir es optional.
  editor_data?: {
    title?: string;
    sections?: any[];
    [key: string]: any;
  } | null;
  insights?: string[] | null;
  source: string | null;
  error_message: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// ============================================================================
// QUERY-FUNKTIONEN
// ============================================================================

/**
 * CV-CHECK nach temp_id holen
 * -> Tabelle: stored_cvs (source: 'check')
 */
export async function getCvCheckByTempId(
  tempId: string
): Promise<CVUploadFromMake | null> {
  console.log('[MAKE-INTEGRATION] Fetching CV check for temp_id (stored_cvs):', tempId);

  const { data, error } = await supabase
    .from('stored_cvs')
    .select('*')
    .eq('temp_id', tempId)
    .eq('source', 'check')
    .maybeSingle();

  if (error) {
    console.error('[MAKE-INTEGRATION] Error fetching CV check:', error);
    throw error;
  }

  if (!data) {
    console.log('[MAKE-INTEGRATION] No CV check found for temp_id:', tempId);
    return null;
  }

  console.log('[MAKE-INTEGRATION] CV check found (stored_cvs):', {
    id: (data as any).id,
    status: (data as any).status,
    has_ats_json: !!(data as any).ats_json,
  });

  return data as CVUploadFromMake;
}

/**
 * Optimierten CV nach session_id holen
 * -> Tabelle: stored_cvs
 */
export async function getOptimizedCvBySessionId(
  sessionId: string
): Promise<StoredCVFromMake | null> {
  console.log('[MAKE-INTEGRATION] Fetching optimized CV for session_id (stored_cvs):', sessionId);

  const { data, error } = await supabase
    .from('stored_cvs')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[MAKE-INTEGRATION] Error fetching optimized CV:', error);
    throw error;
  }

  if (!data) {
    console.log('[MAKE-INTEGRATION] No optimized CV found for session_id:', sessionId);
    return null;
  }

  console.log('[MAKE-INTEGRATION] Optimized CV found (stored_cvs):', {
    id: (data as any).id,
    status: (data as any).status,
    has_cv_data: !!(data as any).cv_data,
  });

  return data as StoredCVFromMake;
}

/**
 * Alle CV-CHECKS eines Users
 * -> Tabelle: stored_cvs (source: 'check')
 * -> Wird im Dashboard verwendet
 */
export async function getUserCvChecks(
  userId: string
): Promise<CVUploadFromMake[]> {
  console.log('[MAKE-INTEGRATION] Fetching CV checks for user (stored_cvs):', userId);

  const { data, error } = await supabase
    .from('stored_cvs')
    .select('*')
    .eq('user_id', userId)
    .eq('source', 'check')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[MAKE-INTEGRATION] Error fetching user CV checks:', error);
    throw error;
  }

  console.log('[MAKE-INTEGRATION] Found', data?.length || 0, 'CV checks');

  return (data || []) as CVUploadFromMake[];
}

/**
 * Alle optimierten CVs eines Users (Wizard/Erstellung)
 * -> Tabelle: stored_cvs (source: 'wizard')
 */
export async function getUserOptimizedCvs(
  userId: string
): Promise<StoredCVFromMake[]> {
  console.log('[MAKE-INTEGRATION] Fetching optimized CVs for user (stored_cvs):', userId);

  const { data, error } = await supabase
    .from('stored_cvs')
    .select('*')
    .eq('user_id', userId)
    .eq('source', 'wizard')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[MAKE-INTEGRATION] Error fetching user optimized CVs:', error);
    throw error;
  }

  console.log('[MAKE-INTEGRATION] Found', data?.length || 0, 'optimized CVs');

  return (data || []) as StoredCVFromMake[];
}

// ============================================================================
// VALIDIERUNG
// ============================================================================

export function validateCvCheckData(data: any): boolean {
  if (!data) return false;
  if (data.status !== 'completed') return false;
  if (!data.ats_json || typeof data.ats_json !== 'object') return false;
  // Older / newer Formate – wir prüfen nur grob, ob irgendwas drin ist
  return true;
}

export function validateOptimizedCvData(data: any): boolean {
  if (!data) return false;
  if (data.status !== 'completed') return false;
  // Bei dir steckt inzwischen alles in cv_data – wir verlangen nicht mehr editor_data
  if (!data.cv_data) return false;
  return true;
}

// ============================================================================
// HELFER
// ============================================================================

export function extractAtsScore(data: CVUploadFromMake): number | null {
  if (!data.ats_json) return null;

  // neues Format (ats_score)
  if (typeof (data.ats_json as any).ats_score === 'number') {
    return (data.ats_json as any).ats_score;
  }

  // altes Format (overallScore)
  if (typeof (data.ats_json as any).overallScore === 'number') {
    return (data.ats_json as any).overallScore;
  }

  return null;
}

export function isCvCheckComplete(data: CVUploadFromMake | null): boolean {
  if (!data) return false;
  return data.status === 'completed' && validateCvCheckData(data);
}

export function isCvOptimizationComplete(data: StoredCVFromMake | null): boolean {
  if (!data) return false;
  return data.status === 'completed' && validateOptimizedCvData(data);
}
