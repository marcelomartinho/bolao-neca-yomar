"use client";

import { useState, useTransition } from "react";
import { Flag } from "@/components/Flag";
import { TEAMS } from "@/lib/static-data";
import type { MatchRow } from "@/lib/db";
import type { Pick } from "@/lib/supabase/types";
import { setMatchResult } from "./actions";

type Props = {
  matches: MatchRow[];
  orgName: string;
};

export function AdminClient({ matches, orgName }: Props) {
  const [results, setResults] = useState<Record<number, Pick | null>>(() => {
    const o: Record<number, Pick | null> = {};
    for (const m of matches) o[m.id] = m.result;
    return o;
  });
  const [pending, setPending] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  const counts = matches.reduce(
    (acc, m) => {
      const k = m.result ? "closed" : "open";
      acc[k]++;
      return acc;
    },
    { open: 0, closed: 0 },
  );

  const visible = matches.filter((m) =>
    filter === "all" ? true : filter === "open" ? !m.result : !!m.result,
  );

  function setResult(matchId: number, value: Pick | null) {
    const prev = results[matchId];
    setResults({ ...results, [matchId]: value });
    setPending(matchId);
    startTransition(async () => {
      const r = await setMatchResult(matchId, value);
      setPending(null);
      if (!r.ok) {
        setResults((s) => ({ ...s, [matchId]: prev }));
        alert("Erro: " + r.error);
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-line px-9 py-4">
        <div className="flex flex-col">
          <span className="tag">Organização</span>
          <span className="font-cond text-2xl font-extrabold uppercase">{orgName}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="tag mr-1">Filtrar</span>
          {(["all", "open", "closed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="font-cond border-[1.5px] px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
              style={{
                borderColor: filter === f ? "#0b2c5c" : "#d5dde7",
                background: filter === f ? "#0b2c5c" : "transparent",
                color: filter === f ? "#fff" : "#0b2c5c",
              }}
            >
              {f === "all" ? `Todos ${matches.length}` : f === "open" ? `Abertos ${counts.open}` : `Fechados ${counts.closed}`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-9 py-4">
        <div className="grid grid-cols-[60px_60px_1fr_1fr_1fr_220px] items-center border-b border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink2">
          <span>Jogo</span>
          <span>Grp</span>
          <span className="text-right">Mandante</span>
          <span className="text-center">Resultado</span>
          <span>Visitante</span>
          <span className="text-right">Apito</span>
        </div>
        {visible.map((m) => {
          const tA = TEAMS[m.team_a as keyof typeof TEAMS];
          const tB = TEAMS[m.team_b as keyof typeof TEAMS];
          const result = results[m.id];
          const isSaving = pending === m.id;
          return (
            <div
              key={m.id}
              className="grid grid-cols-[60px_60px_1fr_1fr_1fr_220px] items-center border-b border-dashed border-line px-3 py-2"
              style={{ opacity: isSaving ? 0.6 : 1 }}
            >
              <span className="font-mono text-[11px] text-ink2">
                Nº {String(m.id).padStart(2, "0")}
              </span>
              <span className="font-cond text-base font-bold">{m.group_letter}</span>
              <div className="flex items-center justify-end gap-2 text-[13px]">
                <span style={{ fontWeight: result === "1" ? 700 : 500 }}>{tA.name}</span>
                <Flag code={tA.code} name={tA.name} />
              </div>
              <div className="flex justify-center gap-1">
                {(["1", "X", "2"] as const).map((v) => {
                  const isSel = result === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setResult(m.id, isSel ? null : v)}
                      disabled={isSaving}
                      className="font-cond border-[1.5px] px-2 py-0.5 text-xs font-bold"
                      style={{
                        borderColor: isSel ? "#0b6b3a" : "#0b2c5c",
                        background: isSel ? "#0b6b3a" : "transparent",
                        color: isSel ? "#fff" : "#0b2c5c",
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <Flag code={tB.code} name={tB.name} />
                <span style={{ fontWeight: result === "2" ? 700 : 500 }}>{tB.name}</span>
              </div>
              <span className="text-right font-mono text-[11px] text-ink2">
                {new Date(m.starts_at).toLocaleString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
