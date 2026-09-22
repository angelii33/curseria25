import { clienteAdmin } from "./supabase/admin";
import { obtenerCobroSuscripcion, obtenerPago, obtenerSuscripcion } from "./mercadopago";

// Aplica a la base lo que Mercado Pago dice de un pago o una suscripción.
//
// Lo usan el aviso (webhook) y la página de regreso: las dos llamadas son
// idempotentes, así que da igual cuál llegue primero o si llegan dos veces.
// Nunca se confía en lo que trae la URL o el cuerpo del aviso: solo en lo que
// responde la API de Mercado Pago con la llave privada.

export type Resultado =
  | { estado: "aprobado"; compraId: string }
  | { estado: "pendiente" }
  | { estado: "rechazado" }
  | { estado: "revertido" }
  | { estado: "ignorado"; motivo: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function procesarPago(pagoId: string): Promise<Resultado> {
  if (!/^\d+$/.test(pagoId)) return { estado: "ignorado", motivo: "id_invalido" };
  const admin = clienteAdmin();
  if (!admin) throw new Error("falta_service_role");

  const pago = await obtenerPago(pagoId);
  const compraId = pago.external_reference ?? "";
  if (!UUID.test(compraId)) return { estado: "ignorado", motivo: "sin_referencia" };

  const { data: compra } = await admin
    .from("purchases")
    .select("id,status,provider_payment_id,user_id,product_id")
    .eq("id", compraId)
    .maybeSingle();
  // Cobros de la suscripción también llegan como «payment», con la
  // referencia de la suscripción: no son compras sueltas.
  if (!compra) return { estado: "ignorado", motivo: "compra_no_encontrada" };

  const centavos = Math.round(Number(pago.transaction_amount) * 100);
  const id = String(pago.id);

  if (pago.status === "approved") {
    const { data: concedido, error } = await admin.rpc("grant_purchase_access", {
      p_purchase_id: compra.id,
      p_provider_payment_id: id,
      p_amount_cents: centavos,
      p_currency: pago.currency_id,
    });
    if (error) {
      // Un pago aprobado por un monto distinto o de otra compra no abre
      // nada: queda en el registro para revisarlo a mano.
      if (/amount_mismatch|payment_already_linked|purchase_not_payable/.test(error.message)) {
        console.error("[pagos] pago aprobado no aplicado", compra.id, id, error.message);
        return { estado: "ignorado", motivo: error.message };
      }
      throw new Error(error.message);
    }
    const fila = Array.isArray(concedido) ? concedido[0] : concedido;
    if (fila && !fila.already_granted) {
      await admin.from("analytics_events").insert({
        event_name: "pago_aprobado",
        user_id: compra.user_id,
        properties: { producto_id: compra.product_id, centavos },
      });
    }
    return { estado: "aprobado", compraId: compra.id };
  }

  if (pago.status === "refunded" || pago.status === "charged_back") {
    // Solo se revierte la compra a la que este mismo pago dio acceso.
    if (compra.provider_payment_id !== id) return { estado: "ignorado", motivo: "otro_pago" };
    if (compra.status === "refunded" || compra.status === "chargeback") return { estado: "revertido" };
    const { error } = await admin.rpc("revoke_purchase_access", {
      p_purchase_id: compra.id,
      p_new_status: pago.status === "refunded" ? "refunded" : "chargeback",
    });
    if (error) throw new Error(error.message);
    return { estado: "revertido" };
  }

  // Pendiente, en proceso, rechazado o cancelado: no se toca la compra. Una
  // tarjeta rechazada no debe impedir que la persona pruebe con otra.
  if (pago.status === "rejected" || pago.status === "cancelled") return { estado: "rechazado" };
  return { estado: "pendiente" };
}

const ESTADO_SUSCRIPCION: Record<string, string> = {
  authorized: "active",
  pending: "pending",
  paused: "paused",
  cancelled: "cancelled",
};

export async function procesarSuscripcion(preapprovalId: string): Promise<Resultado> {
  if (!/^[\w-]{6,64}$/.test(preapprovalId)) return { estado: "ignorado", motivo: "id_invalido" };
  const admin = clienteAdmin();
  if (!admin) throw new Error("falta_service_role");

  const s = await obtenerSuscripcion(preapprovalId);
  const suscripcionId = s.external_reference ?? "";
  if (!UUID.test(suscripcionId)) return { estado: "ignorado", motivo: "sin_referencia" };
  const estado = ESTADO_SUSCRIPCION[s.status];
  if (!estado) return { estado: "ignorado", motivo: `estado_${s.status}` };

  const { error } = await admin.rpc("apply_subscription_status", {
    p_subscription_id: suscripcionId,
    p_provider_subscription_id: s.id,
    p_status: estado,
    p_period_end: s.next_payment_date ?? null,
  });
  if (error) {
    if (/subscription_not_found|subscription_already_linked/.test(error.message)) {
      console.error("[pagos] suscripción no aplicada", suscripcionId, error.message);
      return { estado: "ignorado", motivo: error.message };
    }
    throw new Error(error.message);
  }
  if (estado === "active") return { estado: "aprobado", compraId: suscripcionId };
  if (estado === "pending") return { estado: "pendiente" };
  return { estado: "revertido" };
}

/** Un cobro mensual renueva el periodo: se vuelve a leer la suscripción. */
export async function procesarCobroSuscripcion(cobroId: string): Promise<Resultado> {
  if (!/^\d+$/.test(cobroId)) return { estado: "ignorado", motivo: "id_invalido" };
  const cobro = await obtenerCobroSuscripcion(cobroId);
  if (!cobro.preapproval_id) return { estado: "ignorado", motivo: "sin_suscripcion" };
  return procesarSuscripcion(cobro.preapproval_id);
}
