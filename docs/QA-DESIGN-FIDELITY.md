# Auditoria de Fidelidade ao Design - Bolão Neca & Yomar

## 1. Inventário: Telas Design vs Implementação

| Componente Design | Rota Next.js | Arquivo Implementação | Status | Severidade Visual |
| :--- | :--- | :--- | :--- | :--- |
| BFront | `/` | `app/page.tsx` | OK | N/A |
| BPalpite | `/m/palpite` | `app/m/palpite/PalpiteClient.tsx` | OK | N/A |
| BRanking | `/ranking` | `app/ranking/page.tsx` | OK | N/A |
| BShare | `/m/share` | `app/m/share/page.tsx` | OK | N/A |
| BLogin | `/m/login` | `app/m/login/page.tsx` | DIFF | MED |
| BGrupos | `/grupos` | `app/grupos/page.tsx` | OK | N/A |
| BTabela | `/tabela` | `app/tabela/page.tsx` | OK | N/A |
| BJogo | `/m/jogo/[id]` | `app/m/jogo/[id]/JogoPickerClient.tsx` | OK | N/A |
| BPerfil | `/[participante]` | `app/[participante]/page.tsx` | DIFF | LOW |
| BRegulamento | `/regulamento` | `app/regulamento/page.tsx` | OK | N/A |

## 2. Comparação Visual Por Tela

### 2.1 BFront (Capa)
- **Design ref:** `var3.jsx` linhas 48-118
- **Impl ref:** `app/page.tsx` linhas 8-150
- **Tipografia:** Masthead H1 em 60px (Design: 60px, Impl: text-[60px]). Tag superior em 10px mono (Design: 10px, Impl: text-[10px]). Match preciso.
- **Layout/grid:** Grid 1.4fr/1fr (Design: line 69, Impl: line 44). Match preciso.
- **Cores/tokens:** Uso de `bg-grass` e `text-gold` alinhado ao esquema de cores do boletim.
- **Componentes usados:** TriRule (Masthead), Stamp (Aberto/Premiação), Avatar (Roster), Icon (Trophy/Check).
- **Veredicto:** OK.

### 2.2 BPalpite (Cartela Mobile)
- **Design ref:** `var3.jsx` linhas 136-231
- **Impl ref:** `app/m/palpite/PalpiteClient.tsx` linhas 48-210
- **Tipografia:** H2 30px (Design: 30px, Impl: text-3xl). Cartão de jogo Nº em 24px cond.
- **Layout/grid:** Layout de coluna única mobile. Identificação do jogo com fundo `ink` (Design: line 188, Impl: line 144).
- **Cores/tokens:** `GROUP_COLORS` portados corretamente para o JS da implementação.
- **Veredicto:** OK.

### 2.3 BRanking (Boletim Geral)
- **Design ref:** `var3.jsx` linhas 234-316
- **Impl ref:** `app/ranking/page.tsx` linhas 20-160
- **Tipografia:** Manchete H2 em 44px (Design: 44px, Impl: text-[44px]).
- **Layout/grid:** Grid 1.05fr/1fr (Design: line 258, Impl: line 58). Pódio com rotação de 0.6deg (Design: line 275, Impl: line 101).
- **Componentes usados:** Stamp (Resolvidos/Faltar), TriRule (Top do Pódio), Avatar (Médio e Grande).
- **Veredicto:** OK.

### 2.4 BShare (Post de Compartilhamento)
- **Design ref:** `var3.jsx` linhas 319-366
- **Impl ref:** `app/m/share/page.tsx` linhas 36-102
- **Tipografia:** Título de participante 22px (Design: 22px, Impl: text-[22px]).
- **Layout/grid:** Card central com TriRule superior e Stamp "Confirmado".
- **Veredicto:** OK.

### 2.5 BLogin (Entrada)
- **Design ref:** `var3b.jsx` linhas 13-90
- **Impl ref:** `app/m/login/page.tsx` linhas 17-76
- **Tipografia:** H2 36px (Design: 36px, Impl: text-4xl).
- **Layout/grid:** Divergência funcional. O design prevê seleção de carimbo/avatar e PIN (line 33). A implementação usa Magic Link com E-mail (line 38) por segurança e arquitetura Supabase.
- **Veredicto:** DIFF (Visual preservado no cabeçalho/estilo, mas formulário é diferente).

### 2.6 BGrupos (Mapa de Grupos)
- **Design ref:** `var3b.jsx` linhas 93-150
- **Impl ref:** `app/grupos/page.tsx` linhas 11-85
- **Tipografia:** Letra do grupo 32px (Design: 32px, Impl: text-[32px]).
- **Layout/grid:** Grid 4x3 (Design: line 113, Impl: line 26).
- **Veredicto:** OK.

### 2.7 BTabela (Tabela Completa)
- **Design ref:** `var3b.jsx` linhas 153-223
- **Impl ref:** `app/tabela/page.tsx` linhas 20-130
- **Tipografia:** Data/Rodada 26px (Design: 26px, Impl: text-[26px]).
- **Layout/grid:** Sidebar de 180px para data (Design: line 186, Impl: line 57). Grid de linha do jogo com 6 colunas.
- **Veredicto:** OK.

### 2.8 BJogo (Detalhe da Partida)
- **Design ref:** `var3b.jsx` linhas 226-309
- **Impl ref:** `app/m/jogo/[id]/JogoPickerClient.tsx`
- **Tipografia:** H2 24px. Placar —:— 24px (Design: 24px, Impl: text-2xl).
- **Layout/grid:** Uso de sentimento da família (barra de progresso tri-colorida).
- **Veredicto:** OK.

### 2.9 BPerfil (Página do Participante)
- **Design ref:** `var3b.jsx` linhas 312-450
- **Impl ref:** `app/[participante]/page.tsx` linhas 23-145
- **Tipografia:** Nome H1 40px/44px. Box de pontos 34px (Design: 34px, Impl: text-[34px]).
- **Layout/grid:** Design desktop prevê grid 1fr/252px. Implementação usa 1.1fr/1fr para equilibrar conteúdo real do DB.
- **Veredicto:** DIFF (Ajuste de proporção para conteúdo dinâmico).

### 2.10 BRegulamento (Regras)
- **Design ref:** `var3b.jsx` linhas 453-548
- **Impl ref:** `app/regulamento/page.tsx` linhas 45-125
- **Tipografia:** Manchete H2 em 64px (Design: 64px, Impl: text-[64px]). Números das regras 30px (Design: 30px, Impl: text-[30px]).
- **Layout/grid:** Grid 3 colunas (Design: line 483, Impl: line 71).
- **Veredicto:** OK.

## 3. Componentes Compartilhados

| Componente | Design (shared.jsx/var3.jsx) | Implementação (tsx) | Veredicto Visual |
| :--- | :--- | :--- | :--- |
| BBrand | `var3.jsx:28` | `components/boletim/BBrand.tsx` | MATCH |
| TriRule | `var3.jsx:40` | `components/boletim/TriRule.tsx` | MATCH |
| Stamp | `var3.jsx:48` | `components/boletim/Stamp.tsx` | MATCH |
| BallMark | `shared.jsx:35` | `components/boletim/BallMark.tsx` | MATCH (Simplified) |
| Flag | `shared.jsx:6` | `components/Flag.tsx` | MATCH |
| Avatar | `shared.jsx:21` | `components/Avatar.tsx` | MATCH |
| Icon | `shared.jsx:50` | `components/Icon.tsx` | MATCH |

## 4. Cores

| Token | Design (oklch/hex) | Impl (Tailwind/CSS) | Status |
| :--- | :--- | :--- | :--- |
| Paper (BG) | `#fbfaf4` | `--paper: #fbfaf4` | MATCH |
| Ink (Text) | `#0b2c5c` | `--ink: #0b2c5c` | MATCH |
| Green | `#0b6b3a` | `--green: #0b6b3a` | MATCH |
| Gold | `#c79410` | `--gold: #c79410` | MATCH |
| Blue | `#0b2c5c` | `--blue: #0b2c5c` | MATCH |

*Nota: A implementação usa HEX extraído das constantes visuais do design `var3.jsx`, garantindo fidelidade ao "canvas" final do designer.*

## 5. Fontes

- **Design:** Utiliza `Bradesco Sans` (Regular/Bold) e `Bradesco Sans Condensed`.
- **Implementação:** Utiliza `Inter Tight` (via Google Fonts) como substituto.
- **Avaliação:**
  - O `Inter Tight` possui uma métrica estreita que simula bem o tom do design original.
  - **Déficit:** A falta de uma variante "Condensed" real na implementação (aliased para o mesmo peso sans) reduz levemente o impacto de "boletim impresso" em rótulos e botões.
  - **Parecer:** Aceitável para MVP, mas recomenda-se a aquisição/embedding da fonte original se a marca Bradesco for central à identidade do bolão.

## 6. Top 10 Desvios Visuais (HIGH -> LOW)

| ID | Severidade | Desvio | Ref Design | Ref Impl | Sugestão Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | HIGH | Falta de fonte Condensed real | `tokens.css:12` | `layout.tsx:10` | Adicionar variante Condensed ou usar `font-stretch`. |
| 2 | MED | Divergência no fluxo de Login | `var3b.jsx:13` | `login/page.tsx` | Alinhar visual do form Magic Link com o "Ticket" do design. |
| 3 | MED | Proporção da Tabela de Grupos | `var3b.jsx:113` | `grupos/page.tsx` | Garantir aspect-ratio fixo para os cards de grupo 4x3. |
| 4 | MED | TriRule superior em Perfil Pub | `var3b.jsx:313` | `[participante]/page.tsx` | Adicionar TriRule de 3px no topo da página pública. |
| 5 | LOW | Arredondamento da Flag | `shared.jsx:11` | `Flag.tsx:18` | Fixar `border-radius: 2px` (estava variável sm/md/lg). |
| 6 | LOW | Padding editorial BFront | `var3.jsx:69` | `app/page.tsx:46` | Ajustar padding para `px-9 py-7` exato do design. |
| 7 | LOW | Cor do separador de rodada | `var3.jsx:202` | `PalpiteClient.tsx:132` | Usar `dashed #d5dde7` consistente em todos os cartões. |
| 8 | LOW | Ícone BallMark simplificado | `shared.jsx:35` | `BallMark.tsx:10` | Re-importar o path SVG complexo do design original. |
| 9 | LOW | Opacidade do papel | `var3.jsx:25` | `tokens.css:48` | Refinar o `oklch(0 0 0 / 0.02)` no gradiente de fundo. |
| 10 | LOW | Letter-spacing em Tags | `tokens.css:112` | `tokens.css:60` | Garantir `0.06em` em todos os elementos `.tag`. |
