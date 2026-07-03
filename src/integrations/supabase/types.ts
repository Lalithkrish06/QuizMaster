export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attempts: {
        Row: {
          answers: Json
          completed_at: string
          correct_count: number
          id: string
          max_score: number
          percentage: number
          quiz_id: string
          score: number
          skipped_count: number
          time_taken_seconds: number
          user_id: string
          wrong_count: number
        }
        Insert: {
          answers?: Json
          completed_at?: string
          correct_count?: number
          id?: string
          max_score?: number
          percentage?: number
          quiz_id: string
          score?: number
          skipped_count?: number
          time_taken_seconds?: number
          user_id: string
          wrong_count?: number
        }
        Update: {
          answers?: Json
          completed_at?: string
          correct_count?: number
          id?: string
          max_score?: number
          percentage?: number
          quiz_id?: string
          score?: number
          skipped_count?: number
          time_taken_seconds?: number
          user_id?: string
          wrong_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          quiz_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          quiz_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          quiz_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string | null
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
          xp?: number
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answers: Json
          created_at: string
          explanation: string | null
          id: string
          image_url: string | null
          marks: number
          options: Json
          position: number
          prompt: string
          question_type: Database["public"]["Enums"]["question_type"]
          quiz_id: string
        }
        Insert: {
          correct_answers?: Json
          created_at?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          marks?: number
          options?: Json
          position?: number
          prompt: string
          question_type?: Database["public"]["Enums"]["question_type"]
          quiz_id: string
        }
        Update: {
          correct_answers?: Json
          created_at?: string
          explanation?: string | null
          id?: string
          image_url?: string | null
          marks?: number
          options?: Json
          position?: number
          prompt?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          attempts_count: number
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          difficulty: Database["public"]["Enums"]["quiz_difficulty"]
          id: string
          negative_marking: boolean
          published_at: string | null
          randomize_options: boolean
          randomize_questions: boolean
          rating_avg: number
          rating_count: number
          status: Database["public"]["Enums"]["quiz_status"]
          tags: string[]
          time_limit_seconds: number | null
          title: string
          updated_at: string
        }
        Insert: {
          attempts_count?: number
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["quiz_difficulty"]
          id?: string
          negative_marking?: boolean
          published_at?: string | null
          randomize_options?: boolean
          randomize_questions?: boolean
          rating_avg?: number
          rating_count?: number
          status?: Database["public"]["Enums"]["quiz_status"]
          tags?: string[]
          time_limit_seconds?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          attempts_count?: number
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["quiz_difficulty"]
          id?: string
          negative_marking?: boolean
          published_at?: string | null
          randomize_options?: boolean
          randomize_questions?: boolean
          rating_avg?: number
          rating_count?: number
          status?: Database["public"]["Enums"]["quiz_status"]
          tags?: string[]
          time_limit_seconds?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_creator_profile_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      question_type: "mcq_single" | "mcq_multi" | "true_false"
      quiz_difficulty: "easy" | "medium" | "hard" | "expert"
      quiz_status: "draft" | "published"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      question_type: ["mcq_single", "mcq_multi", "true_false"],
      quiz_difficulty: ["easy", "medium", "hard", "expert"],
      quiz_status: ["draft", "published"],
    },
  },
} as const
