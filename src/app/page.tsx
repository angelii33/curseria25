import Link from "next/link";
import { getCatalogo, precio, horas } from "@/lib/catalogo";
import { usuarioActual } from "@/lib/supabase/server";
import { Barra, Perforacion, Insignia, Pie } from "@/components/ui";
import { Portada, varianteDe } from "@/components/portada";
import { IconoProceso } from "@/components/iconos-proceso";
import { SelectorProblema } from "@/components/selector-problema";
import { MARCA } from "@/lib/marca";

export const dynamic = "force-dynamic";

type CursoCatalogo = Awaited<ReturnType<typeof getCatalogo>>[number];

/**
 * Dos bloques con fundamento real: ALCANCE, no precio.
 * - Cursos cortos (5 lecciones, ~2 h): cada uno arregla una cosa.
 * - Curso largo (14 lecciones): su propia promesa es construir un sistema.
 * No se inventan categorías ni se tocan los datos.
 */
function agrupar(cursos: CursoCatalogo[]) {
  const cortos = cursos.filter((c) => c.lecciones <= 6);
  const largos = cursos.filter((c) => c.lecciones > 6);
  return [
    {
      titulo: "Déjalo listo esta semana",
      nota: "Cinco lecciones, unas dos horas. Empiezas hoy y hoy queda hecho.",
      cursos: cortos,
    },
    {
      titulo: "Monta el sistema completo",
      nota: "Más largo y por partes. Para cuando lo urgente ya está resuelto.",
      cursos: largos,
    },
  ].filter((g) => g.cursos.length > 0);
}

function Ficha({ curso, ancha = false }: { curso: CursoCatalogo; ancha?: boolean }) {
  return (
    <Link
      href={`/cursos/${curso.slug}`}
      className={`superficie curso curso-con-portada ${ancha ? "curso-ancho" : ""} ${curso.inscrito ? "curso-destacado" : ""}`}
    >
      <Portada
        id={`pc-${curso.slug}`}
        piezas={curso.lecciones}
        destacado={curso.inscrito}
        variante={varianteDe(curso.slug)}
        slug={curso.slug}
        imagen={curso.cover_url}
        alt=""
        contexto="tarjeta"
      />

      <div className="curso-cuerpo">
        <h3 className="t-titulo-3">{curso.title}</h3>

        {curso.subtitle && (
          <p className="t-cuerpo" style={{ color: "var(--tinta-media)" }}>{curso.subtitle}</p>
        )}

        {curso.inscrito && (
          <>
            <div className="pista"><span style={{ width: `${curso.pct}%` }} /></div>
            <div className="t-dato" style={{ color: "var(--tinta-media)" }}>
              {curso.completadas} de {curso.lecciones} lecciones · {curso.pct}%
            </div>
          </>
        )}

        {!curso.inscrito && curso.abiertaTitulo && (
          <p className="curso-abierta">
            <span className="curso-abierta-etiqueta">Abierta sin registro</span>
            <span className="t-interfaz">{curso.abiertaTitulo}</span>
            {curso.abiertaMin && (
              <span className="t-dato" style={{ color: "var(--tinta-tenue)" }}>
                {curso.abiertaMin} min
              </span>
            )}
          </p>
        )}

        <Perforacion sangrada />

        <div className="curso-pie">
          <span className="t-dato" style={{ color: "var(--tinta-media)" }}>
            {curso.lecciones} piezas listas
            {curso.duration_minutes ? ` · ${horas(curso.duration_minutes)}` : ""}
          </span>
          {!curso.inscrito && curso.gratis > 0 && (
            <Insignia tono="estado">{curso.gratis} gratis</Insignia>
          )}
          <span className="curso-accion">
            {curso.inscrito ? (
              <span className="t-interfaz" style={{ color: "var(--musgo-600)" }}>Continuar</span>
            ) : (
              <>
                {curso.precio_cents !== null && (
                  <span className="curso-precio">
                    {precio(curso.precio_cents, curso.moneda)}
                    <small>MXN</small>
                  </span>
                )}
                <span className="t-interfaz" style={{ color: "var(--musgo-600)" }}>Ver curso</span>
              </>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function Catalogo() {
  const cursos = await getCatalogo();
  const usuario = await usuarioActual();

  const grupos = agrupar(cursos);

  return (
    <>
      <Barra />
      <main>
        <div className="marco">
        <header className="hero">
          <p className="t-folio">{MARCA.nombre}</p>
          <h1 className="t-rotulo">
            {MARCA.promesa}
          </h1>
          <p className="t-lectura-guia" style={{ color: "var(--tinta-media)" }}>
            Tu ficha de Google. Tu menú con link. Tus cotizaciones. Cada curso
            arregla una cosa de tu negocio y termina con esa cosa hecha, no con
            apuntes que nunca vas a releer.
          </p>
          <div className="hero-acciones">
            <a className="btn btn-primario" href="#cursos">Ver cursos</a>
            {!usuario && <Link className="btn btn-secundario" href="/entrar">Entrar</Link>}
          </div>
        </header>

        {cursos.length > 0 && (
          <div className="franja">
            <p className="t-cuerpo">
              {cursos.length} cursos. Cada lección dice qué queda listo antes de que
              empieces, y cada curso deja una abierta para que lo compruebes sin
              registrarte.
            </p>
          </div>
        )}

        <SelectorProblema cursos={cursos} />
        </div>

        {cursos.length === 0 ? (
          <div className="marco">
          <div className="candado t-cuerpo">No hay cursos publicados ahora mismo.</div>
          </div>
        ) : (
          <div className="catalogo-hundido">
            <div className="marco">
          {grupos.map((g, gi) => (
            <section key={g.titulo} className="grupo" id={gi === 0 ? "cursos" : undefined}>
              <div className="grupo-cab">
                <p className="t-folio">{String(gi + 1).padStart(2, "0")}</p>
                <h2 className="t-titulo-2">{g.titulo}</h2>
                <p className="t-cuerpo" style={{ color: "var(--tinta-media)" }}>{g.nota}</p>
              </div>
              <div className="catalogo">
                {g.cursos.map((c, i) => (
                  <Ficha
                    key={c.id}
                    curso={c}
                    ancha={g.cursos.length % 2 === 1 && i === 0}
                  />
                ))}
              </div>
            </section>
          ))}
            </div>
          </div>
        )}

        <div className="marco">
        <h2 className="t-titulo-2" style={{ margin: "var(--e-8) 0 var(--e-5)" }}>
          Cómo funciona
        </h2>

        <section className="proceso">
          <div>
            <IconoProceso paso={1} />
            <p className="t-folio" style={{ marginTop: "var(--e-3)" }}>01</p>
            <h3 className="t-titulo-4">Lees qué vas a construir</h3>
            <p className="t-cuerpo" style={{ color: "var(--tinta-media)" }}>
              Cada lección abre diciéndote la pieza concreta con la que vas a salir.
            </p>
          </div>
          <div>
            <IconoProceso paso={2} />
            <p className="t-folio" style={{ marginTop: "var(--e-3)" }}>02</p>
            <h3 className="t-titulo-4">Lo haces con tu negocio</h3>
            <p className="t-cuerpo" style={{ color: "var(--tinta-media)" }}>
              Con tus precios, tus clientes y tus palabras. No con un ejemplo genérico.
            </p>
          </div>
          <div>
            <IconoProceso paso={3} />
            <p className="t-folio" style={{ marginTop: "var(--e-3)" }}>03</p>
            <h3 className="t-titulo-4">Queda sellado</h3>
            <p className="t-cuerpo" style={{ color: "var(--tinta-media)" }}>
              Tu avance se guarda en tu cuenta. Lo retomas donde ibas, en cualquier aparato.
            </p>
          </div>
        </section>
        </div>
      </main>
      <Pie />
    </>
  );
}
