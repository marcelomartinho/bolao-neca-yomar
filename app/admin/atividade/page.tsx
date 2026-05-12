import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/boletim/PageHeader";
import { PageFooter } from "@/components/boletim/PageFooter";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, { label: string; tone: "neutral" | "success" | "danger" | "info" }> = {
  "auth.login": { label: "Entrou no bolão", tone: "info" },
  "pick.save": { label: "Salvou palpite", tone: "neutral" },
  "profile.update": { label: "Atualizou perfil", tone: "neutral" },
  "kid.add": { label: "Cadastrou filho", tone: "success" },
  "kid.remove": { label: "Removeu filho", tone: "danger" },
  "match.result.set": { label: "Definiu resultado", tone: "success" },
  "match.score.set": { label: "Marcou placar", tone: "success" },
  "match.result.clear": { label: "Limpou resultado", tone: "danger" },
  "config.deadline": { label: "Mudou prazo", tone: "info" },
  "admin.clear_picks_user": { label: "Limpou palpites de jogador", tone: "danger" },
  "admin.clear_all_picks": { label: "Limpou TODOS os palpites", tone: "danger" },
  "admin.clear_all_results": { label: "Limpou TODOS os resultados", tone: "danger" },
};

const TONE_BG: Record<string, string> = {
  neutral: "#0b2c5c",
  success: "#0b6b3a",
  danger: "#a01818",
  info: "#c79410",
};

type ActivityRow = {
  id: string;
  user_id: string | null;
  acting_auth_user_id: string | null;
  action: string;
  payload: Record<string, unknown> | null;
  created_at: string;
};

type ProfileLite = {
  id: string;
  name: string;
  initials: string | null;
  emoji: string | null;
};

export default async function AtividadePage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; limit?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  const { data: meProfile } = await supabase
    .from("profiles")
    .select("host,name")
    .eq("id", user.id)
    .maybeSingle();
  if (!meProfile?.host) redirect("/admin");

  const limit = Math.min(500, Math.max(10, Number(sp.limit) || 100));
  const filterUserId = sp.user && /^[0-9a-f-]{36}$/i.test(sp.user) ? sp.user : null;

  let q = supabase
    .from("activity_log")
    .select("id,user_id,acting_auth_user_id,action,payload,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (filterUserId) q = q.eq("user_id", filterUserId);
  const { data: rows } = await q;
  const activity = (rows ?? []) as ActivityRow[];

  // Last sign-in per user (from auth.users via SQL via management OR profiles update).
  // Sem service role no browser; pulamos last_sign_in. Mostramos último auth.login do log.

  // Collect involved profile ids for display
  const ids = new Set<string>();
  for (const a of activity) {
    if (a.user_id) ids.add(a.user_id);
    if (a.acting_auth_user_id) ids.add(a.acting_auth_user_id);
  }
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,name,initials,emoji")
    .in("id", [...ids]);
  const profById = new Map((profiles ?? []).map((p) => [p.id, p as ProfileLite]));

  // For dropdown filter: all profiles
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id,name,parent_id")
    .order("name");

  // Per-user last login (from activity_log auth.login)
  const lastLogin = new Map<string, string>();
  for (const a of activity) {
    if (a.action === "auth.login" && a.user_id && !lastLogin.has(a.user_id)) {
      lastLogin.set(a.user_id, a.created_at);
    }
  }

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <PageHeader pageLabel="Atividade" subtitle="Log de operações" />

      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-4 md:px-9">
        <form className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
              Filtrar por participante
            </span>
            <select
              name="user"
              defaultValue={filterUserId ?? ""}
              className="border-ink border-2 bg-white px-2 py-1 font-mono text-xs focus:outline-none"
            >
              <option value="">Todos</option>
              {(allProfiles ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.parent_id ? " (filho)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
              Mostrar
            </span>
            <select
              name="limit"
              defaultValue={String(limit)}
              className="border-ink border-2 bg-white px-2 py-1 font-mono text-xs focus:outline-none"
            >
              {[50, 100, 200, 500].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="font-cond inline-flex items-center gap-2 rounded-sm border-2 border-ink bg-transparent px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink"
          >
            Aplicar
          </button>
          <Link
            href="/admin/atividade"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2 underline-offset-4 hover:underline"
          >
            Limpar filtro
          </Link>
        </form>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 md:px-9">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink2">
          {activity.length} eventos · ordem cronológica reversa
        </p>
        <table className="w-full text-[12.5px]">
          <thead className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink2">
            <tr className="border-b border-line">
              <th className="py-2 text-left" style={{ width: "150px" }}>Quando (BRT)</th>
              <th className="text-left" style={{ width: "200px" }}>Quem fez</th>
              <th className="text-left" style={{ width: "240px" }}>Ação</th>
              <th className="text-left" style={{ width: "200px" }}>Alvo</th>
              <th className="text-left">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {activity.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-ink2">
                  Nenhum evento ainda.
                </td>
              </tr>
            )}
            {activity.map((a) => {
              const when = new Date(a.created_at).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              });
              const acting = a.acting_auth_user_id ? profById.get(a.acting_auth_user_id) : null;
              const target = a.user_id ? profById.get(a.user_id) : null;
              const info = ACTION_LABELS[a.action] ?? { label: a.action, tone: "neutral" };
              const tone = TONE_BG[info.tone];
              return (
                <tr key={a.id} className="border-b border-dashed border-line">
                  <td className="py-2 font-mono text-[11px] text-ink2">{when}</td>
                  <td className="py-2">
                    {acting ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar
                          name={acting.name}
                          initials={acting.initials}
                          emoji={acting.emoji}
                          size={18}
                        />
                        <span className="font-cond text-xs font-bold uppercase">
                          {acting.name}
                        </span>
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-ink2">—</span>
                    )}
                  </td>
                  <td className="py-2">
                    <span
                      className="font-cond inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                      style={{ borderColor: tone, color: tone, background: `${tone}10` }}
                    >
                      {info.label}
                    </span>
                  </td>
                  <td className="py-2">
                    {target && target.id !== acting?.id ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Avatar
                          name={target.name}
                          initials={target.initials}
                          emoji={target.emoji}
                          size={18}
                        />
                        <span className="font-cond text-xs font-bold uppercase">
                          {target.name}
                        </span>
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-ink2">—</span>
                    )}
                  </td>
                  <td className="py-2 font-mono text-[11px] text-ink2">
                    {a.payload ? formatPayload(a.payload) : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {lastLogin.size > 0 && !filterUserId && (
          <section className="mt-8">
            <h3 className="font-cond text-base font-bold uppercase tracking-[0.1em] text-ink2">
              Últimos acessos por participante
            </h3>
            <ul className="mt-3 grid gap-1 md:grid-cols-2">
              {[...lastLogin.entries()]
                .sort((a, b) => b[1].localeCompare(a[1]))
                .map(([uid, ts]) => {
                  const p = profById.get(uid);
                  if (!p) return null;
                  return (
                    <li
                      key={uid}
                      className="flex items-center justify-between border-b border-dashed border-line py-1.5"
                    >
                      <span className="flex items-center gap-2">
                        <Avatar
                          name={p.name}
                          initials={p.initials}
                          emoji={p.emoji}
                          size={22}
                        />
                        <span className="font-cond text-sm font-bold uppercase">{p.name}</span>
                      </span>
                      <span className="font-mono text-[11px] text-ink2">
                        {new Date(ts).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </section>
        )}
      </div>

      <PageFooter
        left="Pág. 6 de 6"
        center="acesso restrito · log auditável"
        right="boletim · ed. 11"
      />
    </main>
  );
}

function formatPayload(payload: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(payload)) {
    if (v == null || v === "") continue;
    parts.push(`${k}=${typeof v === "object" ? JSON.stringify(v) : String(v)}`);
  }
  return parts.join(" · ");
}
