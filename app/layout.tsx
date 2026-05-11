import type { Metadata } from "next";
import { Inter_Tight, Geist_Mono } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter-tight",
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
    default: "Bolão Neca & Yomar — Copa 2026",
    template: "%s · Bolão Neca & Yomar",
  },
  description:
    "Boletim do bolão familiar da Copa do Mundo 2026. 48 seleções, 12 grupos, 72 jogos, palpite 1 / X / 2.",
  applicationName: "Bolão Neca & Yomar",
  authors: [{ name: "Neca & Yomar" }],
  keywords: ["bolão", "copa do mundo 2026", "fifa", "família", "palpite"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Bolão Neca & Yomar",
    title: "Bolão Neca & Yomar — Copa 2026",
    description:
      "Boletim do bolão familiar da Copa do Mundo 2026. Vem palpitar com a gente.",
  },
  twitter: {
    card: "summary",
    title: "Bolão Neca & Yomar — Copa 2026",
    description: "Boletim do bolão familiar da Copa do Mundo 2026.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${interTight.variable} ${geistMono.variable}`}>
      <body className="paper-bg min-h-screen font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
