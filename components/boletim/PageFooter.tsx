type Props = {
  left: string;
  center?: string;
  right: string;
};

export function PageFooter({ left, center, right }: Props) {
  return (
    <footer className="flex justify-between border-t-2 border-ink px-9 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink2">
      <span>{left}</span>
      {center && <span>{center}</span>}
      <span>{right}</span>
    </footer>
  );
}
