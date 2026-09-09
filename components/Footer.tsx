/** docs: docs/01-marca.md — o email e as redes vêm de lib/site.ts.
 *  A forma e o movimento do bloco estão em docs/04. */
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Curva } from "@/components/home/Curva";
import { Fecho } from "@/components/Fecho";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { site, socials } from "@/lib/site";

const nav = [
  { href: "/servicos", label: "Serviços" },
  { href: "/portfolio", label: "Portfólio" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contacto", label: "Contacto" },
];

/**
 * O fim do site, e é **um bloco só**.
 *
 * Até setembro de 2026 eram dois: a `home/Fecho` — ground laranja, um convite,
 * dois botões — e logo a seguir este rodapé, com `mt-24 border-t`, outro título
 * de convite, outro botão para `/contacto`, e só depois a navegação. Dois
 * grounds, dois títulos, dois CTAs para o mesmo sítio: a página acabava duas
 * vezes, e a última coisa que se via era a mais parada de todas.
 *
 * Agora o convite é a **cabeça do rodapé** (`components/Fecho.tsx`) e tudo o
 * resto vive no mesmo laranja, por baixo da régua onde a poeira de "+" pousa. O
 * corte entre o convite e o rodapé deixou de existir porque deixou de haver
 * dois grounds — e a `Curva` que trazia o laranja passou da `app/page.tsx` para
 * aqui, portanto **as seis páginas acabam da mesma maneira**.
 *
 * Duas consequências que se notam:
 *
 * - **O `Cruz` desaparece por trás do laranja no último ecrã**, e é de
 *   propósito. O gesto não morre: quem o continua é a poeira do `Fecho`, que
 *   converge para a régua. Ver o último posto em `home/Cruz.tsx`.
 * - **A marca aqui é o símbolo isolado, não o lockup.** O "+" do `Lockup` é
 *   sempre `--primary` (docs/03), e sobre o ground laranja isso é um buraco no
 *   "D" em vez de um logótipo. O `Logo` pinta em `currentColor` exatamente para
 *   este caso.
 */
export function Footer() {
  return (
    <>
      {/* A passagem para o laranja. Vivia na `app/page.tsx`, ao lado do
          `Fecho`; agora é do rodapé, porque o rodapé é que é o fecho. As seis
          páginas acabam num ground `--bg`, portanto o `de` é o mesmo em todas
          — se alguma passar a acabar noutro ground, é aqui que se vê. */}
      <Curva forma="a" de="var(--bg)" cor="var(--primary)" />

      {/* `relative` porque as páginas têm `Cruz`: uma secção sem `position` é
          pintada antes de qualquer elemento posicionado, ou seja por baixo do
          "+". Ver docs/04. */}
      <footer className="relative bg-primary text-primary-ink">
        <Fecho />

        <Container className="py-12 sm:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <Reveal className="lg:col-span-2">
              <Link
                href="/"
                aria-label={`${site.name} — página inicial`}
                /* `-m` a compensar o `p`: a área tocável chega aos 44px sem o
                   símbolo mudar de sítio nem de tamanho. E o "+" roda no hover,
                   como o do `Lockup` — é a mesma assinatura. */
                className="-m-2 inline-flex p-2"
              >
                <Logo className="h-12 w-12 transition-transform duration-300 hover:rotate-90 sm:h-14 sm:w-14" />
              </Link>
              <p className="mt-5 max-w-sm text-sm text-paper-ink">
                Estúdio de web design e desenvolvimento. Sites, menus digitais e
                plataformas para negócios que gostam de mandar no que é seu.
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <nav aria-label="Rodapé">
                <h2 className="text-sm font-medium text-paper-ink">Navegação</h2>
                {/* `gap-0` com altura em cada link, em vez de `gap-2.5`: o
                    espaço entre linhas é o mesmo, mas passa a ser área tocável
                    em vez de vão morto. Os links do rodapé mediam 61×18. */}
                <ul className="mt-1 flex flex-col">
                  {nav.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="flex min-h-11 items-center text-sm text-primary-ink underline decoration-transparent underline-offset-4 transition-[text-decoration-color] hover:decoration-primary-ink"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </Reveal>

            <Reveal delay={0.12}>
              <h2 className="text-sm font-medium text-paper-ink">Redes</h2>
              <ul className="mt-1 flex flex-col">
                {socials.map((s) => (
                  <li key={s.label}>
                    {s.href ? (
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 items-center text-sm text-primary-ink underline decoration-transparent underline-offset-4 transition-[text-decoration-color] hover:decoration-primary-ink"
                      >
                        {s.label}
                      </a>
                    ) : (
                      /* Sem link é uma conta que ainda não existe — ver
                         `lib/site.ts`. Fica em `paper-ink`, que é o tom de
                         apoio sobre o laranja (6.07:1, docs/02): mais claro do
                         que isso não se lê. */
                      <span className="flex min-h-11 items-center text-sm text-paper-ink">
                        {s.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal className="mt-10 flex flex-col gap-3 border-t border-primary-ink/20 pt-6 text-xs text-paper-ink sm:flex-row sm:items-center sm:justify-between">
            {/* Sem ano: a página é estática, `getFullYear()` congelava no ano da
                build e o rodapé passava janeiro a mentir até ao próximo deploy. */}
            <p>© {site.name}. Todos os direitos reservados.</p>
            {/* As duas páginas legais lado a lado. O Livro de Reclamações é
                obrigatório para prestadores de serviços e tem de estar visível
                sem ser preciso procurar — daí o rodapé, e não uma página só
                dele. Ver docs/01, "O Livro de Reclamações". */}
            <ul className="-my-3 flex flex-wrap items-center gap-x-3">
              <li>
                <Link
                  href="/privacidade"
                  className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-primary-ink"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <a
                  href={site.livroReclamacoes}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Livro de Reclamações Eletrónico"
                  className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-primary-ink"
                >
                  Livro de Reclamações
                </a>
              </li>
            </ul>
          </Reveal>
        </Container>
      </footer>
    </>
  );
}
