"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Visible loading overlay while Next.js transitions to a new RSC.
 * Shows when pathname is about to change but new RSC payload hasn't rendered.
 * Driven by global pending state set by NavBar `Link` clicks.
 */
export function NavTransitionOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onStart() {
      setVisible(true);
    }
    function onEnd() {
      setVisible(false);
    }
    window.addEventListener("bolao:nav-start", onStart);
    window.addEventListener("bolao:nav-end", onEnd);
    return () => {
      window.removeEventListener("bolao:nav-start", onStart);
      window.removeEventListener("bolao:nav-end", onEnd);
    };
  }, []);

  // Hide overlay automatically when pathname changes (new page mounted).
  useEffect(() => {
    setVisible(false);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-paper/60 pt-24 backdrop-blur-[1.5px]"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="border-grass flex items-center gap-3 border-2 bg-paper px-5 py-3 shadow-xl">
        <Spinner />
        <span className="font-cond text-sm font-bold uppercase tracking-wider text-grass">
          Carregando…
        </span>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="text-grass"
      style={{ animation: "nav-spin 0.7s linear infinite" }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <style>{`@keyframes nav-spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
