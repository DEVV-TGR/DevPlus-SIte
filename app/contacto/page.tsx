/** docs: docs/01-marca.md — o email, os telefones e as redes vêm de lib/site.ts. */
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Cruz, type Posto } from "@/components/home/Cruz";
import { ContactForm } from "@/components/ContactForm";
import { site, socials, team, telHref } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/contacto",
  title: "Contacto",
  description:
    "Vamos falar sobre o teu projeto. Conta-nos a tua ideia e respondemos em 24 a 48 horas úteis.",
});

/**
 * O "+" desta página, que quase não é um percurso.
 *
 * Uma página de ação não tem capítulos: cabe num ecrã e resolve-se lá. Por isso
 * dois postos, e ambos do lado direito — em baixo, meio tapado pelo painel do
 * formulário. Do lado esquerdo, que é onde vive o texto, um "+" desta escala
 * atravessava o parágrafo de lado a lado.
 */
const POSTOS_CONTACTO: Posto[] = [
  { p: 0.0, s: 1.7, x: 36, y: 20, r: 0, c: "var(--primary)" },
  { p: 1.0, s: 1.1, x: 42, y: 30, r: 12, c: "var(--primary)" },
];

/**
 * O contacto, numa cena só.
 *
 * O `PageHero` saiu daqui: um cabeçalho por cima e o formulário lá em baixo
 * obrigava a rolar para ver aquilo que a página existe para fazer. O título, as
 * formas de falar e o formulário passam a estar todos no mesmo ecrã, em duas
 * colunas — a esquerda diz, a direita age.
 */
export default function ContactoPage() {
  return (
    <>
      <Cruz postos={POSTOS_CONTACTO} />

      <Section className="relative">
        <Container>
          <div className="grid items-center gap-12 lg:min-h-[76svh] lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
                Contacto
              </p>
              <h1 className="mt-4 max-w-[13ch] font-display text-[clamp(2.2rem,5.5vw,4.2rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
                Vamos falar sobre o teu projeto.
              </h1>
              <p className="mt-5 max-w-[44ch] text-lg text-muted">
                Conta-nos o que tens em mente. Pode ser um projeto pronto a
                arrancar ou só uma ideia ainda por arrumar — respondemos na
                mesma.
              </p>
              <div className="mt-10">
              {/* Um `h2` a sério para a região; as etiquetas abaixo são `dt`, e
                  não headings de 14px — um leitor de ecrã anunciava "título
                  nível 2: Email" para o que é só o rótulo de um campo. */}
              <h2 className="sr-only">Como falar connosco</h2>
              <dl className="flex flex-col gap-8">
                <div>
                  <dt className="text-sm font-medium text-muted">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${site.email}`}
                      className="mt-1 block font-display text-xl transition-colors hover:text-primary"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted">Telefone</dt>
                  <dd>
                    <ul className="mt-1 flex flex-col gap-2">
                      {team.map((m) => (
                        <li key={m.phone}>
                          <a
                            href={`tel:${telHref(m.phone)}`}
                            className="font-display text-xl transition-colors hover:text-primary"
                          >
                            {m.phone}
                          </a>
                          <span className="ml-2 text-sm text-muted">
                            {m.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted">
                    Disponibilidade
                  </dt>
                  <dd>
                    <p className="mt-1 font-display text-xl">
                      Resposta em 24–48h úteis
                    </p>
                    <p className="mt-1.5 text-sm text-muted">
                      Estamos no {site.city} · trabalhamos com quem está mais
                      longe
                    </p>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted">Redes</dt>
                  <dd>
                    <ul className="mt-2 flex flex-col gap-2">
                      {socials.map((s) => (
                        <li key={s.label}>
                          {s.href ? (
                            <a
                              href={s.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ink transition-colors hover:text-primary"
                            >
                              {s.label}
                            </a>
                          ) : (
                            <span className="text-muted">{s.label}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2.5 text-sm text-muted">
                      O WhatsApp ainda está a caminho. Para falar connosco hoje,
                      o email é o caminho mais rápido.
                    </p>
                  </dd>
                </div>
              </dl>
              </div>
            </div>

            {/* O formulário ganha painel: é o único objeto da página que se
                pode tocar, e uma superfície própria separa-o de tudo o resto.
                No protótipo o painel é creme; aqui fica `surface`, porque os
                campos do `ContactForm` são desenhados para ground escuro e
                trocá-los era reescrever o formulário para ganhar uma cor. */}
            <div className="lg:col-span-7">
              <h2 className="sr-only">Formulário de contacto</h2>
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
