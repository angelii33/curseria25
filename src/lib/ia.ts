import Anthropic from "@anthropic-ai/sdk";
import { clienteAdmin } from "./supabase/admin";

// Revisión con IA del borrador que el alumno escribe en el cuaderno.
// Solo existe si hay ANTHROPIC_API_KEY en el servidor; la llave nunca sale
// de aquí. Límite por persona y día para que el costo sea predecible.

export const LIMITE_DIARIO = 10;

export function iaLista() {
  return Boolean(process.env.ANTHROPIC_API_KEY) && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const SISTEMA = `Eres el revisor de CurserIA, una plataforma de cursos prácticos para dueños de pequeños negocios en México.
El alumno te manda el borrador que escribió para el ejercicio de una lección (un mensaje de WhatsApp, un texto para Google, un menú, una cotización, etc.).
Tu trabajo: ayudarle a dejarlo listo para usar hoy en su negocio.

Responde en español de México, tuteando, cálido y directo, sin tecnicismos. Formato de texto plano, exactamente con estas tres partes y sus títulos:
Lo que ya funciona:
(1 o 2 frases concretas)
Para mejorarlo:
(máximo 3 viñetas con "- ", cada una una acción específica)
Versión sugerida:
(el texto reescrito, listo para copiar, respetando sus datos reales: nombre, precios, horarios. No inventes datos que no dio; si falta uno, déjalo entre corchetes, por ejemplo [tu horario].)

Si el borrador no tiene que ver con el ejercicio o está vacío, dilo con amabilidad y explica en una frase qué debería escribir.`;

/** Cuántas revisiones lleva hoy la persona (se cuentan en analytics_events). */
async function usadasHoy(userId: string) {
  const admin = clienteAdmin();
  if (!admin) return LIMITE_DIARIO;
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event_name", "ia_revision")
    .gte("occurred_at", desde);
  return count ?? 0;
}

export async function revisarConIA(p: {
  userId: string;
  leccion: string;
  resultado: string | null;
  borrador: string;
}): Promise<{ texto?: string; error?: string; restantes?: number }> {
  if (!iaLista()) return { error: "La revisión con IA no está disponible ahora." };
  const usadas = await usadasHoy(p.userId);
  if (usadas >= LIMITE_DIARIO) {
    return { error: `Ya usaste tus ${LIMITE_DIARIO} revisiones de hoy. Mañana tienes más.`, restantes: 0 };
  }

  const client = new Anthropic();
  try {
    const r = await client.beta.messages.create({
      model: "claude-opus-5",
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SISTEMA,
      messages: [
        {
          role: "user",
          content:
            `Lección: ${p.leccion}\n` +
            (p.resultado ? `Resultado que busca la lección: ${p.resultado}\n` : "") +
            `\nBorrador del alumno:\n<borrador>\n${p.borrador}\n</borrador>`,
        },
      ],
    });

    if (r.stop_reason === "refusal") return { error: "No pudimos revisar este texto. Intenta reformularlo." };
    const texto = r.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    if (!texto) return { error: "La revisión llegó vacía. Intenta de nuevo." };

    await clienteAdmin()?.from("analytics_events").insert({
      event_name: "ia_revision",
      user_id: p.userId,
      properties: { tokens_salida: r.usage.output_tokens },
    });
    return { texto, restantes: LIMITE_DIARIO - usadas - 1 };
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return { error: "Hay mucha demanda. Intenta en un minuto." };
    if (e instanceof Anthropic.APIError) {
      console.error("[ia]", e.status, e.message);
      return { error: "No se pudo revisar ahora. Intenta en un momento." };
    }
    throw e;
  }
}
