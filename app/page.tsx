import Link from "next/link";
import { TriRule } from "@/components/boletim/TriRule";
import { Stamp } from "@/components/boletim/Stamp";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { DeadlineBanner } from "@/components/DeadlineBanner";
import { PARTICIPANTS } from "@/lib/static-data";
import { fetchAppConfig } from "@/lib/config";

export const revalidate = 60;

export default async function FrontPage() {
  const config = await fetchAppConfig();
  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <TriRule height={4} />
      <DeadlineBanner deadlineIso={config.picks_deadline} />

      {/* Masthead */}
      <div className="flex items-end justify-between border-b-2 border-ink px-9 pb-3.5 pt-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-grass">
            Boletim periódico da família
          </div>
          <h1 className="font-cond mt-0.5 text-[60px] font-bold uppercase leading-[0.9]">
            O Bolão
          </h1>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
            vol. ii — copa do mundo
          </div>
          <div className="font-cond mt-0.5 text-[22px] font-bold tracking-tight">
            2026 · 48 países
          </div>
        </div>
      </div>

      {/* Sub-strip */}
      <div className="flex justify-between border-b border-line px-9 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink2">
        <span>Distribuído gratuitamente</span>
        <span>11 jun → 26 jun · 72 jogos</span>
        <span>Org.: Neca &amp; Yomar</span>
      </div>

      <div className="grid flex-1 min-h-0" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        {/* Editorial */}
        <div className="flex flex-col border-r border-line px-9 py-7">
          <div className="flex items-center gap-3.5">
            <Stamp color="#0b6b3a" rot={-3}>Aberto</Stamp>
            <Stamp color="#c79410" rot={2}>Premiação dobrou</Stamp>
          </div>
          <h2 className="font-cond mt-5 text-[56px] font-extrabold uppercase leading-[0.92] tracking-tight">
            Volta o bolão da casa<br />
            <span className="italic font-normal text-grass">e desta vez</span><br />
            vale <span className="italic text-gold">quinze mil</span>.
          </h2>
          <p className="mt-5 max-w-[540px] text-[14.5px] leading-relaxed">
            Foram quatro anos esperando. A Copa volta — agora em três países e com 48 seleções
            — e o bolão da família volta junto, com regulamento de sempre:{" "}
            <strong>marcar 1, X ou 2</strong> em cada um dos 72 jogos da fase de grupos. Quem
            somar mais acertos, leva. Empate, divide.
          </p>
          <div className="mt-auto flex items-center gap-3 pt-5">
            <Link
              href="/m/login"
              className="bg-grass border-grass text-paper font-cond inline-flex items-center gap-2 rounded-sm border-2 px-5 py-3 text-[15px] font-bold uppercase tracking-wider"
            >
              <Icon.Check s={16} /> Entrar agora
            </Link>
            <Link
              href="/regulamento"
              className="text-ink border-ink font-cond inline-flex items-center gap-2 rounded-sm border-2 bg-transparent px-5 py-3 text-[15px] font-bold uppercase tracking-wider"
            >
              Ler regulamento
            </Link>
            <div className="ml-auto flex flex-col items-end gap-[3px]">
              <TriRule height={3} style={{ width: 64 }} />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink2">
                made in brasil
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5 px-8 py-7">
          {/* Prize */}
          <div className="relative border-2 border-ink bg-white/55 px-5 py-4">
            <TriRule
              height={3}
              style={{ position: "absolute", top: -2, left: -2, right: -2, width: "auto" }}
            />
            <div className="flex items-baseline justify-between border-b border-dashed border-line pb-2 mb-2">
              <span className="font-cond text-sm font-bold uppercase tracking-[0.12em] text-grass">
                Premiação
              </span>
              <Icon.Trophy s={18} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-cond text-[26px] font-bold text-gold">1º</span>
              <span className="flex-1 text-xs uppercase tracking-[0.06em] text-ink2">primeiro</span>
              <span className="font-cond text-[38px] font-extrabold tracking-tight text-grass">
                R$ 10.000
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2 border-t border-dashed border-line pt-1.5">
              <span className="font-cond text-[22px] font-bold text-ink2">2º</span>
              <span className="flex-1 text-xs uppercase tracking-[0.06em] text-ink2">segundo</span>
              <span className="font-cond text-[28px] font-bold tracking-tight text-bluebr">
                R$ 5.000
              </span>
            </div>
            <p className="mt-3 text-[11.5px] italic leading-relaxed text-ink2">
              Em caso de empate em pontos, o prêmio será rateado igualmente. Inscrição é gratuita
              — a tradição é o que paga.
            </p>
          </div>

          {/* Roster */}
          <div>
            <div className="mb-2.5 flex items-baseline justify-between">
              <span className="font-cond text-sm font-bold uppercase tracking-[0.12em]">
                Inscritos
              </span>
              <span className="font-mono text-[11px] text-ink2">
                {PARTICIPANTS.length} pessoas
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PARTICIPANTS.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 border-b border-dashed border-line px-2 py-1.5"
                >
                  <Avatar name={p.name} initials={p.initials} emoji={p.emoji} size={26} />
                  <span className="flex-1 text-[13px] font-medium">{p.name}</span>
                  {p.host && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ink2">
                      ORG
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 flex gap-4">
            <Link
              href="/grupos"
              className="font-cond text-[13px] font-bold uppercase tracking-wider text-ink underline-offset-4 hover:underline"
            >
              Pág. 2 · Grupos →
            </Link>
            <Link
              href="/tabela"
              className="font-cond text-[13px] font-bold uppercase tracking-wider text-ink underline-offset-4 hover:underline"
            >
              Pág. 4 · Tabela →
            </Link>
          </div>
        </div>
      </div>

      <footer className="flex justify-between border-t-2 border-ink px-9 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink2">
        <span>Pág. 1 de 6</span>
        <span>continua no verso → tabela completa</span>
        <span>impr. interna</span>
      </footer>
    </main>
  );
}
