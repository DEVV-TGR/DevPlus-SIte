import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Vamos falar sobre o teu projeto. Conta-nos a tua ideia e respondemos em 24 a 48 horas úteis.",
};

const socials = [
  { href: "https://www.instagram.com/xquisitevision", label: "Instagram" },
  { href: "https://www.linkedin.com/company/xquisitevision", label: "LinkedIn" },
];

export default function ContactoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contacto"
        title="Vamos falar sobre o teu projeto."
        intro="Conta-nos o que tens em mente — seja uma ideia ainda por definir ou um projeto pronto a arrancar. Respondemos depressa."
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-sm font-medium text-muted">Email</h2>
                  <a
                    href="mailto:ola@xquisitevision.pt"
                    className="mt-1 block font-display text-xl transition-colors hover:text-primary"
                  >
                    ola@xquisitevision.pt
                  </a>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-muted">
                    Disponibilidade
                  </h2>
                  <p className="mt-1 font-display text-xl">
                    Resposta em 24–48h úteis
                  </p>
                  <p className="mt-1.5 text-sm text-muted">
                    Portugal · trabalhamos com clientes em qualquer lugar
                  </p>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-muted">Redes</h2>
                  <ul className="mt-2 flex flex-col gap-2">
                    {socials.map((s) => (
                      <li key={s.label}>
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink transition-colors hover:text-primary"
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
