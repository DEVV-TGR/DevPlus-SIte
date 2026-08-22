/** docs: docs/01-marca.md — o email e as redes vêm de lib/site.ts. */
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { site, socials } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/contacto" },
  title: "Contacto",
  description:
    "Vamos falar sobre o teu projeto. Conta-nos a tua ideia e respondemos em 24 a 48 horas úteis.",
};

export default function ContactoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contacto"
        title="Vamos falar sobre o teu projeto."
        intro="Conta-nos o que tens em mente. Pode ser um projeto pronto a arrancar ou só uma ideia ainda por arrumar — respondemos na mesma."
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
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
                  <dt className="text-sm font-medium text-muted">
                    Disponibilidade
                  </dt>
                  <dd>
                    <p className="mt-1 font-display text-xl">
                      Resposta em 24–48h úteis
                    </p>
                    <p className="mt-1.5 text-sm text-muted">
                      Estamos em Portugal · trabalhamos com quem está mais
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

            <div className="lg:col-span-7">
              <h2 className="sr-only">Formulário de contacto</h2>
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
