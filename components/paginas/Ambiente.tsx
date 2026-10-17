/** docs: docs/04-componentes-e-padroes.md · docs/10-materiais-atelier.md */
import { AtelierBackdrop } from "@/components/atelier/AtelierBackdrop";
import { cn } from "@/lib/utils";
import styles from "./paginas.module.css";

/**
 * O ambiente do atelier por trás de um cabeçalho interior.
 *
 * **Só em secções sem fundo próprio.** O `AtelierBackdrop` pinta o seu ground,
 * e dentro de uma secção `isolate` — o uso descrito no docs/10 — ficava por
 * cima do "+" do `Cruz`, que é uma camada `fixed z-0`: nas capas apagava o
 * primeiro tramo do gesto. Aqui vive numa camada negativa da página, por baixo
 * do "+" e do conteúdo. Numa secção com `bg-*` próprio essa camada ficava
 * tapada pelo fundo da secção — aí não se usa.
 *
 * `corte` muda o enquadramento do mesmo bitmap, para a família se repetir sem
 * a composição se repetir. `alvo` é o `id` da secção que recebe o ponteiro;
 * sem ele o ambiente fica parado — é o caso de tudo o que tem campos ou texto
 * legal por cima.
 */
export function Ambiente({
  corte = "pleno",
  alvo,
  intensidade = "quiet",
}: {
  corte?: "pleno" | "margens" | "espelho" | "topo";
  alvo?: string;
  intensidade?: "quiet" | "standard";
}) {
  return (
    <div
      aria-hidden
      className={cn(
        styles.ambiente,
        corte === "margens" && styles.margens,
        corte === "espelho" && styles.espelho,
        corte === "topo" && styles.topo,
      )}
    >
      <AtelierBackdrop
        intensity={intensidade}
        interactive={Boolean(alvo)}
        targetId={alvo}
      />
    </div>
  );
}
