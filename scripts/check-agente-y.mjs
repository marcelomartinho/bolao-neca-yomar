// Read-only: confere o estado do Agente Y na prod. node scripts/check-agente-y.mjs
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const AGENT_Y_ID = "00000000-0000-4000-8000-0000000000a7";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data: prof } = await supabase
  .from("profiles")
  .select("id,name,initials,emoji,host,auth_user_id,parent_id")
  .eq("id", AGENT_Y_ID)
  .maybeSingle();

const { count: pickCount } = await supabase
  .from("picks")
  .select("*", { count: "exact", head: true })
  .eq("user_id", AGENT_Y_ID);

const { data: rank } = await supabase
  .from("ranking")
  .select("name,score,resolved,total_picks")
  .eq("id", AGENT_Y_ID)
  .maybeSingle();

const { count: distinctPicks } = await supabase
  .from("picks")
  .select("pick", { count: "exact", head: true })
  .eq("user_id", AGENT_Y_ID);

console.log("perfil:", JSON.stringify(prof));
console.log("picks (count):", pickCount);
console.log("ranking:", JSON.stringify(rank));
console.log("distinct check:", distinctPicks);
