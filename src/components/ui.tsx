import Link from "next/link";
import { headers } from "next/headers";
import { usuarioActual } from "@/lib/supabase/server";
import { salir } from "@/app/acciones";
import { BotonSalir } from "@/components/boton-salir";
import { rutaInterna } from "@/lib/rutas";
import { MARCA } from "@/lib/marca";
import { LEGAL } from "@/lib/legal";

export { Perforacion, Sello, Insignia } from "@/components/ui-puro";
export { Marca } from "@/components/logo";
import { Marca } from "@/components/logo";

export async function Barra({ volver }: { volver?: { href: string; texto: string } }) {
  const usuario = await usuarioActual();
  // Entrar desde cualquier página devuelve a esa misma página.
  const aqui = rutaInterna((await headers()).get("x-ruta"), "/");
  const entrar = aqui === "/" || aqui.startsWith("/entrar") ? "/entrar" : `/entrar?volver=${encodeURIComponent(aqui)}`;
  return (
    <>
      <a href="#contenido" className="saltar">Saltar al contenido</a>
      <header className="barra">
        <div className="barra-in">
          <Link href="/" className="marca-enlace" aria-label={`${MARCA.nombre}, inicio`}>
            <Marca />
          </Link>
          <nav className="barra-nav" aria-label="Principal">
            {volver ? (
              <Link href={volver.href} className="barra-volver">
                <span aria-hidden="true">←</span> {volver.texto}
              </Link>
            ) : (
              <Link href="/#cursos" className="barra-enlace barra-solo-ancho">Cursos</Link>
            )}
            <Link href="/precios" className="barra-enlace barra-solo-ancho">Precios</Link>
            {usuario ? (
              <>
                <Link href="/mi-aprendizaje" className="barra-enlace">Mi aprendizaje</Link>
                <form action={salir} className="barra-solo-ancho">
                  <BotonSalir className="barra-enlace" />
                </form>
              </>
            ) : (
              <Link href={entrar} className="barra-entrar">Entrar</Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}

export function Pie() {
  return (
    <footer className="pie">
      <div className="marco pie-in">
        <div className="pie-marca">
          <Marca inversa />
          <p className="pie-eslogan">{MARCA.eslogan}</p>
          <p className="pie-promesa">{MARCA.promesa}</p>
          <p className="t-dato pie-nota">
            Cursos prácticos para dueños de negocio en México. Cada uno termina con
            algo hecho y funcionando en tu negocio.
          </p>
        </div>
        <nav className="pie-enlaces" aria-label="Pie de página">
          <p className="t-folio pie-folio">Plataforma</p>
          <Link href="/#cursos">Todos los cursos</Link>
          <Link href="/#problemas">Buscar por problema</Link>
          <Link href="/#gratis">Empezar gratis</Link>
          <Link href="/precios">Precios y paquetes</Link>
          <Link href="/mi-aprendizaje">Mi aprendizaje</Link>
        </nav>
        <nav className="pie-enlaces" aria-label="Legal">
          <p className="t-folio pie-folio">Lo legal</p>
          <Link href="/terminos">Términos y condiciones</Link>
          <Link href="/aviso-de-privacidad">Aviso de privacidad</Link>
          <Link href="/reembolsos">Reembolsos (7 días)</Link>
          {LEGAL.correo ? <a href={`mailto:${LEGAL.correo}`}>{LEGAL.correo}</a> : null}
        </nav>
      </div>
    </footer>
  );
}
