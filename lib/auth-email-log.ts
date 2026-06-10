import "server-only";
import { createSupabaseAdminClient } from "./supabase/admin";

/**
 * Observability for the magic-link send pipeline.
 *
 * Every step is recorded twice, best effort, never throws:
 *  1. console.log as single-line JSON tagged [auth-email] → searchable in
 *     Vercel runtime logs.
 *  2. insert into public.activity_log (action "auth.magiclink_send") via the
 *     service-role client — works pre-session, unlike logActivity().
 */

export type AuthEmailEvent = {
  step:
    | "request"
    | "generate_link"
    | "brevo_send"
    | "fallback_send"
    | "done";
  email: string;
  ok: boolean;
  transport?: "brevo" | "supabase";
  durationMs?: number;
  error?: string;
  detail?: Record<string, unknown>;
};

export async function logAuthEmail(event: AuthEmailEvent): Promise<void> {
  const record = { tag: "auth-email", at: new Date().toISOString(), ...event };

  // 1) Vercel runtime logs (always).
  const line = JSON.stringify(record);
  if (event.ok) console.log(`[auth-email] ${line}`);
  else console.error(`[auth-email] ${line}`);

  // 2) Database trail (best effort).
  try {
    const admin = createSupabaseAdminClient();
    if (!admin) return;
    await admin.from("activity_log").insert({
      user_id: null,
      acting_auth_user_id: null,
      action: "auth.magiclink_send",
      payload: record as never,
    });
  } catch (err) {
    console.error("[auth-email] activity_log insert failed", err);
  }
}
