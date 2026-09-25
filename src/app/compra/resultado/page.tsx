import type { Metadata } from "next";
import Link from "next/link";
import { Barra, Pie } from "@/components/ui";
import { Aviso } from "@/components/aviso";
import { mercadoPagoListo } from "@/lib/mercadopago";
import { rutaInterna } from "@/lib/rutas";
import { procesarPago, procesarSuscripcion, type Resultado } from "@/lib/pagos";

export const metadata: Metadata = {
  title: "Tu compra",
  robots: { index: false, follow: false },
};

// Página de regreso de Mercado Pago. Lo que viene en la URL solo se usa como
// id para CONSULTAR el pago: el estado que se muestra es el que responde
// Mercado Pago, y el acceso lo abre la misma función idempotente del aviso.
export default async function ResultadoCompra({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  const volver = rutaInterna(q.volver, "/mi-aprendizaje");
  const pagoId = q.payment_id ?? q.collection_id;
  const suscripcionId = q.preapproval_id;

  let r: Resultado | { estado: "error" } = { estado: "ignorado", motivo: "sin_datos" };
  if (mercadoPagoListo()) {
    try {
      if (suscripcionId) r = await procesarSuscripcion(suscripcionId);
      else if (pagoId && pagoId !== "null") r = await procesarPago(pagoId);
    } catch (e) {
      console.error("[compra/resultado]", e instanceof Error ? e.message : e);
      r = { estado: "error" };
    }
  }

  const esSuscripcion = Boolean(suscripcionId) || q.tipo === "suscripcion";

  return (
    <>
      <Barra />
      <main id="contenido" className="marco estado-pagina compra-resultado">
        {r.estado === "aprobado" ? (
          <>
            <p className="sobretitulo">Pago confirmado</p>
            <h1 className="t-titulo-1">{esSuscripcion ? "Ya estás en CurserIA Pro" : "Listo: ya es tuyo"}</h1>
            <p className="t-lectura">
              {esSuscripcion
                ? "Todos los cursos están abiertos para ti mientras tu membresía esté activa. Mercado Pago te manda el comprobante a tu correo."
                : "Tus cursos ya están en tu cuenta, con acceso sin caducidad. Mercado Pago te manda el comprobante a tu correo."}
            </p>
            <p className="t-dato">
              Tienes 7 días para pedir tu reembolso si no te sirvió.{" "}
              <Link href="/reembolsos">Cómo funciona</Link>
            </p>
            <div className="acciones">
              <Link className="btn btn-primario" href={volver === "/precios" ? "/mi-aprendizaje" : volver}>
                Empezar ahora
              </Link>
              <Link className="btn btn-secundario" href="/mi-aprendizaje">Ir a mi aprendizaje</Link>
            </div>
          </>
        ) : r.estado === "pendiente" ? (
          <>
            <p className="sobretitulo">Pago en proceso</p>
            <h1 className="t-titulo-1">Tu pago está en camino</h1>
            <Aviso tono="atencion" titulo="Aún no se confirma">
              Si pagaste en efectivo (OXXO u otra tienda) o por transferencia, puede tardar
              desde unos minutos hasta dos días hábiles. En cuanto Mercado Pago lo confirme,
              tus cursos se abren solos; no tienes que hacer nada más.
            </Aviso>
            <div className="acciones">
              <Link className="btn btn-primario" href="/mi-aprendizaje">Ir a mi aprendizaje</Link>
            </div>
          </>
        ) : r.estado === "rechazado" ? (
          <>
            <p className="sobretitulo">Pago no completado</p>
            <h1 className="t-titulo-1">El pago no pasó</h1>
            <p className="t-lectura">
              No se hizo ningún cargo. Suele ser un dato de la tarjeta o un límite del banco:
              puedes intentar con otra tarjeta, con saldo de Mercado Pago o en efectivo.
            </p>
            <div className="acciones">
              <Link className="btn btn-primario" href={`${volver}#comprar`}>Intentar de nuevo</Link>
            </div>
          </>
        ) : (
          <>
            <p className="sobretitulo">Tu compra</p>
            <h1 className="t-titulo-1">Estamos revisando tu pago</h1>
            <p className="t-lectura">
              No pudimos confirmarlo en este momento. Si Mercado Pago te cobró, el acceso se
              abre en cuanto nos llegue su aviso — normalmente en unos minutos. Revisa tu
              aprendizaje en un rato.
            </p>
            <div className="acciones">
              <Link className="btn btn-primario" href="/mi-aprendizaje">Ir a mi aprendizaje</Link>
              <Link className="btn btn-secundario" href="/precios">Ver precios</Link>
            </div>
          </>
        )}
      </main>
      <Pie />
    </>
  );
}
