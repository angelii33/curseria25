/** URL pública del sitio. Se fija con NEXT_PUBLIC_SITE_URL al tener dominio
 *  propio; si no, se usa el dominio de producción que Vercel asigna al
 *  proyecto (VERCEL_PROJECT_PRODUCTION_URL, solo en servidor) y, al final,
 *  el despliegue original. Es la base de las URL canónicas, el sitemap, las
 *  imágenes al compartir y los avisos de Mercado Pago. */
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const URL_SITIO = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (vercel ? `https://${vercel}` : "https://app-cursos-mu.vercel.app")
).replace(/\/$/, "");
