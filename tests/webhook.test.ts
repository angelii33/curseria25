import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// La ruta del aviso de Mercado Pago: solo enruta. Rechaza firmas falsas,
// ignora lo que no conoce y responde 500 cuando algo nuestro falla para que
// Mercado Pago lo reintente.

const llamadas = vi.hoisted(() => ({ pago: [] as string[], sus: [] as string[], cobro: [] as string[], falla: false }));
vi.mock("@/lib/pagos", () => ({
  procesarPago: vi.fn(async (id: string) => {
    llamadas.pago.push(id);
    if (llamadas.falla) throw new Error("red");
    return { estado: "aprobado", compraId: "x" };
  }),
  procesarSuscripcion: vi.fn(async (id: string) => (llamadas.sus.push(id), { estado: "pendiente" })),
  procesarCobroSuscripcion: vi.fn(async (id: string) => (llamadas.cobro.push(id), { estado: "pendiente" })),
}));

const { POST } = await import("@/app/api/pagos/mercadopago/route");
const SECRETO = "secreto-de-prueba";
const firma = (id: string, req = "req-1", ts = "1") =>
  `ts=${ts},v1=${createHmac("sha256", SECRETO).update(`id:${id};request-id:${req};ts:${ts};`).digest("hex")}`;
const aviso = (cuerpo: unknown, cabeceras: Record<string, string> = {}, qs = "") =>
  POST(new Request(`https://x.mx/api/pagos/mercadopago${qs}`, { method: "POST", body: JSON.stringify(cuerpo), headers: cabeceras }));

beforeEach(() => {
  llamadas.pago = []; llamadas.sus = []; llamadas.cobro = []; llamadas.falla = false;
  process.env.MP_WEBHOOK_SECRET = SECRETO;
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { delete process.env.MP_WEBHOOK_SECRET; });

describe("aviso de Mercado Pago", () => {
  it("firma válida: procesa el pago", async () => {
    const r = await aviso({ type: "payment", data: { id: 123 } }, { "x-signature": firma("123"), "x-request-id": "req-1" });
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: true, estado: "aprobado" });
    expect(llamadas.pago).toEqual(["123"]);
  });

  it("firma falsa: 401 y no consulta nada", async () => {
    const r = await aviso({ type: "payment", data: { id: 123 } }, { "x-signature": "ts=1,v1=00", "x-request-id": "req-1" });
    expect(r.status).toBe(401);
    expect(llamadas.pago).toHaveLength(0);
  });

  it("firma de otro id no sirve para este", async () => {
    const r = await aviso({ type: "payment", data: { id: 999 } }, { "x-signature": firma("123"), "x-request-id": "req-1" });
    expect(r.status).toBe(401);
  });

  it("sin id o con un tipo desconocido responde 200 sin procesar", async () => {
    expect(await (await aviso({ type: "payment" })).json()).toMatchObject({ ignorado: "sin_id" });
    const r = await aviso({ type: "merchant_order", data: { id: 5 } }, { "x-signature": firma("5"), "x-request-id": "req-1" });
    expect(await r.json()).toMatchObject({ ok: true, ignorado: "merchant_order" });
    expect(llamadas.pago).toHaveLength(0);
  });

  it("enruta suscripciones y cobros mensuales; acepta el formato viejo por query", async () => {
    await aviso({ type: "subscription_preapproval", data: { id: "abc123" } }, { "x-signature": firma("abc123"), "x-request-id": "req-1" });
    await aviso({ type: "subscription_authorized_payment", data: { id: 77 } }, { "x-signature": firma("77"), "x-request-id": "req-1" });
    await aviso({}, { "x-signature": firma("88"), "x-request-id": "req-1" }, "?topic=payment&id=88");
    expect(llamadas.sus).toEqual(["abc123"]);
    expect(llamadas.cobro).toEqual(["77"]);
    expect(llamadas.pago).toEqual(["88"]);
  });

  it("si procesar falla responde 500 para que Mercado Pago reintente", async () => {
    llamadas.falla = true;
    const r = await aviso({ type: "payment", data: { id: 1 } }, { "x-signature": firma("1"), "x-request-id": "req-1" });
    expect(r.status).toBe(500);
  });

  it("un cuerpo que no es JSON no rompe la ruta", async () => {
    const r = await POST(new Request("https://x.mx/api/pagos/mercadopago", { method: "POST", body: "{{" }));
    expect(r.status).toBe(200);
  });
});
