import { describe, expect, it } from "vitest";
import { conParametro, rutaInterna } from "@/lib/rutas";

describe("rutaInterna: nunca redirige fuera del sitio", () => {
  it("acepta rutas internas", () => {
    expect(rutaInterna("/cursos/x/1/1")).toBe("/cursos/x/1/1");
    expect(rutaInterna("/precios#comprar")).toBe("/precios#comprar");
  });
  it.each(["https://malo.com", "//malo.com", "/\\malo.com", "javascript:alert(1)", "", null, undefined])(
    "rechaza %s",
    (r) => expect(rutaInterna(r as string, "/inicio")).toBe("/inicio")
  );
});

describe("conParametro", () => {
  it("respeta el ancla y los parámetros previos", () => {
    expect(conParametro("/cursos/x#comprar", "acceso=pendiente")).toBe("/cursos/x?acceso=pendiente#comprar");
    expect(conParametro("/precios?a=1", "acceso=ya")).toBe("/precios?a=1&acceso=ya");
  });
});
