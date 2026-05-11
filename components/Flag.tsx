/* eslint-disable @next/next/no-img-element */
import type { TeamCode } from "@/lib/static-data";
import { flagUrl } from "@/lib/static-data";

type SizeKey = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<SizeKey, { w: number; h: number; src: 20 | 40 | 80 | 160 }> = {
  sm: { w: 18, h: 12, src: 20 },
  md: { w: 22, h: 14, src: 40 },
  lg: { w: 32, h: 22, src: 40 },
  xl: { w: 48, h: 32, src: 80 },
};

type FlagByCodeProps = {
  code: TeamCode;
  name?: string;
  size?: SizeKey;
  className?: string;
};

type FlagByColorsProps = {
  colors: [string, string, string];
  size?: SizeKey;
  className?: string;
};

type Props = FlagByCodeProps | FlagByColorsProps;

function isCodeProps(p: Props): p is FlagByCodeProps {
  return "code" in p;
}

export function Flag(props: Props) {
  const size = SIZE_MAP[props.size ?? "md"];
  const style: React.CSSProperties = {
    width: size.w,
    height: size.h,
    borderRadius: 2,
    display: "inline-block",
    verticalAlign: "middle",
    objectFit: "cover",
    boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
  };

  if (isCodeProps(props)) {
    const { code, name, className } = props;
    return (
      <img
        src={flagUrl(code, size.src)}
        srcSet={`${flagUrl(code, size.src)} 1x, ${flagUrl(code, (size.src * 2) as 40 | 80 | 160)} 2x`}
        alt={name ?? code}
        width={size.w}
        height={size.h}
        loading="lazy"
        decoding="async"
        style={style}
        className={className}
      />
    );
  }

  // Fallback: 3-stripe colors (used in /dev showcase only)
  const { colors, className } = props;
  return (
    <span
      className={`inline-flex overflow-hidden border border-black/10 align-middle ${className ?? ""}`}
      style={{ width: size.w, height: size.h, borderRadius: 2 }}
      aria-hidden
    >
      <span className="flex-1" style={{ background: colors[0] }} />
      <span className="flex-1" style={{ background: colors[1] }} />
      <span className="flex-1" style={{ background: colors[2] }} />
    </span>
  );
}
