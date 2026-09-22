import Link from "next/link";
import { Insignia, Sello } from "@/components/ui-puro";
import { folio } from "@/lib/catalogo";

// Cabecera de la lección: dónde estás y con qué vas a salir.
//
// El orden importa. Primero la ubicación (curso, módulo, cuál de cuántas),
// porque sin eso el alumno no sabe si va bien; después el título; y al final,
// en grande, el resultado concreto. Ese último bloque es lo único que decide
// si alguien empieza a leer o cierra la pestaña.
//
// Server Component puro: no hay estado ni interacción.

export function CabeceraLeccion({
  slug,
  cursoTitulo,
  moduloTitulo,
  varios,
  moduloOrden,
  leccionOrden,
  leccionTitulo,
  posicion,
  total,
  minutos,
  esGratis,
  inscrito,
  hecha,
  resultado,
}: {
  slug: string;
  cursoTitulo: string;
  moduloTitulo: string;
  /** Si el curso tiene más de un módulo, vale la pena nombrarlo. */
  varios: boolean;
  moduloOrden: number;
  leccionOrden: number;
  leccionTitulo: string;
  posicion: number;
  total: number;
  minutos: number | null;
  esGratis: boolean;
  inscrito: boolean;
  hecha: boolean;
  /** El `outcome` de la lección, tal cual está en la base. Si falta, no se
   *  inventa nada: se omite el bloque entero. */
  resultado: string | null;
}) {
  const pct = Math.round((posicion / total) * 100);
  return (
    <header className="leccion-cab">
      <nav aria-label="Ruta" className="migas">
        <Link href="/#cursos">Cursos</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/cursos/${slug}`}>{cursoTitulo}</Link>
        {varios ? (
          <>
            <span aria-hidden="true">/</span>
            <span>{moduloTitulo.replace(/^Módulo \d+\s*·\s*/, "")}</span>
          </>
        ) : null}
      </nav>

      <div className="leccion-posicion">
        <span className="t-folio">{folio(moduloOrden, leccionOrden)}</span>
        <span className="leccion-posicion-texto">
          Lección {posicion} de {total}
        </span>
        <span className="pista leccion-posicion-pista" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </span>
      </div>

      <h1 className="t-titulo-1 leccion-titulo">{leccionTitulo}</h1>

      <div className="leccion-metas">
        {minutos ? <span className="t-dato">Unos {minutos} minutos</span> : null}
        {/* La insignia de gratis solo tiene sentido para quien no está
            dentro: al inscrito no le dice nada que ya no sepa. */}
        {esGratis && !inscrito ? <Insignia tono="estado">Lección gratuita completa</Insignia> : null}
        {hecha ? <Insignia tono="logrado">✓ Completada</Insignia> : null}
      </div>

      {resultado ? (
        <section className="leccion-resultado" aria-labelledby="res-titulo">
          <Sello estado={hecha ? "logrado" : "pendiente"} />
          <div>
            <p className="t-folio" id="res-titulo">
              Al terminar vas a tener
            </p>
            <p className="leccion-resultado-texto">{resultado}</p>
          </div>
        </section>
      ) : null}
    </header>
  );
}
