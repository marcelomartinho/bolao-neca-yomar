export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-6 px-6 py-16">
      <span className="tag">vol. ii — copa do mundo 2026</span>
      <h1 className="font-cond text-6xl font-extrabold uppercase leading-[0.9] tracking-tight">
        O Bolão da família<br />
        <span className="text-grass italic font-normal">está voltando.</span>
      </h1>
      <p className="max-w-prose text-base leading-relaxed">
        Boletim periódico do bolão Neca &amp; Yomar para a Copa do Mundo de 2026. 48 seleções, 12
        grupos, 72 jogos. Marca 1, X ou 2 — quem somar mais acertos leva.
      </p>
      <div className="flex gap-3">
        <a
          href="/m/login"
          className="bg-grass border-grass text-paper font-cond inline-flex items-center gap-2 rounded-sm border-2 px-5 py-3 text-sm font-bold uppercase tracking-wider"
        >
          Entrar agora
        </a>
        <a
          href="/regulamento"
          className="text-ink border-ink font-cond inline-flex items-center gap-2 rounded-sm border-2 bg-transparent px-5 py-3 text-sm font-bold uppercase tracking-wider"
        >
          Regulamento
        </a>
      </div>
      <p className="tag mt-8">scaffold em construção · sprint 1 · pr1</p>
    </main>
  );
}
