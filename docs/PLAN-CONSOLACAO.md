# Plano — Prêmio de consolação (lanterna) + ajuste de ranking

## Regra de negócio (decidida)

O **Avôtrocinador Yomar** paga **R$ 1.000,00** ao **último colocado**, nos mesmos moldes do 1º e 2º:
- Empate na lanterna → R$ 1.000 **rateados igualmente** entre todos com a menor pontuação.
- **Cartela em branco não concorre** — só quem registrou **≥ 1 palpite** entra na disputa do último lugar.
- **Fora da premiação (todas as faixas): Agente Y e Yomar.** Yomar participa da brincadeira mas, como Avôtrocinador, **não recebe nem rateia** 1º/2º/consolação.
  - **Importante:** a exclusão do Yomar é **regra de negócio no código apenas** — não citar no texto público do regulamento.

## Escopo de arquivos

### 1. Lógica de premiação — `lib/score.ts`
`distributePrize()` hoje só calcula `first`/`second` e não exclui ninguém.

Mudanças:
- Assinatura passa a receber `prizes: { first; second; last }`.
- Novo parâmetro de elegibilidade: cada entrada ganha flags (`eligible: boolean`) **ou** o caller passa só a lista elegível. Decisão: **caller filtra elegíveis** (remove Agente Y, Yomar e cartelas em branco) e passa lista limpa — mantém a função pura e testável.
- Calcular faixa `last`:
  - `lastScore = min(score)` entre elegíveis.
  - `lastPlacers = elegíveis com score === lastScore`.
  - **Guarda anti-sobreposição:** se `lastScore` coincidir com a faixa de 1º (ou 2º) — campo pequeno demais — **não paga consolação** (evita pagar o mesmo jogador duas vezes / pagar líder como lanterna).
  - `lastShare = prizes.last / lastPlacers.length`.

### 2. Helper de elegibilidade
- Já existe `lib/special-profiles.ts` com `isAgentY` / `isYomar`. Reusar.
- Criar helper `isPrizeEligible(player, pickCount)` (ou filtrar inline em quem chama `distributePrize`): `!isAgentY && !isYomar && pickCount > 0`.

### 3. Testes — `tests/unit/db.test.ts`
Adicionar casos para `distributePrize` com `last`:
- paga lanterna sem empate;
- rateia lanterna entre empatados;
- não paga quando lanterna === líder (campo degenerado);
- garante que entradas inelegíveis (já filtradas pelo caller) não recebem.

### 4. Tela Home — `app/page.tsx`
Box "Premiação" (linhas ~140-168):
- Adicionar 3ª linha **"Último — R$ 1.000"** abaixo do 2º, mesmo padrão visual (cor terciária, ex. gold/ink2).
- Stamp "Premiação dobrou" (linha 92) → revisar texto (ex.: "Tem consolação" / "Prêmio até pra lanterna").
- Texto de rodapé do box: acrescentar "O último colocado leva R$ 1.000 (consolação do Avôtrocinador)."

### 5. Tela Regulamento — `app/regulamento/page.tsx`
- Regra **"Premiação"** (linhas 28-31): texto vira `1º lugar leva R$ 10.000,00. 2º lugar leva R$ 5.000,00. O último colocado leva R$ 1.000,00 (consolação do Avôtrocinador Yomar).`
- Box visual "Premiação" (linhas 77-93): adicionar linha **"Último — R$ 1.000"**.
- Regra **"Empate"** (linhas 24-27): estender para citar que a consolação **também** é rateada em empate na lanterna.
- Título "As **nove** regras" continua 9 (não criamos regra nova; só editamos as existentes). Se preferir destacar, podemos virar 10 — **decisão de copy, não bloqueia.**
- **Não** mencionar exclusão do Yomar (regra só no código).

### 6. Tela Ranking — `app/ranking/page.tsx`
- Hoje destaca top-3 (pódio) e marca posições. Acrescentar destaque da **lanterna**:
  - Card/linha "Consolação — último colocado" mostrando o(s) elegível(is) na última posição **entre quem palpitou**.
  - Atenção: a posição exibida (`pos`) hoje inclui todos os humanos. O "último elegível" pode **não** ser o último da lista visual (cartelas em branco aparecem por último com 0). Calcular separadamente: menor score entre quem tem `pickCount > 0` e não é Yomar/Agente Y.
  - "Nota da redação" (linhas 144-160): mencionar a consolação + rateio.
- Confirmar que `fetchRanking` (`lib/db.ts`) retorna contagem de palpites por jogador; se não, incluir `pickCount` na query para permitir o filtro de cartela em branco.

### 7. `lib/db.ts` — `fetchRanking()`
- Verificar se já traz nº de palpites por participante. Se não, adicionar `pickCount` (ou flag `hasPicks`) para alimentar o filtro de elegibilidade no ranking e no cálculo de consolação.

## Telas auditadas SEM mudança
- `app/[participante]/page.tsx` — perfil mostra pontos do jogador; **sem** texto de premiação. Sem mudança (opcional: badge "lanterna" — fora do escopo).
- `app/tabela/page.tsx` — só jogos/resultados. Sem mudança.
- `app/admin/**` — sem exibição de premiação. Sem mudança.

## Ordem de implementação
1. `lib/db.ts` (pickCount) → 2. `lib/score.ts` (faixa `last` + guardas) → 3. testes → 4. regulamento → 5. home → 6. ranking → 7. `npm run build` + `vitest`.

## Riscos / pontos de atenção
- **Sobreposição lanterna × pódio** em campo pequeno: tratada por guarda no `distributePrize`.
- **Filtro de cartela branca** depende de `pickCount` real vindo do banco — validar query.
- **Yomar oculto**: garantir que exclusão não vaze em nenhum texto de UI.
- Empate massivo na lanterna (vários com 1 acerto) é aceito por decisão — rateio dilui, igual ao 1º/2º.
