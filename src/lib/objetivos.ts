import { clienteServidor } from "./supabase/server";

// Objetivo inicial del alumno (tabla user_goals, RLS: cada quien el suyo).
// Los valores válidos los fija la base; aquí solo se usan los que tienen
// cursos que los resuelven, en el orden en que conviene tomarlos.

export const OBJETIVOS = {
  clients: {
    titulo: "Que me encuentren más clientes",
    detalle: "Aparecer en Google y en redes cuando te buscan.",
    cursos: ["tu-negocio-en-google", "un-mes-de-publicaciones"],
  },
  messaging: {
    titulo: "Atender rápido por WhatsApp",
    detalle: "Contestar en segundos y mandar tu menú o catálogo con un link.",
    cursos: ["whatsapp-que-contesta-solo", "menu-con-link"],
  },
  quoting: {
    titulo: "Cotizar y cerrar más ventas",
    detalle: "Cotizaciones profesionales, seguimiento y cierre sin regatear.",
    cursos: ["cotiza-en-5-minutos", "ventas-con-ia"],
  },
} as const;

export type Objetivo = keyof typeof OBJETIVOS;
export const esObjetivo = (v: unknown): v is Objetivo => typeof v === "string" && v in OBJETIVOS;

export async function miObjetivo(): Promise<Objetivo | null> {
  const sb = await clienteServidor();
  const { data } = await sb.from("user_goals").select("priority").maybeSingle();
  return esObjetivo(data?.priority) ? data.priority : null;
}
