"use client";
/** docs: docs/04-componentes-e-padroes.md · docs/06-projetos.md — prova real, sem autoplay. */
import { useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { gsap, useGSAP } from "@/lib/motion";
import { Logo } from "@/components/Logo";
import { MaterialGround } from "@/components/atelier/MaterialGround";

/**
 * O QR code e o NFC do Café Preguiça, com o vídeo real das mesas.
 *
 * O vídeo **não arranca sozinho** e não descarrega antes do clique
 * (`preload="none"`): são 2 MB que só quem quer ver paga. A derivada servida
 * não tem faixa de áudio, por isso não leva legendas — uma descrição posta como
 * `captions` apresentava-se como transcrição de um som que não existe. O que o
 * vídeo mostra está escrito no parágrafo ao lado, e a legenda da figura diz
 * que é sem som.
 *
 * O movimento é só em desktop e só desloca a figura e o "+": os controlos do
 * vídeo continuam no sítio onde o dedo ou o rato os procura.
 *
 * É um capítulo **verde**: mint no tema claro, forest no escuro, sobre vidro
 * verde (`MaterialGround`). As cores vêm do papel, não de tokens fixos — ver
 * docs/02, "Temas".
 */
export function NaMesa() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const scrollTrigger = {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
          };
          gsap.fromTo(
            "[data-table-film]",
            { rotate: 5, y: 70 },
            { rotate: -2, y: -25, ease: "none", scrollTrigger },
          );
          gsap.to("[data-table-mark]", {
            rotate: 16,
            y: 45,
            ease: "none",
            scrollTrigger: { ...scrollTrigger },
          });
        },
      );
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Section className="table-story capitulo-verde relative isolate" id="na-mesa">
      <MaterialGround finish="glass" />
      <div ref={ref}>
        <Container>
          <div className="table-story-grid">
            <div className="relative z-[1]">
              <h2 className="home-heading table-story-title">
                O digital também
                <br />
                vive <em>à mesa.</em>
              </h2>
              <p className="table-story-intro">
                No Café Preguiça, a ementa está à distância de um gesto.
              </p>
              <p className="table-story-text">
                Lês o QR code ou aproximas o telemóvel do NFC. A carta abre no
                teu ecrã. Do outro lado, a equipa atualiza tudo no painel de
                gestão.
              </p>
              <ul className="table-methods" aria-label="Como se abre a ementa">
                <li>QR code</li>
                <li>NFC</li>
                <li>Ementa digital</li>
              </ul>
              <Link href="/portfolio/cafe-preguica" className="table-story-link">
                Conhece o projeto do Preguiça <span aria-hidden>↗</span>
              </Link>
            </div>
            <div className="table-film-scene">
              <div data-table-mark className="table-story-mark" aria-hidden>
                <Logo className="h-full w-full" />
              </div>
              <figure data-table-film className="table-film">
                <video
                  controls
                  playsInline
                  preload="none"
                  poster="/projetos/preguica-nfc.jpg"
                  width={720}
                  height={1280}
                  aria-label="Demonstração do acesso à ementa do Café Preguiça por QR code e NFC"
                >
                  <source src="/projetos/preguica-nfc.mp4" type="video/mp4" />
                </video>
                <figcaption>Café Preguiça · vídeo sem som, 20 s</figcaption>
              </figure>
            </div>
          </div>
        </Container>
      </div>
    </Section>
  );
}
