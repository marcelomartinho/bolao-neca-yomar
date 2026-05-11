import Link from "next/link";
import { TriRule } from "@/components/boletim/TriRule";
import { Stamp } from "@/components/boletim/Stamp";
import { BBrand } from "@/components/boletim/BBrand";

export default function NotFound() {
  return (
    <main className="paper-bg flex min-h-screen flex-col text-ink">
      <TriRule height={3} />
      <header className="flex items-center justify-between border-b-2 border-ink px-9 py-4">
        <BBrand size={20} />
        <span className="tag">Erro 404</span>
      </header>
      <div className="flex flex-1 items-center justify-center px-9">
        <div className="text-center">
          <Stamp color="#c79410" rot={-4}>Página fora do ar</Stamp>
          <h1 className="font-cond mt-6 text-7xl font-extrabold uppercase leading-[0.9]">
            404 <br />
            <span className="text-grass italic font-normal text-5xl">não encontrada.</span>
          </h1>
          <p className="text-ink2 mx-auto mt-5 max-w-md text-base leading-relaxed">
            Esta página não consta no boletim. Volte pra capa, leia o regulamento, ou
            entre na cartela.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <Link
              href="/"
              className="bg-ink border-ink text-paper font-cond inline-flex items-center gap-2 rounded-sm border-2 px-5 py-3 text-sm font-bold uppercase tracking-wider"
            >
              Capa do boletim
            </Link>
            <Link
              href="/regulamento"
              className="text-ink border-ink font-cond inline-flex items-center gap-2 rounded-sm border-2 bg-transparent px-5 py-3 text-sm font-bold uppercase tracking-wider"
            >
              Regulamento
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
