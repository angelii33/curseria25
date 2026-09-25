import type { MetadataRoute } from "next";
import { URL_SITIO } from "@/lib/sitio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/mi-aprendizaje", "/mi-taller", "/entrar", "/compra", "/api", "/auth"] },
    sitemap: `${URL_SITIO}/sitemap.xml`,
  };
}
