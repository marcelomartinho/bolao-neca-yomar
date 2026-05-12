type Props = {
  left: string;
  center?: string;
  right: string;
};

export function PageFooter({ left, center, right }: Props) {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-2 border-t-2 border-ink px-4 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-ink2 md:px-9 md:text-[10.5px] md:tracking-[0.12em]">
      <span>{left}</span>
      {center && <span className="hidden md:inline">{center}</span>}
      <span>{right}</span>
    </footer>
  );
}
