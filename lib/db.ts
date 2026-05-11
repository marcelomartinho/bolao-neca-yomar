import { createSupabaseServerClient } from "./supabase/server";
import type { Pick } from "./supabase/types";

export type MatchRow = {
  id: number;
  group_letter: string;
  round: number;
  team_a: string;
  team_b: string;
  starts_at: string;
  city: string | null;
  result: Pick | null;
};

export type PickRow = {
  match_id: number;
  pick: Pick;
  updated_at: string;
};

export type RankingRow = {
  id: string;
  name: string | null;
  initials: string | null;
  host: boolean | null;
  emoji: string | null;
  score: number | null;
  resolved: number | null;
  total_picks: number | null;
};

export async function fetchMatches(opts?: { fromId?: number; limit?: number }) {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from("matches")
    .select("id,group_letter,round,team_a,team_b,starts_at,city,result")
    .order("starts_at", { ascending: true })
    .order("id", { ascending: true });
  if (opts?.fromId) q = q.gte("id", opts.fromId);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw new Error(`fetchMatches: ${error.message}`);
  return (data ?? []) as MatchRow[];
}

export async function fetchOpenMatches(limit = 12) {
  const supabase = await createSupabaseServerClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("matches")
    .select("id,group_letter,round,team_a,team_b,starts_at,city,result")
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`fetchOpenMatches: ${error.message}`);
  return (data ?? []) as MatchRow[];
}

export async function fetchMyPicks(matchIds: number[]) {
  if (matchIds.length === 0) return new Map<number, Pick>();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Map<number, Pick>();
  const { data, error } = await supabase
    .from("picks")
    .select("match_id,pick")
    .eq("user_id", user.id)
    .in("match_id", matchIds);
  if (error) throw new Error(`fetchMyPicks: ${error.message}`);
  const map = new Map<number, Pick>();
  for (const row of data ?? []) map.set(row.match_id, row.pick as Pick);
  return map;
}

export async function fetchRanking() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ranking")
    .select("id,name,initials,host,emoji,score,resolved,total_picks")
    .order("score", { ascending: false, nullsFirst: false })
    .order("name", { ascending: true });
  if (error) throw new Error(`fetchRanking: ${error.message}`);
  return (data ?? []) as RankingRow[];
}

export async function fetchProfile(idOrSlug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,initials,emoji,host")
    .eq("id", idOrSlug)
    .maybeSingle();
  if (error) throw new Error(`fetchProfile: ${error.message}`);
  return data;
}

export async function fetchPicksOfUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("picks")
    .select("match_id,pick,updated_at")
    .eq("user_id", userId)
    .order("match_id", { ascending: true });
  if (error) throw new Error(`fetchPicksOfUser: ${error.message}`);
  return (data ?? []) as PickRow[];
}
