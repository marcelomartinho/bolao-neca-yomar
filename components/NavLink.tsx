"use client";

import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

type Props<T extends string> = {
  href: Route<T> | Route;
  className?: string;
  children: ReactNode;
  prefetch?: boolean;
};

function fireNavStart() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bolao:nav-start"));
  }
}

/**
 * Drop-in replacement for `next/link` that fires the global nav-start event
 * so NavTransitionOverlay can show "Carregando…" during RSC transitions.
 */
export function NavLink<T extends string>({ href, className, children, prefetch }: Props<T>) {
  return (
    <Link href={href} prefetch={prefetch} onClick={fireNavStart} className={className}>
      {children}
    </Link>
  );
}
