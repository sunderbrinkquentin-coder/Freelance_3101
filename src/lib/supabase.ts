import { createClient } from '@supabase/supabase-js';

// KORREKTE VERSION
const supabaseUrl = 'https://vuumqarzylewhzvtbtcl.supabase.co'; // Hier war das 'a' vergessen!
const supabaseAnonKey = 'sb_publishable_0iPyhrrUvVJgXaWVkemopA_sr77tfmg';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ FEHLENDE SUPABASE ENV VARS – .env prüfen!');
}

class SafeStorage {
  private memoryStorage: Map<string, string> = new Map();
  private useMemory = false;

  constructor() {
    try {
      localStorage.setItem('__test__', 'test');
      localStorage.removeItem('__test__');
    } catch {
      console.warn('LocalStorage blocked by browser - using memory storage');
      this.useMemory = true;
    }
  }

  getItem(key: string): string | null {
    if (this.useMemory) {
      return this.memoryStorage.get(key) || null;
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return this.memoryStorage.get(key) || null;
    }
  }

  setItem(key: string, value: string): void {
    if (this.useMemory) {
      this.memoryStorage.set(key, value);
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch {
      this.memoryStorage.set(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.useMemory) {
      this.memoryStorage.delete(key);
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch {
      this.memoryStorage.delete(key);
    }
  }
}

const safeStorage = new SafeStorage();

function getTempId(): string {
  try {
    return sessionStorage.getItem('cv_check_temp_id') || localStorage.getItem('cv_temp_id') || '';
  } catch {
    return '';
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: safeStorage as any,
  },
  global: {
    headers: {
      get 'x-temp-id'() {
        return getTempId();
      },
      get 'x-session-id'() {
        return getTempId();
      },
    } as Record<string, string>,
  },
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
