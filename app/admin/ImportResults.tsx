"use client";

import { useState, useTransition } from "react";
import { importOfficialResults, type ImportResult, type ImportScope } from "./actions";

type MatchOpt = { id: number; team_a: string; team_b: string; round: number };
type Props = { matches: MatchOpt[] };

type Mode = "all" | "round" | "match";

export function ImportResults({ matches }: Props) {
  const [mode, setMode] = useState<Mode>("all");
  const [round, setRound] = useState<number>(1);
  const [matchId, setMatchId] = useState<number>(matches[0]?.id ?? 1);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setResult(null);
    const scope: ImportScope =
      mode === "all"
        ? { mode: "all" }
        : mode === "round"
          ? { mode: "round", round }
          : { mode: "match", matchId };
    startTransition(async () => {
      const r = await importOfficialResults(scope);
      setResult(r);
    });
  }

  return (
    <section className="border-t border-line px-4 py-5 md:px-9 md:py-6">
      <div className="flex items-baseline gap-3">
        <span className="font-cond text-xl font-extrabold uppercase tracking-tight text-grass">
          Resultados oficiais
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
          fonte: openfootball · grátis
        </span>
      </div>
      <p className="mt-2 max-w-[640px] text-[13px] text-ink2">
        Busca o placar oficial dos jogos <strong>já finalizados</strong> e preenche automaticamente.
        Jogos sem resultado ainda são ignorados. Se a busca falhar, nada é preenchido.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">Escopo</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="border-ink mt-1 block w-full border-2 bg-white px-3 py-2 text-sm focus:border-grass focus:outline-none"
          >
            <option value="all">Tudo (todos os jogos)</option>
            <option value="round">Por rodada</option>
            <option value="match">Por jogo</option>
          </select>
        </label>

        {mode === "round" && (
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">Rodada</span>
            <select
              value={round}
              onChange={(e) => setRound(Number(e.target.value))}
              className="border-ink mt-1 block border-2 bg-white px-3 py-2 text-sm focus:border-grass focus:outline-none"
            >
              <option value={1}>Rodada 1</option>
              <option value={2}>Rodada 2</option>
              <option value={3}>Rodada 3</option>
            </select>
          </label>
        )}

        {mode === "match" && (
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">Jogo</span>
            <select
              value={matchId}
              onChange={(e) => setMatchId(Number(e.target.value))}
              className="border-ink mt-1 block border-2 bg-white px-3 py-2 text-sm focus:border-grass focus:outline-none"
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  J{m.id} · {m.team_a}×{m.team_b} (R{m.round})
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="bg-grass border-grass text-paper font-cond inline-flex min-h-[44px] items-center gap-2 rounded-sm border-2 px-4 py-2 text-sm font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Buscando…" : "Buscar e preencher"}
        </button>
      </div>

      {result && !result.ok && (
        <div className="mt-4 border-2 border-red-700 bg-white px-3 py-2 text-sm text-red-800">
          {result.error}
        </div>
      )}

      {result && result.ok && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.1em]">
            <span className="text-grass">✓ {result.filled} preenchidos</span>
            <span className="text-ink2">– {result.skipped} pulados</span>
            <span className={result.errors > 0 ? "text-red-700" : "text-ink2"}>
              ✗ {result.errors} erros
            </span>
          </div>
          {result.rows.length > 0 && (
            <div className="mt-3 max-h-64 overflow-y-auto border border-line bg-white/60">
              {result.rows.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 border-b border-dashed border-line px-3 py-1.5 text-[12.5px] last:border-b-0"
                >
                  <span className="font-mono">{r.label}</span>
                  <span
                    style={{
                      color:
                        r.status === "filled"
                          ? "#0b6b3a"
                          : r.status === "error"
                            ? "#a44"
                            : "#5a6a86",
                    }}
                  >
                    {r.detail}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
