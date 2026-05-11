import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TriRule } from "@/components/boletim/TriRule";
import { BBrand } from "@/components/boletim/BBrand";
import { Flag } from "@/components/Flag";
import { Icon } from "@/components/Icon";
import { TEAMS } from "@/lib/static-data";
import { JogoPickerClient } from "./JogoPickerClient";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function JogoPage({ params }: Props) {
  const { id: rawId } = await params;
  const matchId = Number.parseInt(rawId, 10);
  if (!Number.isInteger(matchId) || matchId < 1 || matchId > 72) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/m/login`);

  const { data: match } = await supabase
    .from("matches")
    .select("id,group_letter,round,team_a,team_b,starts_at,city,result")
    .eq("id", matchId)
    .maybeSingle();
  if (!match) notFound();

  const { data: existingPick } = await supabase
    .from("picks")
    .select("pick")
    .eq("user_id", user.id)
    .eq("match_id", matchId)
    .maybeSingle();

  const tA = TEAMS[match.team_a as keyof typeof TEAMS];
  const tB = TEAMS[match.team_b as keyof typeof TEAMS];
  const startTime = new Date(match.starts_at);
  const closed = startTime.getTime() <= Date.now();
  const dateStr = startTime.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <div className="flex items-center justify-between border-b-2 border-ink px-5 py-2.5">
        <Link href="/m/palpite" className="font-cond text-xs font-bold uppercase tracking-wider">
          ← Voltar
        </Link>
        <BBrand size={14} />
        <span className="tag">Nº {String(match.id).padStart(2, "0")}</span>
      </div>
      <TriRule height={2} />

      <div className="px-6 py-6">
        <div className="tag">Grupo {match.group_letter} · Rodada {match.round}</div>
        <h1 className="font-cond mt-1 text-3xl font-extrabold uppercase leading-tight tracking-tight">
          {dateStr} BRT
        </h1>
        {match.city && (
          <p className="text-ink2 mt-1 text-sm">📍 {match.city}</p>
        )}

        <div className="mt-7 flex items-center justify-between gap-6">
          <div className="flex flex-col items-center gap-2">
            <Flag colors={tA.colors} size="xl" />
            <span className="font-cond text-lg font-bold uppercase">{tA.name}</span>
          </div>
          <span className="font-cond text-3xl italic font-normal text-ink2">vs</span>
          <div className="flex flex-col items-center gap-2">
            <Flag colors={tB.colors} size="xl" />
            <span className="font-cond text-lg font-bold uppercase">{tB.name}</span>
          </div>
        </div>

        {match.result ? (
          <div className="mt-7 border-2 border-grass bg-grassSoft p-4 text-center">
            <div className="tag">Resultado oficial</div>
            <div className="font-cond mt-1 text-4xl font-extrabold uppercase text-grass">
              {match.result === "1" ? tA.name : match.result === "2" ? tB.name : "Empate"}
            </div>
          </div>
        ) : closed ? (
          <div className="mt-7 border-2 border-dashed border-ink bg-white/40 p-4 text-center text-sm text-ink2">
            Jogo já começou. Aguardando resultado oficial.
          </div>
        ) : (
          <JogoPickerClient
            matchId={match.id}
            teamAName={tA.name}
            teamBName={tB.name}
            initialPick={(existingPick?.pick as "1" | "X" | "2" | undefined) ?? null}
          />
        )}

        <div className="mt-7 flex gap-3">
          <Link
            href="/m/palpite"
            className="font-cond inline-flex items-center gap-2 rounded-sm border-2 border-ink bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider"
          >
            <Icon.ArrowRight s={14} /> Todos os jogos
          </Link>
          <Link
            href="/ranking"
            className="font-cond inline-flex items-center gap-2 rounded-sm border-2 border-grass bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider text-grass"
          >
            Ranking
          </Link>
        </div>
      </div>
    </main>
  );
}
