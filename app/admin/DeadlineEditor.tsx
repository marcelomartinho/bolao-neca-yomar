"use client";

import { useState, useTransition } from "react";
import { setPicksDeadline } from "./actions";
import { formatDeadlineBRT } from "@/lib/format";

type Props = {
  initialDeadline: string | null;
};

// Converte ISO UTC pra valor datetime-local em BRT (sem timezone).
function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  // Convert to BRT (UTC-3) manually
  const brtMs = d.getTime() - 3 * 60 * 60 * 1000;
  return new Date(brtMs).toISOString().slice(0, 16);
}

function localInputToIso(local: string): string | null {
  if (!local) return null;
  // local is "YYYY-MM-DDTHH:mm" in BRT timezone; add :00-03:00
  return new Date(local + ":00-03:00").toISOString();
}

export function DeadlineEditor({ initialDeadline }: Props) {
  const [value, setValue] = useState(isoToLocalInput(initialDeadline));
  const [savedAt, setSavedAt] = useState<string | null>(initialDeadline);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const iso = value ? localInputToIso(value) : null;
      const r = await setPicksDeadline(iso);
      if (!r.ok) setError(r.error);
      else setSavedAt(iso);
    });
  }

  function clear() {
    setValue("");
    setError(null);
    startTransition(async () => {
      const r = await setPicksDeadline(null);
      if (!r.ok) setError(r.error);
      else setSavedAt(null);
    });
  }

  const now = Date.now();
  const closed = savedAt && new Date(savedAt).getTime() <= now;

  return (
    <div className="relative border-2 border-ink bg-white/55 px-5 py-4">
      <div className="flex items-baseline justify-between border-b border-dashed border-line pb-2">
        <span className="font-cond text-sm font-bold uppercase tracking-[0.12em] text-gold">
          Prazo de palpites
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
          Definido pelo host
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
            Data e hora limite (BRT)
          </span>
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={pending}
            className="border-ink mt-1 border-2 bg-white/70 px-3 py-2 font-mono text-sm focus:outline-none focus:border-grass"
          />
        </label>
        <button
          onClick={save}
          disabled={pending}
          className="font-cond inline-flex items-center gap-2 rounded-sm border-2 border-grass bg-grass px-4 py-2 text-xs font-bold uppercase tracking-wider text-paper disabled:opacity-50"
        >
          Salvar prazo
        </button>
        {savedAt && (
          <button
            onClick={clear}
            disabled={pending}
            className="font-cond inline-flex items-center gap-2 rounded-sm border-2 border-ink bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink disabled:opacity-50"
          >
            Limpar (sem prazo)
          </button>
        )}
      </div>

      <p className="mt-3 text-sm text-ink2">
        {savedAt ? (
          <>
            {closed ? "Palpites fechados desde " : "Palpites abertos até "}
            <strong className={closed ? "text-red-700" : "text-grass"}>
              {formatDeadlineBRT(savedAt)}
            </strong>
            .
          </>
        ) : (
          <>Sem prazo definido — palpites abertos a qualquer hora.</>
        )}
      </p>

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
