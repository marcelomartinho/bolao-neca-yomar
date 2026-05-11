type Props = {
  colors: [string, string, string];
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeMap: Record<NonNullable<Props["size"]>, { w: number; h: number; r: number }> = {
  sm: { w: 18, h: 12, r: 2 },
  md: { w: 22, h: 14, r: 2 },
  lg: { w: 32, h: 20, r: 3 },
  xl: { w: 48, h: 32, r: 4 },
};

export function Flag({ colors, size = "md", className }: Props) {
  const s = sizeMap[size];
  return (
    <span
      className={`inline-flex overflow-hidden border border-black/10 align-middle ${className ?? ""}`}
      style={{ width: s.w, height: s.h, borderRadius: s.r }}
      aria-hidden
    >
      <span className="flex-1" style={{ background: colors[0] }} />
      <span className="flex-1" style={{ background: colors[1] }} />
      <span className="flex-1" style={{ background: colors[2] }} />
    </span>
  );
}
