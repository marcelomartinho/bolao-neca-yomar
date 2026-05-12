import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchManagedProfiles } from "@/lib/active-profile";
import { PageHeader } from "@/components/boletim/PageHeader";
import { Avatar } from "@/components/Avatar";
import { Icon } from "@/components/Icon";
import { removeKid } from "./actions";

export const dynamic = "force-dynamic";

export default async function FamiliaPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  const profiles = await fetchManagedProfiles(user.id);
  const self = profiles.find((p) => !p.is_kid);
  const kids = profiles.filter((p) => p.is_kid);

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <PageHeader pageLabel="Família" subtitle="Você + filhos" />

      <div className="flex-1 px-5 py-6">
        <h1 className="font-cond text-3xl font-extrabold uppercase leading-none">
          Sua família<br />
          <span className="italic font-normal text-grass">no Bolão Yomar e Família.</span>
        </h1>
        <p className="text-ink2 mt-3 text-sm">
          Cadastre filhos pra palpitar pela cartela deles. Cada um tem ranking próprio.
        </p>

        <section className="mt-7">
          <span className="tag">Você</span>
          {self && (
            <div className="border-ink mt-1 flex items-center gap-3 border-2 bg-white/55 px-4 py-3">
              <Avatar
                name={self.name}
                initials={self.initials}
                emoji={self.emoji}
                size={48}
              />
              <div className="flex-1">
                <div className="font-cond text-lg font-bold uppercase">{self.name}</div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
                  {self.host ? "Organização" : "Participante"}
                </span>
              </div>
              <Link
                href={{ pathname: "/m/perfil", query: { profile_id: self.id } }}
                className="font-cond text-xs font-bold uppercase tracking-wider text-ink underline-offset-4 hover:underline"
              >
                Editar
              </Link>
            </div>
          )}
        </section>

        <section className="mt-7">
          <div className="flex items-baseline justify-between">
            <span className="tag">Filhos cadastrados ({kids.length})</span>
            <Link
              href="/m/familia/novo"
              className="font-cond inline-flex items-center gap-1.5 rounded-sm border-2 border-grass bg-grass px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-paper"
            >
              <Icon.Check s={12} /> Adicionar filho
            </Link>
          </div>
          {kids.length === 0 ? (
            <div className="border-line bg-paper2/60 mt-2 border-2 border-dashed px-4 py-6 text-center text-sm text-ink2">
              Nenhum filho cadastrado ainda.
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              {kids.map((k) => (
                <div
                  key={k.id}
                  className="border-line flex items-center gap-3 border bg-white/55 px-4 py-2.5"
                >
                  <Avatar
                    name={k.name}
                    initials={k.initials}
                    emoji={k.emoji}
                    size={36}
                  />
                  <div className="flex-1">
                    <div className="font-cond text-base font-bold uppercase">{k.name}</div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink2">
                      criança · gerenciado por você
                    </span>
                  </div>
                  <Link
                    href={{ pathname: "/m/perfil", query: { profile_id: k.id } }}
                    className="font-cond text-xs font-bold uppercase tracking-wider text-ink underline-offset-4 hover:underline"
                  >
                    Editar
                  </Link>
                  <form action={removeKid}>
                    <input type="hidden" name="kid_id" value={k.id} />
                    <button
                      type="submit"
                      className="font-cond text-xs font-bold uppercase tracking-wider text-red-700 underline-offset-4 hover:underline"
                    >
                      Remover
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
