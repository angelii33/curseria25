/** Solo rutas internas. Un campo oculto del formulario o un parámetro de la
 *  URL lo puede editar cualquiera: sin esto, `redirect()` o un enlace
 *  servirían de trampolín a otro sitio. */
export function rutaInterna(ruta: string | null | undefined, porDefecto = "/"): string {
  return typeof ruta === "string" && ruta.startsWith("/") && !ruta.startsWith("//") && !ruta.includes("\\")
    ? ruta
    : porDefecto;
}

/** Añade un parámetro a una ruta interna respetando su «#ancla». */
export function conParametro(ruta: string, param: string) {
  const [camino, ancla] = ruta.split("#");
  return `${camino}${camino.includes("?") ? "&" : "?"}${param}${ancla ? `#${ancla}` : ""}`;
}
