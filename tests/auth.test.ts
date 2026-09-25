import { describe, expect, it } from "vitest";
import {
  ESPERA_REENVIO, correoValido, limitePorCorreo, mensajeDeFalla, normalizarCorreo,
  ocultarCorreo, segundosDeEspera, tipoDeFalla,
} from "@/lib/auth";

describe("correos", () => {
  it("normaliza espacios y mayúsculas", () => {
    expect(normalizarCorreo("  Ana@Taqueria.MX ")).toBe("ana@taqueria.mx");
    expect(normalizarCorreo(null)).toBe("");
  });
  it("valida la forma sin aceptar basura", () => {
    expect(correoValido("ana@taqueria.mx")).toBe(true);
    expect(correoValido("ana@taqueria")).toBe(false);
    expect(correoValido("ana taqueria.mx")).toBe(false);
    expect(correoValido("@taqueria.mx")).toBe(false);
    expect(correoValido(`${"a".repeat(250)}@x.mx`)).toBe(false);
  });
  it("oculta el correo sin perder el dominio", () => {
    expect(ocultarCorreo("ana@taqueria.mx")).toBe("an•••@taqueria.mx");
    expect(ocultarCorreo("a@x.mx")).toBe("a•••@x.mx");
    expect(ocultarCorreo("roto")).toBe("tu correo");
  });
});

describe("errores de Supabase Auth", () => {
  const limite = {
    code: "over_email_send_rate_limit",
    status: 429,
    message: "For security purposes, you can only request this after 56 seconds.",
  };
  it("lee los segundos de espera del servidor", () => {
    expect(segundosDeEspera(limite)).toBe(56);
    expect(segundosDeEspera({ message: "Email rate limit exceeded" })).toBe(ESPERA_REENVIO);
  });
  it("distingue el límite por correo del límite global", () => {
    expect(limitePorCorreo(limite)).toBe(true);
    expect(limitePorCorreo({ code: "over_email_send_rate_limit", message: "Email rate limit exceeded" })).toBe(false);
    expect(mensajeDeFalla({ code: "over_email_send_rate_limit", message: "Email rate limit exceeded" }))
      .toMatch(/límite de envíos por hora/);
    expect(mensajeDeFalla(limite)).toMatch(/56 segundos/);
  });
  it("clasifica código vencido, usado o incorrecto", () => {
    expect(tipoDeFalla({ code: "otp_expired", message: "Token has expired or is invalid" })).toBe("codigo");
    expect(tipoDeFalla({ message: "Token has expired or is invalid" })).toBe("codigo");
    expect(tipoDeFalla({ code: "flow_state_not_found" })).toBe("codigo");
  });
  it("clasifica red, credenciales y correo", () => {
    expect(tipoDeFalla({ name: "AuthRetryableFetchError", status: 0, message: "fetch failed" })).toBe("red");
    expect(tipoDeFalla({ code: "invalid_credentials", message: "Invalid login credentials" })).toBe("credenciales");
    expect(tipoDeFalla({ code: "email_address_invalid" })).toBe("correo");
    expect(tipoDeFalla({ message: "algo raro" })).toBe("otro");
  });
  it("nunca revela si un correo tiene cuenta", () => {
    const textos = [
      { code: "invalid_credentials" }, { code: "otp_expired" }, { code: "user_not_found" },
      { message: "User already registered" }, { code: "email_exists" },
    ].map(mensajeDeFalla);
    for (const t of textos) expect(t).not.toMatch(/no existe|ya tiene cuenta|registrad/i);
  });
});
