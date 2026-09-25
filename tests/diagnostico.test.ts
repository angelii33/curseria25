import { describe, expect, it } from "vitest";
import { PREGUNTAS, calcularPerfil, completas, instruccionParaIA, perfilEnTexto, type Respuestas } from "@/lib/diagnostico";
import { revisarResultado } from "@/lib/escalera";

const base: Respuestas = {
  experiencia: ["aveces"], habilidades: ["disenar", "escribir"], horas: ["5"], presupuesto: ["300"],
  audiencia: ["no"], contactos: ["algunos"], prefiere: ["servicio"], sector: ["restaurantes"],
  disfruta: ["disenar"], objetivo: ["extra"],
};

describe("diagnóstico de monetización", () => {
  it("tiene las 10 preguntas del blueprint", () => expect(PREGUNTAS).toHaveLength(10));

  it("solo da perfil con todo contestado", () => {
    expect(completas(base)).toBe(true);
    expect(completas({ ...base, horas: [] })).toBe(false);
  });

  it("el caso de Daniela (diseñadora, contactos, prefiere servicio) sale en Servicios con IA para restaurantes", () => {
    const p = calcularPerfil(base);
    expect(p.ruta.modelo).toBe("servicios");
    expect(p.ruta.idea).toContain("restaurantes");
    expect(p.ruta.razones.length).toBeGreaterThan(0);
  });

  it("técnico con tiempo que prefiere sistemas no sale en servicios", () => {
    const p = calcularPerfil({ ...base, experiencia: ["diario"], habilidades: ["tecnologia"], horas: ["13"], presupuesto: ["1001"], prefiere: ["sistema"], disfruta: ["tecnico"], contactos: ["ninguno"] });
    expect(["automatizacion", "software"]).toContain(p.ruta.modelo);
  });

  it("con audiencia grande y preferencia por producto, recomienda productos", () => {
    const p = calcularPerfil({ ...base, audiencia: ["grande"], prefiere: ["producto"], contactos: ["ninguno"] });
    expect(p.ruta.modelo).toBe("productos");
  });

  it("siempre ordena los cinco modelos y nunca promete ingresos", () => {
    const p = calcularPerfil(base);
    expect(p.ranking).toHaveLength(5);
    // El perfil no pone cifras de dinero (la instrucción sí repite el
    // presupuesto que el alumno contestó, eso es suyo).
    expect(perfilEnTexto(p)).not.toMatch(/garantiz|ganarás|\$\d/i);
    expect(instruccionParaIA(base, p)).not.toMatch(/garantiz|ganarás/i);
    expect(instruccionParaIA(base, p)).toContain("No prometas ingresos");
  });

  it("sin contactos, la primera misión es buscarlos", () => {
    expect(calcularPerfil({ ...base, contactos: ["ninguno"] }).primeraMision).toMatch(/Google Maps/);
  });
});

describe("revisión de la frase de resultado", () => {
  const malos = (f: string) => revisarResultado(f).filter((r) => !r.ok).length;
  it("aprueba un resultado concreto", () =>
    expect(malos("Para restaurantes: publicar tres veces por semana sin pensar qué subir.")).toBe(0));
  it("marca la IA, las palabras vagas y las promesas", () => {
    expect(malos("Publicaciones con IA")).toBe(1);
    expect(malos("Para tiendas: optimizar su presencia")).toBe(1);
    expect(malos("Para tiendas: duplicar sus ventas")).toBe(1);
  });
});
