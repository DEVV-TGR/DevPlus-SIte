import type { NextConfig } from "next";

const emDesenvolvimento = process.env.NODE_ENV === "development";

/**
 * A Content-Security-Policy do site.
 *
 * Os dois `'unsafe-inline'` são deliberados, e é preciso perceber porquê antes
 * de alguém os tentar tirar por higiene:
 *
 * - O Next injeta os dados de hidratação em `<script>` inline cujo conteúdo
 *   muda de página para página. Não há hash estável para eles. Juntam-se-lhes o
 *   script que marca `js` no `<html>` (app/layout.tsx) e os `ld+json` do
 *   `components/JsonLd.tsx`.
 * - A alternativa é um nonce por pedido, que obriga o `proxy.ts` a correr em
 *   todos os pedidos e força **renderização dinâmica em todas as páginas** — o
 *   site deixaria de ser estático, ficava mais lento e mais caro de servir.
 * - O que um `'unsafe-inline'` protege é a injeção de script através de
 *   conteúdo de terceiros. Este site não tem nenhum: tudo o que é renderizado
 *   vem de `lib/site.ts`, `lib/projects.ts` e `lib/services.ts`, ficheiros
 *   nossos e versionados. Não há base de dados, não há utilizadores, não há
 *   input de visitante a chegar ao HTML.
 *
 * Ou seja: pagar-se-ia o site inteiro em performance para fechar uma porta que
 * não dá para lado nenhum. Se um dia entrar conteúdo vindo de fora — um CMS,
 * comentários, uma newsletter — esta conta muda e volta-se a fazê-la.
 *
 * `'unsafe-eval'` **só em desenvolvimento**: o React usa `eval` para
 * reconstruir as stacks de erro do servidor no browser. Em produção nem o React
 * nem o Next o usam, e por isso não entra.
 *
 * `font-src 'self'` chega e não precisa do `fonts.gstatic.com`: o
 * `next/font/google` (app/layout.tsx) descarrega a Bricolage Grotesque na build
 * e serve-a do nosso domínio. Não há pedido a terceiros em runtime.
 *
 * `img-src` leva `data:` por causa do `app/icon.svg` e do cartão social, e
 * `blob:` porque o otimizador de imagens do Next o usa.
 *
 * Ver docs/02-cores-e-tipografia.md (fontes) e docs/04-componentes-e-padroes.md.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${emDesenvolvimento ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * Não há `Strict-Transport-Security` aqui de propósito: a Vercel já o serve em
 * todos os domínios com HTTPS. Repeti-lo à mão criava uma segunda fonte de
 * verdade que diverge da plataforma sem ninguém dar por isso.
 */
const cabecalhosDeSeguranca = [
  { key: "Content-Security-Policy", value: csp },
  /* Sem isto, um ficheiro servido com o tipo errado pode ser interpretado como
     script pelo browser. */
  { key: "X-Content-Type-Options", value: "nosniff" },
  /* `frame-ancestors 'none'` acima já cobre isto nos browsers modernos; fica
     para os que ainda não leem CSP. Sem os dois, o site é enquadrável num
     iframe de qualquer domínio, que é como se montam ataques de clickjacking. */
  { key: "X-Frame-Options", value: "DENY" },
  /* Enviamos a origem para fora, nunca o caminho completo. */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  /* O site não usa nenhuma destas APIs. Declará-lo impede que um script que lá
     chegue um dia as possa pedir. */
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray lockfile in the parent
  // directory was making Next infer the wrong root).
  turbopack: {
    root: __dirname,
  },

  /* Por omissão o Next anuncia-se em `X-Powered-By: Next.js` a cada resposta.
     Não protege nada mantê-lo, e dizer a versão da framework que se corre é
     dizer a quem procura alvos que avisos lhe há de experimentar. */
  poweredByHeader: false,

  /** Cabeçalhos de segurança em todas as rotas. Ver o comentário da `csp`. */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: cabecalhosDeSeguranca,
      },
    ];
  },
};

export default nextConfig;
