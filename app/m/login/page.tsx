import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signInWithMagicLink } from "./actions";
import { TriRule } from "@/components/boletim/TriRule";
import { BBrand } from "@/components/boletim/BBrand";
import { MagicLinkSubmit } from "./MagicLinkSubmit";

type SearchParams = { sent?: string; error?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/m/palpite");

  return (
    <main className="paper-bg flex min-h-screen flex-col">
      <TriRule height={4} />
      <header className="flex items-center justify-between border-b-2 border-ink px-5 py-3">
        <BBrand size={16} />
        <span className="tag">Entrar</span>
      </header>

      <div className="flex-1 px-6 py-10">
        <p className="tag">Boletim periódico da família</p>
        <h1 className="font-cond mt-1 text-4xl font-extrabold uppercase leading-[0.95]">
          Bem-vindo de volta<br />
          <span className="text-grass italic font-normal">à mesa do bolão.</span>
        </h1>
        <p className="text-ink2 mt-4 text-sm leading-relaxed">
          Digite seu e-mail. Mandamos um link mágico. Sem senha, sem app — abre e palpita.
        </p>

        <form action={signInWithMagicLink} className="mt-8 space-y-4">
          <label className="block">
            <span className="tag">E-mail</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="voce@familia.com"
              className="border-ink mt-1 w-full border-2 bg-white/60 px-3 py-3 font-sans text-base outline-none focus:border-grass"
            />
          </label>
          <MagicLinkSubmit />
        </form>

        {sp.sent === "1" && (
          <div className="border-grass text-grass mt-6 border-2 bg-white/60 p-4 text-sm">
            Link enviado. Confira seu e-mail (e a caixa de spam).
          </div>
        )}
        {sp.error && (
          <div className="mt-6 border-2 border-red-700 bg-white/60 p-4 text-sm text-red-700">
            Não consegui mandar o link: {sp.error}
          </div>
        )}
      </div>

      <footer className="border-t-2 border-ink px-5 py-3 text-center">
        <span className="tag">Bolão Neca &amp; Yomar · Copa 2026</span>
      </footer>
    </main>
  );
}
