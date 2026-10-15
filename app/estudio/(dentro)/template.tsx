/** docs: docs/07-estudio.md */
import { Logo } from "@/components/Logo";

/**
 * A transição entre secções.
 *
 * O `template`, e não o layout, porque o Next o monta de novo a cada mudança de
 * secção — e é isso que faz a animação repetir. O topo está no layout, que não
 * se mexe; isto corre só por baixo dele.
 *
 * O que se vê: o gradiente da marca corre da esquerda para a direita por baixo
 * do topo, com o "+" na ponta a rodar meia volta, e o conteúdo sobe uns pixéis
 * enquanto aparece. Pouco mais de meio segundo. As animações estão em
 * `app/globals.css` (`estudio-*`), em CSS, e o porquê está lá.
 */
export default function ModeloDeDentro({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div aria-hidden className="estudio-risco">
        <div className="estudio-risco__corre">
          <span className="estudio-risco__linha" />
          <Logo className="estudio-risco__mais" />
        </div>
      </div>
      <div className="estudio-entra">{children}</div>
    </>
  );
}
