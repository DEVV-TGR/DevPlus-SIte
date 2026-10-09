"use client";
/** docs: docs/06-projetos.md — "Vídeo no telemóvel" */

import { useEffect, useRef } from "react";

/**
 * O vídeo de um site a fazer scroll, para ir dentro do `IPhone`.
 *
 * Só corre quando está à vista: um `<video autoPlay>` fora do ecrã gasta
 * bateria e dados a quem nem chegou a esta parte da página. Com
 * `preload="none"` nada se descarrega até ao primeiro play — até lá vê-se o
 * poster, que é o primeiro frame e por isso não salta quando o vídeo entra.
 *
 * Com `prefers-reduced-motion` não arranca sozinho: fica o poster, que já
 * mostra o site. Um ecrã a deslizar sozinho é exatamente o movimento que essa
 * preferência pede para não haver.
 */
export function TelemovelVideo({
  video,
  poster,
  alt,
}: {
  video: string;
  poster: string;
  alt: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // O browser pode recusar o play (poupança de energia, por exemplo).
          // Fica o poster, que é o que se queria mostrar de qualquer maneira.
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={video}
      poster={poster}
      aria-label={alt}
      muted
      loop
      playsInline
      preload="none"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
