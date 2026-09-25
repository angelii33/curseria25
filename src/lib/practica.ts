// Banco de práctica: preguntas de comprobación por lección.
//
// Aplica dos técnicas con mucha evidencia detrás:
//   - Pregunta previa (pretesting): se pregunta ANTES de leer. Aunque la
//     respuesta sea incorrecta, prepara la atención para lo que viene y
//     mejora lo que se retiene (Pan y Carpenter, 2023).
//   - Práctica de recuperación con retroalimentación: preguntar después de
//     leer, con explicación inmediata, fija más que releer (Dunlosky et al.;
//     efecto de prueba).
//
// Las respuestas viven aquí, en el cliente, a propósito: esto NO califica
// nada ni cuenta para el certificado (eso lo hace el quiz real, en el
// servidor). Es práctica para el alumno, sin consecuencias.
//
// Las preguntas se escribieron a partir del contenido de cada lección. Una
// lección sin entrada aquí simplemente no muestra práctica.

export type PreguntaPractica = {
  texto: string;
  opciones: string[];
  correcta: number;
  /** Se muestra siempre después de responder: el porqué, no solo el qué. */
  explicacion: string;
};

export type Practica = {
  /** La primera se hace como pregunta previa, antes de leer. */
  preguntas: PreguntaPractica[];
};

import { PRACTICA_CURSOS } from "./practica-cursos";

const P: Record<string, Practica> = {
  "tu-negocio-en-google/1/1": {
    preguntas: [
      {
        texto: "¿Quién puede sugerir cambios en una ficha de Google que no tiene dueño?",
        opciones: ["Solo Google", "Cualquier persona", "Nadie, hasta que alguien la reclame"],
        correcta: 1,
        explicacion:
          "Cualquier persona puede sugerir cambios a una ficha sin dueño: un competidor puede reportar que cerraste o un cliente enojado cambiar tu horario. Por eso reclamarla va primero.",
      },
      {
        texto: "Tienes una taquería. ¿Qué pones como categoría principal?",
        opciones: ["Restaurante", "Taquería", "Comida mexicana a domicilio"],
        correcta: 1,
        explicacion:
          "La principal describe qué eres, no lo que suena más grande. Con «Restaurante» competirías contra todos los restaurantes de la ciudad y desaparecerías.",
      },
      {
        texto: "¿Qué nombre escribes en la ficha?",
        opciones: [
          "Taquería El Güero | Los mejores tacos de La Paz",
          "Taquería El Güero",
          "Tacos El Güero · Servicio a domicilio",
        ],
        correcta: 1,
        explicacion:
          "Solo el nombre real. Las palabras promocionales en el nombre pueden hacer que Google suspenda la ficha o las borre sin avisar.",
      },
      {
        texto: "Mientras esperas la verificación, ¿qué conviene hacer?",
        opciones: [
          "Esperar sin tocar nada",
          "Completar la ficha: fotos, horarios, descripción",
          "Crear otra ficha por si acaso",
        ],
        correcta: 1,
        explicacion:
          "Puedes completar toda la ficha mientras tanto. Así llega aprobada y completa, no aprobada y vacía.",
      },
    ],
  },
  "whatsapp-que-contesta-solo/1/1": {
    preguntas: [
      {
        texto: "Un cliente le escribe a tres negocios a la vez. ¿Con quién se queda muchas veces?",
        opciones: ["Con el más barato", "Con el primero que responde", "Con el que tiene más años"],
        correcta: 1,
        explicacion:
          "Muchos compradores se quedan con el primero que contesta. El que responde a los cinco minutos ya está conversando cuando los otros llegan.",
      },
      {
        texto: "¿Cuáles son las tres partes de un buen mensaje de bienvenida?",
        opciones: [
          "Saludo + precio + despedida",
          "Saludo + qué debe hacer + qué va a pasar después",
          "Nombre + horario + ubicación",
        ],
        correcta: 1,
        explicacion:
          "La parte que casi nadie pone es «qué debe hacer»: ordena la conversación y, en vez de un «hola», recibes el pedido completo.",
      },
      {
        texto: "¿Qué mensaje de ausencia da más confianza?",
        opciones: [
          "«Estamos fuera de nuestro horario de atención.»",
          "«Estoy en la parrilla hasta las 4. Déjame tu pedido y te confirmo en cuanto salga.»",
          "«No contestamos mensajes fuera de horario.»",
        ],
        correcta: 1,
        explicacion:
          "Suena a una persona ocupada trabajando —que es lo que eres— y no a una empresa que no quiere hablar contigo.",
      },
      {
        texto: "Antes de pasar tu número a WhatsApp Business, ¿qué haces?",
        opciones: ["Borrar los chats viejos", "Un respaldo de tus chats", "Nada: se pasa solo, sin riesgo"],
        correcta: 1,
        explicacion: "Ajustes → Chats → Copia de seguridad. Con años de conversaciones, no te la juegues.",
      },
    ],
  },
  "menu-con-link/1/1": {
    preguntas: [
      {
        texto: "¿Cuánto tiempo tiene tu menú para convencer a un cliente?",
        opciones: ["Unos 5 minutos", "Unos 30 segundos", "Lo que haga falta: si le interesa, lo lee todo"],
        correcta: 1,
        explicacion:
          "El cliente decide en 30 segundos. Cada párrafo largo es un cliente menos que llega hasta abajo.",
      },
      {
        texto: "¿Cómo describes cada producto?",
        opciones: [
          "Con la historia del platillo",
          "Nombre, unas seis palabras y el precio de hoy",
          "Solo el nombre; el precio lo pregunta",
        ],
        correcta: 1,
        explicacion: "Nombre, descripción de seis palabras como máximo y el precio de hoy. Nada más.",
      },
      {
        texto: "Vendes comida y las fotos importan mucho. ¿Qué herramienta te conviene?",
        opciones: ["Canva, sitio de una página", "Google Docs publicado", "Un PDF por WhatsApp"],
        correcta: 0,
        explicacion:
          "Canva es el que mejor se ve para comida. Google Docs conviene si cambias precios seguido o vendes servicios.",
      },
      {
        texto: "¿Cómo compruebas que el menú funciona?",
        opciones: [
          "Lo abres en tu celular",
          "Lo mandas al celular de otra persona y ves si entendió qué pedir",
          "Esperas a que un cliente se queje",
        ],
        correcta: 1,
        explicacion:
          "Alguien que no lo vio mientras lo hacías: ¿abrió en menos de 5 segundos, se lee sin zoom, entendió qué pedir?",
      },
    ],
  },
  "menu-con-link/1/2": {
    preguntas: [
      {
        texto: "¿Qué luz es la mejor para fotografiar comida?",
        opciones: ["El flash del celular", "Luz de ventana, indirecta", "El foco de la cocina"],
        correcta: 1,
        explicacion:
          "Junto a la ventana, con sol indirecto. El flash aplana y deja la comida gris; el foco amarillo cambia los colores.",
      },
      {
        texto: "¿Qué ángulo va mejor para un taco o una hamburguesa?",
        opciones: ["Desde arriba (cenital)", "A 45 grados", "De lado, a la altura del plato"],
        correcta: 1,
        explicacion:
          "45 grados es como lo ves cuando te lo van a servir: se ve el volumen y el relleno. Desde arriba es para productos planos.",
      },
      {
        texto: "¿Para qué SÍ sirve la IA con tus fotos?",
        opciones: [
          "Para que la comida se vea mejor",
          "Para limpiar el fondo de productos que no se comen",
          "Para crear la foto sin tomarla",
        ],
        correcta: 1,
        explicacion:
          "Para comida, nunca: si llega distinto a la foto, llega la reseña de una estrella. La IA sirve para fondos de productos no comestibles.",
      },
    ],
  },
  "un-mes-de-publicaciones/1/1": {
    preguntas: [
      {
        texto: "Un cliente nuevo entra a tu perfil. ¿Qué mira antes que nada?",
        opciones: ["Cuántos seguidores tienes", "La fecha de tu última publicación", "Tu foto de perfil"],
        correcta: 1,
        explicacion:
          "Si dice «hace 4 meses», concluye en medio segundo que quizá ya cerraste, y se va con el siguiente.",
      },
      {
        texto: "En el brief, ¿qué escribes en «qué me hace distinto»?",
        opciones: [
          "Calidad y buen servicio",
          "Algo comprobable: «entrego el mismo día si pides antes de las 11»",
          "Que somos los más baratos",
        ],
        correcta: 1,
        explicacion: "«Calidad y servicio» lo dice todo el mundo y no significa nada. Escribe algo que se pueda comprobar.",
      },
      {
        texto: "De las ocho publicaciones, dos no suenan a ti. ¿Qué haces?",
        opciones: [
          "Pido las ocho de nuevo",
          "Pido que reescriba solo esas dos, más directas",
          "Las publico así",
        ],
        correcta: 1,
        explicacion: "No rehagas todo: corrige solo lo que no suena a ti. Tú curas, la IA redacta.",
      },
      {
        texto: "¿Cuántas publicaciones subes hoy?",
        opciones: ["Las ocho", "Dos", "Ninguna, hasta tener fotos perfectas"],
        correcta: 1,
        explicacion: "Dos. Lo que importa hoy es que tu perfil deje de decir «hace 4 meses». El impulso vale más que la perfección.",
      },
    ],
  },
  "cotiza-en-5-minutos/1/1": {
    preguntas: [
      {
        texto: "Dos cotizaciones por el mismo trabajo. ¿Por qué a una le regatean menos?",
        opciones: [
          "Porque es más barata",
          "Porque se ve como de alguien que sabe lo que cobra",
          "Porque llegó primero",
        ],
        correcta: 1,
        explicacion:
          "La que llega en PDF, con datos y condiciones, «tiene un precio». La de «son como 4 mil» se puede negociar.",
      },
      {
        texto: "¿Cómo describes el trabajo en la cotización?",
        opciones: [
          "«Azulejado de 6 m² con junteo perimetral»",
          "«Baño completo, listo para usarse»",
          "«Trabajos varios de albañilería»",
        ],
        correcta: 1,
        explicacion: "El cliente no compra metros cuadrados: compra un baño que funciona. Escribe el resultado, no el procedimiento.",
      },
      {
        texto: "¿Por qué separar materiales y mano de obra?",
        opciones: ["Por impuestos", "Porque la transparencia permite cobrar más", "No hace falta separarlos"],
        correcta: 1,
        explicacion:
          "Cuando el cliente ve que $2,400 son materiales, entiende lo que cuesta tu trabajo y deja de pensar que le cobras de más.",
      },
      {
        texto: "¿Con qué termina una cotización profesional?",
        opciones: ["Con el total", "Con el siguiente paso: cómo agendar", "Con un saludo cordial"],
        correcta: 1,
        explicacion: "Nunca termines con el total. Termina diciendo qué hacer: «confirma con el anticipo y te aparto la fecha».",
      },
    ],
  },
  "ventas-con-ia/1/1": {
    preguntas: [
      {
        texto: "Karla le manda la cotización a una clienta y ya no vuelve a escribirle. ¿Qué pieza del sistema le falta?",
        opciones: ["Una mejor oferta", "Seguimiento", "Más contactos"],
        correcta: 1,
        explicacion:
          "La cotización puede ser buena; lo que falla es lo que pasa después. Sin seguimiento, la venta se la lleva quien sí vuelve a escribir.",
      },
      {
        texto: "¿Cuántas piezas tiene el sistema de ventas del curso?",
        opciones: ["Tres", "Siete", "Diez"],
        correcta: 1,
        explicacion: "Cliente ideal, oferta, mensaje inicial, canal, primer contacto, seguimiento y números.",
      },
      {
        texto: "Una pieza que haces «a veces, depende del día», ¿cómo la calificas?",
        opciones: ["La tengo", "A medias, que cuenta como no tenerla", "No importa"],
        correcta: 1,
        explicacion: "Una pieza que depende de tu ánimo no sostiene peso. Calificarla con honestidad es lo que hace útil el mapa.",
      },
    ],
  },
  "ventas-con-ia/1/2": {
    preguntas: [
      {
        texto: "Rubén tiene 12 cotizaciones al mes y cierra 1. ¿Qué le conviene arreglar primero?",
        opciones: ["Pagar anuncios para conseguir más contactos", "Lo que pasa entre la propuesta y el cierre", "Su logotipo"],
        correcta: 1,
        explicacion:
          "Le llega gente y cotiza bastante; se le cae todo después de la propuesta. Más contactos solo le darían más cotizaciones perdidas.",
      },
      {
        texto: "Si la gente no contesta tu primer mensaje, ¿dónde está la fuga?",
        opciones: ["En el mensaje inicial o el canal", "En el seguimiento", "En el precio"],
        correcta: 0,
        explicacion: "Si se cae entre contacto y respuesta, el problema está antes de cualquier conversación: el mensaje o el lugar donde lo mandas.",
      },
      {
        texto: "¿Para qué sirve anotar tu línea base hoy?",
        opciones: ["Para compararte al final y saber si mejoraste", "Para presumirla", "Para calcular precios"],
        correcta: 0,
        explicacion: "Sin una línea base, dentro de un mes no sabrás si mejoraste de verdad o si solo te lo pareció.",
      },
    ],
  },
};

// Las lecciones que no tenían banco viven en su propio archivo.
const CRUDO: Record<string, Practica> = { ...P, ...PRACTICA_CURSOS };

/**
 * Las opciones se escriben con la correcta donde salga natural (casi siempre
 * quedaba en la B), y eso se aprende: el alumno responde por posición, no por
 * lo que sabe. Aquí se revuelven con una semilla fija por pregunta: mismo
 * orden en servidor y navegador, y en cada visita.
 */
export function barajar(q: PreguntaPractica): PreguntaPractica {
  let semilla = 0;
  for (const c of q.texto) semilla = (semilla * 31 + c.charCodeAt(0)) >>> 0;
  const azar = () => {
    semilla = (semilla * 1664525 + 1013904223) >>> 0;
    return semilla / 2 ** 32;
  };
  const orden = q.opciones.map((_, i) => i);
  for (let i = orden.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  return { ...q, opciones: orden.map((i) => q.opciones[i]), correcta: orden.indexOf(q.correcta) };
}

const TODO: Record<string, Practica> = Object.fromEntries(
  Object.entries(CRUDO).map(([k, p]) => [k, { preguntas: p.preguntas.map(barajar) }])
);

export function practicaDe(slug: string, mod: number, lec: number): Practica | null {
  return TODO[`${slug}/${mod}/${lec}`] ?? null;
}

/** Todo el banco, para el repaso espaciado de Mi aprendizaje. */
export function bancoCompleto() {
  return Object.entries(TODO).map(([clave, p]) => ({ clave, ...p }));
}
