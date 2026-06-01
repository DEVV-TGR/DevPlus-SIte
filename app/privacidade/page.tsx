import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como a XquisiteVision trata os teus dados pessoais quando usas este site ou nos contactas.",
};

const sections: [string, React.ReactNode][] = [
  [
    "Responsável pelo tratamento",
    <>
      A XquisiteVision (&quot;nós&quot;) é responsável pelo tratamento dos dados
      pessoais recolhidos através deste site. Para qualquer questão sobre
      privacidade, escreve para{" "}
      <a
        href="mailto:ola@xquisitevision.pt"
        className="text-ink underline-offset-4 hover:underline"
      >
        ola@xquisitevision.pt
      </a>
      .
    </>,
  ],
  [
    "Que dados recolhemos",
    "Quando preenches o formulário de contacto, recolhemos o teu nome, o teu email e a mensagem que nos envias. Não recolhemos dados sensíveis nem mais informação do que a necessária para te responder.",
  ],
  [
    "Para que usamos os dados",
    "Usamos estes dados apenas para responder ao teu contacto e dar seguimento a um eventual projeto. Não os usamos para envio de marketing sem o teu consentimento.",
  ],
  [
    "Fundamento legal",
    "O tratamento assenta no teu consentimento, ao enviares a mensagem, e no interesse legítimo em responder a pedidos de contacto, nos termos do Regulamento Geral sobre a Proteção de Dados (RGPD).",
  ],
  [
    "Partilha com terceiros",
    "Não vendemos os teus dados. Podemos recorrer a fornecedores que nos ajudam a operar o site (por exemplo, serviço de email ou alojamento), sempre sujeitos a deveres de confidencialidade.",
  ],
  [
    "Conservação",
    "Conservamos os dados apenas durante o tempo necessário para responder e gerir a relação, salvo se existir uma obrigação legal de os manter por mais tempo.",
  ],
  [
    "Os teus direitos",
    <>
      Podes aceder, corrigir, apagar ou limitar o tratamento dos teus dados, bem
      como opor-te ao mesmo. Para exercer estes direitos, escreve para{" "}
      <a
        href="mailto:ola@xquisitevision.pt"
        className="text-ink underline-offset-4 hover:underline"
      >
        ola@xquisitevision.pt
      </a>
      . Tens também o direito de apresentar reclamação à CNPD.
    </>,
  ],
  [
    "Cookies",
    "Este site não utiliza cookies de publicidade nem de rastreio. Podem ser usados apenas cookies técnicos estritamente necessários ao seu funcionamento.",
  ],
  [
    "Alterações a esta política",
    "Podemos atualizar esta política sempre que necessário. A versão em vigor está sempre disponível nesta página.",
  ],
];

export default function PrivacidadePage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Política de Privacidade"
        intro="Como tratamos os teus dados quando usas este site ou nos contactas."
      />

      <Section>
        <Container>
          <div className="max-w-2xl space-y-10">
            {sections.map(([title, body]) => (
              <div key={title}>
                <h2 className="font-display text-xl tracking-tight">{title}</h2>
                <p className="mt-3 text-muted">{body}</p>
              </div>
            ))}
            <p className="border-t border-border pt-6 text-sm text-muted">
              Última atualização: 1 de junho de 2026.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
