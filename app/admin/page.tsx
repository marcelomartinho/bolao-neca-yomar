import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchMatches } from "@/lib/db";
import { fetchAppConfig } from "@/lib/config";
import { TriRule } from "@/components/boletim/TriRule";
import { PageHeader } from "@/components/boletim/PageHeader";
import { PageFooter } from "@/components/boletim/PageFooter";
import { AdminClient } from "./AdminClient";
import { DeadlineEditor } from "./DeadlineEditor";

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
        <TriRule height={3} />
        <PageHeader pageLabel="Pág. 7 — Administração" subtitle="Acesso restrito" />
        <div className="flex flex-1 items-center justify-center px-9">
          <div className="border-2 border-dashed border-ink bg-white/60 p-8 text-center max-w-md">
            <p className="font-cond text-xl font-extrabold uppercase">Não autorizado</p>
            <p className="mt-3 text-sm text-ink2">
              Só Neca e Yomar podem marcar resultados.
            </p>
          </div>
        </div>
        <PageFooter left="Pág. 7 de 7" right="boletim · vol. ii" />
      </main>
    );
  }

  const [matches, config] = await Promise.all([fetchMatches(), fetchAppConfig()]);

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <TriRule height={3} />
      <PageHeader pageLabel="Pág. 7 — Administração" subtitle="Configuração & resultados" />
      <div className="border-b border-line px-9 py-5">
        <DeadlineEditor initialDeadline={config.picks_deadline} />
      </div>
      <AdminClient matches={matches} orgName={profile.name} />
      <PageFooter
        left="Pág. 7 de 7"
        center="acesso restrito à organização"
        right="boletim · vol. ii"
      />
    </main>
  );
}
