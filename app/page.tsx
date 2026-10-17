/** docs: docs/04-componentes-e-padroes.md — ordem e forma dos capítulos. */
import { Cruz, POSTOS_HOME_MOBILE } from "@/components/home/Cruz";
import { Curva } from "@/components/home/Curva";
import { NaMesa } from "@/components/home/NaMesa";
import { HeroHome } from "@/components/home/HeroHome";
import { ComoTrabalhamos } from "@/components/home/ComoTrabalhamos";
import { ProvaCarrossel } from "@/components/home/ProvaCarrossel";
import { ServicosMostra } from "@/components/home/ServicosMostra";
import { Pacotes } from "@/components/home/Pacotes";
import { Testimonials } from "@/components/Testimonials";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({ path: "/" });
export default function Home() {
  return (
    <>
      <Cruz postosMobile={POSTOS_HOME_MOBILE} />
      <HeroHome />
      <Curva forma="b" de="var(--bg)" cor="var(--paper)" />
      <ProvaCarrossel />
      <Curva forma="c" de="var(--paper)" cor="var(--mint)" ground="claro" />
      <NaMesa />
      <Curva forma="a" de="var(--mint)" cor="var(--bg-deep)" ground="claro" />
      <ComoTrabalhamos />
      <Curva forma="a" de="var(--bg-deep)" cor="var(--forest)" />
      <ServicosMostra />
      <Pacotes />
      <Testimonials />
    </>
  );
}
