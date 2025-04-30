/**
 * Ten plik zawiera definicje typów dla bazy danych Supabase.
 * Typy te mogą być automatycznie generowane za pomocą narzędzia Supabase CLI:
 * npx supabase gen types typescript --project-id <ID_PROJEKTU> --schema public > src/types/supabase/index.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          diet_type: string | null
          max_carbs: number | null
          excluded_products: string[] | null
          allergens: string[] | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          name?: string | null
          diet_type?: string | null
          max_carbs?: number | null
          excluded_products?: string[] | null
          allergens?: string[] | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          diet_type?: string | null
          max_carbs?: number | null
          excluded_products?: string[] | null
          allergens?: string[] | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          title: string
          ingredients: Json
          steps: string[]
          preparation_time: number | null
          difficulty: string | null
          servings: number | null
          tags: string[] | null
          nutritional_values: Json | null
          is_modified: boolean
          original_recipe_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          ingredients: Json
          steps: string[]
          preparation_time?: number | null
          difficulty?: string | null
          servings?: number | null
          tags?: string[] | null
          nutritional_values?: Json | null
          is_modified?: boolean
          original_recipe_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          ingredients?: Json
          steps?: string[]
          preparation_time?: number | null
          difficulty?: string | null
          servings?: number | null
          tags?: string[] | null
          nutritional_values?: Json | null
          is_modified?: boolean
          original_recipe_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_original_recipe_id_fkey"
            columns: ["original_recipe_id"]
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          }
        ]
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          type: string
          content: string
          created_at: string
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          content: string
          created_at?: string
          status?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          content?: string
          created_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_usage: {
        Row: {
          id: string
          user_id: string
          count: number
          date: string
        }
        Insert: {
          id?: string
          user_id: string
          count: number
          date: string
        }
        Update: {
          id?: string
          user_id?: string
          count?: number
          date?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 