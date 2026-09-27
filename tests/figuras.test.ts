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

describe("figuras guardadas en la lección (```figura)", () => {
  const bloque = (cuerpo: string) => "Texto.\n\n```figura\n360x100\nUna figura\nSu pie\n" + cuerpo + "\n```\n\nMás.";
  it("dibuja un cuerpo válido con título y pie", () => {
    const html = md(bloque('<rect x="0" y="0" width="10" height="10" class="fg-musgo"/><text x="4" y="8" class="fg-t">Hola &amp; adiós</text>'));
    expect(html).toContain('<figure class="md-figura">');
    expect(html).toContain("Una figura");
    expect(html).toContain("<figcaption>Su pie</figcaption>");
    expect(html).toContain("Hola &amp; adiós");
  });
  it("rechaza lo peligroso: scripts, eventos, enlaces, estilos y clases ajenas", () => {
    for (const malo of [
      "<script>alert(1)</script>",
      '<rect onclick="x()" class="fg-musgo"/>',
      '<a href="https://x.com"><text>x</text></a>',
      '<rect style="fill:red"/>',
      '<rect class="boton"/>',
      '<image href="x.png"/>',
      '<rect fill="url(https://x)"/>',
      '<foreignObject><div>x</div></foreignObject>',
      '<text class="fg-t">sin cerrar',
    ]) expect(md(bloque(malo)), malo).not.toContain("md-figura");
  });
  it("un bloque de código normal sigue siendo código", () => {
    expect(md("```\n<rect/>\n```")).toContain("<pre>");
  });
});
