// Simulador de objeciones de Monetiza IA. Sin API ni base de datos: cada
// escenario es un cliente con una objeción y tres respuestas posibles, ya
// calificadas en las cinco áreas que evalúa la misión. Así el alumno recibe
// una evaluación inmediata y siempre igual, sin costo por uso.
//
// Todos los escenarios usan la oferta de ejemplo del curso (el Mes Visible
// de Daniela, caso ilustrativo). Después, el alumno practica con su propia
// oferta usando la instrucción para su IA que trae la misión.

export const AREAS = [
  { clave: "claridad", nombre: "Claridad", consejo: "Responde en dos o tres frases, sin tecnicismos: qué recibe y qué cambia para él." },
  { clave: "descubrimiento", nombre: "Descubrimiento", consejo: "Antes de responder, pregunta qué hay detrás: «¿comparado con qué?», «¿qué le hace dudar?»." },
  { clave: "propuesta", nombre: "Propuesta de valor", consejo: "Habla del resultado que le importa (constancia, tiempo), no de la herramienta ni de ti." },
  { clave: "objecion", nombre: "Manejo de la objeción", consejo: "Reconoce la objeción sin discutir y respóndela con un dato de su propia situación." },
  { clave: "siguiente", nombre: "Siguiente paso", consejo: "Termina siempre con una propuesta concreta y pequeña: una fecha, una muestra, una llamada de 10 minutos." },
] as const;

export type Area = (typeof AREAS)[number]["clave"];
export type Calificacion = Record<Area, number>;

export type RespuestaSim = {
  texto: string;
  calificacion: Calificacion;
  comentario: string;
};

export type EscenarioSim = {
  id: string;
  perfil: string;
  situacion: string;
  cliente: string;
  respuestas: RespuestaSim[];
  /** Índice de la mejor respuesta. */
  mejor: number;
};

const c = (claridad: number, descubrimiento: number, propuesta: number, objecion: number, siguiente: number): Calificacion => ({
  claridad, descubrimiento, propuesta, objecion, siguiente,
});

export const ESCENARIOS: EscenarioSim[] = [
  {
    id: "precio",
    perfil: "Sensible al precio",
    situacion: "Le presentaste el Mes Visible a $2,400 al mes.",
    cliente: "Uy, está muy caro para mí.",
    respuestas: [
      {
        texto: "Te lo dejo en $1,500 si cierras hoy.",
        calificacion: c(7, 1, 2, 2, 5),
        comentario: "Bajas el precio sin saber con qué lo compara y con urgencia inventada. Enseñas que tu precio no era real.",
      },
      {
        texto: "Entiendo. ¿Caro comparado con qué lo estás pensando? Si el presupuesto no alcanza, puedo hacer 8 publicaciones en lugar de 12. ¿Te mando una semana de muestra y lo ves con calma el jueves?",
        calificacion: c(8, 9, 7, 9, 9),
        comentario: "Preguntas qué hay detrás, ofreces menos alcance en lugar de descuento y cierras con un paso pequeño y concreto.",
      },
      {
        texto: "Es que uso herramientas de inteligencia artificial profesionales, diseño cada imagen y reviso todo, por eso cuesta eso.",
        calificacion: c(5, 1, 4, 3, 1),
        comentario: "Te defiendes explicando tu trabajo. No sabes qué quería decir con «caro» ni propones cómo seguir.",
      },
    ],
    mejor: 1,
  },
  {
    id: "chatgpt",
    perfil: "Ya usa IA",
    situacion: "El dueño ya usa ChatGPT de vez en cuando.",
    cliente: "Eso lo puedo hacer yo con ChatGPT.",
    respuestas: [
      {
        texto: "Claro que puede, y le puede quedar bien. ¿Cuántas veces publicó el mes pasado? … Por eso existe el Mes Visible: no le vendo los textos, le vendo que ya no dependa de acordarse. ¿Le preparo una semana de muestra?",
        calificacion: c(9, 8, 9, 9, 8),
        comentario: "Reconoces que tiene razón, usas un dato de su propia situación y vendes constancia, no texto.",
      },
      {
        texto: "Sí, pero ChatGPT se equivoca mucho y no sabe diseñar.",
        calificacion: c(6, 1, 3, 2, 1),
        comentario: "Discutir pone al cliente a la defensiva, y criticar la herramienta no le dice qué gana contigo.",
      },
      {
        texto: "Está bien, si algún día necesita ayuda aquí estoy.",
        calificacion: c(6, 1, 1, 1, 2),
        comentario: "Te retiras sin entender si de verdad lo resuelve solo. Una pregunta habría dicho si hay oportunidad.",
      },
    ],
    mejor: 0,
  },
  {
    id: "informacion",
    perfil: "Ocupado",
    situacion: "El dueño contesta entre servicio y servicio.",
    cliente: "Ahorita no puedo, mándame información.",
    respuestas: [
      {
        texto: "Claro. Te mando mi portafolio de una página. ¿Qué te interesa ver primero: ejemplos o cómo trabajamos? Te escribo el viernes para resolver dudas en 5 minutos.",
        calificacion: c(9, 7, 7, 8, 9),
        comentario: "Respetas su tiempo, mandas algo corto, preguntas qué le importa y dejas un seguimiento con fecha.",
      },
      {
        texto: "Va. [Manda un PDF de 12 páginas y no vuelve a escribir.]",
        calificacion: c(4, 1, 4, 2, 1),
        comentario: "Un documento largo sin seguimiento casi siempre se queda sin leer. La conversación se enfría.",
      },
      {
        texto: "Solo te quito 10 minutos, de verdad vale la pena, ¿podemos hablar ahora?",
        calificacion: c(6, 1, 3, 2, 5),
        comentario: "Insistir cuando dijo que no puede genera rechazo. Hay un siguiente paso, pero a costa de no escucharlo.",
      },
    ],
    mejor: 0,
  },
  {
    id: "pensar",
    perfil: "Escéptico",
    situacion: "Ya le presentaste la oferta completa.",
    cliente: "Déjame pensarlo.",
    respuestas: [
      {
        texto: "Perfecto, ¡cualquier cosa me avisas!",
        calificacion: c(7, 1, 2, 2, 1),
        comentario: "Suena amable, pero no sabes qué le hace dudar y dejas la decisión en el aire.",
      },
      {
        texto: "Es la mejor decisión que puedes tomar, la promoción termina hoy.",
        calificacion: c(5, 1, 2, 1, 4),
        comentario: "Presión y urgencia falsa. Aunque consiguieras la venta, pierdes la confianza.",
      },
      {
        texto: "Claro, es una decisión. Para ayudarte a pensarlo: ¿qué parte te hace dudar más, el precio o si de verdad te va a funcionar? … ¿Te parece si lo hablamos el martes?",
        calificacion: c(8, 9, 6, 9, 8),
        comentario: "Respetas su tiempo y averiguas la duda real. Con eso sabes qué responder y dejas una fecha.",
      },
    ],
    mejor: 2,
  },
  {
    id: "ya-tiene",
    perfil: "Compara alternativas",
    situacion: "El dueño menciona que alguien más le ayuda.",
    cliente: "Ya tengo a alguien que me hace las redes.",
    respuestas: [
      {
        texto: "Seguro yo lo hago mejor y más barato.",
        calificacion: c(6, 1, 2, 2, 2),
        comentario: "Criticas sin saber nada de quien le ayuda. Suena a presión y a desconfianza.",
      },
      {
        texto: "¡Qué bueno! ¿Estás contento con cómo va? … Si en algún momento necesitas un respaldo, aquí estoy. ¿Te puedo escribir en tres meses para ver cómo sigue?",
        calificacion: c(8, 8, 5, 8, 7),
        comentario: "Preguntas antes de asumir. Si está contento, te retiras con elegancia y dejas la puerta abierta con fecha.",
      },
      {
        texto: "Ah, ok. Gracias.",
        calificacion: c(6, 1, 1, 2, 1),
        comentario: "Te retiras sin saber si está contento. Una pregunta habría dicho si hay oportunidad.",
      },
    ],
    mejor: 1,
  },
  {
    id: "no-ia",
    perfil: "No entiende la IA",
    situacion: "El dueño desconfía de la tecnología.",
    cliente: "No, yo no necesito inteligencia artificial.",
    respuestas: [
      {
        texto: "La IA es el futuro, si no te subes te vas a quedar atrás.",
        calificacion: c(5, 1, 2, 1, 1),
        comentario: "Discutir sobre la IA no le importa, y el miedo como argumento genera rechazo.",
      },
      {
        texto: "Tiene razón, la IA no es lo importante. Lo importante es que sus clientes vean su menú tres veces por semana. ¿Hoy cómo le hace para publicar?",
        calificacion: c(9, 8, 9, 8, 6),
        comentario: "Sacas la herramienta de la conversación, hablas del resultado y abres con una pregunta de diagnóstico.",
      },
      {
        texto: "Te explico: la inteligencia artificial generativa usa modelos de lenguaje que…",
        calificacion: c(2, 1, 2, 2, 1),
        comentario: "Una explicación técnica que no pidió. El cliente compra resultados, no tecnología.",
      },
    ],
    mejor: 1,
  },
  {
    id: "descuento",
    perfil: "Pide descuento",
    situacion: "El dueño está interesado, pero quiere regatear.",
    cliente: "Me interesa, pero hazme un descuento.",
    respuestas: [
      {
        texto: "El precio es el mismo para todos, pero puedo ajustar el paquete: con 8 publicaciones queda en menos. ¿Cuál te acomoda más para empezar este mes?",
        calificacion: c(9, 6, 8, 9, 9),
        comentario: "Mantienes el valor de tu trabajo y le das una opción real. Terminas con una elección fácil.",
      },
      {
        texto: "Va, te hago 30% de descuento.",
        calificacion: c(8, 1, 2, 3, 6),
        comentario: "El mismo trabajo más barato enseña que tu precio no era real, y el siguiente cliente pedirá lo mismo.",
      },
      {
        texto: "No, no hago descuentos.",
        calificacion: c(7, 1, 3, 3, 1),
        comentario: "Es claro, pero cierra la conversación sin darle una alternativa ni un siguiente paso.",
      },
    ],
    mejor: 0,
  },
  {
    id: "interesado",
    perfil: "Interesado",
    situacion: "El dueño quiere avanzar.",
    cliente: "Me gusta. ¿Cómo le hacemos?",
    respuestas: [
      {
        texto: "Qué bueno. Te explico todo: primero hacemos una llamada, luego yo reviso tu menú, luego uso mis herramientas, luego diseño, luego…",
        calificacion: c(4, 3, 5, 5, 3),
        comentario: "Cuando el cliente ya quiere avanzar, una explicación larga lo enfría. Hace falta un paso concreto.",
      },
      {
        texto: "¡Perfecto! Tú avísame cuando quieras empezar.",
        calificacion: c(7, 2, 3, 5, 1),
        comentario: "Dejas la decisión en el aire justo cuando estaba listo. Muchas ventas se pierden aquí.",
      },
      {
        texto: "Muy fácil: te mando el formulario de 10 minutos y el enlace de pago del primer mes. Con eso, el jueves hacemos la llamada de 20 minutos. ¿Te queda mejor en la mañana o en la tarde?",
        calificacion: c(9, 6, 7, 8, 10),
        comentario: "Pasos claros, fecha propuesta y una pregunta fácil de contestar. Nada que lo haga dudar.",
      },
    ],
    mejor: 2,
  },
];

export const total = (cal: Calificacion) =>
  Math.round(AREAS.reduce((s, a) => s + cal[a.clave], 0) / AREAS.length);
