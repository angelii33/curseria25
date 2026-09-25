// El símbolo de CurserIA como texto SVG, para dibujarlo donde no hay CSS:
// imágenes para compartir, íconos de pestaña y de celular (next/og). Es el
// mismo trazo que src/components/logo.tsx.

export const VERDE_MARCA = "#25341F";
export const NARANJA_MARCA = "#C3652F";

export function logoSvg(verde = VERDE_MARCA, naranja = NARANJA_MARCA): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" stroke="${verde}" stroke-width="7"><circle cx="50" cy="50" r="37" stroke-dasharray="46.1 12" stroke-dashoffset="52.1"/><path d="M50 38 C44 33 36 32 29 33 V65 C37 64 44 65 50 69 C56 65 63 64 71 65 V33 C64 32 56 33 50 38" stroke-width="5.5" stroke-linejoin="round"/></g><g fill="${verde}"><rect x="46.5" y="3" width="7" height="17" rx="1"/><rect x="46.5" y="80" width="7" height="17" rx="1"/><rect x="3" y="46.5" width="17" height="7" rx="1"/><rect x="80" y="46.5" width="17" height="7" rx="1"/></g><path fill="${naranja}" stroke="${naranja}" stroke-width="2" stroke-linejoin="round" d="M66 31 L60.5 55 L55.5 49.5 L46 64 L41 60.5 L50.5 46 L44 44 Z"/></svg>`;
}

/** Como `src` de un <img>: next/og lo dibuja igual que el navegador. */
export function logoDataUri(verde?: string, naranja?: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(logoSvg(verde, naranja)).toString("base64")}`;
}

/**
 * El logotipo completo (símbolo + «CurserIA» + «Aprende · Aplica · Avanza»),
 * recortado del original. Para imágenes para compartir sobre fondo claro:
 * ahí next/og no tiene la tipografía del logotipo y dibujarla con texto
 * quedaría distinta. Proporción 915 × 232.
 */
export async function logoCompletoDataUri(): Promise<string> {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const png = await readFile(join(process.cwd(), "public/marca/curseria-logo-recortado.png"), "base64");
  return `data:image/png;base64,${png}`;
}
