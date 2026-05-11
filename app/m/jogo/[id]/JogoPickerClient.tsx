"use client";

import { useState, useTransition } from "react";
import type { Pick } from "@/lib/supabase/types";
import { savePick } from "@/app/m/palpite/actions";

type Props = {
  matchId: number;
  teamAName: string;
  teamBName: string;
  initialPick: Pick | null;
};

export function JogoPickerClient({ matchId, teamAName, teamBName, initialPick }: Props) {
  const [pick, setPick] = useState<Pick | null>(initialPick);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function choose(v: Pick) {
    const prev = pick;
    setPick(v);
    setError(null);
    startTransition(async () => {
      const r = await savePick(matchId, v);
      if (!r.ok) {
        setError(r.error);
        setPick(prev);
      }
    });
  }

  return (
    <div className="mt-7">
      <div className="tag mb-2">Seu palpite</div>
      <div className="grid grid-cols-3 gap-2">
        {([
          { v: "1" as Pick, label: teamAName },
          { v: "X" as Pick, label: "Empate" },
          { v: "2" as Pick, label: teamBName },
        ]).map((opt) => {
          const isSel = pick === opt.v;
          return (
            <button
              key={opt.v}
              onClick={() => choose(opt.v)}
              className="font-cond flex flex-col items-center gap-1 rounded-sm border-2 px-3 py-3"
              style={{
                borderColor: isSel ? "#0b6b3a" : "#0b2c5c",
                background: isSel ? "#0b6b3a" : "transparent",
                color: isSel ? "#fff" : "#0b2c5c",
              }}
            >
              <span className="text-2xl font-extrabold">{opt.v}</span>
              <span className="font-mono text-[9px] uppercase tracking-wider">{opt.label}</span>
            </button>
          );
        })}
      </div>
      {error && <div className="mt-2 text-xs text-red-700">{error}</div>}
      {pick && !error && (
        <div className="text-ink2 mt-2 text-xs">Auto-salvo. Pode trocar até 30 min antes do apito.</div>
      )}
    </div>
  );
}
