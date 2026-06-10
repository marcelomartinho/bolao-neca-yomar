/**
 * Sanitiza emoji vindo de formulário: mantém apenas o primeiro grafema
 * (emojis compostos como 👨‍👩‍👧 ou 🧜‍♀️ ocupam vários code units e
 * seriam corrompidos por slice). Limite de 16 chars como guarda extra.
 */
export function sanitizeEmoji(raw: unknown): string | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;

  const segmenter = new Intl.Segmenter("pt-BR", { granularity: "grapheme" });
  const first = segmenter.segment(trimmed)[Symbol.iterator]().next();
  const grapheme = first.done ? "" : first.value.segment;
  if (!grapheme) return null;

  return grapheme.slice(0, 16) || null;
}
