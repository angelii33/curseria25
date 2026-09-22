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
function tipoDeSeccion(titulo: string): "antes" | "resultado" | "accion" | "normal" {
  const t = ancla(titulo);
  if (/^(antes-de-empezar|lo-que-necesitas|que-construyes-hoy)/.test(t)) return "antes";
  if (/^(lo-que-hiciste-hoy|guarda$)/.test(t)) return "resultado";
  if (/^(construye$|la-prueba|haz-esto|tu-turno|sube-dos-hoy|guarda-el-link)/.test(t)) return "accion";
  return "normal";
}

const ETIQUETA_TIPO = {
  antes: "Antes de empezar",
  resultado: "Resultado",
  accion: "Haz esto ahora",
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

const botonCopiar = (que: string) =>
  `<button type="button" class="copiar" data-copiar aria-label="Copiar ${que}">Copiar</button>`;

export function md(texto: string): string {
  const { texto: limpio, codigos } = sinCodigo(texto);
  const bloques = limpio.split(/\n{2,}/);
  let salida = "";
  let cita: string[] = [];
  let seccionAbierta = false;
  let numero = 0;

  const cerrarCita = () => {
    if (!cita.length) return;
    const largo = cita.join(" ").length;
    const cuerpo = cita.map((l) => `<p>${linea(l.replace(/^[-*]\s+/, "• "))}</p>`).join("");
    salida +=
      largo >= 60
        ? `<div class="md-plantilla"><blockquote>${cuerpo}</blockquote>${botonCopiar("este texto")}</div>`
        : `<blockquote>${cuerpo}</blockquote>`;
    cita = [];
  };

  for (const bruto of bloques) {
    const t = bruto.trim();
    if (!t) continue;

    if (t.startsWith(">")) {
      for (const l of t.split("\n")) {
        const c = l.replace(/^>\s?/, "").trim();
        if (c) cita.push(c);
      }
      continue;
    }
    cerrarCita();

    const cod = /^\u0000CODIGO(\d+)\u0000$/.exec(t);
    if (cod) {
      salida +=
        `<div class="md-codigo"><div class="md-codigo-cab"><span>Plantilla para copiar</span>${botonCopiar("la plantilla")}</div>` +
        `<pre><code>${esc(codigos[Number(cod[1])])}</code></pre></div>`;
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
        // Con 3 columnas o más la tabla se desplaza de lado en el teléfono;
        // con 2 cabe y no debe esconder la segunda columna.
        `<div class="md-tabla${cab.length >= 3 ? " md-tabla-ancha" : ""}" role="region" aria-label="Tabla" tabindex="0"><table><thead><tr>` +
        cab.map((c) => `<th scope="col">${linea(c)}</th>`).join("") +
        "</tr></thead><tbody>" +
        cuerpo
          .map((f) => "<tr>" + f.map((c, i) => (i === 0 ? `<th scope="row">${linea(c)}</th>` : `<td>${linea(c)}</td>`)).join("") + "</tr>")
          .join("") +
        "</tbody></table></div>";
      continue;
    }
    if (t.startsWith("### ")) { salida += `<h3>${linea(t.slice(4))}</h3>`; continue; }
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
      continue;
    }
    if (/^[-*]\s/.test(t)) {
      const items = t.split("\n").map((l) => l.replace(/^[-*]\s+/, ""));
      const sino = items.every((l) => /^(✅|❌)/.test(l));
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
      continue;
    }
    if (/^\d+\.\s/.test(t)) {
      salida += "<ol>" + t.split("\n")
        .map((l) => `<li>${linea(l.replace(/^\d+\.\s+/, ""))}</li>`).join("") + "</ol>";
      continue;
    }
    salida += `<p>${linea(t.replace(/\n/g, " "))}</p>`;
  }
  cerrarCita();
  if (seccionAbierta) salida += "</section>";
  return salida;
}
