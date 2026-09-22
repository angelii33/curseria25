import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLeccion, folio, precio } from "@/lib/catalogo";
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
import { ArticuloLeccion } from "@/components/articulo-leccion";
import { Pieza } from "@/components/pieza";
import { Aviso } from "@/components/aviso";
import { editorialDe, partesDe } from "@/lib/editorial";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; mod: string; lec: string }>;
}): Promise<Metadata> {
  const { slug, mod, lec } = await params;
  const d = await getLeccion(slug, Number(mod), Number(lec));
  if (!d) return { title: "Lección no encontrada" };
  const descripcion = d.leccion.outcome
    ? `Al terminar vas a tener: ${d.leccion.outcome}`
    : d.curso.subtitle ?? undefined;
  return {
    title: `${d.leccion.title} — ${d.curso.title}`,
    description: descripcion,
    alternates: { canonical: `/cursos/${slug}/${mod}/${lec}` },
    // Solo las lecciones abiertas tienen algo que indexar.
    robots: d.leccion.is_preview ? undefined : { index: false, follow: true },
    openGraph: { title: d.leccion.title, description: descripcion, type: "article" },
  };
}

export default async function Leccion({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; mod: string; lec: string }>;
  searchParams: Promise<{ hecha?: string; mision?: string }>;
}) {
  const { slug, mod, lec } = await params;
  const aviso = await searchParams;
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
  const tituloDe = (p: { mod: number; lec: number } | null) =>
    p ? mapa.find((x) => x.mod === p.mod && x.lec === p.lec)?.titulo ?? null : null;
  const hechasCurso = mapa.filter((x) => x.hecha).length;
  const primeraAbierta = mapa.find((x) => x.gratis);

  // ─── La pieza que construye ESTA lección ───
  // Se reconstruye la estructura del curso desde el mapa (sin otra consulta)
  // para saber qué parte de la pieza corresponde a esta lección.
  const ed = editorialDe(slug);
  const porMod = new Map<number, { sort_order: number; lecciones: { id: string; sort_order: number }[] }>();
  for (const p of mapa) {
    if (!porMod.has(p.mod)) porMod.set(p.mod, { sort_order: p.mod, lecciones: [] });
    porMod.get(p.mod)!.lecciones.push({ id: `${p.mod}-${p.lec}`, sort_order: p.lec });
  }
  const partes = partesDe(
    slug,
    [...porMod.values()],
    new Set(mapa.filter((x) => x.hecha).map((x) => `${x.mod}-${x.lec}`))
  );
  const iParte = partes ? partes.findIndex((p) => p.lecciones.includes(`${m}-${l}`)) : -1;
  const estados = partes
    ? partes.map((p, i) => (i === iParte && !hecha ? "actual" : p.hecha || (i === iParte && hecha) ? "hecha" : "pendiente"))
    : [];
  const construye =
    ed && partes && iParte >= 0 ? (
      <section className="construye" aria-labelledby="construye-titulo">
        <div className="construye-dibujo">
          <Pieza
            slug={slug}
            estados={estados as ("hecha" | "actual" | "pendiente")[]}
            etiqueta={`${ed.pieza.nombre}. Esta lección construye la parte ${iParte + 1} de ${partes.length}.`}
          />
        </div>
        <div className="construye-texto">
          <p className="t-folio" id="construye-titulo">
            Esta lección construye · parte {iParte + 1} de {partes.length}
          </p>
          <p className="construye-parte">{partes[iParte].titulo}</p>
          <p className="t-dato construye-de">de {ed.pieza.nombre.charAt(0).toLowerCase() + ed.pieza.nombre.slice(1)}</p>
        </div>
      </section>
    ) : null;

  const tituloSiguiente = tituloDe(siguiente);
  const siguienteAbierta = siguiente
    ? inscrito || Boolean(mapa.find((x) => x.mod === siguiente.mod && x.lec === siguiente.lec)?.gratis)
    : false;

  const sellarMision =
    inscrito && mision ? (
      <>
        <Perforacion sangrada />
        {misionHecha ? (
          <p className="t-dato mision-sellada">
            <Sello estado="logrado" mini /> Misión cumplida. El sello queda guardado en tu cuenta.
          </p>
        ) : (
          <form action={completarMision}>
            <input type="hidden" name="mision_id" value={mision.id} />
            <input type="hidden" name="ruta" value={ruta} />
            <button className="btn btn-secundario" type="submit">
              Ya la hice: sellar la misión
            </button>
          </form>
        )}
      </>
    ) : null;

  return (
    <>
      <Barra volver={{ href: `/cursos/${slug}`, texto: "Temario" }} />
      <main id="contenido" className="pagina-leccion">
        <div className="marco">
          <CabeceraLeccion
            slug={slug}
            cursoTitulo={curso.title}
            moduloTitulo={modulo.title}
            varios={modulosTotales > 1}
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

          {aviso.mision && misionHecha ? (
            <Aviso tono="logrado" titulo="Misión sellada" vivo>
              Quedó guardada en tu cuenta. Cuando termines de leer, marca la lección
              como completada.
            </Aviso>
          ) : null}

          {contenido ? (
            <div className="leccion-trabajo">
              <div className="leccion-lado">
                <IndiceLeccion secciones={indice} />
                {construye}
              </div>

              {/* El flujo va antes del texto: ver de entrada que hay un
                  camino corto y con final es lo que hace que alguien empiece
                  a leer en vez de irse. */}
              <FlujoLeccion
                resultado={leccion.outcome}
                mision={mision?.title ?? null}
                criterios={criterios.length}
                tieneQuiz={Boolean(quiz)}
                primeraSeccion={primera}
              />

              <ArticuloLeccion html={md(contenido)} />

              {/* === APLICA === Cuaderno para trabajar mientras lee. Solo si
                  hay una misión que dé contexto al ejercicio. */}
              {mision ? (
                <div id="aplica" className="ancla-seccion">
                  <CuadernoLeccion
                    leccionId={leccion.id}
                    titulo={mision.title}
                    ayuda={
                      mision.intro ??
                      "Escribe tu versión aquí, con los datos reales de tu negocio: nombre, precios, horario, lo que aplique."
                    }
                  />
                </div>
              ) : null}

              {/* === COMPRUEBA === Aparece con criterios O con misión. */}
              {criterios.length > 0 || mision ? (
                <section id="comprueba" className="comprueba ancla-seccion" aria-labelledby="comprueba-titulo">
                  <p className="t-folio">{criterios.length > 0 ? "Paso 3 · Comprueba" : "Aplica ahora"}</p>
                  <h2 className="t-titulo-2" id="comprueba-titulo">
                    {criterios.length > 0 ? "Cómo saber que quedó bien" : mision?.title ?? "Revisa tu resultado"}
                  </h2>
                  {criterios.length > 0 ? (
                    <ChecklistMision
                      leccionId={leccion.id}
                      criterios={criterios}
                      misionHecha={misionHecha}
                      inscrito={inscrito}
                    >
                      {sellarMision}
                    </ChecklistMision>
                  ) : (
                    <>
                      {mision?.intro ? <p className="t-cuerpo">{mision.intro}</p> : null}
                      {sellarMision}
                    </>
                  )}
                </section>
              ) : null}

              {/* Autochequeo: solo si hay un resultado concreto contra el que
                  comparar, y solo para quien no puede marcar la lección. */}
              {leccion.outcome && !inscrito && criterios.length === 0 ? (
                <Autochequeo resultado={leccion.outcome} primeraSeccion={primera} />
              ) : null}

              {quiz ? (
                <Quiz quizId={quiz.id} preguntas={quiz.preguntas} minimo={quiz.minimo} intento={quiz.intento} />
              ) : null}

              {/* === CIERRE === Completar, celebrar y seguir. */}
              <section id="cierre" className="cierre-leccion ancla-seccion" aria-label="Terminar la lección">
                {inscrito ? (
                  hecha ? (
                    <div className={`hecho ${aviso.hecha ? "hecho-nuevo" : ""}`} role={aviso.hecha ? "status" : undefined}>
                      <Sello estado="logrado" />
                      <div>
                        <p className="hecho-titulo">
                          {aviso.hecha ? "¡Lección completada!" : "Ya completaste esta lección"}
                        </p>
                        <p className="t-dato">
                          {hechasCurso} de {total} lecciones del curso
                          {partes && iParte >= 0 ? ` · parte ${iParte + 1} de tu pieza construida` : ""}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form action={completarLeccion} className="completar">
                      <input type="hidden" name="leccion_id" value={leccion.id} />
                      <input type="hidden" name="ruta" value={ruta} />
                      <div>
                        <p className="t-titulo-4">¿Terminaste?</p>
                        <p className="t-dato">Se guarda en tu cuenta, no en este teléfono.</p>
                      </div>
                      <button className="btn btn-primario btn-grande" type="submit">
                        Marcar como completada
                      </button>
                    </form>
                  )
                ) : null}

                {siguiente && tituloSiguiente ? (
                  siguienteAbierta ? (
                    <Link
                      className={`siguiente ${!inscrito || hecha ? "siguiente-destacada" : ""}`}
                      href={`/cursos/${slug}/${siguiente.mod}/${siguiente.lec}`}
                    >
                      <span className="t-folio">Siguiente · {folio(siguiente.mod, siguiente.lec)}</span>
                      <span className="siguiente-titulo">{tituloSiguiente}</span>
                      <span className="siguiente-accion">
                        Continuar con la siguiente lección <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  ) : null
                ) : inscrito && hechasCurso === total ? (
                  <Link className="siguiente siguiente-destacada" href={`/cursos/${slug}`}>
                    <span className="t-folio">Curso terminado</span>
                    <span className="siguiente-titulo">Tu pieza está completa</span>
                    <span className="siguiente-accion">
                      Ver mi certificado <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                ) : null}

                <nav className="nav-leccion" aria-label="Entre lecciones">
                  {anterior ? (
                    <Link className="btn btn-fantasma" href={`/cursos/${slug}/${anterior.mod}/${anterior.lec}`}>
                      <span aria-hidden="true">←</span> Lección anterior
                    </Link>
                  ) : (
                    <span />
                  )}
                  <Link className="btn btn-fantasma" href={`/cursos/${slug}#temario`}>
                    Ver el temario
                  </Link>
                </nav>
              </section>
            </div>
          ) : inscrito ? (
            /* ─── INSCRITO SIN CONTENIDO: nunca decirle «es del curso completo»
                a quien ya lo tiene. Es un fallo de carga o una lección en
                preparación, y se dice así. ─── */
            <section className="cerrada" aria-labelledby="cerrada-titulo">
              <div className="cerrada-texto">
                <h2 className="t-titulo-2" id="cerrada-titulo">No pudimos cargar esta lección</h2>
                <p className="t-lectura">
                  Tienes acceso, pero el contenido no llegó. Recarga la página en unos
                  segundos; si sigue igual, continúa con otra lección y vuelve más tarde.
                  Tu avance no se pierde.
                </p>
                <div className="acciones">
                  <Link className="btn btn-primario" href={ruta}>Volver a intentar</Link>
                  <Link className="btn btn-secundario" href={`/cursos/${slug}#temario`}>Ir al temario</Link>
                </div>
              </div>
            </section>
          ) : (
            /* ─── LECCIÓN DEL CURSO COMPLETO (sin acceso) ─── */
            <section className="cerrada" aria-labelledby="cerrada-titulo">
              {construye}
              <div className="cerrada-texto">
                <Sello estado="bloqueado" />
                <h2 className="t-titulo-2" id="cerrada-titulo">Esta lección es del curso completo</h2>
                <p className="t-lectura">
                  Ya sabes con qué sales de ella —está escrito arriba—. El contenido, el
                  ejercicio y la lista para comprobar se abren al obtener el curso
                  {precio_cents !== null && precio_cents > 0 ? ` (${precio(precio_cents, moneda)} ${moneda})` : ""}.
                </p>
                <div className="acciones">
                  <Link className="btn btn-primario" href={`/cursos/${slug}#comprar`}>
                    Ver cómo obtener el curso
                  </Link>
                  {primeraAbierta ? (
                    <Link
                      className="btn btn-secundario"
                      href={`/cursos/${slug}/${primeraAbierta.mod}/${primeraAbierta.lec}`}
                    >
                      Hacer la lección gratis
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>
          )}

          {/* El mapa del curso: primero se ve el camino entero, luego se
              ofrece. Al inscrito le muestra su avance real. */}
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
              pieza={ed?.pieza.nombre ?? null}
            />
          ) : null}
        </div>
      </main>
    </>
  );
}
