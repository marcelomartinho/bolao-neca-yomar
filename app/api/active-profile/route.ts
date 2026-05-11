import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ACTIVE_PROFILE_COOKIE } from "@/lib/active-profile";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function POST(request: NextRequest) {
  const { profile_id } = await request.json().catch(() => ({}));
  if (typeof profile_id !== "string" || !UUID_RE.test(profile_id)) {
    return NextResponse.json({ ok: false, error: "id-invalido" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "sem-sessao" }, { status: 401 });
  }

  // Confirm the profile is managed by this user
  const { data, error } = await supabase.rpc("is_profile_managed_by_uid", {
    profile_id,
  });
  if (error || !data) {
    return NextResponse.json({ ok: false, error: "nao-permitido" }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACTIVE_PROFILE_COOKIE, profile_id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  });
  return res;
}
