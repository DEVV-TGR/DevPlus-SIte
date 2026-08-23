/** docs: docs/05-servicos.md */
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";
import { FaqJsonLd } from "@/components/JsonLd";
import { services } from "@/lib/services";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/servicos",
  title: "Serviços",
  description:
    "Web design, desenvolvimento, menus e ecrãs digitais, painel de gestão, branding e motion. Tratamos do teu site do primeiro esboço ao dia em que fica no ar — e do que vier depois.",
});

const packages: {
  name: string;
  desc: string;
  points: string[];
  featured?: boolean;
}[] = [
  {
    name: "Landing page",
    desc: "Uma página só, com o que interessa: quem és, o que fazes e como te contactam. Rápida de pôr no ar.",
    points: [
      "Página única",
      "Copy + design",
      "Formulário de contacto",
      "Otimizada para SEO",
    ],
  },
  {
    name: "Website",
    desc: "O site completo da tua marca, com várias páginas e a mesma linguagem visual em todas.",
    points: [
      "Várias páginas",
      "Design system próprio",
      "CMS opcional",
      "Performance + SEO",
    ],
    featured: true,
  },
  {
    name: "Loja online",
    desc: "Uma loja feita para vender: o cliente compra em poucos toques e tu geres os produtos sem ajuda.",
    points: [
      "Catálogo + checkout",
      "Pagamentos",
      "Gestão de produtos",
      "Analytics",
    ],
  },
];

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
      <PageHero
        eyebrow="Serviços"
        title="Design, código e as chaves na tua mão."
        intro="Fazemos tudo o que o teu site precisa, da primeira ideia ao dia em que fica no ar. E deixamos-te o painel para seres tu a mandar nele a partir daí."
      />

      <Section>
        <Container>
          <div className="flex flex-col divide-y divide-border">
            {services.map((s) => (
              <Reveal key={s.title}>
                <div className="grid gap-6 py-10 sm:grid-cols-12 sm:py-14">
                  <div className="sm:col-span-4">
                    <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
                      {s.title}
                    </h2>
                  </div>
                  <div className="sm:col-span-8">
                    <p className="max-w-xl text-muted">{s.blurb}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {s.items.map((it) => (
                        <li
                          key={it}
                          className="rounded-full border border-border px-3 py-1.5 text-sm text-muted"
                        >
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* COMO TRABALHAMOS */}
      <Section top={false}>
        <Container>
          <Reveal>
            <h2 className="max-w-lg font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Como trabalhamos
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 0.08}>
                <div className="border-t border-border pt-5">
                  <span className="font-display text-sm text-primary">{n}</span>
                  <h3 className="mt-2 font-display text-xl">{t}</h3>
                  <p className="mt-2 text-sm text-muted">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* PACKAGES */}
      <Section top={false}>
        <Container>
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Por onde podemos começar
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Cada projeto é diferente, mas costuma partir de um destes pontos.
              Sabes o valor antes de começares — e se a meio quiseres
              acrescentar alguma coisa, falamos antes de fazer.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {packages.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.06}>
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border p-6",
                    p.featured
                      ? "border-primary/60 bg-primary/[0.06]"
                      : "border-border bg-surface",
                  )}
                >
                  {p.featured ? (
                    <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-ink">
                      Mais escolhido
                    </span>
                  ) : null}
                  <h3 className="font-display text-xl">{p.name}</h3>
                  <p className="mt-2 text-sm text-muted">{p.desc}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5">
                        <span
                          aria-hidden
                          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                        />
                        <span className="text-muted">{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <Button
                      href="/contacto"
                      variant={p.featured ? "primary" : "outline"}
                      className="w-full"
                    >
                      Pedir proposta
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
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
      <Section top={false}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Perguntas frequentes
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
              <dl className="flex flex-col divide-y divide-border">
                {faqs.map(([q, a], i) => (
                  <Reveal key={q} delay={i * 0.04}>
                    <div className="py-6 first:pt-0">
                      <dt className="font-display text-lg">{q}</dt>
                      <dd className="mt-2 text-muted">{a}</dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      <Section top={false}>
        <Container>
          <Reveal>
            <div className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
              <h2 className="mx-auto max-w-lg font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Tens um projeto em mente?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted">
                Conta-nos o que tens em mente, mesmo que ainda seja só uma
                ideia. Damos-te notícias depressa.
              </p>
              <div className="mt-6 flex justify-center">
                <Button href="/contacto" variant="primary">
                  Começar a conversa
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
