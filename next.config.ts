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
    ],
  },
};

export default nextConfig;
