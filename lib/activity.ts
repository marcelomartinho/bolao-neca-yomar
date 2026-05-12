import "server-only";
import { createSupabaseServerClient } from "./supabase/server";

export type ActivityAction =
  | "auth.login"
  | "pick.save"
  | "profile.update"
  | "kid.add"
  | "kid.remove"
  | "match.result.set"
  | "match.score.set"
  | "match.result.clear"
  | "config.deadline"
  | "admin.clear_picks_user"
  | "admin.clear_all_picks"
  | "admin.clear_all_results";

type Payload = Record<string, unknown>;

/**
 * Append an activity record. Fire-and-forget — best effort, never throws.
 * Called from inside server actions AFTER the actual mutation succeeds.
 *
 * @param userId   - The profile.id this activity touches (target). For
 *                   self-actions = same as the auth uid. For admin actions on
 *                   other users = the target user.
 * @param action   - One of the ActivityAction values.
 * @param payload  - Free-form metadata (match_id, pick, count, etc).
 */
export async function logActivity(
  userId: string | null,
  action: ActivityAction,
  payload: Payload = {},
): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("activity_log").insert({
      user_id: userId,
      acting_auth_user_id: user.id,
      action,
      payload: payload as never,
    });
  } catch (err) {
    console.error("logActivity failed", err);
  }
}
