import { ImageResponse } from "next/og";
import { MARCA } from "@/lib/marca";

// La tarjeta que se ve cuando alguien comparte "Listo" por WhatsApp.
//
// Es la primera impresión real del producto: para estos negocios el canal
// es WhatsApp, y un link sin imagen se lee como algo improvisado. Se dibuja
// en el servidor con los mismos tokens del Design System — papel, musgo,
// cobre, el sello a −7° — para que la tarjeta y la app sean el mismo
// producto, no dos cosas parecidas.
//
// Nota: next/og no usa las fuentes del sitio ni variables CSS. Los colores
// van en hex literal (los mismos del sistema) y la tipografía cae a la de
// sistema en peso 800, que es lo más cercano a Archivo bold disponible aquí.

export const alt = `${MARCA.nombre} — ${MARCA.promesa}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPEL = "#F2EEE4";
const MUSGO_900 = "#22301F";
const MUSGO_300 = "#94A288";
const TINTA = "#1E2A1C";
const TINTA_MEDIA = "#4C5847";
const COBRE = "#9C481C";
const COBRE_100 = "#F2DFCF";

export default function Image() {
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
        {/* Banda de marca: el mismo musgo de la barra de la app */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: MUSGO_900,
            padding: "28px 64px",
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#F4F1E7",
              letterSpacing: "-0.02em",
            }}
          >
            {MARCA.nombre}
          </div>
        </div>

        {/* Cuerpo: la promesa, grande, con el sello a la derecha */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 64px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
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

          {/* El sello: mismo −7°, mismo cobre que en toda la app */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 208,
              height: 208,
              borderRadius: 999,
              border: `9px solid ${COBRE}`,
              backgroundColor: COBRE_100,
              transform: "rotate(-7deg)",
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 108, fontWeight: 800, color: COBRE }}>✓</div>
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
