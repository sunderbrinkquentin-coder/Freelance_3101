/**
 * Type definitions for CV Check functionality
 * Used for displaying CV analysis results from Supabase
 */

export interface CVCheckResult {
  overallScore: number;
  categories: {
    structure: { score: number; feedback: string };
    content: { score: number; feedback: string };
    atsCompatibility: { score: number; feedback: string };
    design: { score: number; feedback: string };
  };
  strengths: string[];
  improvements: string[];
}

export interface CVUploadRow {
  id: string;
  user_id: string | null;
  temp_id: string | null;
  original_file_url: string | null;
  vision_text: string | null;
  ats_json: CVCheckResult | null;
  created_at: string;
}
