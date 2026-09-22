import type { MetadataRoute } from "next";
import { getCatalogo } from "@/lib/catalogo";
import { URL_SITIO } from "@/lib/sitio";

// El mapa del sitio para buscadores: la portada, cada curso publicado y su
// lección abierta (la única parte del contenido que un buscador puede leer).
// Se genera al pedirse, con los cursos que haya publicados en ese momento.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let cursos: Awaited<ReturnType<typeof getCatalogo>> = [];
  try {
    cursos = await getCatalogo();
  } catch {
    // Si la base no responde, al menos la portada queda en el mapa.
  }
  return [
    { url: URL_SITIO, changeFrequency: "weekly", priority: 1 },
    { url: `${URL_SITIO}/precios`, changeFrequency: "monthly", priority: 0.8 },
    ...["/terminos", "/aviso-de-privacidad", "/reembolsos"].map((r) => ({
      url: `${URL_SITIO}${r}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
    ...cursos.map((c) => ({
      url: `${URL_SITIO}/cursos/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...cursos
      .filter((c) => c.abiertaRuta)
      .map((c) => ({ url: `${URL_SITIO}${c.abiertaRuta}`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
