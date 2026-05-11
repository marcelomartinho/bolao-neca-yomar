import { notFound } from "next/navigation";
import { BBrand } from "@/components/boletim/BBrand";
import { TriRule } from "@/components/boletim/TriRule";
import { Stamp } from "@/components/boletim/Stamp";
import { BallMark } from "@/components/boletim/BallMark";
import { Flag } from "@/components/Flag";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";

export default function DevComponentsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="paper-bg min-h-screen px-8 py-10">
      <div className="mx-auto max-w-5xl space-y-12">
        <header>
          <h1 className="font-cond text-4xl font-extrabold uppercase">Componentes — Variação 3</h1>
          <p className="tag mt-2">showcase de desenvolvimento · não vai pra produção</p>
        </header>

        <Section title="BBrand">
          <BBrand size={16} />
          <BBrand size={22} />
        </Section>

        <Section title="TriRule">
          <TriRule height={3} />
          <TriRule height={6} />
        </Section>

        <Section title="Stamp">
          <Stamp color="#0b6b3a" rot={-3}>
            Aberto
          </Stamp>
          <Stamp color="#c79410" rot={2}>
            Premiação dobrou
          </Stamp>
          <Stamp color="#0b2c5c" rot={-1}>
            Rodada 03
          </Stamp>
        </Section>

        <Section title="BallMark">
          <BallMark size={28} />
          <BallMark size={48} color="#c79410" />
        </Section>

        <Section title="Flag">
          <Flag colors={["#009b3a", "#fedf00", "#002776"]} size="md" />
          <Flag colors={["#0055a4", "#ffffff", "#ef4135"]} size="lg" />
          <Flag colors={["#74acdf", "#ffffff", "#74acdf"]} size="xl" />
        </Section>

        <Section title="Avatar">
          <Avatar name="Neca" />
          <Avatar name="Yomar" />
          <Avatar name="Belle" size={56} />
          <Avatar name="Vó Cida" emoji="👵" size={48} />
        </Section>

        <Section title="Icon">
          <Icon.Check />
          <Icon.Trophy />
          <Icon.Share />
          <Icon.Download />
          <Icon.Whatsapp />
          <Icon.Mail />
          <Icon.ArrowRight />
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-line space-y-3 border-t pt-6">
      <h2 className="font-mono text-line text-xs uppercase tracking-widest text-ink2">{title}</h2>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  );
}
