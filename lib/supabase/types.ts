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
      app_config: {
        Row: {
          created_at: string
          id: number
          picks_deadline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: number
          picks_deadline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          picks_deadline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          letter: string
          teams: string[]
        }
        Insert: {
          letter: string
          teams: string[]
        }
        Update: {
          letter?: string
          teams?: string[]
        }
        Relationships: []
      }
      matches: {
        Row: {
          city: string | null
          group_letter: string
          id: number
          result: string | null
          round: number
          starts_at: string
          team_a: string
          team_b: string
        }
        Insert: {
          city?: string | null
          group_letter: string
          id: number
          result?: string | null
          round: number
          starts_at: string
          team_a: string
          team_b: string
        }
        Update: {
          city?: string | null
          group_letter?: string
          id?: number
          result?: string | null
          round?: number
          starts_at?: string
          team_a?: string
          team_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_group_letter_fkey"
            columns: ["group_letter"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["letter"]
          },
          {
            foreignKeyName: "matches_team_a_fkey"
            columns: ["team_a"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "matches_team_b_fkey"
            columns: ["team_b"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["code"]
          },
        ]
      }
      picks: {
        Row: {
          created_at: string
          match_id: number
          pick: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          match_id: number
          pick: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          match_id?: number
          pick?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "picks_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "picks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          birthdate: string | null
          created_at: string
          emoji: string | null
          host: boolean
          id: string
          initials: string | null
          name: string
          parent_id: string | null
        }
        Insert: {
          auth_user_id?: string | null
          birthdate?: string | null
          created_at?: string
          emoji?: string | null
          host?: boolean
          id: string
          initials?: string | null
          name: string
          parent_id?: string | null
        }
        Update: {
          auth_user_id?: string | null
          birthdate?: string | null
          created_at?: string
          emoji?: string | null
          host?: boolean
          id?: string
          initials?: string | null
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ranking"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          code: string
          colors: string[]
          name: string
        }
        Insert: {
          code: string
          colors: string[]
          name: string
        }
        Update: {
          code?: string
          colors?: string[]
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      ranking: {
        Row: {
          emoji: string | null
          host: boolean | null
          id: string | null
          initials: string | null
          name: string | null
          resolved: number | null
          score: number | null
          total_picks: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_profile_managed_by_uid: {
        Args: { profile_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const


// Local extension: tighten pick result enum
export type Pick = "1" | "X" | "2";
