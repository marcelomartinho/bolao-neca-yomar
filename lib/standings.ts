import type { MatchRow } from "./db";
import type { TeamCode, Group } from "./static-data";

export type GroupStanding = {
  code: TeamCode;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export function computeGroupStandings(
  group: Group,
  matches: MatchRow[],
): GroupStanding[] {
  const init = new Map<TeamCode, GroupStanding>(
    group.teams.map((c) => [
      c,
      { code: c, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 },
    ]),
  );

  for (const m of matches) {
    if (m.group_letter !== group.letter) continue;
    const a = init.get(m.team_a as TeamCode);
    const b = init.get(m.team_b as TeamCode);
    if (!a || !b) continue;
    const scoreRow = m as unknown as { score_a: number | null; score_b: number | null };
    if (m.result == null || scoreRow.score_a == null || scoreRow.score_b == null) continue;
    a.played++;
    b.played++;
    a.gf += scoreRow.score_a;
    a.ga += scoreRow.score_b;
    b.gf += scoreRow.score_b;
    b.ga += scoreRow.score_a;
    if (m.result === "1") {
      a.wins++; a.points += 3;
      b.losses++;
    } else if (m.result === "2") {
      b.wins++; b.points += 3;
      a.losses++;
    } else {
      a.draws++; a.points += 1;
      b.draws++; b.points += 1;
    }
  }

  // Sort: pontos desc, saldo desc, gols pró desc, code asc (estável)
  return [...init.values()]
    .map((s) => ({ ...s, gd: s.gf - s.ga }))
    .sort((x, y) =>
      y.points - x.points ||
      y.gd - x.gd ||
      y.gf - x.gf ||
      x.code.localeCompare(y.code),
    );
}
