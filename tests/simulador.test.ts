import { describe, expect, it } from "vitest";
import { AREAS, ESCENARIOS, total } from "@/lib/simulador";

describe("simulador de objeciones", () => {
  it("tiene los 8 perfiles del blueprint, sin repetir", () => {
    expect(ESCENARIOS).toHaveLength(8);
    expect(new Set(ESCENARIOS.map((e) => e.id)).size).toBe(8);
  });

  it("cada escenario: 3 respuestas calificadas de 1 a 10 en las 5 áreas, con comentario", () => {
    for (const e of ESCENARIOS) {
      expect(e.respuestas, e.id).toHaveLength(3);
      for (const r of e.respuestas) {
        for (const a of AREAS) {
          expect(r.calificacion[a.clave], `${e.id}/${a.clave}`).toBeGreaterThanOrEqual(1);
          expect(r.calificacion[a.clave], `${e.id}/${a.clave}`).toBeLessThanOrEqual(10);
        }
        expect(r.comentario.length, e.id).toBeGreaterThan(40);
      }
    }
  });

  it("la mejor respuesta tiene la calificación total más alta", () => {
    for (const e of ESCENARIOS) {
      const mejor = total(e.respuestas[e.mejor].calificacion);
      e.respuestas.forEach((r, i) => {
        if (i !== e.mejor) expect(total(r.calificacion), e.id).toBeLessThan(mejor);
      });
    }
  });

  it("la mejor respuesta no está siempre en la misma posición", () => {
    expect(new Set(ESCENARIOS.map((e) => e.mejor)).size).toBeGreaterThan(1);
  });
});
