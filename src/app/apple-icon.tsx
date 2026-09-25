import { ImageResponse } from "next/og";
import { logoDataUri } from "@/lib/logo-svg";

// El ícono que queda en la pantalla de inicio al instalar la app. Apple no
// respeta transparencia aquí, así que el fondo es el papel de la marca y el
// símbolo va con margen para que el recorte redondeado no lo corte.

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
          backgroundColor: "#FBF9F4",
        }}
      >
        <img src={logoDataUri()} width={132} height={132} alt="" />
      </div>
    ),
    size
  );
}
