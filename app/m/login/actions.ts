"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renderMagicLinkEmail } from "@/lib/email/magic-link";
import { sendMailViaSmtp } from "@/lib/email/smtp";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bolao-neca-yomar.vercel.app";

/**
 * PRIMARY transport: mint the magic-link token via the admin API and deliver the
 * branded email through Brevo ourselves — independent of Supabase's GoTrue SMTP
 * config, so a revoked GoTrue key can't take auth email down again.
 * Returns false (never throws) so the caller can fall back to GoTrue.
 */
async function trySendViaBrevo(email: string, siteUrl: string): Promise<boolean> {
  const pass = process.env.BREVO_SMTP_KEY;
  if (!pass) return false; // not configured → use fallback
  const admin = createSupabaseAdminClient();
  if (!admin) return false;

  try {
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${siteUrl}/auth/confirm?next=/m/palpite` },
    });
    const tokenHash = data?.properties?.hashed_token;
    if (error || !tokenHash) return false;

    const confirmUrl = `${siteUrl}/auth/confirm?token_hash=${tokenHash}&type=magiclink&next=/m/palpite`;
    const { subject, html } = renderMagicLinkEmail(confirmUrl);

    await sendMailViaSmtp(
      {
        host: process.env.BREVO_SMTP_HOST ?? "smtp-relay.brevo.com",
        port: Number(process.env.BREVO_SMTP_PORT ?? 587),
        user: process.env.BREVO_SMTP_USER ?? "aafd46001@smtp-brevo.com",
        pass,
      },
      {
        fromEmail: process.env.BREVO_FROM_EMAIL ?? "mmartinho.br@gmail.com",
        fromName: process.env.BREVO_FROM_NAME ?? "Bolão Neca & Família",
        to: email,
        subject,
        html,
      },
    );
    return true;
  } catch (err) {
    console.error("[magic-link] Brevo primary failed, falling back:", err);
    return false;
  }
}

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    redirect("/m/login?error=email-invalido");
  }

  const siteUrl =
    process.env.NODE_ENV === "production" ? DEFAULT_SITE_URL : "http://localhost:3000";

  // 1) Primary: Brevo (app-owned transport).
  const sentViaBrevo = await trySendViaBrevo(email, siteUrl);

  // 2) Fallback: Supabase GoTrue (built-in email service).
  if (!sentViaBrevo) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/m/palpite` },
    });
    if (error) redirect(`/m/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/m/login?sent=1");
}
