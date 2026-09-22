/**
 * Fuente única de la identidad de marca.
 *
 * Nada en la interfaz debe escribir el nombre, el eslogan o la descripción
 * corta directamente: todo importa de aquí. Cambiar de marca —o revertir a
 * una anterior— es editar estos cuatro valores, no perseguirlos por ocho
 * archivos.
 *
 * Historial: el proyecto se llamó "Taller de Resultados" y se renombró a
 * "Listo" por instrucción explícita. Si hace falta revertir, es esta línea.
 */
export const MARCA = {
  nombre: "Listo",
  eslogan: "La marca de lo que ya quedó hecho.",
  promesa: "Entras con un problema. Sales con la solución lista.",
  descripcionCorta:
    "Resuelve una cosa concreta de tu negocio y sal con esa cosa hecha: " +
    "tu ficha de Google, tu menú con link, tus cotizaciones. " +
    "Para dueños de negocio en México.",
} as const;
