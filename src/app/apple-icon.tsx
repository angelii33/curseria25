import { ImageResponse } from "next/og";

// El ícono que queda en la pantalla de inicio al instalar la app.
//
// Aquí el fondo es musgo sólido y el sello va en cobre: es la misma
// combinación del certificado, la pieza más "premium" del producto. Apple
// no respeta transparencia en este ícono, así que el fondo es explícito.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#22301F",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 118,
            height: 118,
            borderRadius: 999,
            border: "8px solid #9C481C",
            backgroundColor: "#F2DFCF",
            transform: "rotate(-7deg)",
            color: "#9C481C",
            fontSize: 66,
            fontWeight: 800,
          }}
        >
          ✓
        </div>
      </div>
    ),
    size
  );
}
