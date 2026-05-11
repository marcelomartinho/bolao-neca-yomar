import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchOpenMatches } from "@/lib/db";
import { fetchAppConfig, isPicksOpen } from "@/lib/config";
import { fetchManagedProfiles, getActiveProfileId } from "@/lib/active-profile";
import { PalpiteClient } from "./PalpiteClient";

export const dynamic = "force-dynamic";

export default async function PalpitePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  const [matches, config, profiles] = await Promise.all([
    fetchOpenMatches(72),
    fetchAppConfig(),
    fetchManagedProfiles(user.id),
  ]);
  const activeId = await getActiveProfileId(user.id);

  // Fetch picks for the active profile via RLS-aware client
  const matchIds = matches.map((m) => m.id);
  const { data: picksData } = await supabase
    .from("picks")
    .select("match_id,pick")
    .eq("user_id", activeId)
    .in("match_id", matchIds);
  const initialPicks: Record<number, "1" | "X" | "2"> = {};
  for (const row of picksData ?? []) {
    initialPicks[row.match_id] = row.pick as "1" | "X" | "2";
  }

  return (
    <PalpiteClient
      matches={matches}
      initialPicks={initialPicks}
      email={user.email ?? "(sem e-mail)"}
      deadlineIso={config.picks_deadline}
      open={isPicksOpen(config)}
      profiles={profiles}
      activeProfileId={activeId}
    />
  );
}
