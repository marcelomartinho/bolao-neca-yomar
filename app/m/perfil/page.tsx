import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchManagedProfiles } from "@/lib/active-profile";
import { PageHeader } from "@/components/boletim/PageHeader";
import { Avatar } from "@/components/Avatar";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ saved?: string; error?: string; profile_id?: string }>;

export default async function PerfilEditPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  const managed = await fetchManagedProfiles(user.id);
  if (managed.length === 0) notFound();

  // Default to self; if ?profile_id, validate it belongs to managed list
  const requestedId = sp.profile_id;
  const target = requestedId
    ? managed.find((p) => p.id === requestedId)
    : managed.find((p) => !p.is_kid) ?? managed[0];
  if (!target) redirect("/m/familia?error=perfil-nao-encontrado");

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <PageHeader pageLabel="Família" subtitle="Editar perfil" />

      {managed.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-paper2/40 px-4 py-2">
          <span className="tag">Editar perfil de</span>
          {managed.map((p) => {
            const sel = p.id === target.id;
            return (
              <Link
                key={p.id}
                href={`/m/perfil?profile_id=${p.id}`}
                className="font-cond inline-flex items-center gap-1.5 rounded-sm border-[1.5px] px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
                style={{
                  borderColor: sel ? "#0b6b3a" : "#d5dde7",
                  background: sel ? "#0b6b3a" : "transparent",
                  color: sel ? "#fbfaf4" : "#0b2c5c",
                }}
              >
                {p.name}
                {p.is_kid && <span className="text-[10px] opacity-75">🧒</span>}
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex-1 px-6 py-7">
        <div className="flex items-center gap-4">
          <Avatar
            name={target.name}
            initials={target.initials}
            emoji={target.emoji}
            size={72}
          />
          <div>
            <h1 className="font-cond text-3xl font-extrabold uppercase leading-none">
              {target.name}
            </h1>
            <span className="tag">
              {target.is_kid ? "Filho(a) — gerenciado por você" : target.host ? "Organização" : "Participante"}
            </span>
          </div>
        </div>

        <form action={updateProfile} className="mt-7 flex flex-col gap-4">
          <input type="hidden" name="profile_id" value={target.id} />

          <label className="block">
            <span className="tag">Nome de exibição</span>
            <input
              type="text"
              name="name"
              required
              minLength={1}
              maxLength={40}
              defaultValue={target.name}
              placeholder="Como aparece no ranking"
              className="border-ink mt-1 w-full border-2 bg-white/60 px-3 py-3 font-sans text-base outline-none focus:border-grass"
            />
          </label>

          <label className="block">
            <span className="tag">Iniciais (até 2 letras)</span>
            <input
              type="text"
              name="initials"
              maxLength={2}
              defaultValue={target.initials ?? ""}
              placeholder="N"
              className="border-ink mt-1 w-32 border-2 bg-white/60 px-3 py-3 font-sans text-base uppercase outline-none focus:border-grass"
            />
          </label>

          <label className="block">
            <span className="tag">Emoji (opcional)</span>
            <input
              type="text"
              name="emoji"
              maxLength={4}
              defaultValue={target.emoji ?? ""}
              placeholder="👵 🦊 ⚽"
              className="border-ink mt-1 w-32 border-2 bg-white/60 px-3 py-3 font-sans text-2xl outline-none focus:border-grass"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-grass border-grass text-paper font-cond inline-flex items-center gap-2 rounded-sm border-2 px-5 py-3 text-sm font-bold uppercase tracking-wider"
            >
              Salvar
            </button>
            <Link
              href="/m/palpite"
              className="text-ink border-ink font-cond inline-flex items-center gap-2 rounded-sm border-2 bg-transparent px-5 py-3 text-sm font-bold uppercase tracking-wider"
            >
              Cancelar
            </Link>
          </div>
        </form>

        {sp.saved === "1" && (
          <div className="border-grass text-grass mt-6 border-2 bg-white/60 p-3 text-sm">
            Perfil atualizado.
          </div>
        )}
        {sp.error && (
          <div className="mt-6 border-2 border-red-700 bg-white/60 p-3 text-sm text-red-700">
            {sp.error.replace(/-/g, " ")}
          </div>
        )}
      </div>
    </main>
  );
}
