import Link from "next/link";
import { precio } from "@/lib/catalogo";

// El cierre de una lección gratuita para quien todavía no está inscrito.
//
// Todo lo que dice sale de la base de datos: cuántas lecciones tiene el
// curso, cuántas están abiertas, cuántos módulos, cuánto cuesta. No hay
// cuenta regresiva, ni "últimos lugares", ni testimonios, ni resultados
// garantizados. El argumento es aritmético y comprobable: acabas de ver
// una de N, quedan N-1, cuestan esto.
//
// Si falta el precio en la base, no se inventa: se enlaza al curso y ya.

export function ContinuarCurso({
  slug,
  cursoTitulo,
  leccionTitulo,
  total,
  abiertas,
  modulos,
  precioCents,
  moneda,
}: {
  slug: string;
  cursoTitulo: string;
  /** Lo que el alumno acaba de terminar, para nombrarlo tal cual. */
  leccionTitulo: string;
  total: number;
  abiertas: number;
  modulos: number;
  precioCents: number | null;
  moneda: string;
}) {
  const restantes = total - abiertas;
  if (restantes <= 0) return null;

  return (
    <section className="continuar superficie" aria-labelledby="continuar-titulo">
      <p className="t-folio">Hasta aquí llega la parte abierta</p>
      <h2 className="t-titulo-3" id="continuar-titulo">
        Acabas de terminar &ldquo;{leccionTitulo}&rdquo;
      </h2>

      <div className="perforacion perforacion-sangrada" />

      <p className="t-cuerpo continuar-texto">
        {abiertas === 1
          ? "Esa era la lección abierta de este curso."
          : `Esas eran las ${abiertas} lecciones abiertas de este curso.`}{" "}
        Quedan <strong>{restantes}</strong> más
        {modulos > 1 ? `, repartidas en ${modulos} módulos` : ""}, y cada una
        termina igual que esta: con una pieza hecha y aplicada a tu negocio.
      </p>

      <div className="continuar-pie">
        {precioCents !== null ? (
          <span className="continuar-precio">
            {precio(precioCents, moneda)} <small>MXN</small>
          </span>
        ) : null}
        <Link className="btn btn-primario" href={`/cursos/${slug}`}>
          Ver el curso completo
        </Link>
      </div>

      <p className="t-dato continuar-nota">
        Acceso sin caducidad. {cursoTitulo} son {total} lecciones en total.
      </p>
    </section>
  );
}
