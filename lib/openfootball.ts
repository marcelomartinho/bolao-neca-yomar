// =============================================================
// openfootball.ts — busca resultados OFICIAIS da Copa 2026
// Fonte: openfootball/worldcup.json (grátis, público, sem token).
// Jogo finalizado tem score.ft = [gols_time1, gols_time2] (90').
// Mapeamos os nomes (inglês) pras nossas siglas e casamos por
// PAR de times (cada confronto de grupo é único).
// =============================================================

export const OPENFOOTBALL_2026_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

// Nome (inglês, como vem no openfootball) -> sigla do nosso banco.
const NAME_TO_CODE: Record<string, string> = {
  Algeria: "ALG",
  Argentina: "ARG",
  Australia: "AUS",
  Austria: "AUT",
  Belgium: "BEL",
  "Bosnia & Herzegovina": "BIH",
  Brazil: "BRA",
  Canada: "CAN",
  "Cape Verde": "CPV",
  Colombia: "COL",
  Croatia: "CRO",
  "Curaçao": "CUR",
  "Czech Republic": "CZE",
  "DR Congo": "COD",
  Ecuador: "ECU",
  Egypt: "EGY",
  England: "ENG",
  France: "FRA",
  Germany: "GER",
  Ghana: "GHA",
  Haiti: "HAI",
  Iran: "IRN",
  Iraq: "IRQ",
  "Ivory Coast": "CIV",
  Japan: "JPN",
  Jordan: "JOR",
  Mexico: "MEX",
  Morocco: "MAR",
  Netherlands: "NED",
  "New Zealand": "NZL",
  Norway: "NOR",
  Panama: "PAN",
  Paraguay: "PAR",
  Portugal: "POR",
  Qatar: "QAT",
  "Saudi Arabia": "KSA",
  Scotland: "SCO",
  Senegal: "SEN",
  "South Africa": "RSA",
  "South Korea": "KOR",
  Spain: "ESP",
  Sweden: "SWE",
  Switzerland: "SUI",
  Tunisia: "TUN",
  Turkey: "TUR",
  Uruguay: "URU",
  USA: "USA",
  Uzbekistan: "UZB",
};

// Aliases defensivos caso a fonte mude a grafia.
const ALIASES: Record<string, string> = {
  Czechia: "CZE",
  "Türkiye": "TUR",
  "Korea Republic": "KOR",
  "IR Iran": "IRN",
  "Côte d'Ivoire": "CIV",
  "Cabo Verde": "CPV",
  "United States": "USA",
};

function toCode(name: string | undefined): string | null {
  if (!name) return null;
  return NAME_TO_CODE[name] ?? ALIASES[name] ?? null;
}

export type OfficialMatch = {
  code1: string; // sigla do mandante (team1)
  code2: string; // sigla do visitante (team2)
  scoreA: number; // gols do code1 (tempo normal, 90')
  scoreB: number; // gols do code2
  date: string;
  round: string | null;
  raw: string; // ex.: "Mexico 3-1 South Africa" (log/erro)
};

type OFMatch = {
  team1?: string;
  team2?: string;
  date?: string;
  round?: string;
  score?: { ft?: number[] };
};

/**
 * Busca o JSON oficial e devolve só os jogos FINALIZADOS (com score.ft)
 * cujos dois times mapeiam pras nossas siglas. Lança em caso de erro de rede.
 */
export async function fetchOfficialResults(): Promise<OfficialMatch[]> {
  const res = await fetch(OPENFOOTBALL_2026_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`openfootball HTTP ${res.status}`);
  const data = (await res.json()) as { matches?: OFMatch[] };
  const out: OfficialMatch[] = [];
  for (const m of data.matches ?? []) {
    const ft = m.score?.ft;
    if (!Array.isArray(ft) || ft.length < 2) continue; // ainda não finalizado
    if (typeof ft[0] !== "number" || typeof ft[1] !== "number") continue; // placar nulo/parcial
    const a = ft[0];
    const b = ft[1];
    const c1 = toCode(m.team1);
    const c2 = toCode(m.team2);
    if (!c1 || !c2) continue; // mata-mata (placeholder) ou nome não mapeado
    out.push({
      code1: c1,
      code2: c2,
      scoreA: a,
      scoreB: b,
      date: m.date ?? "",
      round: m.round ?? null,
      raw: `${m.team1} ${a}-${b} ${m.team2}`,
    });
  }
  return out;
}

/** Chave de par de times (não ordenado) pra casar com nossos jogos. */
export function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}
