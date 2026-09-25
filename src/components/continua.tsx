import Link from "next/link";
import { folio } from "@/lib/catalogo";

// Lo primero que ve un alumno con un curso en marcha: exactamente qué sigue.
// Todo sale del avance real en la base (lecciones completadas), no de un
// porcentaje guardado aparte.

export function Continua({
  slug,
  curso,
  pieza,
  modulo,
  siguiente,
  completadas,
  total,
  ultima,
}: {
  slug: string;
  curso: string;
  pieza: string | null;
  modulo: string | null;
  siguiente: { mod: number; lec: number; title: string };
  completadas: number;
  total: number;
  /** Lo último que terminó y cuándo: contexto para quien vuelve. */
  ultima?: { titulo: string; folio: string; cuando: string } | null;
}) {
  const pct = total ? Math.round((completadas / total) * 100) : 0;
  const despues = total ? Math.round(((completadas + 1) / total) * 100) : 0;
  return (
    <section className="continua" aria-labelledby="continua-titulo">
      <p className="t-folio continua-folio">Continúa donde te quedaste</p>
      <p className="continua-curso">{curso}</p>
      {ultima ? (
        <p className="t-dato continua-ultima">
          <span aria-hidden="true">✓</span> Terminaste {ultima.cuando}: {ultima.folio} {ultima.titulo}
        </p>
      ) : null}
      <h2 className="t-titulo-2 continua-titulo" id="continua-titulo">
        <span className="t-folio continua-lec">{folio(siguiente.mod, siguiente.lec)}</span> {siguiente.title}
      </h2>
      {modulo ? <p className="t-dato continua-modulo">{modulo}</p> : null}
      <div
        className="continua-barra"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Avance del curso: ${completadas} de ${total} lecciones`}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="t-dato continua-dato">
        {completadas} de {total} lecciones · {pct}%
      </p>
      <div className="continua-pie">
        <Link className="btn btn-claro btn-grande" href={`/cursos/${slug}/${siguiente.mod}/${siguiente.lec}`}>
          {completadas === 0 ? "Empezar" : "Continuar"}
        </Link>
        <p className="t-dato continua-objetivo">
          <strong>Tu próximo objetivo:</strong> terminar esta lección
          {pieza ? ` y llevar ${pieza.charAt(0).toLowerCase() + pieza.slice(1)} al ${despues}%` : ` (${despues}% del curso)`}.
        </p>
      </div>
    </section>
  );
}
