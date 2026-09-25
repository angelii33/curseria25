import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurso, getOfertas, precio, horas, folio } from "@/lib/catalogo";
import { usuarioActual } from "@/lib/supabase/server";
import { inscribirse, comprar } from "@/app/acciones";
import { CierreCurso } from "@/components/cierre-curso";
import { clienteServidor } from "@/lib/supabase/server";
import { OpinionForm } from "@/components/opinion-form";
import { Opiniones } from "@/components/opiniones";
import { Barra, Pie } from "@/components/ui";
import { MediaCurso } from "@/components/curso-ficha";
import { PiezaPartes } from "@/components/pieza-partes";
import { Temario } from "@/components/temario";
import { AntesDespues, tieneAntesDespues } from "@/components/antes-despues";
import { RitmoCurso } from "@/components/ritmo-curso";
import { Preguntas } from "@/components/preguntas";
import { Aviso } from "@/components/aviso";
import { ETAPAS, NIVEL, editorialDe, partesDe } from "@/lib/editorial";
import { MARCA } from "@/lib/marca";
import { URL_SITIO } from "@/lib/sitio";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = await getCurso(slug);
  if (!d) return { title: "Curso no encontrado" };
  const ed = editorialDe(slug);
  const descripcion = ed
    ? `${d.curso.subtitle ? `${d.curso.subtitle}. ` : ""}Sales con: ${ed.pieza.nombre.toLowerCase()}. ${d.total} lecciones prácticas.`
    : d.curso.subtitle ?? MARCA.descripcionCorta;
  return {
    title: d.curso.title,
    description: descripcion,
    alternates: { canonical: `/cursos/${slug}` },
    openGraph: { title: d.curso.title, description: descripcion, type: "website", url: `/cursos/${slug}` },
    twitter: { card: "summary_large_image", title: d.curso.title, description: descripcion },
  };
}

export default async function Curso({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ acceso?: string; bienvenida?: string }>;
}) {
  const { slug } = await params;
  const { acceso, bienvenida } = await searchParams;
  const d = await getCurso(slug);
  if (!d) notFound();

  const usuario = await usuarioActual();
  const { curso, modulos, precio_cents, moneda, producto_id, lanzamiento, inscrito, hechas, total, completadas, pct, siguiente } = d;

  // Con CurserIA Pro activo, has_course_access ya es verdadero: se inscribe
  // directo, sin pagar otra vez. La RPC decide; aquí solo cambia el botón.
  let incluidoEnPro = false;
  if (usuario && !inscrito) {
    const sb = await clienteServidor();
    const { data } = await sb.rpc("has_course_access", { check_course_id: curso.id });
    incluidoEnPro = data === true;
  }
  const ofertas = !inscrito ? await getOfertas() : [];
  const alternativas = ofertas.filter(
    (o) => o.tipo === "membership" || o.cursos.some((c) => c.id === curso.id)
  ).sort((a, b) => Number(a.tipo === "membership") - Number(b.tipo === "membership"));
  const ed = editorialDe(slug);
  const partes = partesDe(slug, modulos, hechas);

  const todas = modulos.flatMap((m) => m.lecciones.map((l) => ({ ...l, mod: m.sort_order })));
  const abiertas = todas.filter((l) => l.is_preview);
  const primera = abiertas[0] ?? null;
  const rutaPrimera = primera ? `/cursos/${slug}/${primera.mod}/${primera.sort_order}` : null;
  const siguienteLeccion = siguiente
    ? todas.find((l) => l.mod === siguiente.mod && l.sort_order === siguiente.lec)
    : null;
  const terminado = inscrito && total > 0 && completadas >= total;
  const esPago = precio_cents !== null && precio_cents > 0;
  const precioTexto = precio_cents !== null ? precio(precio_cents, moneda) : null;
  const nivel = curso.level ? NIVEL[curso.level] ?? curso.level : null;
  const pagoPendiente = acceso === "pendiente" && !inscrito;
  // La lección gratis ya completada (se puede guardar con cuenta, sin compra).
  const gratisHecha = Boolean(primera && hechas.has(primera.id));
  const claseCompra = `btn ${rutaPrimera && !gratisHecha ? "btn-secundario" : "btn-primario"} btn-bloque`;

  const botonCompra =
    esPago && producto_id && !incluidoEnPro ? (
      <form action={comprar}>
        <input type="hidden" name="producto_id" value={producto_id} />
        <input type="hidden" name="volver" value={`/cursos/${slug}#comprar`} />
        <button className={claseCompra} type="submit">
          Comprar el curso completo
        </button>
      </form>
    ) : (
      <form action={inscribirse}>
        <input type="hidden" name="curso_id" value={curso.id} />
        <input type="hidden" name="slug" value={slug} />
        <button className={claseCompra} type="submit">
          {incluidoEnPro ? "Inscribirme (incluido en CurserIA Pro)" : esPago ? "Obtener el curso completo" : "Inscribirme gratis"}
        </button>
      </form>
    );

  // Datos estructurados: permiten que Google muestre el curso como curso,
  // con su proveedor y su precio reales. Nada que no esté en la base.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: curso.title,
    description: curso.subtitle ?? ed?.promesa ?? MARCA.descripcionCorta,
    url: `${URL_SITIO}/cursos/${slug}`,
    inLanguage: "es-MX",
    provider: { "@type": "Organization", name: MARCA.nombre, url: URL_SITIO },
    ...(precio_cents !== null
      ? {
          offers: {
            "@type": "Offer",
            price: (precio_cents / 100).toFixed(2),
            priceCurrency: moneda,
            category: esPago ? "Paid" : "Free",
          },
        }
      : {}),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      ...(curso.duration_minutes ? { courseWorkload: `PT${curso.duration_minutes}M` } : {}),
    },
  };

  return (
    <>
      <Barra volver={{ href: "/#cursos", texto: "Cursos" }} />
      <main id="contenido" className="pagina-curso">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />

        {/* ─── HERO: problema, curso, resultado, acción ─── */}
        <header className="curso-cab">
          <div className="marco curso-cab-in">
            <div className="curso-cab-texto">
              <nav aria-label="Ruta" className="migas">
                <Link href="/#cursos">Cursos</Link>
                {ed ? (
                  <>
                    <span aria-hidden="true">/</span>
                    <span>{ETAPAS[ed.etapa].titulo}</span>
                  </>
                ) : null}
              </nav>
              {ed ? <p className="curso-problema">«{ed.problema}»</p> : null}
              <h1 className="t-rotulo curso-titulo">{curso.title}</h1>
              {curso.subtitle ? <p className="t-lectura-guia curso-bajada">{curso.subtitle}</p> : null}
              {ed ? (
                <p className="curso-sales">
                  <span className="curso-sales-et">Sales con</span>
                  <strong>{ed.pieza.nombre}</strong>
                </p>
              ) : null}

              <dl className="curso-datos">
                <div>
                  <dt>Lecciones</dt>
                  <dd>{total}</dd>
                </div>
                {curso.duration_minutes ? (
                  <div>
                    <dt>Tiempo total</dt>
                    <dd>{horas(curso.duration_minutes)}</dd>
                  </div>
                ) : null}
                {nivel ? (
                  <div>
                    <dt>Nivel</dt>
                    <dd>{nivel}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Acceso</dt>
                  <dd>Sin caducidad</dd>
                </div>
              </dl>
            </div>

            <div className="curso-cab-media">
              <MediaCurso
                slug={slug}
                cover={curso.cover_url}
                lecciones={total}
                titulo={curso.title}
                contexto="cabecera"
                prioridad
              />
            </div>
          </div>
        </header>

        <div className="marco curso-cuerpo">
          <div className="curso-principal">
            {bienvenida && inscrito ? (
              <Aviso tono="logrado" titulo="Ya estás dentro">
                El curso completo quedó en tu cuenta. Empieza por la lección 1 o sigue
                donde ibas.
              </Aviso>
            ) : null}

            {/* ─── HOY → AL TERMINAR ─── */}
            {!inscrito && tieneAntesDespues(slug) ? (
              <section className="bloque" aria-labelledby="cambio-titulo">
                <p className="sobretitulo">Antes y después</p>
                <h2 className="t-titulo-2" id="cambio-titulo">De esto, a esto</h2>
                <AntesDespues slug={slug} />
              </section>
            ) : null}

            {/* ─── LO QUE TE LLEVAS ─── */}
            {ed && partes ? (
              <section className="bloque" aria-labelledby="pieza-titulo">
                <p className="sobretitulo">{inscrito ? "Tu pieza" : "Lo que vas a tener terminado"}</p>
                <h2 className="t-titulo-2 pieza-titular" id="pieza-titulo">
                  {inscrito ? ed.pieza.nombre : ed.promesa}
                </h2>
                <p className="t-lectura bloque-bajada">
                  {inscrito
                    ? terminado
                      ? "Construiste todas las partes. Esto ya trabaja para tu negocio."
                      : `Cada ${ed.pieza.porModulo ? "módulo" : "lección"} construye una parte. Así va la tuya.`
                    : `Cada ${ed.pieza.porModulo ? "módulo" : "lección"} construye una parte de la pieza. Al terminar no tienes apuntes: tienes esto funcionando en tu negocio.`}
                </p>
                <PiezaPartes
                  slug={slug}
                  nombre={ed.pieza.nombre}
                  partes={partes}
                  modo={inscrito ? "avance" : "venta"}
                  etiquetaParte={ed.pieza.porModulo ? "Módulo" : "Lección"}
                  sinFigura={!inscrito && tieneAntesDespues(slug)}
                />
              </section>
            ) : null}

            {/* ─── PARA QUIÉN ES ─── */}
            {ed && !inscrito ? (
              <section className="bloque para-quien" aria-labelledby="quien-titulo">
                <div>
                  <p className="sobretitulo">Para quién es</p>
                  <h2 className="t-titulo-2" id="quien-titulo">Este curso es para ti si…</h2>
                  <ul className="lista-check">
                    {ed.paraQuien.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <p className="t-cuerpo no-es">
                    <strong>No es para ti si…</strong> {ed.noEsPara.charAt(0).toLowerCase() + ed.noEsPara.slice(1)}
                  </p>
                </div>
                <div className="necesitas">
                  <p className="sobretitulo">Vas a necesitar</p>
                  <ul>
                    {ed.necesitas.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                  <p className="t-dato necesitas-nota">Nada más. Nada que instalar en la computadora.</p>
                </div>
              </section>
            ) : null}

            {/* ─── EMPIEZA GRATIS ─── */}
            {!inscrito && primera && rutaPrimera ? (
              <section className="bloque gratis-destacada" aria-labelledby="gratis-titulo">
                <div className="gratis-destacada-in">
                  <p className="sobretitulo">Pruébalo sin registrarte</p>
                  <h2 className="t-titulo-2" id="gratis-titulo">
                    Empieza por «{primera.title}»
                  </h2>
                  {primera.outcome ? (
                    <p className="t-lectura">
                      <strong>Al terminarla vas a tener:</strong> {primera.outcome}
                    </p>
                  ) : null}
                  <p className="t-cuerpo gratis-nota">
                    Es la lección completa, no un resumen: con pasos, ejercicio y lista
                    para comprobar. {primera.duration_minutes ? `Unos ${primera.duration_minutes} minutos.` : ""}
                  </p>
                  <Link className="btn btn-primario btn-grande" href={rutaPrimera}>
                    {ed ? `${ed.accion}, gratis` : "Empezar la lección gratis"}
                  </Link>
                </div>
              </section>
            ) : null}

            {/* ─── TEMARIO ─── */}
            <section className="bloque" aria-labelledby="temario-titulo" id="temario">
              <div className="bloque-cab">
                <div>
                  <p className="sobretitulo">Temario</p>
                  <h2 className="t-titulo-2" id="temario-titulo">
                    {total} lecciones, cada una con algo hecho
                  </h2>
                </div>
                <p className="t-dato bloque-cab-nota">
                  {inscrito
                    ? `${completadas} de ${total} completadas`
                    : abiertas.length > 0
                      ? `${abiertas.length} ${abiertas.length === 1 ? "abierta" : "abiertas"} sin registro`
                      : "Acceso completo al obtener el curso"}
                </p>
              </div>
              <RitmoCurso
                lecciones={todas.map((l) => ({
                  id: l.id,
                  titulo: l.title,
                  minutos: l.duration_minutes,
                  gratis: l.is_preview,
                  hecha: hechas.has(l.id),
                }))}
              />
              <Temario
                slug={slug}
                modulos={modulos}
                inscrito={inscrito}
                hechas={hechas}
                siguienteId={inscrito ? siguienteLeccion?.id ?? null : null}
              />
            </section>

            {/* ─── PREGUNTAS DEL CURSO ─── */}
            {!inscrito ? (
              <section className="bloque" aria-labelledby="dudas-titulo">
                <p className="sobretitulo">Antes de decidir</p>
                <h2 className="t-titulo-2" id="dudas-titulo">Dudas sobre este curso</h2>
                <Preguntas
                  items={[
                    ...(primera
                      ? [
                          {
                            p: "¿Qué pasa si hago la lección gratis y no compro?",
                            r: "Nada. Lo que construyas en esa lección es tuyo y funciona aunque no sigas. El resto del curso queda disponible para cuando lo necesites.",
                          },
                        ]
                      : []),
                    {
                      p: "¿Cuánto tiempo necesito?",
                      r: curso.duration_minutes
                        ? `En total, unas ${horas(curso.duration_minutes)} repartidas en ${total} lecciones. Puedes hacer una al día o todo en un fin de semana: tu avance se guarda.`
                        : `Son ${total} lecciones y tu avance se guarda: vas a tu ritmo.`,
                    },
                    ...(ed
                      ? [{ p: "¿Qué necesito tener?", r: `${ed.necesitas.join(", ")}. Nada que instalar en la computadora.` }]
                      : []),
                    {
                      p: "¿El acceso caduca?",
                      r: "No. Cuando tienes el curso, es tuyo: puedes volver a cualquier lección cuando quieras.",
                    },
                  ]}
                />
              </section>
            ) : null}
          </div>

          {/* ─── PANEL DE ACCIÓN (lateral en escritorio) ─── */}
          <aside className="curso-panel" id="comprar" aria-label={inscrito ? "Tu avance" : "Empezar este curso"}>
            <div className="panel">
              {inscrito ? (
                <>
                  <p className="sobretitulo">Tu avance</p>
                  <p className="panel-cifra">
                    {pct}
                    <small>%</small>
                  </p>
                  <div
                    className="pista pista-grande"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Avance del curso"
                  >
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <p className="t-dato panel-nota">
                    {completadas} de {total} lecciones
                    {!terminado && total - completadas === 1 ? " · te falta una" : ""}
                  </p>
                  {siguiente ? (
                    <>
                      <p className="panel-sigue">
                        <span className="t-folio">{folio(siguiente.mod, siguiente.lec)}</span>
                        <span>{siguiente.title}</span>
                      </p>
                      <Link className="btn btn-primario btn-bloque" href={`/cursos/${slug}/${siguiente.mod}/${siguiente.lec}`}>
                        {completadas === 0 ? "Empezar la lección 1" : "Continuar donde ibas"}
                      </Link>
                    </>
                  ) : (
                    <CierreCurso slug={slug} cursoId={curso.id} total={total} pendientes={d.quizzesPendientes} bloque />
                  )}
                </>
              ) : (
                <>
                  {lanzamiento && esPago && !incluidoEnPro ? (
                    <span className="panel-lanzamiento">Precio de lanzamiento</span>
                  ) : null}
                  {precioTexto && !incluidoEnPro ? (
                    <p className="panel-precio">
                      {precioTexto} <small>{moneda}</small>
                    </p>
                  ) : null}
                  <p className="t-dato panel-nota">
                    {total} lecciones · acceso sin caducidad
                  </p>

                  {pagoPendiente ? (
                    <Aviso tono="atencion" titulo="La compra en línea aún no está disponible">
                      Tu cuenta está lista, pero este curso todavía no se puede comprar desde
                      aquí. {rutaPrimera ? "Mientras tanto, la lección gratis está completa y abierta." : ""}
                    </Aviso>
                  ) : acceso === "error" ? (
                    <Aviso tono="falla" titulo="No se pudo abrir el pago">
                      Tu cuenta está lista. Vuelve a pulsar «Comprar»; si sigue fallando, escríbenos.
                    </Aviso>
                  ) : acceso === "ya" ? (
                    <Aviso tono="logrado" titulo="Este curso ya es tuyo">
                      Inscríbete con el botón de abajo y empieza.
                    </Aviso>
                  ) : null}

                  {gratisHecha ? (
                    <p className="t-dato panel-gratis-hecha">
                      <span aria-hidden="true">✓</span> Ya hiciste la lección gratis. Te faltan {total - 1} para
                      terminar {ed ? ed.pieza.nombre.charAt(0).toLowerCase() + ed.pieza.nombre.slice(1) : "el curso"}.
                    </p>
                  ) : null}
                  <div className="panel-acciones">
                    {rutaPrimera && !gratisHecha ? (
                      <Link className="btn btn-primario btn-bloque" href={rutaPrimera}>
                        Empezar la lección gratis
                      </Link>
                    ) : null}
                    {botonCompra}
                    {rutaPrimera && gratisHecha ? (
                      <Link className="btn btn-fantasma btn-bloque" href={rutaPrimera}>
                        Repasar la lección gratis
                      </Link>
                    ) : null}
                  </div>
                  <ul className="panel-incluye">
                    <li>{total} lecciones con pasos y ejercicio</li>
                    <li>Plantillas listas para copiar</li>
                    <li>Avance guardado en tu cuenta</li>
                    <li>Certificado verificable al terminar</li>
                  </ul>
                  {esPago && !incluidoEnPro ? (
                    <p className="t-dato panel-garantia">
                      Pago seguro con Mercado Pago. <Link href="/reembolsos">7 días para pedir tu reembolso.</Link>
                    </p>
                  ) : null}
                  {esPago && !incluidoEnPro && alternativas.length ? (
                    <div className="panel-otras">
                      <p className="t-folio">También viene en</p>
                      {alternativas.map((o) => (
                        <Link key={o.id} href="/precios#paquetes-titulo">
                          <strong>{o.nombre}</strong> · {precio(o.precio_cents, o.moneda)}
                          {o.tipo === "membership" ? " al mes, todos los cursos" : ` por ${o.cursos.length} cursos`}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  {!usuario ? (
                    <p className="t-dato panel-legal">
                      Para guardar tu avance creas una cuenta: nombre, correo y contraseña.
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </aside>
        </div>

        {/* Se pide opinión a quien ya aplicó al menos la mitad del curso: antes
            no hay experiencia que contar, y el botón competía con «Continuar». */}
        {inscrito && completadas * 2 >= total ? (
          <section className="marco opinion-seccion" aria-labelledby="opinar-titulo">
            <h2 className="t-titulo-3" id="opinar-titulo">¿Ya lo estás usando en tu negocio?</h2>
            <p className="t-cuerpo">
              Tu opinión le ayuda a otro dueño de negocio a decidir. La publicamos solo si nos das
              permiso.
            </p>
            <OpinionForm
              cursoId={curso.id}
              nombre={(usuario?.user_metadata?.display_name as string | undefined) ?? ""}
            />
          </section>
        ) : null}

        <Opiniones cursoId={curso.id} />

        {/* ─── CIERRE ─── */}
        {!inscrito ? (
          <section className="seccion seccion-tinta">
            <div className="marco cierre">
              <h2 className="t-titulo-1">
                {ed ? `«${ed.problema}» tiene arreglo esta semana.` : `Empieza ${curso.title} hoy.`}
              </h2>
              <p className="t-lectura">
                {rutaPrimera
                  ? "La primera lección es gratis y completa. Si al terminarla ya tienes algo hecho, sabrás cómo son las demás."
                  : "Acceso inmediato a todas las lecciones, ejercicios y listas de comprobación."}
              </p>
              {rutaPrimera ? (
                <Link className="btn btn-claro btn-grande" href={rutaPrimera}>
                  Empezar la lección gratis
                </Link>
              ) : (
                <a className="btn btn-claro btn-grande" href="#comprar">
                  Obtener el curso
                </a>
              )}
            </div>
          </section>
        ) : null}

        {/* Barra fija en el teléfono: la acción siempre a un pulgar. */}
        {!inscrito ? (
          <div className="barra-accion">
            <span className="barra-accion-texto">
              <strong>{curso.title}</strong>
              <span className="t-dato">
                {rutaPrimera ? "Lección 1 gratis" : precioTexto ? `${precioTexto} ${moneda}` : ""}
              </span>
            </span>
            {rutaPrimera ? (
              <Link className="btn btn-primario" href={rutaPrimera}>Empezar gratis</Link>
            ) : (
              <a className="btn btn-primario" href="#comprar">Obtener</a>
            )}
          </div>
        ) : null}
      </main>
      <Pie />
    </>
  );
}
