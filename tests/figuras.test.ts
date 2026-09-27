import { describe, expect, it } from "vitest";
import { conFiguras, figuraHtml, FIGURAS, FIGURAS_POR_LECCION } from "@/lib/figuras";
import { md } from "@/lib/md";

describe("ilustraciones de lección", () => {
  it("cada lección apunta a una figura que existe", () => {
    for (const lista of Object.values(FIGURAS_POR_LECCION))
      for (const { id } of lista) expect(FIGURAS[id], id).toBeDefined();
  });
  it("se insertan antes del encabezado y se dibujan con título accesible y pie", () => {
    const texto = "## Uno\n\nTexto.\n\n## La verificación: tres caminos\n\nMás.";
    const html = md(conFiguras(texto, "tu-negocio-en-google/1/1"));
    expect(html).toContain('<figure class="md-figura">');
    expect(html).toContain('role="img"');
    expect(html).toContain("<title");
    expect(html).toContain("<figcaption>");
    expect(html.indexOf("md-figura")).toBeLessThan(html.indexOf("La verificación"));
  });
  it("si el encabezado no está, la lección queda igual", () => {
    const texto = "## Otro título\n\nTexto.";
    expect(conFiguras(texto, "tu-negocio-en-google/1/1")).toBe(texto);
    expect(conFiguras(texto, "curso/9/9")).toBe(texto);
  });
  it("una marca desconocida no se convierte en figura", () => {
    expect(figuraHtml("@@figura:no-existe@@")).toBeNull();
    expect(md("@@figura:no-existe@@")).not.toContain("md-figura");
  });
  it("los textos de las figuras van escapados", () => {
    for (const f of Object.values(FIGURAS)) expect(f.cuerpo).not.toMatch(/<script|on\w+=/i);
  });
});
