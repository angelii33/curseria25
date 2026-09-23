import Link from "next/link";
import { getCatalogo, getOfertas, precio } from "@/lib/catalogo";
import { Opiniones } from "@/components/opiniones";
import { Catalogo } from "@/components/catalogo";
import { ETAPAS, editorialDe, type Etapa } from "@/lib/editorial";
import { Barra, Pie } from "@/components/ui";
import { CursoFicha } from "@/components/curso-ficha";
import { Pieza } from "@/components/pieza";
import { IconoProceso } from "@/components/iconos-proceso";
import { SelectorProblema } from "@/components/selector-problema";
import { Preguntas } from "@/components/preguntas";
import { Pestanas } from "@/components/pestanas";
import { AntesDespues, tieneAntesDespues } from "@/components/antes-despues";
import { LeccionPorDentro } from "@/components/leccion-por-dentro";
import { MARCA } from "@/lib/marca";

export const dynamic = "force-dynamic";

type CursoCatalogo = Awaited<ReturnType<typeof getCatalogo>>[number];

/** Agrupa por la etapa del cliente que arregla cada curso: que te
 *  encuentren, que te pidan, que te compren. Es el orden en que un cliente
 *  llega a un negocio, así que el catálogo se lee como un camino, no como
 *  una lista. Los cursos sin editorial van al final, sin agrupación. */
function porEtapa(cursos: CursoCatalogo[]) {
  const grupos = (Object.keys(ETAPAS) as Etapa[])
    .sort((a, b) => ETAPAS[a].orden - ETAPAS[b].orden)
    .map((etapa) => ({
      etapa,
      ...ETAPAS[etapa],
      cursos: cursos.filter((c) => editorialDe(c.slug)?.etapa === etapa),
    }))
    .filter((g) => g.cursos.length > 0);
  const sueltos = cursos.filter((c) => !editorialDe(c.slug));
  return { grupos, sueltos };
}

const PREGUNTAS = [
  {
    p: "¿Necesito saber de tecnología?",
    r: "No. Si usas WhatsApp, puedes hacer cualquiera de estos cursos. Cada paso dice qué tocar y dónde, y todo se hace desde el celular salvo que la lección diga lo contrario.",
  },
  {
    p: "¿La lección gratis es una versión recortada?",
    r: "No. Es una lección completa, igual que las del curso pagado: con su ejercicio, su lista para comprobar y su resultado. Se abre sin crear cuenta.",
  },
  {
    p: "¿Cuánto tiempo me toma?",
    r: "Las lecciones duran de 12 a 35 minutos y cada una termina con algo hecho. Un curso corto se termina en una semana dedicándole un rato al día.",
  },
  {
    p: "¿Dónde se guarda mi avance?",
    r: "En tu cuenta, no en el teléfono. Empiezas una lección en el celular y la sigues en la computadora donde la dejaste.",
  },
  {
    p: "¿Cómo pago y qué pasa si no me sirve?",
    r: "Pagas con Mercado Pago: tarjeta, saldo o efectivo en OXXO. Si en los primeros 7 días ves que no era para ti, te devolvemos el dinero completo.",
  },
  {
    p: "¿Tengo que usar inteligencia artificial?",
    r: "Solo donde ahorra trabajo de verdad, y siempre con tus datos reales. Las lecciones dicen también cuándo NO usarla.",
  },
];

export default async function Inicio() {
  const [cursos, ofertas] = await Promise.all([getCatalogo(), getOfertas().catch(() => [])]);
  const completo = ofertas.find((o) => o.destacado) ?? null;
  const pro = ofertas.find((o) => o.tipo === "membership") ?? null;
  const conPrecio = cursos.filter((c) => c.precio_cents);
  const minimo = conPrecio.length ? Math.min(...conPrecio.map((c) => c.precio_cents!)) : null;
  const { grupos, sueltos } = porEtapa(cursos);
  const conGratis = cursos.filter((c) => c.abiertaRuta);
  const precios = cursos.map((c) => c.precio_cents).filter((p): p is number => p !== null && p > 0);
  const desde = precios.length ? Math.min(...precios) : null;
  const moneda = cursos[0]?.moneda ?? "MXN";

  return (
    <>
      <Barra />
      <main id="contenido">
        {/* ─── 1 · PROBLEMA → PROMESA ─── */}
        <section className="portada-home">
          <div className="marco portada-home-in">
            <div className="portada-home-texto">
              <p className="sobretitulo">Cursos prácticos para negocios en México</p>
              <h1 className="t-rotulo">{MARCA.promesa}</h1>
              <p className="t-lectura-guia portada-home-bajada">
                Tu ficha de Google. Tu menú con link. Tu WhatsApp que contesta solo.
                Cada curso arregla una cosa concreta de tu negocio y termina con esa
                cosa funcionando, no con apuntes que nunca vas a releer.
              </p>
              <div className="acciones">
                {conGratis.length > 0 ? (
                  <a className="btn btn-primario btn-grande" href="#problemas">
                    Elegir lo que quiero resolver
                  </a>
                ) : null}
                <a className="btn btn-secundario btn-grande" href="#gratis">
                  Probar una lección gratis
                </a>
              </div>
              {cursos.length > 0 ? (
                <ul className="hechos" aria-label="En resumen">
                  <li><strong>{cursos.length}</strong> cursos, cada uno con una pieza terminada</li>
                  <li><strong>1.ª lección</strong> completa y sin registro</li>
                  {desde !== null ? (
                    <li>Desde <strong>{precio(desde, moneda)}</strong> {moneda}</li>
                  ) : null}
                </ul>
              ) : null}
            </div>

            {/* La mesa de trabajo: tres piezas terminadas, como hojas
                reales. Es la promesa en imagen — lo que se llevan otros
                negocios, no una foto de stock. */}
            <div className="mesa-home" aria-hidden="true">
              <div className="mesa-hoja mesa-hoja-1">
                <Pieza slug="tu-negocio-en-google" etiqueta="" />
              </div>
              <div className="mesa-hoja mesa-hoja-2">
                <Pieza slug="cotiza-en-5-minutos" etiqueta="" />
              </div>
              <div className="mesa-hoja mesa-hoja-3">
                <Pieza slug="whatsapp-que-contesta-solo" etiqueta="" />
              </div>
              <span className="mesa-nota mesa-nota-1">Tu ficha de Google</span>
              <span className="mesa-nota mesa-nota-2">Tu cotización en PDF</span>
              <span className="mesa-nota mesa-nota-3">Tu WhatsApp que contesta solo</span>
            </div>
          </div>
        </section>

        {cursos.length === 0 ? (
          <div className="marco">
            <div className="vacio">
              <h2 className="t-titulo-3">Estamos preparando los cursos</h2>
              <p className="t-cuerpo">
                No pudimos cargar el catálogo en este momento. Recarga la página en
                unos segundos.
              </p>
              <Link className="btn btn-secundario" href="/">Volver a intentar</Link>
            </div>
          </div>
        ) : null}

        {/* ─── 2 · ¿QUÉ NECESITAS RESOLVER? ─── */}
        {cursos.length > 0 ? (
          <section className="seccion" id="problemas" aria-labelledby="problemas-titulo">
            <div className="marco">
              <div className="seccion-cab">
                <p className="sobretitulo">Empieza por lo que te duele</p>
                <h2 className="t-titulo-1" id="problemas-titulo">¿Qué necesitas resolver?</h2>
                <p className="t-lectura seccion-bajada">
                  Elige la frase que más se parece a lo que te pasa. Te llevamos al
                  curso que lo arregla.
                </p>
              </div>
              <SelectorProblema cursos={cursos} />
            </div>
          </section>
        ) : null}

        {/* ─── 2b · ASÍ CAMBIA: el problema dibujado contra la pieza hecha ─── */}
        {cursos.some((c) => tieneAntesDespues(c.slug)) ? (
          <section className="seccion seccion-cambio" aria-labelledby="cambio-titulo">
            <div className="marco">
              <div className="seccion-cab">
                <p className="sobretitulo">Antes y después</p>
                <h2 className="t-titulo-1" id="cambio-titulo">Así cambia tu negocio</h2>
                <p className="t-lectura seccion-bajada">
                  A la izquierda, lo que pasa hoy. A la derecha, la pieza con la que sales
                  del curso. Elige un problema.
                </p>
              </div>
              <Pestanas
                etiqueta="Problemas que resuelven los cursos"
                pestanas={cursos
                  .filter((c) => tieneAntesDespues(c.slug))
                  .map((c) => ({
                    id: c.slug,
                    titulo: editorialDe(c.slug)!.problema,
                    panel: (
                      <>
                        <AntesDespues slug={c.slug} />
                        <p className="cambio-pie">
                          <Link href={`/cursos/${c.slug}`} className="cambio-enlace">
                            {c.title}: {c.lecciones} lecciones
                            {c.abiertaRuta ? ", la primera gratis" : ""} <span aria-hidden="true">→</span>
                          </Link>
                        </p>
                      </>
                    ),
                  }))}
              />
            </div>
          </section>
        ) : null}

        {/* ─── 3 · LOS CURSOS, EN EL ORDEN EN QUE LLEGA UN CLIENTE ─── */}
        {cursos.length > 0 ? (
          <section className="seccion seccion-hundida" id="cursos" aria-labelledby="cursos-titulo">
            <div className="marco">
              <div className="seccion-cab">
                <p className="sobretitulo">Los cursos</p>
                <h2 className="t-titulo-1" id="cursos-titulo">
                  Del primer «¿dónde están?» al «¿cuándo empiezas?»
                </h2>
                <p className="t-lectura seccion-bajada">
                  Ordenados como llega un cliente a tu negocio: primero te encuentra,
                  luego te pide, al final te compra. Empieza por donde hoy se te escapa.
                </p>
              </div>

              <Catalogo
                grupos={grupos.map((g) => ({ etapa: g.etapa, titulo: g.titulo, nota: g.nota }))}
                items={[...grupos.flatMap((g) => g.cursos), ...sueltos].map((c) => {
                  const ed = editorialDe(c.slug);
                  return {
                    id: c.id,
                    etapa: ed?.etapa ?? null,
                    texto: [c.title, c.subtitle, ed?.problema, ed?.promesa, ed?.pieza.nombre, ed?.buscar, ed ? ETAPAS[ed.etapa].titulo : ""]
                      .filter(Boolean)
                      .join(" "),
                    ficha: <CursoFicha curso={c} />,
                  };
                })}
              />
            </div>
          </section>
        ) : null}

        {/* ─── 4 · CÓMO FUNCIONA ─── */}
        <section className="seccion" aria-labelledby="como-titulo">
          <div className="marco">
            <div className="seccion-cab">
              <p className="sobretitulo">Cómo funciona</p>
              <h2 className="t-titulo-1" id="como-titulo">Cada lección termina con algo hecho</h2>
              <p className="t-lectura seccion-bajada">
                No son videos para ver después. Son instrucciones para hacer ahora,
                con tu negocio abierto en la otra pestaña.
              </p>
            </div>
            <div className="como">
            <LeccionPorDentro />
            <ol className="metodo metodo-vertical">
              <li>
                <IconoProceso paso={1} />
                <p className="metodo-num">01 · Antes de empezar</p>
                <h3 className="t-titulo-4">Sabes qué vas a construir</h3>
                <p className="t-cuerpo">
                  Cada lección abre con el resultado concreto, lo que necesitas tener a
                  mano y cuánto tiempo te toma.
                </p>
              </li>
              <li>
                <IconoProceso paso={2} />
                <p className="metodo-num">02 · Haz esto ahora</p>
                <h3 className="t-titulo-4">Lo haces con tu negocio</h3>
                <p className="t-cuerpo">
                  Pasos cortos, ejemplos de negocios reales y plantillas que copias con
                  un toque. Tus precios, tus clientes, tus palabras.
                </p>
              </li>
              <li>
                <IconoProceso paso={3} />
                <p className="metodo-num">03 · Comprueba</p>
                <h3 className="t-titulo-4">Queda sellado</h3>
                <p className="t-cuerpo">
                  Revisas tu resultado contra una lista y lo marcas. Tu avance y tu
                  pieza se guardan en tu cuenta.
                </p>
              </li>
            </ol>
            </div>
          </div>
        </section>

        {/* ─── 5 · PRUEBA DE CALIDAD: LAS LECCIONES ABIERTAS ─── */}
        {conGratis.length > 0 ? (
          <section className="seccion seccion-tinta" id="gratis" aria-labelledby="gratis-titulo">
            <div className="marco">
              <div className="seccion-cab">
                <p className="sobretitulo sobretitulo-inverso">Sin registro, sin tarjeta</p>
                <h2 className="t-titulo-1" id="gratis-titulo">
                  Haz la primera lección gratis. Completa.
                </h2>
                <p className="t-lectura seccion-bajada">
                  No es un tráiler. Es la lección 1 del curso, con su ejercicio y su lista
                  para comprobar. Si al terminarla ya tienes algo hecho, sabrás cómo son
                  las demás.
                </p>
              </div>
              <ul className="abiertas">
                {conGratis.map((c) => (
                  <li key={c.id}>
                    <Link href={c.abiertaRuta!} className="abierta">
                      <span className="abierta-curso">{c.title}</span>
                      <span className="abierta-titulo">{c.abiertaTitulo}</span>
                      {c.abiertaResultado ? (
                        <span className="abierta-resultado">
                          <span className="abierta-et">Sales con</span> {c.abiertaResultado}
                        </span>
                      ) : null}
                      <span className="abierta-pie">
                        {c.abiertaMin ? <span>{c.abiertaMin} min</span> : <span />}
                        <span className="abierta-accion">
                          Empezar ahora <span aria-hidden="true">→</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* ─── 6 · LO QUE TRAE CADA LECCIÓN ─── */}
        <section className="seccion" aria-labelledby="incluye-titulo">
          <div className="marco incluye">
            <div>
              <p className="sobretitulo">Qué hay dentro</p>
              <h2 className="t-titulo-1" id="incluye-titulo">Hecho para terminar, no para acumular</h2>
              <p className="t-lectura incluye-bajada">
                Cada lección usa técnicas con evidencia científica sobre cómo se aprende
                de verdad: las mismas que usan las mejores plataformas del mundo,
                pensadas para quien tiene un negocio y poco tiempo.
              </p>
            </div>
            <ul className="incluye-lista">
              <li>
                <strong>Pasos con resultado.</strong> Cada lección dice con qué sales y
                cómo saber que ya lo tienes.
              </li>
              <li>
                <strong>Plantillas para copiar.</strong> Mensajes, textos e
                instrucciones para la IA, con botón de copiar.
              </li>
              <li>
                <strong>Una pregunta antes de leer.</strong> Adivinar primero prepara la
                cabeza para lo que viene, aunque falles.
              </li>
              <li>
                <strong>Comprobación de memoria.</strong> Preguntas al terminar, con el
                porqué de cada respuesta. Recordar fija más que releer.
              </li>
              <li>
                <strong>Repaso espaciado.</strong> Las preguntas vuelven días después,
                justo cuando empiezan a olvidarse.
              </li>
              <li>
                <strong>Tu plan de cuándo hacerlo.</strong> Eliges día y hora, y te lo
                llevas a tu calendario.
              </li>
              <li>
                <strong>Tu cuaderno y tu taller.</strong> Escribes tu versión en la misma
                página y queda guardada en tu cuenta, lista para copiar.
              </li>
              <li>
                <strong>Lista de comprobación.</strong> Criterios concretos para que
                la pieza quede bien la primera vez.
              </li>
              <li>
                <strong>Avance guardado.</strong> Ves qué parte de tu pieza ya está
                construida y cuál sigue.
              </li>
              <li>
                <strong>Certificado verificable.</strong> Al terminar un curso, con
                código que cualquiera puede comprobar.
              </li>
            </ul>
          </div>
        </section>

        {/* ─── PRECIOS, en corto ─── */}
        {ofertas.length ? (
          <section className="seccion seccion-hundida" aria-labelledby="precios-titulo">
            <div className="marco">
              <div className="seccion-cab">
                <p className="sobretitulo">Precios</p>
                <h2 className="t-titulo-1" id="precios-titulo">Paga solo por lo que vas a usar</h2>
                <p className="t-lectura seccion-bajada">
                  La primera lección de cada curso es gratis. Después, eliges.
                </p>
              </div>
              <ul className="precios-resumen">
                {minimo !== null ? (
                  <li>
                    <span className="t-folio">Un curso</span>
                    <strong>desde {precio(minimo)}</strong>
                    <span className="t-dato">Pago único, sin caducidad</span>
                  </li>
                ) : null}
                {completo ? (
                  <li className="precios-resumen-destacado">
                    <span className="t-folio">{completo.nombre}</span>
                    <strong>{precio(completo.precio_cents, completo.moneda)}</strong>
                    <span className="t-dato">
                      {completo.suelto_cents > completo.precio_cents
                        ? `En vez de ${precio(completo.suelto_cents, completo.moneda)} por separado`
                        : "Pago único"}
                    </span>
                  </li>
                ) : null}
                {pro ? (
                  <li>
                    <span className="t-folio">{pro.nombre}</span>
                    <strong>{precio(pro.precio_cents, pro.moneda)} al mes</strong>
                    <span className="t-dato">Todos los cursos · cancelas cuando quieras</span>
                  </li>
                ) : null}
              </ul>
              <div className="acciones precios-resumen-acciones">
                <Link className="btn btn-primario" href="/precios">Ver precios y paquetes</Link>
                <span className="t-dato">Pago con Mercado Pago · 7 días para pedir tu reembolso</span>
              </div>
            </div>
          </section>
        ) : null}

        <Opiniones />

        {/* ─── 7 · PREGUNTAS ─── */}
        <section className="seccion seccion-hundida" aria-labelledby="preguntas-titulo">
          <div className="marco marco-texto">
            <p className="sobretitulo">Antes de decidir</p>
            <h2 className="t-titulo-1" id="preguntas-titulo">Preguntas frecuentes</h2>
            <Preguntas items={PREGUNTAS} />
          </div>
        </section>

        {/* ─── 8 · CIERRE ─── */}
        {conGratis.length > 0 ? (
          <section className="seccion">
            <div className="marco cierre">
              <h2 className="t-titulo-1">¿Qué te está costando clientes hoy?</h2>
              <p className="t-lectura">
                Empieza por eso. La primera lección es gratis y en media hora ya tienes
                algo hecho.
              </p>
              <a className="btn btn-primario btn-grande" href="#problemas">
                Elegir mi problema
              </a>
            </div>
          </section>
        ) : null}
      </main>
      <Pie />
    </>
  );
}
