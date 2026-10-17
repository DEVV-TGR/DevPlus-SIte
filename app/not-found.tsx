/** docs: docs/04-componentes-e-padroes.md · docs/10-materiais-atelier.md */
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Ambiente } from "@/components/paginas/Ambiente";
import { atelierAssets } from "@/components/atelier/assets";

/**
 * O 404. A mensagem e a saída são as de sempre; à volta, o ambiente do atelier
 * parado e um motivo pequeno de ligação por cima do número — longe do botão,
 * que é para onde o olho tem de ir. Se a imagem não carregar, nada falta: o
 * caminho de volta não depende dela.
 */
export default function NotFound() {
  return (
    <div className="relative">
      <Ambiente corte="topo" />
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <Image
          aria-hidden
          src={atelierAssets.connection.src}
          alt=""
          width={atelierAssets.connection.width}
          height={atelierAssets.connection.height}
          sizes="10rem"
          className="mb-6 h-auto w-40 opacity-90"
        />
        <p className="font-display text-sm font-medium text-acento">404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Esta página não existe
        </h1>
        <p className="mt-4 max-w-sm text-muted">
          Ou nunca existiu, ou mudou de sítio. Seja como for, não foi culpa tua.
        </p>
        <div className="mt-8">
          <Button href="/" variant="primary">
            Voltar ao início
          </Button>
        </div>
      </Container>
    </div>
  );
}
