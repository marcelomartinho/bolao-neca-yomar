import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/boletim/PageHeader";
import { PageFooter } from "@/components/boletim/PageFooter";
import { Stamp } from "@/components/boletim/Stamp";
import { TriRule } from "@/components/boletim/TriRule";
import { Avatar } from "@/components/Avatar";
import { Flag } from "@/components/Flag";
import { fetchRanking, fetchMatches, fetchAllPicks } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TEAMS } from "@/lib/static-data";
import type { Pick } from "@/lib/supabase/types";
import { isAgentY } from "@/lib/special-profiles";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Resultados",
  description: "Palpites de todos os participantes contra o resultado de cada jogo.",
};

type Player = {
  id: string;
  name: string | null;
  initials: string | null;
  emoji: string | null;
  score: number | null;
  isAi: boolean;
};

export default async function ResultadosPage() {
  const [ranking, matches, allPicks] = await Promise.all([
    fetchRanking(),
    fetchMatches(),
    fetchAllPicks(),
  ]);

  // Host (organização) audita tudo, inclusive antes do apito — a RLS 0012 já
  // libera os palpites pra ele. Demais só veem jogos já apitados (anti-cola).
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

  const now = Date.now();
  const resolved = matches.filter((m) => m.result !== null).length;
  const started = matches.filter((m) => new Date(m.starts_at).getTime() <= now);
  const visible = isHost ? matches : started;

  // Jogadores: Agente Y fixado no topo, humanos por pontos e depois nome.
  const agentRow = ranking.find((r) => isAgentY(r.id)) ?? null;
  const agentY: Player | null = agentRow
    ? { ...agentRow, isAi: true }
    : null;
  const humans: Player[] = ranking
    .filter((r) => r.id !== null && !isAgentY(r.id))
    .map((r) => ({ ...r, isAi: false }))
    .sort(
      (a, b) =>
        (b.score ?? 0) - (a.score ?? 0) || (a.name ?? "").localeCompare(b.name ?? ""),
    );
  const players: Player[] = agentY ? [agentY, ...humans] : humans;

  // Índice de palpites: match_id -> (user_id -> pick). RLS já oculta jogos futuros.
  const picksByMatch = new Map<number, Map<string, Pick>>();
  for (const p of allPicks) {
    let inner = picksByMatch.get(p.match_id);
    if (!inner) {
      inner = new Map();
      picksByMatch.set(p.match_id, inner);
    }
    inner.set(p.user_id, p.pick);
  }

  // Comparação IA × humanos (placares completos via view ranking).
  const humanScores = humans.map((h) => h.score ?? 0);
  const agentScore = agentY?.score ?? 0;
  const bestHuman = humanScores.length ? Math.max(...humanScores) : 0;
  const avgHuman = humanScores.length
    ? humanScores.reduce((a, b) => a + b, 0) / humanScores.length
    : 0;
  const aheadOfHumans = humanScores.filter((s) => s < agentScore).length;

  const feed = isHost
    ? [...visible].sort((a, b) => a.id - b.id) // ordem da cartela pra auditar
    : [...visible].sort(
        (a, b) =>
          new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime() || b.id - a.id,
      );
  const matrixMatches = [...visible].sort((a, b) => a.id - b.id);

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <PageHeader pageLabel="Pág. 6 — Resultados de todos" subtitle="Palpites × resultado de cada jogo" />

      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 md:gap-3.5 md:px-9 md:py-4">
        <Stamp color="#0b6b3a" rot={-2}>{resolved} apitados</Stamp>
        <Stamp color="#c79410" rot={3}>{started.length} liberados</Stamp>
        <Stamp color="#0b2c5c" rot={-1}>{players.length} cartelas</Stamp>
        {isHost && <Stamp color="#a44" rot={2}>Organização · vê tudo</Stamp>}
      </div>
      {isHost && (
        <p className="border-b border-line bg-[#a44]/[0.05] px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-[#a44] md:px-9">
          Modo organização — você vê os palpites de todos, inclusive de jogos ainda não apitados.
        </p>
      )}

      {/* ---------- IA × Humanos ---------- */}
      {agentY && (
        <section className="border-b border-line px-4 py-5 md:px-9">
          <div className="font-cond mb-3 text-base font-bold uppercase tracking-[0.1em] text-ink2">
            Agente Y · a máquina contra a família
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[auto_1fr]">
            <div
              className="relative flex items-center gap-4 overflow-hidden border-2 px-5 py-4"
              style={{ borderColor: "#0b2c5c", background: "#0b2c5c", color: "#fff" }}
            >
              <TriRule height={3} style={{ position: "absolute", top: -2, left: -2, right: -2, width: "auto" }} />
              <Avatar name={agentY.name ?? "Agente Y"} initials={agentY.initials} emoji={agentY.emoji} size={52} ring="#fff" />
              <div>
                <div className="font-cond text-2xl font-extrabold uppercase leading-none">{agentY.name}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] opacity-80">
                  Palpites da IA · fora do prêmio
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="font-cond text-4xl font-extrabold leading-none text-gold">{agentScore}</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] opacity-80">pontos</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <CompareBox label="Melhor humano" value={bestHuman} accent="#0b6b3a" />
              <CompareBox label="Média humana" value={avgHuman.toFixed(1)} accent="#0b2c5c" />
              <CompareBox label="À frente de" value={`${aheadOfHumans}/${humans.length}`} accent="#c79410" />
            </div>
          </div>
          <p className="mt-3 max-w-[640px] text-[13px] italic leading-snug text-ink2">
            {resolved === 0
              ? "Ainda sem jogos apitados — quando a bola rolar, dá pra ver se a máquina bate a família."
              : agentScore > bestHuman
                ? "Por enquanto a IA está na frente de todo mundo. A família tem trabalho pela frente."
                : agentScore >= avgHuman
                  ? "A IA está acima da média da família, mas ainda não lidera. Dá pra alcançar."
                  : "A família está jogando melhor que a máquina até aqui."}
          </p>
        </section>
      )}

      {/* ---------- Feed por jogo ---------- */}
      <section className="px-4 py-5 md:px-9">
        <div className="font-cond mb-3 text-base font-bold uppercase tracking-[0.1em] text-ink2">
          Jogo a jogo
        </div>
        {feed.length === 0 ? (
          <div className="border-2 border-dashed border-line bg-white/40 p-6 text-sm text-ink2">
            Os palpites de cada jogo aparecem aqui depois do apito inicial — antes disso ficam
            fechados pra ninguém colar.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {feed.map((m) => {
              const tA = TEAMS[m.team_a as keyof typeof TEAMS];
              const tB = TEAMS[m.team_b as keyof typeof TEAMS];
              const inner = picksByMatch.get(m.id);
              return (
                <div key={m.id} className="border-[1.5px] border-ink bg-white/40">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[10px] text-ink2">Nº {String(m.id).padStart(2, "0")}</span>
                      <span className="flex items-center gap-1.5 text-[13px]">
                        <Flag code={tA.code} name={tA.name} size="sm" />
                        <span style={{ fontWeight: m.result === "1" ? 700 : 500 }}>{tA.name}</span>
                      </span>
                      <MatchResult m={m} />
                      <span className="flex items-center gap-1.5 text-[13px]">
                        <span style={{ fontWeight: m.result === "2" ? 700 : 500 }}>{tB.name}</span>
                        <Flag code={tB.code} name={tB.name} size="sm" />
                      </span>
                    </div>
                    {m.result === null &&
                      (new Date(m.starts_at).getTime() <= now ? (
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink2">
                          em andamento
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink2">
                          {fmtKickoff(m.starts_at)} · agendado
                        </span>
                      ))}
                  </div>
                  <div className="flex flex-wrap gap-2 px-3.5 py-3">
                    {players.map((pl) => {
                      const pick = inner?.get(pl.id) ?? null;
                      return (
                        <PlayerPickChip
                          key={pl.id}
                          name={pl.name}
                          initials={pl.initials}
                          emoji={pl.emoji}
                          pick={pick}
                          result={m.result}
                          ai={pl.isAi}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- Matriz geral ---------- */}
      {matrixMatches.length > 0 && (
        <section className="border-t border-line px-4 py-5 md:px-9">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <div className="font-cond text-base font-bold uppercase tracking-[0.1em] text-ink2">
              Tabela geral
            </div>
            <a
              href="/resultados/xlsx"
              className="font-cond inline-flex items-center gap-1.5 rounded-sm border-2 border-ink bg-transparent px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink"
            >
              ↓ Exportar Excel
            </a>
          </div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.1em] text-ink2">
            verde acerto · vermelho erro · — sem palpite ou jogo em andamento
          </p>
          <div className="overflow-x-auto border-[1.5px] border-ink">
            <table className="min-w-full border-collapse text-center">
              <thead>
                <tr className="bg-white/50">
                  <th className="sticky left-0 z-10 border-b border-r border-line bg-white/90 px-2 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.1em] text-ink2">
                    Jogador
                  </th>
                  {matrixMatches.map((m) => {
                    const tA = TEAMS[m.team_a as keyof typeof TEAMS];
                    const tB = TEAMS[m.team_b as keyof typeof TEAMS];
                    return (
                      <th
                        key={m.id}
                        className="border-b border-line px-1 py-1.5 align-bottom"
                        title={`Jogo ${m.id}: ${tA.name} x ${tB.name}`}
                      >
                        <span className="flex flex-col items-center gap-0.5">
                          <span className="font-mono text-[8px] text-ink2">{m.id}</span>
                          <Flag code={tA.code} name={tA.name} size="sm" />
                          <span className="font-cond text-[9px] font-bold leading-none">{tA.code}</span>
                          <span className="text-[7px] leading-none text-ink2">×</span>
                          <Flag code={tB.code} name={tB.name} size="sm" />
                          <span className="font-cond text-[9px] font-bold leading-none">{tB.code}</span>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {players.map((pl) => {
                  const inner = (id: number) => picksByMatch.get(id)?.get(pl.id) ?? null;
                  return (
                    <tr key={pl.id} style={pl.isAi ? { background: "rgba(11,44,92,0.08)" } : undefined}>
                      <td className="sticky left-0 z-10 border-r border-line bg-white/90 px-2 py-1 text-left">
                        <span className="flex items-center gap-1.5">
                          <Avatar
                            name={pl.name ?? "?"}
                            initials={pl.initials}
                            emoji={pl.emoji}
                            size={18}
                            ring={pl.isAi ? "#0b2c5c" : undefined}
                          />
                          <span
                            className="max-w-[110px] truncate text-[11.5px]"
                            style={{ fontWeight: pl.isAi ? 700 : 500 }}
                            title={pl.name ?? ""}
                          >
                            {pl.name}
                          </span>
                        </span>
                      </td>
                      {matrixMatches.map((m) => (
                        <td key={m.id} className="border-l border-dashed border-line px-0.5 py-0.5">
                          <MatrixCell pick={inner(m.id)} result={m.result} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="px-4 pb-6 md:px-9">
        <Link
          href="/ranking"
          className="font-cond inline-flex items-center gap-2 rounded-sm border-2 border-ink bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider"
        >
          ← Ver ranking
        </Link>
      </div>

      <PageFooter left="Pág. 6 de 6" center="palpites de todos × resultado" right="boletim · ed. 11" />
    </main>
  );
}

function MatchResult({ m }: { m: { result: Pick | null; score_a: number | null; score_b: number | null } }) {
  if (m.score_a !== null && m.score_b !== null) {
    return (
      <span className="font-cond mx-1 border-[1.5px] border-ink px-2 py-0.5 text-[15px] font-extrabold leading-none">
        {m.score_a}<span className="px-0.5 text-ink2">×</span>{m.score_b}
      </span>
    );
  }
  if (m.result !== null) {
    return (
      <span className="font-cond mx-1 border-[1.5px] border-ink px-2 py-0.5 text-[13px] font-extrabold leading-none">
        {m.result}
      </span>
    );
  }
  return <span className="mx-1 font-mono text-[11px] text-ink2">×</span>;
}

const PICK_LABEL: Record<Pick, string> = { "1": "1", X: "X", "2": "2" };

function pickColors(pick: Pick | null, result: Pick | null) {
  if (!pick) return { border: "#c9cfda", bg: "transparent", fg: "#9aa6bb" };
  const decided = result !== null;
  if (decided && result === pick) return { border: "#0b6b3a", bg: "#0b6b3a", fg: "#fff" };
  if (decided) return { border: "#a44", bg: "transparent", fg: "#a44" };
  return { border: "#0b2c5c", bg: "transparent", fg: "#0b2c5c" };
}

function PlayerPickChip({
  name,
  initials,
  emoji,
  pick,
  result,
  ai,
}: {
  name: string | null;
  initials: string | null;
  emoji: string | null;
  pick: Pick | null;
  result: Pick | null;
  ai: boolean;
}) {
  const c = pickColors(pick, result);
  const decided = result !== null && pick !== null;
  const hit = decided && result === pick;
  const ring = ai ? "#0b2c5c" : hit ? "#0b6b3a" : decided ? "#a44" : undefined;
  return (
    <span
      className="inline-flex flex-col items-center gap-1 rounded-sm border px-1.5 py-1.5"
      style={{
        borderColor: ai ? "#0b2c5c" : "#e2e6ee",
        background: ai ? "rgba(11,44,92,0.06)" : "transparent",
        borderWidth: ai ? 1.5 : 1,
      }}
      title={`${name ?? "?"}${pick ? ` · palpite ${PICK_LABEL[pick]}` : " · sem palpite"}${
        decided ? (hit ? " · acertou" : " · errou") : ""
      }`}
    >
      <span className="relative inline-flex">
        <Avatar name={name ?? "?"} initials={initials} emoji={emoji} size={34} ring={ring} />
        {decided && (
          <span
            className="absolute -bottom-1 -right-1 flex h-[15px] w-[15px] items-center justify-center rounded-full text-[9px] font-bold leading-none text-white"
            style={{ background: hit ? "#0b6b3a" : "#a44", boxShadow: "0 0 0 1.5px #fff" }}
            aria-hidden
          >
            {hit ? "✓" : "✗"}
          </span>
        )}
      </span>
      <span
        className="font-cond inline-flex h-[20px] min-w-[24px] items-center justify-center px-1 text-[13px] font-extrabold leading-none"
        style={{ border: `1.5px solid ${c.border}`, background: c.bg, color: c.fg }}
      >
        {pick ? PICK_LABEL[pick] : "–"}
      </span>
    </span>
  );
}

function MatrixCell({ pick, result }: { pick: Pick | null; result: Pick | null }) {
  const c = pickColors(pick, result);
  return (
    <span
      className="font-cond mx-auto flex h-[22px] w-[22px] items-center justify-center text-[12px] font-bold leading-none"
      style={{ border: `1px solid ${c.border}`, background: c.bg, color: c.fg }}
    >
      {pick ? PICK_LABEL[pick] : "–"}
    </span>
  );
}

function fmtKickoff(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CompareBox({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="relative border-2 border-ink bg-white/55 px-3 py-3">
      <TriRule height={3} style={{ position: "absolute", top: -2, left: -2, right: -2, width: "auto" }} />
      <div className="tag" style={{ color: accent }}>{label}</div>
      <div className="font-cond mt-1 text-[28px] font-extrabold leading-none tracking-tight" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}
