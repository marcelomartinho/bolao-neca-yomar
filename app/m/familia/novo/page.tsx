import Link from "next/link";
import { PageHeader } from "@/components/boletim/PageHeader";
import { addKid } from "../actions";

type SearchParams = Promise<{ error?: string }>;

export default async function NovoFilhoPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <PageHeader pageLabel="Família" subtitle="Adicionar filho(a)" />

      <div className="flex-1 px-6 py-7">
        <h1 className="font-cond text-3xl font-extrabold uppercase leading-none">
          Adicionar<br />
          <span className="italic font-normal text-grass">um(a) filho(a).</span>
        </h1>
        <p className="text-ink2 mt-3 text-sm">
          O perfil fica vinculado a você. Você palpita pelos filhos pelo seu próprio login.
        </p>

        <form action={addKid} className="mt-7 flex flex-col gap-4">
          <label className="block">
            <span className="tag">Nome</span>
            <input
              type="text"
              name="name"
              required
              minLength={1}
              maxLength={40}
              placeholder="Bento"
              className="border-ink mt-1 w-full border-2 bg-white/60 px-3 py-3 font-sans text-base outline-none focus:border-grass"
            />
          </label>

          <label className="block">
            <span className="tag">Iniciais (até 2 letras)</span>
            <input
              type="text"
              name="initials"
              maxLength={2}
              placeholder="Bt"
              className="border-ink mt-1 w-32 border-2 bg-white/60 px-3 py-3 font-sans text-base uppercase outline-none focus:border-grass"
            />
          </label>

          <label className="block">
            <span className="tag">Emoji (opcional)</span>
            <input
              type="text"
              name="emoji"
              maxLength={4}
              placeholder="🦊 ⚽ 🌟"
              className="border-ink mt-1 w-32 border-2 bg-white/60 px-3 py-3 font-sans text-2xl outline-none focus:border-grass"
            />
          </label>

          <label className="block">
            <span className="tag">Data de nascimento (opcional)</span>
            <input
              type="date"
              name="birthdate"
              className="border-ink mt-1 border-2 bg-white/60 px-3 py-3 font-mono text-sm outline-none focus:border-grass"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-grass border-grass text-paper font-cond inline-flex items-center gap-2 rounded-sm border-2 px-5 py-3 text-sm font-bold uppercase tracking-wider"
            >
              Cadastrar
            </button>
            <Link
              href="/m/familia"
              className="text-ink border-ink font-cond inline-flex items-center gap-2 rounded-sm border-2 bg-transparent px-5 py-3 text-sm font-bold uppercase tracking-wider"
            >
              Cancelar
            </Link>
          </div>
        </form>

        {sp.error && (
          <div className="mt-6 border-2 border-red-700 bg-white/60 p-3 text-sm text-red-700">
            {sp.error.replace(/-/g, " ")}
          </div>
        )}
      </div>
    </main>
  );
}
