import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveProfileId } from "@/lib/active-profile";
import { TEAMS } from "@/lib/static-data";
import { AutoPrint } from "./AutoPrint";

export const dynamic = "force-dynamic";

export default async function CartelaPdfPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  const activeId = await getActiveProfileId(user.id);
  const { data: profile } = await supabase
    .from("profiles")
    .select("name,initials,emoji")
    .eq("id", activeId)
    .maybeSingle();

  const [{ data: matches }, { data: picks }] = await Promise.all([
    supabase
      .from("matches")
      .select("id,group_letter,round,team_a,team_b,starts_at,result,score_a,score_b")
      .order("group_letter")
      .order("starts_at"),
    supabase
      .from("picks")
      .select("match_id,pick,updated_at")
      .eq("user_id", activeId),
  ]);

  const pickByMatch = new Map((picks ?? []).map((p) => [p.match_id, p]));
  const filled = (picks ?? []).length;
  const total = (matches ?? []).length;
  const score = (matches ?? []).reduce((acc, m) => {
    const p = pickByMatch.get(m.id);
    if (m.result && p?.pick === m.result) return acc + 1;
    return acc;
  }, 0);

  type Match = NonNullable<typeof matches>[number];
  const byGroup = new Map<string, Match[]>();
  for (const m of matches ?? []) {
    const arr = byGroup.get(m.group_letter) ?? [];
    arr.push(m);
    byGroup.set(m.group_letter, arr);
  }
  const letters = [...byGroup.keys()].sort();

  const generated = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  return (
    <main
      className="paper-bg min-h-screen px-6 py-6 text-ink"
      style={{ fontFamily: "var(--font-sans, Inter Tight)", maxWidth: "210mm", margin: "0 auto" }}
    >
      <AutoPrint />

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 14mm 12mm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .pdf-group {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          table { font-size: 10.5px; }
          .pdf-header { page-break-after: avoid; }
        }
        table.cartela th, table.cartela td { padding: 3px 4px; vertical-align: middle; }
        table.cartela tbody tr { border-bottom: 1px dashed #d5dde7; }
      `}</style>

      <div className="no-print mb-4 flex flex-wrap items-center gap-3">
        <a
          href="/m/palpite"
          className="font-cond rounded-sm border-2 border-ink px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-ink"
        >
          ← Voltar pra cartela
        </a>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink2">
          (impressão abre automaticamente · use Salvar como PDF no diálogo)
        </span>
      </div>

      {/* Header */}
      <div className="pdf-header flex items-end justify-between border-b-2 border-ink pb-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-grass">
            Boletim do bolão · cartela impressa
          </div>
          <h1 className="font-cond mt-1 text-3xl font-extrabold uppercase leading-[0.95] tracking-tight md:text-[40px]">
            {profile?.name ?? "Participante"}{" "}
            <span className="text-grass italic font-normal">— Copa 2026</span>
          </h1>
        </div>
        <div className="text-right font-mono text-[10px] uppercase tracking-[0.16em] text-ink2">
          <div>Gerado em {generated}</div>
          <div>
            Palpitados: {filled}/{total}
          </div>
          {score > 0 && <div>Pontos: {score}</div>}
        </div>
      </div>

      {/* Single-column flow — uma seção por grupo, full-width A4 portrait */}
      <div className="mt-5 flex flex-col gap-5">
        {letters.map((g) => {
          const groupMatches = byGroup.get(g)!;
          return (
            <section key={g} className="pdf-group">
              <div className="mb-1.5 flex items-baseline justify-between border-b border-ink pb-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink2">
                    Grupo
                  </span>
                  <span className="font-cond text-xl font-extrabold leading-none">{g}</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink2">
                  {groupMatches.length} jogos
                </span>
              </div>
              <table className="cartela w-full text-[11px]">
                <thead>
                  <tr className="font-mono uppercase tracking-[0.1em] text-ink2">
                    <th className="text-left" style={{ width: "34px" }}>Nº</th>
                    <th className="text-left" style={{ width: "78px" }}>Data BRT</th>
                    <th className="text-right">Mandante</th>
                    <th className="text-center" style={{ width: "56px" }}>Placar</th>
                    <th className="text-left">Visitante</th>
                    <th className="text-center" style={{ width: "44px" }}>Palpite</th>
                    <th className="text-center" style={{ width: "30px" }}>R</th>
                  </tr>
                </thead>
                <tbody>
                  {groupMatches.map((m) => {
                    const tA = TEAMS[m.team_a as keyof typeof TEAMS];
                    const tB = TEAMS[m.team_b as keyof typeof TEAMS];
                    const p = pickByMatch.get(m.id);
                    const date = new Date(m.starts_at).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const hasScore = m.score_a != null && m.score_b != null;
                    const hit = m.result && p?.pick === m.result;
                    return (
                      <tr key={m.id}>
                        <td className="font-mono text-ink2">{String(m.id).padStart(2, "0")}</td>
                        <td className="font-mono text-ink2">{date}</td>
                        <td className="text-right" style={{ fontWeight: m.result === "1" ? 700 : 500 }}>
                          {tA?.name ?? m.team_a}
                        </td>
                        <td className="text-center font-cond font-bold">
                          {hasScore ? (
                            <span>{m.score_a} × {m.score_b}</span>
                          ) : (
                            <span className="text-ink2">—</span>
                          )}
                        </td>
                        <td style={{ fontWeight: m.result === "2" ? 700 : 500 }}>
                          {tB?.name ?? m.team_b}
                        </td>
                        <td className="text-center">
                          <span
                            className="font-cond inline-flex h-5 w-5 items-center justify-center border font-bold"
                            style={{
                              borderColor: p?.pick ? "#0b6b3a" : "#d5dde7",
                              background: p?.pick ? "#0b6b3a" : "transparent",
                              color: p?.pick ? "#fbfaf4" : "#5a6a86",
                              fontSize: 10,
                            }}
                          >
                            {p?.pick ?? "—"}
                          </span>
                        </td>
                        <td className="text-center font-mono text-ink2">
                          {m.result ?? "—"}
                          {hit && " ✓"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>

      <div className="mt-6 border-t-2 border-ink pt-2 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-ink2">
        Bolão Neca &amp; Yomar · {profile?.name} · gerado em {generated}
      </div>
    </main>
  );
}
