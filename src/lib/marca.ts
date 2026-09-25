/**
 * Fuente única de la identidad de marca.
 *
 * Nada en la interfaz debe escribir el nombre, el eslogan o la descripción
 * corta directamente: todo importa de aquí. Cambiar de marca —o revertir a
 * una anterior— es editar estos cuatro valores, no perseguirlos por ocho
 * archivos.
 *
 * Historial: "Taller de Resultados" → "Listo" → "CurserIA" (con logotipo
 * propio en public/marca). Cada cambio fue por instrucción explícita.
 */
export const MARCA = {
  nombre: "CurserIA",
  /** Cómo se pinta el nombre en el logotipo: «Curser» verde, «IA» naranja. */
  partes: ["Curser", "IA"],
  eslogan: "Aprende · Aplica · Avanza",
  promesa: "Entras con un problema. Sales con la solución lista.",
  descripcionCorta:
    "Resuelve una cosa concreta de tu negocio y sal con esa cosa hecha: " +
    "tu ficha de Google, tu menú con link, tus cotizaciones. " +
    "Para dueños de negocio en México.",
} as const;
