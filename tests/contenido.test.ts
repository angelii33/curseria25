import { describe, expect, it } from "vitest";
import { esencial, md, secciones } from "@/lib/md";
import { bancoCompleto } from "@/lib/practica";

describe("md: render de lecciones", () => {
  it("escapa HTML del contenido", () => {
    const html = md("Hola <script>alert(1)</script>");
    expect(html).not.toContain("<script>");
  });
  it("solo enlaza http(s) y rutas internas; «//otro-sitio» no pasa por interna", () => {
    expect(md("[ok](/cursos)")).toContain('<a href="/cursos">');
    expect(md("[x](//malo.com)")).not.toContain("<a ");
    expect(md("[x](javascript:alert(1))")).not.toContain("<a ");
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

describe("md: «Si algo no sale» plegado", () => {
  it("pliega la sección de problemas y cierra bien el HTML, esté donde esté", () => {
    const enMedio = md("## Paso\n\nHaz esto.\n\n## Si algo no sale\n\n- Si no aparece → búscalo.\n\n## Mini reto\n\nHazlo.");
    expect(enMedio).toContain('<details class="md-plegable"><summary>');
    expect(enMedio.match(/<details/g)?.length).toBe(enMedio.match(/<\/details>/g)?.length);
    expect(enMedio.indexOf("</details>")).toBeLessThan(enMedio.indexOf("Mini reto"));
    const alFinal = md("## Paso\n\nHaz esto.\n\n## Si algo no sale\n\nRevisa.");
    expect(alFinal.trim().endsWith("</details></section>")).toBe(true);
  });
  it("el título queda fuera del plegado: el índice sigue llevando a él", () => {
    const h = md("## Si algo no sale\n\nRevisa.");
    expect(h.indexOf("<h2")).toBeLessThan(h.indexOf("<details"));
  });
});
