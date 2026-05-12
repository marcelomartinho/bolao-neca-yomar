import type { Metadata } from "next";
import Link from "next/link";
import { TriRule } from "@/components/boletim/TriRule";
import { Stamp } from "@/components/boletim/Stamp";
import { PageHeader } from "@/components/boletim/PageHeader";
import { PageFooter } from "@/components/boletim/PageFooter";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { fetchRanking, fetchMatches } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { title: "Ranking" };

export default async function RankingPage() {
  const [ranking, matches] = await Promise.all([fetchRanking(), fetchMatches()]);
  const resolved = matches.filter((m) => m.result !== null).length;
  const remaining = matches.length - resolved;

  const sorted = ranking
    .map((r, i) => ({ ...r, pos: i + 1 }))
    .filter((r) => r.id !== null);

  const top3 = sorted.slice(0, 3);

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <TriRule height={3} />
      <PageHeader pageLabel={`Boletim do dia · ${formatToday()}`} subtitle="Pág. 3 — ranking geral" />

      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 md:gap-3.5 md:px-9 md:py-4">
        <Stamp color="#0b6b3a" rot={-2}>{resolved} resolvidos</Stamp>
        <Stamp color="#c79410" rot={3}>{remaining} a faltar</Stamp>
        <Stamp color="#0b2c5c" rot={-1}>Edição 02</Stamp>
        <Link
          href="/m/palpite"
          className="font-cond ml-auto inline-flex items-center gap-1.5 rounded-sm border-2 border-ink bg-transparent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider md:px-3 md:py-1.5 md:text-xs"
        >
          <Icon.ArrowRight s={12} /> Cartela
        </Link>
      </div>

      <h2 className="font-cond m-0 break-words px-4 pb-1.5 pt-3 text-2xl font-extrabold uppercase leading-[1.05] tracking-tight md:px-9 md:pt-4 md:text-[44px] md:leading-none">
        {top3[0]?.name ?? "Ainda sem palpiteiros"}{" "}
        <span className="italic font-normal">—</span>
        {top3[1] ? (
          <>
            {" "}
            com{" "}
            <span className="text-grass">{top3[1].name}</span> colada.
          </>
        ) : (
          <span className="text-ink2"> abra a cartela.</span>
        )}
      </h2>

      <div className="grid flex-1 min-h-0 grid-cols-1 md:[grid-template-columns:1.05fr_1fr]">
        <div className="px-4 pb-5 pt-3 md:px-9 md:pb-7 md:pt-4">
          {top3.length === 0 ? (
            <div className="border-2 border-dashed border-line bg-white/40 p-6 text-sm text-ink2">
              Ninguém palpitou ainda. Seja o primeiro:{" "}
              <Link href="/m/login" className="underline">
                entrar
              </Link>
              .
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-3.5">
              {top3.map((p, i) => {
                const bg =
                  i === 0
                    ? "#0b6b3a"
                    : "rgba(255,255,255,0.6)";
                const fg = i === 0 ? "#fff" : "#0b2c5c";
                return (
                  <div
                    key={p.id ?? i}
                    className="relative flex flex-col items-center gap-1.5 overflow-hidden border-2 px-2 py-3 md:gap-2 md:px-3.5 md:py-4"
                    style={{
                      borderColor: "#0b2c5c",
                      background: bg,
                      color: fg,
                      transform: `rotate(${(i - 1) * 0.6}deg)`,
                    }}
                  >
                    {i === 0 && (
                      <TriRule
                        height={3}
                        style={{ position: "absolute", top: -2, left: -2, right: -2, width: "auto" }}
                      />
                    )}
                    <div className="font-cond text-3xl font-extrabold leading-none tracking-tight text-gold md:text-[46px]">
                      {p.pos}º
                    </div>
                    <Avatar
                      name={p.name ?? "?"}
                      initials={p.initials}
                      emoji={p.emoji}
                      size={32}
                    />
                    <div
                      className="font-cond max-w-full truncate text-center text-[11px] font-bold uppercase md:text-lg"
                      title={p.name ?? ""}
                    >
                      {p.name}
                    </div>
                    <div
                      className="font-mono text-[10px] uppercase tracking-[0.06em] md:text-[11px]"
                      style={{ opacity: i === 0 ? 0.9 : 0.65 }}
                    >
                      {p.score ?? 0} pts
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 border-[1.5px] border-ink bg-white/40 px-4 py-3.5">
            <div className="font-cond mb-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-ink2">
              Nota da redação
            </div>
            <p className="m-0 text-[13px] italic leading-snug">
              Ranking atualizado a cada palpite registrado. Empate no total de pontos significa
              prêmio rateado — veja{" "}
              <Link href="/regulamento" className="underline">regulamento
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="border-t border-line py-4 md:border-l md:border-t-0">
          <div className="grid grid-cols-[32px_1fr_56px_56px] border-b border-line px-4 pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink2 md:px-7">
            <span>#</span>
            <span>Participante</span>
            <span className="text-right">Acertos</span>
            <span className="text-right">Pts</span>
          </div>
          {sorted.length === 0 ? (
            <div className="px-4 py-6 text-sm text-ink2 md:px-7">Sem palpiteiros.</div>
          ) : (
            sorted.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[32px_1fr_56px_56px] items-center border-b border-dashed border-line px-4 py-2.5 md:px-7"
              >
                <span
                  className="font-cond text-base font-bold"
                  style={{
                    color:
                      p.pos === 1 ? "#0b6b3a" : p.pos === 2 ? "#0b2c5c" : p.pos === 3 ? "#c79410" : "#5a6a86",
                  }}
                >
                  {p.pos}º
                </span>
                <Link
                  href={`/${p.id}`}
                  className="flex items-center gap-2.5 hover:underline"
                >
                  <Avatar
                    name={p.name ?? "?"}
                    initials={p.initials}
                    emoji={p.emoji}
                    size={26}
                  />
                  <span
                    className="text-[13.5px]"
                    style={{ fontWeight: p.pos === 1 ? 700 : 500 }}
                  >
                    {p.name}
                  </span>
                </Link>
                <span className="text-right font-mono text-xs text-ink2">
                  {p.score ?? 0}/{resolved || matches.length}
                </span>
                <span className="text-right font-cond text-[17px] font-bold">
                  {p.score ?? 0}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <PageFooter
        left="Pág. 3 de 6"
        center="atualiza a cada cartela carimbada"
        right="boletim · vol. ii"
      />
    </main>
  );
}

function formatToday(): string {
  return new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
