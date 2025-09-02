import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          total_points: number
          games_played: number
          current_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          total_points?: number
          games_played?: number
          current_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          total_points?: number
          games_played?: number
          current_level?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          icon: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          icon?: string
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: number
          question: string
          type: 'multiple_choice' | 'true_false' | 'text_input'
          category_id: number
          difficulty: 'easy' | 'medium' | 'hard' | 'expert'
          options: any
          correct_answer: any
          explanation: string
          time_limit: number
          points: number
          image_url: string | null
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          question: string
          type: 'multiple_choice' | 'true_false' | 'text_input'
          category_id: number
          difficulty: 'easy' | 'medium' | 'hard' | 'expert'
          options: any
          correct_answer: any
          explanation: string
          time_limit?: number
          points?: number
          image_url?: string | null
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          question?: string
          type?: 'multiple_choice' | 'true_false' | 'text_input'
          category_id?: number
          difficulty?: 'easy' | 'medium' | 'hard' | 'expert'
          options?: any
          correct_answer?: any
          explanation?: string
          time_limit?: number
          points?: number
          image_url?: string | null
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          user_id: string
          category_id: number
          total_questions: number
          correct_answers: number
          total_time: number
          score: number
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: number
          total_questions: number
          correct_answers: number
          total_time: number
          score: number
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: number
          total_questions?: number
          correct_answers?: number
          total_time?: number
          score?: number
          completed_at?: string
          created_at?: string
        }
      }
      game_answers: {
        Row: {
          id: string
          session_id: string
          question_id: number
          user_answer: any
          is_correct: boolean
          time_taken: number
          points_earned: number
          answered_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: number
          user_answer: any
          is_correct: boolean
          time_taken: number
          points_earned: number
          answered_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: number
          user_answer?: any
          is_correct?: boolean
          time_taken?: number
          points_earned?: number
          answered_at?: string
        }
      }
      achievements: {
        Row: {
          id: number
          name: string
          description: string
          icon: string
          condition: any
          points: number
        }
        Insert: {
          id?: number
          name: string
          description: string
          icon: string
          condition: any
          points?: number
        }
        Update: {
          id?: number
          name?: string
          description?: string
          icon?: string
          condition?: any
          points?: number
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: number
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: number
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: number
          unlocked_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          api_key: string
          name: string
          permissions: any
          rate_limit: number
          is_active: boolean
          created_at: string
          last_used_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          api_key: string
          name: string
          permissions: any
          rate_limit?: number
          is_active?: boolean
          created_at?: string
          last_used_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          api_key?: string
          name?: string
          permissions?: any
          rate_limit?: number
          is_active?: boolean
          created_at?: string
          last_used_at?: string | null
          expires_at?: string | null
        }
      }
    }
  }
}