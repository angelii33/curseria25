import Link from "next/link";
import { precio } from "@/lib/catalogo";

// El cierre de una lección gratuita para quien todavía no tiene el curso.
//
// Todo lo que dice sale de la base de datos o de la capa editorial: cuántas
// lecciones tiene el curso, cuántas están abiertas, cuánto cuesta y cómo se
// llama la pieza completa. No hay cuenta regresiva, ni «últimos lugares», ni
// testimonios, ni resultados garantizados. El argumento es comprobable:
// acabas de construir una parte; estas son las que faltan.
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
  pieza,
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
  /** Nombre de la pieza completa, si el curso tiene editorial. */
  pieza: string | null;
}) {
  const restantes = total - abiertas;
  if (restantes <= 0) return null;

  return (
    <section className="continuar" aria-labelledby="continuar-titulo">
      <p className="t-folio continuar-folio">Hasta aquí llega la parte abierta</p>
      <h2 className="t-titulo-2" id="continuar-titulo">
        {pieza
          ? `Faltan ${restantes} ${restantes === 1 ? "lección" : "lecciones"} para completar ${pieza.charAt(0).toLowerCase() + pieza.slice(1)}`
          : `Acabas de terminar «${leccionTitulo}»`}
      </h2>

      <p className="t-lectura continuar-texto">
        {abiertas === 1
          ? `«${leccionTitulo}» era la lección abierta de ${cursoTitulo}.`
          : `Esas eran las ${abiertas} lecciones abiertas de ${cursoTitulo}.`}{" "}
        Quedan <strong>{restantes}</strong>
        {modulos > 1 ? `, repartidas en ${modulos} módulos` : ""}, y cada una
        termina igual que esta: con una parte hecha y aplicada a tu caso.
      </p>

      <div className="continuar-pie">
        {precioCents !== null ? (
          <p className="continuar-precio">
            {precio(precioCents, moneda)} <small>{moneda}</small>
          </p>
        ) : null}
        <Link className="btn btn-claro btn-grande" href={`/cursos/${slug}#comprar`}>
          Ver el curso completo
        </Link>
      </div>

      <p className="t-dato continuar-nota">
        Acceso sin caducidad · {total} lecciones en total · tu avance se guarda en tu cuenta
      </p>
    </section>
  );
}
