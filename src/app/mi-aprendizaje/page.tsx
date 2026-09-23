import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { usuarioActual } from "@/lib/supabase/server";
import { getCatalogo, getCurso, folio, miSemana } from "@/lib/catalogo";
import { Barra, Pie, Sello } from "@/components/ui";
import { IconoFichaVacia } from "@/components/iconos-estado";
import { CursoFicha } from "@/components/curso-ficha";
import { Pieza } from "@/components/pieza";
import { salir } from "@/app/acciones";
import { CierreCurso } from "@/components/cierre-curso";
import { Logros } from "@/components/logros";
import { ETAPAS, editorialDe, partesDe } from "@/lib/editorial";
import { bancoCompleto } from "@/lib/practica";
import { MetaSemanal } from "@/components/meta-semanal";
import { RepasoEspaciado } from "@/components/repaso-espaciado";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi aprendizaje",
  robots: { index: false, follow: false },
};

export default async function MiAprendizaje() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar?volver=/mi-aprendizaje");

  const cursos = await getCatalogo();
  const mios = cursos.filter((c) => c.inscrito);
  const detalles = (await Promise.all(mios.map((c) => getCurso(c.slug)))).filter(
    (d): d is NonNullable<typeof d> => d !== null
  );

  // Recomendaciones con sentido: los cursos que no tienes, en el orden en
  // que llega un cliente (encontrar → pedir → comprar).
  const otros = cursos
    .filter((c) => !c.inscrito)
    .sort(
      (a, b) =>
        (ETAPAS[editorialDe(a.slug)?.etapa ?? "comprar"].orden) -
        (ETAPAS[editorialDe(b.slug)?.etapa ?? "comprar"].orden)
    );
  const fechasSemana = await miSemana();
  // El banco de repaso, con el nombre del curso de cada lección para que la
  // pregunta tenga contexto («Tu negocio en Google · lección 1»).
  const tituloDe = new Map(cursos.map((c) => [c.slug, c.title]));
  const banco = bancoCompleto()
    .filter((b) => tituloDe.has(b.clave.split("/")[0]))
    .map((b) => {
      const [slug, mod, lec] = b.clave.split("/");
      return {
        clave: b.clave,
        origen: `${tituloDe.get(slug)} · ${mod !== "1" ? `módulo ${mod}, ` : ""}lección ${lec}`,
        preguntas: b.preguntas,
      };
    });
  const nombre = usuario.user_metadata?.display_name || usuario.email?.split("@")[0] || "";
  const leccionesHechas = detalles.reduce((a, d) => a + d.completadas, 0);
  const enCurso = detalles.filter((d) => d.pct < 100);
  const terminados = detalles.filter((d) => d.pct === 100);
  const abiertas = otros.filter((c) => c.abiertaRuta).slice(0, 3);

  const habitos = (
    <>
      <Logros />
      <div className="mia-habitos">
        <MetaSemanal fechas={fechasSemana} />
        <RepasoEspaciado banco={banco} />
      </div>
    </>
  );

  return (
    <>
      <Barra volver={{ href: "/#cursos", texto: "Cursos" }} />
      <main id="contenido" className="marco pagina-mia">
        <header className="mia-cab">
          <p className="sobretitulo">Mi aprendizaje</p>
          <h1 className="t-titulo-1">{nombre ? `Hola, ${nombre}` : "Tu avance"}</h1>
          {detalles.length > 0 ? (
            <p className="t-lectura mia-resumen">
              {enCurso.length > 0
                ? `${enCurso.length === 1 ? "Tienes un curso en marcha" : `Tienes ${enCurso.length} cursos en marcha`}`
                : "Terminaste todo lo que empezaste"}
              {leccionesHechas > 0 ? ` y ${leccionesHechas} ${leccionesHechas === 1 ? "lección completada" : "lecciones completadas"}.` : "."}
              {terminados.length > 0 ? ` ${terminados.length === 1 ? "Una pieza terminada" : `${terminados.length} piezas terminadas`}.` : ""}
            </p>
          ) : null}
          <p className="t-dato mia-taller">
            Lo que escribes en los cuadernos de las lecciones queda en{" "}
            <Link href="/mi-taller">Mi taller →</Link>
          </p>
          {/* En el teléfono la barra no tiene sitio para «Salir»: vive aquí. */}
          <form action={salir} className="mia-salir">
            <button className="btn btn-fantasma" type="submit">Salir de mi cuenta</button>
          </form>
        </header>

        {/* Con cursos, primero el avance. Sin cursos, primero la primera
            acción: los contadores en cero van después, no delante. */}
        {detalles.length > 0 ? habitos : null}

        {detalles.length === 0 ? (
          <section className="vacio vacio-mia" aria-labelledby="vacio-titulo">
            <IconoFichaVacia />
            <h2 className="t-titulo-2" id="vacio-titulo">Todavía no empiezas ningún curso</h2>
            <p className="t-lectura">
              Aquí vas a ver cada pieza construyéndose conforme avanzas. Lo más rápido
              para empezar: una lección gratis, completa, de media hora.
            </p>
            {abiertas.length > 0 ? (
              <ul className="vacio-lista">
                {abiertas.map((c) => (
                  <li key={c.id}>
                    <Link href={c.abiertaRuta!}>
                      <span className="t-folio">{c.title}</span>
                      <span>{c.abiertaTitulo}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <Link className="btn btn-secundario" href="/#problemas">Elegir por problema</Link>
          </section>
        ) : (
          <div className="mis-cursos">
            {detalles.map((d) => {
              const ed = editorialDe(d.curso.slug);
              const partes = partesDe(d.curso.slug, d.modulos, d.hechas);
              const terminado = d.pct === 100;
              const faltan = d.total - d.completadas;
              return (
                <article key={d.curso.id} className={`mi-curso ${terminado ? "mi-curso-terminado" : ""}`}>
                  {ed && partes ? (
                    <div className="mi-curso-pieza">
                      <Pieza
                        slug={d.curso.slug}
                        estados={partes.map((p) => (p.hecha ? "hecha" : "pendiente"))}
                        etiqueta={`${ed.pieza.nombre}: ${partes.filter((p) => p.hecha).length} de ${partes.length} partes construidas`}
                      />
                    </div>
                  ) : null}
                  <div className="mi-curso-cuerpo">
                    <div className="mi-curso-cab">
                      <h2 className="t-titulo-3">
                        <Link href={`/cursos/${d.curso.slug}`}>{d.curso.title}</Link>
                      </h2>
                      <Sello estado={terminado ? "logrado" : "pendiente"} />
                    </div>
                    {ed ? <p className="t-dato mi-curso-pieza-nombre">{ed.pieza.nombre}</p> : null}
                    <div
                      className="pista pista-grande"
                      role="progressbar"
                      aria-valuenow={d.pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Avance en ${d.curso.title}`}
                    >
                      <span style={{ width: `${d.pct}%` }} />
                    </div>
                    <p className="t-dato mi-curso-cuenta">
                      {d.completadas} de {d.total} lecciones · {d.pct}%
                      {!terminado ? ` · ${faltan === 1 ? "te falta una" : `te faltan ${faltan}`}` : ""}
                    </p>

                    {d.siguiente ? (
                      <div className="mi-curso-sigue">
                        <p>
                          <span className="t-folio">Sigue · {folio(d.siguiente.mod, d.siguiente.lec)}</span>
                          <span className="mi-curso-sigue-titulo">{d.siguiente.title}</span>
                        </p>
                        <Link
                          className="btn btn-primario"
                          href={`/cursos/${d.curso.slug}/${d.siguiente.mod}/${d.siguiente.lec}`}
                        >
                          {d.completadas === 0 ? "Empezar" : "Continuar"}
                        </Link>
                      </div>
                    ) : (
                      <div className="mi-curso-sigue">
                        <CierreCurso slug={d.curso.slug} cursoId={d.curso.id} total={d.total} pendientes={d.quizzesPendientes} />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {detalles.length === 0 ? habitos : null}

        {otros.length > 0 ? (
          <section className="mia-otros" aria-labelledby="otros-titulo">
            <p className="sobretitulo">Tu siguiente pieza</p>
            <h2 className="t-titulo-2" id="otros-titulo">
              {detalles.length ? "Lo que puedes resolver después" : "Todos los cursos"}
            </h2>
            <div className="rejilla-fichas rejilla-fichas-3">
              {otros.map((c) => (
                <CursoFicha key={c.id} curso={c} variante="compacta" />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Pie />
    </>
  );
}
