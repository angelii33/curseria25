/** URL pública del sitio. Se puede fijar con NEXT_PUBLIC_SITE_URL al cambiar
 *  de dominio; si no, cae al despliegue actual de Vercel. Es la base de las
 *  URL canónicas, el sitemap y las imágenes al compartir. */
export const URL_SITIO = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://app-cursos-mu.vercel.app").replace(/\/$/, "");
