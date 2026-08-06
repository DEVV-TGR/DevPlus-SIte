/** docs: docs/01-marca.md (texto) · docs/03-simbolo-e-logotipo.md (o mark) */
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { BRAND_HEX, D_PATH, LOCKUP } from "@/lib/brand";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Cartão Open Graph / Twitter. Usa a fonte default do next/og (sem ficheiro de
// fonte) e só flexbox — o Satori não suporta grid.
//
// O logótipo é o mesmo `D_PATH` + `LOCKUP.plusPath` do site: dois `<path>`
// simples, sem `<g transform>` (que o Satori não desenha de forma fiável).
export default function Image() {
  return new ImageResponse(
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

      {/* O logótipo "D+", o mesmo path de components/Lockup.tsx */}
      <div style={{ display: "flex" }}>
        <svg
          width={Math.round(56 * LOCKUP.ratio)}
          height={56}
          viewBox={LOCKUP.viewBox}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={D_PATH} fill={BRAND_HEX.ink} fillRule="evenodd" />
          <path d={LOCKUP.plusPath} fill={BRAND_HEX.primary} />
        </svg>
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
    </div>,
    { ...size },
  );
}
