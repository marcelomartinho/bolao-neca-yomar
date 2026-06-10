"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { renderMagicLinkEmail } from "@/lib/email/magic-link";
import { sendMailViaSmtp } from "@/lib/email/smtp";
import { logAuthEmail } from "@/lib/auth-email-log";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bolao-neca-yomar.vercel.app";

/** Organizer copied on every login email (audit trail). Empty string disables. */
const LOGIN_CC = process.env.LOGIN_CC_EMAIL ?? "mmartinho.br@gmail.com";

/**
 * PRIMARY transport: mint the magic-link token via the admin API and deliver the
 * branded email through Brevo ourselves — independent of Supabase's GoTrue SMTP
 * config, so a revoked GoTrue key can't take auth email down again.
 * Returns false (never throws) so the caller can fall back to GoTrue.
 */
async function trySendViaBrevo(email: string, siteUrl: string): Promise<boolean> {
  const pass = process.env.BREVO_SMTP_KEY;
  if (!pass) {
    await logAuthEmail({
      step: "brevo_send",
      email,
      ok: false,
      transport: "brevo",
      error: "BREVO_SMTP_KEY not configured",
    });
    return false;
  }
  const admin = createSupabaseAdminClient();
  if (!admin) {
    await logAuthEmail({
      step: "brevo_send",
      email,
      ok: false,
      transport: "brevo",
      error: "SUPABASE_SERVICE_ROLE_KEY not configured",
    });
    return false;
  }

  const t0 = Date.now();
  try {
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${siteUrl}/auth/confirm?next=/m/palpite` },
    });
    const tokenHash = data?.properties?.hashed_token;
    if (error || !tokenHash) {
      await logAuthEmail({
        step: "generate_link",
        email,
        ok: false,
        transport: "brevo",
        durationMs: Date.now() - t0,
        error: error?.message ?? "no hashed_token in response",
      });
      return false;
    }
    await logAuthEmail({
      step: "generate_link",
      email,
      ok: true,
      transport: "brevo",
      durationMs: Date.now() - t0,
    });

    const confirmUrl = `${siteUrl}/auth/confirm?token_hash=${tokenHash}&type=magiclink&next=/m/palpite`;
    const { subject, html } = renderMagicLinkEmail(confirmUrl);

    const cc = LOGIN_CC && LOGIN_CC !== email ? [LOGIN_CC] : [];
    const tSend = Date.now();
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
        cc,
        subject,
        html,
      },
    );
    await logAuthEmail({
      step: "brevo_send",
      email,
      ok: true,
      transport: "brevo",
      durationMs: Date.now() - tSend,
      detail: { cc },
    });
    return true;
  } catch (err) {
    await logAuthEmail({
      step: "brevo_send",
      email,
      ok: false,
      transport: "brevo",
      durationMs: Date.now() - t0,
      error: err instanceof Error ? err.message : String(err),
    });
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

  await logAuthEmail({ step: "request", email, ok: true });

  // 1) Primary: Brevo (app-owned transport).
  const sentViaBrevo = await trySendViaBrevo(email, siteUrl);

  // 2) Fallback: Supabase GoTrue (built-in email service).
  if (!sentViaBrevo) {
    const t0 = Date.now();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/m/palpite` },
    });
    await logAuthEmail({
      step: "fallback_send",
      email,
      ok: !error,
      transport: "supabase",
      durationMs: Date.now() - t0,
      error: error?.message,
    });
    if (error) {
      await logAuthEmail({
        step: "done",
        email,
        ok: false,
        error: `both transports failed: ${error.message}`,
      });
      redirect(`/m/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  await logAuthEmail({
    step: "done",
    email,
    ok: true,
    transport: sentViaBrevo ? "brevo" : "supabase",
  });
  redirect("/m/login?sent=1");
}
