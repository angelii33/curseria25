import { CLAVE_PUBLICA, URL_SUPABASE } from "./server";

/**
 * ¿Está activado «Entrar con Google» en Supabase? Se pregunta a la API
 * pública de ajustes (la misma que usa cualquier cliente) y se guarda 5
 * minutos. Así el botón aparece solo cuando ya funciona: nunca se manda a
 * nadie a una pantalla de error de un proveedor sin configurar.
 */
export async function googleActivo(): Promise<boolean> {
  try {
    const r = await fetch(`${URL_SUPABASE}/auth/v1/settings`, {
      headers: { apikey: CLAVE_PUBLICA },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) return false;
    const ajustes = (await r.json()) as { external?: Record<string, boolean> };
    return ajustes.external?.google === true;
  } catch {
    return false;
  }
}
