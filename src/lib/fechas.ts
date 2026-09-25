// Fechas dichas como las diría una persona, en hora de la Ciudad de México.

const ZONA = "America/Mexico_City";
const dia = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(d);

/** «hoy», «ayer», «hace 3 días», «hace 2 semanas»… */
export function haceCuanto(fecha: string | Date, ahora: Date = new Date()): string {
  const a = new Date(`${dia(new Date(fecha))}T00:00:00Z`).getTime();
  const b = new Date(`${dia(ahora)}T00:00:00Z`).getTime();
  const dias = Math.max(0, Math.round((b - a) / 86_400_000));
  if (dias === 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 14) return `hace ${dias} días`;
  if (dias < 60) return `hace ${Math.round(dias / 7)} semanas`;
  return `hace ${Math.round(dias / 30)} meses`;
}
