import type { Practica } from "./practica";

// Banco de práctica de Monetiza IA. Mismo criterio que el resto: cada
// pregunta sale del texto de su misión, prefiere situaciones a definiciones
// y la explicación enseña el porqué. La primera de cada misión se usa como
// pregunta previa, antes de leer.

const q = (texto: string, opciones: string[], correcta: number, explicacion: string) => ({
  texto, opciones, correcta, explicacion,
});

export const PRACTICA_MONETIZA: Record<string, Practica> = {
  // ─── Fase 0 · Diagnóstico ───────────────────────────────────────────────
  "monetiza-ia/1/1": {
    preguntas: [
      q("Quieres empezar a ganar dinero con IA. ¿Cuál es la mejor primera pregunta?",
        ["¿Qué negocio de IA está de moda?", "¿Qué tengo hoy: habilidades, horas, contactos y dinero?", "¿Qué herramienta de IA es la mejor?"], 1,
        "La ruta que te conviene sale de lo que ya tienes. Copiar lo que está de moda te pone a competir con las habilidades, el tiempo y los contactos de otra persona."),
      q("Tu IA te recomienda cinco rutas «igual de buenas». ¿Qué haces?",
        ["Intentas las cinco para ver cuál funciona", "Le pides que elija una según tus contactos y horas reales, y qué la haría equivocada", "Eliges la que más se ve en redes"], 1,
        "Sin criterios, todo parece igual de bueno. Pedirle que decida con tus datos reales, y que diga qué la haría fallar, te da una decisión con fundamento."),
      q("Contestas que tienes 2 horas por semana y ningún contacto. ¿Qué significa para tu diagnóstico?",
        ["Que no puedes monetizar con IA", "Son datos que orientan la ruta: servicio pequeño, y conseguir contactos en la Fase 6", "Que debes escribir más horas para que el perfil salga mejor"], 1,
        "El diagnóstico no califica: describe tu punto de partida. Con pocas horas conviene un servicio pequeño, y los contactos se construyen más adelante en el curso."),
    ],
  },

  // ─── Fase 1 · Descubre ──────────────────────────────────────────────────
  "monetiza-ia/2/1": {
    preguntas: [
      q("¿Por qué paga un cliente, casi siempre?",
        ["Por usar inteligencia artificial", "Por dejar de tener un problema o conseguir algo que quiere", "Por la cantidad de herramientas que usas"], 1,
        "La gente paga por resultados: más clientes, menos horas perdidas, menos errores. La IA es solo la forma en que produces ese resultado."),
      q("¿Cuál de estas frases describe un RESULTADO y no una tarea?",
        ["«Hago chatbots»", "«Transcribo audios con IA»", "«Nadie se queda sin respuesta en WhatsApp cuando estoy ocupado»"], 2,
        "Las otras dos dicen lo que tú haces. La tercera dice qué cambia para el cliente, y eso es por lo que paga."),
      q("Tu frase de venta todavía responde a «¿y eso qué me da?». ¿Qué significa?",
        ["Que ya llegaste al resultado", "Que todavía no llegaste al resultado final: sigue preguntando", "Que la frase es demasiado larga"], 1,
        "Si la pregunta aún tiene respuesta, estás describiendo un paso intermedio. El resultado es donde el cliente ya no necesita preguntar más."),
    ],
  },
  "monetiza-ia/2/2": {
    preguntas: [
      q("¿Dónde conviene buscar tus primeras oportunidades de negocio con IA?",
        ["En listas de «ideas de negocio con IA» de internet", "En el cruce de lo que sabes, lo que disfrutas y a quién conoces", "En lo que más dinero parece dejar a otros"], 1,
        "Ahí tienes ventaja: entiendes el problema y sabes hablar con quien lo tiene. Las listas de internet traen ideas de otras personas."),
      q("Pusiste 5 en «dolor» a una oportunidad, pero no tienes ningún hecho que lo respalde. ¿Qué haces?",
        ["La dejas en 5: es tu intuición", "La bajas a 3 hasta tener un hecho, como quejas reales o conversaciones", "La subes a la primera posición"], 1,
        "Las puntuaciones con entusiasmo hacen que todo parezca igual de bueno. Sin un hecho que respalde el 5, es una suposición."),
      q("La IA te propone oportunidades que requieren programar y tú no programas. ¿Qué faltó?",
        ["Una herramienta más avanzada", "Decirle tus límites: que no programas y cuántas horas tienes", "Pedirle más ideas"], 1,
        "La IA no conoce tus límites si no se los dices. Con ellos, descarta lo que no podrías hacer en poco tiempo."),
    ],
  },
  "monetiza-ia/2/3": {
    preguntas: [
      q("Antes de construir tu solución, ¿qué necesitas ver?",
        ["Un logo y un nombre para tu negocio", "El problema en el mundo real: gente que lo menciona, se queja o pierde tiempo por él", "Cuánto cobran otras personas"], 1,
        "Una oportunidad en papel es una suposición. Ver señales reales antes de construir te ahorra semanas de trabajo en algo que nadie necesita."),
      q("Buscas «automatización para restaurantes» y no encuentras ninguna queja. ¿Qué pasa probablemente?",
        ["Que el problema no existe", "Que buscas con palabras técnicas que el cliente no usa", "Que necesitas otra fuente de pago"], 1,
        "El cliente no dice «automatización»: dice «no me da tiempo» o «nadie contesta». Busca con sus palabras."),
      q("¿Cuál de estas es una señal válida para tu investigación?",
        ["«Seguro a los dentistas les cuesta agendar»", "Una reseña que dice «nunca contestan los mensajes», vista en cuatro negocios", "Una idea que se te ocurrió en la regadera"], 1,
        "Una señal es algo que viste, con su fuente. Lo que supones o imaginas no cuenta, por lógico que parezca."),
    ],
  },

  // ─── Fase 2 · Elige ─────────────────────────────────────────────────────
  "monetiza-ia/3/1": {
    preguntas: [
      q("¿Qué pasa si intentas los cinco modelos de monetización a la vez?",
        ["Multiplicas tus oportunidades", "Es la forma más segura de no terminar ninguno", "Aprendes más rápido"], 1,
        "Cada modelo pide tiempo, aprendizaje y prospectos distintos. Repartirte entre cinco te deja sin nada terminado."),
      q("Tienes pocas horas, sin audiencia, pero conoces a varios dueños de negocio. ¿Qué modelo suele quedarte más cerca para empezar?",
        ["Microproducto o software con IA", "Servicios con IA o implementación para negocios", "Productos digitales que se venden solos"], 1,
        "Los servicios y la implementación aprovechan contactos directos y no requieren audiencia. Los productos necesitan a quién venderle en cantidad."),
      q("Los productos digitales escalan mejor que los servicios. ¿Por qué Daniela no los eligió para empezar?",
        ["Porque no le gustan", "Porque no tiene audiencia a quién vendérselos y para empezar le importa la velocidad", "Porque son ilegales"], 1,
        "La escala importa después. Para empezar, pesaba más poder vender ya con los contactos que tenía."),
    ],
  },
  "monetiza-ia/3/2": {
    preguntas: [
      q("¿Cuál de estas NO es una de las tres pruebas para saber si un modelo encaja contigo?",
        ["Usa algo que ya tienes", "Es el que más dinero dejó a otra persona", "Tiene un primer cliente imaginable"], 1,
        "Las tres pruebas son: usa algo que ya tienes, cabe en tus horas reales y tiene un primer cliente imaginable. Lo que le funcionó a otro no dice nada sobre ti."),
      q("¿Para qué sirve escribir una «condición de cambio» con fecha?",
        ["Para tener excusa de abandonar", "Para no abandonar a la primera duda ni quedarte atorado si de verdad no funciona", "Para que el curso te dé más puntos"], 1,
        "Sin condición, cualquier duda te hace cambiar. Con ella, cambias solo si se cumple, en la fecha que decidiste."),
      q("Ves en redes a alguien con otro modelo y empiezas a dudar del tuyo. ¿Qué haces?",
        ["Cambias de modelo de inmediato", "Relees tu condición de cambio: si no se cumplió, sigues", "Pruebas los dos a la vez"], 1,
        "Comparar tu día 1 con el año 3 de otra persona no es un dato. Tu condición de cambio sí lo es."),
    ],
  },
  "monetiza-ia/3/3": {
    preguntas: [
      q("¿Cuál frase de nicho funciona mejor?",
        ["«Ayudo a negocios a usar IA»", "«Ayudo a restaurantes pequeños que dejan de publicar por falta de tiempo a mantener sus redes activas»", "«Ayudo a todo tipo de personas a crecer»"], 1,
        "Dice a quién, qué problema y qué resultado. Quien tiene ese problema piensa «eso es para mí»; las otras no le hablan a nadie."),
      q("¿Cómo conviene describir a tu cliente en el avatar?",
        ["Por edad y género: «hombres de 30 a 50»", "Por situación: «dueño de restaurante con un solo local que maneja él mismo sus redes»", "Por lo que te gustaría que fuera"], 1,
        "La situación explica el problema y dónde encontrarlo. La edad no dice qué le duele ni por qué te compraría."),
      q("En tu avatar escribiste que lo encuentras en «redes sociales». ¿Qué problema tiene?",
        ["Ninguno, está bien", "Es un lugar demasiado grande: necesitas un sitio donde puedas buscarlo hoy", "Debería decir «internet»"], 1,
        "«Redes sociales» no te dice dónde empezar. Un grupo concreto, un directorio o una zona en Google Maps sí."),
    ],
  },

  // ─── Fase 3 · Construye tu oferta ───────────────────────────────────────
  "monetiza-ia/4/1": {
    preguntas: [
      q("¿Qué deberías prometer en tu oferta?",
        ["Un aumento de ventas concreto", "Un resultado controlable: lo que entregas y se puede comprobar", "Lo mismo que prometen otros, pero más barato"], 1,
        "Las ventas dependen también del mercado, el producto del cliente y la suerte. Prometes lo que tu trabajo produce, y explicas cómo ayuda."),
      q("¿Cuál de estas es la mejor frase de resultado?",
        ["«Hago contenido con IA para restaurantes»", "«Duplico las ventas de tu restaurante»", "«Tu restaurante publica tres veces por semana todo el mes, sin que tú pienses qué subir»"], 2,
        "La primera describe tu tarea y la herramienta. La segunda promete algo que no controlas. La tercera se puede comprobar y depende de tu trabajo."),
      q("Tu frase de resultado dice «optimizamos tu presencia digital». ¿Qué le falta?",
        ["Nada, suena profesional", "Decir qué verá el cliente: algo que se pueda contar o ver", "Más palabras técnicas"], 1,
        "«Optimizar» no se puede comprobar. El cliente necesita saber qué recibirá para decir si se cumplió."),
    ],
  },
  "monetiza-ia/4/2": {
    preguntas: [
      q("¿Cómo debe describirse lo que recibe el cliente?",
        ["«Contenido de calidad»", "En objetos que se pueden contar: «12 imágenes y 12 textos»", "Con la lista de herramientas que usas"], 1,
        "Lo que se puede contar se puede comprobar. «Contenido de calidad» deja la puerta abierta a malentendidos."),
      q("¿Qué debe incluir siempre tu proceso de producción?",
        ["Un paso donde la IA revisa su propio trabajo", "Un paso de revisión humana antes de que llegue al cliente", "Al menos cinco herramientas"], 1,
        "La IA produce borradores. Tú decides, corriges y respondes por la calidad."),
      q("Tu lista de entregables no deja de crecer para «justificar el precio». ¿Qué haces?",
        ["Sigues agregando: más es mejor", "Te quedas con lo que produce el resultado y lo demás va a extras", "Bajas el precio"], 1,
        "Más entregables no hacen mejor la oferta: la vuelven más cara de producir. Lo que no produce el resultado puede ser un extra."),
    ],
  },
  "monetiza-ia/4/3": {
    preguntas: [
      q("Tu cliente pide «un cambio más» varias veces y el proyecto ya te cuesta más de lo que cobras. ¿Qué faltó?",
        ["Un cliente más amable", "Límites claros en el paquete: cuántos cambios y qué no incluye", "Cobrar menos"], 1,
        "No suele ser mala fe: nadie le dijo dónde terminaba el trabajo. Los límites escritos protegen a los dos."),
      q("Estás empezando. ¿Cuántos paquetes conviene ofrecer?",
        ["Tres niveles: básico, medio y premium", "Uno solo", "Todos los que se te ocurran"], 1,
        "Los niveles sirven cuando ya sabes qué pide la gente. Antes, solo confunden al cliente y a ti."),
      q("¿Cómo escribes un límite sin que suene a desconfianza?",
        ["No lo escribes: lo dices cuando pase", "Como claridad: «Incluye una ronda de cambios. Si necesitas más, te cotizo antes»", "Con letras pequeñas al final"], 1,
        "Un límite dicho con claridad y con una salida («te cotizo antes») se lee como profesionalismo, no como negativa."),
    ],
  },
  "monetiza-ia/4/4": {
    preguntas: [
      q("¿Existe una fórmula universal para ponerle precio a un servicio con IA?",
        ["Sí: cobrar por hora de uso de la IA", "No, pero puedes calcular un piso (tus costos) y estimar un techo (el valor para el cliente)", "Sí: cobrar lo mismo que la competencia"], 1,
        "No hay número mágico. Hay dos límites: debajo del piso pierdes dinero; encima del techo el cliente no lo ve razonable."),
      q("Calculas tu precio mínimo contando solo las horas de producción. ¿Qué olvidaste?",
        ["Nada", "Llamadas, revisiones, cambios y mensajes", "El costo de la luz del cliente"], 1,
        "Las horas que no son de producción también son trabajo. Si no las cuentas, tu piso queda más bajo de lo real."),
      q("Tu primer cliente pide descuento. ¿Qué conviene más?",
        ["Bajar el precio para no perderlo", "Reducir el alcance en lugar del precio", "Regalar el trabajo"], 1,
        "Si bajas el precio del mismo trabajo, enseñas que tu precio no era real. Ofrecer menos por menos mantiene el valor."),
    ],
  },
  "monetiza-ia/4/5": {
    preguntas: [
      q("¿Por qué tu propuesta se llama «Oferta V1»?",
        ["Porque es la definitiva", "Porque va a cambiar después de tus primeras conversaciones, pero sin V1 no hay nada que mejorar", "Porque es la versión barata"], 1,
        "La V1 no tiene que ser perfecta: tiene que existir. Las conversaciones reales te dirán qué ajustar."),
      q("Un prospecto pregunta si usas IA. ¿Qué respondes?",
        ["Lo niegas: le quita valor", "La verdad: la usas para avanzar más rápido y tú revisas todo antes de entregar", "Cambias de tema"], 1,
        "Esconder la IA genera desconfianza cuando el cliente se entera. Explicar cómo la usas y que tú respondes por el resultado genera confianza."),
      q("La IA agregó a tu oferta un beneficio que no le diste («aumenta tus ventas 30%»). ¿Qué haces?",
        ["Lo dejas, suena bien", "Lo borras: tu oferta solo dice lo que puedes cumplir", "Lo cambias a 20% para que suene más creíble"], 1,
        "La IA rellena huecos. Una cifra que no mediste es una promesa que no puedes sostener."),
    ],
  },

  // ─── Fase 4 · Construye tu solución ─────────────────────────────────────
  "monetiza-ia/5/1": {
    preguntas: [
      q("¿Cómo eliges tus herramientas de IA?",
        ["Probando todas las que salen cada semana", "A partir de las funciones que tu proceso necesita, una herramienta por función", "Pagando la más cara de cada categoría"], 1,
        "Primero sabes qué necesitas hacer, después eliges con qué. Así no gastas el tiempo aprendiendo botones que no usarás."),
      q("Una herramienta de la tabla del curso ya no existe o cambió de precio. ¿Qué haces?",
        ["Abandonas esa parte de tu oferta", "Buscas otra herramienta de la misma función", "Esperas a que vuelva"], 1,
        "Las herramientas cambian; las funciones no. Por eso el curso te enseña a pensar en funciones."),
      q("Aún no tienes clientes. ¿Cuándo conviene pagar suscripciones?",
        ["Antes de empezar, para tener lo mejor", "Cuando el plan gratis te frene con un cliente real", "Nunca"], 1,
        "Para tu demostración casi siempre alcanzan los planes gratuitos. Pagas cuando un cliente lo justifica."),
    ],
  },
  "monetiza-ia/5/2": {
    preguntas: [
      q("¿Qué suele marcar la diferencia entre un resultado genérico de IA y uno que un cliente paga?",
        ["La herramienta", "La instrucción", "La hora del día"], 1,
        "Una instrucción completa, con contexto, datos reales y criterios, produce algo casi usable. Una floja produce algo que hay que rehacer."),
      q("La IA inventó un precio que no le diste. ¿Qué agregas a tu instrucción?",
        ["Nada, lo corriges a mano cada vez", "Los datos reales y la regla: «Usa solo esta información. Si falta algo, escribe [FALTA DATO]»", "Que sea más creativa"], 1,
        "Si le das los datos y le prohíbes inventar, deja de rellenar huecos. Mejorar la instrucción te ahorra corregir cada resultado."),
      q("¿Cuál NO es una de las seis partes de una instrucción?",
        ["Restricciones", "La marca de la herramienta", "Criterios de calidad"], 1,
        "Las seis son: contexto, objetivo, información, restricciones, formato y criterios de calidad. Funcionan con cualquier herramienta."),
    ],
  },
  "monetiza-ia/5/3": {
    preguntas: [
      q("Aún no tienes clientes. ¿Con qué construyes tu primera versión?",
        ["Esperas a tener un cliente real", "Con un caso de práctica: un conocido que te preste sus datos, o uno inventado marcado como tal", "Con el negocio de alguien sin avisarle"], 1,
        "Un caso de práctica te deja descubrir problemas sin un cliente esperando. Si es inventado, se marca siempre como tal."),
      q("Tu primera versión te tomó el doble de lo estimado. ¿Qué haces?",
        ["Lo ignoras: la próxima será más rápida", "Recalculas tu piso con el tiempo real y, si no cuadra, ajustas el paquete", "Abandonas la oferta"], 1,
        "Es normal la primera vez. Pero tu precio tiene que resistir el tiempo real, no el que imaginabas."),
      q("¿Por qué conviene medir cuánto tardó cada paso?",
        ["Para presumirlo", "Para saber qué cambiar en el proceso y si tu precio sigue por encima de tu piso", "No conviene, es perder tiempo"], 1,
        "Los tiempos reales muestran qué paso cambiar y si tu precio sigue teniendo sentido."),
    ],
  },
  "monetiza-ia/5/4": {
    preguntas: [
      q("¿Quién responde por la calidad de lo que entregas?",
        ["La IA que lo generó", "Tú: la IA produce un borrador y el profesional controla el resultado", "El cliente, que debe revisarlo"], 1,
        "Tu cliente te paga por algo en lo que puede confiar, no por usar IA."),
      q("¿Cómo revisas si la IA inventó información?",
        ["Le pides a la misma IA que lo revise", "Comparas tú, a mano, cada dato contra la fuente", "No hace falta si el texto suena seguro"], 1,
        "La IA se equivoca con el mismo tono seguro con que acierta. Los datos se comparan contra la fuente, a mano."),
      q("Tu cliente de prueba no vio ningún error, pero tu checklist encontró cuatro. ¿Qué aprendes?",
        ["Que la checklist exagera", "Que no debes depender de que el cliente encuentre los errores", "Que el cliente no sabe"], 1,
        "Un cliente no revisa con cuidado. Para eso existe tu checklist: los errores no deben llegarle."),
    ],
  },

  // ─── Fase 5 · Crea prueba ───────────────────────────────────────────────
  "monetiza-ia/6/1": {
    preguntas: [
      q("Aún no tienes clientes. ¿Cómo muestras que puedes hacer el trabajo?",
        ["Inventas testimonios de clientes", "Con una demostración honesta, claramente etiquetada", "No lo muestras hasta tener clientes"], 1,
        "Una muestra real de tu trabajo, que dice qué es, responde la duda del cliente sin inventar nada."),
      q("Hiciste un caso de demostración con datos ficticios. ¿Cómo lo presentas?",
        ["Como si fuera un cliente real", "Con una etiqueta: «Demostración con datos de ejemplo»", "Sin decir nada"], 1,
        "Presentar un caso ficticio como real es engañar, y el día que se descubre pierdes esa venta y las recomendaciones."),
      q("Tu demostración funcionó, pero no mediste ventas. ¿Qué puedes decir?",
        ["«Aumentó 40% sus ventas»", "Lo que entregaste y cómo estaba antes, sin cifras que no mediste", "«Resultados garantizados»"], 1,
        "Solo afirmas lo que puedes sostener. Un antes y después honesto vale más que una cifra inventada."),
    ],
  },
  "monetiza-ia/6/2": {
    preguntas: [
      q("Un prospecto te dice «mándame información». ¿Qué debería existir para ese momento?",
        ["Nada: le explicas todo por mensaje", "Tu miniportafolio de siete partes", "Tu currículum completo"], 1,
        "Si ese momento te encuentra sin nada, la conversación se enfría. El miniportafolio cuenta el problema, cómo lo resuelves y cómo contratarte."),
      q("En la sección «resultado» de tu miniportafolio, ¿qué va?",
        ["Cifras de ventas estimadas", "El resultado esperado: lo que entregas y para qué sirve", "Testimonios de amigos"], 1,
        "Sin clientes medidos, hablas del resultado esperado. Las cifras que no mediste no van."),
      q("Tu miniportafolio termina con cinco formas de contactarte. ¿Qué conviene?",
        ["Dejarlas todas", "Elegir un solo siguiente paso", "Quitar el contacto"], 1,
        "Muchas opciones hacen que el prospecto no elija ninguna. Un solo siguiente paso es más fácil de seguir."),
    ],
  },
  "monetiza-ia/6/3": {
    preguntas: [
      q("¿Qué necesitas como mínimo para tu Portafolio V1?",
        ["Una página web profesional", "Un enlace que abra en el teléfono sin descargar nada ni iniciar sesión", "Un video largo explicando todo"], 1,
        "Lo que importa es poder mandarlo en un mensaje y que el prospecto lo vea en su teléfono."),
      q("Compartiste tu portafolio y el enlace pide iniciar sesión. ¿Qué pasó?",
        ["El prospecto no sabe usarlo", "El documento está privado: cambia el acceso a «cualquiera con el enlace puede ver»", "Hay que pagar una suscripción"], 1,
        "Pruébalo siempre desde otro teléfono sin sesión antes de mandarlo."),
      q("¿Qué formato de portafolio conviene elegir?",
        ["El más bonito, aunque no sepas editarlo", "El que puedas actualizar tú sin ayuda", "Todos a la vez"], 1,
        "Tu Portafolio V1 va a cambiar después de tus primeras conversaciones. Si no puedes editarlo tú, se queda viejo."),
    ],
  },

  // ─── Fase 6 · Encuentra clientes ────────────────────────────────────────
  "monetiza-ia/7/1": {
    preguntas: [
      q("¿Qué es una buena señal de prospecto?",
        ["«Seguro no sabe de tecnología»", "Algo que puedes ver desde fuera y se relaciona con el problema, como «su última publicación tiene más de 3 semanas»", "Que el dueño parezca amable"], 1,
        "Las buenas señales se observan sin hablar con el prospecto y se conectan con el problema o con su capacidad de pago."),
      q("¿Para qué sirven las señales de descarte?",
        ["Para no contactar a nadie", "Para no perder tiempo con quien ya lo resolvió o no puede decidir", "Para criticar a la competencia"], 1,
        "Un negocio que ya publica todos los días con diseño profesional, o una franquicia que decide en otro lugar, no es tu prospecto."),
      q("Casi nadie cumple tus cinco señales. ¿Qué haces?",
        ["Bajas tus criterios a cero", "Marcas dos como obligatorias y las demás como «suman»", "Cambias de curso"], 1,
        "Criterios demasiado estrictos te dejan sin prospectos. Separar las obligatorias de las que suman equilibra filtro y cantidad."),
    ],
  },
  "monetiza-ia/7/2": {
    preguntas: [
      q("¿Cuántas fuentes de prospectos necesitas para empezar?",
        ["Las ocho", "Dos que te den prospectos buenos de forma constante", "Solo una: Facebook"], 1,
        "No necesitas estar en todos lados. Dos fuentes que funcionan, y a las que puedes volver, bastan."),
      q("¿Qué datos de un prospecto puedes guardar?",
        ["Todos los que encuentres, incluso personales", "Solo datos públicos de negocio o los que compartió para ser contactado", "Los que te pase un conocido sin permiso"], 1,
        "Guarda lo mínimo y borra los datos de quien te pida no ser contactado. Cuidas a las personas y te cuidas tú."),
      q("¿Cómo eliges tus dos fuentes principales?",
        ["Las que más te gustan", "Las que dieron más prospectos buenos en menos tiempo, probadas con temporizador", "Las que usa todo el mundo"], 1,
        "Probar cada fuente 20 minutos te da un dato real: cuántos prospectos buenos por minuto."),
    ],
  },
  "monetiza-ia/7/3": {
    preguntas: [
      q("¿Qué suele decidir si un mensaje en frío se responde?",
        ["Que sea largo y completo", "Que la primera línea demuestre que miraste su negocio", "Que incluya el precio"], 1,
        "Un mensaje que se nota copiado se ignora. Una observación concreta sobre su negocio hace que lo lea."),
      q("¿Cuál de estas es una observación válida para tu ficha?",
        ["«Seguro no sabe usar redes»", "«Su última publicación es del 3 de agosto»", "«Su página es fea»"], 1,
        "Una observación es algo que viste. Las otras son suposiciones o críticas, y además cierran la conversación."),
      q("Tardas 20 minutos en cada ficha. ¿Qué conviene?",
        ["Seguir así, más investigación es mejor", "Limitarte a las cinco preguntas con un temporizador de 5 minutos", "Dejar de investigar"], 1,
        "Necesitas suficiente para personalizar, no un expediente. Cinco minutos por ficha bastan."),
    ],
  },
  "monetiza-ia/7/4": {
    preguntas: [
      q("¿Por qué construir una lista de 50 prospectos y no de 5?",
        ["Para mandar mensajes masivos", "Con 50, cada «no» es un dato y tienes suficientes intentos para aprender qué funciona", "Porque el curso lo exige"], 1,
        "Con 5, cada rechazo se siente como fracaso. Con 50, empiezas a ver patrones."),
      q("Alguien te pide que no lo vuelvas a contactar. ¿Qué haces en tu lista?",
        ["Lo intentas de nuevo en un mes", "Lo marcas como «descartado: no contactar» y no guardas más datos suyos", "Lo borras y lo vuelves a agregar después"], 1,
        "Respetar esa decisión es obligatorio, y guardar solo lo mínimo te protege."),
      q("¿Para qué sirve la columna «estado» de tu lista?",
        ["Para decorar la hoja", "Para saber en qué etapa está cada prospecto y dar seguimiento sin depender de tu memoria", "Para calificar al prospecto"], 1,
        "Los estados (por contactar, contactado, respondió…) también son la base de tu embudo en la Fase 9."),
    ],
  },

  // ─── Fase 7 · Vende ─────────────────────────────────────────────────────
  "monetiza-ia/8/1": {
    preguntas: [
      q("¿Cuál es el único trabajo de tu primer mensaje?",
        ["Explicar todo tu servicio", "Conseguir una respuesta", "Cerrar la venta"], 1,
        "Si intentas explicar todo, nadie lo lee. El resto de la conversación llega cuando responde."),
      q("¿Cómo termina un buen primer mensaje?",
        ["«¿Te interesa?»", "Con una pregunta fácil de contestar sobre su situación", "Con tu lista de precios"], 1,
        "Una pregunta que se contesta en dos segundos invita a responder. «¿Te interesa?» invita a decir que no."),
      q("¿Por qué conviene escribir los mensajes uno por uno y no masivos?",
        ["Porque es más lento", "Los masivos idénticos se notan, se ignoran y pueden bloquear tu cuenta", "No importa"], 1,
        "La personalización es lo que consigue respuestas, y respetar las reglas de cada plataforma cuida tu cuenta."),
    ],
  },
  "monetiza-ia/8/2": {
    preguntas: [
      q("Un prospecto te responde. ¿Qué haces primero?",
        ["Le explicas tu oferta completa", "Le haces preguntas para entender su situación", "Le mandas el precio"], 1,
        "Si presentas antes de entender, suenas a anuncio. Si preguntas primero, tu oferta llega como respuesta a lo que te contó."),
      q("¿Cuál es la regla de oro de una conversación de diagnóstico?",
        ["Que tú expliques todo con detalle", "Que el cliente hable o escriba más que tú", "Que termine rápido"], 1,
        "Mientras más habla el cliente, más sabes de su problema, su impacto y su objetivo."),
      q("El cliente te contesta con una sola palabra. ¿Qué pasa probablemente con tus preguntas?",
        ["Que el cliente es grosero", "Que se contestan con sí o no: cámbialas por «¿cómo le hacen con…?»", "Que son demasiado largas"], 1,
        "Las preguntas abiertas invitan a contar. Las cerradas obligan a responder corto."),
    ],
  },
  "monetiza-ia/8/3": {
    preguntas: [
      q("¿Con qué empieza tu presentación de oferta?",
        ["Con «yo hago…»", "Con el problema del cliente, en sus palabras", "Con el precio"], 1,
        "Repetir lo que te dijo demuestra que escuchaste, y convierte tu oferta en respuesta."),
      q("Dijiste el precio. ¿Qué haces después?",
        ["Lo justificas de inmediato", "Te quedas callado y esperas", "Ofreces un descuento"], 1,
        "Llenar el silencio con explicaciones suena a inseguridad. Deja que el cliente responda."),
      q("¿Cómo termina una buena presentación?",
        ["«Tú me dices»", "Con un siguiente paso concreto: una fecha, una llamada o un anticipo", "«Cualquier cosa me avisas»"], 1,
        "Un paso concreto facilita la decisión. «Tú me dices» deja la conversación en el aire."),
    ],
  },
  "monetiza-ia/8/4": {
    preguntas: [
      q("¿Qué es casi siempre una objeción?",
        ["Un «no» definitivo", "Una duda que el cliente no sabe cómo decir", "Una falta de respeto"], 1,
        "Detrás de «es caro» o «lo voy a pensar» suele haber una pregunta: ¿vale lo que cuesta?, ¿puedo confiar?"),
      q("Te dicen «eso lo puedo hacer con ChatGPT». ¿Qué respondes?",
        ["Que no es cierto", "Reconoces que puede, y preguntas si lo hará cada semana: vendes constancia y criterio", "Bajas el precio"], 1,
        "Discutir lo pone a la defensiva. Tu valor no es el texto, sino que ya no dependa de acordarse."),
      q("El cliente pide descuento. ¿Qué ofreces?",
        ["El mismo trabajo más barato", "Menos alcance por menos precio", "Un descuento «solo por hoy»"], 1,
        "Reducir alcance mantiene el valor de tu trabajo. La urgencia falsa es manipulación y no va en tus respuestas."),
    ],
  },

  // ─── Fase 8 · Entrega ───────────────────────────────────────────────────
  "monetiza-ia/9/1": {
    preguntas: [
      q("¿Dónde empiezan muchos problemas con clientes?",
        ["En la entrega final", "En los primeros días: información que no llega y expectativas distintas", "En el pago"], 1,
        "Un buen arranque, con formulario, requisitos, expectativas y fechas, evita casi todo eso."),
      q("Necesitas acceso a la cuenta de redes de tu cliente. ¿Qué le pides?",
        ["Su contraseña", "Que te agregue con permisos de colaborador", "Que te preste su teléfono"], 1,
        "Con permisos de colaborador no necesitas su contraseña, y él conserva el control de su cuenta."),
      q("Tu cliente no llena el formulario de arranque. ¿Qué haces?",
        ["Esperas indefinidamente", "Lo acortas a máximo 10 preguntas o lo llenas tú en una llamada de 15 minutos", "Cancelas el proyecto"], 1,
        "Si es largo o no sabe para qué es, no lo llena. Hazlo fácil o hazlo con él."),
    ],
  },
  "monetiza-ia/9/2": {
    preguntas: [
      q("¿Qué pasa si improvisas tu proceso con tres clientes a la vez?",
        ["Nada, la improvisación funciona", "Archivos perdidos, pasos olvidados y entregas tarde", "Trabajas más rápido"], 1,
        "Con uno puedes improvisar. Con varios necesitas un flujo documentado."),
      q("¿Cuáles son las cuatro etapas de tu flujo de producción?",
        ["Idea, diseño, venta y cobro", "Entrada, procesamiento, revisión y entrega", "Lunes, martes, miércoles y jueves"], 1,
        "Cada etapa responde quién lo hace, con qué, cuánto tarda y dónde queda el resultado."),
      q("Tu flujo documentado tiene 25 pasos. ¿Qué conviene?",
        ["Dejarlo, más detalle es mejor", "Agrupar en pasos que producen algo y dejar el detalle en las instrucciones", "Borrarlo"], 1,
        "Un flujo con cada clic no se usa. Los pasos agrupados («borradores listos») sí."),
    ],
  },
  "monetiza-ia/9/3": {
    preguntas: [
      q("Mismo trabajo, dos entregas. ¿Cuál es más probable que el cliente recomiende?",
        ["Archivos sueltos con «ahí está»", "Archivos ordenados, con instrucciones y un mensaje claro", "La que llega antes, aunque tenga errores"], 1,
        "La forma de entregar es parte del trabajo. Ordenada y con instrucciones, se siente profesional."),
      q("Te das cuenta de que entregaste algo con un error. ¿Qué haces?",
        ["Esperas a ver si lo nota", "Avisas tú primero y lo corriges rápido", "Culpas a la IA"], 1,
        "Avisar primero genera más confianza que esconderlo."),
      q("¿Para qué sirven las instrucciones de uso de tu entrega?",
        ["Para que el cliente sepa qué hacer con lo que recibe", "Para alargar el documento", "No sirven"], 0,
        "Si el cliente no sabe cómo usarlo, no lo usa, y no ve el resultado."),
    ],
  },
  "monetiza-ia/9/4": {
    preguntas: [
      q("¿Qué suele costar menos esfuerzo?",
        ["Conseguir un cliente nuevo", "Volver a trabajar con un cliente contento", "Las dos cuestan igual"], 1,
        "Un cliente contento ya te conoce y confía. Pero la recurrencia no pasa sola: pasa si das seguimiento."),
      q("Tu cliente quedó contento. ¿Cómo usas su opinión?",
        ["La mejoras para que suene más impactante", "Con su permiso, con sus palabras exactas", "Inventas otra más completa"], 1,
        "Un testimonio se pide, no se inventa ni se «mejora»."),
      q("Tu cliente te da una crítica. ¿Qué haces?",
        ["Te defiendes y explicas", "Agradeces y anotas qué ajustar", "Dejas de responderle"], 1,
        "La crítica es la información más valiosa que puedes recibir para mejorar tu oferta."),
    ],
  },

  // ─── Fase 9 · Optimiza ──────────────────────────────────────────────────
  "monetiza-ia/10/1": {
    preguntas: [
      q("¿Para qué sirve un SOP?",
        ["Para verse profesional", "Para que cada venta y entrega se hagan igual de bien, sin depender de tu memoria", "Para presentárselo a los clientes"], 1,
        "El SOP junta todas tus piezas en el orden en que se usan. Si algún día alguien te ayuda, ya tienes cómo enseñarle."),
      q("Tu SOP ocupa diez páginas. ¿Qué pasó?",
        ["Está completo", "Metiste el contenido de cada plantilla: el SOP solo dice qué hacer y enlaza la plantilla", "Te faltan páginas"], 1,
        "Si no lo abres cuando trabajas, está demasiado largo. El detalle vive en cada plantilla."),
      q("Un paso de tu proceso no tiene plantilla. ¿Qué significa?",
        ["Que no es importante", "Que lo haces de memoria: conviene escribirlo", "Que hay que quitarlo"], 1,
        "Lo que haces de memoria es lo que se olvida cuando tienes varios clientes."),
    ],
  },
  "monetiza-ia/10/2": {
    preguntas: [
      q("¿Por qué la automatización llega después de documentar el proceso?",
        ["Porque es más difícil", "Porque automatizar un proceso que no entiendes solo automatiza el desorden", "No hay razón"], 1,
        "Primero entiendes qué se repite igual. Después lo automatizas."),
      q("¿Qué tarea conviene automatizar primero?",
        ["La más novedosa", "La que más tiempo te quita y siempre se hace igual", "La más difícil"], 1,
        "El valor de automatizar está en el tiempo que recuperas, no en lo impresionante que suene."),
      q("Tu automatización manda algo al cliente sin que lo veas. ¿Qué agregas?",
        ["Nada, así es más rápido", "Un paso de revisión humana", "Otra automatización que revise"], 1,
        "Un error automático llega a todos tus clientes. La revisión humana lo detiene."),
    ],
  },
  "monetiza-ia/10/3": {
    preguntas: [
      q("Tienes muchos prospectos contactados pero pocas respuestas. ¿Dónde está probablemente el problema?",
        ["En tu precio", "En el mensaje o la prospección", "En tu entrega"], 1,
        "Si no responden, todavía no vieron tu precio ni tu trabajo. Revisa la personalización y a quién le escribes."),
      q("¿Cuál NO es una buena acción para tu cuello de botella?",
        ["Reescribir tu mensaje y probarlo con 20 contactos", "«Trabajar más», sin cambiar nada", "Practicar el diagnóstico con el simulador"], 1,
        "Los números sirven para encontrar el punto exacto que mejorar. «Trabajar más» sin cambiar nada repite el mismo resultado."),
      q("¿Por qué separar tus métricas de aprendizaje de las de negocio?",
        ["Porque aprender no es lo mismo que vender", "Porque las de aprendizaje no importan", "No hay que separarlas"], 0,
        "Completar misiones te prepara, pero lo que dice si tu oferta funciona son mensajes, respuestas y ventas."),
    ],
  },

  // ─── Fase 10 · Proyecto final ───────────────────────────────────────────
  "monetiza-ia/11/1": {
    preguntas: [
      q("¿Qué NO debe incluir tu informe final?",
        ["Elementos incompletos", "Una «probabilidad de éxito»", "Siguientes acciones"], 1,
        "El informe evalúa tu preparación con lo que construiste. Una probabilidad de éxito sería una cifra inventada."),
      q("¿Cómo es un buen plan de 30 días?",
        ["Quince tareas por día", "Una acción principal por día, concreta", "Una meta general por semana"], 1,
        "Una acción clara por día se cumple. Una lista larga se abandona."),
      q("Fallaste un día de tu plan. ¿Qué haces?",
        ["Haces dos acciones al día siguiente", "Sigues con la acción del día siguiente", "Empiezas el plan de cero"], 1,
        "Intentar recuperar todo de golpe es la forma más común de abandonar. Sigue con la del día."),
    ],
  },
};
