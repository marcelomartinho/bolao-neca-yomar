import { TriRule } from "@/components/boletim/TriRule";
import { Stamp } from "@/components/boletim/Stamp";
import { PageHeader } from "@/components/boletim/PageHeader";
import { PageFooter } from "@/components/boletim/PageFooter";
import { Flag } from "@/components/Flag";
import { GROUPS, TEAMS } from "@/lib/static-data";

export default function GruposPage() {
  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <TriRule height={3} />
      <PageHeader pageLabel="Pág. 2 — Os doze grupos" subtitle="48 seleções · sorteio simulado" />

      <div className="flex items-center gap-3 border-b border-line px-9 py-4">
        <h2 className="font-cond m-0 text-4xl font-extrabold uppercase leading-none tracking-tight">
          Quem joga com quem
        </h2>
        <Stamp color="#0b6b3a" rot={-2}>Brasil no D</Stamp>
        <Stamp color="#0b2c5c" rot={3}>Sorteio dez/2025</Stamp>
      </div>

      <div
        className="grid flex-1 min-h-0 gap-3 px-7 py-4"
        style={{ gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(3, 1fr)" }}
      >
        {GROUPS.map((g) => {
          const hasBR = g.teams.includes("BRA");
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
                {g.teams.map((code, i) => {
                  const t = TEAMS[code];
                  const isBR = code === "BRA";
                  return (
                    <div
                      key={code}
                      className="flex items-center gap-2 text-[12.5px]"
                      style={{
                        fontWeight: i === 0 ? 700 : 500,
                        color: isBR ? "#0b6b3a" : "#0b2c5c",
                      }}
                    >
                      <Flag colors={t.colors} />
                      <span className="font-cond flex-1 uppercase tracking-[0.01em]">
                        {t.name}
                      </span>
                      <span className="font-mono text-[10px] text-ink2">
                        {["A", "B", "C", "D"][i]}
                        {g.letter}
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
        center="passam as duas seleções por grupo · 8º de final começa em 28/jun"
        right="boletim · vol. ii"
      />
    </main>
  );
}
