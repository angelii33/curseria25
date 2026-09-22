import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeccion } from "@/lib/catalogo";
import { md, secciones } from "@/lib/md";
import { completarLeccion, completarMision } from "@/app/acciones";
import { Quiz } from "@/components/quiz";
import { Barra, Perforacion, Sello } from "@/components/ui";
import { CabeceraLeccion } from "@/components/cabecera-leccion";
import { FlujoLeccion } from "@/components/flujo-leccion";
import { ContinuarCurso } from "@/components/continuar-curso";
import { IndiceLeccion } from "@/components/indice-leccion";
import { ChecklistMision } from "@/components/checklist-mision";
import { CuadernoLeccion } from "@/components/cuaderno-leccion";
import { MapaCurso } from "@/components/mapa-curso";
import { Autochequeo } from "@/components/autochequeo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; mod: string; lec: string }>;
}) {
  const { slug, mod, lec } = await params;
  const d = await getLeccion(slug, Number(mod), Number(lec));
  if (!d) return { title: "Lección no encontrada" };
  return {
    title: `${d.leccion.title} — ${d.curso.title}`,
    description: d.leccion.outcome ?? d.curso.subtitle ?? undefined,
    openGraph: {
      title: d.leccion.title,
      description: d.leccion.outcome ?? undefined,
      type: "article" as const,
    },
  };
}

export default async function Leccion({
  params,
}: {
  params: Promise<{ slug: string; mod: string; lec: string }>;
}) {
  const { slug, mod, lec } = await params;
  const m = Number(mod), l = Number(lec);
  if (!Number.isInteger(m) || !Number.isInteger(l)) notFound();

  const d = await getLeccion(slug, m, l);
  if (!d) notFound();

  const {
    curso, modulo, leccion, contenido, mision, misionHecha, criterios, quiz,
    anterior, siguiente, posicion, total, inscrito, hecha,
    precio_cents, moneda, modulosTotales, leccionesAbiertas, mapa,
  } = d;
  const ruta = `/cursos/${slug}/${m}/${l}`;
  // El índice y los ids de los <h2> salen de la MISMA función: nunca se
  // desincronizan aunque cambie el texto en la base.
  const indice = contenido ? secciones(contenido) : [];
  const primera = indice[0]?.id ?? null;

  return (
    <>
      <Barra volver={{ href: `/cursos/${slug}`, texto: "Temario" }} />
      <main className="marco" style={{ paddingBlock: "var(--e-7)" }}>
        <CabeceraLeccion
          cursoTitulo={curso.title}
          moduloTitulo={modulo.title}
          moduloOrden={modulo.sort_order}
          leccionOrden={leccion.sort_order}
          leccionTitulo={leccion.title}
          posicion={posicion}
          total={total}
          minutos={leccion.duration_minutes}
          esGratis={leccion.is_preview}
          inscrito={inscrito}
          hecha={hecha}
          resultado={leccion.outcome}
        />

        {/* El flujo solo aparece si hay contenido que trabajar. En una
            lección bloqueada sería burla: explicar tres pasos que no se
            pueden dar. */}
        {contenido ? (
          <FlujoLeccion
            resultado={leccion.outcome}
            mision={mision?.title ?? null}
            criterios={criterios.length}
            tieneQuiz={Boolean(quiz)}
            primeraSeccion={primera}
          />
        ) : null}

        {contenido ? (
          <>
            <IndiceLeccion secciones={indice} />
            <article className="md" dangerouslySetInnerHTML={{ __html: md(contenido) }} />
          </>
        ) : (
          <div className="candado">
            <div style={{ display: "flex", gap: "var(--e-4)", alignItems: "center", marginBottom: "var(--e-4)" }}>
              <Sello estado="bloqueado" />
              <h2 className="t-titulo-3">Esta lección es del curso completo</h2>
            </div>
            <p className="t-cuerpo" style={{ marginBottom: "var(--e-5)" }}>
              Sabes lo que vas a sacar de ella —está escrito arriba—, pero el
              contenido solo se abre con acceso al curso.
            </p>
            <Link className="btn btn-primario" href={`/cursos/${slug}`}>
              Ver el curso completo
            </Link>
          </div>
        )}

        {/* === APLICA === Cuaderno para trabajar mientras lee. Solo si hay
            una misión que dé contexto al ejercicio: un cuaderno sin tarea
            concreta sería una caja de texto vacía sin propósito. */}
        {mision && contenido ? (
          <div id="aplica" className="ancla-seccion">
            <CuadernoLeccion
              leccionId={leccion.id}
              titulo={mision.title}
              ayuda={
                mision.intro ??
                "Escribe tu versión aquí, con los datos reales de tu negocio."
              }
            />
          </div>
        ) : null}

        {/* === COMPRUEBA === Aparece con criterios O con misión. Antes exigía
            criterios, y una lección con misión pero sin lista —la gratuita
            de Ventas con IA— dejaba la misión imposible de sellar. */}
        {(criterios.length > 0 || mision) && contenido && (
          <section
            id="comprueba"
            className="superficie ancla-seccion"
            style={{ marginTop: "var(--e-8)", maxWidth: "66ch" }}
          >
            <div className="t-folio">
              {criterios.length > 0 ? "Paso 3 · Comprueba" : "Aplica ahora"}
            </div>
            <h2 className="t-titulo-3" style={{ marginTop: "var(--e-2)" }}>
              {criterios.length > 0 ? "Cómo saber que quedó bien" : (mision?.title ?? "Revisa tu resultado")}
            </h2>
            <Perforacion sangrada />

            {criterios.length > 0 ? (
              <ChecklistMision
                criterios={criterios}
                misionHecha={misionHecha}
                inscrito={inscrito}
              >
                {inscrito && mision ? (
                  <>
                    <Perforacion sangrada />
                    {misionHecha ? (
                      <p className="t-dato" style={{ color: "var(--tinta-media)" }}>
                        Misión cumplida. El sello queda guardado en tu cuenta.
                      </p>
                    ) : (
                      <form action={completarMision}>
                        <input type="hidden" name="mision_id" value={mision.id} />
                        <input type="hidden" name="ruta" value={ruta} />
                        <button className="btn btn-secundario" type="submit">
                          Ya la hice, sellar la misión
                        </button>
                      </form>
                    )}
                  </>
                ) : null}
              </ChecklistMision>
            ) : (
              <>
                {mision?.intro ? (
                  <p className="t-cuerpo" style={{ color: "var(--tinta-media)" }}>
                    {mision.intro}
                  </p>
                ) : null}
                {inscrito && mision ? (
                  <>
                    <Perforacion sangrada />
                    {misionHecha ? (
                      <p className="t-dato" style={{ color: "var(--tinta-media)" }}>
                        Misión cumplida. El sello queda guardado en tu cuenta.
                      </p>
                    ) : (
                      <form action={completarMision}>
                        <input type="hidden" name="mision_id" value={mision.id} />
                        <input type="hidden" name="ruta" value={ruta} />
                        <button className="btn btn-secundario" type="submit">
                          Ya la hice, sellar la misión
                        </button>
                      </form>
                    )}
                  </>
                ) : null}
              </>
            )}
          </section>
        )}

        {/* Autochequeo: solo si hay un resultado concreto contra el que
            comparar. Sin outcome, la pregunta "¿ya lo tienes?" no tiene
            referencia y sobra. */}
        {contenido && leccion.outcome ? (
          <Autochequeo resultado={leccion.outcome} primeraSeccion={primera} />
        ) : null}

        {quiz && contenido && (
          <Quiz
            quizId={quiz.id}
            preguntas={quiz.preguntas}
            minimo={quiz.minimo}
            intento={quiz.intento}
          />
        )}

        {inscrito && contenido && (
          <form action={completarLeccion} className="pie-leccion">
            <input type="hidden" name="leccion_id" value={leccion.id} />
            <input type="hidden" name="ruta" value={ruta} />
            <button className={`btn ${hecha ? "btn-secundario" : "btn-primario"}`} type="submit">
              {hecha ? "Ya la completaste" : "Marcar como completada"}
            </button>
            {hecha && (
              <span className="t-dato" style={{ color: "var(--tinta-media)" }}>
                Guardado en tu cuenta, no en este teléfono.
              </span>
            )}
          </form>
        )}

        <nav className="pie-leccion">
          {anterior && (
            <Link className="btn btn-secundario" href={`/cursos/${slug}/${anterior.mod}/${anterior.lec}`}>
              Anterior
            </Link>
          )}
          {siguiente && (
            <Link className="btn btn-primario" href={`/cursos/${slug}/${siguiente.mod}/${siguiente.lec}`}>
              Siguiente lección
            </Link>
          )}
          <Link className="btn btn-fantasma" href={`/cursos/${slug}`}>Ver el temario</Link>
        </nav>

        {/* El cierre del curso solo para quien NO está inscrito y sí pudo
            leer la lección: a un visitante frente a una lección bloqueada ya
            le habla el candado de arriba, y al inscrito no hay nada que
            venderle. Las cifras salen todas de la base. */}
        {/* El mapa del curso va antes del cierre: primero se ve el camino
            entero, luego se ofrece. Para el inscrito también sirve — le
            muestra su avance real. */}
        <MapaCurso slug={slug} puntos={mapa} inscrito={inscrito} />

        {!inscrito && contenido ? (
          <ContinuarCurso
            slug={slug}
            cursoTitulo={curso.title}
            leccionTitulo={leccion.title}
            total={total}
            abiertas={leccionesAbiertas}
            modulos={modulosTotales}
            precioCents={precio_cents}
            moneda={moneda}
          />
        ) : null}

      </main>
    </>
  );
}
