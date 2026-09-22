import { ImageResponse } from "next/og";
import { getCurso, precio } from "@/lib/catalogo";
import { ESCENA_POR_SLUG, escena } from "@/lib/escenas";
import { MARCA } from "@/lib/marca";

// La tarjeta de UN curso al compartirse. Lleva su escena propia —la misma
// del catálogo, escalada— para que el link de "WhatsApp que contesta solo"
// no se vea igual que el de "Cotiza en 5 minutos". Un link genérico no
// vende; uno que ya muestra el tema, sí.

export const alt = "Curso de Listo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// CRÍTICO: esta imagen lee el curso de Supabase, y ese cliente usa cookies().
// Sin esto, Next intenta generarla durante el build —donde no existe ninguna
// petición ni cookies— y el despliegue falla entero. En local no se notaba
// porque el build no llegaba a pre-generarla.
export const dynamic = "force-dynamic";

const PAPEL = "#F2EEE4";
const MUSGO_900 = "#22301F";
const MUSGO_500 = "#4B6141";
const MUSGO_300 = "#94A288";
const TINTA = "#1E2A1C";
const TINTA_MEDIA = "#4C5847";
const COBRE = "#9C481C";
const COBRE_100 = "#F2DFCF";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // En Next 16 los params son una Promise, igual que en el resto de la app.
  const { slug } = await params;
  const d = await getCurso(slug);

  // Si el curso no existe, se devuelve la tarjeta de marca en vez de
  // romper: un link mal escrito compartido por WhatsApp debe verse
  // igual de cuidado que uno bueno.
  const titulo = d?.curso.title ?? MARCA.nombre;
  const bajada = d?.curso.subtitle ?? MARCA.promesa;
  const lecciones = d?.total ?? 0;
  const precioCents = d?.precio_cents ?? null;
  const tipo = d ? ESCENA_POR_SLUG[d.curso.slug] : undefined;

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: MUSGO_900,
            padding: "26px 64px",
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#F4F1E7",
              letterSpacing: "-0.02em",
            }}
          >
            {MARCA.nombre}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 64px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 660 }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: TINTA,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              {titulo}
            </div>
            <div
              style={{
                fontSize: 25,
                color: TINTA_MEDIA,
                marginTop: 24,
                lineHeight: 1.45,
              }}
            >
              {bajada}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 40 }}>
              {precioCents !== null && (
                <div
                  style={{
                    display: "flex",
                    backgroundColor: COBRE_100,
                    color: COBRE,
                    fontSize: 30,
                    fontWeight: 800,
                    padding: "10px 22px",
                    borderRadius: 4,
                  }}
                >
                  {precio(precioCents, d?.moneda ?? "MXN")} MXN
                </div>
              )}
              {lecciones > 0 && (
                <div style={{ fontSize: 24, color: TINTA_MEDIA }}>
                  {lecciones} piezas listas
                </div>
              )}
            </div>
          </div>

          {/* La escena del curso, del módulo compartido, a 300px */}
          {tipo && (
            <div style={{ display: "flex", flexShrink: 0 }}>
              <svg width={300} height={300} viewBox="0 0 56 56">
                {escena(tipo, MUSGO_500, COBRE)}
              </svg>
            </div>
          )}
        </div>

        <div style={{ display: "flex", padding: "0 0 32px 64px" }}>
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
