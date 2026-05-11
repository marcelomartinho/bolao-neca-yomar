type Props = {
  name: string;
  initials?: string | null;
  emoji?: string | null;
  size?: number;
  ring?: string | null;
  className?: string;
};

function hashColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  const hue = Math.abs(h) % 360;
  return `oklch(0.75 0.10 ${hue})`;
}

export function Avatar({ name, initials, emoji, size = 36, ring, className }: Props) {
  const bg = hashColor(name);
  const label = emoji || initials || name.slice(0, 1).toUpperCase();
  return (
    <span
      className={`inline-flex items-center justify-center font-semibold ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: "999px",
        background: bg,
        color: "#0b2c5c",
        fontSize: size * 0.42,
        boxShadow: ring ? `0 0 0 3px ${ring}` : undefined,
        fontFamily: "var(--font-cond)",
      }}
      aria-label={name}
    >
      {label}
    </span>
  );
}
