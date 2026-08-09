/** docs: docs/04-componentes-e-padroes.md — ver "Secções que se escondem". */
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { testimonials, type Testimonial } from "@/lib/testimonials";

/**
 * O que os clientes dizem, na homepage a seguir aos serviços.
 *
 * **Sem testemunhos não há secção nenhuma** — nem título, nem espaçamento, nem
 * estado vazio a dizer "em breve". Uma secção de prova social vazia é pior do
 * que não a ter: anuncia que ninguém falou. Ver `lib/testimonials.ts` para a
 * razão de o array nascer vazio.
 */
export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <Section top={false}>
      <Container>
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            O que dizem de nós
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <li key={`${t.name}-${i}`}>
              <Reveal delay={i * 0.06}>
                <Card testimonial={t} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/* `figure` + `blockquote` + `figcaption`: é o que uma citação atribuída é. A
   semântica sai de graça e não precisa de ARIA por cima. */
function Card({ testimonial: t }: { testimonial: Testimonial }) {
  const assinatura = (
    <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
      {t.image ? (
        <Image
          src={t.image}
          alt={t.imageAlt ?? ""}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        /* Sem foto nem logótipo, a inicial chega para dar peso visual à
           assinatura. Decorativa: o nome está já a seguir, em texto. */
        <span
          aria-hidden
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface-2 font-display text-sm text-muted"
        >
          {t.name.charAt(0)}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate font-display text-sm text-ink">
          {t.name}
        </span>
        {t.role ? (
          <span className="block truncate text-sm text-muted">{t.role}</span>
        ) : null}
      </span>
    </figcaption>
  );

  return (
    <figure className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6">
      <blockquote className="flex-1 text-muted">
        <p>
          {/* Aspas tipográficas à volta da frase — o `blockquote` não as
              desenha, e sem elas a citação lê-se como texto do site. */}
          &ldquo;{t.quote}&rdquo;
        </p>
      </blockquote>
      {t.projectSlug ? (
        <Link
          href={`/portfolio/${t.projectSlug}`}
          className="rounded-lg transition-colors hover:text-ink"
        >
          {assinatura}
        </Link>
      ) : (
        assinatura
      )}
    </figure>
  );
}
