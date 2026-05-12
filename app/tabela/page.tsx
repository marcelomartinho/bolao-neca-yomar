import type { Metadata } from "next";
import { TriRule } from "@/components/boletim/TriRule";
import { PageHeader } from "@/components/boletim/PageHeader";
import { PageFooter } from "@/components/boletim/PageFooter";
import { Flag } from "@/components/Flag";
import {
  MATCHES,
  TEAMS,
  dateKeyBRT,
  formatBRT,
  formatDayBRT,
} from "@/lib/static-data";

export const revalidate = 300;
export const metadata: Metadata = { title: "Tabela completa" };

export default function TabelaPage() {
  const byDay = new Map<string, typeof MATCHES>();
  for (const m of MATCHES) {
    const k = dateKeyBRT(m.startsAt);
    const arr = byDay.get(k) ?? [];
    arr.push(m);
    byDay.set(k, arr);
  }
  const days = [...byDay.keys()].sort();

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <TriRule height={3} />
      <PageHeader
        pageLabel="Pág. 4 — A tabela completa"
        subtitle="72 jogos · horários em Brasília"
      />

      <div className="flex flex-wrap items-center gap-1.5 border-b border-line px-4 py-2.5 md:gap-2 md:px-9 md:py-3">
        <span className="mr-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink2 md:text-[10px] md:tracking-[0.18em]">
          Dias
        </span>
        {days.map((d) => {
          const dt = new Date(d + "T15:00:00Z");
          return (
            <a
              key={d}
              href={`#dia-${d}`}
              className="font-cond border border-line bg-transparent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink hover:border-ink md:px-2.5 md:text-xs"
            >
              {formatDayBRT(dt)}
            </a>
          );
        })}
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
                {list.map((m, i) => (
                  <div
                    key={m.id}
                    className="grid items-center gap-2 px-4 py-1.5 [grid-template-columns:40px_44px_1.3fr_22px_1.3fr] md:px-7 md:[grid-template-columns:48px_50px_1.4fr_32px_1.4fr_88px]"
                    style={{
                      borderBottom: i === list.length - 1 ? "none" : "1px dashed #d5dde7",
                    }}
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-ink2 md:text-[10px] md:tracking-[0.1em]">
                      nº {String(m.id).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] text-ink2 md:text-[11px]">
                      {formatBRT(m.startsAt)}
                    </span>
                    <div className="flex min-w-0 items-center justify-end gap-1.5">
                      <span className="font-cond truncate text-xs font-semibold md:text-sm">
                        {TEAMS[m.a].name}
                      </span>
                      <Flag code={m.a} name={TEAMS[m.a].name} size="sm" />
                    </div>
                    <span className="font-cond text-center text-xs italic text-ink2 md:text-base">
                      vs
                    </span>
                    <div className="flex min-w-0 items-center gap-1.5">
                      <Flag code={m.b} name={TEAMS[m.b].name} size="sm" />
                      <span className="font-cond truncate text-xs font-semibold md:text-sm">
                        {TEAMS[m.b].name}
                      </span>
                    </div>
                    <span className="hidden text-right font-mono text-[10px] text-ink2 md:inline">
                      Grp {m.group} · {m.city.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <PageFooter
        left="Pág. 4 de 6"
        center="72 jogos · 16 dias · 11 jun → 26 jun 2026"
        right="todos os horários em BRT"
      />
    </main>
  );
}
