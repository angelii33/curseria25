import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Orígenes remotos permitidos para next/image. Es una lista blanca:
    // nada pasa sin permiso explícito.
    remotePatterns: [
      {
        // Bucket público de portadas en Supabase Storage — el destino
        // definitivo de las fotografías.
        protocol: "https",
        hostname: "ppcjjmejawxjlfblbudt.supabase.co",
        pathname: "/storage/v1/object/public/portadas/**",
      },
      {
        // PROVISIONAL: las portadas recién generadas viven en el CDN de
        // Gamma. Vercel las descarga, optimiza y cachea del lado del
        // servidor, así que el teléfono nunca pega contra ese CDN: recibe
        // un WebP ya reducido al tamaño que pidió. Se quita en cuanto las
        // imágenes estén copiadas al bucket de arriba.
        protocol: "https",
        hostname: "cdn.gamma.app",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
