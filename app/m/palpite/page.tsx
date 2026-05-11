import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchOpenMatches, fetchMyPicks } from "@/lib/db";
import { PalpiteClient } from "./PalpiteClient";

export const dynamic = "force-dynamic";

export default async function PalpitePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/m/login");

  const matches = await fetchOpenMatches(12);
  const picksMap = await fetchMyPicks(matches.map((m) => m.id));
  const initialPicks: Record<number, "1" | "X" | "2"> = {};
  picksMap.forEach((v, k) => (initialPicks[k] = v));

  return (
    <PalpiteClient
      matches={matches}
      initialPicks={initialPicks}
      email={user.email ?? "(sem e-mail)"}
    />
  );
}
