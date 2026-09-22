import type { Metadata } from "next";
import Link from "next/link";
import { Barra, Pie } from "@/components/ui";
import { Aviso } from "@/components/aviso";
import { Preguntas } from "@/components/preguntas";
import { TarjetaOferta } from "@/components/oferta";
import { getCatalogo, getOfertas, precio } from "@/lib/catalogo";
import { URL_SITIO } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Cursos sueltos desde $99, paquetes por etapa o Listo Pro con todos los cursos. Pago único con Mercado Pago y 7 días para pedir tu reembolso.",
  alternates: { canonical: `${URL_SITIO}/precios` },
};

export default async function Precios({
  searchParams,
}: {
  searchParams: Promise<{ acceso?: string }>;
}) {
  const { acceso } = await searchParams;
  const [ofertas, cursos] = await Promise.all([getOfertas(), getCatalogo()]);
  const paquetes = ofertas.filter((o) => o.tipo === "bundle" && !o.destacado);
  const completo = ofertas.find((o) => o.tipo === "bundle" && o.destacado) ?? null;
  const pro = ofertas.find((o) => o.tipo === "membership");
  const sueltos = cursos.filter((c) => c.precio_cents);

  return (
    <>
      <Barra />
      <main id="contenido" className="pagina-precios">
        <header className="seccion precios-cab">
          <div className="marco">
            <p className="sobretitulo">Precios</p>
            <h1 className="t-titulo-1">Pagas una vez. Lo que armas se queda en tu negocio.</h1>
            <p className="t-lectura seccion-bajada">
              Empieza gratis con la primera lección de cada curso. Si te sirve, compra el curso
              que necesitas, un paquete por etapa o todos con Listo Pro.
            </p>
            {acceso === "pendiente" ? (
              <Aviso tono="atencion" titulo="La compra en línea aún no está disponible">
                Estamos terminando de conectar los pagos. Mientras tanto, todas las lecciones
                gratis están abiertas.
              </Aviso>
            ) : acceso === "ya" ? (
              <Aviso tono="logrado" titulo="Ya tienes esto">
                Todo lo que incluye ya está en tu cuenta. <Link href="/mi-aprendizaje">Ir a mi aprendizaje</Link>
              </Aviso>
            ) : null}
          </div>
        </header>

        {paquetes.length || pro ? (
          <section className="seccion seccion-hundida" aria-labelledby="paquetes-titulo">
            <div className="marco">
              <div className="seccion-cab">
                <p className="sobretitulo">Paquetes</p>
                <h2 className="t-titulo-1" id="paquetes-titulo">Resuelve una etapa completa</h2>
                <p className="t-lectura seccion-bajada">
                  Los cursos van en pareja: primero que te encuentren, luego que te pidan sin
                  fricción, al final que te compren.
                </p>
              </div>
              <div className="ofertas">
                {paquetes.map((o) => (
                  <TarjetaOferta key={o.id} o={o} />
                ))}
              </div>
              {completo || pro ? (
                <>
                  <h3 className="t-titulo-3 ofertas-sub">O todo de una vez</h3>
                  <div className="ofertas ofertas-dos">
                    {completo ? <TarjetaOferta o={completo} /> : null}
                    {pro ? <TarjetaOferta o={pro} /> : null}
                  </div>
                </>
              ) : null}
            </div>
          </section>
        ) : null}

        {sueltos.length ? (
          <section className="seccion" aria-labelledby="sueltos-titulo">
            <div className="marco">
              <div className="seccion-cab">
                <p className="sobretitulo">Cursos sueltos</p>
                <h2 className="t-titulo-1" id="sueltos-titulo">O solo el que necesitas hoy</h2>
              </div>
              <ul className="sueltos">
                {sueltos.map((c) => (
                  <li key={c.id} className="suelto">
                    <Link href={`/cursos/${c.slug}`} className="suelto-titulo">{c.title}</Link>
                    <span className="t-dato suelto-dato">
                      {c.lecciones} lecciones{c.gratis ? " · la primera gratis" : ""}
                    </span>
                    <span className="suelto-precio">
                      {c.inscrito ? "Ya es tuyo" : `${precio(c.precio_cents!, c.moneda)} ${c.moneda}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className="seccion seccion-hundida" aria-labelledby="garantia-titulo">
          <div className="marco garantia">
            <span className="garantia-sello" aria-hidden="true">7</span>
            <div>
              <h2 className="t-titulo-2" id="garantia-titulo">7 días para pedir tu reembolso</h2>
              <p className="t-lectura">
                Si en los primeros 7 días después de pagar ves que el curso no es para ti,
                escríbenos y te devolvemos el dinero completo. Sin cuestionario.{" "}
                <Link href="/reembolsos">Cómo funciona</Link>
              </p>
            </div>
          </div>
        </section>

        <section className="seccion" aria-labelledby="dudas-titulo">
          <div className="marco marco-texto">
            <h2 className="t-titulo-1" id="dudas-titulo">Dudas sobre el pago</h2>
            <Preguntas
              items={[
                {
                  p: "¿Cómo pago?",
                  r: "Con Mercado Pago: tarjeta de débito o crédito, saldo de Mercado Pago o en efectivo en OXXO y otras tiendas. Nunca vemos ni guardamos los datos de tu tarjeta.",
                },
                {
                  p: "¿El acceso caduca?",
                  r: "Los cursos y paquetes se pagan una vez y son tuyos sin caducidad. Listo Pro abre todos los cursos mientras la membresía esté activa; si la cancelas, conservas el acceso hasta el final del mes que ya pagaste.",
                },
                {
                  p: "Pagué en efectivo, ¿cuándo se abre mi curso?",
                  r: "En cuanto Mercado Pago confirma el pago, que en efectivo puede tardar de unos minutos a dos días hábiles. Se abre solo; no tienes que avisarnos.",
                },
                {
                  p: "¿Necesito factura?",
                  r: "Escríbenos con tus datos fiscales después de pagar y te decimos cómo la emitimos.",
                },
                {
                  p: "Ya compré un curso de un paquete, ¿pago doble?",
                  r: "Si ya tienes todos los cursos del paquete, no te dejamos comprarlo. Si tienes uno de dos, el paquete sigue siendo por su precio; escríbenos y lo revisamos contigo.",
                },
              ]}
            />
          </div>
        </section>
      </main>
      <Pie />
    </>
  );
}
