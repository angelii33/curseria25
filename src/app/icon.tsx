import { ImageResponse } from "next/og";

// El favicon, generado en el build a partir del mismo sello de la marca.
//
// Se dibuja por código en vez de subir un .ico: así vive en el repositorio
// como texto revisable, cambia con los tokens si la marca cambia, y no hay
// un binario que se desincronice del resto del sistema.
//
// A 32px el anillo tiene que ser grueso o desaparece: el sello de la app
// usa 2px sobre 34px, aquí la proporción sube para que siga legible en una
// pestaña. Es el mismo gesto, ajustado al tamaño — no otro ícono.

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F2EEE4",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 999,
            border: "3px solid #22301F",
            transform: "rotate(-7deg)",
            color: "#22301F",
            fontSize: 17,
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
