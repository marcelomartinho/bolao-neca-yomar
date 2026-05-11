import { BBrand } from "./BBrand";

type Props = {
  pageLabel: string;
  subtitle?: string;
};

export function PageHeader({ pageLabel, subtitle }: Props) {
  return (
    <header className="flex items-end justify-between border-b-2 border-ink px-9 py-4">
      <BBrand size={20} />
      <div className="text-right">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
          {pageLabel}
        </div>
        {subtitle && <div className="font-cond text-lg font-bold">{subtitle}</div>}
      </div>
    </header>
  );
}
