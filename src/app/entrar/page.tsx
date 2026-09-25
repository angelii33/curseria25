import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { usuarioActual } from "@/lib/supabase/server";
import { Barra } from "@/components/ui";
import { rutaInterna } from "@/lib/rutas";
import { googleActivo } from "@/lib/supabase/proveedores";
import { LEGAL } from "@/lib/legal";
import { Formulario } from "./formulario";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Crea tu cuenta en 20 segundos o entra para seguir con tus cursos.",
  robots: { index: false, follow: true },
};

export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string; error?: string; crear?: string }>;
}) {
  const params = await searchParams;
  // Solo rutas internas: nunca se redirige a otro sitio.
  const volver = rutaInterna(params.volver, "") || undefined;
  if (await usuarioActual()) redirect(volver ?? "/mi-aprendizaje");

  const vieneDeCurso = volver?.startsWith("/cursos/");
  const vieneAComprar = volver?.startsWith("/comprar");
  // «Volver» nunca apunta a /comprar (eso abriría el pago): a la página de
  // donde salió la compra.
  const atras = vieneAComprar
    ? rutaInterna(new URLSearchParams(volver!.split("?")[1] ?? "").get("volver"), "/precios")
    : volver ?? "/";

  return (
    <>
      <Barra volver={{ href: atras, texto: vieneDeCurso || atras.startsWith("/cursos/") ? "Volver al curso" : vieneAComprar ? "Volver" : "Cursos" }} />
      <main id="contenido" className="marco pagina-entrar">
        <div className="entrar-texto">
          <p className="sobretitulo">Tu cuenta</p>
          <h1 className="t-titulo-1">
            {vieneAComprar
              ? "Un paso y pasas al pago"
              : vieneDeCurso
                ? "Entra para seguir con tu curso"
                : "Entra y retoma donde lo dejaste"}
          </h1>
          <p className="t-lectura">
            Tu avance se guarda en tu cuenta, no en este teléfono. Empiezas una lección
            aquí y la sigues en la computadora, justo donde ibas.
          </p>
          <ul className="lista-check entrar-lista">
            <li>Crear tu cuenta toma 20 segundos: nombre, correo y contraseña.</li>
            <li>Pagas con Mercado Pago, con los métodos que te ofrezca al pagar.</li>
            <li>Tu avance, tus misiones y tus certificados, en un solo lugar.</li>
          </ul>
        </div>
        <Formulario
          volver={volver}
          google={await googleActivo()}
          crearCuentaPrimero={params.crear === "1"}
          contacto={LEGAL.whatsapp || LEGAL.correo ? { whatsapp: LEGAL.whatsapp, correo: LEGAL.correo } : null}
          fallo={params.error === "enlace" || params.error === "google" ? params.error : undefined}
        />
      </main>
    </>
  );
}
