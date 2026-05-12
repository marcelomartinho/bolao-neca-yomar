"use client";

import { useFormStatus } from "react-dom";
import { Icon } from "@/components/Icon";

function Spinner() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ animation: "magic-spin 0.7s linear infinite" }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 1-9 9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <style>{`@keyframes magic-spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

export function MagicLinkSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="bg-grass border-grass text-paper font-cond inline-flex w-full items-center justify-center gap-2 rounded-sm border-2 px-5 py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-80"
    >
      {pending ? (
        <>
          <Spinner />
          Enviando link...
        </>
      ) : (
        <>
          <Icon.Mail s={16} />
          Receber link mágico
        </>
      )}
    </button>
  );
}
