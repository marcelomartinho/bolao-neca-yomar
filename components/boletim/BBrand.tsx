import { BallMark } from "./BallMark";

type Props = {
  size?: number;
};

export function BBrand({ size = 22 }: Props) {
  return (
    <div className="text-ink flex items-center gap-2.5">
      <BallMark size={size + 6} color="#0b6b3a" />
      <div className="flex flex-col leading-none">
        <span
          className="font-cond text-ink font-bold uppercase tracking-wider"
          style={{ fontSize: size }}
        >
          Bolão Yomar e Família
        </span>
        <span className="text-gold font-mono mt-[3px] text-[9.5px] uppercase tracking-[0.18em]">
          Yomar e Família · Edição 11
        </span>
      </div>
    </div>
  );
}
