import { ImageResponse } from "next/og";

export const alt = "XquisiteVision — Estúdio de web design & desenvolvimento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded Open Graph / Twitter card. Uses the default next/og font (no custom
// font file needed) and flexbox-only layout (Satori does not support grid).
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
          background: "#1a1613",
          padding: "80px",
          color: "#f7f2ec",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: "#F2762B",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#F2762B",
            }}
          >
            <div
              style={{
                width: 40,
                height: 24,
                borderRadius: "50%",
                background: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#000000",
                  }}
                />
              </div>
            </div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 600 }}>XquisiteVision</div>
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
          Web design com visão, construído ao detalhe.
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: "#c8bdb0",
          }}
        >
          <div>Estúdio de web design &amp; desenvolvimento</div>
          <div>xquisitevision.pt</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
