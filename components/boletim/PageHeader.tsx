import { BBrand } from "./BBrand";

type Props = {
  pageLabel: string;
  subtitle?: string;
};

export function PageHeader({ pageLabel, subtitle }: Props) {
  return (
    <header className="sticky top-0 z-40 flex flex-wrap items-end justify-between gap-2 border-b-2 border-ink bg-paper/95 px-4 py-3 backdrop-blur md:top-9 md:px-9 md:py-4">
      <BBrand size={16} />
      <div className="ml-auto text-right">
        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-gold md:text-[10px] md:tracking-[0.18em]">
          {pageLabel}
        </div>
        {subtitle && <div className="font-cond text-sm font-bold md:text-lg">{subtitle}</div>}
      </div>
    </header>
  );
}
