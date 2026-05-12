import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMatches } from "@/lib/db";
import { fetchAppConfig } from "@/lib/config";
import { TriRule } from "@/components/boletim/TriRule";
import { PageHeader } from "@/components/boletim/PageHeader";
import { PageFooter } from "@/components/boletim/PageFooter";
import { AdminClient } from "./AdminClient";
import { DeadlineEditor } from "./DeadlineEditor";
import { AdminReset } from "./AdminReset";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,name,host")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.host) {
    return (
      <main className="paper-bg flex min-h-screen flex-col text-ink">
        <PageHeader pageLabel="Pág. 6 — Administração" subtitle="Acesso restrito" />
        <div className="flex flex-1 items-center justify-center px-4 md:px-9">
          <div className="border-2 border-dashed border-ink bg-white/60 p-8 text-center max-w-md">
            <p className="font-cond text-xl font-extrabold uppercase">Não autorizado</p>
            <p className="mt-3 text-sm text-ink2">
              Só Marcelo, Bruno e Yomar podem marcar resultados.
            </p>
          </div>
        </div>
        <PageFooter left="Pág. 6 de 6" right="boletim · ed. 11" />
      </main>
    );
  }

  const [matches, config, profilesData] = await Promise.all([
    fetchMatches(),
    fetchAppConfig(),
    supabase
      .from("profiles")
      .select("id,name,parent_id,auth_user_id")
      .order("name"),
  ]);

  type ProfileRow = {
    id: string;
    name: string;
    parent_id: string | null;
    auth_user_id: string | null;
  };

  // Build email lookup via Auth admin? We have service role only on server actions.
  // For UI display, only show name + kid flag. Emails omitted to avoid PII exposure.
  const profilesForReset = (profilesData.data ?? []).map((p: ProfileRow) => ({
    id: p.id,
    name: p.name,
    email: null as string | null,
    is_kid: p.parent_id !== null,
  }));

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <PageHeader pageLabel="Pág. 6 — Administração" subtitle="Configuração & resultados" />
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-paper2/40 px-4 py-2.5 md:px-9">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
          Ferramentas
        </span>
        <a
          href="/admin/atividade"
          className="font-cond inline-flex items-center gap-1.5 rounded-sm border-2 border-ink bg-transparent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-ink"
        >
          📜 Log de atividade
        </a>
      </div>
      <div className="border-b border-line px-4 py-5 md:px-9">
        <DeadlineEditor initialDeadline={config.picks_deadline} />
      </div>
      <AdminClient matches={matches} orgName={profile.name} />
      <AdminReset profiles={profilesForReset} />
      <PageFooter
        left="Pág. 6 de 6"
        center="acesso restrito à organização"
        right="boletim · ed. 11"
      />
    </main>
  );
}
