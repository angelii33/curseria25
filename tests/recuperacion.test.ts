import { describe, expect, it } from "vitest";
import { firmarPase, huella, paseValido, plantillaRecuperacion } from "@/lib/recuperacion";

describe("pase de recuperación", () => {
  const secreto = "secreto-de-prueba";
  const ahora = 1_700_000_000_000;

  it("vale para el mismo usuario dentro de 15 minutos", () => {
    const pase = firmarPase("usuario-1", secreto, ahora);
    expect(paseValido(pase, "usuario-1", secreto, ahora + 14 * 60_000)).toBe(true);
  });

  it("no vale para otro usuario, vencido, alterado o con otro secreto", () => {
    const pase = firmarPase("usuario-1", secreto, ahora);
    expect(paseValido(pase, "usuario-2", secreto, ahora)).toBe(false);
    expect(paseValido(pase, "usuario-1", secreto, ahora + 16 * 60_000)).toBe(false);
    expect(paseValido(pase, "usuario-1", "otro", ahora)).toBe(false);
    const [id, vence, firma] = pase.split(".");
    expect(paseValido(`${id}.${Number(vence) + 3_600_000}.${firma}`, "usuario-1", secreto, ahora)).toBe(false);
    expect(paseValido(undefined, "usuario-1", secreto, ahora)).toBe(false);
    expect(paseValido("basura", "usuario-1", secreto, ahora)).toBe(false);
  });
});

describe("huella", () => {
  it("es estable y no contiene el correo", () => {
    expect(huella("ana@taqueria.mx")).toBe(huella("ana@taqueria.mx"));
    expect(huella("ana@taqueria.mx")).not.toContain("ana");
    expect(huella("ana@taqueria.mx")).not.toBe(huella("beto@taqueria.mx"));
  });
});

describe("plantilla del correo", () => {
  const enlace = "https://curseria.mx/recuperar?token_hash=abc123&volver=%2Fcursos%2Fx";
  const c = plantillaRecuperacion(enlace);

  it("lleva el enlace en el botón y en texto plano", () => {
    expect(c.html).toContain('href="https://curseria.mx/recuperar?token_hash=abc123&amp;volver=%2Fcursos%2Fx"');
    expect(c.texto).toContain(enlace);
    expect(c.asunto).toContain("CurserIA");
  });

  it("no carga imágenes remotas ni scripts", () => {
    expect(c.html).not.toMatch(/<img|<script/i);
  });

  it("escapa un enlace malicioso", () => {
    const m = plantillaRecuperacion('https://x.mx/"><script>alert(1)</script>');
    expect(m.html).not.toContain("<script>");
  });
});
