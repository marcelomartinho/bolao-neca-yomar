import { notFound } from "next/navigation";
import Link from "next/link";
import { TriRule } from "@/components/boletim/TriRule";
import { PageHeader } from "@/components/boletim/PageHeader";
import { PageFooter } from "@/components/boletim/PageFooter";
import { Avatar } from "@/components/Avatar";
import { Flag } from "@/components/Flag";
import { fetchProfile, fetchPicksOfUser, fetchMatches } from "@/lib/db";
import { TEAMS } from "@/lib/static-data";

export const revalidate = 60;

type Props = { params: Promise<{ participante: string }> };

const RESERVED = new Set([
  "m", "auth", "dev", "api", "grupos", "tabela", "regulamento", "ranking", "admin",
]);

export default async function PerfilPage({ params }: Props) {
  const { participante } = await params;
  if (RESERVED.has(participante)) notFound();
  if (!/^[0-9a-f-]{36}$/i.test(participante)) notFound();

  const profile = await fetchProfile(participante);
  if (!profile) notFound();

  const [picks, matches] = await Promise.all([
    fetchPicksOfUser(profile.id),
    fetchMatches(),
  ]);

  const matchesById = new Map(matches.map((m) => [m.id, m]));
  const now = Date.now();
  const score = picks.reduce((sum, p) => {
    const m = matchesById.get(p.match_id);
    if (m?.result && m.result === p.pick) return sum + 1;
    return sum;
  }, 0);

  // Pega últimos 10 palpites de jogos já apitados ou prestes a apitar
  const ordered = picks
    .map((p) => ({ p, m: matchesById.get(p.match_id) }))
    .filter((x) => x.m)
    .sort((a, b) => new Date(b.m!.starts_at).getTime() - new Date(a.m!.starts_at).getTime())
    .slice(0, 10);

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <TriRule height={3} />
      <PageHeader
        pageLabel={`Pág. 5 — Cartela de ${profile.name}`}
        subtitle="Boletim do participante"
      />

      <div className="grid flex-1 min-h-0" style={{ gridTemplateColumns: "1.1fr 1fr" }}>
        <div className="border-r border-line px-9 py-6">
          <div className="flex items-center gap-4">
            <Avatar
              name={profile.name}
              initials={profile.initials}
              emoji={profile.emoji}
              size={72}
            />
            <div>
              <h1 className="font-cond m-0 text-[44px] font-extrabold uppercase leading-none tracking-tight">
                {profile.name}
              </h1>
              <div className="tag mt-1">
                {profile.host ? "Organização" : "Participante"}
              </div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3">
            <Box label="Pontos" value={score} accent="#0b6b3a" />
            <Box label="Palpites" value={picks.length} accent="#0b2c5c" />
            <Box
              label="Próximo"
              value={
                ordered.find((x) => new Date(x.m!.starts_at).getTime() > now)?.m
                  ? `Jogo ${ordered.find((x) => new Date(x.m!.starts_at).getTime() > now)?.m?.id}`
                  : "—"
              }
              accent="#c79410"
            />
          </div>

          <p className="mt-7 max-w-[480px] text-[13.5px] leading-relaxed text-ink2">
            Cartela atualizada a cada palpite registrado. Resultados aparecem aqui depois do apito
            final de cada jogo.
          </p>

          <div className="mt-auto pt-6">
            <Link
              href="/ranking"
              className="font-cond inline-flex items-center gap-2 rounded-sm border-2 border-ink bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider"
            >
              ← Voltar ao ranking
            </Link>
          </div>
        </div>

        <div className="px-9 py-6">
          <div className="font-cond text-base font-bold uppercase tracking-[0.1em] text-ink2">
            Últimos palpites
          </div>
          {ordered.length === 0 ? (
            <div className="mt-3 border-2 border-dashed border-line bg-white/40 p-4 text-sm text-ink2">
              Nenhum palpite registrado ainda.
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {ordered.map(({ p, m }) => {
                const tA = TEAMS[m!.team_a as keyof typeof TEAMS];
                const tB = TEAMS[m!.team_b as keyof typeof TEAMS];
                const started = new Date(m!.starts_at).getTime() <= now;
                const hit = m!.result && m!.result === p.pick;
                return (
                  <div
                    key={p.match_id}
                    className="grid items-center gap-2 border-b border-dashed border-line py-1.5"
                    style={{ gridTemplateColumns: "1fr 32px 1fr 40px" }}
                  >
                    <div className="flex items-center justify-end gap-2 text-[12.5px]">
                      <span style={{ fontWeight: p.pick === "1" ? 700 : 500 }}>{tA.name}</span>
                      <Flag code={tA.code} name={tA.name} />
                    </div>
                    <div
                      className="font-cond mx-auto flex h-[26px] w-[26px] items-center justify-center border-[1.5px] text-[13px] font-extrabold"
                      style={{
                        borderColor: started
                          ? hit
                            ? "#0b6b3a"
                            : m!.result
                              ? "#a44"
                              : "#0b2c5c"
                          : "#0b2c5c",
                        background: started && hit ? "#0b6b3a" : "transparent",
                        color: started && hit ? "#fff" : "#0b2c5c",
                      }}
                    >
                      {p.pick}
                    </div>
                    <div className="flex items-center gap-2 text-[12.5px]">
                      <Flag code={tB.code} name={tB.name} />
                      <span style={{ fontWeight: p.pick === "2" ? 700 : 500 }}>{tB.name}</span>
                    </div>
                    <span className="text-right font-mono text-[10px] text-ink2">
                      Nº {String(p.match_id).padStart(2, "0")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <PageFooter
        left="Pág. 5 de 6"
        center={`cartela de ${profile.name}`}
        right="boletim · vol. ii"
      />
    </main>
  );
}

function Box({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="relative border-2 border-ink bg-white/55 px-4 py-3.5">
      <TriRule
        height={3}
        style={{ position: "absolute", top: -2, left: -2, right: -2, width: "auto" }}
      />
      <div className="tag" style={{ color: accent }}>
        {label}
      </div>
      <div
        className="font-cond mt-1 text-[34px] font-extrabold leading-none tracking-tight"
        style={{ color: accent }}
      >
        {value}
      </div>
    </div>
  );
}
