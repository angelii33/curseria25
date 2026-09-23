import { clienteServidor } from "./supabase/server";

// XP, nivel, insignias y racha, leídos de la base (RLS: cada quien lo suyo).
// Los umbrales son los de public.level_for_xp; se repiten aquí solo para
// decir cuánto falta al siguiente nivel.

const UMBRALES = [0, 250, 750, 1500, 3000, 5000, 8000];

export function nivelDe(xp: number) {
  let nivel = 1;
  UMBRALES.forEach((u, i) => {
    if (xp >= u) nivel = i + 1;
  });
  const siguiente = UMBRALES[nivel] ?? null;
  const base = UMBRALES[nivel - 1];
  return {
    nivel,
    siguiente,
    faltan: siguiente === null ? 0 : siguiente - xp,
    pct: siguiente === null ? 100 : Math.round(((xp - base) / (siguiente - base)) * 100),
  };
}

/** Días seguidos (hasta hoy o ayer) con al menos una lección completada. */
export function racha(fechas: string[], hoy = new Date()): number {
  // Días del calendario de México, no de UTC: una lección a las 11 p. m.
  // cuenta para ese día.
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" });
  const dia = (d: Date) => fmt.format(d);
  const dias = new Set(fechas.map((f) => dia(new Date(f))));
  const cursor = new Date(hoy);
  if (!dias.has(dia(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let n = 0;
  while (dias.has(dia(cursor))) {
    n++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return n;
}

export type Insignia = { code: string; titulo: string; descripcion: string; ganada: boolean; fecha: string | null };

export async function misLogros() {
  const sb = await clienteServidor();
  const [{ data: xp }, { data: todas }, { data: mias }, { data: progreso }] = await Promise.all([
    sb.from("xp_events").select("xp_amount"),
    sb.from("badges").select("id,code,title,description,sort_order").order("sort_order"),
    sb.from("user_badges").select("badge_id,awarded_at"),
    sb.from("lesson_progress").select("completed_at").eq("status", "completed"),
  ]);
  const total = (xp ?? []).reduce((s, e) => s + (e.xp_amount as number), 0);
  const ganadas = new Map((mias ?? []).map((b) => [b.badge_id as string, b.awarded_at as string]));
  const insignias: Insignia[] = (todas ?? [])
    // «Maestro de una ruta» depende de rutas que la app aún no muestra.
    .filter((b) => b.code !== "path_master")
    .map((b) => ({
      code: b.code as string,
      titulo: b.title as string,
      descripcion: b.description as string,
      ganada: ganadas.has(b.id as string),
      fecha: ganadas.get(b.id as string) ?? null,
    }));
  const fechas = (progreso ?? []).map((p) => p.completed_at as string).filter(Boolean);
  return { xp: total, ...nivelDe(total), insignias, racha: racha(fechas), lecciones: fechas.length };
}

export async function tituloInsignia(code: string) {
  if (!/^[a-z_]{3,40}$/.test(code)) return null;
  const sb = await clienteServidor();
  const { data } = await sb.from("badges").select("title").eq("code", code).maybeSingle();
  return (data?.title as string | undefined) ?? null;
}
