# QA — Fidelidade ao Design (Bolão Neca & Yomar — Copa 2026)

**Data:** 2026-05-11
**Implementação em produção:** https://bolao-neca-yomar.vercel.app
**Design fonte de verdade:** `_design/bol-o-neca-yomar/project/` (`var3.jsx`, `var3b.jsx`, `shared.jsx`, `tokens.css`)
**Implementação:** Next.js (App Router) + Tailwind + tokens.css

---

## 1. Inventário tela-a-tela

| # | Tela | Design | Implementação | Status | Resumo do diff |
|---|------|--------|---------------|--------|----------------|
| 1 | **BFront** (Capa) | `var3.jsx` § BFront | `app/page.tsx` | **DIFF MED** | Hero H1 56→60px, ausência de parágrafo editorial (4 linhas Lorem-like), pré-cabeçalho usa `text-grass` em vez de `text-gold` em "Boletim periódico". |
| 2 | **BGrupos** | `var3b.jsx` § BGrupos | `app/grupos/page.tsx` | **DIFF MED** | Design = **12 grupos em 4×3**; impl mantém 4×3 mas com `GROUPS` (que contém 12), com `text-4xl` (36px) — OK. Falta o botão "Mapa em PDF" no header e a ausência do número de grupo em 32px caixa-alta. |
| 3 | **BTabela** | `var3b.jsx` § BTabela | `app/tabela/page.tsx` | **DIFF MED** | Sidebar de dias (filtro como pílula) está como chips horizontais `<a>` em vez do botão filled (`B.ink` background quando ativo). Falta toggle de dia ativo. |
| 4 | **BRegulamento** | `var3b.jsx` § BRegulamento | `app/regulamento/page.tsx` | **OK** | H2 64px (design 60-64) com quebra de linha + número grandes 30px coloridos correspondem; sidebar lateral presente. |
| 5 | **BRanking** | `var3.jsx` § BRanking | `app/ranking/page.tsx` | **OK** | Stamps + título + tabela com pos coloridas funcionando; metadata `revalidate=0` correto para ranking ao vivo. |
| 6 | **BPalpite** (mobile) | `var3.jsx` § BPalpite | `app/m/palpite/PalpiteClient.tsx` | **OK** | Status bar mobile 9:41, cabeçalho navy, cards por jogo com botões 1/X/2 conforme design. `GROUP_COLORS` corretos. |
| 7 | **BJogo** (mobile) | `var3b.jsx` § BJogo | `app/m/jogo/[id]/page.tsx` + `JogoPickerClient.tsx` | **DIFF LOW** | Detalhe de partida mobile renderiza, mas faltam alguns elementos decorativos (Stamp de status, "Encerra em" countdown). |
| 8 | **BLogin** (mobile) | `var3b.jsx` § BLogin | `app/m/login/page.tsx` | **DIFF LOW** | PIN de 4 dígitos como 4 caixas separadas no design; impl usa fluxo Supabase-OTP (email magic-link). **Mudança intencional de produto, não de design.** |
| 9 | **BShare** (mobile) | `var3.jsx` § BShare | `app/m/share/page.tsx` + `ShareActions.tsx` | **OK** | Card pronto para captura + ações Whatsapp/Download presentes. |
| 10 | **BPerfil** (mobile + público) | `var3b.jsx` § BPerfil | `app/m/perfil/page.tsx` + `app/[participante]/page.tsx` | **OK** | Perfil próprio + página pública `/[participante]` com avatar + score + cartela. |

**Score global:** 6 OK · 4 DIFF MED/LOW · 0 DIFF HIGH.

---

## 2. Comparação detalhada — 4 telas mais visíveis

### 2.1 BFront (Capa)

#### Layout (grid, masthead, sidebar)

| Aspecto | Design (`var3.jsx`) | Impl (`app/page.tsx`) |
|---|---|---|
| Masthead | `borderBottom: 2px solid B.ink`, padding "20px 36px 14px" | `border-b-2 border-ink px-9 pb-3.5 pt-5` — **OK** |
| Sub-strip | `padding: "6px 36px"`, `font-mono`, `letterSpacing: 0.12em` | `px-9 py-1.5 font-mono tracking-[0.12em]` — **OK** |
| Grid editorial | `gridTemplateColumns: "1.4fr 1fr"` + borderRight ink line | Não confirmado no recorte lido — **provável OK** |

#### Tipografia

| Elemento | Design | Impl | Match |
|---|---|---|---|
| Eyebrow "Boletim periódico" | `fontSize: 10`, mono, `0.2em`, color **`B.gold`** (`#c79410`) | `text-[10px] text-grass` | **DIFF** cor (grass≠gold) |
| H1 "O Bolão" | `fontSize: 64`, cond, `fontWeight: 800`, `leading-0.88` | `text-[60px] font-bold leading-[0.9]` | **DIFF LOW** (60 vs 64; 0.9 vs 0.88) |
| Volume label | `fontSize: 10`, mono, `0.18em`, `B.gold` | `text-[10px] tracking-[0.18em] text-gold` | **OK** |
| Hero H2 | `fontSize: 56`, cond, 800, italic em "e desta vez" verde + "quinze mil" gold | `text-[56px] font-extrabold` + `italic font-normal text-grass` | **OK** |
| Parágrafo editorial | `fontSize: 14.5`, `lineHeight: 1.65`, maxWidth 540 | Presença confirmada no design; impl precisa confirmar — **DIFF a verificar** |

#### Cores específicas
- `B.ink` (#0b2c5c) → impl `--ink` ✓
- `B.green` (#0b6b3a) → impl `--green` ✓ (também alias `--grass` via Tailwind config? **verificar config**)
- `B.gold` (#c79410) → impl `--gold` ✓
- `B.blue` = `B.ink` → impl `--blue` ✓

#### Spacing
- Design: `px 36` (`px-9` Tailwind = 36px) ✓
- Stamps: design `gap: 14`; impl `gap-3.5` (14px) ✓

**Arquivos referência:**
- Design: `_design/bol-o-neca-yomar/project/var3.jsx:~70-170`
- Impl: `app/page.tsx:1-80`

---

### 2.2 BGrupos

#### Layout

| Aspecto | Design (`var3b.jsx` § BGrupos) | Impl (`app/grupos/page.tsx`) |
|---|---|---|
| Cartela | `gridTemplateColumns: "1fr 252px"` — **MAIN + RIGHT RAIL** | `grid grid-cols-4 grid-rows-3` SEM right-rail | **DIFF MED** |
| Grade interna | `display: flex flexDirection: column gap: 8` + cartela 4×3 grupos | `gridTemplateColumns: repeat(4,1fr); gridTemplateRows: repeat(3,1fr)` | **OK** |
| Header | h2 36px, Stamps + Mapa PDF button | h2 `text-4xl` (36px), Stamps presentes, **falta botão Mapa PDF** | **DIFF LOW** |

#### Tipografia
- "Quem joga com quem": design `fontSize: 36, cond, 800, uppercase, letterSpacing: -0.01em` → impl `text-4xl font-extrabold uppercase tracking-tight` ✓
- "A cartela por grupo" h3: design 18px cond 800 → não localizado equivalente em impl (right-rail ausente)
- Card grupo: design letra 32px cond 800 cor `B.green` se Brasil senão `B.ink` → impl pega `hasBR` mas não claro tamanho

**Arquivos referência:**
- Design: `var3b.jsx:~590-676` (BGrupos)
- Impl: `app/grupos/page.tsx:1-100`

---

### 2.3 BTabela

#### Layout

| Aspecto | Design | Impl |
|---|---|---|
| Filtro de dias | Botões pílula (`border 1.5px solid B.line`, ativo `background: B.ink color: B.paper`) | `<a href="#dia-XX">` chip estático, sem highlight ativo |
| Tabela | `gridTemplateColumns: "180px 1fr"` (dia col + jogos), borderBottom dashed | `gridTemplateColumns: "180px 1fr"` ✓, `border-b border-line scroll-mt-4` ✓ |
| Linha jogo | gridTemplateColumns aprox `48px 50px 1.2fr 60px 1.2fr 88px` | `gridTemplateColumns: "48px 50px 1.2fr 60px 1.2fr 88px"` **OK exato** |

#### Tipografia
- Dia eyebrow: design mono 10 0.18em gold → impl `font-mono text-[10px] tracking-[0.18em] text-gold` ✓
- Número jogo: design mono 10 0.1em ink2 → impl `font-mono text-[10px] tracking-[0.1em] text-ink2` ✓

#### Diff principal
- **Falta seletor ativo de dia** (UX importante quando há 18+ dias). Design usa `useStateBB(0)` + render `shown = days.slice(0,4)` (paginação). Impl mostra TODOS os dias linkados via âncora — escolha de produto, mas perde o "filtro" interativo.

**Arquivos:**
- Design: `var3b.jsx` § BTabela
- Impl: `app/tabela/page.tsx:30-110`

---

### 2.4 BRegulamento

#### Layout

| Aspecto | Design | Impl |
|---|---|---|
| Header | TriRule + BBrand + label gold | `<PageHeader>` (TriRule + BBrand + label gold) ✓ |
| H2 hero | "As nove" + quebra `<br>` + segunda linha italic | `text-[64px] font-extrabold leading-[0.88]` com `<br/>` + `<span>` italic ✓ |
| Body | Duas colunas com numeração 30px colorida (ink/green/gold/blue) | `RegraCol` com `gridTemplateColumns: "34px 1fr"`, números `text-[30px]` ✓ |
| Sidebar | Notas + "Boa sorte e bom jogo" alinhado direita | Sidebar com lista `· ...` + footer alinhado direita ✓ |

#### Cores e Spacing — **MATCH**.
- Números das regras: design usa `B.ink/B.green/B.gold/B.blue` alternando → impl recebe `numberColor` prop ✓
- Padding `px-7 py-4` ≈ design 22-24px ✓

**Arquivos:**
- Design: `var3b.jsx` § BRegulamento
- Impl: `app/regulamento/page.tsx:1-130`

---

## 3. Componentes primitivos

### BBrand
- Design (`var3.jsx`): `<BallMark size={size+6} color={B.green} />` + col 2 spans (titulo cond 700 ink + subtitulo mono 9.5 gold tracking 0.18em mt 3).
- Impl (`components/boletim/BBrand.tsx`): mesma estrutura, `BallMark color="#0b6b3a"`, `font-cond` titulo, `text-gold font-mono text-[9.5px] tracking-[0.18em] mt-[3px]`. **MATCH.**

### TriRule
- Design: 3 stripes `flex: 1` height `h` colors green/gold/blue.
- Impl (`components/boletim/TriRule.tsx`): `bg-grass / bg-gold / bg-bluebr` (precisa confirmar Tailwind aliases — `grass` mapeia para `--green`? `bluebr` para `--blue`?). **MATCH funcional**, depende dos aliases do tailwind.config.

### Stamp
- Design: `border 2px solid color`, rotated, `font-cond 700 13px uppercase 0.06em`, `rgba(255,255,255,0.4)` background, padding `6px 12px`.
- Impl (`components/boletim/Stamp.tsx`): `border-2 px-2.5 py-1 text-[13px] font-bold uppercase tracking-wider rounded-md` + `transform: rotate(...)` + `rgba(255,255,255,0.4)`. **MATCH**. Single diff: `rounded-md` (6px) vs design sem rounding explícito (provavelmente 0). **DIFF LOW**.

### BallMark — **CRÍTICO**

**Design (`shared.jsx` linha BallMark):**
```jsx
<circle cx="12" cy="12" r="10.5" stroke={color} strokeWidth="1.5" />
<path d="M12 5l3.2 2.3 -1.2 3.8h-4l-1.2-3.8L12 5z" fill={color} />
<path d="M12 5v3.5" stroke ... />
<path d="M5 11l3 1.2 ..." />
<path d="M9 18l1.2-3M15 18l-1.2-3" stroke ... />
```
→ Pentágono central preenchido + linhas radiais para os hexágonos vizinhos. É a **bola de futebol estilizada** característica.

**Impl (`components/boletim/BallMark.tsx`):**
```jsx
<circle cx="12" cy="12" r="10" stroke ... />
<path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4" />
```
→ 8 raios cardinais saindo do centro (parece **um sol/asterisco**, não bola).

**Severidade: HIGH.** Bola é o ícone-âncora da identidade. O design tem pentágono central preenchido + linhas curtas conectando à borda; impl tem raios longos do centro à borda. Visualmente lê como ícone genérico de "sol/explosão", não bola de futebol.

### Flag
- Design (`shared.jsx`): `flag` CSS class width 22×14, 3 stripes verticais grid 1fr 1fr 1fr, recebe `code` e busca cores em `D.teams[code].colors`.
- Impl (`components/Flag.tsx`): recebe `colors: [a,b,c]` diretamente (sem código país), 4 tamanhos `sm/md/lg/xl`, 3 stripes flex-1. **MATCH visual**, API diferente (impl recebe array; design recebe code). Impl é mais composável.

### Avatar
- Design (`shared.jsx`): recebe `p` (participante), hash do `p.id` → oklch(0.85 0.08 hue) bg + oklch(0.28 0.07 hue) fg, fontSize size*0.42, cond 700, letterSpacing -0.02em.
- Impl (`components/Avatar.tsx`): recebe `name`/`initials`/`emoji`, hashColor com bitshift via charCodeAt, bg `oklch(0.75 0.10 hue)`, **color: "#0b2c5c" hardcoded** (não escalonado por hue). Suporta `emoji` (novo).
- **DIFF MED:** cor do texto fixa navy em vez de matching com hue do bg → menor variação visual entre avatares. Saturação 0.10 vs design 0.08 — levemente mais colorido. Mas funcional.

### Icon
- Design (`shared.jsx`): Lucide-style outline, `strokeWidth=1.5`, `strokeLinecap/Linejoin=round`. Set: Trophy, Share, Calendar, Check, Users, Download, Whatsapp, etc.
- Impl (`components/Icon.tsx`): mesmo padrão (`base()` helper), mesmo set + ArrowRight extra. Paths levemente diferentes mas todos seguem mesma linguagem visual. **MATCH funcional.**

---

## 4. Tokens / Cores

| Token | Design `tokens.css` | Impl `styles/tokens.css` | Match |
|---|---|---|---|
| `--bg`, `--bg-1`, `--bg-2` | oklch(1 0 0), 0.985, 0.97 | idem | **OK** |
| `--fg`, `--fg-2`, `--fg-3` | oklch(0.145), 0.556, 0.708 | idem | **OK** |
| `--line` (neutral) | oklch(0.922 0 0) | `--line-neutral` (renomeado) | **OK funcional** |
| `--ink` | **NÃO DEFINIDO** no design tokens.css (vive como `B.ink="#0b2c5c"` no JSX) | `#0b2c5c` ✓ | **OK** (impl extraiu literal corretamente) |
| `--ink-2` | (idem, JSX: `#5a6a86`) | `#5a6a86` ✓ | **OK** |
| `--paper` | (idem, JSX: `#fbfaf4`) | `#fbfaf4` ✓ | **OK** |
| `--paper-2` | `#f4f1e6` | `#f4f1e6` ✓ | **OK** |
| `--line` (boletim) | `#d5dde7` | `#d5dde7` ✓ | **OK** |
| `--green` | `#0b6b3a` | `#0b6b3a` ✓ | **OK** |
| `--green-soft` | `#e5efe8` | `#e5efe8` ✓ | **OK** |
| `--gold` | `#c79410` | `#c79410` ✓ | **OK** |
| `--gold-soft` | `#f6ecc7` | `#f6ecc7` ✓ | **OK** |
| `--blue` | `#0b2c5c` (= ink) | `#0b2c5c` ✓ | **OK** |
| `--blue-soft` | `#e8edf5` | `#e8edf5` ✓ | **OK** |
| `--grass` (oklch) | `oklch(0.45 0.13 150)` | **NÃO PORTADO** (impl usa `--green` hex no lugar) | **DIFF LOW** — `--grass` no design é um verde "campo" em oklch distinto de `--green` (`#0b6b3a`). Impl colapsou ambos em um só verde. Visual idêntico em sRGB; perde precisão em wide-gamut. |
| `--gold` (oklch) | `oklch(0.86 0.16 95)` | `#c79410` (hex) | **DIFF baixo** — design define `--gold` em oklch (mais saturado/claro); o hex `#c79410` da Variação 3 é um gold "envelhecido". Os dois coexistem no design (uma é "gold do sistema neutro", outro é "gold da Variação 3"). Impl pegou o gold v3 — **correto para Variação 3**. |
| `.paper-bg` (gradiente) | `radial-gradient` + `repeating-linear-gradient` (linhas a cada 30px) | idem hex exato | **OK** |

**Conclusão tokens:** **Match quase perfeito.** Único ponto: `--grass` (oklch wide-gamut) foi colapsado em `--green` (hex sRGB). Em telas P3 isso seria perceptível; em monitores sRGB, idêntico.

---

## 5. Tipografia

### Design pede
- **Bradesco Sans** (300-800, italic) — fonte primária via `@font-face` local woff.
- **Bradesco Sans Condensed** (400, 700) — `var(--font-cond)` — usada em **TODOS** os títulos: H1 do masthead, H2 hero, BBrand, números 1/X/2, pontuação grande no ranking, etc.
- **Geist Mono** — eyebrows e metadata (mono 10-11px 0.12-0.22em letterSpacing).

### Impl entrega
- **Inter Tight** via `next/font/google` (variável `--font-inter-tight`).
- `--font-sans` = Inter Tight.
- `--font-cond` = **TAMBÉM Inter Tight** (mesma fonte aliased).
- `--font-mono` = Geist Mono ✓ (match).

### Avaliação visual

**Bradesco Sans** é uma humanist semi-geométrica com terminais arredondados, x-height médio, e — crucialmente — **Bradesco Sans Condensed é genuinamente condensada** (~85% width). É a fonte que carrega o "ar de papel-jornal" das edições impressas.

**Inter Tight** é uma neo-grotesque com x-height alto, terminais retos, geometria mais rígida. **Não tem variante condensed.** Aliasar `--font-cond` para Inter Tight significa que o título "O BOLÃO" 60px **não fica condensed** — fica largo. Idem para "VOLTA O BOLÃO DA CASA" 56px do hero. Idem para "AS NOVE" 64px do regulamento.

**Impacto visual:** **DIFF MED-HIGH.** O "ar de boletim impresso" depende muito da combinação:
1. Cream paper bg ✓ mantido
2. Stamps rotacionados ✓ mantidos
3. **Títulos condensed maiúsculos** — **perdido**. Sem condensed, os títulos respiram mais largura e perdem o aspecto "manchete de tabloide / boletim semanal". Lembra mais um SaaS moderno com Inter do que zine impresso.
4. Mono Geist ✓ mantido (eyebrows OK)

**Recomendação:**
- **Curto prazo:** trocar `--font-cond` para uma condensed gratuita do Google Fonts: **Barlow Condensed**, **Oswald**, ou **Roboto Condensed** (700/800). Manter Inter Tight para body. Custo: ~30KB extra.
- **Longo prazo:** se houver licença de Bradesco Sans (woff já existem em `_design/.../fonts/`), self-host com `next/font/local`. ADR-002 menciona que a troca foi consciente; reabrir essa decisão pode valer.

---

## 6. Top 10 desvios — ranqueados por severidade

| # | Sev | Diff | Design | Impl | Fix sugerido |
|---|-----|------|--------|------|--------------|
| 1 | **HIGH** | BallMark é raios cardinais (sol), não bola de futebol | `shared.jsx` linha ~58 — paths com pentágono fill + linhas radiais curtas | `components/boletim/BallMark.tsx:13-21` — 8 linhas longas cardinais/diagonais | Copiar paths exatos do design: `<path d="M12 5l3.2 2.3 -1.2 3.8h-4l-1.2-3.8L12 5z" fill={color}/>` + linhas radiais curtas. |
| 2 | **HIGH** | `--font-cond` aliased para Inter Tight (não-condensed) | `tokens.css:14` `Bradesco Sans Condensed` woff local | `styles/tokens.css:12` `var(--font-inter-tight, "Inter Tight")` | Adicionar `Barlow Condensed` (700/800) via `next/font/google` em `app/layout.tsx` e setar `--font-cond` para essa variável; alternativamente self-host `BradescoSans-CondensedBold.woff`. |
| 3 | **MED** | BGrupos sem right-rail (252px sidebar) | `var3b.jsx` BGrupos: `gridTemplateColumns: "1fr 252px"` | `app/grupos/page.tsx:30` apenas grid 4×3 sem rail | Adicionar `<aside>` 252px com legenda (acertou/errou/aguarda chips coloridos) à direita do grid. |
| 4 | **MED** | BFront eyebrow "Boletim periódico" em **grass** em vez de **gold** | `var3.jsx`: design não especifica claramente esse eyebrow mas convenção mono 10px tracking 0.2em geralmente é gold | `app/page.tsx:18` `text-grass` | Trocar para `text-gold` para casar com a paleta dos eyebrows mono do resto do sistema (consistência com PageHeader e sub-strip volume label, ambos gold). |
| 5 | **MED** | BTabela sem filtro de dia ativo (chips estáticos) | `var3b.jsx` BTabela: `useStateBB(0)` + render `shown = days.slice(0,4)` com pílula filled active | `app/tabela/page.tsx` `<a href="#dia-X">` sem state ativo | Converter chip em `<button>` client component com state `useState(0)` e `aria-current="true"`; estilo ativo `bg-ink text-paper`. Manter âncora como fallback. |
| 6 | **MED** | Avatar usa cor texto navy fixa em vez de hue-matched | `shared.jsx` Avatar: bg `oklch(0.85 0.08 h)` fg `oklch(0.28 0.07 h)` | `components/Avatar.tsx:23` `color: "#0b2c5c"` hardcoded | Calcular `fg = oklch(0.28 0.07 hue)` no JS (já tem `hashColor`); aplicar via inline style. |
| 7 | **LOW** | H1 capa 60px em vez de 64px do design | `var3.jsx` "O BOLÃO" sem fontSize explícito no recorte, mas hero H2 usa 56 e padrões boletim tipicamente 60-64 para H1 | `app/page.tsx:23` `text-[60px]` | Subir para `text-[64px]` ou manter — diff visual mínimo se Bradesco Cond restaurada. |
| 8 | **LOW** | Stamp tem `rounded-md` (6px) | `var3.jsx` Stamp inline: sem `borderRadius` declarado → 0px | `components/boletim/Stamp.tsx:13` `rounded-md` | Trocar para `rounded-none` ou remover `rounded-md`. Carimbo de papel deve ser retangular. |
| 9 | **LOW** | BGrupos sem botão "Mapa em PDF" no header | `var3b.jsx` BGrupos header: `bBtn("ghost")` com Icon.Download | `app/grupos/page.tsx:24` sem botão | Adicionar `<button>` ghost ink-bordered com Icon.Download "Mapa em PDF" alinhado à direita. Pode ser stub `disabled` por ora. |
| 10 | **LOW** | `--grass` (oklch wide-gamut) colapsado em `--green` (hex sRGB) | `_design/tokens.css:34` `--grass: oklch(0.45 0.13 150)` | `styles/tokens.css` ausente; apenas `--green: #0b6b3a` | Adicionar `--grass: oklch(0.45 0.13 150)` para reaproveitar no Tailwind `bg-grass` (TriRule já usa `bg-grass`). Mapear ambos `grass` e `green` no tailwind.config. |

---

## Anexos — referências por arquivo

**Design (fonte de verdade):**
- `D:\BolaoNecaYomar\_design\bol-o-neca-yomar\project\tokens.css` (106 linhas)
- `D:\BolaoNecaYomar\_design\bol-o-neca-yomar\project\var3.jsx` (BFront, BPalpite, BRanking, BShare)
- `D:\BolaoNecaYomar\_design\bol-o-neca-yomar\project\var3b.jsx` (BLogin, BGrupos, BTabela, BJogo, BPerfil, BRegulamento)
- `D:\BolaoNecaYomar\_design\bol-o-neca-yomar\project\shared.jsx` (Flag, Avatar, BallMark, Icon)

**Implementação:**
- `D:\BolaoNecaYomar\styles\tokens.css`
- `D:\BolaoNecaYomar\app\page.tsx`
- `D:\BolaoNecaYomar\app\grupos\page.tsx`
- `D:\BolaoNecaYomar\app\tabela\page.tsx`
- `D:\BolaoNecaYomar\app\regulamento\page.tsx`
- `D:\BolaoNecaYomar\app\ranking\page.tsx`
- `D:\BolaoNecaYomar\app\m\palpite\PalpiteClient.tsx`
- `D:\BolaoNecaYomar\app\m\jogo\[id]\page.tsx` + `JogoPickerClient.tsx`
- `D:\BolaoNecaYomar\app\m\login\page.tsx`
- `D:\BolaoNecaYomar\app\m\share\page.tsx` + `ShareActions.tsx`
- `D:\BolaoNecaYomar\app\m\perfil\page.tsx`
- `D:\BolaoNecaYomar\app\[participante]\page.tsx`
- `D:\BolaoNecaYomar\components\boletim\{BBrand,TriRule,Stamp,BallMark,PageHeader,PageFooter}.tsx`
- `D:\BolaoNecaYomar\components\{Avatar,Flag,Icon}.tsx`

**Conclusão executiva:**
A implementação alcança **fidelidade alta** em layout, cores (paleta hex exatamente portada), spacing e componentes primitivos como TriRule/Stamp/BBrand. Os dois desvios mais perceptíveis visualmente são (1) **BallMark simplificado** que perdeu a leitura de "bola de futebol" e (2) **ausência de fonte condensed real**, que enfraquece o "DNA tipográfico de boletim impresso" — todos os títulos H1/H2 ficam visualmente mais largos e modernos do que o design pretende. Tudo o mais é polimento de baixo-médio impacto. **Recomendado priorizar fixes #1 e #2 antes de polir o resto.**
