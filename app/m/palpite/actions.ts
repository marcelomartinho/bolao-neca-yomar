"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ACTIVE_PROFILE_COOKIE } from "@/lib/active-profile";
import type { Pick } from "@/lib/supabase/types";

export type SavePickResult =
  | { ok: true }
  | { ok: false; error: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function savePick(matchId: number, pick: Pick): Promise<SavePickResult> {
  if (!Number.isInteger(matchId) || matchId < 1 || matchId > 72) {
    return { ok: false, error: "Jogo inválido" };
  }
  if (!["1", "X", "2"].includes(pick)) {
    return { ok: false, error: "Palpite inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sem sessão" };

  const c = await cookies();
  const cookieVal = c.get(ACTIVE_PROFILE_COOKIE)?.value;
  let profileId = cookieVal && UUID_RE.test(cookieVal) ? cookieVal : user.id;

  // Confirm profile is managed by this user (defense in depth; RLS also checks)
  const { data: allowed } = await supabase.rpc("is_profile_managed_by_uid", {
    profile_id: profileId,
  });
  if (!allowed) profileId = user.id;

  const { error } = await supabase
    .from("picks")
    .upsert(
      { user_id: profileId, match_id: matchId, pick, updated_at: new Date().toISOString() },
      { onConflict: "user_id,match_id" },
    );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/ranking");
  revalidatePath(`/${profileId}`);
  return { ok: true };
}
