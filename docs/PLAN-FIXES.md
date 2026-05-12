# PLAN — Correções & Melhorias

Data: 2026-05-12 · HEAD atual: `779688d` · Prod: https://bolao-neca-yomar.vercel.app

10 itens reportados, agrupados em 3 sprints. Cada sprint tem agentes responsáveis e critério de done.

---

## Sprint A — UI & Navegação (itens 1–6)

| # | Item | Arquivo principal |
|---|---|---|
| 1 | Capa: remover frase "1, X ou 2" (UX trocou pra cliques) | `app/page.tsx` |
| 2 | Capa: remover links "Pág. 2 · Grupos →" e "Pág. 4 · Tabela →" (menu já cobre) | `app/page.tsx` |
| 3 | Loading overlay ao navegar entre páginas do menu | `components/NavBar.tsx` (novo `NavTransitionOverlay`) |
| 4 | "Entrar agora" só se anônimo | `app/page.tsx` (converter pra RSC + check auth) |
| 5 | Tab "Admin" no menu só pra `host=true`; manter só Marcelo, Bruno, Yomar | `components/NavBar.tsx` + SQL update Neca → host=false |
| 6 | Rodapé das páginas condizente com menu | `PageFooter` em todas: `/` Pág.1, `/grupos` Pág.2, `/tabela` Pág.3, `/regulamento` Pág.4, `/ranking` Pág.5, `/admin` Pág.6 (de 6) |

### Plano técnico

**Item 3 — Loading overlay no menu:**
- NavBar usa `useTransition`+`useRouter`. Cada `<Link>` vira `<button onClick={() => startTransition(() => router.push(href))}>`.
- Estado `isPending` mostra overlay sob `<body>` com "Carregando…" + spinner (mesmo visual do `PalpiteClient` switch).
- Componente cliente `NavTransitionOverlay` montado no layout.

**Item 4 — Capa autenticada:**
- Mudar `app/page.tsx` pra RSC `async`. Já é, mas adicionar fetch `getUser()`. Se logado, troca CTA "Entrar agora" por "Ir pra cartela →" apontando `/m/palpite`.
- Mesma lógica no header desktop da NavBar (CTA do canto direito).

**Item 5 — Admin no menu + Neca demote:**
- NavBar recebe prop `isAdmin: boolean` do layout (RSC busca profile.host de auth.uid()).
- Layout converte pra async RSC. Passa `isAdmin` pro NavBar (client).
- Mobile bottom tab: adicionar item "Admin" como 5º quando `isAdmin`. Desktop top: adicionar link "Admin".
- SQL: `update profiles set host=false where name='Neca'`. Confirma 3 hosts: Marcelo, Bruno, Yomar.

**Item 6 — Numeração rodapé:**
- Padronizar PageFooter `left="Pág. N de 6"`. Mapeamento:
  - `/` → Pág. 1
  - `/grupos` → Pág. 2
  - `/tabela` → Pág. 3
  - `/regulamento` → Pág. 4
  - `/ranking` → Pág. 5
  - `/admin` → Pág. 6

### Agentes Sprint A
- `general-purpose` — implementar 1, 2, 4, 6 (UI patches)
- `ecc:typescript-reviewer` — review converter layout async + tipo prop
- `ecc:database-reviewer` — verifica policy host no client
- `ecc:e2e-runner` — Playwright: anônimo vê "Entrar"; logado-não-host não vê "Admin"; logado-host vê "Admin"

**Critério done:**
- Capa sem "1, X ou 2" nem links de página
- Loading overlay aparece <100ms em qualquer navegação do menu
- "Entrar agora" some pra usuário logado
- "Admin" tab aparece só pros 3 emails: marcelo, bruno, yomar
- Neca = host:false no DB
- Rodapé numerado 1–6 sequencial

---

## Sprint B — Export PDF & CSV (itens 7–9)

| # | Item | Arquivo principal |
|---|---|---|
| 7 | Cartela: export mais visível | `app/m/palpite/PalpiteClient.tsx` |
| 8 | PDF impressão vertical (A4 portrait) | `app/m/cartela/pdf/page.tsx` + CSS print |
| 9 | CSV com placar + colunas melhores | `app/m/cartela/csv/route.ts` |

### Plano técnico

**Item 7 — Botões export visíveis:**
- Hoje: barra fininha `text-[11px]` no rodapé acima do contador. Mover pra **card flutuante destacado** no topo (logo abaixo do banner deadline):
  - "📥 Exportar minha cartela" com 2 buttons grandes verde+azul: **PDF** e **Excel**
- Card com TriRule top + border-2 + bg paper2

**Item 8 — PDF vertical:**
- `app/m/cartela/pdf/page.tsx` reformatar como A4 portrait `@page { size: A4 portrait; margin: 16mm }`.
- Layout: 1 coluna principal com 12 seções (Grupos A–L), cada grupo com 6 jogos em 1 coluna estreita (não 2x3).
- Print CSS: ocultar nav + spinner + qualquer interativo. `prefers-color-scheme` neutro. `page-break-inside: avoid` por grupo.
- Header: Logo + Boletim + nome do palpiteiro + data geração. Footer impressão: paginação `<span class="pageno">`.

**Item 9 — CSV melhorado:**
- Manter delimitador `;` (Excel BR).
- Colunas finais: `Grupo, Dia BRT, Hora BRT, Jogo Nº, Mandante, Placar A, Placar B, Palpite, Visitante, Resultado, Acerto, Atualizado em`.
- Quando placar nulo: coluna `Placar A`/`Placar B` vazias. Quando palpite faltou: `Palpite` vazio e `Acerto` vazio.
- Header oficial: 1ª linha `nome do palpiteiro` + 2ª linha `gerado em DD/MM/YYYY HH:mm BRT` + 3ª em branco + 4ª header. Resto = jogos.
- Adicionar BOM UTF-8 (mantém) + `Content-Disposition: attachment; filename="cartela-{nome}-{date}.csv"`.

### Agentes Sprint B
- `general-purpose` — implementação de PDF + CSV
- `ecc:code-reviewer` — review do print CSS + filename slug
- `ecc:e2e-runner` — download CSV e validar 12 colunas + parse

**Critério done:**
- Botões export aparecem visíveis (>=44px altura, contraste AA) acima da lista de palpites
- PDF impresso em A4 portrait sem quebra de coluna estranha; cabe os 72 jogos em ≤4 páginas
- CSV abre direto no Excel BR com acentos OK + 12 colunas + placar populado

---

## Sprint C — Admin Reset (item 10)

| # | Item | Arquivo principal |
|---|---|---|
| 10 | Limpar palpites por jogador / todos / todos resultados (com confirmação) | `app/admin/AdminReset.tsx` (novo) + actions |

### Plano técnico

**3 operações novas no `/admin` (zona "Operações destrutivas"):**

| Operação | Effect |
|---|---|
| **Limpar palpites de um jogador** | `DELETE FROM picks WHERE user_id=$1` |
| **Limpar todos os palpites** | `DELETE FROM picks` |
| **Limpar todos os resultados** | `UPDATE matches SET result=NULL, score_a=NULL, score_b=NULL` |

**UI:**
- Seção colapsada no fundo do `/admin` com header vermelho "Zona perigosa".
- Cada botão dispara modal de confirmação:
  - Modal título: "Confirmar X?"
  - Texto: "Esta ação é irreversível. Vai apagar N palpites / N resultados."
  - Campo input texto: "Digite **APAGAR** pra confirmar"
  - Botão "Cancelar" + "Apagar" (vermelho, disabled até input == "APAGAR")
- Componente `<ConfirmDialog>` reutilizável (HTML `<dialog>` ou estado).

**Server actions (`app/admin/actions.ts`):**
- `clearPicksOfUser(userId: string)` — guard host + valida UUID
- `clearAllPicks()` — guard host
- `clearAllResults()` — guard host + também limpa score_a/score_b
- Todas: revalidatePath em `/`, `/grupos`, `/tabela`, `/ranking`, `/admin`, `/[userId]`

**Seleção de jogador:**
- Dropdown com todos profiles (nome + email mascarado).
- Ou: combobox com busca por nome.

### Agentes Sprint C
- `ecc:security-reviewer` — confirma RLS bloqueia DELETE/UPDATE sem host; valida que server actions têm guard duplo
- `ecc:database-reviewer` — DELETE em massa em picks vs FK cascades; review do plano de query
- `general-purpose` — implementação UI + actions
- `ecc:e2e-runner` — Playwright: não-host clica "Apagar" → 403; host clica → modal exige "APAGAR"; após confirmar, picks = 0

**Critério done:**
- 3 botões de reset funcionais no `/admin`
- Cada operação exige digitar "APAGAR" antes de habilitar botão final
- RLS bloqueia operação se chamada direto via REST sem session host
- Ranking, tabela, grupos refletem zero após cada operação

---

## Ordem de execução

```
Sprint A (UI/Nav) → ~2h         → entrega imediata, bloqueia uso público
Sprint B (Export) → ~1.5h       → polish, depois de A
Sprint C (Admin reset) → ~1.5h  → guard antes de família começar
```

Critério final: build verde, typecheck verde, deploy prod, smoke `/`, `/admin`, `/m/palpite`, `/m/cartela/csv` retornam 200.

---

## Riscos & Mitigações

| Risco | Mitigação |
|---|---|
| Convert layout pra async RSC quebra Client tree | Manter NavBar client; passar `isAdmin` via prop |
| `router.push` + `useTransition` não pinta loading antes de RSC pronto | Adicionar overlay z-50 fixed que aparece quando pending=true |
| `<dialog>` HTML inconsistente em iOS Safari < 15 | Polyfill ou state-based modal |
| CSV BOM duplo se já tem UTF-8 BOM | Verificar no `csvEscape` |
| PDF print preview varia por browser | Testar Chrome desktop + iOS Safari + Edge |
| `clearAllPicks` apaga histórico irreversível | Confirmação digitada "APAGAR" + log no `console.warn` server-side com user_id do host que executou |

---

## Estado atual (HEAD `779688d`)

- 13 commits desde Sprint 1
- 24 rotas (10 static, 14 dynamic/ISR)
- 13 adultos com login + 2 kids (Gustavo, Leonardo)
- 4 hosts: Marcelo, Neca, Yomar, Bruno (vai virar 3 — Neca sai)
- Picks DB: vazio (foi limpo)
- Matches resolvidos: 0 (foi limpo pelo último teste)
