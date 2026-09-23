import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { firmaValida } from "@/lib/mercadopago";

// La firma del aviso es la primera barrera contra avisos falsos. Aun con una
// firma válida, el pago se vuelve a consultar a la API de Mercado Pago.
const SECRETO = "secreto-de-prueba";
const firmar = (id: string, req: string, ts: string) =>
  `ts=${ts},v1=${createHmac("sha256", SECRETO).update(`id:${id};request-id:${req};ts:${ts};`).digest("hex")}`;

describe("firmaValida", () => {
  afterEach(() => {
    delete process.env.MP_WEBHOOK_SECRET;
  });

  it("sin secreto configurado no se puede verificar (null)", () => {
    expect(firmaValida("ts=1,v1=abc", "r", "123")).toBeNull();
  });

  it("acepta una firma correcta", () => {
    process.env.MP_WEBHOOK_SECRET = SECRETO;
    expect(firmaValida(firmar("123", "req-1", "1700000000"), "req-1", "123")).toBe(true);
  });

  it("normaliza ids alfanuméricos a minúsculas como documenta Mercado Pago", () => {
    process.env.MP_WEBHOOK_SECRET = SECRETO;
    expect(firmaValida(firmar("abc123", "r", "1"), "r", "ABC123")).toBe(true);
  });

  it.each([
    ["otro id", () => firmaValida(firmar("123", "req-1", "1"), "req-1", "999")],
    ["otro request-id", () => firmaValida(firmar("123", "req-1", "1"), "req-2", "123")],
    ["firma alterada", () => firmaValida("ts=1,v1=deadbeef", "req-1", "123")],
    ["sin cabecera", () => firmaValida(null, "req-1", "123")],
    ["formato roto", () => firmaValida("basura", "req-1", "123")],
  ])("rechaza %s", (_n, f) => {
    process.env.MP_WEBHOOK_SECRET = SECRETO;
    expect(f()).toBe(false);
  });
});
