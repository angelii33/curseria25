import { beforeEach, describe, expect, it, vi } from "vitest";

// procesarPago decide si una compra abre o cierra un curso. Aquí se fijan sus
// reglas con la base y Mercado Pago simulados: la verdad siempre viene de la
// API, y un reembolso solo revierte la compra que ese mismo pago abrió.

const COMPRA = "11111111-2222-4333-8444-555555555555";
const estado = vi.hoisted(() => ({
  pago: {} as Record<string, unknown>,
  suscripcion: {} as Record<string, unknown>,
  compra: null as Record<string, unknown> | null,
  rpc: [] as { fn: string; args: Record<string, unknown> }[],
  rpcRespuesta: { data: null as unknown, error: null as { message: string } | null },
  eventos: [] as unknown[],
  admin: true,
}));

vi.mock("@/lib/mercadopago", () => ({
  obtenerPago: vi.fn(async () => estado.pago),
  obtenerSuscripcion: vi.fn(async () => estado.suscripcion),
  obtenerCobroSuscripcion: vi.fn(async () => ({ preapproval_id: "pre-123456" })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  clienteAdmin: () =>
    estado.admin
      ? {
          from: (tabla: string) => ({
            select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: estado.compra }) }) }),
            insert: async (fila: unknown) => {
              if (tabla === "analytics_events") estado.eventos.push(fila);
              return { error: null };
            },
          }),
          rpc: async (fn: string, args: Record<string, unknown>) => {
            estado.rpc.push({ fn, args });
            return estado.rpcRespuesta;
          },
        }
      : null,
}));

const { procesarPago, procesarSuscripcion, procesarCobroSuscripcion } = await import("@/lib/pagos");

beforeEach(() => {
  estado.pago = { id: 987, status: "approved", external_reference: COMPRA, transaction_amount: 99, currency_id: "MXN" };
  estado.compra = { id: COMPRA, status: "pending", provider_payment_id: null, user_id: "u1", product_id: "p1" };
  estado.rpc = [];
  estado.rpcRespuesta = { data: [{ already_granted: false }], error: null };
  estado.eventos = [];
  estado.admin = true;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("procesarPago", () => {
  it("ignora ids que no son numéricos sin consultar nada", async () => {
    expect(await procesarPago("1 or 1=1")).toEqual({ estado: "ignorado", motivo: "id_invalido" });
    expect(estado.rpc).toHaveLength(0);
  });

  it("sin llave de servicio falla (para que Mercado Pago reintente)", async () => {
    estado.admin = false;
    await expect(procesarPago("987")).rejects.toThrow("falta_service_role");
  });

  it("ignora pagos sin referencia de compra válida o de compras inexistentes", async () => {
    estado.pago.external_reference = "no-es-uuid";
    expect(await procesarPago("987")).toMatchObject({ estado: "ignorado", motivo: "sin_referencia" });
    estado.pago.external_reference = COMPRA;
    estado.compra = null;
    expect(await procesarPago("987")).toMatchObject({ estado: "ignorado", motivo: "compra_no_encontrada" });
    expect(estado.rpc).toHaveLength(0);
  });

  it("aprobado: concede con el monto en centavos y mide la venta una sola vez", async () => {
    estado.pago.transaction_amount = 99.9;
    expect(await procesarPago("987")).toEqual({ estado: "aprobado", compraId: COMPRA });
    expect(estado.rpc[0]).toEqual({
      fn: "grant_purchase_access",
      args: { p_purchase_id: COMPRA, p_provider_payment_id: "987", p_amount_cents: 9990, p_currency: "MXN" },
    });
    expect(estado.eventos).toHaveLength(1);

    estado.rpcRespuesta = { data: [{ already_granted: true }], error: null };
    await procesarPago("987");
    expect(estado.eventos).toHaveLength(1);
  });

  it.each(["amount_mismatch", "payment_already_linked", "purchase_not_payable"])(
    "aprobado pero rechazado por la base (%s): no abre nada y no reintenta",
    async (motivo) => {
      estado.rpcRespuesta = { data: null, error: { message: motivo } };
      expect(await procesarPago("987")).toEqual({ estado: "ignorado", motivo });
      expect(estado.eventos).toHaveLength(0);
    }
  );

  it("un error inesperado de la base se propaga (500 y reintento)", async () => {
    estado.rpcRespuesta = { data: null, error: { message: "timeout" } };
    await expect(procesarPago("987")).rejects.toThrow("timeout");
  });

  it("reembolso del mismo pago: revierte; de otro pago: no toca la compra", async () => {
    estado.pago.status = "refunded";
    estado.compra = { ...estado.compra!, status: "paid", provider_payment_id: "987" };
    expect(await procesarPago("987")).toEqual({ estado: "revertido" });
    expect(estado.rpc[0]).toEqual({ fn: "revoke_purchase_access", args: { p_purchase_id: COMPRA, p_new_status: "refunded" } });

    estado.rpc = [];
    estado.compra = { ...estado.compra!, provider_payment_id: "555" };
    expect(await procesarPago("987")).toEqual({ estado: "ignorado", motivo: "otro_pago" });
    expect(estado.rpc).toHaveLength(0);
  });

  it("contracargo: marca chargeback y no revierte dos veces", async () => {
    estado.pago.status = "charged_back";
    estado.compra = { ...estado.compra!, status: "paid", provider_payment_id: "987" };
    await procesarPago("987");
    expect(estado.rpc[0].args.p_new_status).toBe("chargeback");

    estado.rpc = [];
    estado.compra = { ...estado.compra!, status: "chargeback" };
    expect(await procesarPago("987")).toEqual({ estado: "revertido" });
    expect(estado.rpc).toHaveLength(0);
  });

  it.each([
    ["rejected", "rechazado"],
    ["cancelled", "rechazado"],
    ["in_process", "pendiente"],
    ["pending", "pendiente"],
  ])("%s no toca la compra (→ %s)", async (status, esperado) => {
    estado.pago.status = status;
    expect(await procesarPago("987")).toEqual({ estado: esperado });
    expect(estado.rpc).toHaveLength(0);
  });
});

describe("procesarSuscripcion", () => {
  beforeEach(() => {
    estado.suscripcion = { id: "pre-123456", status: "authorized", external_reference: COMPRA, next_payment_date: "2026-11-01" };
    estado.rpcRespuesta = { data: null, error: null };
  });

  it("autorizada → activa con su fin de periodo", async () => {
    expect(await procesarSuscripcion("pre-123456")).toEqual({ estado: "aprobado", compraId: COMPRA });
    expect(estado.rpc[0]).toEqual({
      fn: "apply_subscription_status",
      args: { p_subscription_id: COMPRA, p_provider_subscription_id: "pre-123456", p_status: "active", p_period_end: "2026-11-01" },
    });
  });

  it.each([["paused", "revertido"], ["cancelled", "revertido"], ["pending", "pendiente"]])(
    "%s → %s",
    async (status, esperado) => {
      estado.suscripcion.status = status;
      expect((await procesarSuscripcion("pre-123456")).estado).toBe(esperado);
    }
  );

  it("estados desconocidos e ids raros se ignoran sin tocar la base", async () => {
    expect(await procesarSuscripcion("x")).toMatchObject({ motivo: "id_invalido" });
    estado.suscripcion.status = "expired";
    expect(await procesarSuscripcion("pre-123456")).toMatchObject({ estado: "ignorado" });
    expect(estado.rpc).toHaveLength(0);
  });

  it("un cobro mensual vuelve a leer su suscripción", async () => {
    expect(await procesarCobroSuscripcion("4455")).toMatchObject({ estado: "aprobado" });
    expect(await procesarCobroSuscripcion("abc")).toMatchObject({ motivo: "id_invalido" });
  });
});
