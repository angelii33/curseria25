import { clienteServidor } from "./supabase/server";

/** Certificado público por su código (la RPC solo devuelve lo verificable). */
export async function getCertificado(codigo: string) {
  if (!/^[\w-]{4,64}$/.test(codigo)) return null;
  const sb = await clienteServidor();
  const { data, error } = await sb.rpc("verify_certificate", { check_code: codigo });
  if (error) return null;
  const fila = Array.isArray(data) ? data[0] : data;
  if (!fila) return null;
  return fila as { course_title: string; issued_at: string; verification_code: string };
}

export const fechaLarga = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
