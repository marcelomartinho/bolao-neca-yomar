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

export const metadata: Metadata = {
  title: "Bolão Neca & Yomar — Copa 2026",
  description:
    "Boletim do bolão familiar da Copa do Mundo 2026. 48 seleções, 72 jogos, palpite 1 / X / 2.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${interTight.variable} ${geistMono.variable}`}>
      <body className="paper-bg min-h-screen font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
