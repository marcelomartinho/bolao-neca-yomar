"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

type Item<T extends string> = {
  href: Route<T>;
  label: string;
  icon: React.ReactNode;
  match: (path: string) => boolean;
};

const MOBILE = [
  { href: "/" as const, label: "Capa", icon: <CapaGlyph />, match: (p: string) => p === "/" },
  { href: "/m/palpite" as const, label: "Cartela", icon: <CartelaGlyph />, match: (p: string) => p.startsWith("/m/palpite") || p.startsWith("/m/jogo") },
  { href: "/ranking" as const, label: "Ranking", icon: <Icon.Trophy s={20} />, match: (p: string) => p === "/ranking" },
  { href: "/m/familia" as const, label: "Família", icon: <PerfilGlyph />, match: (p: string) => p.startsWith("/m/perfil") || p.startsWith("/m/familia") },
] satisfies ReadonlyArray<Omit<Item<string>, "href"> & { href: Route }>;

const DESKTOP = [
  { href: "/" as const, label: "Capa" },
  { href: "/grupos" as const, label: "Grupos" },
  { href: "/tabela" as const, label: "Tabela" },
  { href: "/ranking" as const, label: "Ranking" },
  { href: "/regulamento" as const, label: "Regulamento" },
  { href: "/m/familia" as const, label: "Família" },
] satisfies ReadonlyArray<{ href: Route; label: string }>;

export function NavBar() {
  const pathname = usePathname() || "/";

  // Esconde nav em telas full-bleed onde atrapalha (admin é fluxo de host)
  const hideMobile = pathname.startsWith("/admin") || pathname.startsWith("/dev/");

  return (
    <>
      {/* Desktop top — thin strip under TriRule, visible md+ */}
      <nav
        className="border-line bg-paper hidden border-b md:flex md:items-center md:justify-between md:gap-6 md:px-9 md:py-2"
        aria-label="Navegação principal"
      >
        <Link href="/" className="font-cond text-sm font-bold uppercase tracking-wider text-ink">
          O Bolão
        </Link>
        <ul className="flex items-center gap-5">
          {DESKTOP.map((it) => {
            const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="font-mono text-[11px] uppercase tracking-[0.18em]"
                  style={{
                    color: active ? "#0b6b3a" : "#5a6a86",
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-3">
          <Link
            href="/m/palpite"
            className="font-cond rounded-sm border-2 border-ink bg-transparent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink"
          >
            Cartela →
          </Link>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      {!hideMobile && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper md:hidden"
          aria-label="Navegação inferior"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <ul className="grid grid-cols-4">
            {MOBILE.map((it) => {
              const active = it.match(pathname);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className="flex flex-col items-center justify-center gap-0.5 py-2.5"
                    style={{ color: active ? "#0b6b3a" : "#5a6a86" }}
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center">
                      {it.icon}
                    </span>
                    <span
                      className="font-mono text-[9px] uppercase tracking-[0.14em]"
                      style={{ fontWeight: active ? 700 : 400 }}
                    >
                      {it.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}

function CapaGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" />
    </svg>
  );
}

function CartelaGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 10h2v2H7zM11 10h2v2h-2zM15 10h2v2h-2z" fill="currentColor" />
    </svg>
  );
}

function PerfilGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}
