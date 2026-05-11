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

      <div className="flex flex-wrap items-center gap-2 border-b border-line px-9 py-3">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
          Dias
        </span>
        {days.map((d) => {
          const dt = new Date(d + "T15:00:00Z");
          return (
            <a
              key={d}
              href={`#dia-${d}`}
              className="font-cond border border-line bg-transparent px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ink hover:border-ink"
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
              className="grid border-b border-line scroll-mt-4"
              style={{ gridTemplateColumns: "180px 1fr" }}
            >
              <div className="flex flex-col justify-center border-r border-dashed border-line px-4 py-3 pl-9">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                  {formatDayBRT(dt)}
                </span>
                <span className="font-cond mt-0.5 text-[26px] font-extrabold leading-none">
                  Rodada {list[0].round} · {list.length} jogos
                </span>
              </div>
              <div>
                {list.map((m, i) => (
                  <div
                    key={m.id}
                    className="grid items-center gap-2 px-7 py-1.5"
                    style={{
                      gridTemplateColumns: "48px 50px 1.2fr 60px 1.2fr 88px",
                      borderBottom: i === list.length - 1 ? "none" : "1px dashed #d5dde7",
                    }}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink2">
                      nº {String(m.id).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[11px] text-ink2">
                      {formatBRT(m.startsAt)}
                    </span>
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-cond text-sm font-semibold">{TEAMS[m.a].name}</span>
                      <Flag colors={TEAMS[m.a].colors} />
                    </div>
                    <div className="flex justify-center gap-0.5">
                      {(["1", "X", "2"] as const).map((v) => (
                        <span
                          key={v}
                          className="font-cond flex h-[18px] w-[18px] items-center justify-center border border-line text-[10px] font-bold text-ink2"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Flag colors={TEAMS[m.b].colors} />
                      <span className="font-cond text-sm font-semibold">{TEAMS[m.b].name}</span>
                    </div>
                    <span className="text-right font-mono text-[10px] text-ink2">
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
