import type { Metadata } from "next";
import { TriRule } from "@/components/boletim/TriRule";
import { PageHeader } from "@/components/boletim/PageHeader";
import { PageFooter } from "@/components/boletim/PageFooter";
import { Flag } from "@/components/Flag";
import { TEAMS, type TeamCode, dateKeyBRT, formatBRT, formatDayBRT } from "@/lib/static-data";
import { fetchMatches } from "@/lib/db";

export const revalidate = 60;
export const metadata: Metadata = { title: "Tabela completa" };

export default async function TabelaPage() {
  const matches = await fetchMatches();

  const byDay = new Map<string, typeof matches>();
  for (const m of matches) {
    const k = dateKeyBRT(new Date(m.starts_at));
    const arr = byDay.get(k) ?? [];
    arr.push(m);
    byDay.set(k, arr);
  }
  const days = [...byDay.keys()].sort();
  const totalResolved = matches.filter((m) => m.result !== null).length;

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <PageHeader
        pageLabel="Pág. 4 — A tabela completa"
        subtitle={`72 jogos · ${totalResolved} resolvido${totalResolved === 1 ? "" : "s"}`}
      />

      <div className="sticky top-[57px] z-30 border-b-2 border-ink bg-paper/95 backdrop-blur md:top-[124px]">
        <div className="flex items-center gap-2 px-4 py-2 md:px-9 md:py-2.5">
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-ink2 md:text-[10px] md:tracking-[0.18em]">
            Pular pra
          </span>
          <div className="-mx-1 flex flex-1 snap-x snap-mandatory gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {days.map((d, i) => {
              const dt = new Date(d + "T15:00:00Z");
              const dayMatches = byDay.get(d)!;
              const round = dayMatches[0].round;
              return (
                <a
                  key={d}
                  href={`#dia-${d}`}
                  className="font-cond inline-flex shrink-0 snap-start flex-col items-center gap-0 rounded-sm border-[1.5px] border-line bg-paper px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink hover:border-ink md:text-xs"
                  title={`Dia ${i + 1} · Rodada ${round} · ${dayMatches.length} jogos`}
                >
                  <span>{formatDayBRT(dt)}</span>
                  <span className="font-mono text-[8px] font-normal tracking-[0.1em] text-ink2 md:text-[9px]">
                    R{round} · {dayMatches.length}j
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {days.map((dKey) => {
          const list = byDay.get(dKey)!;
          const dt = new Date(dKey + "T15:00:00Z");
          return (
            <div
              id={`dia-${dKey}`}
              key={dKey}
              className="flex flex-col scroll-mt-4 border-b border-line md:grid md:[grid-template-columns:180px_1fr]"
            >
              <div className="flex flex-col justify-center border-b border-dashed border-line bg-paper2/40 px-4 py-2 md:border-b-0 md:border-r md:bg-transparent md:py-3 md:pl-9">
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-gold md:text-[10px] md:tracking-[0.18em]">
                  {formatDayBRT(dt)}
                </span>
                <span className="font-cond mt-0.5 text-lg font-extrabold leading-none md:text-[26px]">
                  Rodada {list[0].round} · {list.length} jogos
                </span>
              </div>
              <div>
                {list.map((m, i) => {
                  const tA = TEAMS[m.team_a as TeamCode];
                  const tB = TEAMS[m.team_b as TeamCode];
                  const score = m as unknown as { score_a: number | null; score_b: number | null };
                  const hasScore = score.score_a != null && score.score_b != null;
                  return (
                    <div
                      key={m.id}
                      className="grid items-center gap-2 px-4 py-1.5 [grid-template-columns:40px_44px_1.3fr_46px_1.3fr] md:px-7 md:[grid-template-columns:48px_50px_1.4fr_56px_1.4fr_88px]"
                      style={{
                        borderBottom: i === list.length - 1 ? "none" : "1px dashed #d5dde7",
                      }}
                    >
                      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink2 md:text-[10px] md:tracking-[0.1em]">
                        nº {String(m.id).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-[10px] text-ink2 md:text-[11px]">
                        {formatBRT(new Date(m.starts_at))}
                      </span>
                      <div className="flex min-w-0 items-center justify-end gap-1.5">
                        <span
                          className="font-cond truncate text-xs font-semibold md:text-sm"
                          style={{ fontWeight: m.result === "1" ? 800 : 500 }}
                        >
                          {tA.name}
                        </span>
                        <Flag code={m.team_a as TeamCode} name={tA.name} size="sm" />
                      </div>
                      <div className="flex items-center justify-center">
                        {hasScore ? (
                          <span
                            className="font-cond inline-flex items-center gap-0.5 rounded-sm bg-grass px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums text-paper md:text-sm"
                            title="Placar oficial · 90 min"
                          >
                            {score.score_a} <span className="opacity-70">×</span> {score.score_b}
                          </span>
                        ) : (
                          <span className="font-cond text-center text-xs italic text-ink2 md:text-base">
                            vs
                          </span>
                        )}
                      </div>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Flag code={m.team_b as TeamCode} name={tB.name} size="sm" />
                        <span
                          className="font-cond truncate text-xs font-semibold md:text-sm"
                          style={{ fontWeight: m.result === "2" ? 800 : 500 }}
                        >
                          {tB.name}
                        </span>
                      </div>
                      <span className="hidden text-right font-mono text-[10px] text-ink2 md:inline">
                        Grp {m.group_letter}{m.city ? ` · ${m.city.split(" ")[0]}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <PageFooter
        left="Pág. 3 de 6"
        center="placar do tempo normal (90 min) · prorrogação não conta"
        right="todos os horários em BRT"
      />
    </main>
  );
}
