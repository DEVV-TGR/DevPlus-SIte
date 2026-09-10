/** docs: docs/07-estudio.md */
import { cn } from "@/lib/utils";
import { COR_ESTADO, PASTILHA } from "@/components/estudio/estilos";
import { ROTULO_ESTADO, type Estado } from "@/lib/estudio/tipos";

export function EtiquetaEstado({
  estado,
  className,
}: {
  estado: Estado;
  className?: string;
}) {
  return (
    <span className={cn(PASTILHA, COR_ESTADO[estado], className)}>
      {ROTULO_ESTADO[estado]}
    </span>
  );
}
