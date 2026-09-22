import { Insignia, Sello } from "@/components/ui";
import { folio } from "@/lib/catalogo";

// Cabecera de la lección: dónde estás y con qué vas a salir.
//
// El orden importa. Primero la ubicación (curso, módulo, cuál de cuántas),
// porque sin eso el alumno no sabe si va bien; después el título; y al final,
// en grande, el resultado concreto. Ese último bloque es lo único que decide
// si alguien empieza a leer o cierra la pestaña.
//
// Server Component puro: no hay estado ni interacción, así que no hay
// motivo para mandar JavaScript al teléfono por esto.

export function CabeceraLeccion({
  cursoTitulo,
  moduloTitulo,
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
  cursoTitulo: string;
  moduloTitulo: string;
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
  return (
    <header className="leccion-cab">
      <p className="t-dato leccion-ruta">
        {cursoTitulo} <span aria-hidden="true">·</span> {moduloTitulo}
      </p>

      <div className="leccion-metas">
        <span className="t-folio">{folio(moduloOrden, leccionOrden)}</span>
        <span className="t-dato">
          Lección {posicion} de {total}
        </span>
        {minutos ? <span className="t-dato">{minutos} min</span> : null}
        {/* La insignia de gratis solo tiene sentido para quien no está
            dentro: al inscrito no le dice nada que ya no sepa. */}
        {esGratis && !inscrito ? (
          <Insignia tono="estado">Lección gratuita</Insignia>
        ) : null}
        {hecha ? <Insignia tono="logrado">Completada</Insignia> : null}
      </div>

      <h1 className="t-titulo-1 leccion-titulo">{leccionTitulo}</h1>

      {resultado ? (
        <section className="leccion-resultado" aria-labelledby="res-titulo">
          <Sello estado={hecha ? "logrado" : "pendiente"} />
          <div>
            <p className="t-folio" id="res-titulo">
              Al terminar vas a tener
            </p>
            <p className="t-lectura-guia leccion-resultado-texto">{resultado}</p>
          </div>
        </section>
      ) : null}
    </header>
  );
}
