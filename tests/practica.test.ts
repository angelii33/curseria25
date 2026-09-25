import { describe, expect, it } from "vitest";
import { barajar, bancoCompleto, practicaDe } from "@/lib/practica";

// Las 39 lecciones publicadas (6 cursos). Si se publica una lección nueva
// sin práctica, esta prueba lo dice.
const PUBLICADAS: Record<string, string[]> = {
  "tu-negocio-en-google": ["1/1", "1/2", "1/3", "1/4", "1/5"],
  "whatsapp-que-contesta-solo": ["1/1", "1/2", "1/3", "1/4", "1/5"],
  "menu-con-link": ["1/1", "1/2", "1/3", "1/4", "1/5"],
  "un-mes-de-publicaciones": ["1/1", "1/2", "1/3", "1/4", "1/5"],
  "cotiza-en-5-minutos": ["1/1", "1/2", "1/3", "1/4", "1/5"],
  "ventas-con-ia": ["1/1", "1/2", "2/1", "2/2", "2/3", "2/4", "3/1", "3/2", "3/3", "3/4", "4/1", "4/2", "4/3", "4/4"],
  // Monetiza IA (borrador hasta publicarse): 11 fases, 35 misiones.
  "monetiza-ia": [1, 3, 3, 5, 4, 3, 4, 4, 4, 3, 1].flatMap((n, m) =>
    Array.from({ length: n }, (_, l) => `${m + 1}/${l + 1}`)),
};

describe("banco de práctica", () => {
  it("cubre todas las lecciones publicadas con al menos 3 preguntas", () => {
    for (const [curso, lecciones] of Object.entries(PUBLICADAS)) {
      for (const k of lecciones) {
        const [m, l] = k.split("/").map(Number);
        const p = practicaDe(curso, m, l);
        expect(p, `${curso}/${k}`).not.toBeNull();
        expect(p!.preguntas.length, `${curso}/${k}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("cada pregunta es válida: respuesta dentro de rango, opciones distintas y explicación", () => {
    for (const b of bancoCompleto()) {
      for (const q of b.preguntas) {
        const donde = `${b.clave}: ${q.texto}`;
        expect(q.opciones.length, donde).toBeGreaterThanOrEqual(3);
        expect(q.correcta, donde).toBeGreaterThanOrEqual(0);
        expect(q.correcta, donde).toBeLessThan(q.opciones.length);
        expect(new Set(q.opciones).size, donde).toBe(q.opciones.length);
        expect(q.explicacion.length, donde).toBeGreaterThan(30);
      }
    }
  });

  it("no hay preguntas repetidas entre lecciones", () => {
    const textos = bancoCompleto().flatMap((b) => b.preguntas.map((q) => q.texto));
    expect(new Set(textos).size).toBe(textos.length);
  });

  it("la respuesta correcta no se concentra en una posición", () => {
    const pos = bancoCompleto().flatMap((b) => b.preguntas.map((q) => q.correcta));
    const cuenta = [0, 1, 2].map((i) => pos.filter((x) => x === i).length);
    for (const c of cuenta) expect(c / pos.length).toBeLessThan(0.5);
  });

  it("barajar conserva la respuesta correcta y es estable", () => {
    const q = { texto: "¿Cuál?", opciones: ["a", "b", "c"], correcta: 1, explicacion: "x".repeat(40) };
    const r = barajar(q);
    expect(r.opciones[r.correcta]).toBe("b");
    expect(barajar(q)).toEqual(r);
    expect([...r.opciones].sort()).toEqual(["a", "b", "c"]);
  });
});
