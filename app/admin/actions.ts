"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Pick } from "@/lib/supabase/types";

export type ActionResult = { ok: true } | { ok: false; error: string };
export type SetResultResult = ActionResult;

function resultFromScore(a: number, b: number): Pick {
  if (a > b) return "1";
  if (a < b) return "2";
  return "X";
}

async function requireHost() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Sem sessão", supabase: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("host")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.host) return { ok: false as const, error: "Acesso restrito", supabase: null };
  return { ok: true as const, supabase, user };
}

export async function setPicksDeadline(iso: string | null): Promise<ActionResult> {
  if (iso !== null) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { ok: false, error: "Data inválida" };
  }
  const guard = await requireHost();
  if (!guard.ok) return { ok: false, error: guard.error };
  const { error } = await guard.supabase
    .from("app_config")
    .update({ picks_deadline: iso, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) {
    console.error("setPicksDeadline failed", error);
    return { ok: false, error: "Não foi possível salvar o prazo" };
  }
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/m/palpite");
  revalidatePath("/ranking");
  return { ok: true };
}

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
  const guard = await requireHost();
  if (!guard.ok) return { ok: false, error: guard.error };

  // Quando vier null, limpa também os scores
  const update =
    result === null
      ? { result: null, score_a: null, score_b: null }
      : { result };
  const { error } = await guard.supabase
    .from("matches")
    .update(update)
    .eq("id", matchId);
  if (error) return { ok: false, error: "Não foi possível salvar o resultado" };

  revalidatePath("/");
  revalidatePath("/grupos");
  revalidatePath("/tabela");
  revalidatePath("/ranking");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setMatchScore(
  matchId: number,
  scoreA: number | null,
  scoreB: number | null,
): Promise<SetResultResult> {
  if (!Number.isInteger(matchId) || matchId < 1 || matchId > 72) {
    return { ok: false, error: "Jogo inválido" };
  }
  const bothNull = scoreA === null && scoreB === null;
  const bothSet = Number.isInteger(scoreA) && Number.isInteger(scoreB);
  if (!bothNull && !bothSet) {
    return { ok: false, error: "Preencha os dois placares ou deixe vazio" };
  }
  if (bothSet) {
    if (scoreA! < 0 || scoreA! > 30 || scoreB! < 0 || scoreB! > 30) {
      return { ok: false, error: "Placar fora do intervalo (0–30)" };
    }
  }
  const guard = await requireHost();
  if (!guard.ok) return { ok: false, error: guard.error };

  const update = bothNull
    ? { score_a: null, score_b: null, result: null }
    : {
        score_a: scoreA,
        score_b: scoreB,
        result: resultFromScore(scoreA!, scoreB!),
      };

  const { error } = await guard.supabase.from("matches").update(update).eq("id", matchId);
  if (error) return { ok: false, error: "Não foi possível salvar o placar" };

  revalidatePath("/");
  revalidatePath("/grupos");
  revalidatePath("/tabela");
  revalidatePath("/ranking");
  revalidatePath("/admin");
  revalidatePath(`/m/jogo/${matchId}`);
  return { ok: true };
}
