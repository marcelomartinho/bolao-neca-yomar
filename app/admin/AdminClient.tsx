"use client";

import { useState, useTransition } from "react";
import { Flag } from "@/components/Flag";
import { TEAMS } from "@/lib/static-data";
import type { MatchRow } from "@/lib/db";
import { setMatchScore, setMatchResult } from "./actions";

type Props = {
  matches: MatchRow[];
  orgName: string;
};

type ScorePair = { a: string; b: string };

function toState(matches: MatchRow[]): Record<number, ScorePair> {
  const o: Record<number, ScorePair> = {};
  for (const m of matches) {
    const row = m as unknown as { score_a: number | null; score_b: number | null };
    o[m.id] = {
      a: row.score_a == null ? "" : String(row.score_a),
      b: row.score_b == null ? "" : String(row.score_b),
    };
  }
  return o;
}

export function AdminClient({ matches, orgName }: Props) {
  const [scores, setScores] = useState<Record<number, ScorePair>>(() => toState(matches));
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [errorByMatch, setErrorByMatch] = useState<Record<number, string>>({});
  const [, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  const counts = matches.reduce(
    (acc, m) => {
      const filled = scores[m.id]?.a !== "" && scores[m.id]?.b !== "";
      const k = filled || m.result ? "closed" : "open";
      acc[k]++;
      return acc;
    },
    { open: 0, closed: 0 },
  );

  const visible = matches.filter((m) => {
    if (filter === "all") return true;
    const filled = scores[m.id]?.a !== "" && scores[m.id]?.b !== "";
    const isClosed = filled || !!m.result;
    return filter === "open" ? !isClosed : isClosed;
  });

  function updateLocal(matchId: number, side: "a" | "b", value: string) {
    setScores((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [side]: value.replace(/[^0-9]/g, "").slice(0, 2) },
    }));
  }

  function save(matchId: number) {
    const cur = scores[matchId];
    setPendingId(matchId);
    setErrorByMatch((e) => ({ ...e, [matchId]: "" }));
    startTransition(async () => {
      const a = cur.a === "" ? null : Number(cur.a);
      const b = cur.b === "" ? null : Number(cur.b);
      const r = await setMatchScore(matchId, a, b);
      setPendingId(null);
      if (!r.ok) setErrorByMatch((e) => ({ ...e, [matchId]: r.error }));
    });
  }

  function clear(matchId: number) {
    setScores((prev) => ({ ...prev, [matchId]: { a: "", b: "" } }));
    setPendingId(matchId);
    setErrorByMatch((e) => ({ ...e, [matchId]: "" }));
    startTransition(async () => {
      await setMatchResult(matchId, null);
      setPendingId(null);
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-9 py-4">
        <div className="flex flex-col">
          <span className="tag">Organização</span>
          <span className="font-cond text-2xl font-extrabold uppercase">{orgName}</span>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
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
              {f === "all"
                ? `Todos ${matches.length}`
                : f === "open"
                  ? `Abertos ${counts.open}`
                  : `Fechados ${counts.closed}`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 md:px-9">
        <div className="hidden md:grid md:grid-cols-[56px_44px_1fr_140px_1fr_64px_140px] md:items-center md:border-b md:border-line md:px-3 md:py-2 md:font-mono md:text-[10px] md:uppercase md:tracking-[0.14em] md:text-ink2">
          <span>Jogo</span>
          <span>Grp</span>
          <span className="text-right">Mandante</span>
          <span className="text-center">Placar (90 min)</span>
          <span>Visitante</span>
          <span className="text-center">1/X/2</span>
          <span className="text-right">Apito</span>
        </div>

        {visible.map((m) => {
          const tA = TEAMS[m.team_a as keyof typeof TEAMS];
          const tB = TEAMS[m.team_b as keyof typeof TEAMS];
          const pair = scores[m.id] ?? { a: "", b: "" };
          const both = pair.a !== "" && pair.b !== "";
          const derived = both
            ? Number(pair.a) > Number(pair.b)
              ? "1"
              : Number(pair.a) < Number(pair.b)
                ? "2"
                : "X"
            : null;
          const isSaving = pendingId === m.id;
          const err = errorByMatch[m.id];

          return (
            <div
              key={m.id}
              className="grid grid-cols-1 items-center gap-2 border-b border-dashed border-line px-3 py-3 md:grid-cols-[56px_44px_1fr_140px_1fr_64px_140px]"
              style={{ opacity: isSaving ? 0.6 : 1 }}
            >
              <span className="font-mono text-[11px] text-ink2">
                Nº {String(m.id).padStart(2, "0")}
              </span>
              <span className="font-cond text-base font-bold">{m.group_letter}</span>
              <div className="flex items-center justify-end gap-2 text-[13px]">
                <span style={{ fontWeight: derived === "1" ? 700 : 500 }}>{tA.name}</span>
                <Flag code={tA.code} name={tA.name} />
              </div>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pair.a}
                  onChange={(e) => updateLocal(m.id, "a", e.target.value)}
                  onBlur={() => {
                    if ((pair.a !== "" && pair.b !== "") || (pair.a === "" && pair.b === "")) {
                      save(m.id);
                    }
                  }}
                  disabled={isSaving}
                  placeholder="0"
                  className="font-cond border-ink w-12 border-2 bg-white/70 px-2 py-1 text-center text-base font-bold focus:border-grass focus:outline-none"
                />
                <span className="font-cond font-bold text-ink2">x</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pair.b}
                  onChange={(e) => updateLocal(m.id, "b", e.target.value)}
                  onBlur={() => {
                    if ((pair.a !== "" && pair.b !== "") || (pair.a === "" && pair.b === "")) {
                      save(m.id);
                    }
                  }}
                  disabled={isSaving}
                  placeholder="0"
                  className="font-cond border-ink w-12 border-2 bg-white/70 px-2 py-1 text-center text-base font-bold focus:border-grass focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <Flag code={tB.code} name={tB.name} />
                <span style={{ fontWeight: derived === "2" ? 700 : 500 }}>{tB.name}</span>
              </div>
              <div className="text-center">
                {derived ? (
                  <span
                    className="font-cond inline-flex h-7 w-7 items-center justify-center border-2 text-sm font-extrabold"
                    style={{
                      borderColor: "#0b6b3a",
                      background: "#0b6b3a",
                      color: "#fff",
                    }}
                  >
                    {derived}
                  </span>
                ) : (
                  <span className="font-mono text-[11px] text-ink2">—</span>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="font-mono text-[11px] text-ink2">
                  {new Date(m.starts_at).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {both && (
                  <button
                    onClick={() => clear(m.id)}
                    disabled={isSaving}
                    className="font-cond text-[10px] font-bold uppercase tracking-wider text-red-700 underline-offset-2 hover:underline"
                    title="Limpar placar"
                  >
                    Limpar
                  </button>
                )}
              </div>
              {err && (
                <div className="col-span-full text-xs text-red-700 md:col-span-7">{err}</div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
