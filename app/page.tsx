import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import { TriRule } from "@/components/boletim/TriRule";
import { Stamp } from "@/components/boletim/Stamp";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { DeadlineBanner } from "@/components/DeadlineBanner";
import { PageFooter } from "@/components/boletim/PageFooter";
import { PARTICIPANTS } from "@/lib/static-data";
import { fetchAppConfig } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FrontPage() {
  const [config, supabase] = await Promise.all([
    fetchAppConfig(),
    createSupabaseServerClient(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthed = !!user;

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <div className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur md:top-[46px]">
        <TriRule height={4} />
        <DeadlineBanner deadlineIso={config.picks_deadline} />
      </div>

      {/* Masthead */}
      <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-ink px-4 pb-3 pt-4 md:px-9 md:pb-3.5 md:pt-5">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-grass md:text-[10px] md:tracking-[0.2em]">
            Boletim periódico da família
          </div>
          <h1 className="font-cond mt-0.5 text-[32px] font-extrabold uppercase leading-[0.92] tracking-tight md:text-[52px]">
            Bolão<br />
            <span className="text-grass">Yomar e Família</span>
          </h1>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-gold md:text-[10px] md:tracking-[0.18em]">
            ed. xi — copa do mundo
          </div>
          <div className="font-cond mt-0.5 text-base font-bold tracking-tight md:text-[22px]">
            2026 · 48 países
          </div>
        </div>
      </div>

      {/* Sub-strip */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line px-4 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink2 md:px-9 md:text-[11px] md:tracking-[0.12em]">
        <span>Participação gratuita</span>
        <span className="hidden sm:inline">11 jun → 26 jun · 72 jogos</span>
        <span>Org.: Yomar e Família</span>
      </div>

      <div className="grid flex-1 min-h-0 grid-cols-1 md:[grid-template-columns:1.4fr_1fr]">
        {/* Editorial */}
        <div className="flex flex-col border-b border-line px-4 py-5 md:border-b-0 md:border-r md:px-9 md:py-7">
          <div className="flex flex-wrap items-center gap-2 md:gap-3.5">
            <Stamp color="#0b6b3a" rot={-3}>Aberto</Stamp>
            <Stamp color="#c79410" rot={2}>Premiação dobrou</Stamp>
            <Stamp color="#0b2c5c" rot={-1}>Participação gratuita</Stamp>
          </div>
          <h2 className="font-cond mt-4 text-3xl font-extrabold uppercase leading-[0.95] tracking-tight md:mt-5 md:text-[56px] md:leading-[0.92]">
            A tradição volta{" "}
            <span className="italic font-normal text-grass">e desta vez</span>{" "}
            vale <span className="italic text-gold">quinze mil</span>.
          </h2>
          <p className="mt-4 max-w-[540px] text-sm leading-relaxed md:mt-5 md:text-[14.5px]">
            Foram quatro anos esperando. A Copa volta — agora em três países e com 48 seleções —
            e o <strong>Bolão Yomar e Família</strong> volta junto. Em cada jogo da fase de grupos
            você <strong>escolhe o vencedor</strong> (ou marca empate). Quem somar mais acertos,
            leva. Empate, divide.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5 md:mt-auto md:gap-3 md:pt-5">
            {!isAuthed ? (
              <NavLink
                href="/m/login"
                className="bg-grass border-grass text-paper font-cond inline-flex items-center gap-2 rounded-sm border-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider md:px-5 md:py-3 md:text-[15px]"
              >
                <Icon.Check s={14} /> Entrar agora
              </NavLink>
            ) : (
              <NavLink
                href="/m/palpite"
                className="bg-grass border-grass text-paper font-cond inline-flex items-center gap-2 rounded-sm border-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider md:px-5 md:py-3 md:text-[15px]"
              >
                <Icon.ArrowRight s={14} /> Ir pra cartela
              </NavLink>
            )}
            <NavLink
              href="/regulamento"
              className="text-ink border-ink font-cond inline-flex items-center gap-2 rounded-sm border-2 bg-transparent px-4 py-2.5 text-sm font-bold uppercase tracking-wider md:px-5 md:py-3 md:text-[15px]"
            >
              Ler regulamento
            </NavLink>
            <div className="ml-auto hidden flex-col items-end gap-[3px] md:flex">
              <TriRule height={3} style={{ width: 64 }} />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink2">
                made in brasil
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 px-4 py-5 md:gap-5 md:px-8 md:py-7">
          {/* Prize */}
          <div className="relative border-2 border-ink bg-white/55 px-4 py-3.5 md:px-5 md:py-4">
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
              <span className="font-cond text-xl font-bold text-gold md:text-[26px]">1º</span>
              <span className="flex-1 text-[10px] uppercase tracking-[0.06em] text-ink2 md:text-xs">primeiro</span>
              <span className="font-cond text-2xl font-extrabold tracking-tight text-grass md:text-[38px]">
                R$ 10.000
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2 border-t border-dashed border-line pt-1.5">
              <span className="font-cond text-lg font-bold text-ink2 md:text-[22px]">2º</span>
              <span className="flex-1 text-[10px] uppercase tracking-[0.06em] text-ink2 md:text-xs">segundo</span>
              <span className="font-cond text-xl font-bold tracking-tight text-bluebr md:text-[28px]">
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
        </div>
      </div>

      <PageFooter
        left="Pág. 1 de 6"
        center="capa do boletim"
        right="impr. interna"
      />
    </main>
  );
}
