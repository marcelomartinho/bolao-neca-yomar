"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Pick } from "@/lib/supabase/types";

export type SavePickResult =
  | { ok: true }
  | { ok: false; error: string };

export async function savePick(matchId: number, pick: Pick): Promise<SavePickResult> {
  if (!["1", "X", "2"].includes(pick)) {
    return { ok: false, error: "Palpite inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sem sessão" };

  const { error } = await supabase
    .from("picks")
    .upsert(
      { user_id: user.id, match_id: matchId, pick, updated_at: new Date().toISOString() },
      { onConflict: "user_id,match_id" },
    );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/ranking");
  revalidatePath(`/${user.id}`);
  return { ok: true };
}
