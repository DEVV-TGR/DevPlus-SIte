/** docs: docs/04-componentes-e-padroes.md · docs/06-projetos.md (capas e estado) */
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/Reveal";
import type { Project } from "@/lib/projects";

const DEFAULT_SIZES = "(min-width: 768px) 50vw, 100vw";

function Cover({ project, sizes }: { project: Project; sizes: string }) {
  const shape = project.accent === "accent" ? "bg-accent/15" : "bg-primary/15";

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
        <span className="rounded-full border border-ink/10 bg-bg/50 px-3 py-1 text-xs text-ink backdrop-blur-sm">
          {project.category}
        </span>
        {project.status === "em-curso" ? (
          <span className="rounded-full border border-accent/30 bg-bg/50 px-3 py-1 text-xs text-accent backdrop-blur-sm">
            Em curso
          </span>
        ) : null}
      </div>

      <span
        aria-hidden
        className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-ink/10 bg-bg/50 text-ink backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
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
}: {
  project: Project;
  index?: number;
  /** `false` dentro do `ProjectsMarquee`: num track em movimento o
   *  `whileInView` do `Reveal` dispara em posições imprevisíveis. */
  reveal?: boolean;
  sizes?: string;
}) {
  const card = (
    <Link
      href={`/portfolio/${project.slug}`}
      className="block rounded-2xl focus-visible:outline-none"
    >
      {/* `@container`: o rodapé reage à largura do próprio card, não à do ecrã —
          na faixa contínua o card é estreito e o nome não cabe ao lado das
          etiquetas, mas na grelha do portfólio cabe. */}
      <article className="group @container flex flex-col gap-4">
        <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1">
          <Cover project={project} sizes={sizes} />
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
