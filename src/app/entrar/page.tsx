import { redirect } from "next/navigation";
import { usuarioActual } from "@/lib/supabase/server";
import { Barra } from "@/components/ui";
import { Formulario } from "./formulario";

export const dynamic = "force-dynamic";

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  const { volver } = await searchParams;
  if (await usuarioActual()) redirect(volver?.startsWith("/") ? volver : "/mi-aprendizaje");

  return (
    <>
      <Barra volver={{ href: "/", texto: "Cursos" }} />
      <main className="marco" style={{ paddingBlock: "var(--e-9)" }}>
        <div className="t-folio">Tu cuenta</div>
        <h1 className="t-titulo-1" style={{ marginTop: "var(--e-3)", marginBottom: "var(--e-5)" }}>
          Entra para dejarlo listo
        </h1>
        <p className="t-lectura" style={{ marginBottom: "var(--e-7)", color: "var(--tinta-media)" }}>
          Tu progreso se guarda en el servidor, no en este teléfono. Puedes
          empezar una lección aquí y seguirla en la computadora donde la dejaste.
        </p>
        <Formulario volver={volver} />
      </main>
    </>
  );
}
