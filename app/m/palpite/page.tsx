import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TriRule } from "@/components/boletim/TriRule";
import { BBrand } from "@/components/boletim/BBrand";

export default async function PalpitePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  return (
    <main className="paper-bg min-h-screen flex flex-col">
      <TriRule height={4} />
      <header className="flex items-center justify-between border-b-2 border-ink px-5 py-3">
        <BBrand size={16} />
        <span className="tag">Cartela</span>
      </header>
      <div className="flex-1 px-6 py-10">
        <p className="tag">Sessão ativa</p>
        <h1 className="font-cond mt-1 text-3xl font-extrabold uppercase leading-tight">
          Olá, {user.email}
        </h1>
        <p className="text-ink2 mt-4 text-sm">
          Cartela do dia chega no Sprint 3. Por enquanto, login funciona.
        </p>
        <form action="/m/logout" method="POST" className="mt-8">
          <button
            type="submit"
            className="border-ink text-ink font-cond inline-flex items-center gap-2 rounded-sm border-2 bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider"
          >
            Sair
          </button>
        </form>
      </div>
    </main>
  );
}
