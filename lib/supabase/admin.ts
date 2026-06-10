import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role client for privileged server-only operations (e.g. admin.generateLink).
 * Never import this into client components. Returns null if the service key is absent
 * so callers can degrade gracefully to the GoTrue fallback transport.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
