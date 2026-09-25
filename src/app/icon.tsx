import { ImageResponse } from "next/og";
import { logoDataUri } from "@/lib/logo-svg";

// El favicon: el símbolo de CurserIA (diana, libro y flecha), el mismo que
// va en la barra. Se genera en el build desde src/lib/logo-svg.ts, así vive en
// el repositorio como texto revisable y no como un binario suelto.

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={logoDataUri()} width={32} height={32} alt="" />
      </div>
    ),
    size
  );
}
