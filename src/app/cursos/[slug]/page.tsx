import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurso, precio, horas, folio } from "@/lib/catalogo";
import { usuarioActual } from "@/lib/supabase/server";
import { inscribirse, emitirCertificado } from "@/app/acciones";
import { Barra, Perforacion, Insignia, Sello, Pie } from "@/components/ui";
import { Portada, varianteDe } from "@/components/portada";
import { MARCA } from "@/lib/marca";

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

  // Cada módulo se cuenta UNA vez. Sumarlo por lección infla el número.
  const minSemana = modulos.reduce((a, m) => a + (m.minutes_saved_weekly ?? 0), 0);
  const entregables = modulos.flatMap((m) =>
    m.lecciones.filter((l) => l.outcome).map((l) => l.outcome as string)
  );
  const gratis = modulos.flatMap((m) => m.lecciones).filter((l) => l.is_preview).length;

  return (
    <>
      <Barra volver={{ href: "/", texto: "Todos los cursos" }} />
      <main className="marco" style={{ paddingBlock: "var(--e-8)" }}>
        <div className="t-folio">
          {curso.level === "beginner" ? "Principiante" : curso.level} · {modulos.length} módulos
        </div>
        <h1 className="t-titulo-1" style={{ marginTop: "var(--e-3)" }}>{curso.title}</h1>
        {!inscrito && (
          <div className="portada-curso" style={{ marginTop: "var(--e-6)" }}>
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
        {curso.subtitle && (
          <p className="t-lectura-guia" style={{ marginTop: "var(--e-5)", color: "var(--tinta-media)" }}>
            {curso.subtitle}
          </p>
        )}

        <section className="superficie" style={{ marginTop: "var(--e-7)" }}>
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
                  <Link className="btn btn-primario" href={`/cursos/${slug}/${siguiente.mod}/${siguiente.lec}`}>
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
                  {total} lecciones{curso.duration_minutes ? ` · ${horas(curso.duration_minutes)}` : ""} · acceso sin caducidad
                </span>
              </div>
              <Perforacion sangrada />
              <form action={inscribirse}>
                <input type="hidden" name="curso_id" value={curso.id} />
                <input type="hidden" name="slug" value={slug} />
                <button className="btn btn-primario" type="submit">
                  {usuario ? "Inscribirme" : "Entrar e inscribirme"}
                </button>
              </form>
              <p className="t-dato" style={{ marginTop: "var(--e-4)", color: "var(--tinta-tenue)" }}>
                {gratis > 0
                  ? `${gratis} lecciones abiertas sin inscripción. Léelas antes de decidir.`
                  : "Acceso inmediato en cuanto te inscribes."}
              </p>
            </>
          )}
        </section>

        {!inscrito && entregables.length > 0 && (
          <section className="superficie" style={{ marginTop: "var(--e-7)" }}>
            <div className="t-folio">Lo que te llevas</div>
            <h2 className="t-titulo-2" style={{ marginTop: "var(--e-2)" }}>
              {entregables.length} piezas listas, no {entregables.length} videos
            </h2>
            <p className="t-cuerpo" style={{ marginTop: "var(--e-4)", color: "var(--tinta-media)", maxWidth: "62ch" }}>
              Cada lección termina con algo hecho y aplicado a tu negocio. Esta es
              la lista completa, sin adornos:
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

        <h2 className="t-titulo-2" style={{ margin: "var(--e-8) 0 var(--e-5)" }}>Temario</h2>

        {modulos.map((m) => (
          <section key={m.id} className="modulo superficie">
            {modulos.length > 1 && (
              <>
                <div className="modulo-cab">
                  <div>
                    <div className="t-folio">Módulo {String(m.sort_order).padStart(2, "0")}</div>
                    <h3 className="t-titulo-3" style={{ marginTop: "var(--e-2)" }}>{m.title}</h3>
                  </div>
                  {!!m.minutes_saved_weekly && <Insignia>{m.minutes_saved_weekly} min/semana</Insignia>}
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
                  <span>
                    <span className="t-folio">{folio(m.sort_order, l.sort_order)}</span>
                    <span className="leccion-t">{l.title}</span>
                    {l.outcome && <span className="leccion-o t-dato">{l.outcome}</span>}
                  </span>
                  <span className="t-dato" style={{ color: "var(--tinta-tenue)", whiteSpace: "nowrap" }}>
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
      </main>
      <Pie />
    </>
  );
}
