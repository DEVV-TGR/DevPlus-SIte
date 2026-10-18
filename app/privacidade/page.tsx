/** docs: docs/01-marca.md — o nome e o email vêm de lib/site.ts. · docs/04-componentes-e-padroes.md · docs/10-materiais-atelier.md */
import { MaterialGround } from "@/components/atelier/MaterialGround";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHero } from "@/components/PageHero";
import styles from "@/components/paginas/paginas.module.css";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/privacidade",
  title: "Política de Privacidade",
  description: `Como a ${site.name} trata os teus dados pessoais quando usas este site ou nos contactas.`,
});

const sections: [string, React.ReactNode][] = [
  [
    "Responsável pelo tratamento",
    <>
      A {site.name} (&quot;nós&quot;) é responsável pelo tratamento dos dados
      pessoais recolhidos através deste site. Para qualquer questão sobre
      privacidade, escreve para{" "}
      <a
        href={`mailto:${site.email}`}
        className="text-ink underline-offset-4 hover:underline"
      >
        {site.email}
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
    "Não vendemos os teus dados. Recorremos a dois fornecedores para operar o site, ambos sujeitos a deveres de confidencialidade: a Vercel, que aloja o site e a base de dados onde guardamos os registos de trabalho descritos abaixo, e a Resend, que entrega na nossa caixa as mensagens enviadas pelo formulário de contacto. Se recorrermos a mais algum, passará a constar aqui pelo nome.",
  ],
  [
    "Se fores nosso cliente",
    "Para gerir os trabalhos que temos em mãos, mantemos um registo interno com o nome do cliente, os contactos que nos deste e notas sobre o que ficou combinado. É acessível apenas a nós, protegido por autenticação, e existe só enquanto durar a relação de trabalho e as obrigações legais associadas. Não é usado para marketing nem partilhado com ninguém.",
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
        href={`mailto:${site.email}`}
        className="text-ink underline-offset-4 hover:underline"
      >
        {site.email}
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
      {/* Acabamento estático; a leitura e os campos nunca recebem tilt. */}
      <div className="relative isolate capitulo-base">
        <MaterialGround finish="matte" />
        <PageHero
          eyebrow="Legal"
          title={<>Política de <em>Privacidade</em></>}
          intro="Como tratamos os teus dados quando usas este site ou nos contactas."
        />
      </div>

      <Section className="relative isolate capitulo-base">
        <MaterialGround finish="matte" />
        <Container>
          <div className={styles.politica}>
          <nav aria-label="Secções da política">
            {sections.map(([title], i) => <a key={title} href={`#politica-${i}`}>{title}</a>)}
          </nav>
          <div className="max-w-2xl space-y-10">
            {sections.map(([title, body], i) => (
              <div key={title} id={`politica-${i}`} className="scroll-mt-28">
                <h2 className="t-cartao font-display">{title}</h2>
                <p className="mt-3 text-muted">{body}</p>
              </div>
            ))}
            <p className="border-t border-border pt-6 text-sm text-muted">
              Última atualização: 8 de setembro de 2026.
            </p>
          </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
