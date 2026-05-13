// Dados oficiais Copa do Mundo FIFA 2026 (sorteio dezembro/2025).
// Fonte: Wikipedia + Aljazeera + worldcupwiki.com (mai/2026).
// 48 seleções, 12 grupos, 72 jogos da fase de grupos.
// Horários armazenados em ISO UTC; exibidos em BRT (UTC-3) no app.

export type TeamCode =
  | "MEX" | "RSA" | "KOR" | "CZE"
  | "CAN" | "BIH" | "QAT" | "SUI"
  | "BRA" | "MAR" | "HAI" | "SCO"
  | "USA" | "PAR" | "AUS" | "TUR"
  | "GER" | "CUR" | "CIV" | "ECU"
  | "NED" | "JPN" | "SWE" | "TUN"
  | "BEL" | "EGY" | "IRN" | "NZL"
  | "ESP" | "CPV" | "KSA" | "URU"
  | "FRA" | "SEN" | "IRQ" | "NOR"
  | "ARG" | "ALG" | "AUT" | "JOR"
  | "POR" | "COD" | "UZB" | "COL"
  | "ENG" | "CRO" | "GHA" | "PAN";

export type Team = {
  code: TeamCode;
  name: string;
  iso2: string;
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
  MEX: ["#006847", "#ffffff", "#ce1126"], RSA: ["#007749", "#ffb612", "#de3831"],
  KOR: ["#ffffff", "#003478", "#c60c30"], CZE: ["#ffffff", "#d7141a", "#11457e"],
  CAN: ["#d52b1e", "#ffffff", "#d52b1e"], BIH: ["#002395", "#fecb00", "#002395"],
  QAT: ["#8a1538", "#ffffff", "#8a1538"], SUI: ["#d52b1e", "#ffffff", "#d52b1e"],
  BRA: ["#009b3a", "#fedf00", "#002776"], MAR: ["#c1272d", "#006233", "#c1272d"],
  HAI: ["#00209f", "#d21034", "#00209f"], SCO: ["#005eb8", "#ffffff", "#005eb8"],
  USA: ["#b22234", "#ffffff", "#3c3b6e"], PAR: ["#d52b1e", "#ffffff", "#0038a8"],
  AUS: ["#012169", "#ffffff", "#e4002b"], TUR: ["#e30a17", "#ffffff", "#e30a17"],
  GER: ["#000000", "#dd0000", "#ffce00"], CUR: ["#012a87", "#f9e814", "#012a87"],
  CIV: ["#f77f00", "#ffffff", "#009e60"], ECU: ["#ffce00", "#034ea2", "#ed1c24"],
  NED: ["#ae1c28", "#ffffff", "#21468b"], JPN: ["#ffffff", "#bc002d", "#ffffff"],
  SWE: ["#005293", "#fecc00", "#005293"], TUN: ["#e70013", "#ffffff", "#e70013"],
  BEL: ["#000000", "#fae042", "#ed2939"], EGY: ["#ce1126", "#ffffff", "#000000"],
  IRN: ["#239f40", "#ffffff", "#da0000"], NZL: ["#012169", "#ffffff", "#cc142b"],
  ESP: ["#aa151b", "#f1bf00", "#aa151b"], CPV: ["#003893", "#ffffff", "#cf2027"],
  KSA: ["#006c35", "#ffffff", "#006c35"], URU: ["#7eb6ea", "#ffffff", "#7eb6ea"],
  FRA: ["#0055a4", "#ffffff", "#ef4135"], SEN: ["#00853f", "#fdef42", "#e31b23"],
  IRQ: ["#ce1126", "#ffffff", "#000000"], NOR: ["#ef2b2d", "#ffffff", "#002868"],
  ARG: ["#74acdf", "#ffffff", "#74acdf"], ALG: ["#006633", "#ffffff", "#d21034"],
  AUT: ["#ed2939", "#ffffff", "#ed2939"], JOR: ["#000000", "#ffffff", "#007a3d"],
  POR: ["#006600", "#006600", "#ff0000"], COD: ["#007fff", "#fae042", "#ce1021"],
  UZB: ["#1eb53a", "#ffffff", "#0099b5"], COL: ["#fcd116", "#003893", "#ce1126"],
  ENG: ["#ffffff", "#ce1124", "#ffffff"], CRO: ["#ff0000", "#ffffff", "#171796"],
  GHA: ["#ce1126", "#fcd116", "#006b3f"], PAN: ["#005293", "#ffffff", "#d21034"],
};

const ISO2: Record<TeamCode, string> = {
  MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz",
  CAN: "ca", BIH: "ba", QAT: "qa", SUI: "ch",
  BRA: "br", MAR: "ma", HAI: "ht", SCO: "gb-sct",
  USA: "us", PAR: "py", AUS: "au", TUR: "tr",
  GER: "de", CUR: "cw", CIV: "ci", ECU: "ec",
  NED: "nl", JPN: "jp", SWE: "se", TUN: "tn",
  BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz",
  ESP: "es", CPV: "cv", KSA: "sa", URU: "uy",
  FRA: "fr", SEN: "sn", IRQ: "iq", NOR: "no",
  ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo",
  POR: "pt", COD: "cd", UZB: "uz", COL: "co",
  ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
};

const NAMES: Record<TeamCode, string> = {
  MEX: "México", RSA: "África do Sul", KOR: "Coreia do Sul", CZE: "Tchéquia",
  CAN: "Canadá", BIH: "Bósnia e Herzegovina", QAT: "Catar", SUI: "Suíça",
  BRA: "Brasil", MAR: "Marrocos", HAI: "Haiti", SCO: "Escócia",
  USA: "Estados Unidos", PAR: "Paraguai", AUS: "Austrália", TUR: "Turquia",
  GER: "Alemanha", CUR: "Curaçao", CIV: "Costa do Marfim", ECU: "Equador",
  NED: "Holanda", JPN: "Japão", SWE: "Suécia", TUN: "Tunísia",
  BEL: "Bélgica", EGY: "Egito", IRN: "Irã", NZL: "Nova Zelândia",
  ESP: "Espanha", CPV: "Cabo Verde", KSA: "Arábia Saudita", URU: "Uruguai",
  FRA: "França", SEN: "Senegal", IRQ: "Iraque", NOR: "Noruega",
  ARG: "Argentina", ALG: "Argélia", AUT: "Áustria", JOR: "Jordânia",
  POR: "Portugal", COD: "RD Congo", UZB: "Uzbequistão", COL: "Colômbia",
  ENG: "Inglaterra", CRO: "Croácia", GHA: "Gana", PAN: "Panamá",
};

export function flagUrl(code: TeamCode, width: 20 | 40 | 80 | 160 = 40): string {
  return `https://flagcdn.com/w${width}/${ISO2[code]}.png`;
}

export const TEAMS: Record<TeamCode, Team> = Object.fromEntries(
  (Object.keys(NAMES) as TeamCode[]).map((code) => [
    code,
    { code, name: NAMES[code], iso2: ISO2[code], colors: COLORS[code] },
  ]),
) as Record<TeamCode, Team>;

export const GROUPS: Group[] = [
  { letter: "A", teams: ["MEX", "RSA", "KOR", "CZE"] },
  { letter: "B", teams: ["CAN", "BIH", "QAT", "SUI"] },
  { letter: "C", teams: ["BRA", "MAR", "HAI", "SCO"] },
  { letter: "D", teams: ["USA", "PAR", "AUS", "TUR"] },
  { letter: "E", teams: ["GER", "CUR", "CIV", "ECU"] },
  { letter: "F", teams: ["NED", "JPN", "SWE", "TUN"] },
  { letter: "G", teams: ["BEL", "EGY", "IRN", "NZL"] },
  { letter: "H", teams: ["ESP", "CPV", "KSA", "URU"] },
  { letter: "I", teams: ["FRA", "SEN", "IRQ", "NOR"] },
  { letter: "J", teams: ["ARG", "ALG", "AUT", "JOR"] },
  { letter: "K", teams: ["POR", "COD", "UZB", "COL"] },
  { letter: "L", teams: ["ENG", "CRO", "GHA", "PAN"] },
];

// 72 jogos da fase de grupos. Horários ET (Eastern Time, UTC-4 em junho).
// Convertidos para Date UTC (ET + 4h).
function dt(date: string, etTime: string): Date {
  // ET = EDT = UTC-4 em junho. UTC = ET + 4h.
  // Use UTC explícito sem ambiguidade.
  const [h, m] = etTime.split(":").map(Number);
  const [y, mo, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h + 4, m, 0));
}

type RawMatch = [number, string, string, GroupLetter, TeamCode, TeamCode, string];
const RAW: RawMatch[] = [
  [1, "2026-06-11", "15:00", "A", "MEX", "RSA", "Cidade do México — Estadio Azteca"],
  [2, "2026-06-11", "22:00", "A", "KOR", "CZE", "Zapopan — Estadio Akron"],
  [3, "2026-06-12", "15:00", "B", "CAN", "BIH", "Toronto — BMO Field"],
  [4, "2026-06-12", "21:00", "D", "USA", "PAR", "Inglewood — SoFi Stadium"],
  [5, "2026-06-13", "15:00", "B", "QAT", "SUI", "Santa Clara — Levi's Stadium"],
  [6, "2026-06-13", "18:00", "C", "BRA", "MAR", "East Rutherford — MetLife Stadium"],
  [7, "2026-06-13", "21:00", "C", "HAI", "SCO", "Foxborough — Gillette Stadium"],
  [8, "2026-06-14", "00:00", "D", "AUS", "TUR", "Vancouver — BC Place"],
  [9, "2026-06-14", "13:00", "E", "GER", "CUR", "Houston — NRG Stadium"],
  [10, "2026-06-14", "16:00", "F", "NED", "JPN", "Arlington — AT&T Stadium"],
  [11, "2026-06-14", "19:00", "E", "CIV", "ECU", "Philadelphia — Lincoln Financial Field"],
  [12, "2026-06-14", "22:00", "F", "SWE", "TUN", "Monterrey — Estadio BBVA"],
  [13, "2026-06-15", "12:00", "H", "ESP", "CPV", "Atlanta — Mercedes-Benz Stadium"],
  [14, "2026-06-15", "15:00", "G", "BEL", "EGY", "Seattle — Lumen Field"],
  [15, "2026-06-15", "18:00", "H", "KSA", "URU", "Miami Gardens — Hard Rock Stadium"],
  [16, "2026-06-15", "21:00", "G", "IRN", "NZL", "Inglewood — SoFi Stadium"],
  [17, "2026-06-16", "15:00", "I", "FRA", "SEN", "East Rutherford — MetLife Stadium"],
  [18, "2026-06-16", "18:00", "I", "IRQ", "NOR", "Foxborough — Gillette Stadium"],
  [19, "2026-06-16", "21:00", "J", "ARG", "ALG", "Kansas City — Arrowhead Stadium"],
  [20, "2026-06-17", "00:00", "J", "AUT", "JOR", "Santa Clara — Levi's Stadium"],
  [21, "2026-06-17", "13:00", "K", "POR", "COD", "Houston — NRG Stadium"],
  [22, "2026-06-17", "16:00", "L", "ENG", "CRO", "Arlington — AT&T Stadium"],
  [23, "2026-06-17", "19:00", "L", "GHA", "PAN", "Toronto — BMO Field"],
  [24, "2026-06-17", "22:00", "K", "UZB", "COL", "Cidade do México — Estadio Azteca"],
  [25, "2026-06-18", "12:00", "A", "CZE", "RSA", "Atlanta — Mercedes-Benz Stadium"],
  [26, "2026-06-18", "15:00", "B", "SUI", "BIH", "Inglewood — SoFi Stadium"],
  [27, "2026-06-18", "18:00", "B", "CAN", "QAT", "Vancouver — BC Place"],
  [28, "2026-06-18", "21:00", "A", "MEX", "KOR", "Zapopan — Estadio Akron"],
  [29, "2026-06-19", "15:00", "D", "USA", "AUS", "Seattle — Lumen Field"],
  [30, "2026-06-19", "18:00", "C", "SCO", "MAR", "Foxborough — Gillette Stadium"],
  [31, "2026-06-19", "20:30", "C", "BRA", "HAI", "Philadelphia — Lincoln Financial Field"],
  [32, "2026-06-19", "23:00", "D", "TUR", "PAR", "Santa Clara — Levi's Stadium"],
  [33, "2026-06-20", "13:00", "F", "NED", "SWE", "Houston — NRG Stadium"],
  [34, "2026-06-20", "16:00", "E", "GER", "CIV", "Toronto — BMO Field"],
  [35, "2026-06-20", "20:00", "E", "ECU", "CUR", "Kansas City — Arrowhead Stadium"],
  [36, "2026-06-21", "00:00", "F", "TUN", "JPN", "Monterrey — Estadio BBVA"],
  [37, "2026-06-21", "12:00", "H", "ESP", "KSA", "Atlanta — Mercedes-Benz Stadium"],
  [38, "2026-06-21", "15:00", "G", "BEL", "IRN", "Inglewood — SoFi Stadium"],
  [39, "2026-06-21", "18:00", "H", "URU", "CPV", "Miami Gardens — Hard Rock Stadium"],
  [40, "2026-06-21", "21:00", "G", "NZL", "EGY", "Vancouver — BC Place"],
  [41, "2026-06-22", "13:00", "J", "ARG", "AUT", "Arlington — AT&T Stadium"],
  [42, "2026-06-22", "17:00", "I", "FRA", "IRQ", "Philadelphia — Lincoln Financial Field"],
  [43, "2026-06-22", "20:00", "I", "NOR", "SEN", "East Rutherford — MetLife Stadium"],
  [44, "2026-06-22", "23:00", "J", "JOR", "ALG", "Santa Clara — Levi's Stadium"],
  [45, "2026-06-23", "13:00", "K", "POR", "UZB", "Houston — NRG Stadium"],
  [46, "2026-06-23", "16:00", "L", "ENG", "GHA", "Foxborough — Gillette Stadium"],
  [47, "2026-06-23", "19:00", "L", "PAN", "CRO", "Toronto — BMO Field"],
  [48, "2026-06-23", "22:00", "K", "COL", "COD", "Zapopan — Estadio Akron"],
  [49, "2026-06-24", "15:00", "B", "SUI", "CAN", "Vancouver — BC Place"],
  [50, "2026-06-24", "15:00", "B", "BIH", "QAT", "Seattle — Lumen Field"],
  [51, "2026-06-24", "18:00", "C", "SCO", "BRA", "Miami Gardens — Hard Rock Stadium"],
  [52, "2026-06-24", "18:00", "C", "MAR", "HAI", "Atlanta — Mercedes-Benz Stadium"],
  [53, "2026-06-24", "21:00", "A", "CZE", "MEX", "Cidade do México — Estadio Azteca"],
  [54, "2026-06-24", "21:00", "A", "RSA", "KOR", "Monterrey — Estadio BBVA"],
  [55, "2026-06-25", "16:00", "E", "CUR", "CIV", "Philadelphia — Lincoln Financial Field"],
  [56, "2026-06-25", "16:00", "E", "ECU", "GER", "East Rutherford — MetLife Stadium"],
  [57, "2026-06-25", "19:00", "F", "JPN", "SWE", "Arlington — AT&T Stadium"],
  [58, "2026-06-25", "19:00", "F", "TUN", "NED", "Kansas City — Arrowhead Stadium"],
  [59, "2026-06-25", "22:00", "D", "TUR", "USA", "Inglewood — SoFi Stadium"],
  [60, "2026-06-25", "22:00", "D", "PAR", "AUS", "Santa Clara — Levi's Stadium"],
  [61, "2026-06-26", "15:00", "I", "NOR", "FRA", "Foxborough — Gillette Stadium"],
  [62, "2026-06-26", "15:00", "I", "SEN", "IRQ", "Toronto — BMO Field"],
  [63, "2026-06-26", "20:00", "H", "CPV", "KSA", "Houston — NRG Stadium"],
  [64, "2026-06-26", "20:00", "H", "URU", "ESP", "Zapopan — Estadio Akron"],
  [65, "2026-06-26", "23:00", "G", "EGY", "IRN", "Seattle — Lumen Field"],
  [66, "2026-06-26", "23:00", "G", "NZL", "BEL", "Vancouver — BC Place"],
  [67, "2026-06-27", "17:00", "L", "PAN", "ENG", "East Rutherford — MetLife Stadium"],
  [68, "2026-06-27", "17:00", "L", "CRO", "GHA", "Philadelphia — Lincoln Financial Field"],
  [69, "2026-06-27", "19:30", "K", "COL", "POR", "Miami Gardens — Hard Rock Stadium"],
  [70, "2026-06-27", "19:30", "K", "COD", "UZB", "Atlanta — Mercedes-Benz Stadium"],
  [71, "2026-06-27", "22:00", "J", "ALG", "AUT", "Kansas City — Arrowhead Stadium"],
  [72, "2026-06-27", "22:00", "J", "JOR", "ARG", "Arlington — AT&T Stadium"],
];

export const MATCHES: Match[] = RAW.map(([id, date, time, g, a, b, city]) => ({
  id,
  group: g,
  round: ((id - 1) < 24 ? 1 : (id - 1) < 48 ? 2 : 3) as 1 | 2 | 3,
  a,
  b,
  startsAt: dt(date, time),
  city,
}));

export type Participant = {
  id: string;
  name: string;
  initials: string;
  host?: boolean;
  emoji?: string;
  score: number;
  pos: number;
};

// Mock só para mostrar a lista de Inscritos na capa pré-Copa.
// O ranking real vem do view `ranking` do Supabase.
export const PARTICIPANTS: Participant[] = [
  { id: "yomar", name: "Yomar", initials: "YO", host: true, score: 0, pos: 1 },
  { id: "marcelo", name: "Marcelo", initials: "MM", host: true, score: 0, pos: 2 },
  { id: "bruno", name: "Bruno Cesar", initials: "BC", host: true, score: 0, pos: 3 },
  { id: "nilcynea", name: "Nilcynéa", initials: "NI", score: 0, pos: 4 },
  { id: "anajulia", name: "Ana Julia", initials: "AJ", score: 0, pos: 5 },
  { id: "analuisa", name: "Ana Luisa", initials: "AL", score: 0, pos: 6 },
  { id: "belle", name: "Belle", initials: "BE", score: 0, pos: 7 },
  { id: "danilo", name: "Danilo", initials: "DA", score: 0, pos: 8 },
  { id: "fernanda", name: "Fernanda", initials: "FE", score: 0, pos: 9 },
  { id: "filipe", name: "Filipe", initials: "FI", score: 0, pos: 10 },
  { id: "ludmarci", name: "Ludmarci", initials: "LU", score: 0, pos: 11 },
  { id: "mila", name: "Mila", initials: "MI", score: 0, pos: 12 },
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
