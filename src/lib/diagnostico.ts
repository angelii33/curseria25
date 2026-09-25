// Diagnóstico de Monetiza IA (misión gratis 1). Sin API: reglas simples y
// explicables que cruzan las 10 respuestas con los cinco modelos del curso.
// No es una predicción: es un punto de partida que la Fase 2 confirma con
// la matriz del alumno. Por eso cada puntuación guarda su razón.

export type Modelo = "servicios" | "automatizacion" | "productos" | "implementacion" | "software";

export const MODELOS: Record<Modelo, { nombre: string; idea: (sector: string) => string }> = {
  servicios: { nombre: "Servicios con IA", idea: (s) => `hacer textos, contenido o diseño para ${s} más rápido con IA` },
  automatizacion: { nombre: "Automatización", idea: (s) => `automatizar respuestas, citas o reportes de ${s}` },
  productos: { nombre: "Productos digitales", idea: (s) => `crear plantillas o guías que ${s} compre una vez y use siempre` },
  implementacion: { nombre: "Implementación para negocios", idea: (s) => `dejar la IA funcionando en ${s} y enseñarle al equipo a usarla` },
  software: { nombre: "Microproducto con IA", idea: (s) => `una herramienta pequeña que resuelva una tarea concreta de ${s}` },
};

type Opcion = { valor: string; texto: string };
export type Pregunta = { clave: string; texto: string; varias?: boolean; opciones: Opcion[] };

export const PREGUNTAS: Pregunta[] = [
  { clave: "experiencia", texto: "¿Qué tanto usas la IA hoy?", opciones: [
    { valor: "nada", texto: "Casi nada" }, { valor: "aveces", texto: "A veces" }, { valor: "diario", texto: "Todos los días" }] },
  { clave: "habilidades", texto: "¿Qué sabes hacer? (elige las que apliquen)", varias: true, opciones: [
    { valor: "escribir", texto: "Escribir" }, { valor: "disenar", texto: "Diseñar" }, { valor: "vender", texto: "Vender o atender gente" },
    { valor: "organizar", texto: "Organizar y administrar" }, { valor: "ensenar", texto: "Enseñar o explicar" },
    { valor: "tecnologia", texto: "Computación y tecnología" }, { valor: "oficio", texto: "Un oficio o profesión" }] },
  { clave: "horas", texto: "¿Cuántas horas reales por semana tienes?", opciones: [
    { valor: "2", texto: "Menos de 3" }, { valor: "5", texto: "3 a 6" }, { valor: "9", texto: "7 a 12" }, { valor: "13", texto: "Más de 12" }] },
  { clave: "presupuesto", texto: "¿Cuánto puedes pagar al mes en herramientas?", opciones: [
    { valor: "0", texto: "Nada por ahora" }, { valor: "300", texto: "Hasta $300" }, { valor: "1000", texto: "$300 a $1,000" }, { valor: "1001", texto: "Más de $1,000" }] },
  { clave: "audiencia", texto: "¿Tienes gente que te sigue?", opciones: [
    { valor: "no", texto: "No" }, { valor: "chica", texto: "Menos de 1,000" }, { valor: "grande", texto: "1,000 o más" }] },
  { clave: "contactos", texto: "¿Conoces negocios o personas que podrían comprarte?", opciones: [
    { valor: "ninguno", texto: "Ninguno" }, { valor: "algunos", texto: "1 a 5" }, { valor: "varios", texto: "6 o más" }] },
  { clave: "prefiere", texto: "¿Qué prefieres vender?", opciones: [
    { valor: "servicio", texto: "Hacer el trabajo yo" }, { valor: "producto", texto: "Crear algo una vez y venderlo muchas" },
    { valor: "sistema", texto: "Dejar algo funcionando solo" }] },
  { clave: "sector", texto: "¿Qué sector conoces por dentro?", opciones: [
    { valor: "restaurantes", texto: "Restaurantes y comida" }, { valor: "salud", texto: "Salud y belleza" },
    { valor: "inmobiliario", texto: "Bienes raíces" }, { valor: "comercio", texto: "Tiendas y comercio" },
    { valor: "educacion", texto: "Educación" }, { valor: "profesionales", texto: "Servicios profesionales" },
    { valor: "ninguno", texto: "Ninguno en especial" }] },
  { clave: "disfruta", texto: "¿Qué disfrutas hacer? (elige las que apliquen)", varias: true, opciones: [
    { valor: "escribir", texto: "Escribir" }, { valor: "disenar", texto: "Diseñar" }, { valor: "gente", texto: "Hablar con gente" },
    { valor: "organizar", texto: "Organizar" }, { valor: "tecnico", texto: "Resolver problemas técnicos" }, { valor: "ensenar", texto: "Enseñar" }] },
  { clave: "objetivo", texto: "¿Qué buscas primero?", opciones: [
    { valor: "extra", texto: "Un ingreso extra" }, { valor: "cambio", texto: "Cambiar de trabajo" }, { valor: "negocio", texto: "Crecer un negocio que ya tengo" }] },
];

export type Respuestas = Record<string, string[]>;

const SECTOR: Record<string, string> = {
  restaurantes: "restaurantes", salud: "consultorios y estéticas", inmobiliario: "inmobiliarias",
  comercio: "tiendas", educacion: "escuelas y maestros", profesionales: "despachos y profesionales independientes",
  ninguno: "negocios locales",
};

export type Perfil = {
  ranking: { modelo: Modelo; nombre: string; puntos: number; razones: string[] }[];
  ruta: { modelo: Modelo; nombre: string; idea: string; razones: string[] };
  fortalezas: string[];
  limites: string[];
  primeraMision: string;
  sector: string;
};

export function completas(r: Respuestas) {
  return PREGUNTAS.every((p) => (r[p.clave] ?? []).length > 0);
}

export function calcularPerfil(r: Respuestas): Perfil {
  const uno = (k: string) => r[k]?.[0] ?? "";
  const tiene = (k: string, v: string) => (r[k] ?? []).includes(v);
  const puntos: Record<Modelo, number> = { servicios: 0, automatizacion: 0, productos: 0, implementacion: 0, software: 0 };
  const razones: Record<Modelo, string[]> = { servicios: [], automatizacion: [], productos: [], implementacion: [], software: [] };
  const suma = (m: Modelo, n: number, razon?: string) => {
    puntos[m] += n;
    if (razon && n > 0) razones[m].push(razon);
  };

  // Preferencia: pesa más que nada, es lo que vas a hacer muchas veces.
  const pref = uno("prefiere");
  if (pref === "servicio") { suma("servicios", 3, "Prefieres hacer el trabajo tú"); suma("implementacion", 2, "Prefieres hacer el trabajo tú"); }
  if (pref === "producto") { suma("productos", 3, "Prefieres crear una vez y vender muchas"); suma("software", 1, "Prefieres crear una vez y vender muchas"); }
  if (pref === "sistema") { suma("automatizacion", 3, "Prefieres dejar cosas funcionando solas"); suma("software", 2, "Prefieres dejar cosas funcionando solas"); suma("implementacion", 1, "Prefieres dejar cosas funcionando solas"); }

  const horas = Number(uno("horas"));
  if (horas < 3) { suma("software", -2); suma("automatizacion", -1); suma("implementacion", -1); suma("servicios", 1, "Un servicio pequeño cabe en pocas horas"); }
  if (horas >= 7) { suma("software", 1, "Tienes horas para construir algo más grande"); suma("automatizacion", 1, "Tienes horas para aprender a automatizar"); }

  if (uno("presupuesto") === "0") { suma("software", -1); suma("automatizacion", -1); }

  const aud = uno("audiencia");
  if (aud === "grande") suma("productos", 3, "Ya tienes gente a quién venderle un producto");
  if (aud === "chica") suma("productos", 1, "Tienes una audiencia pequeña para empezar");
  if (aud === "no") suma("productos", -2);

  const con = uno("contactos");
  if (con === "varios") { suma("servicios", 2, "Conoces a varios posibles clientes"); suma("implementacion", 2, "Conoces a varios posibles clientes"); }
  if (con === "algunos") { suma("servicios", 1, "Conoces a algunos posibles clientes"); suma("implementacion", 1, "Conoces a algunos posibles clientes"); }
  if (con === "ninguno") suma("implementacion", -1);

  const exp = uno("experiencia");
  if (exp === "diario") { suma("automatizacion", 1, "Ya usas IA todos los días"); suma("implementacion", 1, "Ya usas IA todos los días"); suma("software", 1, "Ya usas IA todos los días"); }
  if (exp === "nada") { suma("software", -2); suma("automatizacion", -1); suma("implementacion", -1); }

  if (tiene("habilidades", "tecnologia")) { suma("automatizacion", 2, "Sabes de tecnología"); suma("software", 2, "Sabes de tecnología"); }
  if (tiene("habilidades", "escribir") || tiene("habilidades", "disenar")) { suma("servicios", 2, "Sabes escribir o diseñar"); suma("productos", 1, "Sabes escribir o diseñar"); }
  if (tiene("habilidades", "ensenar")) { suma("implementacion", 2, "Sabes enseñar"); suma("productos", 1, "Sabes enseñar"); }
  if (tiene("habilidades", "vender")) { suma("servicios", 1, "Sabes tratar con clientes"); suma("implementacion", 1, "Sabes tratar con clientes"); }
  if (tiene("habilidades", "organizar")) { suma("automatizacion", 1, "Sabes organizar procesos"); suma("implementacion", 1, "Sabes organizar procesos"); }
  if (tiene("habilidades", "oficio")) { suma("implementacion", 1, "Conoces un oficio por dentro"); suma("servicios", 1, "Conoces un oficio por dentro"); }

  if (tiene("disfruta", "gente")) { suma("servicios", 1, "Disfrutas hablar con gente"); suma("implementacion", 1, "Disfrutas hablar con gente"); }
  if (tiene("disfruta", "tecnico")) { suma("automatizacion", 1, "Disfrutas resolver problemas técnicos"); suma("software", 1, "Disfrutas resolver problemas técnicos"); }
  if (tiene("disfruta", "ensenar")) { suma("implementacion", 1, "Disfrutas enseñar"); suma("productos", 1, "Disfrutas enseñar"); }
  if (tiene("disfruta", "escribir") || tiene("disfruta", "disenar")) { suma("servicios", 1, "Disfrutas crear contenido"); suma("productos", 1, "Disfrutas crear contenido"); }
  if (tiene("disfruta", "organizar")) suma("automatizacion", 1, "Disfrutas organizar");

  const obj = uno("objetivo");
  if (obj === "negocio") { suma("implementacion", 2, "Puedes aplicarlo primero en tu propio negocio"); suma("automatizacion", 1, "Puedes aplicarlo primero en tu propio negocio"); }
  if (obj === "extra") { suma("servicios", 1, "Buscas un ingreso extra: conviene algo rápido de empezar"); suma("productos", 1); }
  if (obj === "cambio") { suma("servicios", 1, "Quieres cambiar de trabajo: un servicio te da práctica con clientes reales"); suma("implementacion", 1); }

  // Empate: gana el más rápido de empezar (orden del curso).
  const orden: Modelo[] = ["servicios", "implementacion", "automatizacion", "productos", "software"];
  const ranking = orden
    .map((m) => ({ modelo: m, nombre: MODELOS[m].nombre, puntos: puntos[m], razones: [...new Set(razones[m])] }))
    .sort((a, b) => b.puntos - a.puntos || orden.indexOf(a.modelo) - orden.indexOf(b.modelo));

  const sectorClave = uno("sector") || "ninguno";
  const sector = SECTOR[sectorClave] ?? SECTOR.ninguno;
  const top = ranking[0];

  const fortalezas: string[] = [];
  const hab = PREGUNTAS[1].opciones.filter((o) => tiene("habilidades", o.valor)).map((o) => o.texto.toLowerCase());
  if (hab.length) fortalezas.push(`Sabes: ${hab.join(", ")}.`);
  if (sectorClave !== "ninguno") fortalezas.push(`Conoces por dentro el sector de ${sector}.`);
  if (con === "varios" || con === "algunos") fortalezas.push("Ya conoces a posibles clientes: no empiezas en frío.");
  if (aud === "grande" || aud === "chica") fortalezas.push("Tienes gente que te sigue.");
  if (exp === "diario") fortalezas.push("Ya usas IA con soltura.");
  if (!fortalezas.length) fortalezas.push("Empiezas sin compromisos: puedes elegir la ruta que mejor te quede.");

  const limites: string[] = [];
  if (horas < 3) limites.push("Tienes poco tiempo: conviene un servicio pequeño y concreto.");
  if (uno("presupuesto") === "0") limites.push("Sin presupuesto: empieza con planes gratuitos.");
  if (aud === "no") limites.push("Sin audiencia: tus primeros clientes llegan por contacto directo (Fase 6).");
  if (con === "ninguno") limites.push("Sin contactos todavía: la Fase 6 te enseña a encontrarlos.");
  if (exp === "nada") limites.push("Poca práctica con IA: la Fase 4 te enseña a dirigirla.");

  const primeraMision = con === "ninguno"
    ? `Busca en Google Maps 5 negocios de ${sector} de tu zona y anota qué problema ves en cada uno.`
    : `Escribe 5 problemas que hayas visto en ${sector} y a qué 3 personas de ese sector conoces.`;

  return {
    ranking,
    ruta: { modelo: top.modelo, nombre: top.nombre, idea: MODELOS[top.modelo].idea(sector), razones: top.razones.slice(0, 3) },
    fortalezas,
    limites,
    primeraMision,
    sector,
  };
}

/** El perfil en texto, para copiarlo al cuaderno o a otra IA. */
export function perfilEnTexto(p: Perfil): string {
  return [
    "MI PERFIL DE MONETIZACIÓN CON IA",
    "",
    `Ruta recomendada: ${p.ruta.nombre} — ${p.ruta.idea}.`,
    ...p.ruta.razones.map((r) => `· ${r}`),
    "",
    `Modelos compatibles: ${p.ranking.slice(0, 2).map((x) => x.nombre).join(" y ")}.`,
    "",
    "Fortalezas:",
    ...p.fortalezas.map((f) => `· ${f}`),
    ...(p.limites.length ? ["", "A considerar:", ...p.limites.map((l) => `· ${l}`)] : []),
    "",
    `Mi primera misión: ${p.primeraMision}`,
  ].join("\n");
}

/** Instrucción para profundizar con la IA del alumno, ya con sus respuestas. */
export function instruccionParaIA(r: Respuestas, p: Perfil): string {
  const respuestas = PREGUNTAS.map((q) => {
    const t = q.opciones.filter((o) => (r[q.clave] ?? []).includes(o.valor)).map((o) => o.texto).join(", ");
    return `${q.texto} ${t}`;
  }).join("\n");
  return `Actúa como asesor de negocios realista. Estas son mis respuestas a un diagnóstico para ganar dinero con IA:\n${respuestas}\n\nUn diagnóstico inicial me recomendó: ${p.ruta.nombre} (${p.ruta.idea}). Ponlo a prueba: dime si estás de acuerdo y por qué, dame 3 oportunidades concretas con el formato «Para [cliente] que tiene [problema], producir [resultado] usando IA para [parte del trabajo]» y una primera acción para esta semana. No prometas ingresos ni plazos; si te falta un dato, pregúntamelo.`;
}
