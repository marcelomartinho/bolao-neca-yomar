"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TriRule } from "@/components/boletim/TriRule";
import { BBrand } from "@/components/boletim/BBrand";
import { Flag } from "@/components/Flag";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { DeadlineBanner } from "@/components/DeadlineBanner";
import type { Pick } from "@/lib/supabase/types";
import type { MatchRow } from "@/lib/db";
import type { ManagedProfile } from "@/lib/active-profile";
import { TEAMS } from "@/lib/static-data";
import { savePick } from "./actions";

const GROUP_COLORS: Record<string, string> = {
  A: "#0b6b3a", B: "#c79410", C: "#0b2c5c", D: "#0b6b3a",
  E: "#c79410", F: "#0b2c5c", G: "#0b6b3a", H: "#c79410",
  I: "#0b2c5c", J: "#0b6b3a", K: "#c79410", L: "#0b2c5c",
};

type Props = {
  matches: MatchRow[];
  initialPicks: Record<number, Pick>;
  email: string;
  deadlineIso?: string | null;
  open?: boolean;
  profiles?: ManagedProfile[];
  activeProfileId?: string;
};

export function PalpiteClient({
  matches,
  initialPicks,
  email,
  deadlineIso,
  open = true,
  profiles = [],
  activeProfileId,
}: Props) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);
  // Optimistic active id for the toolbar highlight during the round-trip
  const [optimisticActiveId, setOptimisticActiveId] = useState(activeProfileId);

  // Reset local pick state whenever the server gives us new picks for the
  // active profile (após switch + router.refresh).
  useEffect(() => {
    setPicks(initialPicks);
    setSavingMatchId(null);
    setError(null);
    setOptimisticActiveId(activeProfileId);
    setSwitching(false);
    // initialPicks identity changes per render; key by activeProfileId only
    // so we don't thrash. eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId]);

  async function switchActive(id: string) {
    if (id === optimisticActiveId) return;
    setOptimisticActiveId(id);
    setSwitching(true);
    try {
      const res = await fetch("/api/active-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: id }),
      });
      if (!res.ok) {
        setSwitching(false);
        setOptimisticActiveId(activeProfileId);
        setError("Não foi possível trocar de perfil.");
        return;
      }
      router.refresh();
    } catch {
      setSwitching(false);
      setOptimisticActiveId(activeProfileId);
      setError("Falha de rede ao trocar de perfil.");
    }
  }

  const [picks, setPicks] = useState<Record<number, Pick>>(initialPicks);
  const [savingMatchId, setSavingMatchId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filled = matches.filter((m) => picks[m.id]).length;

  function Spinner({ big = false }: { big?: boolean }) {
    const s = big ? 18 : 12;
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        style={{ animation: "spin 0.7s linear infinite" }}
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path
          d="M21 12a9 9 0 0 1-9 9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </svg>
    );
  }

  function setPick(matchId: number, value: Pick) {
    if (!open) {
      setError("Palpites encerrados.");
      return;
    }
    if (switching) return;
    const prev = picks[matchId];
    setPicks({ ...picks, [matchId]: value });
    setSavingMatchId(matchId);
    setError(null);
    startTransition(async () => {
      const result = await savePick(matchId, value);
      setSavingMatchId(null);
      if (!result.ok) {
        setError(result.error);
        // revert
        setPicks((p) => {
          const c = { ...p };
          if (prev) c[matchId] = prev;
          else delete c[matchId];
          return c;
        });
      }
    });
  }

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <div className="flex items-center justify-between border-b-2 border-ink px-5 py-2.5">
        <BBrand size={16} />
        <span className="tag">Cartela</span>
      </div>
      <TriRule height={2} />
      <DeadlineBanner deadlineIso={deadlineIso ?? null} />

      {/* Export card (visible above the fold) */}
      <div className="border-b border-line bg-paper2/30 px-4 py-3 md:px-9">
        <div className="relative flex flex-wrap items-center gap-3 border-2 border-ink bg-white/60 px-3 py-3 md:px-4">
          <TriRule
            height={3}
            style={{ position: "absolute", top: -2, left: -2, right: -2, width: "auto" }}
          />
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold">
              Exportar minha cartela
            </span>
            <span className="font-cond text-sm font-bold uppercase text-ink">
              PDF pra imprimir · Excel pra conferir
            </span>
          </div>
          <a
            href="/m/cartela/pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-cond inline-flex min-h-[44px] items-center gap-2 rounded-sm border-2 border-grass bg-grass px-4 py-2 text-sm font-bold uppercase tracking-wider text-paper"
          >
            <Icon.Download s={16} /> PDF
          </a>
          <a
            href="/m/cartela/csv"
            className="font-cond inline-flex min-h-[44px] items-center gap-2 rounded-sm border-2 border-ink bg-transparent px-4 py-2 text-sm font-bold uppercase tracking-wider text-ink"
          >
            <Icon.Download s={16} /> Excel
          </a>
        </div>
      </div>

      {profiles.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-paper2/40 px-4 py-2">
          <span className="tag">Palpitando como</span>
          {profiles.map((p) => {
            const sel = p.id === optimisticActiveId;
            const isPendingThis = switching && sel;
            return (
              <button
                key={p.id}
                onClick={() => switchActive(p.id)}
                disabled={switching}
                className="font-cond inline-flex items-center gap-1.5 rounded-sm border-[1.5px] px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-opacity"
                style={{
                  borderColor: sel ? "#0b6b3a" : "#d5dde7",
                  background: sel ? "#0b6b3a" : "transparent",
                  color: sel ? "#fbfaf4" : "#0b2c5c",
                  opacity: switching && !sel ? 0.4 : 1,
                }}
              >
                <Avatar
                  name={p.name}
                  initials={p.initials}
                  emoji={p.emoji}
                  size={20}
                />
                {p.name}
                {p.is_kid && <span className="text-[10px] opacity-75">🧒</span>}
                {isPendingThis && <Spinner />}
              </button>
            );
          })}
          <Link
            href="/m/familia"
            className="font-mono ml-auto text-[10px] uppercase tracking-[0.18em] text-ink2 underline-offset-4 hover:underline"
          >
            Gerenciar família →
          </Link>
        </div>
      )}

      <div className="border-b border-line px-5 py-3.5">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="tag">Sessão de {email}</div>
            <h2 className="font-cond mt-0.5 text-3xl font-extrabold uppercase leading-[0.95] tracking-tight">
              Próximos <span className="text-grass">{matches.length}</span>{" "}
              <span className="font-normal text-ink2">jogos</span>
            </h2>
          </div>
          <div className="text-right">
            <div className="tag">Palpitados</div>
            <div
              className={`font-cond text-[28px] font-extrabold leading-none ${
                filled === matches.length ? "text-grass" : "text-ink"
              }`}
            >
              {filled}
              <span className="font-semibold text-ink2">/{matches.length}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-1">
          {matches.map((m) => (
            <div
              key={m.id}
              className="h-1 flex-1 rounded-sm"
              style={{ background: picks[m.id] ? "#0b6b3a" : "#d5dde7" }}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="border-b border-red-700 bg-red-50 px-5 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="relative flex-1 overflow-auto px-4 py-3.5">
        {switching && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center bg-paper/70 pt-12 backdrop-blur-[1px]">
            <div className="border-grass flex items-center gap-3 border-2 bg-paper px-4 py-2.5 shadow-lg">
              <Spinner big />
              <span className="font-cond text-sm font-bold uppercase tracking-wider text-grass">
                Trocando perfil...
              </span>
            </div>
          </div>
        )}
        {matches.length === 0 && (
          <div className="border-2 border-dashed border-line bg-white/40 p-5 text-center text-sm text-ink2">
            Sem jogos abertos no momento. A Copa começa em junho de 2026.
          </div>
        )}

        {(() => {
          // Group by group_letter (A..L), within each group sort by starts_at
          const byGroup = new Map<string, MatchRow[]>();
          for (const m of matches) {
            const arr = byGroup.get(m.group_letter) ?? [];
            arr.push(m);
            byGroup.set(m.group_letter, arr);
          }
          const groupLetters = [...byGroup.keys()].sort();
          for (const g of groupLetters) {
            byGroup
              .get(g)!
              .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
          }

          return groupLetters.map((g) => {
            const groupMatches = byGroup.get(g)!;
            const gColor = GROUP_COLORS[g] ?? "#0b2c5c";
            const groupFilled = groupMatches.filter((m) => picks[m.id]).length;
            return (
              <section key={g} className="mb-6 last:mb-2">
                <header className="mb-2 flex items-baseline justify-between border-b border-line pb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink2">
                      Grupo
                    </span>
                    <span
                      className="font-cond text-2xl font-extrabold leading-none"
                      style={{ color: gColor }}
                    >
                      {g}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink2">
                    {groupFilled}/{groupMatches.length} palpitados
                  </span>
                </header>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {groupMatches.map((m) => {
                    const pick = picks[m.id];
                    const teamA = TEAMS[m.team_a as keyof typeof TEAMS];
                    const teamB = TEAMS[m.team_b as keyof typeof TEAMS];
                    const isSaving = savingMatchId === m.id;
                    const date = new Date(m.starts_at);
                    const time = date.toLocaleTimeString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const day = date.toLocaleDateString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      day: "2-digit",
                      month: "short",
                    });
                    return (
                      <div
                        key={m.id}
                        className="relative border-[1.5px] border-ink bg-white/65"
                      >
                        {isSaving && (
                          <div className="absolute right-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-sm border border-grass bg-paper px-1.5 py-0.5 text-grass shadow-sm">
                            <Spinner />
                            <span className="font-mono text-[8px] uppercase tracking-wider">salvando</span>
                          </div>
                        )}
                        <div className="flex items-stretch border-b-[1.5px] border-ink bg-paper2">
                          <div className="flex min-w-[60px] flex-col items-start justify-center bg-ink px-2.5 py-1.5 text-paper">
                            <span className="font-mono text-[8.5px] uppercase tracking-[0.22em] opacity-70">
                              Jogo
                            </span>
                            <span className="font-cond text-[20px] font-extrabold leading-[1.05] tracking-[0.02em]">
                              Nº {String(m.id).padStart(2, "0")}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col items-end justify-center gap-px px-3">
                            <span className="font-mono text-[9px] uppercase tracking-[0.18em] leading-none text-ink2">
                              {day} · Rodada {m.round}
                            </span>
                            <span className="font-cond text-[15px] font-bold tracking-[0.02em] text-ink">
                              {time} BRT
                            </span>
                          </div>
                        </div>

                        <div className="px-3 pb-3 pt-3.5">
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
                            <div className="flex flex-col items-end gap-1">
                              <Flag code={m.team_a as keyof typeof TEAMS} name={teamA.name} size="lg" />
                              <span
                                className="font-cond text-right text-sm font-bold uppercase leading-none tracking-[0.02em]"
                                style={{ color: pick === "1" ? gColor : "#0b2c5c" }}
                              >
                                {teamA.name}
                              </span>
                            </div>
                            <span className="font-cond text-base italic font-normal text-ink2">
                              vs
                            </span>
                            <div className="flex flex-col items-start gap-1">
                              <Flag code={m.team_b as keyof typeof TEAMS} name={teamB.name} size="lg" />
                              <span
                                className="font-cond text-sm font-bold uppercase leading-none tracking-[0.02em]"
                                style={{ color: pick === "2" ? gColor : "#0b2c5c" }}
                              >
                                {teamB.name}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-1.5">
                            {([
                              { v: "1" as Pick, label: teamA.name, big: teamA.name },
                              { v: "X" as Pick, label: "Empate", big: "X" },
                              { v: "2" as Pick, label: teamB.name, big: teamB.name },
                            ]).map((opt) => {
                              const isSel = pick === opt.v;
                              return (
                                <button
                                  key={opt.v}
                                  onClick={() => setPick(m.id, opt.v)}
                                  disabled={isSaving}
                                  className="flex flex-col items-center justify-center gap-0.5 rounded-sm border-[1.5px] px-1.5 py-2 disabled:cursor-not-allowed"
                                  style={{
                                    borderColor: isSel ? gColor : "#0b2c5c",
                                    background: isSel ? gColor : "transparent",
                                    color: isSel ? "#fff" : "#0b2c5c",
                                  }}
                                >
                                  <span className="font-cond text-center text-[13px] font-extrabold uppercase leading-tight tracking-[0.02em]">
                                    {opt.big}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          });
        })()}
      </div>

      <div className="flex items-center gap-2.5 border-t-2 border-ink bg-white/60 px-5 py-3">
        <div className="flex-1">
          <div className="tag">Auto-salva a cada palpite</div>
          <div className="font-cond text-base font-bold text-ink">
            {filled}/{matches.length} carimbados
          </div>
        </div>
        <a
          href="/ranking"
          className="font-cond inline-flex items-center gap-2 rounded-sm border-2 border-ink bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink"
        >
          <Icon.ArrowRight s={14} /> Ver ranking
        </a>
      </div>
    </main>
  );
}
