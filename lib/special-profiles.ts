// =============================================================
// special-profiles.ts — perfis com tratamento especial na UI
// -------------------------------------------------------------
// Agente Y: jogador-benchmark de IA (sem login). Criado via
//   migration 0014 com este UUID fixo, fora da numeração/prêmio.
// Yomar: dono/homônimo do bolão. Vira líder do ranking enquanto
//   nenhum jogo tiver resultado lançado.
// =============================================================

/** UUID fixo do perfil de IA "Agente Y" (ver supabase/migrations/0014_agente_y.sql). */
export const AGENT_Y_ID = "00000000-0000-4000-8000-0000000000a7";

/** Nome canônico do perfil dono do bolão. */
export const YOMAR_NAME = "Yomar";

/** True se o id é do Agente Y (jogador de IA). */
export function isAgentY(id: string | null | undefined): boolean {
  return id === AGENT_Y_ID;
}

/** True se a linha corresponde ao perfil do Yomar (case/espaço-insensível). */
export function isYomar(row: { name: string | null } | null | undefined): boolean {
  return row?.name?.trim().toLowerCase() === YOMAR_NAME.toLowerCase();
}
