type Props = {
  children: React.ReactNode;
  color?: string;
  rot?: number;
  className?: string;
};

export function Stamp({ children, color = "#0b6b3a", rot = -4, className }: Props) {
  return (
    <span
      className={`font-cond inline-flex items-center gap-1.5 rounded-md border-2 px-2.5 py-1 text-[13px] font-bold uppercase tracking-wider ${className ?? ""}`}
      style={{
        borderColor: color,
        color,
        transform: `rotate(${rot}deg)`,
        background: "rgba(255,255,255,0.4)",
      }}
    >
      {children}
    </span>
  );
}
