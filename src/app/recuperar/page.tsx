import type { Metadata } from "next";
import { Barra } from "@/components/ui";
import { rutaInterna } from "@/lib/rutas";
import { NuevaClave } from "./nueva-clave";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  robots: { index: false, follow: false },
  // Por si alguien abre un enlace viejo con el token en la URL.
  referrer: "no-referrer",
};

export default async function Recuperar({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  const p = await searchParams;
  const volver = rutaInterna(p.volver, "") || undefined;

  return (
    <>
      <Barra volver={{ href: "/entrar", texto: "Entrar" }} />
      <main id="contenido" className="marco pagina-entrar">
        <div className="entrar-texto">
          <p className="sobretitulo">Tu cuenta</p>
          <h1 className="t-titulo-1">Elige tu contraseña nueva</h1>
          <p className="t-lectura">
            Al guardarla entras de inmediato, y se cierra la sesión en los demás dispositivos donde
            estuviera abierta tu cuenta.
          </p>
        </div>
        <NuevaClave volver={volver} />
      </main>
    </>
  );
}
