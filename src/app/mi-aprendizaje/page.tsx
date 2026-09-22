import Link from "next/link";
import { redirect } from "next/navigation";
import { usuarioActual } from "@/lib/supabase/server";
import { getCatalogo, folio } from "@/lib/catalogo";
import { getCurso } from "@/lib/catalogo";
import { Barra, Perforacion, Insignia, Sello, Pie } from "@/components/ui";
import { IconoFichaVacia } from "@/components/iconos-estado";
import { Portada, varianteDe } from "@/components/portada";

export const dynamic = "force-dynamic";

export default async function MiAprendizaje() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar?volver=/mi-aprendizaje");

  const cursos = await getCatalogo();
  const mios = cursos.filter((c) => c.inscrito);
  const otros = cursos.filter((c) => !c.inscrito);

  const detalles = await Promise.all(mios.map((c) => getCurso(c.slug)));
  const nombre = usuario.user_metadata?.display_name || usuario.email?.split("@")[0] || "";

  return (
    <>
      <Barra volver={{ href: "/", texto: "Cursos" }} />
      <main className="marco" style={{ paddingBlock: "var(--e-8)" }}>
        <div className="t-folio">Mi aprendizaje</div>
        <h1 className="t-titulo-1" style={{ marginTop: "var(--e-3)" }}>
          {nombre ? `Hola, ${nombre}` : "Tu avance"}
        </h1>

        {mios.length === 0 ? (
          <section className="superficie" style={{ marginTop: "var(--e-7)", maxWidth: "66ch" }}>
            <IconoFichaVacia />
            <h2 className="t-titulo-3" style={{ marginTop: "var(--e-4)" }}>Todavía no empiezas ningún curso</h2>
            <Perforacion sangrada />
            <p className="t-cuerpo" style={{ marginBottom: "var(--e-5)" }}>
              Inscríbete en uno y tu avance empieza a guardarse aquí.
            </p>
            <Link className="btn btn-primario" href="/">Ver el catálogo</Link>
          </section>
        ) : (
          <div className="fila-curso" style={{ marginTop: "var(--e-7)" }}>
            {detalles.map((d) =>
              !d ? null : (
                <section key={d.curso.id} className="superficie">
                  <div className="curso-metas" style={{ marginBottom: "var(--e-4)" }}>
                    <h2 className="t-titulo-3">{d.curso.title}</h2>
                    <span style={{ marginLeft: "auto" }}>
                      <Sello estado={d.pct === 100 ? "logrado" : "pendiente"} />
                    </span>
                  </div>

                  <div className="pista"><span style={{ width: `${d.pct}%` }} /></div>
                  <div className="t-dato" style={{ marginTop: "var(--e-3)", color: "var(--tinta-media)" }}>
                    {d.completadas} de {d.total} lecciones · {d.pct}%
                  </div>

                  <Perforacion sangrada />

                  {d.siguiente ? (
                    <>
                      <div className="t-folio">{folio(d.siguiente.mod, d.siguiente.lec)}</div>
                      <h3 className="t-titulo-4" style={{ margin: "var(--e-2) 0 var(--e-5)" }}>
                        {d.siguiente.title}
                      </h3>
                      <Link
                        className="btn btn-primario"
                        href={`/cursos/${d.curso.slug}/${d.siguiente.mod}/${d.siguiente.lec}`}
                      >
                        Continuar donde ibas
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="t-cuerpo" style={{ marginBottom: "var(--e-5)" }}>
                        Terminaste el curso completo. Buen trabajo.
                      </p>
                      <Link className="btn btn-secundario" href={`/cursos/${d.curso.slug}`}>
                        Repasar el temario
                      </Link>
                    </>
                  )}
                </section>
              )
            )}
          </div>
        )}

        {otros.length > 0 && (
          <>
            <h2 className="t-titulo-2" style={{ margin: "var(--e-8) 0 var(--e-5)" }}>
              Todavía no tienes estos
            </h2>
            <div className="catalogo">
              {otros.map((c) => (
                <Link
                  key={c.id}
                  href={`/cursos/${c.slug}`}
                  className="superficie curso curso-con-portada"
                >
                  <Portada
                    id={`ma-${c.slug}`}
                    piezas={c.lecciones}
                    variante={varianteDe(c.slug)}
                    slug={c.slug}
                    imagen={c.cover_url}
                    alt=""
                    contexto="tarjeta"
                  />
                  <div className="curso-cuerpo">
                    <h3 className="t-titulo-3">{c.title}</h3>
                    {c.subtitle && (
                      <p className="t-cuerpo" style={{ color: "var(--tinta-media)" }}>{c.subtitle}</p>
                    )}
                    <Perforacion sangrada />
                    <div className="curso-metas">
                      <span className="t-dato" style={{ color: "var(--tinta-media)" }}>
                        {c.lecciones} lecciones
                      </span>
                      {c.gratis > 0 && <Insignia tono="estado">{c.gratis} gratis</Insignia>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
      <Pie />
    </>
  );
}
