// La capa editorial de cada curso: lo que convierte una fila de la base en
// un producto que se entiende en cinco segundos.
//
// La base guarda lo operativo (título, lecciones, outcomes, precio). Aquí
// vive lo que la base no tiene columnas para decir: qué problema resuelve en
// palabras del dueño del negocio, para quién es y para quién no, qué hace
// falta tener a mano y cómo se llama la pieza terminada con la que sales.
//
// Reglas de esta capa:
// - Nada de cifras inventadas, testimonios ni urgencia. Solo descripción.
// - Cada curso nuevo que no esté aquí sigue funcionando: todas las páginas
//   degradan a los datos de la base. `editorialDe()` puede devolver null.
// - Las partes de la pieza se asignan por orden de lección (o de módulo en
//   los cursos largos). Si el número no coincide con la base, las páginas
//   dejan de dibujar el avance por partes en vez de mentir.

export type Etapa = "encontrar" | "pedir" | "comprar";

export const ETAPAS: Record<Etapa, { titulo: string; nota: string; orden: number }> = {
  encontrar: {
    orden: 1,
    titulo: "Que te encuentren",
    nota: "Aparecer donde te buscan y verte activo cuando llegan.",
  },
  pedir: {
    orden: 2,
    titulo: "Que te pidan sin fricción",
    nota: "Contestar rápido y enseñar lo que vendes sin mandar fotos borrosas.",
  },
  comprar: {
    orden: 3,
    titulo: "Que te compren",
    nota: "Cotizar, dar seguimiento y cerrar sin regatear.",
  },
};

export type Editorial = {
  etapa: Etapa;
  /** El problema, dicho como lo diría el dueño del negocio. */
  problema: string;
  /** La promesa de resultado. Vende la pieza, no la herramienta. */
  promesa: string;
  paraQuien: string[];
  noEsPara: string;
  necesitas: string[];
  pieza: {
    nombre: string;
    /** Una parte por lección, o por módulo si `porModulo`. */
    partes: string[];
    porModulo?: boolean;
  };
  /** Verbo del botón principal: describe la acción, no "ver más". */
  accion: string;
  /** Palabras con las que alguien buscaría este curso (buscador del catálogo). */
  buscar?: string;
};

const CURSOS: Record<string, Editorial> = {
  "tu-negocio-en-google": {
    etapa: "encontrar",
    problema: "No aparezco en Google",
    promesa:
      "Que te encuentre quien busca lo que vendes a tres cuadras de tu negocio, con tu teléfono y tu horario correctos.",
    paraQuien: [
      "Tienes local o das servicio en una zona, y la gente te busca «cerca de mí».",
      "Tu competencia sale en el mapa y tú no, o sales con datos viejos.",
      "Nunca abriste Google Business, o lo dejaste a medias.",
    ],
    noEsPara: "Tiendas solo en línea, sin zona de servicio: el mapa no es tu canal.",
    necesitas: ["Tu celular", "Una cuenta de Gmail", "Nombre, dirección y teléfono exactos"],
    pieza: {
      nombre: "Tu ficha de Google, verificada y completa",
      partes: [
        "Ficha reclamada y en verificación",
        "Horarios, descripción y servicios",
        "15 fotos reales del negocio",
        "Link de reseñas y primeras solicitudes",
        "Primera publicación y ritmo semanal",
      ],
    },
    accion: "Reclamar mi ficha",
    buscar: "google maps mapa ficha perfil de empresa reseñas aparecer buscar cerca de mi local clientes nuevos presencia digital",
  },
  "menu-con-link": {
    etapa: "pedir",
    problema: "Mando el menú en fotos borrosas",
    promesa:
      "Un link que enseña tu menú completo, con fotos y precios de hoy, a cualquier hora y sin que tú contestes.",
    paraQuien: [
      "Vendes comida, productos o servicios con lista de precios.",
      "Te escriben «pásame el menú» varias veces al día.",
      "Tu menú es una foto, un PDF pesado o un papel en la pared.",
    ],
    noEsPara: "Negocios que ya tienen tienda en línea con carrito y pagos.",
    necesitas: ["Tu celular", "Tus 10 productos más vendidos con precio de hoy", "Una cuenta gratis de Canva"],
    pieza: {
      nombre: "Tu menú o catálogo digital con link propio",
      partes: [
        "Menú publicado con link propio",
        "12 fotos que dan antojo",
        "Categorías, combos y sugerencias",
        "El link en tus 4 puntos de contacto",
        "Formato de pedido sin idas y vueltas",
      ],
    },
    accion: "Armar mi menú con link",
    buscar: "menu catalogo link carta precios pedidos fotos productos restaurante tienda whatsapp",
  },
  "whatsapp-que-contesta-solo": {
    etapa: "pedir",
    problema: "Me preguntan siempre lo mismo",
    promesa:
      "Que tu WhatsApp salude, conteste lo de siempre y ordene los pedidos mientras tú atiendes a quien tienes enfrente.",
    paraQuien: [
      "Recibes pedidos o cotizaciones por WhatsApp.",
      "Contestas tarde porque estás atendiendo en persona.",
      "Escribes veinte veces al día el precio, el horario y la ubicación.",
    ],
    noEsPara: "Equipos de más de cinco personas contestando el mismo número.",
    necesitas: ["WhatsApp Business (gratis)", "Otro celular para probar", "Tus precios, horario y ubicación"],
    pieza: {
      nombre: "Tu WhatsApp Business que contesta solo",
      partes: [
        "Bienvenida y ausencia automáticas",
        "10 respuestas rápidas",
        "Catálogo dentro del chat",
        "Etiquetas por etapa del cliente",
        "Mensaje para recuperar clientes",
      ],
    },
    accion: "Configurar mi WhatsApp",
    buscar: "whatsapp business mensajes respuestas rapidas automaticas atencion a clientes horario catalogo etiquetas ia",
  },
  "un-mes-de-publicaciones": {
    etapa: "encontrar",
    problema: "No sé qué publicar",
    promesa:
      "Treinta días de publicaciones resueltos en una tarde, para que tu perfil deje de decir «hace 4 meses».",
    paraQuien: [
      "Tu última publicación fue hace semanas o meses.",
      "Abres Instagram, no sabes qué subir y lo cierras.",
      "Probaste la IA y te salió texto de agencia que no suena a ti.",
    ],
    noEsPara: "Quien quiere crecer con anuncios pagados: esto es contenido propio.",
    necesitas: ["Tu celular", "ChatGPT, Claude o Gemini (versión gratis)", "Las fotos de tu galería"],
    pieza: {
      nombre: "Tu calendario de 30 días de publicaciones",
      partes: [
        "8 publicaciones de esta semana",
        "Banco de 15 fotos propias",
        "Calendario de 30 días",
        "4 publicaciones que venden",
        "Rutina de historias de 5 minutos",
      ],
    },
    accion: "Armar mi mes de publicaciones",
    buscar: "redes sociales instagram facebook tiktok publicar publicaciones contenido posts historias fotos calendario ia clientes",
  },
  "cotiza-en-5-minutos": {
    etapa: "comprar",
    problema: "Mis cotizaciones se ven improvisadas",
    promesa:
      "Cotizaciones en PDF que se ven de empresa grande, con precios que sí te dejan ganancia y menos regateo.",
    paraQuien: [
      "Cotizas por WhatsApp con un «son como 4 mil, más o menos».",
      "Te regatean o te dejan en visto después de mandar el precio.",
      "Das servicios u obra: reparaciones, eventos, instalación, diseño.",
    ],
    noEsPara: "Negocios de mostrador con precio fijo: no cotizan, venden.",
    necesitas: ["Google Docs o Canva (gratis)", "Tu logo o el nombre del negocio", "Una cotización reciente"],
    pieza: {
      nombre: "Tu plantilla de cotización profesional",
      partes: [
        "Plantilla profesional de 7 bloques",
        "Lista de precios con margen real",
        "Primera cotización real enviada",
        "Seguimiento a 24 h, 72 h y 7 días",
        "Respuestas a los 5 regateos",
      ],
    },
    accion: "Hacer mi plantilla",
    buscar: "cotizacion cotizar presupuesto precios cobrar pdf anticipo cerrar ventas clientes servicios ia",
  },
  "ventas-con-ia": {
    etapa: "comprar",
    problema: "Mis ventas están desordenadas",
    promesa:
      "Un sistema de ventas de siete piezas que sigue trabajando los días que no tienes ganas de vender.",
    paraQuien: [
      "Cada venta tuya requiere conversación: servicios o productos de ticket medio.",
      "Consigues contactos, pero se enfrían y no sabes en qué punto.",
      "Ya resolviste lo básico y quieres algo que se sostenga solo.",
    ],
    noEsPara: "Si todavía no tienes producto definido, empieza por un curso corto.",
    necesitas: ["ChatGPT, Claude o Gemini", "Tus últimas 20 conversaciones de venta", "Una hoja de cálculo"],
    pieza: {
      nombre: "Tu sistema de ventas de siete piezas",
      porModulo: true,
      partes: [
        "Mapa del sistema y diagnóstico de fuga",
        "Cliente ideal, oferta, mensaje y canal",
        "Guion, seguimiento y objeciones",
        "Tablero de números y sistema integrado",
      ],
    },
    accion: "Construir mi sistema",
    buscar: "ventas vender mas clientes seguimiento objeciones prospectar cerrar embudo whatsapp inteligencia artificial ia chatgpt automatizar",
  },
};

export function editorialDe(slug: string): Editorial | null {
  return CURSOS[slug] ?? null;
}

export const NIVEL: Record<string, string> = {
  beginner: "Desde cero",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

/** Las partes de la pieza con su estado real, derivado del progreso.
 *  Devuelve null si el curso no tiene editorial o si la estructura de la
 *  base no coincide con las partes: mejor no dibujar que dibujar mal. */
export function partesDe(
  slug: string,
  modulos: { sort_order: number; lecciones: { id: string; sort_order: number }[] }[],
  hechas: Set<string>
): { titulo: string; hecha: boolean; lecciones: string[] }[] | null {
  const ed = editorialDe(slug);
  if (!ed) return null;
  const grupos = ed.pieza.porModulo
    ? modulos.map((m) => m.lecciones.map((l) => l.id))
    : modulos.flatMap((m) => m.lecciones.map((l) => [l.id]));
  if (grupos.length !== ed.pieza.partes.length) return null;
  return ed.pieza.partes.map((titulo, i) => ({
    titulo,
    lecciones: grupos[i],
    hecha: grupos[i].length > 0 && grupos[i].every((id) => hechas.has(id)),
  }));
}
