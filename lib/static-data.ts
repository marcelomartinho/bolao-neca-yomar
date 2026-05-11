// Dados estáticos da Copa 2026 — espelham supabase/migrations/0003_seed.sql.
// Usados em RSC enquanto não conectamos Supabase nas telas estáticas.
// Substituir por queries reais no Sprint 3 (lib/db/*).

export type TeamCode =
  | "MEX" | "COL" | "NOR" | "UZB" | "CAN" | "BEL" | "TUN" | "NZL"
  | "USA" | "CRO" | "PAR" | "JOR" | "BRA" | "SUI" | "SEN" | "KSA"
  | "ARG" | "JPN" | "EGY" | "CPV" | "FRA" | "DEN" | "NGA" | "PAN"
  | "ESP" | "KOR" | "CIV" | "JAM" | "ENG" | "POL" | "ALG" | "RSA"
  | "GER" | "ECU" | "CMR" | "QAT" | "POR" | "URU" | "IRN" | "AUS"
  | "ITA" | "SRB" | "MAR" | "TUR" | "NED" | "AUT" | "GHA" | "CRC";

export type Team = {
  code: TeamCode;
  name: string;
  colors: [string, string, string];
};

export type GroupLetter =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

export type Group = {
  letter: GroupLetter;
  teams: [TeamCode, TeamCode, TeamCode, TeamCode];
};

export type Match = {
  id: number;
  group: GroupLetter;
  round: 1 | 2 | 3;
  a: TeamCode;
  b: TeamCode;
  startsAt: Date;
  city: string;
};

const COLORS: Record<TeamCode, [string, string, string]> = {
  BRA: ["#009b3a", "#fedf00", "#002776"], ARG: ["#74acdf", "#ffffff", "#74acdf"],
  USA: ["#b22234", "#ffffff", "#3c3b6e"], MEX: ["#006847", "#ffffff", "#ce1126"],
  CAN: ["#d52b1e", "#ffffff", "#d52b1e"], ESP: ["#aa151b", "#f1bf00", "#aa151b"],
  FRA: ["#0055a4", "#ffffff", "#ef4135"], ENG: ["#ffffff", "#ce1124", "#ffffff"],
  GER: ["#000000", "#dd0000", "#ffce00"], POR: ["#006600", "#006600", "#ff0000"],
  ITA: ["#008c45", "#f4f5f0", "#cd212a"], BEL: ["#000000", "#fae042", "#ed2939"],
  NED: ["#ae1c28", "#ffffff", "#21468b"], CRO: ["#171796", "#ffffff", "#ff0000"],
  SUI: ["#d52b1e", "#ffffff", "#d52b1e"], DEN: ["#c8102e", "#ffffff", "#c8102e"],
  POL: ["#ffffff", "#dc143c", "#dc143c"], SRB: ["#c6363c", "#0c4076", "#ffffff"],
  AUT: ["#ed2939", "#ffffff", "#ed2939"], NOR: ["#ef2b2d", "#ffffff", "#002868"],
  TUR: ["#e30a17", "#ffffff", "#e30a17"], URU: ["#7eb6ea", "#ffffff", "#7eb6ea"],
  COL: ["#fcd116", "#003893", "#ce1126"], ECU: ["#ffce00", "#034ea2", "#ed1c24"],
  PAR: ["#d52b1e", "#ffffff", "#0038a8"], JPN: ["#ffffff", "#bc002d", "#ffffff"],
  KOR: ["#ffffff", "#003478", "#ffffff"], AUS: ["#012169", "#ffffff", "#e4002b"],
  IRN: ["#239f40", "#ffffff", "#da0000"], JOR: ["#000000", "#ffffff", "#007a3d"],
  UZB: ["#1eb53a", "#ffffff", "#0099b5"], KSA: ["#006c35", "#ffffff", "#006c35"],
  QAT: ["#8a1538", "#ffffff", "#8a1538"], MAR: ["#c1272d", "#006233", "#c1272d"],
  TUN: ["#e70013", "#ffffff", "#e70013"], SEN: ["#00853f", "#fdef42", "#e31b23"],
  EGY: ["#ce1126", "#ffffff", "#000000"], ALG: ["#006633", "#ffffff", "#d21034"],
  NGA: ["#008753", "#ffffff", "#008753"], GHA: ["#ce1126", "#fcd116", "#006b3f"],
  CMR: ["#007a5e", "#ce1126", "#fcd116"], CIV: ["#f77f00", "#ffffff", "#009e60"],
  RSA: ["#007749", "#ffb612", "#de3831"], CPV: ["#003893", "#ffffff", "#cf2027"],
  CRC: ["#002b7f", "#ffffff", "#ce1126"], JAM: ["#009b3a", "#000000", "#ffd100"],
  PAN: ["#005293", "#ffffff", "#d21034"], NZL: ["#012169", "#ffffff", "#cc142b"],
};

const NAMES: Record<TeamCode, string> = {
  MEX: "México", USA: "Estados Unidos", CAN: "Canadá", BRA: "Brasil",
  ARG: "Argentina", FRA: "França", ESP: "Espanha", ENG: "Inglaterra",
  GER: "Alemanha", POR: "Portugal", ITA: "Itália", BEL: "Bélgica",
  NED: "Holanda", CRO: "Croácia", SUI: "Suíça", DEN: "Dinamarca",
  POL: "Polônia", SRB: "Sérvia", AUT: "Áustria", NOR: "Noruega",
  TUR: "Turquia", URU: "Uruguai", COL: "Colômbia", ECU: "Equador",
  PAR: "Paraguai", JPN: "Japão", KOR: "Coreia do Sul", AUS: "Austrália",
  IRN: "Irã", JOR: "Jordânia", UZB: "Uzbequistão", KSA: "Arábia Saudita",
  QAT: "Catar", MAR: "Marrocos", TUN: "Tunísia", SEN: "Senegal",
  EGY: "Egito", ALG: "Argélia", NGA: "Nigéria", GHA: "Gana",
  CMR: "Camarões", CIV: "Costa do Marfim", RSA: "África do Sul",
  CPV: "Cabo Verde", CRC: "Costa Rica", JAM: "Jamaica", PAN: "Panamá",
  NZL: "Nova Zelândia",
};

export const TEAMS: Record<TeamCode, Team> = Object.fromEntries(
  (Object.keys(NAMES) as TeamCode[]).map((code) => [
    code,
    { code, name: NAMES[code], colors: COLORS[code] },
  ]),
) as Record<TeamCode, Team>;

export const GROUPS: Group[] = [
  { letter: "A", teams: ["MEX", "COL", "NOR", "UZB"] },
  { letter: "B", teams: ["CAN", "BEL", "TUN", "NZL"] },
  { letter: "C", teams: ["USA", "CRO", "PAR", "JOR"] },
  { letter: "D", teams: ["BRA", "SUI", "SEN", "KSA"] },
  { letter: "E", teams: ["ARG", "JPN", "EGY", "CPV"] },
  { letter: "F", teams: ["FRA", "DEN", "NGA", "PAN"] },
  { letter: "G", teams: ["ESP", "KOR", "CIV", "JAM"] },
  { letter: "H", teams: ["ENG", "POL", "ALG", "RSA"] },
  { letter: "I", teams: ["GER", "ECU", "CMR", "QAT"] },
  { letter: "J", teams: ["POR", "URU", "IRN", "AUS"] },
  { letter: "K", teams: ["ITA", "SRB", "MAR", "TUR"] },
  { letter: "L", teams: ["NED", "AUT", "GHA", "CRC"] },
];

const PAIRS: Array<[number, number, 1 | 2 | 3]> = [
  [0, 1, 1], [2, 3, 1],
  [0, 2, 2], [1, 3, 2],
  [0, 3, 3], [1, 2, 3],
];

const CITIES = [
  "Cidade do México", "Los Angeles", "Toronto", "Nova Iorque", "Dallas",
  "Miami", "Atlanta", "Vancouver", "Monterrey", "Filadélfia",
  "Seattle", "Houston", "Guadalajara", "Kansas City", "San Francisco", "Boston",
];

function buildMatches(): Match[] {
  const all: Array<Omit<Match, "id" | "startsAt" | "city">> = [];
  for (const g of GROUPS) {
    for (const [i, j, round] of PAIRS) {
      all.push({ group: g.letter, round, a: g.teams[i], b: g.teams[j] });
    }
  }
  all.sort((x, y) => x.round - y.round || x.group.localeCompare(y.group));
  const start = new Date(Date.UTC(2026, 5, 11, 16, 0, 0)); // 11 jun 2026, 13h BRT
  const HOURS_BRT = [13, 16, 19, 22];
  return all.map((m, i) => {
    const dayOffset = Math.floor(i / 4);
    const slot = i % 4;
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + dayOffset);
    d.setUTCHours(HOURS_BRT[slot] + 3, 0, 0, 0); // BRT = UTC-3
    return { ...m, id: i + 1, startsAt: d, city: CITIES[(i * 3) % CITIES.length] };
  });
}

export const MATCHES: Match[] = buildMatches();

export type Participant = {
  id: string;
  name: string;
  initials: string;
  host?: boolean;
  emoji?: string;
  score: number;
  pos: number;
};

export const PARTICIPANTS: Participant[] = [
  { id: "neca", name: "Neca", initials: "N", host: true, score: 17, pos: 1 },
  { id: "yomar", name: "Yomar", initials: "Y", host: true, score: 16, pos: 2 },
  { id: "belle", name: "Belle", initials: "B", score: 15, pos: 3 },
  { id: "lud", name: "Lud", initials: "L", score: 14, pos: 4 },
  { id: "mila", name: "Mila", initials: "M", score: 14, pos: 4 },
  { id: "bruno", name: "Bruno", initials: "Br", score: 12, pos: 6 },
  { id: "bento", name: "Bento", initials: "Bt", score: 11, pos: 7 },
  { id: "tio", name: "Tio Zé", initials: "Z", score: 10, pos: 8 },
  { id: "vovo", name: "Vó Cida", initials: "C", emoji: "👵", score: 8, pos: 9 },
];

export const PRIZES = { first: 10000, second: 5000 };

export function formatBRT(d: Date): string {
  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDayBRT(d: Date): string {
  const days = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const sao = new Date(d.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const day = String(sao.getDate()).padStart(2, "0");
  const month = String(sao.getMonth() + 1).padStart(2, "0");
  return `${days[sao.getDay()]} ${day}/${month}`;
}

export function dateKeyBRT(d: Date): string {
  return d.toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" }).slice(0, 10);
}
