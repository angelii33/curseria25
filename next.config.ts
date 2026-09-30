import type { NextConfig } from "next";

// Cabeceras de endurecimiento para todas las respuestas. No incluyen una
// CSP completa (Mercado Pago, Supabase y la analítica de Vercel la harían
// frágil); solo impiden que otro sitio incruste las páginas en un marco,
// que el navegador adivine tipos de archivo y que la URL completa (con
// parámetros) viaje a otros dominios.
const SEGURIDAD = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SEGURIDAD }];
  },
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
    ],
  },
};

export default nextConfig;
