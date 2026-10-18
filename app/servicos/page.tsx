/** docs: docs/05-servicos.md · docs/04-componentes-e-padroes.md · docs/10-materiais-atelier.md */
import { MaterialGround } from "@/components/atelier/MaterialGround";
import styles from "@/components/paginas/paginas.module.css";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/Reveal";
import { Capa } from "@/components/paginas/Capa";
import { Cruz, POSTOS_PAGINA } from "@/components/home/Cruz";
import { Curva } from "@/components/home/Curva";
import { ServicosAcordeao } from "@/components/paginas/ServicosAcordeao";
import { PacotesBancada } from "@/components/paginas/PacotesBancada";
import { FaqJsonLd } from "@/components/JsonLd";
import { services } from "@/lib/services";
import { packages } from "@/lib/packages";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/servicos",
  title: "Serviços",
  description:
"Web design, desenvolvimento, menus e ecrãs digitais, painel de gestão, branding e motion. Do primeiro esboço ao dia em que o site fica no ar.",
});

/* Veio da homepage, que passou a dar o lugar ao trabalho feito e aos
   testemunhos. Aqui encaixa melhor: a seguir ao que fazemos, antes de por onde
   se começa. Ver docs/04. */
const steps: [string, string, string][] = [
  [
    "01",
    "Conversa",
    "Sentamo-nos contigo a perceber o negócio, quem são os teus clientes e o que queres ganhar com isto. Sem isso, o resto é decoração.",
  ],
  [
    "02",
    "Design",
    "Mostramos-te o site desenhado antes de ele existir. Vês, dizes o que mudarias, e só depois se escreve código.",
  ],
  [
    "03",
    "Construção",
    "Abre depressa, funciona bem no telemóvel e aparece nas pesquisas. Não são extras que se pedem — é como fazemos.",
  ],
  [
    "04",
    "No ar",
    "Pomos o site online, acompanhamos os primeiros dias e afinamos o que for preciso. E ficamos cá para o que vier a seguir.",
  ],
];

/* As respostas sobre preço, propriedade e mensalidade são compromissos
   comerciais, não copy — ver docs/05. Não se alteram sem confirmação. */
const faqs: [string, string][] = [
  [
    "Quanto custa um site?",
    "Depende do que precisas: número de páginas, funcionalidades e conteúdo. Falamos contigo, percebemos o âmbito e enviamos uma proposta com o valor e tudo o que está incluído. Se a meio quiseres acrescentar alguma coisa, falamos antes de fazer — nunca depois.",
  ],
  [
    "Quanto tempo demora?",
    "Uma landing page costuma estar pronta em 1 a 2 semanas. Um site completo leva normalmente 3 a 6 semanas — e o que mais pesa nessa conta é a rapidez com que nos chega o conteúdo.",
  ],
  [
    "Trabalham com clientes fora de Portugal?",
    "Sim. Trabalhamos à distância todos os dias, em português ou em inglês. Nunca foi problema.",
  ],
  [
    "O site vai ser mesmo meu?",
    "É teu, e o conteúdo também. O alojamento e o suporte ficam connosco, por uma mensalidade — é isso que garante que o site está sempre no ar, atualizado e com alguém do outro lado quando precisas. Fica tudo escrito na proposta, sem letras pequenas.",
  ],
  [
    "Tratam do alojamento e do domínio?",
    "Tratamos. O alojamento entra na mensalidade e a parte técnica é toda connosco: pôr no ar, manter atualizado e resolver o que aparecer. Do domínio também tratamos, e dizemos-te sempre o que estás a pagar e a quem.",
  ],
  [
    "Dão apoio depois do lançamento?",
    "Damos, e é isso que a mensalidade cobre. Precisas de mudar uma coisa, acrescentar uma página ou resolver um problema? É só dizeres.",
  ],
];

export default function ServicosPage() {
  return (
    <>
      <FaqJsonLd faqs={faqs} />
      <Cruz postos={POSTOS_PAGINA} />

      <Capa
        id="servicos-capa"
        eyebrow="Serviços"
        title={<>Design, código e as chaves <em>na tua mão.</em></>}
        intro="Fazemos tudo o que o teu site precisa, da primeira ideia ao dia em que fica no ar. E deixamos-te o painel para seres tu a mandar nele a partir daí."
        contas={[
          { n: String(services.length).padStart(2, "0"), label: "serviços" },
          { n: String(steps.length).padStart(2, "0"), label: "passos" },
          { n: String(packages.length).padStart(2, "0"), label: "pontos de partida" },
        ]}
      />
      <Curva forma="b" de="var(--bg)" cor="var(--bg-deep)" />

      <ServicosAcordeao />
      <Curva forma="a" de="var(--bg-deep)" cor="var(--bg)" />

      {/* COMO TRABALHAMOS — os mesmos quatro passos da página inicial e, de
          propósito, **não** na mesma forma: ali acumulam-se em cards inclinados
          sobre o título, aqui correm numa linha com os números pousados nela.
          Mesma informação, forma diferente. É a regra do docs/04. */}
      <Section className="relative isolate capitulo-base">
        <MaterialGround finish="crystal" />
        <Container>
          <Reveal>
            <h2 className="interior-heading max-w-[18ch] font-display font-titulo">
              Como um projeto <em>corre.</em>
            </h2>
            <p className="mt-3 max-w-[52ch] text-muted">
              Quatro passos, sempre os mesmos. Sabes onde estás em cada momento.
            </p>
          </Reveal>
          <div className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {/* A linha só existe onde os quatro estão lado a lado: em duas
                colunas ela ligaria passos que não se seguem. */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-[1.15rem] hidden h-px bg-border-strong lg:block"
            />
            {steps.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 0.08}>
                <div className="relative grid gap-2">
                  <span className="relative z-[1] grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-titulo tabular-nums text-primary-ink">
                    {n}
                  </span>
                  <h3 className="t-cartao mt-2 font-display font-titulo">
                    {t}
                  </h3>
                  <p className="text-sm text-muted">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* PACKAGES */}
      <Section className="relative isolate capitulo-quente">
        <MaterialGround finish="satin" />
        <Container>
          <Reveal>
            <h2 className="interior-heading font-display font-titulo">
              Por onde podemos <em>começar</em>
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Cada projeto é diferente, mas costuma partir de um destes pontos.
              Sabes o valor antes de começares — e se a meio quiseres
              acrescentar alguma coisa, falamos antes de fazer.
            </p>
          </Reveal>
          <PacotesBancada />
          <p className="mt-4 text-sm text-muted">
            Nenhum destes é o teu caso?{" "}
            <Link
              href="/contacto"
              className="text-ink underline-offset-4 hover:underline"
            >
              Diz-nos o que tens em mente
            </Link>{" "}
            — fazemos à tua medida.
          </p>
        </Container>
      </Section>

      {/* FAQ */}
      <Section className="relative isolate capitulo-base">
        <MaterialGround finish="matte" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <h2 className="interior-heading font-display font-titulo">
                Perguntas <em>frequentes</em>
              </h2>
              <p className="mt-3 text-muted">
                Ficaste com outra dúvida?{" "}
                <Link
                  href="/contacto"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  Pergunta-nos.
                </Link>
              </p>
            </Reveal>
            <div className="lg:col-span-8">
              <div className={styles.faq}>
                {faqs.map(([q, a], i) => (
                  <details key={q} name="perguntas" open={i === 0}>
                    <summary>{q}<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><path d="M4 12h16M12 4v16" /></svg></summary>
                    <p>{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
