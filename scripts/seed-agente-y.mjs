// =============================================================
// seed-agente-y.mjs — aplica o efeito da migration 0014 na prod
// via service-role (bypassa RLS). Idempotente (upsert).
// Lê os 72 palpites do próprio supabase/migrations/0014_agente_y.sql
// pra não duplicar a fonte de verdade.
//
//   node scripts/seed-agente-y.mjs
// =============================================================
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const AGENT_Y_ID = "00000000-0000-4000-8000-0000000000a7";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(here, "..", "supabase", "migrations", "0014_agente_y.sql"), "utf8");

// Extrai tuplas de picks: ( '<uuid>', <match_id>, '<1|X|2>' )
const re = /\(\s*'[0-9a-f-]{36}'\s*,\s*(\d+)\s*,\s*'([1X2])'\s*\)/gi;
const picks = [];
let m;
while ((m = re.exec(sql)) !== null) {
  picks.push({ user_id: AGENT_Y_ID, match_id: Number(m[1]), pick: m[2] });
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { error: pErr } = await supabase
  .from("profiles")
  .upsert(
    { id: AGENT_Y_ID, name: "Agente Y", initials: "AY", emoji: "🤖", host: false },
    { onConflict: "id" },
  );
if (pErr) {
  console.error("Falha ao criar perfil Agente Y:", pErr.message);
  process.exit(1);
}
console.log("✓ Perfil Agente Y pronto");

if (picks.length !== 72) {
  console.error(`Esperava 72 palpites no .sql, achei ${picks.length}. Abortando.`);
  process.exit(1);
}

const { error: kErr } = await supabase
  .from("picks")
  .upsert(picks, { onConflict: "user_id,match_id" });
if (kErr) {
  console.error("Falha ao inserir palpites:", kErr.message);
  process.exit(1);
}
console.log(`✓ ${picks.length} palpites do Agente Y gravados`);

const { data: rank, error: rErr } = await supabase
  .from("ranking")
  .select("name,score,resolved,total_picks")
  .eq("id", AGENT_Y_ID)
  .maybeSingle();
if (rErr) console.error("Aviso: não consegui ler a view ranking:", rErr.message);
else console.log("✓ Ranking:", JSON.stringify(rank));
