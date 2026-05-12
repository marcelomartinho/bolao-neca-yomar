"use client";

import { useState, useTransition } from "react";
import { clearPicksOfUser, clearAllPicks, clearAllResults } from "./actions";

type ProfileOpt = {
  id: string;
  name: string;
  email: string | null;
  is_kid: boolean;
};

type Props = {
  profiles: ProfileOpt[];
};

type Mode = null | "user" | "all-picks" | "all-results";

export function AdminReset({ profiles }: Props) {
  const [mode, setMode] = useState<Mode>(null);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setMode(null);
    setSelectedUser("");
    setConfirmText("");
    setError(null);
  }

  function fire() {
    if (confirmText !== "APAGAR") return;
    setError(null);
    setDone(null);
    startTransition(async () => {
      let r;
      if (mode === "user") {
        if (!selectedUser) {
          setError("Escolha um perfil");
          return;
        }
        r = await clearPicksOfUser(selectedUser, confirmText);
      } else if (mode === "all-picks") {
        r = await clearAllPicks(confirmText);
      } else if (mode === "all-results") {
        r = await clearAllResults(confirmText);
      } else return;

      if (!r.ok) {
        setError(r.error);
      } else {
        setDone(
          mode === "user"
            ? `Palpites de ${profiles.find((p) => p.id === selectedUser)?.name ?? "?"} apagados.`
            : mode === "all-picks"
              ? "Todos os palpites apagados."
              : "Todos os resultados apagados.",
        );
        reset();
      }
    });
  }

  const title =
    mode === "user"
      ? "Apagar palpites de um jogador"
      : mode === "all-picks"
        ? "Apagar TODOS os palpites"
        : mode === "all-results"
          ? "Apagar TODOS os resultados"
          : "";

  return (
    <section className="border-t-2 border-red-700 bg-red-50/40 px-4 py-5 md:px-9 md:py-6">
      <div className="flex items-baseline gap-3">
        <span className="font-cond text-xl font-extrabold uppercase tracking-tight text-red-800">
          Zona perigosa
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-700">
          Operações irreversíveis
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            reset();
            setMode("user");
          }}
          className="font-cond inline-flex min-h-[44px] items-center gap-2 rounded-sm border-2 border-red-700 bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-red-800"
        >
          Limpar palpites de um jogador
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            setMode("all-picks");
          }}
          className="font-cond inline-flex min-h-[44px] items-center gap-2 rounded-sm border-2 border-red-700 bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-red-800"
        >
          Limpar TODOS os palpites
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            setMode("all-results");
          }}
          className="font-cond inline-flex min-h-[44px] items-center gap-2 rounded-sm border-2 border-red-700 bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-red-800"
        >
          Limpar TODOS os resultados
        </button>
      </div>

      {done && (
        <div className="border-grass text-grass mt-4 border-2 bg-white px-3 py-2 text-sm">
          {done}
        </div>
      )}

      {mode !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md border-2 border-red-700 bg-paper shadow-xl">
            <div className="border-b-2 border-red-700 bg-red-700 px-4 py-2">
              <span className="font-cond text-base font-extrabold uppercase tracking-wider text-paper">
                Confirmar
              </span>
            </div>
            <div className="px-4 py-4">
              <p className="font-cond text-lg font-bold uppercase leading-tight text-ink">
                {title}
              </p>
              <p className="text-ink2 mt-2 text-sm">
                Esta ação é <strong>irreversível</strong>. Para confirmar, digite{" "}
                <code className="font-mono bg-paper2 px-1 py-0.5 text-ink">APAGAR</code> abaixo.
              </p>

              {mode === "user" && (
                <label className="mt-3 block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
                    Perfil
                  </span>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="border-ink mt-1 w-full border-2 bg-white px-3 py-2 text-sm focus:border-red-700 focus:outline-none"
                  >
                    <option value="">— escolha —</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.is_kid ? " (filho/a)" : ""}
                        {p.email ? ` · ${p.email}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="mt-3 block">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
                  Digite APAGAR pra confirmar
                </span>
                <input
                  type="text"
                  autoFocus
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  className="border-ink mt-1 w-full border-2 bg-white px-3 py-2 font-mono text-sm uppercase tracking-wider focus:border-red-700 focus:outline-none"
                  placeholder="APAGAR"
                />
              </label>

              {error && (
                <div className="mt-3 border-2 border-red-700 bg-white px-3 py-2 text-xs text-red-800">
                  {error}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="font-cond inline-flex items-center gap-2 rounded-sm border-2 border-ink bg-transparent px-4 py-2 text-sm font-bold uppercase tracking-wider text-ink"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={fire}
                  disabled={
                    confirmText !== "APAGAR" ||
                    pending ||
                    (mode === "user" && !selectedUser)
                  }
                  className="font-cond inline-flex items-center gap-2 rounded-sm border-2 border-red-700 bg-red-700 px-4 py-2 text-sm font-bold uppercase tracking-wider text-paper disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "Apagando…" : "Apagar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
