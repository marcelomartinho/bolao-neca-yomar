import type { Metadata } from "next";
import { Inter_Tight, Barlow_Condensed, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import { NavTransitionOverlay } from "@/components/NavTransitionOverlay";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter-tight",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bolao-neca-yomar.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bolão Yomar e Família — Copa 2026",
    template: "%s · Bolão Yomar e Família",
  },
  description:
    "Boletim do bolão familiar da Copa do Mundo 2026. 48 seleções, 12 grupos, 72 jogos.",
  applicationName: "Bolão Yomar e Família",
  authors: [{ name: "Yomar e Família" }],
  keywords: ["bolão", "copa do mundo 2026", "fifa", "família", "palpite"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Bolão Yomar e Família",
    title: "Bolão Yomar e Família — Copa 2026",
    description:
      "Boletim do bolão familiar da Copa do Mundo 2026. Vem palpitar com a gente.",
  },
  twitter: {
    card: "summary",
    title: "Bolão Yomar e Família — Copa 2026",
    description: "Boletim do bolão familiar da Copa do Mundo 2026.",
  },
  robots: { index: true, follow: true },
};

async function getSessionFlags(): Promise<{ isAuthed: boolean; isAdmin: boolean }> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { isAuthed: false, isAdmin: false };
    const { data: profile } = await supabase
      .from("profiles")
      .select("host")
      .eq("id", user.id)
      .maybeSingle();
    return { isAuthed: true, isAdmin: profile?.host === true };
  } catch {
    return { isAuthed: false, isAdmin: false };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthed, isAdmin } = await getSessionFlags();
  return (
    <html
      lang="pt-BR"
      className={`${interTight.variable} ${barlowCondensed.variable} ${geistMono.variable}`}
    >
      <body className="paper-bg min-h-screen font-sans text-ink antialiased">
        <NavBar isAuthed={isAuthed} isAdmin={isAdmin} />
        <NavTransitionOverlay />
        <div className="pb-16 md:pb-0">{children}</div>
      </body>
    </html>
  );
}
