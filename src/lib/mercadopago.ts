import { createHmac, timingSafeEqual } from "node:crypto";
import { URL_SITIO } from "./sitio";

// Mercado Pago, sin SDK: cuatro llamadas a su API REST.
//
// Reglas que no se rompen:
// - El precio nunca viene del navegador: lo fija la base al crear la compra.
// - Un pago solo se da por bueno después de CONSULTARLO a Mercado Pago con la
//   llave privada. El cuerpo del aviso (webhook) no se cree: solo trae el id.
// - La llave privada (MP_ACCESS_TOKEN) vive solo en el servidor.

const API = "https://api.mercadopago.com";

export function mercadoPagoListo() {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

async function mp<T>(ruta: string, init?: RequestInit): Promise<T> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("mp_no_configurado");
  const r = await fetch(`${API}${ruta}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!r.ok) {
    const cuerpo = await r.text().catch(() => "");
    throw new Error(`mp_${r.status}: ${cuerpo.slice(0, 300)}`);
  }
  return (await r.json()) as T;
}

const base = () => (process.env.NEXT_PUBLIC_SITE_URL ?? URL_SITIO).replace(/\/$/, "");

/** Checkout Pro para un pago único (curso o paquete). */
export async function crearPreferencia(p: {
  compraId: string;
  titulo: string;
  centavos: number;
  moneda: string;
  email?: string | null;
  volverA: string;
}) {
  const res = await mp<{ id: string; init_point: string }>("/checkout/preferences", {
    method: "POST",
    headers: { "X-Idempotency-Key": p.compraId },
    body: JSON.stringify({
      items: [
        {
          id: p.compraId,
          title: p.titulo,
          quantity: 1,
          unit_price: p.centavos / 100,
          currency_id: p.moneda,
        },
      ],
      external_reference: p.compraId,
      payer: p.email ? { email: p.email } : undefined,
      back_urls: {
        success: `${base()}/compra/resultado?volver=${encodeURIComponent(p.volverA)}`,
        pending: `${base()}/compra/resultado?volver=${encodeURIComponent(p.volverA)}`,
        failure: `${base()}/compra/resultado?volver=${encodeURIComponent(p.volverA)}`,
      },
      auto_return: "approved",
      notification_url: `${base()}/api/pagos/mercadopago`,
      statement_descriptor: "LISTO CURSOS",
    }),
  });
  return res.init_point;
}

export type PagoMP = {
  id: number;
  status: string;
  status_detail?: string;
  transaction_amount: number;
  currency_id: string;
  external_reference: string | null;
};

export function obtenerPago(id: string) {
  return mp<PagoMP>(`/v1/payments/${encodeURIComponent(id)}`);
}

/** Suscripción mensual (CurserIA Pro). */
export async function crearSuscripcion(p: {
  suscripcionId: string;
  titulo: string;
  centavos: number;
  moneda: string;
  email: string;
}) {
  const res = await mp<{ id: string; init_point: string }>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: p.titulo,
      external_reference: p.suscripcionId,
      payer_email: p.email,
      back_url: `${base()}/compra/resultado?tipo=suscripcion`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: p.centavos / 100,
        currency_id: p.moneda,
      },
      status: "pending",
    }),
  });
  return res.init_point;
}

export type SuscripcionMP = {
  id: string;
  status: "pending" | "authorized" | "paused" | "cancelled";
  external_reference: string | null;
  next_payment_date?: string | null;
};

export function obtenerSuscripcion(id: string) {
  return mp<SuscripcionMP>(`/preapproval/${encodeURIComponent(id)}`);
}

/**
 * Verifica la firma del aviso (x-signature) con MP_WEBHOOK_SECRET.
 * Formato documentado por Mercado Pago: «ts=...,v1=...», firmado sobre
 * «id:<data.id>;request-id:<x-request-id>;ts:<ts>;» con HMAC-SHA256.
 * Si no hay secreto configurado, devuelve null (no verificable): el pago se
 * valida igual consultándolo a la API, que es la garantía real.
 */
export function firmaValida(firma: string | null, requestId: string | null, dataId: string): boolean | null {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto) return null;
  if (!firma) return false;
  const partes = Object.fromEntries(
    firma.split(",").map((p) => {
      const [k, ...v] = p.split("=");
      return [k.trim(), v.join("=").trim()];
    })
  );
  if (!partes.ts || !partes.v1) return false;
  const id = /^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId;
  const manifiesto = `id:${id};${requestId ? `request-id:${requestId};` : ""}ts:${partes.ts};`;
  const esperada = createHmac("sha256", secreto).update(manifiesto).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(esperada), Buffer.from(partes.v1));
  } catch {
    return false;
  }
}

/** Cobro mensual de una suscripción: solo nos importa a qué suscripción pertenece. */
export function obtenerCobroSuscripcion(id: string) {
  return mp<{ id: number; preapproval_id: string; status: string }>(
    `/authorized_payments/${encodeURIComponent(id)}`
  );
}
