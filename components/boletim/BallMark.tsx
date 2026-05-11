type Props = {
  size?: number;
  color?: string;
  className?: string;
};

// Pentágono central + linhas radiais — gravetos preto/branco da bola de futebol.
// Paths fielmente copiados do design (`_design/.../shared.jsx`).
export function BallMark({ size = 24, color = "currentColor", className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10.5" stroke={color} strokeWidth="1.5" />
      <path d="M12 5l3.2 2.3 -1.2 3.8h-4l-1.2-3.8L12 5z" fill={color} />
      <path d="M12 5v3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M5 11l3 1.2M19 11l-3 1.2M9 18l1.2-3M15 18l-1.2-3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
