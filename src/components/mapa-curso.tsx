import Link from "next/link";

// El mapa del curso: una marca por lección, en orden.
//
// Es la pieza que más empuja hacia el curso completo, y no dice una sola
// palabra de venta. Solo muestra lo que es cierto: dónde estás, cuáles
// están abiertas, cuáles quedan. Ver el camino entero con la mayor parte
// cerrada comunica más que cualquier frase — y no se puede acusar de
// exagerar, porque son los datos del curso tal cual.
//
// Server Component: es SVG y enlaces, no necesita JavaScript.

type Punto = {
  mod: number;
  lec: number;
  titulo: string;
  gratis: boolean;
  hecha: boolean;
  actual: boolean;
};

export function MapaCurso({
  slug,
  puntos,
  inscrito,
}: {
  slug: string;
  puntos: Punto[];
  inscrito: boolean;
}) {
  if (puntos.length < 2) return null;

  const abiertas = puntos.filter((p) => inscrito || p.gratis).length;

  return (
    <section className="mapa" aria-labelledby="mapa-titulo">
      <div className="mapa-cab">
        <p className="t-folio" id="mapa-titulo">
          El curso completo
        </p>
        <p className="t-dato mapa-cuenta">
          {inscrito
            ? `${puntos.filter((p) => p.hecha).length} de ${puntos.length} completadas`
            : `${abiertas} de ${puntos.length} abiertas`}
        </p>
      </div>

      <ol className="mapa-fila">
        {puntos.map((p, i) => {
          const abierta = inscrito || p.gratis;
          const estado = p.actual
            ? "actual"
            : p.hecha
              ? "hecha"
              : abierta
                ? "abierta"
                : "cerrada";
          const etiqueta = `Lección ${i + 1}: ${p.titulo}${
            p.actual ? " (estás aquí)" : !abierta ? " (bloqueada)" : ""
          }`;

          const marca = (
            <span className={`mapa-punto mapa-${estado}`} aria-hidden="true">
              {estado === "hecha" ? "\u2713" : estado === "cerrada" ? "" : i + 1}
            </span>
          );

          return (
            <li key={`${p.mod}-${p.lec}`} className="mapa-item">
              {abierta && !p.actual ? (
                <Link
                  href={`/cursos/${slug}/${p.mod}/${p.lec}`}
                  aria-label={etiqueta}
                  className="mapa-enlace"
                >
                  {marca}
                </Link>
              ) : (
                <span aria-label={etiqueta} role="img" className="mapa-enlace">
                  {marca}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <ul className="mapa-leyenda t-dato" aria-hidden="true">
        <li><span className="mapa-punto mapa-actual mapa-mini" /> Estás aquí</li>
        <li><span className="mapa-punto mapa-abierta mapa-mini" /> Abierta</li>
        {!inscrito ? (
          <li><span className="mapa-punto mapa-cerrada mapa-mini" /> Del curso completo</li>
        ) : (
          <li><span className="mapa-punto mapa-hecha mapa-mini" /> Completada</li>
        )}
      </ul>
    </section>
  );
}
