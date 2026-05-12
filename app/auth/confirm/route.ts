import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import type { EmailOtpType } from "@supabase/supabase-js";

const ALLOWED_PATHS = new Set([
  "/",
  "/m/palpite",
  "/m/perfil",
  "/m/share",
  "/m/familia",
  "/ranking",
  "/grupos",
  "/tabela",
  "/regulamento",
  "/admin",
]);
const ALLOWED_PREFIXES = ["/m/jogo/"];

function safePath(raw: string | null): string {
  const fallback = "/m/palpite";
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  const path = raw.split(/[?#]/)[0];
  if (ALLOWED_PATHS.has(path)) return raw;
  if (ALLOWED_PREFIXES.some((p) => path.startsWith(p))) return raw;
  return fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "") as EmailOtpType;
  const next = safePath(searchParams.get("next"));

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/m/login?error=missing-params`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) {
    return NextResponse.redirect(
      `${origin}/m/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Log login event (best effort). At this point cookies are set.
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await logActivity(user.id, "auth.login", { type });
    }
  } catch {
    // swallow
  }

  return NextResponse.redirect(`${origin}${next}`);
}
