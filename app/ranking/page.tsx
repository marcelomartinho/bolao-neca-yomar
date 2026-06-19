import type { Metadata } from "next";
import Link from "next/link";
import { TriRule } from "@/components/boletim/TriRule";
import { Stamp } from "@/components/boletim/Stamp";
import { PageHeader } from "@/components/boletim/PageHeader";
import { PageFooter } from "@/components/boletim/PageFooter";
import { Avatar } from "@/components/Avatar";
import { fetchRanking, fetchMatches } from "@/lib/db";
import { isAgentY, isYomar } from "@/lib/special-profiles";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { title: "Ranking" };

export default async function RankingPage() {
  const [ranking, matches] = await Promise.all([fetchRanking(), fetchMatches()]);
  const resolved = matches.filter((m) => m.result !== null).length;
  const remaining = matches.length - resolved;
  const noResults = resolved === 0;

  // Agente Y (IA) fica FORA da numeração e do prêmio — é só referência.
  const agentY = ranking.find((r) => isAgentY(r.id)) ?? null;
  let humans = ranking.filter((r) => r.id !== null && !isAgentY(r.id));

  // Enquanto nenhum jogo tiver resultado, o Yomar lidera (cortesia da casa).
  if (noResults) {
    const yIdx = humans.findIndex((r) => isYomar(r));
    if (yIdx > 0) {
      const [yomar] = humans.splice(yIdx, 1);
      humans = [yomar, ...humans];
    }
  }

  const hasScores = humans.some((p) => (p.score ?? 0) > 0);
  // Com pontos: posição compartilhada no empate (padrão esportivo 1-1-3).
  // Sem jogo resolvido ainda: ordem da lista (cortesia da casa p/ Yomar).
  const sorted = hasScores ? rankWithTies(humans) : humans.map((r, i) => ({ ...r, pos: i + 1 }));
  const leader = sorted[0] ?? null;
  const showYomarLead = noResults && leader != null && isYomar(leader);

  // Pódio por LUGARES de premiação (1º e 2º). Empatados dividem o lugar.
  // O lugar é por placar distinto — casa com as faixas de prêmio (1º/2º).
  const distinctScores = [...new Set(sorted.map((p) => p.score ?? 0))];
  const podiumPlaces = distinctScores.slice(0, 2).map((sc, i) => ({
    place: i + 1,
    score: sc,
    members: sorted.filter((p) => (p.score ?? 0) === sc),
  }));
  const leaders = podiumPlaces[0]?.members ?? [];
  const runnerUps = podiumPlaces[1]?.members ?? [];

  // Consolação (lanterna): só quem palpitou (≥1) e não é o Yomar — ele banca o
  // prêmio (Avôtrocinador) e fica fora da disputa. Agente Y já saiu de `humans`.
  const elegiveisLanterna = sorted.filter(
    (p) => !isYomar(p) && (p.total_picks ?? 0) > 0,
  );
  const lanternaScore = elegiveisLanterna.length
    ? Math.min(...elegiveisLanterna.map((p) => p.score ?? 0))
    : null;
  const lanternaTop = elegiveisLanterna.length
    ? Math.max(...elegiveisLanterna.map((p) => p.score ?? 0))
    : 0;
  const lanterna =
    lanternaScore !== null
      ? elegiveisLanterna.filter((p) => (p.score ?? 0) === lanternaScore)
      : [];
  // Só destaca quando há resultado e a lanterna não é também a liderança.
  const showConsolacao = resolved > 0 && lanterna.length > 0 && lanternaScore !== lanternaTop;

  // Comparação humanos × IA
  const humanScores = sorted.map((p) => p.score ?? 0);
  const agentScore = agentY?.score ?? 0;
  const bestHuman = humanScores.length ? Math.max(...humanScores) : 0;
  const avgHuman = humanScores.length
    ? humanScores.reduce((a, b) => a + b, 0) / humanScores.length
    : 0;
  // Posição densa: nº de placares humanos DISTINTOS acima do agente + 1.
  const agentRankIfCounted = 1 + new Set(humanScores.filter((s) => s > agentScore)).size;

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <PageHeader pageLabel={`Boletim do dia · ${formatToday()}`} subtitle="Pág. 3 — ranking geral" />

      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 md:gap-3.5 md:px-9 md:py-4">
        <Stamp color="#0b6b3a" rot={-2}>{resolved} resolvidos</Stamp>
        <Stamp color="#c79410" rot={3}>{remaining} a faltar</Stamp>
        <Stamp color="#0b2c5c" rot={-1}>Edição 11</Stamp>
      </div>

      <h2 className="font-cond m-0 break-words px-4 pb-1.5 pt-3 text-2xl font-extrabold uppercase leading-[1.05] tracking-tight md:px-9 md:pt-4 md:text-[44px] md:leading-none">
        {showYomarLead ? (
          <>
            {leader!.name}{" "}
            <span className="italic font-normal text-ink2">na liderança — até o primeiro apito.</span>
          </>
        ) : !hasScores ? (
          <span className="text-ink2">Ranking ainda em branco.</span>
        ) : leaders.length > 1 ? (
          <>
            {joinNames(leaders.map((p) => p.name))}{" "}
            <span className="italic font-normal text-grass">dividem a ponta.</span>
          </>
        ) : runnerUps.length === 0 ? (
          <>
            {leaders[0]?.name}{" "}
            <span className="italic font-normal text-ink2">na liderança.</span>
          </>
        ) : (
          <>
            {leaders[0]?.name}{" "}
            <span className="italic font-normal">lidera —</span>{" "}
            <span className="text-grass">
              {runnerUps.length > 1 ? "empate pelo 2º" : runnerUps[0]?.name}
            </span>{" "}
            logo atrás.
          </>
        )}
      </h2>

      <div className="grid flex-1 min-h-0 grid-cols-1 md:[grid-template-columns:1.05fr_1fr]">
        <div className="px-4 pb-5 pt-3 md:px-9 md:pb-7 md:pt-4">
          {showYomarLead ? (
            <YomarLeaderCard name={leader!.name} initials={leader!.initials} emoji={leader!.emoji} />
          ) : !hasScores ? (
            <div className="border-2 border-dashed border-line bg-white/40 p-6 text-sm text-ink2">
              {resolved === 0
                ? "Pódio aparece quando o primeiro jogo for resolvido pelo admin."
                : "Ninguém pontuou ainda. "}
              {" "}
              <Link href="/m/login" className="underline">
                Entrar na cartela
              </Link>
              .
            </div>
          ) : (
            <div
              className="mt-3 gap-3.5"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${podiumPlaces.length}, minmax(0, 1fr))`,
              }}
            >
              {podiumPlaces.map((pl, i) => {
                const bg = i === 0 ? "#0b6b3a" : "rgba(255,255,255,0.6)";
                const fg = i === 0 ? "#fff" : "#0b2c5c";
                const tied = pl.members.length > 1;
                return (
                  <div
                    key={pl.place}
                    className="relative flex flex-col items-center gap-2 overflow-hidden border-2 px-2 py-3 md:px-3.5 md:py-4"
                    style={{
                      borderColor: "#0b2c5c",
                      background: bg,
                      color: fg,
                      transform: `rotate(${(i === 0 ? -0.6 : 0.6)}deg)`,
                    }}
                  >
                    {i === 0 && (
                      <TriRule
                        height={3}
                        style={{ position: "absolute", top: -2, left: -2, right: -2, width: "auto" }}
                      />
                    )}
                    <div className="font-cond text-3xl font-extrabold leading-none tracking-tight text-gold md:text-[46px]">
                      {pl.place}º
                    </div>
                    <div className="flex flex-wrap items-start justify-center gap-x-3 gap-y-2">
                      {pl.members.map((m) => (
                        <Link
                          key={m.id}
                          href={`/${m.id}`}
                          className="flex max-w-[88px] flex-col items-center gap-1 hover:underline"
                          style={{ color: fg }}
                          title={m.name ?? ""}
                        >
                          <Avatar name={m.name ?? "?"} initials={m.initials} emoji={m.emoji} size={32} />
                          <div className="font-cond w-full truncate text-center text-[11px] font-bold uppercase md:text-base">
                            {m.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div
                      className="font-mono text-center text-[10px] uppercase tracking-[0.06em] md:text-[11px]"
                      style={{ opacity: i === 0 ? 0.9 : 0.65 }}
                    >
                      {pl.score} pts{tied ? ` · ${pl.members.length} empatados` : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showConsolacao && (
            <ConsolacaoCard players={lanterna} score={lanternaScore ?? 0} />
          )}

          <div className="mt-6 border-[1.5px] border-ink bg-white/40 px-4 py-3.5">
            <div className="font-cond mb-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-ink2">
              Nota da redação
            </div>
            <p className="m-0 text-[13px] italic leading-snug">
              {showYomarLead ? (
                <>
                  Cortesia da casa: o Yomar abre na ponta enquanto a bola não rola. Assim que o primeiro
                  jogo for apitado, o ranking passa a valer por pontos.{" "}
                </>
              ) : (
                <>
                  Ranking atualizado a cada palpite registrado. Empate no total de pontos significa
                  prêmio rateado — e o último colocado leva R$ 1.000 de consolação. Veja{" "}
                </>
              )}
              <Link href="/regulamento" className="underline">
                regulamento
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="border-t border-line py-4 md:border-l md:border-t-0">
          {agentY && (
            <AgentBenchmark
              name={agentY.name}
              initials={agentY.initials}
              emoji={agentY.emoji}
              score={agentScore}
              resolved={resolved}
              bestHuman={bestHuman}
              avgHuman={avgHuman}
              rankIfCounted={agentRankIfCounted}
            />
          )}

          <div className="grid grid-cols-[32px_1fr_56px_56px] border-b border-line px-4 pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink2 md:px-7">
            <span>#</span>
            <span>Participante</span>
            <span className="text-right">Acertos</span>
            <span className="text-right">Pts</span>
          </div>
          {sorted.length === 0 ? (
            <div className="px-4 py-6 text-sm text-ink2 md:px-7">Sem palpiteiros.</div>
          ) : (
            sorted.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[32px_1fr_56px_56px] items-center border-b border-dashed border-line px-4 py-2.5 md:px-7"
              >
                <span
                  className="font-cond text-base font-bold"
                  style={{
                    color:
                      p.pos === 1 ? "#0b6b3a" : p.pos === 2 ? "#0b2c5c" : p.pos === 3 ? "#c79410" : "#5a6a86",
                  }}
                >
                  {p.pos}º
                </span>
                <Link href={`/${p.id}`} className="flex items-center gap-2.5 hover:underline">
                  <Avatar name={p.name ?? "?"} initials={p.initials} emoji={p.emoji} size={26} />
                  <span className="text-[13.5px]" style={{ fontWeight: p.pos === 1 ? 700 : 500 }}>
                    {p.name}
                  </span>
                </Link>
                <span className="text-right font-mono text-xs text-ink2">
                  {resolved > 0 ? `${p.score ?? 0}/${resolved}` : "—"}
                </span>
                <span className="text-right font-cond text-[17px] font-bold">{p.score ?? 0}</span>
              </div>
            ))
          )}

          <div className="px-4 pt-3 md:px-7">
            <Link href="/resultados" className="font-mono text-[11px] uppercase tracking-[0.14em] text-grass underline">
              Ver todos os palpites e resultados →
            </Link>
          </div>
        </div>
      </div>

      <PageFooter
        left="Pág. 4 de 6"
        center="atualiza a cada cartela carimbada"
        right="boletim · ed. 11"
      />
    </main>
  );
}

function YomarLeaderCard({
  name,
  initials,
  emoji,
}: {
  name: string | null;
  initials: string | null;
  emoji: string | null;
}) {
  return (
    <div
      className="relative flex items-center gap-4 overflow-hidden border-2 px-5 py-5"
      style={{ borderColor: "#0b2c5c", background: "#0b6b3a", color: "#fff" }}
    >
      <TriRule
        height={3}
        style={{ position: "absolute", top: -2, left: -2, right: -2, width: "auto" }}
      />
      <div className="font-cond text-5xl font-extrabold leading-none tracking-tight text-gold md:text-[64px]">
        1º
      </div>
      <Avatar name={name ?? "?"} initials={initials} emoji={emoji} size={56} ring="#fff" />
      <div className="min-w-0">
        <div className="font-cond truncate text-2xl font-extrabold uppercase leading-none md:text-[34px]" title={name ?? ""}>
          {name}
        </div>
        <div className="mt-2">
          <span
            className="font-cond inline-flex items-center gap-1.5 rounded-md border-2 px-2.5 py-1 text-[12.5px] font-bold uppercase tracking-wider"
            style={{ borderColor: "#ffffff", background: "#ffffff", color: "#0b2c5c", transform: "rotate(-3deg)" }}
          >
            Liderança da casa · até a bola rolar
          </span>
        </div>
      </div>
    </div>
  );
}

function ConsolacaoCard({
  players,
  score,
}: {
  players: Array<{ id: string; name: string | null; initials: string | null; emoji: string | null }>;
  score: number;
}) {
  const rateado = players.length > 1;
  return (
    <div className="relative mt-5 overflow-hidden border-2 border-ink bg-gold/[0.08] px-4 py-3.5">
      <TriRule
        height={3}
        style={{ position: "absolute", top: -2, left: -2, right: -2, width: "auto" }}
      />
      <div className="flex items-baseline justify-between border-b border-dashed border-line pb-1.5">
        <span className="font-cond text-[13px] font-bold uppercase tracking-[0.12em] text-gold">
          Consolação · último colocado
        </span>
        <span className="font-cond text-lg font-extrabold text-gold">R$ 1.000</span>
      </div>
      <div className="mt-2.5 flex flex-col gap-2">
        {players.map((p) => (
          <div key={p.id} className="flex items-center gap-2.5">
            <Avatar name={p.name ?? "?"} initials={p.initials} emoji={p.emoji} size={26} />
            <span className="font-cond text-[14px] font-bold uppercase tracking-tight">{p.name}</span>
            <span className="ml-auto font-mono text-[11px] text-ink2">{score} pts</span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 border-t border-dashed border-line pt-2 font-mono text-[10px] leading-snug text-ink2">
        {rateado
          ? `Empate na lanterna — os R$ 1.000 do Avôtrocinador são rateados entre os ${players.length}.`
          : "R$ 1.000 do Avôtrocinador para quem ficou na lanterna. Ninguém sai de mãos vazias."}
      </p>
    </div>
  );
}

function AgentBenchmark({
  name,
  initials,
  emoji,
  score,
  resolved,
  bestHuman,
  avgHuman,
  rankIfCounted,
}: {
  name: string | null;
  initials: string | null;
  emoji: string | null;
  score: number;
  resolved: number;
  bestHuman: number;
  avgHuman: number;
  rankIfCounted: number;
}) {
  return (
    <div className="mx-4 mb-4 border-2 border-ink bg-[#0b2c5c]/[0.06] px-3.5 py-3 md:mx-7">
      <div className="flex items-center gap-3">
        <Avatar name={name ?? "Agente Y"} initials={initials} emoji={emoji} size={34} ring="#0b2c5c" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-cond text-[15px] font-extrabold uppercase tracking-tight">{name}</span>
            <Stamp color="#0b2c5c" rot={-2}>IA · fora do prêmio</Stamp>
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink2">
            Referência da máquina · não disputa o prêmio
          </div>
        </div>
        <div className="text-right">
          <div className="font-cond text-2xl font-extrabold leading-none">{score}</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink2">pts</div>
        </div>
      </div>
      <div className="mt-2.5 border-t border-dashed border-line pt-2 font-mono text-[10.5px] leading-snug text-ink2">
        {resolved === 0 ? (
          <>Aguardando o primeiro apito para comparar com os humanos.</>
        ) : (
          <>
            Acertos {score}/{resolved} · melhor humano {bestHuman} · média humana {avgHuman.toFixed(1)} ·
            se contasse, estaria em <span className="font-bold text-ink">{rankIfCounted}º</span>.
          </>
        )}
      </div>
    </div>
  );
}

// Posição densa: empatados dividem a mesma posição e a próxima NÃO pula
// (1, 2, 2, 3, 3, 4...). Casa com o pódio, que agrupa por placar distinto.
// Pressupõe `rows` já ordenado por score desc.
function rankWithTies<T extends { score: number | null }>(rows: T[]): Array<T & { pos: number }> {
  let lastScore: number | null = null;
  let pos = 0;
  return rows.map((r) => {
    const s = r.score ?? 0;
    if (lastScore === null || s !== lastScore) pos += 1;
    lastScore = s;
    return { ...r, pos };
  });
}

function joinNames(names: Array<string | null>): string {
  const ns = names.map((n) => n ?? "?");
  if (ns.length <= 1) return ns[0] ?? "";
  if (ns.length === 2) return `${ns[0]} e ${ns[1]}`;
  if (ns.length === 3) return `${ns[0]}, ${ns[1]} e ${ns[2]}`;
  return `${ns[0]}, ${ns[1]} e +${ns.length - 2}`;
}

function formatToday(): string {
  return new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
