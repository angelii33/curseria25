import { createClient } from "@supabase/supabase-js";
import { URL_SUPABASE } from "./server";

// Cliente con la llave de servicio. SOLO para el servidor y SOLO para lo que
// no tiene un usuario detrás: el aviso de pago de Mercado Pago. Salta RLS,
// así que nunca se usa para leer datos a petición del navegador.
//
// La llave vive en la variable de entorno SUPABASE_SERVICE_ROLE_KEY (sin
// NEXT_PUBLIC_): Next jamás la incluye en el código que llega al teléfono.

export function clienteAdmin() {
  if (typeof window !== "undefined") throw new Error("clienteAdmin solo en el servidor");
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!llave) return null;
  return createClient(URL_SUPABASE, llave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
