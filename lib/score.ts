import type { Pick } from "./supabase/types";

export function scoreForPick(pick: Pick | null, result: Pick | null): 0 | 1 {
  if (!pick || !result) return 0;
  return pick === result ? 1 : 0;
}

export function distributePrize(
  scores: Array<{ id: string; score: number }>,
  prizes: { first: number; second: number },
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
  return out;
}
