/** docs: docs/04-componentes-e-padroes.md · docs/06-projetos.md (capas e estado) */
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";
import type { Project } from "@/lib/projects";

const DEFAULT_SIZES = "(min-width: 768px) 50vw, 100vw";

/**
 * As etiquetas e a seta pousam sobre a capa. Paradas, desfocam o que têm por
 * baixo; em movimento, a superfície é opaca — ver o `blur` mais abaixo.
 */
const PASTILHA = "rounded-full border px-3 py-1 text-xs";
const SOBRE_CAPA = {
  desfocada: "bg-bg/50 backdrop-blur-sm",
  opaca: "bg-bg/85",
} as const;

function Cover({
  project,
  sizes,
  blur,
}: {
  project: Project;
  sizes: string;
  blur: boolean;
}) {
  const shape = project.accent === "accent" ? "bg-accent/15" : "bg-primary/15";
  const fundo = blur ? SOBRE_CAPA.desfocada : SOBRE_CAPA.opaca;

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface-2">
      {project.image ? (
        <>
          <Image
            src={project.image}
            alt={project.imageAlt ?? ""}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {/* Véu por baixo: o nome do projeto tem de se ler sobre qualquer capa,
              incluindo as claras. Superfície, não texto — ver docs/02. */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg via-bg/70 to-transparent"
          />
        </>
      ) : (
        /* Sem imagem: forma sólida da cor do projeto (sem gradiente) */
        <div
          aria-hidden
          className={cn(
            "absolute -right-10 -top-10 h-40 w-40 rounded-full transition-transform duration-700 ease-out group-hover:scale-[1.7]",
            shape,
          )}
        />
      )}

      <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
        <span className={cn(PASTILHA, "border-ink/10 text-ink", fundo)}>
          {project.category}
        </span>
        {project.status === "em-curso" ? (
          <span className={cn(PASTILHA, "border-accent/30 text-accent", fundo)}>
            Em curso
          </span>
        ) : null}
      </div>

      <span
        aria-hidden
        className={cn(
          "absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-ink transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
          fundo,
        )}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M5 11L11 5M11 5H6M11 5V10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span className="absolute bottom-5 left-5 right-5 font-display text-2xl font-semibold tracking-tight transition-transform duration-500 group-hover:-translate-y-1 sm:text-3xl">
        {project.name}
      </span>
    </div>
  );
}

export function ProjectCard({
  project,
  index = 0,
  reveal = true,
  sizes = DEFAULT_SIZES,
  blur = true,
}: {
  project: Project;
  index?: number;
  /** `false` dentro do `ProjectsMarquee`: num track em movimento o
   *  `whileInView` do `Reveal` dispara em posições imprevisíveis. */
  reveal?: boolean;
  sizes?: string;
  /** `false` dentro do `ProjectsMarquee`. Cada card tem três superfícies com
   *  `backdrop-filter`, e a faixa mostra dez cards: medido no Chrome, eram
   *  **26 elementos desfocados** — todos os da página — a serem recompostos a
   *  cada frame de um contentor a rolar. Numa grelha parada o custo é nulo e o
   *  desfoque fica. Ver `docs/04`. */
  blur?: boolean;
}) {
  const card = (
    <Link href={`/portfolio/${project.slug}`} className="block rounded-2xl">
      {/* `@container`: o rodapé reage à largura do próprio card, não à do ecrã —
          na faixa contínua o card é estreito e o nome não cabe ao lado das
          etiquetas, mas na grelha do portfólio cabe. */}
      <article className="group @container flex flex-col gap-4">
        <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1">
          <Cover project={project} sizes={sizes} blur={blur} />
        </div>
        <div className="flex flex-col gap-2 px-1 @md:flex-row @md:items-start @md:justify-between @md:gap-4">
          <div>
            <h3 className="font-display text-lg">{project.name}</h3>
            <p className="text-sm text-muted">
              {project.client} · {project.year}
            </p>
          </div>
          <ul className="flex flex-wrap gap-1.5 @md:justify-end">
            {project.services.map((s) => (
              <li
                key={s}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </Link>
  );

  if (!reveal) return card;

  return <Reveal delay={index * 0.06}>{card}</Reveal>;
}
