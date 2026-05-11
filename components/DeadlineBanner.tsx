"use client";

import { useEffect, useState } from "react";

type Props = {
  deadlineIso: string | null;
};

function diff(target: number, now: number) {
  const ms = target - now;
  if (ms <= 0) return { closed: true, d: 0, h: 0, m: 0, s: 0 };
  const s = Math.floor(ms / 1000);
  return {
    closed: false,
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function DeadlineBanner({ deadlineIso }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!deadlineIso) {
    return (
      <div className="border-y border-line bg-paper2/60 px-5 py-2 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
          Palpites abertos · sem prazo definido
        </span>
      </div>
    );
  }
  const target = new Date(deadlineIso).getTime();
  const r = diff(target, now);
  const label = new Date(deadlineIso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  if (r.closed) {
    return (
      <div className="border-y-2 border-red-700 bg-red-50/70 px-5 py-2 text-center">
        <span className="font-cond text-sm font-bold uppercase tracking-wider text-red-800">
          Palpites encerrados · prazo era {label} BRT
        </span>
      </div>
    );
  }
  return (
    <div className="bg-grass/10 border-grass/30 flex flex-wrap items-center justify-center gap-3 border-y px-5 py-2 text-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
        Palpites abertos até
      </span>
      <span className="font-cond text-sm font-bold uppercase tracking-wider text-ink">
        {label} BRT
      </span>
      <span className="font-mono text-[11px] text-grass">
        {r.d > 0 && <>{r.d}d </>}
        {String(r.h).padStart(2, "0")}h{String(r.m).padStart(2, "0")}m{String(r.s).padStart(2, "0")}s
      </span>
    </div>
  );
}
