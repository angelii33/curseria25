import { ImageResponse } from "next/og";
import { getCertificado, fechaLarga } from "@/lib/certificado";
import { MARCA } from "@/lib/marca";

export const alt = "Certificado verificado de Listo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Lee Supabase con cookies(): no se puede generar en el build.
export const dynamic = "force-dynamic";

const PAPEL = "#F2EEE4";
const LIENZO = "#FBF9F4";
const MUSGO_900 = "#22301F";
const MUSGO_600 = "#3E5236";
const TINTA_MEDIA = "#4C5847";
const COBRE = "#9C481C";

export default async function Image({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const cert = await getCertificado(codigo);
  const curso = cert?.course_title ?? MARCA.nombre;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: PAPEL, padding: 48 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: LIENZO,
            border: `3px double ${MUSGO_600}`,
            borderRadius: 16,
            padding: 48,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 999,
              backgroundColor: MUSGO_600,
              color: PAPEL,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 800,
            }}
          >
            ✓
          </div>
          <div style={{ marginTop: 28, fontSize: 26, color: TINTA_MEDIA, letterSpacing: 4, textTransform: "uppercase" }}>
            {cert ? "Certificado verificado" : MARCA.nombre}
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: curso.length > 34 ? 56 : 68,
              fontWeight: 800,
              color: MUSGO_900,
              textAlign: "center",
              lineHeight: 1.05,
              letterSpacing: -1.5,
            }}
          >
            {curso}
          </div>
          {cert ? (
            <div style={{ marginTop: 26, fontSize: 26, color: TINTA_MEDIA }}>
              {`Emitido el ${fechaLarga(cert.issued_at)} · ${MARCA.nombre}`}
            </div>
          ) : null}
          {cert ? (
            <div style={{ marginTop: 10, fontSize: 20, color: COBRE, letterSpacing: 3 }}>
              {`CÓDIGO ${cert.verification_code}`}
            </div>
          ) : null}
        </div>
      </div>
    ),
    size
  );
}
