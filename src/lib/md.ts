// Renderizador de markdown de las lecciones, del lado servidor. Sin
// dependencias. ESCAPA TODO antes de aplicar formato: el HTML que sale de
// aquí solo contiene etiquetas que este archivo escribe.
//
// Además del markdown básico, entiende la forma en que están escritas las
// lecciones y la convierte en experiencia:
//   - Cada «## » abre una sección. Las de preparación («Antes de empezar»,
//     «Lo que necesitas hoy») y las de cierre («Lo que hiciste hoy») se
//     marcan con su tipo para dibujarse como bloques propios.
//   - Los bloques ``` son plantillas: llevan botón de copiar.
//   - Las citas largas (mensajes, instrucciones para la IA) también.
//   - Las listas ✅ / ❌ se vuelven «haz esto / evita esto», con el sentido
//     dicho en texto para lectores de pantalla, no solo con el emoji.
//   - Las tablas van dentro de un contenedor desplazable: en un teléfono de
//     360 px una tabla de tres columnas no cabe.

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

const linea = (s: string) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\s][^*]*)\*/g, "<em>$1</em>")
    // Enlaces [texto](url): solo http(s) o rutas internas. El texto y la
    // URL ya vienen escapados.
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g, (_, t, u) =>
      u.startsWith("/")
        ? `<a href="${u}">${t}</a>`
        : `<a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>`
    );

/** Convierte un título en un ancla estable: minúsculas, sin acentos, con
 *  guiones. Es lo que permite que el índice de la lección salte a cada
 *  sección — sin id en los <h2>, cualquier navegación interna es imposible. */
export function ancla(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

/** Qué clase de sección es, según su título. */
function tipoDeSeccion(titulo: string): "antes" | "resultado" | "accion" | "problemas" | "reto" | "plan" | "normal" {
  const t = ancla(titulo);
  if (/^(si-algo-no-sale|errores-comunes|si-no-funciona)/.test(t)) return "problemas";
  if (/^mini-reto/.test(t)) return "reto";
  if (/^(tu-plan-despues|plan-de-accion)/.test(t)) return "plan";
  if (/^(antes-de-empezar|lo-que-necesitas|que-construyes-hoy)/.test(t)) return "antes";
  if (/^(lo-que-hiciste-hoy|guarda$)/.test(t)) return "resultado";
  if (/^(construye$|la-prueba|haz-esto|tu-turno|sube-dos-hoy|guarda-el-link)/.test(t)) return "accion";
  return "normal";
}

const ETIQUETA_TIPO = {
  antes: "Antes de empezar",
  resultado: "Resultado",
  accion: "Haz esto ahora",
  problemas: "Si algo falla",
  reto: "Mini reto",
  plan: "Después del curso",
  normal: "",
} as const;

/** Saca los títulos de nivel 2 de un Markdown, con su ancla ya calculada.
 *  El índice y el texto usan la MISMA función, así que nunca se
 *  desincronizan: si cambia el título, cambian los dos a la vez. */
export function secciones(texto: string): { titulo: string; id: string }[] {
  const fuera: { titulo: string; id: string }[] = [];
  for (const bruto of sinCodigo(texto).texto.split(/\n{2,}/)) {
    const t = bruto.trim();
    if (t.startsWith("## ")) {
      const titulo = t.slice(3).replace(/\*/g, "").trim();
      fuera.push({ titulo, id: `s-${ancla(titulo)}` });
    }
  }
  return fuera;
}

/** Aparta los bloques ``` antes de partir por líneas en blanco: dentro de
 *  un bloque de código una línea vacía no separa nada. */
function sinCodigo(texto: string) {
  const codigos: string[] = [];
  const limpio = texto.replace(/```[^\n]*\n([\s\S]*?)```/g, (_, cuerpo: string) => {
    codigos.push(cuerpo.replace(/\n$/, ""));
    return `\n\n\u0000CODIGO${codigos.length - 1}\u0000\n\n`;
  });
  return { texto: limpio, codigos };
}

const botonCopiar = (que: string, texto = "Copiar") =>
  `<button type="button" class="copiar" data-copiar aria-label="Copiar ${que}">${texto}</button>`;

/** Contexto que delata una instrucción para la IA en el párrafo anterior. */
const HABLA_DE_IA = /chatgpt|claude|gemini|\bia\b|pídele|pega tu|pégale|reescríbel/i;

/** Cómo dibujar una cita, según lo que contiene. */
function clasificarCita(lineas: string[], contexto: string): "formula" | "mensaje" | "prompt" | "plantilla" | "cita" {
  const plano = lineas.join(" ").replace(/\*/g, "");
  if (lineas.length === 1 && / \+ /.test(plano) && plano.length < 140) return "formula";
  if (/^["“]/.test(plano)) return "mensaje";
  if (HABLA_DE_IA.test(contexto) && plano.length > 60) return "prompt";
  return plano.length >= 90 ? "plantilla" : "cita";
}

export function md(texto: string): string {
  const { texto: limpio, codigos } = sinCodigo(texto);
  const bloques = limpio.split(/\n{2,}/);
  let salida = "";
  let cita: string[] = [];
  let etiquetaCita: string | null = null;
  // «**El que trabaja:**» sola en un párrafo: rótulo del mensaje que sigue.
  let rotulo: string | null = null;
  let anterior = "";
  let seccionAbierta = false;
  let numero = 0;
  // Mensajes con etiqueta seguidos («Taquería», «Estética»…): se juntan en
  // una galería en vez de apilarse uno bajo otro.
  let galeria: string[] = [];

  const cerrarGaleria = () => {
    if (!galeria.length) return;
    salida += galeria.length > 1 ? `<div class="md-mensajes">${galeria.join("")}</div>` : galeria[0];
    galeria = [];
  };

  const cerrarCita = () => {
    if (!cita.length) return;
    const tipo = clasificarCita(cita, anterior);
    const et = etiquetaCita ? `<p class="md-etiqueta">${linea(etiquetaCita)}</p>` : "";

    if (tipo === "mensaje") {
      // Se quitan las comillas de los extremos: la burbuja ya dice que es
      // un mensaje. Las líneas se conservan como en el teléfono.
      const lineas = cita.map((l, i, a) => {
        let x = l;
        if (i === 0) x = x.replace(/^["“]/, "");
        if (i === a.length - 1) x = x.replace(/["”]$/, "");
        return `<p>${linea(x)}</p>`;
      });
      // «El genérico que trae de fábrica» es el contraejemplo: se dibuja
      // apagado y dicho con texto, no solo con color.
      const malo = etiquetaCita ? /gen[eé]rico|de f[aá]brica|as[ií] no|evita|antes|^sin /i.test(etiquetaCita) : false;
      const etMalo = malo ? `<p class="md-etiqueta md-etiqueta-mala"><span aria-hidden="true">×</span> ${linea(etiquetaCita!)}</p>` : et;
      const burbuja =
        `<figure class="md-mensaje${etiquetaCita ? " md-mensaje-et" : ""}${malo ? " md-mensaje-malo" : ""}">${etMalo}` +
        `<blockquote class="md-burbuja">${lineas.join("")}<span class="md-visto" aria-hidden="true">✓✓</span></blockquote>` +
        // En comparaciones («Sin mapa» / «Con mapa») el mensaje es un
        // ejemplo para leer, no un texto para enviar: sin botón de copiar.
        `${etiquetaCita && /^(con|sin)\s/i.test(etiquetaCita) ? "" : botonCopiar("este mensaje", "Copiar mensaje")}</figure>`;
      if (etiquetaCita) galeria.push(burbuja);
      else {
        cerrarGaleria();
        salida += burbuja;
      }
    } else {
      cerrarGaleria();
      if (tipo === "formula") {
        const piezas = cita[0].replace(/\*/g, "").split(/\s+\+\s+/);
        salida +=
          `<p class="md-formula" aria-label="Fórmula: ${esc(piezas.join(" más "))}">` +
          piezas.map((x, i) => `${i ? '<span class="md-mas" aria-hidden="true">+</span>' : ""}<span class="md-termino">${esc(x)}</span>`).join("") +
          "</p>";
      } else if (tipo === "prompt") {
        const cuerpo = cita.map((l) => `<p>${linea(l.replace(/^[-*]\s+/, "• "))}</p>`).join("");
        salida +=
          `<div class="md-prompt"><div class="md-prompt-cab"><span class="md-prompt-ico" aria-hidden="true">✦</span><span>Instrucción para la IA</span>${botonCopiar("la instrucción")}</div>` +
          `<blockquote>${cuerpo}</blockquote></div>`;
      } else {
        const cuerpo = cita.map((l) => `<p>${linea(l.replace(/^[-*]\s+/, "• "))}</p>`).join("");
        salida +=
          tipo === "plantilla"
            ? `<div class="md-plantilla">${et}<blockquote>${cuerpo}</blockquote>${botonCopiar("este texto")}</div>`
            : `<blockquote>${cuerpo}</blockquote>`;
      }
    }
    cita = [];
    etiquetaCita = null;
  };

  for (const bruto of bloques) {
    const t = bruto.trim();
    if (!t) continue;

    // Una cita, o una etiqueta pegada a su cita («**Taquería**» y en la
    // línea siguiente «> "¡Hola!…"»).
    const lineas = t.split("\n");
    const iCita = lineas.findIndex((l) => l.trim().startsWith(">"));
    if (iCita >= 0 && lineas.slice(iCita).every((l) => l.trim().startsWith(">"))) {
      if (iCita > 0) {
        cerrarCita();
        etiquetaCita = lineas.slice(0, iCita).join(" ").replace(/\*/g, "").replace(/:$/, "").trim();
      } else if (rotulo && !cita.length) {
        etiquetaCita = rotulo;
      }
      rotulo = null;
      for (const l of lineas.slice(iCita)) {
        const c = l.replace(/^\s*>\s?/, "").trim();
        if (c) cita.push(c);
      }
      continue;
    }
    cerrarCita();
    cerrarGaleria();
    if (rotulo) {
      // El rótulo no tuvo cita detrás: se dibuja como texto normal.
      salida += `<p><strong>${linea(rotulo)}:</strong></p>`;
      rotulo = null;
    }

    const cod = /^\u0000CODIGO(\d+)\u0000$/.exec(t);
    if (cod) {
      salida +=
        `<div class="md-codigo"><div class="md-codigo-cab"><span>Plantilla para copiar</span>${botonCopiar("la plantilla")}</div>` +
        `<pre><code>${esc(codigos[Number(cod[1])])}</code></pre></div>`;
      anterior = "";
      continue;
    }

    // Las reglas horizontales ya no hacen falta: cada sección se separa sola.
    if (/^-{3,}$/.test(t)) continue;

    // Tablas: | a | b |  con fila separadora |---|---|
    if (t.startsWith("|") && /\n\s*\|[\s:|-]+\|/.test(t)) {
      const filas = t.split("\n").filter((f) => f.trim().startsWith("|"));
      const celdas = (f: string) =>
        f.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const cab = celdas(filas[0]);
      const cuerpo = filas.slice(2).map(celdas);
      salida +=
        // Con 3 columnas o más, en el teléfono cada fila se vuelve una ficha
        // (CSS con data-etiqueta); con 2 columnas la tabla cabe tal cual.
        `<div class="md-tabla${cab.length >= 3 ? " md-tabla-ancha" : ""}" role="region" aria-label="Tabla" tabindex="0"><table><thead><tr>` +
        cab.map((c) => `<th scope="col">${linea(c)}</th>`).join("") +
        "</tr></thead><tbody>" +
        cuerpo
          .map((f) => "<tr>" + f.map((c, i) => (i === 0 ? `<th scope="row">${linea(c)}</th>` : `<td data-etiqueta="${esc(cab[i]?.replace(/[*_`]/g, "") ?? "")}">${linea(c)}</td>`)).join("") + "</tr>")
          .join("") +
        "</tbody></table></div>";
      anterior = "";
      continue;
    }
    if (t.startsWith("### ")) {
      // «### 1. Encabezado» es un paso numerado: el número va en su sello.
      const h = t.slice(4);
      const paso = /^(\d+)\.\s+(.*)$/.exec(h);
      salida += paso
        ? `<h3 class="md-paso"><span class="md-paso-num" aria-hidden="true">${paso[1]}</span><span><span class="sr-only">Paso ${paso[1]}: </span>${linea(paso[2])}</span></h3>`
        : `<h3>${linea(h)}</h3>`;
      anterior = h;
      continue;
    }
    if (t.startsWith("## ")) {
      // El id se calcula con la misma funcion que usa el indice, para que
      // los enlaces internos nunca apunten a una seccion que no existe.
      const crudo = t.slice(3);
      const titulo = crudo.replace(/\*/g, "").trim();
      const id = `s-${ancla(titulo)}`;
      const tipo = tipoDeSeccion(titulo);
      if (seccionAbierta) salida += "</section>";
      if (tipo === "normal") numero += 1;
      const marca =
        tipo === "normal"
          ? `<span class="md-num" aria-hidden="true">${String(numero).padStart(2, "0")}</span>`
          : // Si el título ya dice «Antes de empezar…», la etiqueta sobra.
            ancla(titulo).startsWith(ancla(ETIQUETA_TIPO[tipo]))
            ? ""
            : `<span class="md-tipo">${ETIQUETA_TIPO[tipo]}</span>`;
      salida += `<section class="md-sec md-sec-${tipo}" aria-labelledby="${id}">${marca}<h2 id="${id}">${linea(crudo)}</h2>`;
      seccionAbierta = true;
      anterior = titulo;
      continue;
    }
    if (/^[-*]\s/.test(t)) {
      const items = t.split("\n").map((l) => l.replace(/^[-*]\s+/, ""));
      const sino = items.every((l) => /^(✅|❌)/.test(l));
      // «Si pasa X → haz Y»: reglas de decisión, una por línea.
      const decision = items.every((l) => /^Si\s.+\s→\s.+/.test(l));
      if (decision) {
        salida +=
          '<ul class="md-decision">' +
          items
            .map((l) => {
              const [si, ...resto] = l.split(" → ");
              return `<li><span class="md-si">${linea(si)}</span><span class="md-entonces"><span aria-hidden="true">→</span> ${linea(resto.join(" → "))}</span></li>`;
            })
            .join("") +
          "</ul>";
        anterior = t;
        continue;
      }
      if (sino) {
        salida +=
          '<ul class="md-sino">' +
          items
            .map((l) => {
              const si = l.startsWith("✅");
              const txt = l.replace(/^(✅|❌)\s*/, "");
              return `<li class="${si ? "si" : "no"}"><span class="md-sino-marca" aria-hidden="true">${si ? "✓" : "×"}</span><span class="sr-only">${si ? "Sí: " : "Evita: "}</span>${linea(txt)}</li>`;
            })
            .join("") +
          "</ul>";
      } else {
        salida += "<ul>" + items.map((l) => `<li>${linea(l)}</li>`).join("") + "</ul>";
      }
      anterior = t;
      continue;
    }
    if (/^\d+\.\s/.test(t)) {
      salida += '<ol class="md-pasos">' + t.split("\n")
        .map((l) => `<li>${linea(l.replace(/^\d+\.\s+/, ""))}</li>`).join("") + "</ol>";
      anterior = t;
      continue;
    }
    // Error común: «**Problema:** … / **Causa:** … / **Solución:** …»,
    // una línea cada uno. Se dibuja como ficha de diagnóstico.
    const partesError = /^\*\*Problema:\*\*\s*(.+)\n\*\*Causa:\*\*\s*(.+)\n\*\*Soluci[oó]n:\*\*\s*([\s\S]+)$/.exec(t);
    if (partesError) {
      salida +=
        '<div class="md-error">' +
        `<p class="md-error-problema"><span class="md-error-et">Problema</span>${linea(partesError[1])}</p>` +
        `<p class="md-error-causa"><span class="md-error-et">Causa</span>${linea(partesError[2])}</p>` +
        `<p class="md-error-solucion"><span class="md-error-et">Solución</span>${linea(partesError[3].replace(/\n/g, " "))}</p>` +
        "</div>";
      anterior = t;
      continue;
    }
    const plano = t.replace(/\n/g, " ");
    const esRotulo = /^\*\*([^*]+?):?\*\*:?$/.exec(plano);
    if (esRotulo && /:\**$/.test(plano) && plano.length < 80) {
      rotulo = esRotulo[1].replace(/:$/, "").trim();
      anterior = plano;
      continue;
    }
    // Un párrafo entero en negritas es la idea que hay que llevarse: se
    // destaca como frase de cierre, no como un bloque más.
    if (/^\*\*[^*]+\*\*[.!]?$/.test(plano) && plano.length < 180) {
      salida += `<p class="md-destacado">${linea(plano.replace(/^\*\*|\*\*([.!]?)$/g, "$1"))}</p>`;
    } else if (/^\*\*(Lo importante|Ojo|Importante|Nota)[^*]*\*\*/i.test(plano)) {
      salida += `<p class="md-nota"><span class="md-nota-ico" aria-hidden="true">!</span><span>${linea(plano)}</span></p>`;
    } else {
      salida += `<p>${linea(plano)}</p>`;
    }
    anterior = plano;
  }
  cerrarCita();
  cerrarGaleria();
  if (seccionAbierta) salida += "</section>";
  return salida;
}

/**
 * Las ideas clave de una lección, para el resumen «Lo esencial».
 * Salen del propio texto: las frases que el autor ya marcó en negritas
 * (enteras o de 25 caracteres o más) y el cierre de «Lo que hiciste hoy».
 * Nada se inventa: si la lección no marca ideas, el resumen no aparece.
 */
export function esencial(texto: string): { ideas: string[]; cierre: string | null } {
  const { texto: limpio } = sinCodigo(texto);
  const ideas: string[] = [];
  let cierre: string | null = null;
  let enCierre = false;
  for (const bruto of limpio.split(/\n{2,}/)) {
    const t = bruto.trim();
    if (t.startsWith("## ")) {
      enCierre = /^(lo-que-hiciste-hoy)/.test(ancla(t.slice(3).replace(/\*/g, "")));
      continue;
    }
    if (enCierre && !cierre && t && !t.startsWith("**En la siguiente")) {
      cierre = t.replace(/\*/g, "").replace(/\n/g, " ");
      continue;
    }
    if (t.startsWith(">") || t.startsWith("|") || t.startsWith("-") || t.startsWith("#")) continue;
    // Se recorren los pares de ** en orden, para no confundir el texto que
    // queda ENTRE dos negritas con una negrita.
    for (const m of t.matchAll(/\*\*([^*]+)\*\*/g)) {
      if (m[1].trim().length < 25) continue;
      const frase = m[1].trim().replace(/[:,]$/, "");
      const limpia = frase.charAt(0).toUpperCase() + frase.slice(1);
      if (!ideas.includes(limpia)) ideas.push(/[.!?]$/.test(limpia) ? limpia : `${limpia}.`);
    }
  }
  return { ideas: ideas.slice(0, 5), cierre };
}
