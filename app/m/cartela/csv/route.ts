import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ACTIVE_PROFILE_COOKIE } from "@/lib/active-profile";
import { TEAMS } from "@/lib/static-data";

const UUID_RE = /^[0-9a-f-]{36}$/i;

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Não autenticado", { status: 401 });

  const cookieVal = request.cookies.get(ACTIVE_PROFILE_COOKIE)?.value;
  let profileId = cookieVal && UUID_RE.test(cookieVal) ? cookieVal : user.id;
  const { data: allowed } = await supabase.rpc("is_profile_managed_by_uid", {
    profile_id: profileId,
  });
  if (!allowed) profileId = user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", profileId)
    .maybeSingle();
  const profileName = profile?.name ?? "Participante";

  const [{ data: matches }, { data: picks }] = await Promise.all([
    supabase
      .from("matches")
      .select("id,group_letter,round,team_a,team_b,starts_at,result,score_a,score_b")
      .order("group_letter")
      .order("starts_at"),
    supabase
      .from("picks")
      .select("match_id,pick,updated_at")
      .eq("user_id", profileId),
  ]);

  const pickByMatch = new Map((picks ?? []).map((p) => [p.match_id, p]));
  const generated = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const filled = (picks ?? []).length;
  const total = (matches ?? []).length;
  const score = (matches ?? []).reduce((acc, m) => {
    const p = pickByMatch.get(m.id);
    if (m.result && p?.pick === m.result) return acc + 1;
    return acc;
  }, 0);

  // Preamble — 3 linhas + linha em branco antes do cabeçalho dos dados
  const preamble: string[][] = [
    [`Bolão Yomar e Família — Copa 2026`],
    [`Participante: ${profileName}`],
    [`Gerado em: ${generated}`],
    [`Palpitados: ${filled}/${total}`, `Pontos atuais: ${score}`],
    [],
  ];

  const header = [
    "Grupo",
    "Rodada",
    "Dia (BRT)",
    "Hora (BRT)",
    "Jogo Nº",
    "Mandante",
    "Placar A",
    "Placar B",
    "Visitante",
    "Palpite",
    "Resultado",
    "Acerto",
    "Atualizado em",
  ];

  const rows: string[][] = [...preamble, header];

  for (const m of matches ?? []) {
    const tA = TEAMS[m.team_a as keyof typeof TEAMS];
    const tB = TEAMS[m.team_b as keyof typeof TEAMS];
    const dt = new Date(m.starts_at);
    const date = dt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const time = dt.toLocaleTimeString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
    });
    const p = pickByMatch.get(m.id);
    const pickStr = p?.pick ?? "";
    const result = m.result ?? "";
    const scoreA = m.score_a == null ? "" : String(m.score_a);
    const scoreB = m.score_b == null ? "" : String(m.score_b);
    let acerto = "";
    if (result && pickStr) acerto = result === pickStr ? "Sim" : "Não";

    rows.push([
      m.group_letter,
      String(m.round),
      date,
      time,
      String(m.id),
      tA?.name ?? m.team_a,
      scoreA,
      scoreB,
      tB?.name ?? m.team_b,
      pickStr,
      result,
      acerto,
      p?.updated_at
        ? new Date(p.updated_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
        : "",
    ]);
  }

  // UTF-8 BOM helps Excel BR open w/ accents + auto delim ;
  const body = "﻿" + rows.map((r) => r.map(csvEscape).join(";")).join("\r\n") + "\r\n";
  const dateStamp = new Date().toISOString().slice(0, 10);
  const slug = profileName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "participante";
  const filename = `cartela-${slug}-${dateStamp}.csv`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
