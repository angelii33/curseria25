import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const URL_SUPABASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ppcjjmejawxjlfblbudt.supabase.co";
export const CLAVE_PUBLICA =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_OZiGkBUbrDvp4NltADfITw_oHzWweJk";

/**
 * Cliente de servidor con la sesión del usuario.
 * Todo lo que consulte pasa por RLS con SU identidad: si no tiene acceso al
 * curso, la base simplemente no devuelve el contenido. El bloqueo no lo hace
 * la interfaz.
 */
export async function clienteServidor() {
  const almacen = await cookies();
  return createServerClient(URL_SUPABASE, CLAVE_PUBLICA, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll: (galletas) => {
        try {
          galletas.forEach(({ name, value, options }) =>
            almacen.set(name, value, options)
          );
        } catch {
          // En un Server Component no se pueden escribir cookies.
          // El middleware ya refresca la sesión, así que es seguro ignorarlo.
        }
      },
    },
  });
}

export async function usuarioActual() {
  const sb = await clienteServidor();
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}
