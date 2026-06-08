import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAgentY } from "@/lib/special-profiles";

export const dynamic = "force-dynamic";

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

type MatchLite = {
  id: number;
  team_a: string;
  team_b: string;
  starts_at: string;
  result: string | null;
  score_a: number | null;
  score_b: number | null;
};

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isHost = false;
  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("host")
      .eq("id", user.id)
      .maybeSingle();
    isHost = prof?.host === true;
  }

  const [{ data: ranking }, { data: matches }, { data: picks }] = await Promise.all([
    supabase
      .from("ranking")
      .select("id,name,score")
      .order("score", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true }),
    supabase
      .from("matches")
      .select("id,team_a,team_b,starts_at,result,score_a,score_b")
      .order("id", { ascending: true }),
    supabase.from("picks").select("user_id,match_id,pick"),
  ]);

  const now = Date.now();
  const allMatches = (matches ?? []) as MatchLite[];
  // Host exporta tudo; demais só jogos já apitados (a RLS já segue essa regra nos picks).
  const visible = (
    isHost ? allMatches : allMatches.filter((m) => new Date(m.starts_at).getTime() <= now)
  ).sort((a, b) => a.id - b.id);

  const picksByMatch = new Map<number, Map<string, string>>();
  for (const p of picks ?? []) {
    let inner = picksByMatch.get(p.match_id);
    if (!inner) {
      inner = new Map();
      picksByMatch.set(p.match_id, inner);
    }
    inner.set(p.user_id, p.pick);
  }

  const rows = ranking ?? [];
  const players = [...rows.filter((r) => isAgentY(r.id)), ...rows.filter((r) => !isAgentY(r.id))];

  const generated = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const matchLabel = (m: MatchLite) => `J${m.id} ${m.team_a}x${m.team_b}`;
  const resultCell = (m: MatchLite) =>
    m.score_a != null && m.score_b != null ? `${m.score_a}-${m.score_b}` : m.result ?? "";

  const preamble: string[][] = [
    ["Bolão Yomar e Família — Copa 2026 — Resultados de todos"],
    [`Gerado em: ${generated}`],
    [isHost ? "Visão: organização (todos os jogos)" : "Visão: pública (jogos já apitados)"],
    ["Legenda: 1 = vence mandante · X = empate · 2 = vence visitante"],
    [],
  ];
  const header = ["Jogador", ...visible.map(matchLabel), "Pontos"];
  const resultRow = ["RESULTADO", ...visible.map(resultCell), ""];
  const playerRows = players.map((pl) => {
    const cells = visible.map((m) => picksByMatch.get(m.id)?.get(pl.id ?? "") ?? "");
    const name = isAgentY(pl.id) ? `${pl.name ?? "Agente Y"} (IA)` : pl.name ?? "";
    return [name, ...cells, String(pl.score ?? 0)];
  });

  const all = [...preamble, header, resultRow, ...playerRows];
  // BOM ajuda o Excel BR a abrir com acentos + delimitador ;
  const body = "﻿" + all.map((r) => r.map(csvEscape).join(";")).join("\r\n") + "\r\n";
  const dateStamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="resultados-bolao-${dateStamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
