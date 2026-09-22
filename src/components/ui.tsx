import Link from "next/link";
import { usuarioActual } from "@/lib/supabase/server";
import { salir } from "@/app/acciones";
import { MARCA } from "@/lib/marca";

export { Perforacion, Sello, Insignia } from "@/components/ui-puro";

/** La marca: el nombre con su sello. Es el mismo sello de «lección
 *  completada» — la marca es literalmente la marca de lo que quedó hecho. */
export function Marca({ inversa = false }: { inversa?: boolean }) {
  return (
    <span className={`marca ${inversa ? "marca-inversa" : ""}`}>
      <span className="marca-sello" aria-hidden="true">✓</span>
      {MARCA.nombre}
    </span>
  );
}

export async function Barra({ volver }: { volver?: { href: string; texto: string } }) {
  const usuario = await usuarioActual();
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
            {usuario ? (
              <>
                <Link href="/mi-aprendizaje" className="barra-enlace">Mi aprendizaje</Link>
                <form action={salir} className="barra-solo-ancho">
                  <button className="barra-enlace" type="submit">Salir</button>
                </form>
              </>
            ) : (
              <Link href="/entrar" className="barra-entrar">Entrar</Link>
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
          <Link href="/mi-aprendizaje">Mi aprendizaje</Link>
        </nav>
      </div>
    </footer>
  );
}
