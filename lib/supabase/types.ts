// Placeholder generated DB types. Replace via:
//   pnpm dlx supabase gen types typescript --project-id <id> > lib/supabase/types.ts

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      teams: {
        Row: { code: string; name: string; colors: string[] };
        Insert: { code: string; name: string; colors: string[] };
        Update: Partial<{ code: string; name: string; colors: string[] }>;
      };
      groups: {
        Row: { letter: string; teams: string[] };
        Insert: { letter: string; teams: string[] };
        Update: Partial<{ letter: string; teams: string[] }>;
      };
      matches: {
        Row: {
          id: number;
          group_letter: string;
          round: number;
          team_a: string;
          team_b: string;
          starts_at: string;
          city: string | null;
          result: "1" | "X" | "2" | null;
        };
        Insert: {
          id: number;
          group_letter: string;
          round: number;
          team_a: string;
          team_b: string;
          starts_at: string;
          city?: string | null;
          result?: "1" | "X" | "2" | null;
        };
        Update: Partial<{
          group_letter: string;
          round: number;
          team_a: string;
          team_b: string;
          starts_at: string;
          city: string | null;
          result: "1" | "X" | "2" | null;
        }>;
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          initials: string | null;
          emoji: string | null;
          host: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          initials?: string | null;
          emoji?: string | null;
          host?: boolean;
        };
        Update: Partial<{
          name: string;
          initials: string | null;
          emoji: string | null;
          host: boolean;
        }>;
      };
      picks: {
        Row: {
          user_id: string;
          match_id: number;
          pick: "1" | "X" | "2";
          created_at: string;
          updated_at: string;
        };
        Insert: { user_id: string; match_id: number; pick: "1" | "X" | "2" };
        Update: Partial<{ pick: "1" | "X" | "2" }>;
      };
    };
    Views: {
      ranking: {
        Row: {
          id: string;
          name: string;
          initials: string | null;
          host: boolean;
          score: number;
          resolved: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

export type Pick = "1" | "X" | "2";
