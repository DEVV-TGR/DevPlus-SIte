/** docs: docs/01-marca.md (texto) · docs/03-simbolo-e-logotipo.md (o mark) */
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { BRAND_HEX } from "@/lib/brand";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Cartão Open Graph / Twitter. Usa a fonte default do next/og (sem ficheiro de
// fonte) e só flexbox — o Satori não suporta grid.
//
// O "+" aqui é feito com duas barras em vez do PLUS_PATH: o Satori não desenha
// SVG complexo. Os cantos interiores ficam vivos em vez de arredondados — a
// 64px a diferença é sub-pixel. É uma aproximação assumida (ver docs/03).
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BRAND_HEX.bg,
          padding: "80px",
          color: BRAND_HEX.ink,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: BRAND_HEX.primary,
          }}
        />

        {/* Lockup: "Dev" + o "+" a laranja, como em components/Wordmark.tsx */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 40, fontWeight: 600 }}>Dev</div>
          <div
            style={{
              position: "relative",
              width: 34,
              height: 34,
              display: "flex",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 11,
                width: 34,
                height: 12,
                borderRadius: 3,
                background: BRAND_HEX.primary,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 11,
                top: 0,
                width: 12,
                height: 34,
                borderRadius: 3,
                background: BRAND_HEX.primary,
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 74,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 920,
          }}
        >
          Web design que soma ao teu negócio.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: BRAND_HEX.muted,
          }}
        >
          <div>Sites, plataformas e menus digitais</div>
          <div>{site.domain}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
