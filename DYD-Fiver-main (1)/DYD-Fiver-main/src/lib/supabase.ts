import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ FEHLENDE SUPABASE ENV VARS – .env prüfen!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
          is_visible_to_recruiters: boolean;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          is_visible_to_recruiters?: boolean;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          is_visible_to_recruiters?: boolean;
        };
      };
      onboarding_data: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string;
          field_of_work: string;
          experience_level: string;
          dream_role: string;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          session_id: string;
          field_of_work: string;
          experience_level: string;
          dream_role: string;
        };
        Update: {
          user_id?: string | null;
          field_of_work?: string;
          experience_level?: string;
          dream_role?: string;
        };
      };
      // 🔥 ENTFERNT: cvs table (nicht mehr verwendet, nur stored_cvs)
      chat_conversations: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string;
          cv_id: string | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          user_id?: string | null;
          session_id: string;
          cv_id?: string | null;
        };
        Update: {
          user_id?: string | null;
          completed_at?: string | null;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
        };
      };
      job_matches: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string;
          optimized_cv_id: string;
          job_title: string;
          company_name: string;
          location: string;
          job_type: string;
          salary_range: string | null;
          match_score: number;
          match_reasons: Record<string, any> | null;
          job_description: string;
          requirements: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          session_id: string;
          optimized_cv_id: string;
          job_title: string;
          company_name: string;
          location: string;
          job_type?: string;
          salary_range?: string | null;
          match_score?: number;
          match_reasons?: Record<string, any> | null;
          job_description: string;
          requirements?: Record<string, any> | null;
        };
        Update: {
          user_id?: string | null;
          match_score?: number;
        };
      };
    };
  };
};
