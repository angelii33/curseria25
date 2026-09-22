import Link from "next/link";
import Image from "next/image";
import { horas, precio } from "@/lib/catalogo";
import { editorialDe, NIVEL } from "@/lib/editorial";
import { ESCENA_POR_SLUG } from "@/lib/escenas";
import { Pieza, tienePieza } from "@/components/pieza";
import { Portada, varianteDe } from "@/components/portada";

// La ficha de un curso en el catálogo. Una sola, con variantes: antes había
// dos copias casi idénticas en la Home y en Mi aprendizaje.
//
// Lo que tiene que responder de un vistazo, en este orden:
//   ¿Qué problema arregla?  → la frase del dueño, entre comillas
//   ¿Qué es?                → el título
//   ¿Con qué salgo?         → la pieza, dibujada y nombrada
//   ¿Cuánto me cuesta?      → lecciones, horas, precio
//   ¿Qué hago ahora?        → un verbo concreto
//
// Toda la ficha es un solo enlace: un blanco táctil grande, sin botones
// anidados que confundan al lector de pantalla.

export type FichaCurso = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  level: string | null;
  duration_minutes: number | null;
  cover_url: string | null;
  lecciones: number;
  gratis: number;
  precio_cents: number | null;
  moneda: string;
  inscrito: boolean;
  completadas: number;
  pct: number;
};

export function MediaCurso({
  slug,
  cover,
  lecciones,
  titulo,
  contexto = "tarjeta",
  prioridad = false,
}: {
  slug: string;
  cover: string | null;
  lecciones: number;
  titulo: string;
  contexto?: "tarjeta" | "cabecera";
  prioridad?: boolean;
}) {
  const ed = editorialDe(slug);
  const escena = ESCENA_POR_SLUG[slug] ?? "generica";
  const pieza = tienePieza(slug) ? (
    <Pieza slug={slug} etiqueta={ed ? `${ed.pieza.nombre}, terminada` : titulo} />
  ) : null;

  // Con fotografía: la foto pone el contexto real y la pieza terminada va
  // encima, como una hoja impresa apoyada sobre la mesa.
  if (cover) {
    return (
      <div className={`media media-${contexto} media-foto`}>
        <Image
          src={cover}
          alt=""
          fill
          sizes={
            contexto === "cabecera"
              ? "(min-width: 1024px) 560px, 100vw"
              : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          }
          priority={prioridad}
          className="media-img"
        />
        {pieza ? <div className="media-hoja">{pieza}</div> : null}
      </div>
    );
  }

  // Sin fotografía: la pieza es la protagonista, sobre su propia mesa.
  if (pieza) {
    return <div className={`media media-${contexto} mesa mesa-${escena}`}>{pieza}</div>;
  }

  return (
    <div className={`media media-${contexto}`}>
      <Portada id={`p-${slug}-${contexto}`} piezas={lecciones} variante={varianteDe(slug)} slug={slug} />
    </div>
  );
}

export function CursoFicha({
  curso,
  variante = "catalogo",
  siguiente,
}: {
  curso: FichaCurso;
  variante?: "catalogo" | "compacta";
  /** Para inscritos: la lección con la que sigue. */
  siguiente?: { titulo: string; num: number } | null;
}) {
  const ed = editorialDe(curso.slug);
  const terminado = curso.inscrito && curso.lecciones > 0 && curso.completadas >= curso.lecciones;

  const accion = curso.inscrito
    ? terminado
      ? "Repasar el curso"
      : curso.completadas > 0
        ? "Continuar"
        : "Empezar la lección 1"
    : curso.gratis > 0
      ? "Empezar gratis"
      : "Ver el curso";

  return (
    <Link
      href={`/cursos/${curso.slug}`}
      className={`ficha ficha-${variante} ${curso.inscrito ? "ficha-inscrita" : ""}`}
    >
      <div className="ficha-media">
        <MediaCurso slug={curso.slug} cover={curso.cover_url} lecciones={curso.lecciones} titulo={curso.title} />
        <span className="ficha-etiqueta">
          {terminado
            ? "Terminado"
            : curso.inscrito
              ? `En curso · ${curso.pct}%`
              : curso.gratis > 0
                ? curso.gratis === 1
                  ? "Lección 1 gratis"
                  : `${curso.gratis} lecciones gratis`
                : "Curso completo"}
        </span>
      </div>

      <div className="ficha-cuerpo">
        {ed ? <p className="ficha-problema">«{ed.problema}»</p> : null}
        <h3 className="ficha-titulo">{curso.title}</h3>

        {variante === "catalogo" ? (
          ed ? (
            <p className="ficha-sales">
              <span className="ficha-sales-et">Sales con</span>
              {ed.pieza.nombre}
            </p>
          ) : curso.subtitle ? (
            <p className="ficha-sub">{curso.subtitle}</p>
          ) : null
        ) : null}

        {curso.inscrito ? (
          <div className="ficha-avance">
            <div
              className="pista"
              role="progressbar"
              aria-valuenow={curso.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Avance en ${curso.title}`}
            >
              <span style={{ width: `${curso.pct}%` }} />
            </div>
            <p className="t-dato">
              {curso.completadas} de {curso.lecciones} lecciones
              {siguiente && !terminado ? ` · sigue: ${siguiente.titulo}` : ""}
            </p>
          </div>
        ) : (
          <ul className="ficha-datos" aria-label="Datos del curso">
            <li>{curso.lecciones} lecciones</li>
            {curso.duration_minutes ? <li>{horas(curso.duration_minutes)}</li> : null}
            {curso.level ? <li>{NIVEL[curso.level] ?? curso.level}</li> : null}
          </ul>
        )}

        <div className="ficha-pie">
          {!curso.inscrito && curso.precio_cents !== null ? (
            <span className="ficha-precio">
              {precio(curso.precio_cents, curso.moneda)}
              <small> {curso.moneda}</small>
            </span>
          ) : (
            <span />
          )}
          <span className="ficha-accion">
            {accion} <span aria-hidden="true" className="flecha">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
