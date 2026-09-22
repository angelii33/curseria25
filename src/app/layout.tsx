import { Analytics } from "@vercel/analytics/next";
// ============================================================================
// LISTO — "La marca de lo que ya quedó hecho"
// Destino: src/app/layout.tsx
// ----------------------------------------------------------------------------
// next/font descarga y sirve las fuentes DESDE TU PROPIO DOMINIO en build time.
// No hay petición a fonts.googleapis.com en runtime: cero salto de red de
// terceros, cero CLS, mejor LCP en conexiones móviles mexicanas.
// ============================================================================

import type { Metadata, Viewport } from "next";
import { Archivo, Newsreader } from "next/font/google";
import "./globals.css";
import { MARCA } from "@/lib/marca";
import { URL_SITIO } from "@/lib/sitio";

// Eje de ancho variable (wdth 62–125). Es lo que habilita la regla de los
// tres anchos del Design System: 118 rótulo / 100 interfaz / 88 folio.
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  weight: "variable",
  display: "swap",
  variable: "--fuente-titular",
});

// Eje de tamaño óptico real (opsz 6–72). Corrige el grosor del asta según
// el tamaño de composición. Es la razón por la que el texto largo cansa menos.
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  weight: "variable",
  display: "swap",
  variable: "--fuente-cuerpo",
});

export const metadata: Metadata = {
  // Cada página pone su título; la plantilla le agrega la marca. La Home
  // usa el título por defecto: marca + promesa.
  title: {
    default: `${MARCA.nombre} — ${MARCA.promesa}`,
    template: `%s · ${MARCA.nombre}`,
  },
  description: MARCA.descripcionCorta,
  applicationName: MARCA.nombre,
  manifest: "/manifest.json",
  // Sin esto, un link compartido por WhatsApp se ve como texto plano.
  // metadataBase permite que las rutas relativas de las imágenes OG
  // (generadas por opengraph-image.tsx) se resuelvan a URL absolutas.
  metadataBase: new URL(URL_SITIO),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: MARCA.nombre,
    title: `${MARCA.nombre} — ${MARCA.promesa}`,
    description: MARCA.descripcionCorta,
  },
  twitter: {
    card: "summary_large_image",
    title: `${MARCA.nombre} — ${MARCA.promesa}`,
    description: MARCA.descripcionCorta,
  },
};

export const viewport: Viewport = {
  themeColor: "#F2EEE4", // papel — la barra del navegador móvil también es papel
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-MX" className={`${archivo.variable} ${newsreader.variable}`}>
      <body>
        {children}
        {/* Visitas y conversiones anónimas, sin cookies. Se activa en el
            panel de Vercel (Analytics); si no está activado, no hace nada. */}
        <Analytics />
      </body>
    </html>
  );
}
