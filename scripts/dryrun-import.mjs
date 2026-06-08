// Dry-run read-only: confere se TODOS os confrontos de grupo do openfootball 2026
// casam com nossos 72 jogos (cobertura do mapa nome->sigla). node scripts/dryrun-import.mjs
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });

const NAME_TO_CODE = {
  Algeria: "ALG", Argentina: "ARG", Australia: "AUS", Austria: "AUT", Belgium: "BEL",
  "Bosnia & Herzegovina": "BIH", Brazil: "BRA", Canada: "CAN", "Cape Verde": "CPV",
  Colombia: "COL", Croatia: "CRO", "Curaçao": "CUR", "Czech Republic": "CZE", "DR Congo": "COD",
  Ecuador: "ECU", Egypt: "EGY", England: "ENG", France: "FRA", Germany: "GER", Ghana: "GHA",
  Haiti: "HAI", Iran: "IRN", Iraq: "IRQ", "Ivory Coast": "CIV", Japan: "JPN", Jordan: "JOR",
  Mexico: "MEX", Morocco: "MAR", Netherlands: "NED", "New Zealand": "NZL", Norway: "NOR",
  Panama: "PAN", Paraguay: "PAR", Portugal: "POR", Qatar: "QAT", "Saudi Arabia": "KSA",
  Scotland: "SCO", Senegal: "SEN", "South Africa": "RSA", "South Korea": "KOR", Spain: "ESP",
  Sweden: "SWE", Switzerland: "SUI", Tunisia: "TUN", Turkey: "TUR", Uruguay: "URU", USA: "USA",
  Uzbekistan: "UZB",
};
const pk = (a, b) => [a, b].sort().join("|");

const of = await (
  await fetch("https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json")
).json();
const unmapped = new Set();
const officialPairs = new Set();
for (const m of of.matches ?? []) {
  if (!m.group) continue; // só fase de grupos
  const c1 = NAME_TO_CODE[m.team1];
  const c2 = NAME_TO_CODE[m.team2];
  if (!c1) unmapped.add(m.team1);
  if (!c2) unmapped.add(m.team2);
  if (c1 && c2) officialPairs.add(pk(c1, c2));
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
const { data: matches } = await supabase.from("matches").select("id,team_a,team_b");
const ourPairs = new Set((matches ?? []).map((m) => pk(m.team_a, m.team_b)));

const officialNotInOurs = [...officialPairs].filter((p) => !ourPairs.has(p));
const oursNotInOfficial = [...ourPairs].filter((p) => !officialPairs.has(p));

console.log("nomes não mapeados:", unmapped.size ? [...unmapped] : "nenhum ✓");
console.log("pares oficiais (grupo):", officialPairs.size);
console.log("nossos jogos:", ourPairs.size);
console.log("oficiais que NÃO casam com nossos:", officialNotInOurs.length ? officialNotInOurs : "nenhum ✓");
console.log("nossos que NÃO têm oficial:", oursNotInOfficial.length ? oursNotInOfficial : "nenhum ✓");
