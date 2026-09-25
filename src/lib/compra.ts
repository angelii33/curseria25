import { clienteServidor } from "./supabase/server";
import { registrar } from "./analitica";
import { conParametro, rutaInterna } from "./rutas";
import { crearPreferencia, crearSuscripcion, mercadoPagoListo } from "./mercadopago";

// Arranca el pago de un producto para quien ya tiene sesión y devuelve a
// dónde mandarlo: el cobro de Mercado Pago o, si algo lo impide, la página
// de origen con un aviso (?acceso=pendiente | ya). Lo usan el botón de
// comprar y /comprar (el regreso tras crear la cuenta), así que quien se
// registra para comprar llega directo a pagar, sin volver a pulsar nada.
//
// El precio lo pone la base (create_purchase_intent); aquí solo se elige el
// producto. Toda la validación vive en las RPC.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type Inicio = { url: string } | { error: string };

export async function iniciarCompra(productoId: string, volverCrudo: string): Promise<Inicio> {
  const volver = rutaInterna(volverCrudo, "/precios");
  if (!UUID.test(productoId)) return { url: volver };

  const sb = await clienteServidor();
  const { data: usuario } = await sb.auth.getUser();
  if (!usuario.user?.email) return { url: urlRegistro(productoId, volver) };

  // Sin llaves de Mercado Pago no se crea nada: se avisa con calma.
  if (!mercadoPagoListo()) return { url: conParametro(volver, "acceso=pendiente") };

  const { data: producto } = await sb.from("products").select("name,type").eq("id", productoId).maybeSingle();
  if (!producto) return { url: volver };

  if (producto.type === "membership") {
    const { data, error } = await sb.rpc("create_subscription_intent", { check_product_id: productoId });
    if (error) {
      if (error.message.includes("already_subscribed")) return { url: conParametro(volver, "acceso=ya") };
      return { error: error.message };
    }
    const intento = Array.isArray(data) ? data[0] : data;
    if (!intento) return { error: "sin_intencion_suscripcion" };
    await registrar("suscripcion_iniciada", { producto_id: productoId });
    try {
      const url = await crearSuscripcion({
        suscripcionId: intento.subscription_id,
        titulo: intento.product_name,
        centavos: intento.amount_cents,
        moneda: intento.currency,
        email: usuario.user.email,
      });
      return { url };
    } catch (e) {
      // Mercado Pago caído o lento: aviso claro, no la página de error.
      return { error: `mp_suscripcion: ${e instanceof Error ? e.message : "desconocido"}` };
    }
  }

  const { data, error } = await sb.rpc("create_purchase_intent", { check_product_id: productoId });
  if (error) {
    if (error.message.includes("already_owned")) return { url: conParametro(volver, "acceso=ya") };
    return { error: error.message };
  }
  const intento = Array.isArray(data) ? data[0] : data;
  if (!intento) return { error: "sin_intencion_compra" };
  await registrar("checkout_iniciado", { producto_id: productoId, centavos: intento.amount_cents });
  try {
    const url = await crearPreferencia({
      compraId: intento.purchase_id,
      titulo: producto.name ?? "Curso de CurserIA",
      centavos: intento.amount_cents,
      moneda: intento.currency,
      email: usuario.user.email,
      volverA: volver.split("#")[0],
    });
    return { url };
  } catch (e) {
    return { error: `mp_preferencia: ${e instanceof Error ? e.message : "desconocido"}` };
  }
}

/** Sin sesión: crear la cuenta y, al terminar, seguir directo al pago. */
export function urlRegistro(productoId: string, volver: string) {
  const siguiente = `/comprar?producto=${productoId}&volver=${encodeURIComponent(volver)}`;
  return `/entrar?crear=1&volver=${encodeURIComponent(siguiente)}`;
}
