import { ImageResponse } from "next/og";
import { MARCA } from "@/lib/marca";
import { logoCompletoDataUri } from "@/lib/logo-svg";

// La tarjeta que se ve cuando alguien comparte "CurserIA" por WhatsApp.
//
// Es la primera impresión real del producto: para estos negocios el canal
// es WhatsApp, y un link sin imagen se lee como algo improvisado. Se dibuja
// en el servidor con los colores del logotipo — verde y naranja de CurserIA —
// y su símbolo, para que la tarjeta y la app sean el mismo producto.
//
// Nota: next/og no usa las fuentes del sitio ni variables CSS. Los colores
// van en hex literal (los mismos del sistema) y la tipografía cae a la de
// sistema en peso 800, que es lo más cercano a Archivo bold disponible aquí.

export const alt = `${MARCA.nombre} — ${MARCA.promesa}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPEL = "#F2EEE4";
const MUSGO_300 = "#94A288";
const TINTA = "#1E2A1C";
const TINTA_MEDIA = "#4C5847";

export default async function Image() {
  const logo = await logoCompletoDataUri();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: PAPEL,
        }}
      >
        {/* El logotipo completo, tal cual el original */}
        <div style={{ display: "flex", padding: "54px 64px 0" }}>
          <img src={logo} width={430} height={109} alt="" />
        </div>

        {/* Cuerpo: la promesa, grande */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 64px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
            <div
              style={{
                fontSize: 62,
                fontWeight: 800,
                color: TINTA,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
              }}
            >
              {MARCA.promesa}
            </div>
            <div
              style={{
                fontSize: 27,
                color: TINTA_MEDIA,
                marginTop: 28,
                lineHeight: 1.45,
              }}
            >
              Cada curso arregla una cosa de tu negocio y termina con esa cosa
              hecha.
            </div>
          </div>

        </div>

        {/* Perforación inferior: la firma visual del producto */}
        <div style={{ display: "flex", padding: "0 0 34px 64px" }}>
          <div style={{ display: "flex", gap: 13 }}>
            {Array.from({ length: 34 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  backgroundColor: MUSGO_300,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
