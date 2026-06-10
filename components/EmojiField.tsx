"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { EmojiClickData, EmojiStyle, SuggestionMode } from "emoji-picker-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] items-center justify-center text-sm text-ink2">
      Carregando emojis…
    </div>
  ),
});

type Props = {
  name?: string;
  defaultValue?: string | null;
};

export function EmojiField({ name = "emoji", defaultValue }: Props) {
  const [emoji, setEmoji] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);

  function handlePick(data: EmojiClickData) {
    setEmoji(data.emoji);
    setOpen(false);
  }

  return (
    <div>
      <input type="hidden" name={name} value={emoji} />

      <div className="mt-1 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Escolher emoji"
          className="border-ink flex h-14 w-14 items-center justify-center border-2 bg-white/60 text-3xl outline-none focus:border-grass"
        >
          {emoji || <span className="text-base text-ink2">🙂?</span>}
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-cond border-ink rounded-sm border-2 bg-transparent px-3 py-2 text-xs font-bold uppercase tracking-wider"
        >
          {emoji ? "Trocar" : "Escolher"}
        </button>
        {emoji && (
          <button
            type="button"
            onClick={() => setEmoji("")}
            className="font-cond rounded-sm border-2 border-line bg-transparent px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink2"
          >
            Limpar
          </button>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="border-ink border-t-2 bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2">
              <span className="tag">Escolha um emoji</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="font-cond text-xs font-bold uppercase tracking-wider text-ink2"
              >
                Fechar ✕
              </button>
            </div>
            <EmojiPicker
              onEmojiClick={handlePick}
              emojiStyle={"native" as EmojiStyle}
              suggestedEmojisMode={"recent" as SuggestionMode}
              searchPlaceHolder="Buscar…"
              previewConfig={{ showPreview: false }}
              skinTonesDisabled={false}
              lazyLoadEmojis
              width="100%"
              height={360}
            />
          </div>
        </div>
      )}
    </div>
  );
}
