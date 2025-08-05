import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string;
          question_id: string;
          external_id: string | null;
          skill_cd: string;
          skill_desc: string;
          primary_class_cd: string;
          primary_class_cd_desc: string;
          difficulty: string;
          module: string;
          content: {
            keys: string[];
            rationale: string;
            question: string;
            options?: string[];
            correct_answer?: string;
            explanation?: string;
          };
          program: string;
          score_band_range_cd: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          external_id?: string | null;
          skill_cd: string;
          skill_desc: string;
          primary_class_cd: string;
          primary_class_cd_desc: string;
          difficulty: string;
          module: string;
          content: {
            keys: string[];
            rationale: string;
            question: string;
            options?: string[];
            correct_answer?: string;
            explanation?: string;
          };
          program: string;
          score_band_range_cd: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          external_id?: string | null;
          skill_cd?: string;
          skill_desc?: string;
          primary_class_cd?: string;
          primary_class_cd_desc?: string;
          difficulty?: string;
          module?: string;
          content?: {
            keys: string[];
            rationale: string;
            question: string;
            options?: string[];
            correct_answer?: string;
            explanation?: string;
          };
          program?: string;
          score_band_range_cd?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          is_correct: boolean;
          time_spent: number;
          answered_at: string;
          user_answer: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          is_correct: boolean;
          time_spent: number;
          answered_at?: string;
          user_answer?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          is_correct?: boolean;
          time_spent?: number;
          answered_at?: string;
          user_answer?: string | null;
        };
      };
      practice_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: string;
          category: string;
          question_count: number;
          time_limit: number | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type: string;
          category: string;
          question_count: number;
          time_limit?: number | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_type?: string;
          category?: string;
          question_count?: number;
          time_limit?: number | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
  };
} 