/** docs: docs/04-componentes-e-padroes.md · docs/10-materiais-atelier.md */
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { MaterialGround } from "@/components/atelier/MaterialGround";
import { Reveal } from "@/components/Reveal";
import { Capa } from "@/components/paginas/Capa";
import { Cruz, POSTOS_PAGINA } from "@/components/home/Cruz";
import { Curva } from "@/components/home/Curva";
import { atelierAssets } from "@/components/atelier/assets";
import { site } from "@/lib/site";
import styles from "@/components/paginas/paginas.module.css";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/sobre",
  title: "Sobre",
  description: `A ${site.name} é um estúdio pequeno de web design e desenvolvimento. Poucos projetos de cada vez, para dar a cada um a atenção que precisa.`,
});

const values: [string, string][] = [
  [
    "Detalhe",
    "Ninguém repara num espaçamento certo. Repara-se sempre num errado. É aí que se vê se alguém teve cuidado.",
  ],
  [
    "Rapidez",
    "Um site que demora a abrir perde o cliente antes de lhe mostrar seja o que for. Rapidez não é um extra que se pede.",
  ],
];

/* Vieram da homepage, onde estavam como "Porquê a DevPlus". O valor "Parceria"
   saiu da lista acima quando estes chegaram: dizia o mesmo que o terceiro, a
   dois blocos de distância. */
const differentiators: [string, string][] = [
  [
    "O site fica nas tuas mãos",
    "Damos-te um painel feito à tua medida. Mudas preços, fotos e textos à hora que te der jeito, sem ligar a ninguém.",
  ],
  [
    "Falas sempre com quem faz",
    "Aceitamos poucos projetos de cada vez. Quem te atende é quem desenha e quem escreve o código.",
  ],
  [
    "Não desaparecemos no lançamento",
    "O alojamento e o suporte ficam connosco. Se alguma coisa falhar, não tens de andar à procura de quem resolve.",
  ],
];

const beliefs: [string, string][] = [
  [
    "Nada de modelos prontos",
    "Cada negócio é diferente e o site devia dar por isso. Nunca partimos de um modelo feito, e não vamos começar agora.",
  ],
  [
    "Menos, mas melhor",
    "Aceitamos poucos projetos ao mesmo tempo. É a única maneira de dar a cada um a atenção que precisa.",
  ],
  [
    "Feito para durar",
    "Escrevemos o site a pensar em daqui a três anos, não só no dia da entrega. Crescer depois tem de ser fácil.",
  ],
];

const prose = [
  "Somos um estúdio pequeno de web design e desenvolvimento. Trabalhamos sobretudo com negócios que já fazem bem aquilo que fazem e só precisam que a internet o mostre — restaurantes, stands, empresas de serviços.",
  "Quem fala contigo é quem desenha e quem escreve o código. Não há intermediários pelo meio nem modelos prontos a preencher.",
  "E não te deixamos sozinho quando o site fica no ar: o alojamento e o suporte ficam connosco. Se alguma coisa falhar, não tens de andar à procura de quem resolve.",
];
const notes = [...values, ...differentiators];

export default function SobrePage() {
  return (
    <>
      <Cruz postos={POSTOS_PAGINA} />

      <Capa
        id="sobre-capa"
        ambiente="espelho"
        eyebrow="Sobre"
        title={<>Estúdio pequeno, projetos poucos, <em>atenção toda.</em></>}
        intro={`A ${site.name} nasceu de uma ideia simples: a maior parte dos sites podia ser bem melhor. Existimos para acrescentar o que lhes falta.`}
      />
      <Curva forma="a" de="var(--verde)" cor="var(--bg-deep)" ground="verde" />

      <Section className="relative isolate capitulo-fundo">
        <MaterialGround finish="satin" />
        <Container>
          <div className={styles.voz}>
            {prose.map((text, i) => (
              <div className={styles.vozLinha} key={text}>
                <Reveal><p className={styles.vozTexto}>{text}</p></Reveal>
                <div className={styles.vozNotas}>
                  {notes.slice(i * 2, i * 2 + 2).map(([title, body]) => (
                    <aside key={title}>
                      <h2 className="t-cartao font-display">{title}</h2>
                      <p className="mt-2 text-sm text-muted">{body}</p>
                    </aside>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Curva forma="b" de="var(--bg-deep)" cor="var(--bg)" />

      <Section className="relative isolate capitulo-base">
        <MaterialGround finish="metal" />
        <Container>
          {/* O INTERVALO
              A peça de precisão vive aqui, entre a voz e as crenças, e não na
              capa: a capa já tem o ambiente, e a figura que pousa ao lado do
              título é o gesto da página inicial. Fica à esquerda, o título
              assenta à direita — a única página interior com o objeto desse
              lado. É ilustração, não uma fotografia do estúdio. */}
          <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-6 lg:grid-cols-12 lg:gap-10">
            <Reveal className="lg:col-span-6">
              <div aria-hidden className="mx-auto w-[min(90%,26rem)] lg:mx-0 lg:w-full lg:pr-[6%]">
                <Image
                  src={atelierAssets.precision.src}
                  alt=""
                  width={atelierAssets.precision.width}
                  height={atelierAssets.precision.height}
                  sizes="(min-width: 1024px) 34rem, 90vw"
                  loading="lazy"
                  className="h-auto w-full"
                />
              </div>
            </Reveal>
            <Reveal className="lg:col-span-5 lg:col-start-8">
              <h2 className="interior-heading max-w-[14ch] font-display font-titulo">
                Em que <em>acreditamos</em>
              </h2>
            </Reveal>
          </div>
          {/* Sem cards e sem 01/02/03: não é uma sequência — são três coisas
              em que se acredita ao mesmo tempo, e numerá-las era decoração.
              Fica uma lista assumida, com o peso na frase e não na caixa. */}
          <dl className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-3">
            {beliefs.map(([title, blurb]) => (
              <Reveal key={title}>
                <div className={`${styles.regua} pt-5`}>
                  <dt className="font-display text-2xl tracking-tight">
                    {title}
                  </dt>
                  <dd className="mt-3 text-muted">{blurb}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </Container>
      </Section>
    </>
  );
}
