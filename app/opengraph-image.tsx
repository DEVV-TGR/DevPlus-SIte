/** docs: docs/01-marca.md (texto) · docs/03-simbolo-e-logotipo.md (arte aprovada) */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { socialCardAlt, socialCardSize } from "@/lib/seo";

export const alt = socialCardAlt;
export const size = socialCardSize;
export const contentType = "image/png";

// Arte aprovada em 20/10/2026, preservada integralmente. Leitura local:
// a geração do cartão não depende do domínio nem de pedidos de rede.
const banner = await readFile(
  join(process.cwd(), "public/social/banner-glossy-20261020.png"),
  "base64",
);

export default function Image() {
  return new ImageResponse(
    <img
      src={`data:image/png;base64,${banner}`}
      width={size.width}
      height={size.height}
      alt={alt}
    />,
    size,
  );
}
