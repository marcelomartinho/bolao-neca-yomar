import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_PATHS = new Set(["/", "/m/palpite", "/ranking", "/grupos", "/tabela", "/regulamento"]);

function safePath(raw: string | null): string {
  const fallback = "/m/palpite";
  if (!raw) return fallback;
  // must start with single "/" (rejects "//evil.com" and "http://...")
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  // strip query/hash for membership check; allow paths in allowlist
  const path = raw.split(/[?#]/)[0];
  return ALLOWED_PATHS.has(path) ? raw : fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safePath(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return NextResponse.redirect(`${origin}/m/login?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}/m/login?error=missing-code`);
}
