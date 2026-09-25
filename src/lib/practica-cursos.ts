import type { Practica } from "./practica";

// Banco de práctica de las lecciones que no lo tenían. Mismo criterio que
// src/lib/practica.ts: cada pregunta sale del texto de su lección (nada que
// la lección no diga), prefiere situaciones de un negocio real a preguntas
// de memoria, y la explicación enseña el porqué. La primera de cada lección
// se usa como pregunta previa, antes de leer.

export const PRACTICA_CURSOS: Record<string, Practica> = {
  // ─── Tu negocio en Google ────────────────────────────────────────────────
  "tu-negocio-en-google/1/2": {
    preguntas: [
      {
        texto: "Aceptas tarjeta desde hace años, pero no marcaste esa casilla en tu ficha. ¿Qué pasa cuando alguien filtra «acepta tarjeta»?",
        opciones: ["Google lo deduce de tus reseñas y sí apareces", "Desapareces de esa lista", "No cambia nada: los atributos son decorativos"],
        correcta: 1,
        explicacion: "Google filtra por los atributos. Si la casilla no está marcada, no sales en esa búsqueda aunque sí aceptes tarjeta.",
      },
      {
        texto: "¿Cuál de estas descripciones trabaja mejor para que te encuentren?",
        opciones: [
          "«Somos una empresa comprometida con la excelencia y la calidad»",
          "«Cancelería de aluminio en La Paz: ventanas, canceles de baño y mosquiteros. 12 años instalando»",
          "«¡Los mejores precios de la ciudad! Promoción este mes»",
        ],
        correcta: 1,
        explicacion: "Empieza con el giro y la zona, y trae las palabras por las que alguien busca. «Comprometida con la excelencia» no tiene ninguna, y la de «promoción este mes» además la rechaza Google.",
      },
      {
        texto: "Viene el 12 de diciembre y ese día cierras temprano. ¿Qué haces en la ficha?",
        opciones: ["Nada: la gente ya sabe que es festivo", "Cambiar el horario normal y regresarlo después", "Programar un horario especial para esa fecha"],
        correcta: 2,
        explicacion: "«Llegué y estaba cerrado» es la queja más común en reseñas. El horario especial se programa por adelantado y no toca tu horario de siempre.",
      },
    ],
  },
  "tu-negocio-en-google/1/3": {
    preguntas: [
      {
        texto: "¿Cuál es el trabajo principal de la foto de tu fachada?",
        opciones: ["Verse bonita y artística", "Que el cliente te reconozca cuando venga llegando", "Mostrar tus precios"],
        correcta: 1,
        explicacion: "Que se vea el letrero, la puerta y algo del entorno, tomada de día desde el otro lado de la calle. Si alguien que nunca ha ido duda en «¿sabrías llegar?», hay que repetirla.",
      },
      {
        texto: "Vas a fotografiar tus pasteles dentro del local de noche, con focos amarillos. ¿Qué conviene?",
        opciones: ["Usar el flash para que se vean", "Tomarlas de día junto a una ventana o en la puerta", "Tomarlas así y ponerles un filtro que mejore el color"],
        correcta: 1,
        explicacion: "La luz de foco cambia los colores y el flash aplana todo. Luz natural y edición mínima: si el pastel sale más rosa que en el mostrador, el cliente llega decepcionado.",
      },
      {
        texto: "¿Cuál de estas fotos NO debes subir a tu ficha?",
        opciones: ["El antes y después de un trabajo", "Una foto bonita que encontraste en internet", "Tu empleada atendiendo a un cliente"],
        correcta: 1,
        explicacion: "Google detecta y penaliza las fotos de internet, y además prometen algo que no vas a entregar. El antes y después y las personas trabajando generan confianza.",
      },
    ],
  },
  "tu-negocio-en-google/1/4": {
    preguntas: [
      {
        texto: "Un competidor tiene 40 reseñas de hace tres años; tú, 12 de este mes. ¿Quién tiene ventaja con Google?",
        opciones: ["Él: tiene más del triple", "Tú: las recientes pesan más", "Da igual: solo cuenta el promedio de estrellas"],
        correcta: 1,
        explicacion: "Las reseñas recientes le dicen a Google que el negocio está vivo. Por eso pedirlas es un hábito, no algo de una sola vez.",
      },
      {
        texto: "Terminas un corte y el cliente se ve al espejo y sonríe. ¿Cuándo le pides la reseña?",
        opciones: ["Ahí mismo, y le mandas el link por WhatsApp", "Al cobrarle", "En una semana, con un recordatorio"],
        correcta: 0,
        explicacion: "El pico de satisfacción dura segundos. Al cobrar está pensando en su cartera; y los recordatorios molestan sin traer reseñas.",
      },
      {
        texto: "Te dejan una reseña de una estrella injusta. ¿Qué haces?",
        opciones: [
          "Responder explicando por qué el cliente está equivocado",
          "Responder en menos de 24 horas: disculpa, qué pasó, cómo lo resuelves e invitación a hablar",
          "No responder para no darle importancia",
        ],
        correcta: 1,
        explicacion: "Quien lee no juzga quién tenía razón: juzga cómo tratas a alguien enojado. Una mala reseña bien respondida vende más que cinco buenas ignoradas.",
      },
    ],
  },
  "tu-negocio-en-google/1/5": {
    preguntas: [
      {
        texto: "¿Cuánto tiempo se muestra arriba una publicación en tu ficha de Google?",
        opciones: ["Un día", "Siete días", "Siempre, hasta que la borres"],
        correcta: 1,
        explicacion: "Después de siete días se archiva y deja de mostrarse arriba. Por eso el ritmo es una publicación por semana.",
      },
      {
        texto: "Google te rechazó una publicación que decía «Llámanos al 612 123 4567». ¿Qué cambias?",
        opciones: ["Nada, vuelvo a subirla igual", "Quito el teléfono del texto y uso el botón «Llamar»", "Cambio la foto"],
        correcta: 1,
        explicacion: "Google no acepta teléfonos en el texto de la publicación. Para eso está el botón de acción.",
      },
      {
        texto: "Un taller publica: «Precios accesibles, visítanos». ¿Qué le falta según la fórmula?",
        opciones: ["Más adjetivos", "El precio concreto, cuándo y qué hacer ahora", "Un hashtag"],
        correcta: 1,
        explicacion: "Qué, cuánto, cuándo y qué hacer ahora: «Cambio de aceite y filtro desde $650, en 40 minutos, con cita el mismo día» + botón «Llamar».",
      },
    ],
  },
  // ─── WhatsApp que contesta solo ──────────────────────────────────────────
  "whatsapp-que-contesta-solo/1/2": {
    preguntas: [
      {
        texto: "¿Cuál atajo es mejor para la respuesta rápida de precios?",
        opciones: ["/p1", "/precio", "/respuesta-precios-2024"],
        correcta: 1,
        explicacion: "Si el atajo no se te queda, no lo usas. «/precio» es obvio; «/p1» obliga a recordarlo y hace que tardes más de los 40 segundos meta.",
      },
      {
        texto: "La IA te escribió: «Estimado cliente, le informamos que nuestros servicios…». ¿Qué haces?",
        opciones: [
          "La guardo tal cual: suena profesional",
          "Le doy tres frases mías como ejemplo y la reescribo con mi forma de hablar",
          "La hago más larga para que se vea completa",
        ],
        correcta: 1,
        explicacion: "Empezar con «Estimado» y decir «nuestros servicios» son señales de voz de folleto. Léela en voz alta: si no la dirías así, cámbiala. Y máximo tres líneas.",
      },
      {
        texto: "Tu respuesta /ubi dice la dirección y el mapa. ¿Qué línea de más evita la siguiente pregunta en una estética?",
        opciones: ["«Hay estacionamiento enfrente»", "«Gracias por su preferencia»", "«Síguenos en Facebook»"],
        correcta: 0,
        explicacion: "Nadie lo preguntó, pero es justo lo que te iban a preguntar después. Piensa cuál es el «estacionamiento» de tu giro y agrégalo.",
      },
    ],
  },
  "whatsapp-que-contesta-solo/1/3": {
    preguntas: [
      {
        texto: "Vendes 80 productos. ¿Cuántos subes al catálogo de WhatsApp al empezar?",
        opciones: ["Los 80, para que vean todo", "Los 20 que más te preguntan", "Solo 5"],
        correcta: 1,
        explicacion: "Un catálogo de 80 abruma y el cliente se sale; uno de 20 bien elegidos se hojea completo. Los demás los agregas después, si hacen falta.",
      },
      {
        texto: "Vendes hamburguesas. ¿Usas IA para que la foto del catálogo se vea perfecta?",
        opciones: ["Sí, se ve más profesional", "No: si el cliente va a comparar la foto con lo que recibe, la foto tiene que ser real", "Solo si la IA es buena"],
        correcta: 1,
        explicacion: "La IA inventa colores y formas. En comida y maquillaje el cliente compara y se decepciona. Para fondos de productos que no se comen, sí se vale.",
      },
      {
        texto: "¿Cuál descripción de producto vende mejor?",
        opciones: ["«Pastel de tres leches»", "«Pastel de 3 leches para 20 personas, incluye dedicatoria»", "«3L-20P»"],
        correcta: 1,
        explicacion: "Contesta dos preguntas antes de que las hagan (para cuántos y qué incluye) y usa el nombre que usa tu cliente, no tu código interno.",
      },
    ],
  },
  "whatsapp-que-contesta-solo/1/4": {
    preguntas: [
      {
        texto: "Le mandaste cotización a un cliente hace cinco días y no contestó. ¿Qué etiqueta tiene y qué haces en tu ritual de la noche?",
        opciones: [
          "NUEVO; esperar a que él escriba",
          "COTIZANDO; escribirle: «¿Te quedó alguna duda de lo que te pasé?»",
          "POR COBRAR; pedirle el pago",
        ],
        correcta: 1,
        explicacion: "Cada noche filtras COTIZANDO y escribes a los que llevan más de 3 días. Preguntas por dudas, no por una decisión: abre la conversación sin presionar.",
      },
      {
        texto: "Ya terminaste el trabajo y falta que te paguen. ¿Qué mensaje mandas?",
        opciones: [
          "«¿Cuándo me vas a pagar?»",
          "«Quedó listo tu [producto]. ¿Te lo envío por aquí o pasas por él?»",
          "No mandas nada: ya te pagará",
        ],
        correcta: 1,
        explicacion: "Preguntas por la entrega o por la forma de pago, no por el dinero. Estás facilitando que te paguen, y el pago llega en la misma conversación.",
      },
      {
        texto: "¿Por qué los chats de clientes a punto de comprar «se pierden»?",
        opciones: ["Porque WhatsApp los borra", "Porque WhatsApp ordena por último mensaje, no por importancia", "Porque el cliente los archiva"],
        correcta: 1,
        explicacion: "Llegan cuarenta mensajes nuevos y la cotización se hunde. No es tu memoria: es el orden. Las etiquetas los sacan a la vista.",
      },
    ],
  },
  "whatsapp-que-contesta-solo/1/5": {
    preguntas: [
      {
        texto: "¿Qué parte del mensaje de reconquista hace que la gente conteste sin sentirse presionada?",
        opciones: ["Una promoción que vence hoy", "La puerta abierta: «y si ya lo resolviste, sin problema»", "Mandarlo dos veces"],
        correcta: 1,
        explicacion: "Contexto + novedad + puerta abierta. Decirle que puede decir que no es lo que quita la incomodidad, y por eso contestan.",
      },
      {
        texto: "Quieres escribirle a 60 clientes dormidos. ¿Cómo los mandas?",
        opciones: ["Los 60 hoy, el mismo mensaje", "Cinco al día, martes y miércoles, con la primera línea personalizada", "Un lunes temprano, a todos"],
        correcta: 1,
        explicacion: "Muchos mensajes iguales en ráfaga pueden hacer que WhatsApp te marque como spam y perder el número. Cinco al día, espaciados, y personalizando la primera línea.",
      },
      {
        texto: "Un cliente te contesta «ahorita no». ¿Qué haces?",
        opciones: [
          "Le insisto en una semana",
          "«Va, sin problema. Cualquier cosa aquí ando», y lo dejas",
          "Le ofrezco un descuento para convencerlo",
        ],
        correcta: 1,
        explicacion: "Dijo ahorita, no nunca. Si no lo quemas insistiendo, puede volver dentro de meses.",
      },
    ],
  },
  // ─── Menú con link ───────────────────────────────────────────────────────
  "menu-con-link/1/3": {
    preguntas: [
      {
        texto: "Tus quesadillas te dejan más ganancia que los tacos. ¿Dónde van en su categoría?",
        opciones: ["En medio, para que se descubran", "En el primer o el último lugar", "Al final de todo el menú"],
        correcta: 1,
        explicacion: "De cualquier lista se recuerda el principio y el final; el centro se difumina. Ahí va lo que más margen te deja, no lo más caro.",
      },
      {
        texto: "Tienes 15 tipos de tacos en una sola categoría. ¿Qué haces?",
        opciones: ["Los dejo: más variedad vende más", "Dejo máximo siete y roto el resto como especial de la semana", "Les pongo foto a todos"],
        correcta: 1,
        explicacion: "Con quince opciones la gente piensa «no sé cuál» y muchas veces termina en «mejor ya no». Y si todo tiene foto, nada destaca: foto solo en 3 a 5.",
      },
      {
        texto: "¿Qué precio se ve más honesto en el menú de una fonda?",
        opciones: ["$149", "$150", "$170 tachado y $150 al lado"],
        correcta: 1,
        explicacion: "En comida, terminar en 99 se lee como truco de tienda, y un precio tachado en digital se lee como que subiste. Número redondo y ya.",
      },
    ],
  },
  "menu-con-link/1/4": {
    preguntas: [
      {
        texto: "Un cliente te escribe «¿qué tienen?». ¿Qué contestas primero?",
        opciones: ["«¿Para cuántas personas?»", "El link del menú, con «¿Qué se te antoja?»", "La lista completa escrita a mano"],
        correcta: 1,
        explicacion: "Primero que vea, luego conversamos. Si empiezas preguntando, lo interrogas antes de que sepa qué quiere.",
      },
      {
        texto: "Te escriben «quiero lo de la foto» y no sabes cuál. ¿Qué mandas?",
        opciones: [
          "«¿Cuál foto?»",
          "«¿El de la foto del pastor o el de la portada? Los dos están aquí: [link]. Dime cuál y para cuántas personas»",
          "Todas las fotos otra vez",
        ],
        correcta: 1,
        explicacion: "Una pregunta con dos opciones, el link y el siguiente dato que necesitas: la duda se vuelve pedido en un solo mensaje, no en cuatro.",
      },
      {
        texto: "Subiste tu estado con el link escrito dentro de la imagen y nadie pudo abrirlo. ¿Por qué?",
        opciones: ["El link estaba mal", "Un link dibujado en la imagen no se puede tocar", "Los estados no aceptan links"],
        correcta: 1,
        explicacion: "Pega el link como texto o en el pie de la foto. Dentro de la imagen solo es un dibujo.",
      },
    ],
  },
  "menu-con-link/1/5": {
    preguntas: [
      {
        texto: "¿Cuándo empiezas a preparar un pedido?",
        opciones: ["En cuanto el cliente dice qué quiere", "Cuando el cliente contesta «sí» a tu confirmación escrita", "Cuando llega a recogerlo"],
        correcta: 1,
        explicacion: "Ningún pedido se prepara sin confirmación escrita: queda firme, por escrito, y se acaban los pedidos fantasma.",
      },
      {
        texto: "Te escriben «quiero unos tacos». ¿Qué mandas?",
        opciones: [
          "Cinco preguntas, una por una",
          "Tu respuesta /pedido con los cinco datos: qué, cuántos, a qué hora, entrega o recoge, a nombre de quién",
          "El total aproximado",
        ],
        correcta: 1,
        explicacion: "Cada pregunta suelta es un mensaje que quizá no alcanzas a contestar a tiempo. Con el formato, el pedido llega completo en uno.",
      },
      {
        texto: "Recibes ocho pedidos al día. ¿Qué haces para no olvidar ninguno?",
        opciones: ["Confío en el chat", "Los anoto: hora, nombre, pedido, total y estado", "Le pido al cliente que me recuerde"],
        correcta: 1,
        explicacion: "Un minuto por pedido. El que no anota olvida, y un pedido olvidado es la historia que ese cliente va a contar de tu negocio. Además, al final del día sabes qué se vendió más.",
      },
    ],
  },
  // ─── Un mes de publicaciones ─────────────────────────────────────────────
  "un-mes-de-publicaciones/1/2": {
    preguntas: [
      {
        texto: "Tomas la foto del producto con la ventana detrás y sale oscura. ¿Qué cambias?",
        opciones: ["Uso el flash", "Me pongo de espaldas a la ventana, con el producto de frente a la luz", "Subo el brillo al máximo al editar"],
        correcta: 1,
        explicacion: "Es contraluz: el celular expone para la ventana y el producto queda en sombra. La luz tiene que darle de frente o de lado al producto.",
      },
      {
        texto: "¿Cuál de los cuatro planos es el que casi nadie toma y mejor funciona?",
        opciones: ["El producto completo", "El proceso: tus manos trabajando", "El contexto del local"],
        correcta: 1,
        explicacion: "A la gente le interesa cómo se hace lo que compra, y el proceso dice que hay una persona real detrás.",
      },
      {
        texto: "Tienes una estética. ¿Para cuál de estas usarías IA?",
        opciones: ["Mostrar un resultado de maquillaje más bonito", "Un fondo de temporada para anunciar que abres en diciembre", "Mejorar la piel de una clienta en la foto"],
        correcta: 1,
        explicacion: "Decoración de temporada sí; resultados de belleza nunca: prometes algo que no vas a entregar. Si el cliente va a comparar la foto con lo que recibe, tiene que ser real.",
      },
    ],
  },
  "un-mes-de-publicaciones/1/3": {
    preguntas: [
      {
        texto: "Son las 11 de la noche y no sabes qué publicar mañana. ¿Qué te falta según la lección?",
        opciones: ["Creatividad", "Estructura: decidir de cuál de los cuatro pilares toca", "Más seguidores"],
        correcta: 1,
        explicacion: "La pregunta deja de ser «¿qué publico?» y pasa a ser «¿de cuál pilar toca hoy?». Esa sí tiene respuesta.",
      },
      {
        texto: "Una publicación dice «la torta que aguanta hasta las 3 de la tarde sin que te dé hambre». ¿Qué pilar es?",
        opciones: ["Producto", "Beneficio", "Prueba", "Persona"],
        correcta: 1,
        explicacion: "Es el mismo producto dicho como lo que le resuelve al cliente. «Torta de milanesa $65» sería producto; una reseña sería prueba; tu cara trabajando, persona.",
      },
      {
        texto: "La IA te dio 30 publicaciones. ¿Cuál es tu trabajo?",
        opciones: ["Publicarlas tal cual", "Curar: leerlas de corrido, rehacer las que no suenan a ti y corregir datos", "Escribirlas otra vez desde cero"],
        correcta: 1,
        explicacion: "Curar, no crear. Esos 40 minutos de revisión son los que hacen que el contenido sea tuyo y no invente precios que no tienes.",
      },
    ],
  },
  "un-mes-de-publicaciones/1/4": {
    preguntas: [
      {
        texto: "¿Cuál es el mejor gancho para el post de un taller mecánico?",
        opciones: ["«¡Descubre la calidad que mereces!»", "«Ese ruidito lleva dos meses y ya lo normalizaste»", "«Promoción de diagnóstico este mes»"],
        correcta: 1,
        explicacion: "El gancho nombra un problema que el cliente ya tenía. «Descubre la calidad que mereces» es de folleto (la IA las hace así) y «promoción de diagnóstico» solo pide sin dar nada.",
      },
      {
        texto: "¿Qué llamado a la acción funciona mejor para un negocio chico?",
        opciones: ["«Visita nuestro sitio web»", "«Mándame WhatsApp con la palabra RUIDO»", "«Síguenos para más»"],
        correcta: 1,
        explicacion: "La palabra clave filtra al que va en serio, abre una conversación uno a uno y la venta se cierra en el chat, que es tu cancha.",
      },
      {
        texto: "¿Cuántos posts de venta directa publicas por semana?",
        opciones: ["Uno", "Uno cada día", "Ninguno: solo contenido de valor"],
        correcta: 0,
        explicacion: "Máximo uno por semana. Los otros pilares construyen la confianza que hace que ese funcione; sin ellos el perfil se vuelve un catálogo de promociones que nadie mira.",
      },
    ],
  },
  "un-mes-de-publicaciones/1/5": {
    preguntas: [
      {
        texto: "¿Para qué sirven sobre todo las historias diarias?",
        opciones: ["Conseguir seguidores nuevos", "Mantener presente tu negocio con quien ya te compró", "Reemplazar el feed"],
        correcta: 1,
        explicacion: "El feed conquista al nuevo; las historias mantienen al que ya te compró, todos los días, entre las de sus amigos.",
      },
      {
        texto: "Subes una encuesta «¿Reabrimos pedidos el viernes?» y 12 personas votan que sí. ¿Qué haces?",
        opciones: [
          "Nada, ya sé que hay interés",
          "Escribirles directo: «Vi que votaste que sí, ¿te aparto uno?»",
          "Publicar otra encuesta",
        ],
        correcta: 1,
        explicacion: "La encuesta te dice quiénes, con nombre. Esa persona ya levantó la mano: tu mensaje no es frío, es el siguiente paso.",
      },
      {
        texto: "Tu historia de hoy salió con la mano un poco movida. ¿La repites?",
        opciones: ["Sí, hasta que quede perfecta", "No: caduca en 24 horas y lo imperfecto se ve real", "La borro y no subo nada"],
        correcta: 1,
        explicacion: "Sin perfeccionismo: la rutina es de cinco minutos. Una historia con el delantal manchado genera más confianza que una producción impecable.",
      },
    ],
  },
  // ─── Cotiza en 5 minutos ─────────────────────────────────────────────────
  "cotiza-en-5-minutos/1/2": {
    preguntas: [
      {
        texto: "Quieres ganar $1,200 al día. ¿Entre cuántas horas lo divides para sacar tu precio por hora?",
        opciones: ["8, la jornada completa", "5 o 6, las horas productivas reales", "10, para que salga más barato"],
        correcta: 1,
        explicacion: "Nadie factura 8 horas: se van en traslados, ir por material, cotizar y cobrar. Dividir entre 8 te deja casi $500 abajo en cada trabajo.",
      },
      {
        texto: "En el grupo del gremio te dicen que el trabajo se cobra $3,500. ¿Qué haces?",
        opciones: ["Cobro $3,500", "Hago mi cuenta con mis costos y cobro lo que me sale", "Cobro $3,000 para ganarles"],
        correcta: 1,
        explicacion: "No sabes los costos del otro. Con el mismo precio, un plomero ganaba $900 y otro perdía $200 sin enterarse. Copiar precios es la forma más común de trabajar gratis.",
      },
      {
        texto: "Ofreces tres paquetes: básico $3,800, recomendado $4,900 y premium $7,200. ¿Para qué sirve el premium?",
        opciones: ["Para ganar más con cada cliente", "Para que el de en medio se vea razonable", "Para confundir al cliente"],
        correcta: 1,
        explicacion: "La mayoría elige el de en medio, y el premium hace que los $4,900 se vean mesurados. Las tres opciones tienen que ser reales y entregables.",
      },
    ],
  },
  "cotiza-en-5-minutos/1/3": {
    preguntas: [
      {
        texto: "Te escriben «¿cuánto cuesta una ventana?». ¿Qué contestas?",
        opciones: ["Un precio aproximado para no perderlo", "Tus 6 preguntas (/cotiza) antes de dar cualquier número", "«Depende»"],
        correcta: 1,
        explicacion: "Antes del precio, diagnóstico. Cualquier número sin medidas ni fotos va a estar mal, y si está bajo lo vas a tener que sostener.",
      },
      {
        texto: "¿Qué le pides a la IA al hacer la cotización?",
        opciones: ["Que calcule los precios", "Que redacte la descripción; los números los pones tú", "Que decida qué incluir"],
        correcta: 1,
        explicacion: "La IA redacta, los números los pones tú. Una IA que calcula precios inventa, y un precio inventado se paga con tu dinero.",
      },
      {
        texto: "¿Con qué mensaje mandas el PDF?",
        opciones: [
          "«Espero que sea de tu agrado; cualquier cosa lo ajustamos»",
          "«Te mando la cotización de [trabajo]. Tiene vigencia de 7 días. Cualquier duda, aquí estoy»",
          "Solo el PDF, sin texto",
        ],
        correcta: 1,
        explicacion: "Las frases de disculpa se leen como que tu precio se puede bajar. Dos líneas, con vigencia, y nada más.",
      },
    ],
  },
  "cotiza-en-5-minutos/1/4": {
    preguntas: [
      {
        texto: "Pasaron 24 horas desde que mandaste la cotización. ¿Qué escribes?",
        opciones: ["«¿Qué decidiste?»", "«¿Te quedó alguna duda de la cotización?»", "Nada: si le interesa, escribe"],
        correcta: 1,
        explicacion: "«¿Qué decidiste?» obliga a justificarse y lo fácil es no contestar. Preguntar por dudas abre conversación, y muchas veces sí había una que nunca iba a preguntar solo.",
      },
      {
        texto: "¿Cuál de los tres toques suele recuperar más cotizaciones?",
        opciones: ["El de las 24 horas", "El de los 7 días: «vence este fin de semana; si no es ahora, sin problema»", "Un cuarto toque a las dos semanas"],
        correcta: 1,
        explicacion: "Cierra con dignidad y quita la presión; muchas veces ahí contestan «hagámoslo». Y después del tercero paras: seguir escribiendo incomoda.",
      },
      {
        texto: "El cliente ya casi dice que sí. ¿Qué preguntas?",
        opciones: ["«¿Entonces sí lo vas a hacer?»", "«¿Te aparto la fecha?»", "«¿Seguro que no quieres pensarlo?»"],
        correcta: 1,
        explicacion: "Pregunta por el siguiente paso pequeño. Decidir gastar $4,900 es grande; decir «apártame el jueves» es chico, y lleva a lo primero sin que duela.",
      },
    ],
  },
  "cotiza-en-5-minutos/1/5": {
    preguntas: [
      {
        texto: "El cliente dice «otro me cobra menos». ¿Qué respondes?",
        opciones: [
          "Bajo mi precio para igualarlo",
          "«Compara. Yo incluyo garantía de 6 meses por escrito y material de marca; si el otro también, ve con él»",
          "Le digo que el otro trabaja mal",
        ],
        correcta: 1,
        explicacion: "Seguridad, no descuento. No descalificas a nadie, no bajas precio y le das permiso de irse, lo que desarma la negociación.",
      },
      {
        texto: "Te piden «hazme precio». ¿Cómo das un descuento sin dañar tu precio?",
        opciones: [
          "Bajo 10% y ya",
          "A cambio de algo: fecha que te conviene o quitar una partida que él resuelve",
          "Nunca doy descuento",
        ],
        correcta: 1,
        explicacion: "Nunca bajes el precio: quita alcance. Si bajas sin quitar nada confirmas que estaba inflado, y lo va a intentar siempre.",
      },
      {
        texto: "«Es que no tengo ahorita.» ¿Qué ofreces?",
        opciones: ["Un precio más bajo", "El mismo precio, apartado con 50% y el resto contra entrega", "Esperar a que tenga"],
        correcta: 1,
        explicacion: "Es el único regateo donde el problema es real, y se resuelve con la forma de pago, no cobrando menos.",
      },
    ],
  },
  // ─── Ventas con IA ───────────────────────────────────────────────────────
  "ventas-con-ia/2/1": {
    preguntas: [
      {
        texto: "Te escribe alguien interesada, pero la decisión la toma su esposo y ella solo cotiza. ¿Qué filtro falla?",
        opciones: ["Urgencia", "Dinero", "Decisión"],
        correcta: 2,
        explicacion: "Si no puede decir que sí sin pedir permiso, no es tu cliente ideal: es alguien que pregunta. Atiéndela bien, pero no le dediques tu mejor hora.",
      },
      {
        texto: "¿Cuál perfil de cliente ideal sirve de verdad?",
        opciones: [
          "«Mujeres de 25 a 45 años que quieren verse bien»",
          "«Mujeres que se casan en los próximos 3 meses, ya tienen salón y quieren llegar con la piel lista; deciden ellas y pagan en 2 o 3 partes»",
          "«Todo el que necesite mis servicios»",
        ],
        correcta: 1,
        explicacion: "El primero describe a media ciudad. El segundo pasa los tres filtros y te dice dónde encontrarla: grupos de novias, salones, fotógrafos de bodas.",
      },
      {
        texto: "¿De dónde sale tu perfil de cliente ideal?",
        opciones: ["De lo que imaginas que sería ideal", "De lo que se repite entre tus tres mejores clientes reales", "De lo que te sugiera la IA"],
        correcta: 1,
        explicacion: "No se inventa: se descubre en los que pagaron sin regatear, volvieron o te recomendaron. La IA solo ayuda a ordenarlo, sin agregar datos.",
      },
    ],
  },
  "ventas-con-ia/2/2": {
    preguntas: [
      {
        texto: "¿Cuál es el único trabajo del primer mensaje?",
        opciones: ["Vender", "Que te contesten", "Dar tus precios"],
        correcta: 1,
        explicacion: "La venta viene después, en la conversación. Un primer mensaje que intenta vender todo se lee como anuncio y se deja de leer.",
      },
      {
        texto: "¿Cómo termina un buen mensaje inicial?",
        opciones: ["Con tu promoción de la semana", "Con una pregunta que se conteste con un «sí» o un dato", "Con tus años de experiencia"],
        correcta: 1,
        explicacion: "«¿Ya tienen quien les lleve la contabilidad?» se contesta en dos segundos sin comprometerse a nada. Eso consigue la respuesta.",
      },
      {
        texto: "Un mensaje dice «somos una empresa líder con más de 10 años de experiencia». ¿Qué le falla?",
        opciones: ["Nada, genera confianza", "Es genérico, habla de ti y no menciona nada de la persona", "Le falta el precio"],
        correcta: 1,
        explicacion: "La fórmula es algo suyo que viste + lo que le resuelves en concreto + una pregunta fácil. «Empresa líder» y «calidad» están en la lista de lo que no va.",
      },
    ],
  },
  "ventas-con-ia/2/3": {
    preguntas: [
      {
        texto: "«Carpintería fina con más de 15 años de experiencia. Calidad garantizada.» ¿Qué le falta a esa oferta?",
        opciones: ["Más años", "El resultado para el cliente, con plazo, y una prueba", "Un descuento"],
        correcta: 1,
        explicacion: "Los años son tuyos, no del cliente. «Cocinas a la medida instaladas en 3 semanas, con render antes de cortar y 12 cocinas entregadas» sí dice qué obtiene y por qué creerte.",
      },
      {
        texto: "Tu negocio es nuevo y no tienes casos que enseñar. ¿Qué usas como prueba?",
        opciones: ["«Confía en mí»", "Una garantía que sí puedas cumplir", "Un número aproximado de clientes"],
        correcta: 1,
        explicacion: "Una garantía concreta demuestra que confías en tu trabajo. Los números inventados o que no puedes enseñar no cuentan como prueba.",
      },
      {
        texto: "Al pulir tu oferta con IA, ¿qué instrucción es la más importante?",
        opciones: ["«Hazla más atractiva»", "«No agregues promesas, números ni garantías que no te di»", "«Hazla más larga»"],
        correcta: 1,
        explicacion: "La IA tiende a inflar. Tu oferta tiene que ser algo que puedas cumplir, y si algo suena vago, que te lo diga en vez de rellenarlo.",
      },
    ],
  },
  "ventas-con-ia/2/4": {
    preguntas: [
      {
        texto: "Tienes 30 minutos, dos veces por semana, para buscar clientes. ¿Cuántos canales trabajas?",
        opciones: ["Todos los que pueda abrir", "Uno principal, y como mucho uno de apoyo", "Ninguno: esperar recomendaciones"],
        correcta: 1,
        explicacion: "Cinco canales a medias terminan en «las redes no sirven». Un canal bien trabajado, con rutina por escrito, sí se sostiene.",
      },
      {
        texto: "Karla hace tratamientos de piel para novias. ¿Qué canal le puede traer más clientas con menos esfuerzo?",
        opciones: ["Publicar en TikTok diario", "Alianzas con coordinadoras de bodas y salones", "Anuncios a toda la ciudad"],
        correcta: 1,
        explicacion: "Necesita estar cerca de los negocios que hablan con novias antes que ella. Las alianzas y las recomendaciones casi nadie las trabaja con método y traen a los clientes que menos regatean.",
      },
      {
        texto: "Llevas dos semanas en tu canal y no pasa nada. ¿Qué revisas primero?",
        opciones: ["Si cumpliste la rutina completa", "Cambiar de canal de inmediato", "Pagar publicidad"],
        correcta: 0,
        explicacion: "Primero, si la rutina se cumplió. Si sí, dale dos semanas más antes de cambiar. Y si no te alcanza el tiempo, redúcela a la mitad y cúmplela completa.",
      },
    ],
  },
  "ventas-con-ia/3/1": {
    preguntas: [
      {
        texto: "Te escriben «¿cuánto cuesta una afinación?». ¿Qué contestas?",
        opciones: [
          "El precio, rápido",
          "«¿Qué carro es y de qué año? ¿Le has notado algo raro?»",
          "La lista completa de servicios con precios",
        ],
        correcta: 1,
        explicacion: "El precio llega después de entender el problema, junto con lo que resuelve. Soltarlo a secas o mandar todo de golpe abruma y el cliente deja de contestar.",
      },
      {
        texto: "¿Cuál es la regla de oro del guion de conversación?",
        opciones: ["Tú explicas todo con detalle", "El cliente escribe más que tú", "Cerrar en el primer mensaje"],
        correcta: 1,
        explicacion: "Con preguntas abiertas («¿qué es lo que más te molesta de…?») el cliente cuenta su problema, y tú llegas a la propuesta sin presionar.",
      },
      {
        texto: "Ya diste precio y quieres el siguiente paso. ¿Cómo lo preguntas?",
        opciones: ["«¿Te interesa o no?»", "«¿Te acomoda traerlo mañana temprano o el jueves?»", "«Avísame»"],
        correcta: 1,
        explicacion: "Dos opciones concretas en lugar de un «¿sí o no?». Elegir un día es más fácil que decidir si compra.",
      },
    ],
  },
  "ventas-con-ia/3/2": {
    preguntas: [
      {
        texto: "Mandaste cotización y el cliente dijo «va, lo checo». Pasaron dos días. ¿Qué escribes?",
        opciones: [
          "«¿Qué pasó? ¿Ya lo pensaste?»",
          "Una pregunta concreta sobre su duda, por ejemplo cómo es el anticipo",
          "Nada, para no verme desesperado",
        ],
        correcta: 1,
        explicacion: "Cada mensaje de seguimiento aporta algo nuevo. «¿Qué pasó?» no da nada y hace que el cliente se sienta perseguido; no escribir le deja la venta a quien sí lo hace.",
      },
      {
        texto: "¿Cuál mensaje de la secuencia suele traer más respuestas?",
        opciones: ["El del día 0", "El del día 5, con fotos", "El del día 9, que da permiso de decir que no"],
        correcta: 2,
        explicacion: "Le quita presión al cliente. Un «ahorita no, en diciembre» es información valiosa, no un fracaso.",
      },
      {
        texto: "¿Cómo te acuerdas a quién le toca seguimiento cada mañana?",
        opciones: ["De memoria", "Con etiquetas en WhatsApp Business o una hoja con fecha y siguiente toque", "Esperando a que el cliente escriba"],
        correcta: 1,
        explicacion: "Lo que no funciona es acordarte «cuando puedas». Con etiquetas como «Seguimiento día 2» sabes a quién escribirle sin pensar.",
      },
    ],
  },
  "ventas-con-ia/3/3": {
    preguntas: [
      {
        texto: "Un cliente dice «está caro». ¿Cuál respuesta sigue el método de las tres A?",
        opciones: [
          "«No es caro: usamos los mejores materiales»",
          "«Te entiendo, es una inversión fuerte. ¿Lo comparas con otra cotización o es más por pagarlo de golpe?»",
          "«Te hago 20% de descuento»",
        ],
        correcta: 1,
        explicacion: "Aceptar, aclarar y aportar. Contradecirlo lo pone a defender su postura; preguntar hace que te cuente la duda real, y luego respondes con una prueba.",
      },
      {
        texto: "«Lo voy a pensar.» ¿Qué suele haber detrás y qué preguntas?",
        opciones: [
          "Que no le interesa; no preguntas nada",
          "Una duda que no dijo; «¿Qué parte te gustaría pensar con calma?»",
          "Que quiere descuento; lo ofreces",
        ],
        correcta: 1,
        explicacion: "Casi siempre es una duda con miedo detrás. Si sale, la puedes resolver; si no, al menos no se vuelve semanas de silencio.",
      },
      {
        texto: "Un cliente de verdad no puede pagar. ¿Qué haces?",
        opciones: ["Insisto hasta cerrar", "Lo acepto: forzar la venta trae un cliente molesto y una mala reseña", "Le bajo a la mitad"],
        correcta: 1,
        explicacion: "No toda objeción se supera, y está bien. Puedes ofrecer dividir el pago si aplica, pero no forzar.",
      },
    ],
  },
  "ventas-con-ia/3/4": {
    preguntas: [
      {
        texto: "¿Qué mensaje de bienvenida funciona mejor?",
        opciones: [
          "«¡Gracias por escribirnos! Visita nuestra página»",
          "«¿Buscas cocina nueva, reparación o una cotización para más adelante? Te respondo en persona en menos de una hora»",
          "Ninguno: contestar siempre a mano",
        ],
        correcta: 1,
        explicacion: "La pregunta clasifica: cuando abras WhatsApp sabes a quién atender primero. Mandar a la página es un muro para alguien que quería hablar.",
      },
      {
        texto: "Tu mensaje de ausencia dice «respuesta inmediata» y contestas al día siguiente. ¿Qué pasa?",
        opciones: ["Nada", "Es peor que no tener mensaje: prometiste algo que no cumples", "El cliente ni lo nota"],
        correcta: 1,
        explicacion: "Di siempre la verdad sobre cuándo contestas y cúmplelo. Mejor: «mañana a partir de las 9 te contesto; si quieres adelantar, cuéntame qué necesitas».",
      },
      {
        texto: "Configuraste la bienvenida y quieres probarla. ¿Cómo?",
        opciones: [
          "Escribiéndote desde tu propio número",
          "Pidiéndole a alguien que te escriba desde un número que nunca te haya escrito, dentro y fuera de horario",
          "No hace falta probarla",
        ],
        correcta: 1,
        explicacion: "La bienvenida solo se manda a quien escribe por primera vez o tras 14 días sin hablar. Probar dentro y fuera de horario confirma que las dos llegan.",
      },
    ],
  },
  "ventas-con-ia/4/1": {
    preguntas: [
      {
        texto: "¿Cuál de estos números NO va en tu tablero de ventas?",
        opciones: ["Cotizaciones enviadas", "Seguidores nuevos", "Cierres (anticipos recibidos)"],
        correcta: 1,
        explicacion: "Seguidores, likes y alcance pueden subir sin que vendas un peso más. El tablero lleva cinco: contactos, respuestas, conversaciones, propuestas y cierres.",
      },
      {
        texto: "Karla tiene 20 contactos → 15 respuestas → 12 conversaciones → 10 propuestas → 1 cierre. ¿Qué debe trabajar?",
        opciones: ["Conseguir más contactos", "El paso de propuesta a cierre: objeciones o seguimiento", "Su mensaje inicial"],
        correcta: 1,
        explicacion: "Todo va bien hasta la propuesta; ahí se cae a 1 de 10. Más contactos solo meterían más gente a la misma fuga.",
      },
      {
        texto: "¿Qué columna del tablero es la más importante?",
        opciones: ["Contactos", "Cierres", "«Qué cambio probé»"],
        correcta: 2,
        explicacion: "Es la que te dice qué produjo cada resultado. Sin ella tienes números, pero no sabes qué los movió.",
      },
    ],
  },
  "ventas-con-ia/4/2": {
    preguntas: [
      {
        texto: "Esta semana quieres mejorar el mensaje inicial, el seguimiento y la oferta. ¿Qué haces?",
        opciones: ["Cambio los tres de una vez", "Cambio uno, con una hipótesis escrita, y mido una semana", "Espero a tener más clientes"],
        correcta: 1,
        explicacion: "Si cambias tres cosas y sube (o baja), no sabes cuál fue. Una pieza por semana, con el número de antes y el de después.",
      },
      {
        texto: "Mandaste la versión nueva de tu mensaje a 3 personas y ninguna contestó. ¿Qué concluyes?",
        opciones: ["Que es peor: regreso a la anterior", "Todavía nada: con 3 no se sabe; úsala con unas 20", "Que la IA no sirve"],
        correcta: 1,
        explicacion: "Dale a cada cambio al menos una semana y un número razonable de intentos. Con 20 ya se ve una tendencia.",
      },
      {
        texto: "La versión nueva funcionó peor que la anterior. ¿Qué pasa?",
        opciones: [
          "Perdiste la semana",
          "Regresas a la anterior, que guardaste, y pruebas otra hipótesis",
          "Dejas de medir",
        ],
        correcta: 1,
        explicacion: "Por eso no se borra la versión anterior. Que una hipótesis no se cumpla también es aprender.",
      },
    ],
  },
  "ventas-con-ia/4/3": {
    preguntas: [
      {
        texto: "¿Cuánto tiempo a la semana necesitas para tu semana tipo al empezar?",
        opciones: ["Lo más que puedas, 6 horas o más", "Menos de lo que crees que puedes, y cumplirlo", "No hace falta agendarlo"],
        correcta: 1,
        explicacion: "Una semana tipo de 2 horas que cumples vale más que una de 6 que abandonas en la segunda semana. Y si no está en el calendario, no existe.",
      },
      {
        texto: "Un cliente pregunta precio y deja de contestar. ¿Qué pieza del sistema entra en juego después de tu propuesta?",
        opciones: ["El canal", "El seguimiento", "El perfil de cliente ideal"],
        correcta: 1,
        explicacion: "El canal trae gente, el mensaje inicial consigue respuesta, el guion lleva a la propuesta y el seguimiento evita que se enfríe.",
      },
      {
        texto: "Una pieza está escrita pero no la usas. ¿Cómo la calificas en tu mapa?",
        opciones: ["La tengo", "A medias", "No cuenta"],
        correcta: 1,
        explicacion: "«La tengo» es escrita y usada cada semana. Si está a medias, ponla en tu semana tipo con día y hora.",
      },
    ],
  },
  "ventas-con-ia/4/4": {
    preguntas: [
      {
        texto: "Llega «Hola, vi tu publicación. ¿Cuánto cuesta?». ¿Qué pieza usas primero?",
        opciones: ["Tu oferta con el precio", "Tu guion: una pregunta para entender qué necesita", "Tu seguimiento del día 2"],
        correcta: 1,
        explicacion: "Primero entiendes, luego el precio llega junto con lo que resuelve y su prueba. Es la misma regla de la afinación del taller, en otro giro.",
      },
      {
        texto: "«Suena bien, pero está caro y la verdad no te conozco.» ¿Qué tiene este mensaje?",
        opciones: ["Una objeción de precio", "Dos objeciones: precio y confianza", "Un rechazo definitivo"],
        correcta: 1,
        explicacion: "Respondes con las tres A a las dos: aceptar, aclarar y aportar una prueba (reseña, fotos de un trabajo parecido, garantía).",
      },
      {
        texto: "Ahora imagina que vendes pasteles en vez de cocinas. ¿Qué cambia del sistema?",
        opciones: [
          "Todo: es otro negocio",
          "Los textos y los ejemplos; las piezas (guion, objeciones, seguimiento, tablero) son las mismas",
          "Solo el tablero",
        ],
        correcta: 1,
        explicacion: "Si entendiste el principio y no solo la receta, puedes aplicarlo a cualquier giro: preguntar antes del precio, responder objeciones con pruebas, dar seguimiento que aporta y medir.",
      },
    ],
  },
};
