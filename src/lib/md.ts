// Renderizador de markdown mínimo, del lado servidor. Sin dependencias.
// Cubre lo que usan las lecciones: h2, párrafos, listas, citas, reglas,
// negrita y cursiva. Escapa todo antes de aplicar formato.

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

const linea = (s: string) =>
  esc(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

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

/** Saca los títulos de nivel 2 de un Markdown, con su ancla ya calculada.
 *  El índice y el texto usan la MISMA función, así que nunca se
 *  desincronizan: si cambia el título, cambian los dos a la vez. */
export function secciones(texto: string): { titulo: string; id: string }[] {
  const fuera: { titulo: string; id: string }[] = [];
  for (const bruto of texto.split(/\n{2,}/)) {
    const t = bruto.trim();
    if (t.startsWith("## ")) {
      const titulo = t.slice(3).replace(/\*/g, "").trim();
      fuera.push({ titulo, id: `s-${ancla(titulo)}` });
    }
  }
  return fuera;
}

export function md(texto: string): string {
  const bloques = texto.split(/\n{2,}/);
  let salida = "";
  let cita: string[] = [];

  const cerrarCita = () => {
    if (!cita.length) return;
    salida += "<blockquote>" + cita.map((l) => `<p>${linea(l)}</p>`).join("") + "</blockquote>";
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

    if (/^-{3,}$/.test(t)) { salida += "<hr>"; continue; }

    // Tablas: | a | b |  con fila separadora |---|---|
    if (t.startsWith("|") && /\n\s*\|[\s:|-]+\|/.test(t)) {
      const filas = t.split("\n").filter((f) => f.trim().startsWith("|"));
      const celdas = (f: string) =>
        f.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const cab = celdas(filas[0]);
      const cuerpo = filas.slice(2).map(celdas);
      salida +=
        "<table><thead><tr>" +
        cab.map((c) => `<th>${linea(c)}</th>`).join("") +
        "</tr></thead><tbody>" +
        cuerpo.map((f) => "<tr>" + f.map((c) => `<td>${linea(c)}</td>`).join("") + "</tr>").join("") +
        "</tbody></table>";
      continue;
    }
    if (t.startsWith("### ")) { salida += `<h3>${linea(t.slice(4))}</h3>`; continue; }
    if (t.startsWith("## ")) {
      // El id se calcula con la misma funcion que usa el indice, para que
      // los enlaces internos nunca apunten a una seccion que no existe.
      const crudo = t.slice(3);
      const id = `s-${ancla(crudo.replace(/\*/g, "").trim())}`;
      salida += `<h2 id="${id}">${linea(crudo)}</h2>`;
      continue;
    }
    if (/^[-*]\s/.test(t)) {
      salida += "<ul>" + t.split("\n")
        .map((l) => `<li>${linea(l.replace(/^[-*]\s+/, ""))}</li>`).join("") + "</ul>";
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
  return salida;
}
