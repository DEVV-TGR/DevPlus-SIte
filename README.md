# DevPlus

Site da **DevPlus** — estúdio de web design e desenvolvimento.
Next.js 16 (App Router), React 19, Tailwind v4, Motion, Lenis. Conteúdo em PT-PT.

## Arrancar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run lint
```

## Antes de mexeres no site

**Lê [`docs/README.md`](docs/README.md) primeiro.** A pasta `docs/` é a fonte de
verdade da marca, das cores, dos componentes, dos serviços e dos projetos — não é
documentação de arquivo, é especificação viva. Se alterares um doc, aplica a
alteração no código na mesma sessão (e vice-versa).

Atalhos para o que se muda mais vezes:

| Quero mudar… | Vai a… |
| --- | --- |
| nome, domínio, email, redes | `lib/site.ts` |
| cores e tipografia | `app/globals.css` (tokens) |
| o símbolo "+" | `lib/brand.ts` → `PLUS_PATH` |
| serviços | `lib/services.ts` |
| projetos do portfólio | `lib/projects.ts` |

## Estrutura

```
app/          rotas (App Router) — /, /servicos, /portfolio, /sobre, /contacto, /privacidade
components/   componentes; ui/ tem os primitivos (Button, Container, Section, ProjectCard)
lib/          site.ts (marca), brand.ts (símbolo), services.ts, projects.ts, utils.ts
docs/         a especificação — lê primeiro
public/       estáticos; capas/ tem as capas dos projetos
```
