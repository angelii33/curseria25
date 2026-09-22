import { notFound } from "next/navigation";
import { Barra, Perforacion, Pie } from "@/components/ui";
import { clienteServidor } from "@/lib/supabase/server";
import { MARCA } from "@/lib/marca";

export const dynamic = "force-dynamic";

async function getCertificado(codigo: string) {
  const sb = await clienteServidor();
  const { data, error } = await sb.rpc("verify_certificate", { check_code: codigo });
  if (error) return null;
  const fila = Array.isArray(data) ? data[0] : data;
  if (!fila) return null;
  return fila as { course_title: string; issued_at: string; verification_code: string };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const cert = await getCertificado(codigo);
  if (!cert) return { title: `Certificado no encontrado — ${MARCA.nombre}` };
  return {
    title: `Certificado · ${cert.course_title} — ${MARCA.nombre}`,
    description: `Certificado verificado de ${cert.course_title}, emitido por ${MARCA.nombre}.`,
  };
}

const fecha = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso)
  );

export default async function Certificado({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const cert = await getCertificado(codigo);
  if (!cert) notFound();

  return (
    <>
      <Barra volver={{ href: "/", texto: "Cursos" }} />
      <main className="marco" style={{ paddingBlock: "var(--e-9)" }}>
        <div style={{ maxWidth: "62ch", marginInline: "auto" }}>
          <div className="t-folio" style={{ textAlign: "center" }}>
            Certificado verificado
          </div>

          <section className="superficie diploma" style={{ marginTop: "var(--e-6)" }}>
            <div className="diploma-sello" aria-hidden="true">
              <span className="sello sello-logrado sello-diploma">✓</span>
            </div>

            <p className="t-dato" style={{ textAlign: "center", color: "var(--tinta-tenue)" }}>
              {MARCA.nombre} certifica que este curso quedó terminado
            </p>

            <h1 className="t-titulo-1" style={{ textAlign: "center", marginTop: "var(--e-4)" }}>
              {cert.course_title}
            </h1>

            <Perforacion sangrada />

            <p className="t-cuerpo" style={{ textAlign: "center", color: "var(--tinta-media)" }}>
              Todas las lecciones completadas y todos los quizzes aprobados.
              <br />
              Emitido el {fecha(cert.issued_at)}.
            </p>

            <Perforacion sangrada />

            <p
              className="t-folio"
              style={{ textAlign: "center", letterSpacing: "0.12em", color: "var(--tinta-tenue)" }}
            >
              CÓDIGO DE VERIFICACIÓN · {cert.verification_code}
            </p>
          </section>

          <p className="t-dato" style={{ textAlign: "center", marginTop: "var(--e-5)", color: "var(--tinta-tenue)" }}>
            Cualquiera con este enlace puede verificar que este certificado es real.
          </p>
        </div>
      </main>
      <Pie />
    </>
  );
}
