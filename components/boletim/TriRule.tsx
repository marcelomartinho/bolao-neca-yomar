type Props = {
  height?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function TriRule({ height = 3, className, style }: Props) {
  return (
    <div className={`flex w-full ${className ?? ""}`} style={{ height, ...style }} aria-hidden>
      <div className="bg-grass flex-1" />
      <div className="bg-gold flex-1" />
      <div className="bg-bluebr flex-1" />
    </div>
  );
}
