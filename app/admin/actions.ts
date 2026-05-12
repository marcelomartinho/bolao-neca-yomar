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

/* ---------------- Zona perigosa: limpezas administrativas ---------------- */

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function clearPicksOfUser(
  userId: string,
  confirmation: string,
): Promise<ActionResult> {
  if (confirmation !== "APAGAR") return { ok: false, error: "Confirmação ausente" };
  if (!UUID_RE.test(userId)) return { ok: false, error: "ID inválido" };
  const guard = await requireHost();
  if (!guard.ok) return { ok: false, error: guard.error };

  const { count, error } = await guard.supabase
    .from("picks")
    .delete({ count: "exact" })
    .eq("user_id", userId);
  if (error) {
    console.error("clearPicksOfUser failed", error);
    return { ok: false, error: "Não foi possível apagar os palpites" };
  }
  console.warn(`[admin-reset] clearPicksOfUser host=${guard.user.id} target=${userId} deleted=${count}`);

  revalidatePath("/ranking");
  revalidatePath("/admin");
  revalidatePath(`/${userId}`);
  return { ok: true };
}

export async function clearAllPicks(confirmation: string): Promise<ActionResult> {
  if (confirmation !== "APAGAR") return { ok: false, error: "Confirmação ausente" };
  const guard = await requireHost();
  if (!guard.ok) return { ok: false, error: guard.error };

  // Delete all rows. Need WHERE clause — usar IS NOT NULL no match_id.
  const { count, error } = await guard.supabase
    .from("picks")
    .delete({ count: "exact" })
    .gte("match_id", 1);
  if (error) {
    console.error("clearAllPicks failed", error);
    return { ok: false, error: "Não foi possível apagar todos os palpites" };
  }
  console.warn(`[admin-reset] clearAllPicks host=${guard.user.id} deleted=${count}`);

  revalidatePath("/ranking");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function clearAllResults(confirmation: string): Promise<ActionResult> {
  if (confirmation !== "APAGAR") return { ok: false, error: "Confirmação ausente" };
  const guard = await requireHost();
  if (!guard.ok) return { ok: false, error: guard.error };

  const { count, error } = await guard.supabase
    .from("matches")
    .update({ result: null, score_a: null, score_b: null }, { count: "exact" })
    .gte("id", 1);
  if (error) {
    console.error("clearAllResults failed", error);
    return { ok: false, error: "Não foi possível apagar os resultados" };
  }
  console.warn(`[admin-reset] clearAllResults host=${guard.user.id} updated=${count}`);

  revalidatePath("/");
  revalidatePath("/grupos");
  revalidatePath("/tabela");
  revalidatePath("/ranking");
  revalidatePath("/admin");
  return { ok: true };
}
