import type { Metadata } from "next";
import { TriRule } from "@/components/boletim/TriRule";
import { Stamp } from "@/components/boletim/Stamp";
import { PageHeader } from "@/components/boletim/PageHeader";
import { PageFooter } from "@/components/boletim/PageFooter";

export const metadata: Metadata = { title: "Regulamento" };

const REGRAS: Array<[string, string]> = [
  ["O bolão", "Aposta sobre os 72 jogos da fase de grupos da Copa de 2026. Cada acerto vale 1 ponto."],
  [
    "Inscrição",
    "Gratuita. A organização pré-cadastra os participantes pela lista da família — quem está na lista entra com o próprio e-mail (link mágico, sem senha).",
  ],
  [
    "Palpites",
    "Em cada jogo, escolha o vencedor clicando no time mandante ou no visitante. Para empate, clique em <strong>X</strong>. Pais palpitam pelos filhos cadastrados como perfil próprio.",
  ],
  [
    "Prazos",
    "Todos os palpites devem ser carimbados até o <strong>prazo único</strong> definido pela organização (visível na capa e na cartela). Depois disso, ninguém edita mais.",
  ],
  ["Pontuação", "1 ponto por acerto de 1 / X / 2. Sem multiplicadores, sem zebras, sem complicação. Resultado considerado é o do tempo normal (90 min)."],
  [
    "Empate",
    "Em caso de empate no total de acertos, o prêmio é rateado igualmente entre os empatados.",
  ],
  [
    "Premiação",
    "1º lugar leva R$ 10.000,00. 2º lugar leva R$ 5.000,00.",
  ],
  [
    "Cartela em branco",
    "Quem não palpitar até o prazo fica com cartela em branco — soma zero ponto. Sem segunda chance.",
  ],
  [
    "Discussão",
    "Toda contestação é decidida em mesa, com Neca e Yomar. Palavra final é da organização.",
  ],
];

export default function RegulamentoPage() {
  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <TriRule height={3} />
      <PageHeader pageLabel="Pág. 6 — Regulamento oficial" subtitle="Letras miúdas, regras curtas" />

      <div className="flex flex-wrap items-end gap-3 border-b border-line px-4 pb-3 pt-4 md:gap-5 md:px-9 md:pt-6">
        <h2 className="font-cond m-0 text-3xl font-extrabold uppercase leading-[0.95] tracking-tight md:text-[64px] md:leading-[0.88]">
          As nove{" "}
          <span className="text-grass">regras</span>{" "}
          <span className="italic font-normal text-ink2">de sempre.</span>
        </h2>
        <div className="flex-1" />
        <div className="text-right">
          <Stamp color="#c79410" rot={4}>Aprovado</Stamp>
          <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink2 md:text-[10px] md:tracking-[0.16em]">
            Org.: Neca &amp; Yomar
          </div>
        </div>
      </div>

      <div className="grid flex-1 min-h-0 grid-cols-1 md:[grid-template-columns:1fr_1fr_280px]">
        <RegraCol
          regras={REGRAS.slice(0, 5)}
          offset={0}
          numberColor="#0b6b3a"
          className="border-b border-dashed border-line md:border-b-0 md:border-r"
        />
        <RegraCol
          regras={REGRAS.slice(5)}
          offset={5}
          numberColor="#0b2c5c"
          className="border-b border-line md:border-b-0 md:border-r"
        />

        <div className="flex flex-col gap-3 px-4 py-4 md:px-7">
          <div className="relative border-2 border-ink bg-white/60 px-3.5 py-3">
            <TriRule
              height={3}
              style={{ position: "absolute", top: -2, left: -2, right: -2, width: "auto" }}
            />
            <div className="font-cond text-xs font-bold uppercase tracking-[0.12em] text-gold">
              Premiação
            </div>
            <div className="mt-2 flex items-baseline justify-between border-b border-dashed border-line pb-1.5">
              <span className="font-cond text-lg font-extrabold">1º</span>
              <span className="font-cond text-2xl font-extrabold text-grass">R$ 10.000</span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="font-cond text-base font-extrabold text-ink2">2º</span>
              <span className="font-cond text-xl font-bold text-bluebr">R$ 5.000</span>
            </div>
          </div>

          <div className="border border-dashed border-ink px-3.5 py-3">
            <div className="font-cond text-xs font-bold uppercase tracking-[0.12em] text-grass">
              Casos especiais
            </div>
            <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0 text-xs leading-snug">
              <li>· Jogo cancelado vira anulado pra todo mundo.</li>
              <li>· Prorrogação e pênaltis não contam — só os 90 min.</li>
              <li>· Cada palpite fica salvo automaticamente ao clicar.</li>
            </ul>
          </div>

          <div className="mt-auto text-right font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink2">
            Boa sorte<br />
            e bom jogo.
          </div>
        </div>
      </div>

      <PageFooter
        left="Pág. 5 de 6"
        center="edição encerrada · até a próxima copa"
        right="impr. interna · neca & yomar"
      />
    </main>
  );
}

function RegraCol({
  regras,
  offset,
  numberColor,
  className,
}: {
  regras: Array<[string, string]>;
  offset: number;
  numberColor: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 px-4 py-4 md:px-7 ${className ?? ""}`}>
      {regras.map(([t, txt], i) => (
        <div key={t} className="grid gap-2.5" style={{ gridTemplateColumns: "34px 1fr" }}>
          <span
            className="font-cond text-[30px] font-extrabold leading-none tracking-tight"
            style={{ color: numberColor }}
          >
            {String(offset + i + 1).padStart(2, "0")}
          </span>
          <div>
            <div className="font-cond text-base font-bold uppercase tracking-[0.02em]">{t}</div>
            <p
              className="mt-0.5 text-[13px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: txt }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
