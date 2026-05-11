// Pure, client-safe formatters. NO server imports here.

export function formatDeadlineBRT(iso: string | null | undefined): string {
  if (!iso) return "sem prazo definido";
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isPicksOpen(
  cfg: { picks_deadline: string | null } | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!cfg || !cfg.picks_deadline) return true;
  return new Date(cfg.picks_deadline).getTime() > now.getTime();
}
