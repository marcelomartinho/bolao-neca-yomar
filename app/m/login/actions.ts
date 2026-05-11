"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bolao-neca-yomar.vercel.app";

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    redirect("/m/login?error=email-invalido");
  }

  const supabase = await createSupabaseServerClient();
  const siteUrl =
    process.env.NODE_ENV === "production" ? DEFAULT_SITE_URL : "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/m/palpite` },
  });

  if (error) redirect(`/m/login?error=${encodeURIComponent(error.message)}`);
  redirect("/m/login?sent=1");
}
