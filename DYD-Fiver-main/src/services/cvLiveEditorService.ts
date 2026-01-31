/**
 * 🔥 CV LIVE EDITOR SERVICE - Speichert Änderungen in stored_cvs
 *
 * WICHTIG: Jede Änderung im Live Editor wird sofort in Supabase gespeichert
 * Download-CV zieht IMMER die neuesten Daten aus stored_cvs.cv_data
 */

import { supabase } from '../lib/supabase';

export interface CVUpdateData {
  cv_data?: any;
  editor_data?: any;
  template_type?: string;
}

/**
 * 💾 Update CV in stored_cvs (wird vom Live Editor aufgerufen)
 */
export async function updateCVInDatabase(
  cvId: string,
  updates: CVUpdateData
): Promise<{ success: boolean; error?: string }> {
  console.log('[CV-LIVE-EDITOR] 💾 Updating CV:', cvId);

  try {
    const { error } = await supabase
      .from('stored_cvs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cvId);

    if (error) {
      console.error('[CV-LIVE-EDITOR] ❌ Update error:', error);
      return { success: false, error: error.message };
    }

    console.log('[CV-LIVE-EDITOR] ✅ CV updated successfully');
    return { success: true };
  } catch (err: any) {
    console.error('[CV-LIVE-EDITOR] ❌ Exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 📥 Load CV from stored_cvs (für Download)
 */
export async function loadCVForDownload(
  cvId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  console.log('[CV-LIVE-EDITOR] 📥 Loading CV for download:', cvId);

  try {
    const { data, error } = await supabase
      .from('stored_cvs')
      .select('cv_data, template_type')
      .eq('id', cvId)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'CV not found' };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
