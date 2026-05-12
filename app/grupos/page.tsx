import type { Metadata } from "next";
import { TriRule } from "@/components/boletim/TriRule";
import { Stamp } from "@/components/boletim/Stamp";
import { PageHeader } from "@/components/boletim/PageHeader";
import { PageFooter } from "@/components/boletim/PageFooter";
import { Flag } from "@/components/Flag";
import { GROUPS, TEAMS, type TeamCode } from "@/lib/static-data";
import { fetchMatches } from "@/lib/db";
import { computeGroupStandings } from "@/lib/standings";

export const metadata: Metadata = { title: "Os doze grupos" };
export const revalidate = 60;

export default async function GruposPage() {
  const matches = await fetchMatches();
  const anyResolved = matches.some((m) => m.result !== null);

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <TriRule height={3} />
      <PageHeader pageLabel="Pág. 2 — Os doze grupos" subtitle="48 seleções · sorteio simulado" />

      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 md:gap-3 md:px-9 md:py-4">
        <h2 className="font-cond m-0 text-2xl font-extrabold uppercase leading-none tracking-tight md:text-4xl">
          Quem joga com quem
        </h2>
        <Stamp color="#0b6b3a" rot={-2}>Brasil no D</Stamp>
        <Stamp color="#0b2c5c" rot={3}>
          {anyResolved ? "Classificação ao vivo" : "Aguardando jogos"}
        </Stamp>
      </div>

      <div className="grid flex-1 min-h-0 grid-cols-2 gap-2 px-3 py-3 md:grid-cols-4 md:gap-3 md:px-7 md:py-4">
        {GROUPS.map((g) => {
          const hasBR = g.teams.includes("BRA");
          const standings = computeGroupStandings(g, matches);
          return (
            <div
              key={g.letter}
              className="relative flex flex-col gap-1.5 overflow-hidden border-[1.5px] border-ink bg-white/55 px-3 py-2.5"
            >
              {hasBR && (
                <TriRule
                  height={3}
                  style={{ position: "absolute", top: 0, left: 0, right: 0, width: "auto" }}
                />
              )}
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
                    Grupo
                  </span>
                  <span
                    className="font-cond text-[32px] font-extrabold leading-[0.8] tracking-tight"
                    style={{ color: hasBR ? "#0b6b3a" : "#0b2c5c" }}
                  >
                    {g.letter}
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink2">
                  6 jogos
                </span>
              </div>
              <div className="mt-0.5 flex flex-col gap-1">
                {standings.map((s, i) => {
                  const t = TEAMS[s.code as TeamCode];
                  const isBR = s.code === "BRA";
                  const isClassified = i < 2; // 2 primeiros classificam
                  return (
                    <div
                      key={s.code}
                      className="grid items-center gap-1 text-[12px]"
                      style={{
                        gridTemplateColumns: "auto auto 1fr auto",
                        fontWeight: isClassified ? 700 : 500,
                        color: isBR ? "#0b6b3a" : "#0b2c5c",
                      }}
                    >
                      <span
                        className="font-mono text-[10px] text-ink2"
                        title={isClassified ? "classificado" : ""}
                      >
                        {i + 1}º
                      </span>
                      <Flag code={s.code as TeamCode} name={t.name} />
                      <span className="font-cond truncate uppercase tracking-[0.01em]">
                        {t.name}
                      </span>
                      <span
                        className="font-mono text-[10px] tabular-nums"
                        title={`${s.points} pts · ${s.played} jogos · saldo ${s.gd >= 0 ? "+" : ""}${s.gd}`}
                        style={{
                          color: s.played > 0 ? (isBR ? "#0b6b3a" : "#0b2c5c") : "#5a6a86",
                        }}
                      >
                        {s.points}
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
        left="Pág. 2 de 6"
        center="3 pts vitória · 1 pt empate · classificação ao vivo"
        right="passam 2 por grupo"
      />
    </main>
  );
}
