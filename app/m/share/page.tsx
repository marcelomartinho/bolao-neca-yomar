import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchPicksOfUser, fetchMatches } from "@/lib/db";
import { TEAMS } from "@/lib/static-data";
import { TriRule } from "@/components/boletim/TriRule";
import { Stamp } from "@/components/boletim/Stamp";
import { BBrand } from "@/components/boletim/BBrand";
import { Avatar } from "@/components/Avatar";
import { Flag } from "@/components/Flag";
import { ShareActions } from "./ShareActions";

export const dynamic = "force-dynamic";

export default async function SharePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,name,initials,emoji,host")
    .eq("id", user.id)
    .maybeSingle();

  const [picks, matches] = await Promise.all([
    fetchPicksOfUser(user.id),
    fetchMatches({ limit: 200 }),
  ]);

  const matchesById = new Map(matches.map((m) => [m.id, m]));
  // Mostrar os 4 próximos jogos (cartela do dia)
  const now = Date.now();
  const upcoming = matches
    .filter((m) => new Date(m.starts_at).getTime() > now)
    .slice(0, 4);

  const pickByMatch = new Map(picks.map((p) => [p.match_id, p.pick]));
  void matchesById;

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <div className="flex h-[38px] items-center justify-between px-5 text-[13px] font-semibold">
        <span>9:41</span>
        <a href="/m/palpite" className="text-xs font-medium text-ink2">Fechar</a>
      </div>
      <div className="flex items-center justify-between border-b-2 border-ink px-5 py-3.5">
        <BBrand size={16} />
        <span className="tag">Compartilhar</span>
      </div>

      <div className="flex flex-1 flex-col gap-3.5 overflow-hidden px-4 pb-3 pt-4">
        <div className="relative border-2 border-ink bg-white/70 px-4 pb-3.5 pt-4">
          <TriRule
            height={3}
            style={{ position: "absolute", top: -2, left: -2, right: -2, width: "auto" }}
          />
          <div className="absolute right-2.5 top-3.5">
            <Stamp color="#0b6b3a" rot={8}>Confirmado</Stamp>
          </div>
          <div className="tag">Cartela próxima rodada</div>
          <div className="mt-2 flex items-center gap-2.5">
            <Avatar
              name={profile?.name ?? "?"}
              initials={profile?.initials}
              emoji={profile?.emoji}
              size={40}
            />
            <div>
              <div className="font-cond text-[22px] font-extrabold uppercase tracking-tight">
                {profile?.name}
              </div>
              <div className="text-ink2 text-[11px]">palpites registrados</div>
            </div>
          </div>

          <div className="mt-3.5 flex flex-col gap-2">
            {upcoming.length === 0 ? (
              <div className="text-ink2 text-sm">Sem jogos próximos.</div>
            ) : (
              upcoming.map((m) => {
                const pick = pickByMatch.get(m.id);
                const tA = TEAMS[m.team_a as keyof typeof TEAMS];
                const tB = TEAMS[m.team_b as keyof typeof TEAMS];
                return (
                  <div
                    key={m.id}
                    className="grid items-center gap-2 border-b border-dashed border-line pb-1.5"
                    style={{ gridTemplateColumns: "1fr 32px 1fr" }}
                  >
                    <div className="flex items-center justify-end gap-1.5 text-[12.5px]">
                      <span style={{ fontWeight: pick === "1" ? 700 : 500 }}>{tA.name}</span>
                      <Flag colors={tA.colors} />
                    </div>
                    <div
                      className="font-cond mx-auto flex h-[26px] w-[26px] items-center justify-center border-[1.5px] border-ink text-[13px] font-extrabold"
                      style={{
                        background: pick ? "#fbfaf4" : "transparent",
                        color: pick ? "#0b2c5c" : "#5a6a86",
                      }}
                    >
                      {pick ?? "?"}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12.5px]">
                      <Flag colors={tB.colors} />
                      <span style={{ fontWeight: pick === "2" ? 700 : 500 }}>{tB.name}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-3 flex justify-between font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink2">
            <span>Bolão Neca &amp; Yomar</span>
            <span>Copa 2026</span>
          </div>
        </div>

        <ShareActions
          shareUrl="https://bolao-neca-yomar.vercel.app"
          shareText={`Já carimbei minha cartela do bolão da família — Copa 2026. Vem comigo: `}
        />
      </div>
    </main>
  );
}
