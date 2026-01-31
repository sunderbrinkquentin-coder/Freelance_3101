/**
 * Fetch CV Status - One-time Fallback Query
 *
 * TABLE: cv_uploads (NOT uploaded_cvs)
 * The correct table name is public.cv_uploads
 */

import { supabase } from '../lib/supabase';

/**
 * CV Status Return Type
 * Simplified for fallback use - only returns essential fields
 */
export interface CvStatusResult {
  status: string | null;
  errorMessage: string | null;
}

/**
 * Fetch current CV status from Supabase
 * Used ONLY as fallback when Realtime doesn't trigger within timeout
 *
 * OPTIMIZATION: Single query with .single() for performance
 * ERROR HANDLING: Throws errors instead of returning null for better debugging
 *
 * @param uploadId - The UUID of the CV upload (cv_uploads.id column)
 * @returns Object with status and errorMessage
 * @throws Error if query fails or record not found
 */
export async function fetchCvStatus(uploadId: string): Promise<CvStatusResult> {
  console.log('[FETCH-CV-STATUS] 🔍 Querying status for uploadId:', uploadId);
  console.log('[FETCH-CV-STATUS] Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

  try {
    const { data, error } = await supabase
      .from('stored_cvs')
      .select('status, error_message')
      .eq('id', uploadId)
      .single();

    // CRITICAL: Handle Supabase errors explicitly
    if (error) {
      console.error('[FETCH-CV-STATUS] ❌ Supabase query error:', error);
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    // CRITICAL: No data = wrong uploadId or deleted record
    if (!data) {
      console.error('[FETCH-CV-STATUS] ❌ No record found for uploadId:', uploadId);
      throw new Error('CV upload record not found. Upload may have been deleted.');
    }

    console.log('[FETCH-CV-STATUS] ✅ Status retrieved:', data.status);

    return {
      status: data.status || null,
      errorMessage: data.error_message || null,
    };
  } catch (error: any) {
    // Re-throw with context
    console.error('[FETCH-CV-STATUS] ❌ Fatal error:', error);
    throw error;
  }
}
