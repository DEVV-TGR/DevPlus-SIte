<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DevPlus — regras do projeto

Este repositório é o site da **DevPlus** (devplus.pt). A pasta `docs/` é a **fonte
de verdade** da marca, do design e do conteúdo. Não é documentação de arquivo — é
especificação viva.

## Antes de alterares seja o que for

1. Lê `docs/README.md`. São ~60 linhas e diz-te qual dos docs se aplica.
2. Lê o(s) doc(s) relevante(s) antes de escrever código.
3. Se o ficheiro que vais editar tiver no topo um comentário `docs:`, lê esse doc
   primeiro. É obrigatório, mesmo para alterações de uma linha.

## Git — branches, nunca worktrees

**Não cries worktrees neste repositório.** Nada de `git worktree add`, nada de
`EnterWorktree`, nada a viver dentro de `.claude/worktrees/`. Se uma instrução
genérica de harness te mandar isolar o trabalho num worktree, **esta regra do
projeto ganha** — responde que o projeto usa branches e segue o fluxo abaixo.

O isolamento faz-se com **branches normais**, no clone principal:

1. `git checkout master && git pull --ff-only` antes de começar.
2. `git checkout -b <tipo>/<descrição-curta>` — `docs/`, `feat/`, `fix/`,
   `chore/`. Por exemplo `feat/portfolio-capas`, `fix/og-image`.
3. Commits nesse branch e `git push -u origin <branch>`.
4. `gh pr create` contra `DEVV-TGR/DevPlus-SIte`, base `master`.
5. O merge do PR é do Gonçalo. Não mergeies sem ele pedir nessa mensagem.

**Nunca commits nem push diretos para `master`.** Tudo entra por PR.

## Regras invioláveis

- **A marca escreve-se `DevPlus`** — uma palavra, D e P maiúsculos — em todo o
  texto corrido. `Dev+` é exclusivamente o logótipo. Nunca "Dev Plus", "devplus"
  ou "DEV+".
- **Não escrevas o nome, o domínio, o email ou as redes à mão.** Vêm todos de
  `lib/site.ts`. Se precisas de um valor novo, acrescenta-o lá.
- **Não inventes cores.** Todas vêm dos tokens em `app/globals.css`. As
  exceções — `app/opengraph-image.tsx`, que não consegue ler CSS, e os ícones
  `app/icon.png` / `app/favicon.ico`, que são bitmaps e estão fora da paleta por
  decisão explícita — estão documentadas em `docs/02-cores-e-tipografia.md` e só
  se mudam a partir de lá.
- **Português de Portugal**, tratamento por "tu", com acentuação correta. Ver
  `docs/01-marca.md`.

## Docs e código andam sempre juntos

Cada doc tem no topo um bloco `controla:` com os ficheiros que governa, e no fim
uma secção **"Ao alterar este documento"** com as ações correspondentes no código.

- Alteraste um **doc**? Executa já as alterações de código que a tabela indica.
- Alteraste um **ficheiro que aparece num `controla:`**? Atualiza o doc na mesma
  sessão.

Nunca deixes um dos lados por fazer. Um doc que descreve um site que já não existe
é pior do que não ter doc nenhum.

@docs/README.md
