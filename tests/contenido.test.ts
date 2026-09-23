import { describe, expect, it } from "vitest";
import { esencial, md, secciones } from "@/lib/md";
import { bancoCompleto } from "@/lib/practica";

describe("md: render de lecciones", () => {
  it("escapa HTML del contenido", () => {
    const html = md("Hola <script>alert(1)</script>");
    expect(html).not.toContain("<script>");
  });
  it("los ids del índice coinciden con los encabezados", () => {
    const texto = "## Primera parte\n\nTexto.\n\n## Segunda parte\n\nMás.";
    const html = md(texto);
    for (const s of secciones(texto)) expect(html).toContain(`id="${s.id}"`);
  });
  it("tablas de 3+ columnas llevan etiqueta por celda para el teléfono", () => {
    const html = md("| Método | Tarda | Necesitas |\n|---|---|---|\n| Video | 1 día | Grabar |");
    expect(html).toContain('data-etiqueta="Tarda"');
    expect(html).toContain("md-tabla-ancha");
  });
});

describe("banco de práctica", () => {
  const banco = bancoCompleto();
  it("tiene preguntas", () => expect(banco.length).toBeGreaterThan(0));
  it.each(banco.map((b) => [b.clave, b]))("%s: cada pregunta tiene respuesta válida y explicación", (_c, b) => {
    for (const p of (b as (typeof banco)[number]).preguntas) {
      expect(p.opciones.length).toBeGreaterThanOrEqual(2);
      expect(p.correcta).toBeGreaterThanOrEqual(0);
      expect(p.correcta).toBeLessThan(p.opciones.length);
      expect(p.explicacion.length).toBeGreaterThan(20);
    }
  });
});

describe("esencial", () => {
  it("no inventa ideas si la lección no tiene negritas", () => {
    expect(esencial("Solo texto plano.").ideas.length).toBe(0);
  });
});

describe("md: bloques del estándar de lección", () => {
  it("dibuja un error común como ficha de problema, causa y solución", () => {
    const html = md("## Si algo no sale\n\n**Problema:** No llega el código.\n**Causa:** Google eligió otro método.\n**Solución:** Espera 24 horas y vuelve a pedirlo.");
    expect(html).toContain("md-sec-problemas");
    expect(html).toContain('class="md-error"');
    expect(html).toContain("md-error-solucion");
  });
  it("dibuja reglas «Si X → Y» como lista de decisión", () => {
    const html = md("- Si ya existe la ficha → reclámala\n- Si no existe → créala");
    expect(html).toContain('class="md-decision"');
    expect(html).toContain("md-entonces");
  });
  it("marca el mini reto y el plan después del curso", () => {
    expect(md("## Mini reto\n\nHaz algo.")).toContain("md-sec-reto");
    expect(md("## Tu plan después del curso\n\nHoy.")).toContain("md-sec-plan");
  });
});
