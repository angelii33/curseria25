import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurso, precio, horas, folio } from "@/lib/catalogo";
import { usuarioActual } from "@/lib/supabase/server";
import { inscribirse, emitirCertificado } from "@/app/acciones";
import { Barra, Perforacion, Insignia, Sello, Pie } from "@/components/ui";
import { Portada, varianteDe } from "@/components/portada";
import { MARCA } from "@/lib/marca";
import { PROBLEMA_POR_SLUG } from "@/lib/escenas";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await getCurso(slug);
  if (!d) return { title: "Curso no encontrado" };
  return {
    title: `${d.curso.title} — ${MARCA.nombre}`,
    description: d.curso.subtitle ?? undefined,
    openGraph: {
      title: d.curso.title,
      description: d.curso.subtitle ?? undefined,
      type: "website" as const,
    },
  };
}

export default async function Curso({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await getCurso(slug);
  if (!d) notFound();

  const usuario = await usuarioActual();
  const { curso, modulos, precio_cents, moneda, inscrito, hechas, total, completadas, pct, siguiente } = d;

  const minSemana = modulos.reduce((a, m) => a + (m.minutes_saved_weekly ?? 0), 0);
  const entregables = modulos.flatMap((m) =>
    m.lecciones.filter((l) => l.outcome).map((l) => l.outcome as string)
  );
  const todasLecciones = modulos.flatMap((m) => m.lecciones);
  const gratis = todasLecciones.filter((l) => l.is_preview).length;
  const primeraGratis = todasLecciones.find((l) => l.is_preview);
  const problema = PROBLEMA_POR_SLUG[curso.slug] ?? null;
  const nivel =
    curso.level === "beginner" ? "Principiante"
    : curso.level === "intermediate" ? "Intermedio"
    : curso.level === "advanced" ? "Avanzado"
    : curso.level;

  return (
    <>
      <Barra volver={{ href: "/", texto: "Todos los cursos" }} />
      <main className="marco" style={{ paddingBlock: "var(--e-7)" }}>

        {/* ─── HERO DEL CURSO ─── */}
        <header className="curso-hero">
          <div className="curso-hero-meta">
            <span className="t-folio">{nivel}</span>
            <span className="t-folio" aria-hidden="true">·</span>
            <span className="t-folio">{modulos.length} {modulos.length === 1 ? "módulo" : "módulos"}</span>
            <span className="t-folio" aria-hidden="true">·</span>
            <span className="t-folio">{total} lecciones</span>
            {curso.duration_minutes ? (
              <>
                <span className="t-folio" aria-hidden="true">·</span>
                <span className="t-folio">{horas(curso.duration_minutes)}</span>
              </>
            ) : null}
          </div>

          {problema && (
            <p className="curso-hero-problema t-dato">{problema}</p>
          )}

          <h1 className="t-titulo-1 curso-hero-titulo">{curso.title}</h1>

          {curso.subtitle && (
            <p className="t-lectura-guia curso-hero-subtitulo">
              {curso.subtitle}
            </p>
          )}

          {!inscrito && (
            <div className="portada-curso curso-hero-portada">
              <Portada
                id="pcurso"
                piezas={total}
                variante={varianteDe(curso.slug)}
                slug={curso.slug}
                imagen={curso.cover_url}
                alt=""
                contexto="cabecera"
                prioridad
              />
            </div>
          )}
        </header>

        {/* ─── CTA PRINCIPAL / PROGRESO ─── */}
        <section className="superficie curso-cta-card" aria-label={inscrito ? "Tu avance" : "Inscripción"}>
          {inscrito ? (
            <>
              <div className="t-dato">Tu avance</div>
              <div className="pista" style={{ marginTop: "var(--e-3)" }}>
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className="t-dato" style={{ marginTop: "var(--e-3)", color: "var(--tinta-media)" }}>
                {completadas} de {total} lecciones · {pct}%
              </div>
              {siguiente ? (
                <>
                  <Perforacion sangrada />
                  <div className="t-folio">{folio(siguiente.mod, siguiente.lec)}</div>
                  <h2 className="t-titulo-4" style={{ margin: "var(--e-2) 0 var(--e-5)" }}>
                    {siguiente.title}
                  </h2>
                  <Link
                    className="btn btn-primario"
                    href={`/cursos/${slug}/${siguiente.mod}/${siguiente.lec}`}
                  >
                    Continuar donde ibas
                  </Link>
                </>
              ) : (
                <>
                  <Perforacion sangrada />
                  <div className="t-folio">Curso completo</div>
                  <h2 className="t-titulo-4" style={{ margin: "var(--e-2) 0 var(--e-4)" }}>
                    Terminaste las {total} lecciones. Tu certificado ya está listo.
                  </h2>
                  <form action={emitirCertificado}>
                    <input type="hidden" name="curso_id" value={curso.id} />
                    <button className="btn btn-primario" type="submit">
                      Ver mi certificado
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <>
              <div className="curso-metas">
                {precio_cents !== null && (
                  <Insignia tono="precio">{precio(precio_cents, moneda)}</Insignia>
                )}
                <span className="t-dato" style={{ color: "var(--tinta-media)" }}>
                  Acceso sin caducidad
                </span>
              </div>

              <Perforacion sangrada />

              <form action={inscribirse} className="curso-cta-form">
                <input type="hidden" name="curso_id" value={curso.id} />
                <input type="hidden" name="slug" value={slug} />
                <button className="btn btn-primario" type="submit">
                  {usuario ? "Inscribirme al curso" : "Entrar e inscribirme"}
                </button>
              </form>

              {gratis > 0 && primeraGratis && (
                <p className="curso-cta-gratis t-dato">
                  <Insignia tono="estado">{gratis} {gratis === 1 ? "lección gratis" : "lecciones gratis"}</Insignia>
                  {" "}
                  <Link href={`/cursos/${slug}/${modulos.find(m => m.lecciones.some(l => l.id === primeraGratis.id))?.sort_order ?? 1}/${primeraGratis.sort_order}`} className="curso-cta-gratis-link">
                    Empieza por «{primeraGratis.title}» sin registrarte
                  </Link>
                </p>
              )}

              {gratis === 0 && (
                <p className="t-dato" style={{ marginTop: "var(--e-4)", color: "var(--tinta-tenue)" }}>
                  Acceso inmediato en cuanto te inscribes.
                </p>
              )}
            </>
          )}
        </section>

        {/* ─── LO QUE TE LLEVAS ─── */}
        {!inscrito && entregables.length > 0 && (
          <section className="superficie curso-entregables" style={{ marginTop: "var(--e-7)" }}>
            <div className="t-folio">Lo que te llevas</div>
            <h2 className="t-titulo-2" style={{ marginTop: "var(--e-2)" }}>
              {entregables.length} {entregables.length === 1 ? "pieza lista" : "piezas listas"}, no {entregables.length} {entregables.length === 1 ? "video" : "videos"}
            </h2>
            <p className="t-cuerpo" style={{ marginTop: "var(--e-4)", color: "var(--tinta-media)", maxWidth: "62ch" }}>
              Cada lección termina con algo hecho y aplicado a tu negocio.
              Esta es la lista completa:
            </p>

            <Perforacion sangrada />

            <ul className="entregables">
              {entregables.map((e, i) => (
                <li key={i}>
                  <Sello mini />
                  <span className="t-cuerpo">{e}</span>
                </li>
              ))}
            </ul>

            {minSemana > 0 && (
              <>
                <Perforacion sangrada />
                <p className="t-lectura-guia">
                  Los módulos de este curso suman{" "}
                  <strong>{minSemana} minutos a la semana</strong> de trabajo que
                  dejas de hacer a mano. Son{" "}
                  {Math.round((minSemana * 52) / 60)} horas al año.
                </p>
              </>
            )}
          </section>
        )}

        {/* ─── TEMARIO ─── */}
        <div className="curso-temario-cab">
          <h2 className="t-titulo-2">Temario</h2>
          <p className="t-dato" style={{ color: "var(--tinta-media)" }}>
            {total} lecciones · {gratis > 0 ? `${gratis} abiertas sin inscripción` : "acceso completo al inscribirte"}
          </p>
        </div>

        {modulos.map((m) => (
          <section key={m.id} className="modulo superficie">
            {modulos.length > 1 && (
              <>
                <div className="modulo-cab">
                  <div>
                    <div className="t-folio">Módulo {String(m.sort_order).padStart(2, "0")}</div>
                    <h3 className="t-titulo-3" style={{ marginTop: "var(--e-2)" }}>{m.title}</h3>
                    {m.capability && (
                      <p className="t-dato" style={{ marginTop: "var(--e-2)", color: "var(--tinta-media)" }}>
                        {m.capability}
                      </p>
                    )}
                  </div>
                  {!!m.minutes_saved_weekly && (
                    <Insignia>{m.minutes_saved_weekly} min/semana</Insignia>
                  )}
                </div>
                <Perforacion sangrada />
              </>
            )}

            {m.lecciones.map((l) => {
              const hecha = hechas.has(l.id);
              const abierta = inscrito || l.is_preview;
              const cuerpo = (
                <>
                  <Sello estado={hecha ? "logrado" : abierta ? "pendiente" : "bloqueado"} />
                  <span className="leccion-cuerpo">
                    <span className="t-folio">{folio(m.sort_order, l.sort_order)}</span>
                    <span className="leccion-t">{l.title}</span>
                    {l.outcome && <span className="leccion-o t-dato">{l.outcome}</span>}
                  </span>
                  <span className="leccion-meta t-dato">
                    {!inscrito && l.is_preview
                      ? <Insignia tono="estado">Gratis</Insignia>
                      : l.duration_minutes ? `${l.duration_minutes} min` : ""}
                  </span>
                </>
              );
              return abierta ? (
                <Link
                  key={l.id}
                  className={`leccion ${hecha ? "leccion-hecha" : ""}`}
                  href={`/cursos/${slug}/${m.sort_order}/${l.sort_order}`}
                >
                  {cuerpo}
                </Link>
              ) : (
                <div key={l.id} className="leccion leccion-bloqueada">{cuerpo}</div>
              );
            })}
          </section>
        ))}

        {/* ─── CTA FINAL (solo no inscritos) ─── */}
        {!inscrito && (
          <section className="superficie curso-cta-final" style={{ marginTop: "var(--e-8)" }}>
            <div className="t-folio">Listo para empezar</div>
            <h2 className="t-titulo-3" style={{ marginTop: "var(--e-2)" }}>
              {problema
                ? `Resuelve «${problema.toLowerCase()}» con este curso`
                : `Empieza ${curso.title}`}
            </h2>
            <p className="t-cuerpo" style={{ marginTop: "var(--e-4)", color: "var(--tinta-media)", maxWidth: "52ch" }}>
              {gratis > 0
                ? `Prueba las ${gratis} lecciones abiertas. Si te sirve, te inscribes y sigues con el resto.`
                : "Acceso inmediato a todas las lecciones, misiones y entregables."}
            </p>
            <Perforacion sangrada />
            <div className="curso-cta-final-acciones">
              {precio_cents !== null && (
                <Insignia tono="precio">{precio(precio_cents, moneda)}</Insignia>
              )}
              <form action={inscribirse}>
                <input type="hidden" name="curso_id" value={curso.id} />
                <input type="hidden" name="slug" value={slug} />
                <button className="btn btn-primario" type="submit">
                  {usuario ? "Inscribirme" : "Entrar e inscribirme"}
                </button>
              </form>
            </div>
          </section>
        )}

      </main>
      <Pie />
    </>
  );
}
