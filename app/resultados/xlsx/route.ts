import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAgentY } from "@/lib/special-profiles";
import { flagUrl, type TeamCode } from "@/lib/static-data";

export const dynamic = "force-dynamic";

// Paleta do site (ARGB pro Excel)
const C = {
  grass: "FF0B6B3A",
  gold: "FFC79410",
  navy: "FF0B2C5C",
  ink2: "FF5A6A86",
  paper: "FFFBFAF4",
  paper2: "FFF4F1E6",
  line: "FFD5DDE7",
  white: "FFFFFFFF",
  hit: "FF0B6B3A",
  miss: "FFAA4444",
  pick: "FFE7ECF4", // palpite sem resultado ainda
  empty: "FFF0F2F6", // sem palpite
  gold_soft: "FFF6ECC7",
};

type MatchLite = {
  id: number;
  team_a: string;
  team_b: string;
  starts_at: string;
  result: string | null;
  score_a: number | null;
  score_b: number | null;
};

const thin = { style: "thin" as const, color: { argb: C.line } };
const allBorders = { top: thin, left: thin, bottom: thin, right: thin };

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

  const [{ data: ranking }, { data: matches }, { data: picks }, { data: cfg }] = await Promise.all([
    supabase
      .from("ranking")
      .select("id,name,score")
      .order("score", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true }),
    supabase
      .from("matches")
      .select("id,team_a,team_b,starts_at,result,score_a,score_b")
      .order("id", { ascending: true }),
    supabase.from("picks").select("user_id,match_id,pick").range(0, 99999),
    supabase.from("app_config").select("picks_deadline").eq("id", 1).maybeSingle(),
  ]);

  const now = Date.now();
  const allMatches = (matches ?? []) as MatchLite[];
  // Passado o deadline (ninguém altera palpite), libera todos os jogos pra todos.
  const picksClosed =
    !!cfg?.picks_deadline && new Date(cfg.picks_deadline).getTime() <= now;
  const visible = (
    isHost || picksClosed
      ? allMatches
      : allMatches.filter((m) => new Date(m.starts_at).getTime() <= now)
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

  const wb = new ExcelJS.Workbook();
  wb.creator = "Bolão Yomar e Família";
  const ws = wb.addWorksheet("Resultados", {
    views: [{ state: "frozen", xSplit: 1, ySplit: 8 }],
  });

  // Bandeiras (busca só as siglas visíveis, registra cada uma 1x)
  const codes = new Set<string>();
  for (const m of visible) {
    codes.add(m.team_a);
    codes.add(m.team_b);
  }
  const flagId = new Map<string, number>();
  await Promise.all(
    [...codes].map(async (code) => {
      try {
        const res = await fetch(flagUrl(code as TeamCode, 40));
        if (!res.ok) return;
        const base64 = Buffer.from(await res.arrayBuffer()).toString("base64");
        flagId.set(code, wb.addImage({ base64, extension: "png" }));
      } catch {
        /* sem bandeira, segue com a sigla */
      }
    }),
  );

  const nCols = 2 + visible.length; // Jogador + jogos + Pontos
  const ptsCol = nCols;
  const lastColLetter = ws.getColumn(nCols).letter;

  // Larguras
  ws.getColumn(1).width = 22;
  for (let i = 0; i < visible.length; i++) ws.getColumn(2 + i).width = 5.4;
  ws.getColumn(ptsCol).width = 8;

  // Título
  ws.mergeCells(`A1:${lastColLetter}1`);
  const t = ws.getCell("A1");
  t.value = "Bolão Yomar e Família — Resultados";
  t.font = { name: "Arial Narrow", bold: true, size: 16, color: { argb: C.white } };
  t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.grass } };
  t.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(1).height = 26;

  ws.mergeCells(`A2:${lastColLetter}2`);
  const sub = ws.getCell("A2");
  const generated = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  sub.value = `Gerado em ${generated} · ${isHost ? "visão organização (todos os jogos)" : picksClosed ? "todos os jogos (prazo encerrado)" : "visão pública (jogos já apitados)"}`;
  sub.font = { name: "Arial", italic: true, size: 9, color: { argb: C.ink2 } };
  sub.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.paper2 } };
  ws.getRow(2).height = 15;

  ws.mergeCells(`A3:${lastColLetter}3`);
  const leg = ws.getCell("A3");
  leg.value = "1 vence mandante · X empate · 2 vence visitante  —  verde = acerto · vermelho = erro";
  leg.font = { name: "Arial", size: 8, color: { argb: C.ink2 } };
  leg.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.paper } };
  ws.getRow(3).height = 14;

  // Cabeçalho col A (JOGADOR) e PTS — mescla vertical rows 4..8
  ws.mergeCells(4, 1, 8, 1);
  const hJog = ws.getCell(4, 1);
  hJog.value = "JOGADOR";
  hJog.font = { name: "Arial Narrow", bold: true, size: 11, color: { argb: C.white } };
  hJog.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.navy } };
  hJog.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

  ws.mergeCells(4, ptsCol, 8, ptsCol);
  const hPts = ws.getCell(4, ptsCol);
  hPts.value = "PTS";
  hPts.font = { name: "Arial Narrow", bold: true, size: 11, color: { argb: C.navy } };
  hPts.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.gold_soft } };
  hPts.alignment = { vertical: "middle", horizontal: "center" };

  // alturas das linhas de cabeçalho (5 e 7 recebem bandeiras)
  ws.getRow(4).height = 14;
  ws.getRow(5).height = 15;
  ws.getRow(6).height = 13;
  ws.getRow(7).height = 15;
  ws.getRow(8).height = 13;

  // Cabeçalho de cada jogo: nº, bandeira+sigla mandante, bandeira+sigla visitante
  visible.forEach((m, i) => {
    const col = 2 + i;
    const col0 = col - 1;
    const numCell = ws.getCell(4, col);
    numCell.value = `J${m.id}`;
    numCell.font = { name: "Arial", bold: true, size: 8, color: { argb: C.ink2 } };
    numCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.paper2 } };
    numCell.alignment = { vertical: "middle", horizontal: "center" };

    const codeA = ws.getCell(6, col);
    codeA.value = m.team_a;
    codeA.font = { name: "Arial Narrow", bold: true, size: 9, color: { argb: C.navy } };
    codeA.alignment = { vertical: "middle", horizontal: "center" };

    const codeB = ws.getCell(8, col);
    codeB.value = m.team_b;
    codeB.font = { name: "Arial Narrow", bold: true, size: 9, color: { argb: C.navy } };
    codeB.alignment = { vertical: "middle", horizontal: "center" };

    const idA = flagId.get(m.team_a);
    if (idA !== undefined) {
      ws.addImage(idA, {
        tl: { col: col0 + 0.12, row: 4 + 0.12 },
        ext: { width: 20, height: 13 },
        editAs: "oneCell",
      });
    }
    const idB = flagId.get(m.team_b);
    if (idB !== undefined) {
      ws.addImage(idB, {
        tl: { col: col0 + 0.12, row: 6 + 0.12 },
        ext: { width: 20, height: 13 },
        editAs: "oneCell",
      });
    }
    for (const r of [4, 5, 6, 7, 8]) ws.getCell(r, col).border = allBorders;
  });
  hJog.border = allBorders;
  hPts.border = allBorders;

  // Linha RESULTADO
  const resRow = 9;
  const rLabel = ws.getCell(resRow, 1);
  rLabel.value = "RESULTADO";
  rLabel.font = { name: "Arial Narrow", bold: true, size: 10, color: { argb: C.navy } };
  rLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.gold_soft } };
  rLabel.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  rLabel.border = allBorders;
  ws.getRow(resRow).height = 16;
  visible.forEach((m, i) => {
    const cell = ws.getCell(resRow, 2 + i);
    cell.value =
      m.score_a != null && m.score_b != null
        ? `${m.score_a}–${m.score_b}`
        : m.result
          ? m.result
          : "—";
    cell.font = {
      name: "Arial",
      bold: true,
      size: 9,
      color: { argb: m.result ? C.navy : C.ink2 },
    };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.gold_soft } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = allBorders;
  });
  ws.getCell(resRow, ptsCol).fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.gold_soft } };
  ws.getCell(resRow, ptsCol).border = allBorders;

  // Jogadores
  players.forEach((pl, idx) => {
    const row = resRow + 1 + idx;
    const ai = isAgentY(pl.id);
    const nameCell = ws.getCell(row, 1);
    nameCell.value = ai ? `${pl.name ?? "Agente Y"} (IA)` : pl.name ?? "";
    nameCell.font = { name: "Arial", bold: ai, size: 10, color: { argb: C.navy } };
    nameCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: ai ? C.pick : idx % 2 ? C.paper2 : C.paper },
    };
    nameCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    nameCell.border = allBorders;

    visible.forEach((m, i) => {
      const pick = picksByMatch.get(m.id)?.get(pl.id ?? "") ?? null;
      const decided = m.result !== null && pick !== null;
      const hit = decided && m.result === pick;
      const cell = ws.getCell(row, 2 + i);
      cell.value = pick ?? "";
      let fg = C.empty;
      let fontColor = C.ink2;
      let bold = false;
      if (pick && decided) {
        fg = hit ? C.hit : C.miss;
        fontColor = C.white;
        bold = true;
      } else if (pick) {
        fg = C.pick;
        fontColor = C.navy;
      }
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fg } };
      cell.font = { name: "Arial", bold, size: 9, color: { argb: fontColor } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = allBorders;
    });

    const pts = ws.getCell(row, ptsCol);
    pts.value = pl.score ?? 0;
    pts.font = { name: "Arial Narrow", bold: true, size: 11, color: { argb: C.gold } };
    pts.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.paper2 } };
    pts.alignment = { vertical: "middle", horizontal: "center" };
    pts.border = allBorders;
  });

  const buf = await wb.xlsx.writeBuffer();
  const dateStamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(buf as unknown as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="resultados-bolao-${dateStamp}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
