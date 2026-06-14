import type { Pick } from "./supabase/types";

export function scoreForPick(pick: Pick | null, result: Pick | null): 0 | 1 {
  if (!pick || !result) return 0;
  return pick === result ? 1 : 0;
}

/**
 * Distribui a premiação entre os elegíveis.
 *
 * IMPORTANTE: a lista `scores` deve conter APENAS os elegíveis — o caller é
 * responsável por remover Agente Y, o Yomar (Avôtrocinador, não recebe) e as
 * cartelas em branco (quem não palpitou não disputa o último lugar).
 *
 * Faixas:
 *  - `first`  → maior pontuação (rateado em empate);
 *  - `second` → segunda maior (rateado em empate);
 *  - `last`   → menor pontuação, prêmio de consolação (rateado em empate).
 *
 * A consolação só é paga quando a lanterna é estritamente menor que a 2ª
 * faixa — em campos pequenos (todos no 1º/2º) ninguém recebe consolação,
 * evitando pagar o mesmo jogador duas vezes.
 */
export function distributePrize(
  scores: Array<{ id: string; score: number }>,
  prizes: { first: number; second: number; last?: number },
): Record<string, number> {
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  if (sorted.length === 0) return {};

  const topScore = sorted[0].score;
  const secondScore = sorted.find((s) => s.score < topScore)?.score;

  const winners = sorted.filter((s) => s.score === topScore);
  const runnerUps = secondScore !== undefined ? sorted.filter((s) => s.score === secondScore) : [];

  const out: Record<string, number> = {};
  const firstShare = prizes.first / winners.length;
  winners.forEach((w) => (out[w.id] = firstShare));
  if (runnerUps.length > 0) {
    const secondShare = prizes.second / runnerUps.length;
    runnerUps.forEach((r) => (out[r.id] = (out[r.id] ?? 0) + secondShare));
  }

  // Consolação (lanterna). Só paga se a menor faixa for estritamente abaixo
  // da 2ª — assim não há sobreposição com 1º/2º em campos pequenos.
  if (prizes.last !== undefined && secondScore !== undefined) {
    const lastScore = sorted[sorted.length - 1].score;
    if (lastScore < secondScore) {
      const lastPlacers = sorted.filter((s) => s.score === lastScore);
      const lastShare = prizes.last / lastPlacers.length;
      lastPlacers.forEach((l) => (out[l.id] = (out[l.id] ?? 0) + lastShare));
    }
  }

  return out;
}
