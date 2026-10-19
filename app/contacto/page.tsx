/** docs: docs/01-marca.md — o email, os telefones e as redes vêm de lib/site.ts. · docs/04-componentes-e-padroes.md · docs/10-materiais-atelier.md */
import { MaterialGround } from "@/components/atelier/MaterialGround";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Cruz, type Posto } from "@/components/home/Cruz";
import { ContactForm } from "@/components/ContactForm";
import { Avatar } from "@/components/Avatar";
import { MaterialSurface } from "@/components/atelier/MaterialSurface";
import { atelierAssets } from "@/components/atelier/assets";
import styles from "@/components/paginas/paginas.module.css";
import { perfil, site, socials, team, telHref } from "@/lib/site";
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

      <Section className="relative isolate capitulo-base">
        <MaterialGround finish="satin" />
        <Container>
          <div className="grid items-start gap-10 lg:min-h-[76svh] lg:grid-cols-12 lg:items-center lg:gap-12">
            {/* Três blocos, e no telemóvel a ordem é outra: o título diz onde
                se está, o formulário é o que a página existe para fazer, e as
                outras formas de falar vêm depois. Em coluna única, o bloco de
                contactos — email, três telefones, disponibilidade e redes —
                empurrava o formulário para lá do segundo ecrã. */}
            <div className="order-1 lg:order-none lg:col-span-5">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-acento">
                Contacto
              </p>
              {/* `t-capa` dá a família e o desenho; a escala é a da coluna
                  (ver `tituloContacto`): a 90px saía uma palavra por linha
                  e o formulário descia para lá do primeiro ecrã. */}
              {/* O acento é só "projeto." e anda colado a "o teu" (espaços
                  inseparáveis): com "o teu projeto." todo em itálico, a
                  quebra deixava a parte laranja sozinha numa linha, ou um
                  "o" pendurado no fim da anterior. */}
              <h1
                className={`t-capa ${styles.tituloContacto} mt-4 max-w-[16ch] font-display font-titulo`}
              >
                Vamos falar sobre o{"\u00a0"}teu{"\u00a0"}<em>projeto.</em>
              </h1>
              <p className="mt-5 max-w-[44ch] text-lg text-muted">
                Conta-nos o que tens em mente. Pode ser um projeto pronto a
                arrancar ou só uma ideia ainda por arrumar — respondemos na
                mesma.
              </p>
            </div>

            {/* O terceiro bloco do grid, e não um filho do título: só assim
                pode trocar de lugar em telemóvel. Em computador volta para
                debaixo do título, na coluna da esquerda. */}
            <div className="order-3 lg:order-none lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:-mt-4">
              {/* Um `h2` a sério para a região; as etiquetas abaixo são `dt`, e
                  não headings de 14px — um leitor de ecrã anunciava "título
                  nível 2: Email" para o que é só o rótulo de um campo. */}
              <h2 className="sr-only">Como falar connosco</h2>
              {/* Compacto: o email numa linha, a equipa numa lista de três
                  linhas com retrato, e a disponibilidade e as redes lado a
                  lado. Antes eram quatro blocos empilhados com 2rem entre
                  cada um, e a coluna descia muito abaixo do formulário. */}
              <dl className="grid gap-6">
                <div>
                  <dt className="text-sm font-medium text-muted">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${site.email}`}
                      className="-mx-2 flex min-h-11 items-center px-2 font-display text-xl transition-colors hover:text-acento"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted">Telefone</dt>
                  <dd>
                    <ul className="mt-2 grid gap-1">
                      {team.map((m, i) => (
                        <li key={m.phone}>
                          <a
                            href={`tel:${telHref(m.phone)}`}
                            className="group -mx-2 flex min-h-14 items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-ink/5"
                          >
                            <Avatar
                              avatar={m.avatar}
                              indice={i}
                              className="size-11 shrink-0 rounded-full transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105"
                            />
                            <span className="grid leading-tight">
                              <span className="text-sm text-muted">{m.name}</span>
                              <span className="font-display text-lg transition-colors group-hover:text-acento">
                                {m.phone}
                              </span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-muted">
                      Disponibilidade
                    </dt>
                    <dd>
                      <p className="mt-1 font-display text-base">
                        Resposta em 24–48h úteis
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        Estamos no {site.city} · trabalhamos com quem está mais
                        longe
                      </p>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted">Redes</dt>
                    <dd>
                      <ul className="flex flex-wrap gap-x-4">
                        {socials.map((s) => (
                          <li key={s.label}>
                            {s.href ? (
                              <a
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center text-ink transition-colors hover:text-acento"
                              >
                                {s.label}
                                {perfil(s) ? ` · ${perfil(s)}` : ""}
                              </a>
                            ) : (
                              <span className="inline-flex min-h-11 items-center text-muted">
                                {s.label}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-muted">
                        O WhatsApp ainda está a caminho. Para falar connosco
                        hoje, o email é o caminho mais rápido.
                      </p>
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* O formulário ganha painel: é o único objeto da página que se
                pode tocar, e uma superfície própria separa-o de tudo o resto.
                No protótipo o painel é creme; aqui fica `surface`, porque os
                campos do `ContactForm` são desenhados para ground escuro e
                trocá-los era reescrever o formulário para ganhar uma cor. */}
            <div className="order-2 lg:order-none lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
              <h2 className="sr-only">Formulário de contacto</h2>
              {/* A peça de sinal — duas cápsulas ligadas — pousa na aresta
                  de cima do painel, do lado sem rótulos, e só onde há margem
                  livre para ela. É estática: nada se mexe perto de campos ou
                  de mensagens de erro. No telemóvel não existe; lá o espaço é
                  todo do formulário. */}
              <div className="relative">
                <div
                  aria-hidden
                  className="pointer-events-none absolute bottom-full right-6 z-[1] hidden w-[clamp(9rem,14vw,12.5rem)] translate-y-[28%] lg:block"
                >
                  <Image
                    src={atelierAssets.contact.src}
                    alt=""
                    width={atelierAssets.contact.width}
                    height={atelierAssets.contact.height}
                    sizes="12.5rem"
                    loading="lazy"
                    className="h-auto w-full"
                  />
                </div>
                {/* O painel é uma placa de grafite com o metal muito
                    discreto, e **não se inclina**: um formulário que se mexe
                    debaixo do cursor é um formulário onde se falha o campo. */}
                <MaterialSurface finish="graphite" interactive={false} padding="none">
                  <div className="p-6 sm:p-8">
                    <ContactForm />
                  </div>
                </MaterialSurface>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
