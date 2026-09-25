import { after } from "next/server";
import { clienteServidor } from "./supabase/server";

// Eventos del embudo en analytics_events (RLS: cada quien inserta los suyos,
// o anónimos con user_id nulo). Nunca rompe la acción que lo llama.

export type Evento =
  | "checkout_iniciado"
  | "suscripcion_iniciada"
  | "inscripcion"
  | "leccion_completada"
  | "correo_capturado"
  | "opinion_enviada"
  | "certificado_emitido"
  | "objetivo_elegido"
  | "lesson_started";

export async function registrar(evento: Evento, propiedades: Record<string, string | number | boolean | null> = {}) {
  try {
    const sb = await clienteServidor();
    const { data } = await sb.auth.getUser();
    await sb.from("analytics_events").insert({
      event_name: evento,
      user_id: data.user?.id ?? null,
      properties: propiedades,
    });
  } catch {
    // Medir nunca es más importante que lo que el usuario está haciendo.
  }
}

/**
 * Para páginas (Server Components): se guarda DESPUÉS de mandar la respuesta,
 * así medir no retrasa la lección. Las galletas se leen antes, dentro de la
 * petición, como exige `after`. Sirve para ver dónde se queda la gente:
 * lecciones abiertas contra lecciones terminadas.
 */
export async function registrarAlResponder(
  evento: Evento,
  usuarioId: string | null,
  propiedades: Record<string, string | number | boolean | null> = {}
) {
  const sb = await clienteServidor();
  after(async () => {
    try {
      await sb.from("analytics_events").insert({ event_name: evento, user_id: usuarioId, properties: propiedades });
    } catch {
      // Medir nunca es más importante que lo que el usuario está haciendo.
    }
  });
}
