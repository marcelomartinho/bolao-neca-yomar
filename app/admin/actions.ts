"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Pick } from "@/lib/supabase/types";

export type SetResultResult = { ok: true } | { ok: false; error: string };

export async function setMatchResult(
  matchId: number,
  result: Pick | null,
): Promise<SetResultResult> {
  if (!Number.isInteger(matchId) || matchId < 1 || matchId > 72) {
    return { ok: false, error: "Jogo inválido" };
  }
  if (result !== null && !["1", "X", "2"].includes(result)) {
    return { ok: false, error: "Resultado inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sem sessão" };

  const { error } = await supabase
    .from("matches")
    .update({ result })
    .eq("id", matchId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/ranking");
  revalidatePath("/tabela");
  revalidatePath("/admin");
  return { ok: true };
}
