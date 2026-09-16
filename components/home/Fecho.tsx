/** docs: docs/04-componentes-e-padroes.md */

import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";

/**
 * O convite, no fim do percurso.
 *
 * O último capítulo **resolve** em vez de se desvanecer: ground quente, uma
 * pergunta, dois caminhos e o email à vista. Uma página que acaba a esbater-se
 * para o rodapé deixa a última sensação por escrever.
 *
 * O texto sobre o laranja é escuro e **opaco**. Uma transparência aqui — que
 * foi o que esteve primeiro — punha o subtítulo em 2.55:1, ou seja a boiar.
 */
export function Fecho() {
  return (
    <section className="relative bg-primary text-primary-ink">
      <div className="grid min-h-[86svh] place-content-center px-6 py-[clamp(4rem,10vh,7rem)] text-center">
        <h2 className="t-seccao mx-auto max-w-[15ch] font-display font-extrabold">
          Conta-nos o que tens em mente.
        </h2>
        <p className="mx-auto mt-4 max-w-[42ch] text-lg text-primary-ink/85">
          Mesmo que ainda seja só uma ideia. Respondemos depressa e dizemos-te
          logo se é trabalho para nós.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/contacto" variant="primary" className="!bg-primary-ink !text-ink">
            Começar a conversa
          </Button>
          <Button
            href="/portfolio"
            variant="outline"
            className="!border-primary-ink/35 !text-primary-ink"
          >
            Ver o trabalho primeiro
          </Button>
        </div>
        <a
          href={`mailto:${site.email}`}
          className="mt-3 inline-flex min-h-11 items-center px-2 text-sm text-primary-ink/80 underline underline-offset-4"
        >
          {site.email}
        </a>
      </div>
    </section>
  );
}
