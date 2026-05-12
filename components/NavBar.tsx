"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Icon } from "./Icon";

type Item = {
  href: Route;
  label: string;
  icon: React.ReactNode;
  match: (path: string) => boolean;
};

type Props = {
  isAuthed: boolean;
  isAdmin: boolean;
};

function buildMobile(isAdmin: boolean): Item[] {
  const items: Item[] = [
    { href: "/" as Route, label: "Capa", icon: <CapaGlyph />, match: (p) => p === "/" },
    {
      href: "/m/palpite" as Route,
      label: "Cartela",
      icon: <CartelaGlyph />,
      match: (p) => p.startsWith("/m/palpite") || p.startsWith("/m/jogo"),
    },
    {
      href: "/ranking" as Route,
      label: "Ranking",
      icon: <Icon.Trophy s={20} />,
      match: (p) => p === "/ranking",
    },
    {
      href: "/m/familia" as Route,
      label: "Família",
      icon: <PerfilGlyph />,
      match: (p) => p.startsWith("/m/perfil") || p.startsWith("/m/familia"),
    },
  ];
  if (isAdmin) {
    items.push({
      href: "/admin" as Route,
      label: "Admin",
      icon: <AdminGlyph />,
      match: (p) => p.startsWith("/admin"),
    });
  }
  return items;
}

function buildDesktop(isAdmin: boolean) {
  const items: Array<{ href: Route; label: string }> = [
    { href: "/" as Route, label: "Capa" },
    { href: "/grupos" as Route, label: "Grupos" },
    { href: "/tabela" as Route, label: "Tabela" },
    { href: "/ranking" as Route, label: "Ranking" },
    { href: "/regulamento" as Route, label: "Regulamento" },
    { href: "/m/familia" as Route, label: "Família" },
  ];
  if (isAdmin) items.push({ href: "/admin" as Route, label: "Admin" });
  return items;
}

function fireNavStart() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bolao:nav-start"));
  }
}

export function NavBar({ isAuthed, isAdmin }: Props) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [, startTransition] = useTransition();

  const MOBILE = buildMobile(isAdmin);
  const DESKTOP = buildDesktop(isAdmin);
  const mobileCols = MOBILE.length;

  function go(href: Route) {
    if (pathname === href) return;
    fireNavStart();
    startTransition(() => router.push(href));
  }

  // Esconde nav em telas full-bleed onde atrapalha
  const hideMobile = pathname.startsWith("/dev/");

  return (
    <>
      {/* Desktop top — sticky */}
      <nav
        className="border-line bg-paper hidden border-b md:sticky md:top-0 md:z-50 md:flex md:items-center md:justify-between md:gap-6 md:px-9 md:py-2"
        aria-label="Navegação principal"
      >
        <button
          type="button"
          onClick={() => go("/" as Route)}
          className="font-cond text-sm font-bold uppercase tracking-wider text-ink"
        >
          O Bolão
        </button>
        <ul className="flex items-center gap-5">
          {DESKTOP.map((it) => {
            const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
            return (
              <li key={it.href}>
                <button
                  type="button"
                  onClick={() => go(it.href)}
                  className="font-mono text-[11px] uppercase tracking-[0.18em]"
                  style={{
                    color: active ? "#0b6b3a" : "#5a6a86",
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {it.label}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-3">
          {!isAuthed ? (
            <Link
              href={"/m/login" as Route}
              onClick={fireNavStart}
              className="bg-grass border-grass text-paper font-cond rounded-sm border-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
            >
              Entrar
            </Link>
          ) : (
            <Link
              href={"/m/palpite" as Route}
              onClick={fireNavStart}
              className="font-cond rounded-sm border-2 border-ink bg-transparent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink"
            >
              Cartela →
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile bottom */}
      {!hideMobile && (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper md:hidden"
          aria-label="Navegação inferior"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <ul
            className="grid"
            style={{ gridTemplateColumns: `repeat(${mobileCols}, minmax(0, 1fr))` }}
          >
            {MOBILE.map((it) => {
              const active = it.match(pathname);
              return (
                <li key={it.href}>
                  <button
                    type="button"
                    onClick={() => go(it.href)}
                    className="flex w-full flex-col items-center justify-center gap-0.5 py-2.5"
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
                  </button>
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

function AdminGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 3l8 3v6c0 4-3.5 7.5-8 9-4.5-1.5-8-5-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
