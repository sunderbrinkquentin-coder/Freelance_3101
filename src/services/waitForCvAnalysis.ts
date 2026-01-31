/**
 * Wait for CV Analysis Service
 * Polls Supabase for CV analysis completion status
 *
 * This service replaces fixed timeouts with real-time status checking
 * from the cv_uploads table in Supabase.
 */

import { supabase } from '../lib/supabase';

/**
 * CV Analysis Status
 * Matches the status column in cv_uploads table
 */
export type CvAnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * CV Upload Record (minimal interface for status checking)
 */
export interface CvUploadStatus {
  id: string;
  status: CvAnalysisStatus;
  error_message: string | null;
  processed_at: string | null;
}

/**
 * Wait for CV analysis to complete
 * Polls Supabase every pollIntervalMs until status is 'completed' or 'failed',
 * or until maxWaitMs is exceeded
 *
 * @param uploadId - The UUID of the CV upload (cv_uploads.id)
 * @param maxWaitMs - Maximum time to wait in milliseconds (default: 60000 = 60 seconds)
 * @param pollIntervalMs - Polling interval in milliseconds (default: 2000 = 2 seconds)
 *
 * @throws Error with message "TIMEOUT" if maxWaitMs is exceeded
 * @throws Error with error_message if status becomes 'failed'
 * @throws Error if Supabase query fails
 *
 * @returns Promise that resolves when status is 'completed'
 */
export async function waitForCvAnalysis(
  uploadId: string,
  maxWaitMs: number = 60000,
  pollIntervalMs: number = 2000
): Promise<void> {
  console.log('[WAIT-FOR-CV-ANALYSIS] 🔄 Starting to wait for CV analysis');
  console.log('[WAIT-FOR-CV-ANALYSIS] Upload ID:', uploadId);
  console.log('[WAIT-FOR-CV-ANALYSIS] Max wait time:', `${maxWaitMs / 1000}s`);
  console.log('[WAIT-FOR-CV-ANALYSIS] Poll interval:', `${pollIntervalMs / 1000}s`);

  const startTime = Date.now();
  const maxAttempts = Math.ceil(maxWaitMs / pollIntervalMs);
  let attempts = 0;

  while (true) {
    attempts++;
    const elapsedTime = Date.now() - startTime;

    console.log(
      `[WAIT-FOR-CV-ANALYSIS] 🔍 Polling attempt ${attempts}/${maxAttempts} ` +
      `(elapsed: ${(elapsedTime / 1000).toFixed(1)}s)`
    );

    // Check if we've exceeded max wait time
    if (elapsedTime >= maxWaitMs) {
      console.error(
        '[WAIT-FOR-CV-ANALYSIS] ❌ Timeout reached after',
        `${(elapsedTime / 1000).toFixed(1)}s`
      );
      throw new Error('TIMEOUT');
    }

    try {
      // Query Supabase for current status
      const { data, error } = await supabase
        .from('stored_cvs')
        .select('id, status, error_message, processed_at')
        .eq('id', uploadId)
        .single();

      // Handle Supabase query errors
      if (error) {
        console.error('[WAIT-FOR-CV-ANALYSIS] ❌ Supabase query error:', error);
        throw new Error('Status-Abfrage fehlgeschlagen: ' + error.message);
      }

      // Handle no data returned
      if (!data) {
        console.error('[WAIT-FOR-CV-ANALYSIS] ❌ No data returned for uploadId:', uploadId);
        throw new Error('Status-Abfrage fehlgeschlagen: CV Upload nicht gefunden');
      }

      const status = data.status as CvAnalysisStatus;
      console.log('[WAIT-FOR-CV-ANALYSIS] 📊 Current status:', status);

      // Check status and act accordingly
      if (status === 'completed') {
        console.log('[WAIT-FOR-CV-ANALYSIS] ✅ Analysis completed successfully!');
        console.log('[WAIT-FOR-CV-ANALYSIS] Processed at:', data.processed_at);
        return; // Success - resolve the promise
      }

      if (status === 'failed') {
        console.error('[WAIT-FOR-CV-ANALYSIS] ❌ Analysis failed');
        console.error('[WAIT-FOR-CV-ANALYSIS] Error message:', data.error_message);

        const errorMsg = data.error_message || 'CV-Analyse fehlgeschlagen';
        throw new Error(errorMsg);
      }

      // Status is 'pending' or 'processing' - continue polling
      if (status === 'pending' || status === 'processing') {
        console.log(`[WAIT-FOR-CV-ANALYSIS] ⏳ Status '${status}' - waiting ${pollIntervalMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
        continue;
      }

      // Unknown status - treat as pending and continue
      console.warn('[WAIT-FOR-CV-ANALYSIS] ⚠️ Unknown status:', status, '- treating as pending');
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error: any) {
      // If it's one of our intentional errors, re-throw it
      if (
        error.message === 'TIMEOUT' ||
        error.message.includes('fehlgeschlagen') ||
        error.message.includes('nicht gefunden')
      ) {
        throw error;
      }

      // For unexpected errors, log and throw
      console.error('[WAIT-FOR-CV-ANALYSIS] ❌ Unexpected error:', error);
      throw new Error('Status-Abfrage fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
    }
  }
}

/**
 * Get current CV analysis status without waiting
 * Useful for one-time status checks
 *
 * @param uploadId - The UUID of the CV upload
 * @returns Current status or null if not found/error
 */
export async function getCvAnalysisStatus(
  uploadId: string
): Promise<CvAnalysisStatus | null> {
  console.log('[GET-CV-ANALYSIS-STATUS] 🔍 Fetching status for:', uploadId);

  try {
    const { data, error } = await supabase
      .from('stored_cvs')
      .select('status')
      .eq('id', uploadId)
      .single();

    if (error || !data) {
      console.error('[GET-CV-ANALYSIS-STATUS] ❌ Error:', error);
      return null;
    }

    console.log('[GET-CV-ANALYSIS-STATUS] ✅ Status:', data.status);
    return data.status as CvAnalysisStatus;
  } catch (error) {
    console.error('[GET-CV-ANALYSIS-STATUS] ❌ Unexpected error:', error);
    return null;
  }
}
