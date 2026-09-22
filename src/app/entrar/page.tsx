import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { usuarioActual } from "@/lib/supabase/server";
import { Barra } from "@/components/ui";
import { Formulario } from "./formulario";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entra con un código a tu correo. Sin contraseñas.",
  robots: { index: false, follow: true },
};

/** Solo rutas internas: «//otro-sitio.com» también empieza con «/». */
const interna = (r?: string) => (r && r.startsWith("/") && !r.startsWith("//") ? r : undefined);

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  const volver = interna((await searchParams).volver);
  if (await usuarioActual()) redirect(volver ?? "/mi-aprendizaje");

  const vieneDeCurso = volver?.startsWith("/cursos/");

  return (
    <>
      <Barra volver={{ href: volver ?? "/", texto: vieneDeCurso ? "Volver al curso" : "Cursos" }} />
      <main id="contenido" className="marco pagina-entrar">
        <div className="entrar-texto">
          <p className="sobretitulo">Tu cuenta</p>
          <h1 className="t-titulo-1">
            {vieneDeCurso ? "Entra para seguir con tu curso" : "Entra y retoma donde lo dejaste"}
          </h1>
          <p className="t-lectura">
            Tu avance se guarda en tu cuenta, no en este teléfono. Empiezas una lección
            aquí y la sigues en la computadora, justo donde ibas.
          </p>
          <ul className="lista-check entrar-lista">
            <li>Sin contraseñas: te mandamos un código de 6 dígitos.</li>
            <li>Si es tu primera vez, la cuenta se crea sola.</li>
            <li>Tu avance, tus misiones y tus certificados, en un solo lugar.</li>
          </ul>
        </div>
        <Formulario volver={volver} />
      </main>
    </>
  );
}
