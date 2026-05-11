import "server-only";
import { createSupabaseServerClient } from "./supabase/server";

export type AppConfig = {
  picks_deadline: string | null;
  updated_at: string;
};

export async function fetchAppConfig(): Promise<AppConfig> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_config")
    .select("picks_deadline,updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(`fetchAppConfig: ${error.message}`);
  return {
    picks_deadline: data?.picks_deadline ?? null,
    updated_at: data?.updated_at ?? "",
  };
}

export { isPicksOpen, formatDeadlineBRT } from "./format";
