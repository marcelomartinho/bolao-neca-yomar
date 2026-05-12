"use client";

import { Icon } from "@/components/Icon";

type Props = {
  shareUrl: string;
  shareText: string;
};

export function ShareActions({ shareUrl, shareText }: Props) {
  const text = `${shareText}${shareUrl}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

  async function nativeShare() {
    if (!navigator.share) {
      window.open(waUrl, "_blank");
      return;
    }
    try {
      await navigator.share({
        title: "Bolão Yomar e Família — Copa 2026",
        text: shareText,
        url: shareUrl,
      });
    } catch {
      // user canceled
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).catch(() => {});
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-cond inline-flex items-center justify-center gap-2 rounded-sm border-2 px-5 py-3 text-[15px] font-bold uppercase tracking-wider text-white"
        style={{ background: "#25D366", borderColor: "#25D366" }}
      >
        <Icon.Whatsapp s={14} /> WhatsApp
      </a>
      <button
        onClick={nativeShare}
        className="text-ink border-ink font-cond inline-flex items-center justify-center gap-2 rounded-sm border-2 bg-transparent px-5 py-3 text-[15px] font-bold uppercase tracking-wider"
      >
        <Icon.Share s={14} /> Compartilhar
      </button>
      <button
        onClick={copyLink}
        className="col-span-2 text-ink2 border-line font-cond inline-flex items-center justify-center gap-2 rounded-sm border bg-transparent px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
      >
        Copiar link
      </button>
    </div>
  );
}
