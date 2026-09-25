import { describe, expect, it } from "vitest";
import { OBJETIVOS, esObjetivo, objetivosDisponibles } from "@/lib/objetivos";

describe("objetivos iniciales", () => {
  it("solo ofrece objetivos con algún curso publicado", () => {
    expect(objetivosDisponibles(["tu-negocio-en-google"])).toEqual(["clients"]);
    expect(objetivosDisponibles(["cotiza-en-5-minutos", "monetiza-ia"])).toEqual(["quoting", "monetizing"]);
    expect(objetivosDisponibles([])).toEqual([]);
  });

  it("Ganar dinero con IA lleva a Monetiza IA y es un valor válido", () => {
    expect(OBJETIVOS.monetizing.cursos).toContain("monetiza-ia");
    expect(esObjetivo("monetizing")).toBe(true);
    expect(esObjetivo("otro")).toBe(false);
  });
});
