import { cookies } from "next/headers";
import { createSupabaseServerClient } from "./supabase/server";

export const ACTIVE_PROFILE_COOKIE = "bolao-active-profile";

export type ManagedProfile = {
  id: string;
  name: string;
  initials: string | null;
  emoji: string | null;
  host: boolean;
  is_kid: boolean;
};

export async function fetchManagedProfiles(userId: string): Promise<ManagedProfile[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,initials,emoji,host,parent_id,auth_user_id")
    .or(`auth_user_id.eq.${userId},parent_id.eq.${userId}`)
    .order("parent_id", { ascending: true, nullsFirst: true });
  if (error) throw new Error(`fetchManagedProfiles: ${error.message}`);
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    initials: p.initials,
    emoji: p.emoji,
    host: p.host ?? false,
    is_kid: p.parent_id !== null,
  }));
}

export async function getActiveProfileId(fallback: string): Promise<string> {
  const c = await cookies();
  const v = c.get(ACTIVE_PROFILE_COOKIE)?.value;
  return v && /^[0-9a-f-]{36}$/i.test(v) ? v : fallback;
}
