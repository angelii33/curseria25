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
  // Para quien aún no tiene negocio. Solo aparece cuando su curso está
  // publicado (ver objetivosDisponibles).
  monetizing: {
    titulo: "Ganar dinero con IA",
    detalle: "Elegir qué vender, armar tu oferta y buscar tus primeros clientes.",
    cursos: ["monetiza-ia"],
  },
} as const;

/** Lo que tiene al terminar la primera lección gratis de cada objetivo. */
export const LOGRO_PRIMER_PASO: Partial<Record<keyof typeof OBJETIVOS, string>> = {
  monetizing: "Al terminarla ya tienes tu perfil de monetización y tu primera misión.",
};

export type Objetivo = keyof typeof OBJETIVOS;
export const esObjetivo = (v: unknown): v is Objetivo => typeof v === "string" && v in OBJETIVOS;

/** Solo los objetivos con al menos un curso publicado: elegir uno nunca
 *  debe llevar a «no hay por dónde empezar». */
export function objetivosDisponibles(publicados: string[]): Objetivo[] {
  const hay = new Set(publicados);
  return (Object.keys(OBJETIVOS) as Objetivo[]).filter((k) => OBJETIVOS[k].cursos.some((s) => hay.has(s)));
}

export async function miObjetivo(): Promise<Objetivo | null> {
  const sb = await clienteServidor();
  const { data } = await sb.from("user_goals").select("priority").maybeSingle();
  return esObjetivo(data?.priority) ? data.priority : null;
}
