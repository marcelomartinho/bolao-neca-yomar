import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TriRule } from "@/components/boletim/TriRule";
import { BBrand } from "@/components/boletim/BBrand";
import { Avatar } from "@/components/Avatar";
import { updateProfile } from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ saved?: string; error?: string }>;

export default async function PerfilEditPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
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

  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <TriRule height={4} />
      <header className="flex items-center justify-between border-b-2 border-ink px-5 py-2.5">
        <BBrand size={16} />
        <span className="tag">Perfil</span>
      </header>

      <div className="flex-1 px-6 py-8">
        <div className="flex items-center gap-4">
          <Avatar
            name={profile?.name ?? "?"}
            initials={profile?.initials}
            emoji={profile?.emoji}
            size={72}
          />
          <div>
            <h1 className="font-cond text-3xl font-extrabold uppercase leading-none">
              {profile?.name ?? "Sem nome"}
            </h1>
            <span className="tag">{profile?.host ? "Organização" : "Participante"}</span>
          </div>
        </div>

        <form action={updateProfile} className="mt-7 flex flex-col gap-4">
          <label className="block">
            <span className="tag">Nome de exibição</span>
            <input
              type="text"
              name="name"
              required
              minLength={1}
              maxLength={40}
              defaultValue={profile?.name ?? ""}
              placeholder="Belle"
              className="border-ink mt-1 w-full border-2 bg-white/60 px-3 py-3 font-sans text-base outline-none focus:border-grass"
            />
          </label>

          <label className="block">
            <span className="tag">Iniciais (até 2 letras)</span>
            <input
              type="text"
              name="initials"
              maxLength={2}
              defaultValue={profile?.initials ?? ""}
              placeholder="B"
              className="border-ink mt-1 w-32 border-2 bg-white/60 px-3 py-3 font-sans text-base uppercase outline-none focus:border-grass"
            />
          </label>

          <label className="block">
            <span className="tag">Emoji (opcional)</span>
            <input
              type="text"
              name="emoji"
              maxLength={4}
              defaultValue={profile?.emoji ?? ""}
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
            <a
              href="/m/palpite"
              className="text-ink border-ink font-cond inline-flex items-center gap-2 rounded-sm border-2 bg-transparent px-5 py-3 text-sm font-bold uppercase tracking-wider"
            >
              Cancelar
            </a>
          </div>
        </form>

        {sp.saved === "1" && (
          <div className="border-grass text-grass mt-6 border-2 bg-white/60 p-3 text-sm">
            Perfil atualizado.
          </div>
        )}
        {sp.error && (
          <div className="mt-6 border-2 border-red-700 bg-white/60 p-3 text-sm text-red-700">
            {sp.error}
          </div>
        )}
      </div>
    </main>
  );
}
