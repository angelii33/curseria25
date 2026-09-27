// Ilustraciones dentro de las lecciones.
//
// Cada figura es un SVG propio, dibujado con la paleta y la tipografía de la
// plataforma (clases .fg-* en ds-pages.css), así que se ve nítida en
// cualquier pantalla, pesa unos cuantos KB y respeta el tema. No hay fotos
// de banco ni imágenes generadas: cada una explica exactamente lo que dice
// el texto de al lado, con los mismos ejemplos (Taquería El Güero, Rubén…).
//
// Se insertan antes de un encabezado concreto de la lección (`antesDe`). Si
// el encabezado cambia en la base, la figura simplemente no aparece: nunca
// rompe la lección. Por ahora solo las lecciones gratuitas, cuyo contenido
// ya es público.

type Figura = { alt: string; pie: string; ancho: number; alto: number; cuerpo: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Texto en una o varias líneas (cada elemento del arreglo es un renglón). */
function t(x: number, y: number, lineas: string | string[], cls = "fg-t", salto = 14, ancla = "start") {
  const ls = Array.isArray(lineas) ? lineas : [lineas];
  return `<text x="${x}" y="${y}" class="${cls}" text-anchor="${ancla}">${ls
    .map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : salto}">${esc(l)}</tspan>`)
    .join("")}</text>`;
}

const pin = (x: number, y: number, cls: string) =>
  `<g transform="translate(${x} ${y - 30})"><path class="${cls}" d="M0 0c-7 0-12 5-12 12 0 8.5 12 18 12 18s12-9.5 12-18C12 5 7 0 0 0z"/><circle cx="0" cy="12" r="4.2" class="fg-lienzo"/></g>`;
const bien = (x: number, y: number) =>
  `<g transform="translate(${x} ${y})"><circle r="9" class="fg-musgo"/><path d="M-4 0l3 3 5-6" class="fg-trazo-inv"/></g>`;
const mal = (x: number, y: number) =>
  `<g transform="translate(${x} ${y})"><circle r="9" class="fg-cobre"/><path d="M-3.5-3.5l7 7M3.5-3.5l-7 7" class="fg-trazo-inv"/></g>`;
const flecha = (x1: number, y1: number, x2: number, y2: number, cls = "fg-flecha") =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" class="${cls}" marker-end="url(#fg-punta)"/>`;

// ─── Tu negocio en Google: el pin ─────────────────────────────────────────
function mapa(x0: number, bienPuesto: boolean) {
  const puerta = x0 + 85;
  return [
    `<rect x="${x0}" y="34" width="170" height="150" rx="10" class="fg-hundido"/>`,
    `<rect x="${x0}" y="128" width="170" height="24" class="fg-calle"/>`,
    `<path d="M${x0 + 8} 140h154" class="fg-raya"/>`,
    `<rect x="${x0 + 12}" y="70" width="42" height="58" rx="3" class="fg-edificio"/>`,
    `<rect x="${x0 + 60}" y="58" width="50" height="70" rx="3" class="fg-negocio"/>`,
    `<rect x="${x0 + 116}" y="76" width="42" height="52" rx="3" class="fg-edificio"/>`,
    `<rect x="${puerta - 7}" y="110" width="14" height="18" rx="2" class="fg-cobre"/>`,
    `<path d="M${x0 + 60} 58h50l-4 10h-42z" class="fg-cobre"/>`,
    bienPuesto ? pin(puerta, 108, "fg-pin-bien") : pin(x0 + 150, 172, "fg-pin-mal"),
    bienPuesto ? "" : `<path d="M${x0 + 150} 164 C ${x0 + 150} 190, ${x0 + 60} 190, ${x0 + 30} 170" class="fg-ruta"/>`,
    bienPuesto ? `<path d="M${puerta} 176 L${puerta} 132" class="fg-ruta fg-ruta-bien"/>` : "",
  ].join("");
}
const pinMapa: Figura = {
  alt: "Dos mapas del mismo negocio. En el primero el pin está a media cuadra y el cliente camina a la puerta equivocada. En el segundo el pin está en la entrada y llega directo.",
  pie: "El pin es la dirección que sigue Google Maps: ponlo en la puerta, no en la manzana.",
  ancho: 360,
  alto: 214,
  cuerpo: [
    mal(12, 16), t(26, 20, "Pin a media cuadra", "fg-t"),
    mapa(4, false),
    t(89, 204, "Llegan a otra puerta", "fg-t-s", 0, "middle"),
    bien(198, 16), t(212, 20, "Pin en la entrada", "fg-t"),
    mapa(186, true),
    t(271, 204, "Llegan directo", "fg-t-s", 0, "middle"),
  ].join(""),
};

// ─── WhatsApp: el mensaje de bienvenida en tres partes ────────────────────
const bienvenida: Figura = {
  alt: "Un chat de WhatsApp con el mensaje de bienvenida de Taquería El Güero, marcado en tres partes: saludo, qué debe hacer el cliente y qué va a pasar después.",
  pie: "Saludo + qué debe hacer + qué va a pasar después. La parte del medio es la que ordena la conversación.",
  ancho: 360,
  alto: 262,
  cuerpo: [
    `<rect x="8" y="6" width="204" height="250" rx="22" class="fg-telefono"/>`,
    `<rect x="16" y="16" width="188" height="230" rx="14" class="fg-pantalla"/>`,
    `<rect x="16" y="16" width="188" height="34" rx="14" class="fg-musgo"/><rect x="16" y="36" width="188" height="14" class="fg-musgo"/>`,
    `<circle cx="34" cy="33" r="9" class="fg-cobre-claro"/>`,
    t(50, 30, "Taquería El Güero", "fg-t-s fg-t-inv fg-t-b"),
    t(50, 42, "Respuesta automática", "fg-t-xs fg-t-inv"),
    `<rect x="26" y="62" width="164" height="22" rx="8" class="fg-burbuja-cliente"/>`,
    t(36, 77, "hola", "fg-t-s"),
    `<rect x="26" y="94" width="170" height="126" rx="10" class="fg-burbuja"/>`,
    `<rect x="26" y="98" width="4" height="30" class="fg-parte1"/>`,
    t(36, 110, ["¡Hola! Gracias por escribir", "a Taquería El Güero."], "fg-t-s", 13),
    `<rect x="26" y="136" width="4" height="44" class="fg-parte2"/>`,
    t(36, 148, ["Mándame tu pedido completo:", "qué, cuántos y para qué hora,", "y te confirmo en 5 minutos."], "fg-t-s", 13),
    `<rect x="26" y="188" width="4" height="26" class="fg-parte3"/>`,
    t(36, 199, ["Menú con precios:", "elguero.site/menu"], "fg-t-s", 13),
    `<path d="M200 113h22M200 158h22M200 200h22" class="fg-guia"/>`,
    `<circle cx="232" cy="113" r="10" class="fg-parte1"/>`, t(232, 117, "1", "fg-t-num", 0, "middle"),
    t(248, 110, ["Saludo", "Quién eres"], "fg-t fg-t-b", 14),
    `<circle cx="232" cy="158" r="10" class="fg-parte2"/>`, t(232, 162, "2", "fg-t-num", 0, "middle"),
    t(248, 155, ["Qué debe hacer", "Pide datos concretos"], "fg-t fg-t-b", 14),
    `<circle cx="232" cy="200" r="10" class="fg-parte3"/>`, t(232, 204, "3", "fg-t-num", 0, "middle"),
    t(248, 197, ["Qué pasa después", "Cuándo contestas"], "fg-t fg-t-b", 14),
  ].join(""),
};

// ─── Cotiza en 5 minutos: los 7 bloques ───────────────────────────────────
const bloques: [string, number, number][] = [
  ["Encabezado", 18, 30], ["Datos del cliente", 54, 22], ["Descripción", 82, 28],
  ["Partidas detalladas", 116, 58], ["El total, claro", 180, 22], ["Condiciones", 208, 24], ["El siguiente paso", 238, 24],
];
const cotizacion: Figura = {
  alt: "Una cotización dividida en siete bloques numerados: encabezado, datos del cliente, descripción del trabajo, partidas detalladas, el total, condiciones y el siguiente paso.",
  pie: "Los 7 bloques, de arriba abajo. El cliente lee el total y el siguiente paso antes que todo lo demás.",
  ancho: 360,
  alto: 276,
  cuerpo: [
    `<rect x="14" y="8" width="186" height="262" rx="6" class="fg-hoja"/>`,
    // 1 encabezado
    `<rect x="26" y="20" width="22" height="22" rx="4" class="fg-musgo"/>`,
    `<rect x="54" y="22" width="80" height="8" rx="3" class="fg-tinta"/><rect x="54" y="34" width="56" height="5" rx="2" class="fg-gris"/>`,
    `<rect x="150" y="22" width="40" height="7" rx="3" class="fg-cobre"/>`,
    // 2 cliente
    `<rect x="26" y="58" width="44" height="5" rx="2" class="fg-gris"/><rect x="26" y="67" width="96" height="6" rx="2" class="fg-tinta-suave"/>`,
    // 3 descripción
    `<rect x="26" y="86" width="150" height="6" rx="2" class="fg-tinta-suave"/><rect x="26" y="97" width="120" height="6" rx="2" class="fg-tinta-suave"/>`,
    // 4 partidas
    `<rect x="26" y="118" width="164" height="12" rx="2" class="fg-hundido"/>`,
    ...[136, 150, 164].map((y) => `<rect x="30" y="${y}" width="90" height="5" rx="2" class="fg-gris"/><rect x="156" y="${y}" width="30" height="5" rx="2" class="fg-tinta-suave"/><path d="M26 ${y + 10}h164" class="fg-raya-fina"/>`),
    // 5 total
    `<rect x="100" y="182" width="90" height="20" rx="4" class="fg-cobre-claro"/>`,
    t(108, 196, "Total $4,500", "fg-t fg-t-b"),
    // 6 condiciones
    `<rect x="26" y="212" width="130" height="5" rx="2" class="fg-gris"/><rect x="26" y="222" width="100" height="5" rx="2" class="fg-gris"/>`,
    // 7 siguiente paso
    `<rect x="26" y="240" width="164" height="20" rx="5" class="fg-musgo"/>`,
    t(108, 254, "Aparta con 50 %", "fg-t-s fg-t-inv fg-t-b", 0, "middle"),
    ...bloques.map(([nombre, y, h], i) => {
      const cy = y + h / 2;
      return `<path d="M200 ${cy}h20" class="fg-guia"/><circle cx="230" cy="${cy}" r="9" class="fg-musgo"/>${t(230, cy + 4, String(i + 1), "fg-t-num", 0, "middle")}${t(246, cy + 4, nombre, "fg-t")}`;
    }),
  ].join(""),
};

// ─── Tu menú con link: foto borrosa contra link ───────────────────────────
const menuLink: Figura = {
  alt: "A la izquierda, un chat con la foto borrosa del menú y un cliente que pregunta el precio sin respuesta en 12 minutos. A la derecha, un menú con link: categorías, productos con precio y botón para pedir.",
  pie: "La foto obliga a preguntar y a esperar. El link contesta solo, a cualquier hora.",
  ancho: 360,
  alto: 262,
  cuerpo: [
    mal(12, 14), t(26, 18, "Foto del menú", "fg-t"),
    `<rect x="6" y="30" width="166" height="226" rx="18" class="fg-telefono"/><rect x="13" y="38" width="152" height="210" rx="12" class="fg-pantalla"/>`,
    `<rect x="22" y="50" width="112" height="84" rx="6" class="fg-borroso"/>`,
    ...[62, 74, 86, 98, 110, 122].map((y, i) => `<rect x="30" y="${y}" width="${[70, 88, 60, 80, 66, 84][i]}" height="5" rx="2" class="fg-borroso-linea"/>`),
    `<rect x="52" y="146" width="104" height="36" rx="8" class="fg-burbuja-cliente"/>`,
    t(60, 160, ["¿Cuánto cuesta la", "orden de 3?"], "fg-t-s", 13),
    `<rect x="30" y="196" width="118" height="22" rx="11" class="fg-cobre-claro"/>`,
    t(89, 211, "12 min sin respuesta", "fg-t-xs fg-t-cobre fg-t-b", 0, "middle"),
    bien(196, 14), t(210, 18, "Menú con link", "fg-t"),
    `<rect x="188" y="30" width="166" height="226" rx="18" class="fg-telefono"/><rect x="195" y="38" width="152" height="210" rx="12" class="fg-pantalla"/>`,
    `<rect x="195" y="38" width="152" height="30" rx="12" class="fg-musgo"/><rect x="195" y="54" width="152" height="14" class="fg-musgo"/>`,
    t(207, 58, "El Güero · Menú", "fg-t-s fg-t-inv fg-t-b"),
    ...["Tacos", "Tortas", "Bebidas"].map((c, i) => `<rect x="${203 + i * 47}" y="76" width="43" height="16" rx="8" class="${i === 0 ? "fg-musgo" : "fg-hundido"}"/>${t(224.5 + i * 47, 87, c, `fg-t-xs${i === 0 ? " fg-t-inv" : ""}`, 0, "middle")}`),
    ...[["3 al pastor", "$65"], ["3 de suadero", "$70"], ["Gringa", "$58"], ["Campechano", "$72"]].map(([n, p], i) => {
      const y = 104 + i * 26;
      return `<rect x="203" y="${y}" width="18" height="18" rx="4" class="fg-cobre-claro"/>${t(227, y + 13, n, "fg-t-xs")}${t(339, y + 13, p, "fg-t-xs fg-t-b", 0, "end")}`;
    }),
    `<rect x="203" y="214" width="136" height="24" rx="7" class="fg-musgo"/>`,
    t(271, 230, "Pedir por WhatsApp", "fg-t-s fg-t-inv fg-t-b", 0, "middle"),
  ].join(""),
};

// ─── Un mes de publicaciones: el perfil ───────────────────────────────────
function perfil(x0: number, activo: boolean) {
  const celdas: string[] = [];
  for (let f = 0; f < 3; f++)
    for (let c = 0; c < 3; c++) {
      const n = f * 3 + c;
      const x = x0 + 10 + c * 50, y = 96 + f * 50;
      const lleno = activo || n >= 6;
      celdas.push(`<rect x="${x}" y="${y}" width="46" height="46" rx="3" class="${lleno ? (activo ? ["fg-foto1", "fg-foto2", "fg-foto3"][n % 3] : "fg-foto-vieja") : "fg-vacio"}"/>`);
    }
  return [
    `<rect x="${x0}" y="30" width="170" height="228" rx="12" class="fg-pantalla"/>`,
    `<circle cx="${x0 + 30}" cy="58" r="16" class="${activo ? "fg-cobre-claro" : "fg-gris"}"/>`,
    t(x0 + 54, 54, "elguero.tacos", "fg-t-s fg-t-b"),
    t(x0 + 54, 67, ["Última publicación:", activo ? "hace 2 horas" : "hace 4 meses"], `fg-t-xs ${activo ? "fg-t-musgo" : "fg-t-cobre"} fg-t-b`, 11),
    ...celdas,
  ].join("");
}
const perfilFeed: Figura = {
  alt: "Dos perfiles del mismo negocio. En el primero la última publicación fue hace 4 meses y casi todo el feed está vacío. En el segundo la última fue hace 2 horas y el feed está lleno.",
  pie: "Lo primero que mira un cliente nuevo es la fecha de tu última publicación.",
  ancho: 360,
  alto: 266,
  cuerpo: [
    mal(12, 14), t(26, 18, "«¿Ya habrá cerrado?»", "fg-t"),
    perfil(4, false),
    bien(196, 14), t(210, 18, "«Está abierto y activo»", "fg-t"),
    perfil(186, true),
  ].join(""),
};

// ─── Ventas con IA 1: las siete piezas y la que falta ─────────────────────
const piezas = ["Cliente ideal", "Oferta", "Mensaje inicial", "Canal", "Primer contacto", "Seguimiento", "Números"];
function caja(x: number, y: number, nombre: string, falta: boolean) {
  const [a, b] = nombre.includes(" ") ? [nombre.split(" ")[0], nombre.split(" ").slice(1).join(" ")] : [nombre, ""];
  return `<rect x="${x}" y="${y}" width="78" height="44" rx="8" class="${falta ? "fg-falta" : "fg-pieza"}"/>${t(x + 39, y + (b ? 19 : 26), b ? [a, b] : a, `fg-t-s fg-t-b${falta ? " fg-t-cobre" : ""}`, 13, "middle")}`;
}
const sietePiezas: Figura = {
  alt: "Las siete piezas de un sistema de ventas unidas en cadena: cliente ideal, oferta, mensaje inicial, canal, primer contacto, seguimiento y números. El seguimiento está vacío y por ahí se escapan los clientes.",
  pie: "Cuando falta una pieza, el esfuerzo se escapa por ahí. No es que «no sepas vender».",
  ancho: 360,
  alto: 200,
  cuerpo: [
    ...piezas.slice(0, 4).map((p, i) => caja(4 + i * 90, 12, p, false)),
    ...[0, 1, 2].map((i) => flecha(84 + i * 90, 34, 92 + i * 90, 34)),
    `<path d="M355 56 C 370 80, 360 88, 318 92" class="fg-flecha" marker-end="url(#fg-punta)"/>`,
    ...piezas.slice(4).map((p, i) => caja(229 - i * 112, 90, p, p === "Seguimiento")),
    flecha(227, 112, 211, 112), flecha(115, 112, 99, 112),
    ...[0, 1, 2].map((i) => `<path class="fg-gota" d="M${148 + i * 14} ${144 + i * 6}c0 0-5 6-5 9a5 5 0 0 0 10 0c0-3-5-9-5-9z"/>`),
    t(156, 188, "Por aquí se escapan los clientes", "fg-t-s fg-t-cobre fg-t-b", 0, "middle"),
  ].join(""),
};

// ─── Ventas con IA 2: el embudo de Rubén ──────────────────────────────────
const embudo: [string, number, string][] = [["Contactos", 30, ""], ["Respuestas", 24, "80 %"], ["Conversaciones", 18, "75 %"], ["Propuestas", 12, "67 %"], ["Cierres", 1, "8 %"]];
const embudoRuben: Figura = {
  alt: "El embudo de Rubén en cinco números: 30 contactos, 24 respuestas, 18 conversaciones, 12 propuestas y 1 cierre. La caída de 12 propuestas a 1 cierre, del 8 por ciento, está marcada como la fuga.",
  pie: "A Rubén sí le llega gente. Se le cae todo entre la propuesta y el cierre: ahí está su fuga.",
  ancho: 360,
  alto: 214,
  cuerpo: [
    t(4, 14, "El mes de Rubén", "fg-t fg-t-b"), t(356, 14, "De la etapa anterior", "fg-t-xs", 0, "end"),
    ...embudo.map(([n, v, p], i) => {
      const y = 28 + i * 34, w = Math.max(6, (v / 30) * 190), fuga = i === 4;
      return `${t(4, y + 17, n, "fg-t-s")}<rect x="104" y="${y + 4}" width="${w}" height="20" rx="4" class="${fuga ? "fg-cobre" : i === 3 ? "fg-musgo-medio" : "fg-musgo"}"/>${t(110 + w, y + 18, String(v), `fg-t fg-t-b${fuga ? " fg-t-cobre" : ""}`)}${p ? t(356, y + 18, p, `fg-t-s fg-t-b${fuga ? " fg-t-cobre" : ""}`, 0, "end") : ""}`;
    }),
    `<rect x="136" y="170" width="220" height="36" rx="8" class="fg-cobre-claro"/>`,
    t(146, 185, ["La fuga: 12 propuestas, 1 cierre.", "Más anuncios no lo arreglan."], "fg-t-xs fg-t-cobre fg-t-b", 13),
  ].join(""),
};

// ─── Monetiza IA 2: la escalera «¿y eso qué me da?» ───────────────────────
const escalon = (x: number, y: number, w: number, lineas: string[], cls: string, tcls: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${16 + lineas.length * 14}" rx="8" class="${cls}"/>${t(x + 12, y + 18, lineas, tcls, 14)}`;
const escalera: Figura = {
  alt: "Una escalera de tres peldaños. Abajo, lo que haces: publicaciones con IA. Al preguntar «¿y eso qué me da?» sube a: que te vean seguido. Y arriba, lo que compra el cliente: que se acuerden de ti cuando buscan dónde comer.",
  pie: "Pregunta «¿y eso qué me da?» hasta que ya no tenga respuesta: ahí está lo que te pagan.",
  ancho: 360,
  alto: 232,
  cuerpo: [
    t(4, 214, "Lo que haces", "fg-t-xs fg-t-b"),
    escalon(4, 162, 170, ["«Publicaciones con IA»"], "fg-hundido", "fg-t-s fg-t-b"),
    `<path d="M150 158 C 160 140, 170 132, 184 124" class="fg-flecha" marker-end="url(#fg-punta)"/>`,
    t(96, 136, "¿y eso qué me da?", "fg-t-xs fg-t-cobre fg-t-b", 0, "middle"),
    escalon(96, 96, 170, ["Que te vean seguido"], "fg-musgo-claro", "fg-t-s fg-t-b"),
    `<path d="M242 92 C 252 74, 262 66, 276 58" class="fg-flecha" marker-end="url(#fg-punta)"/>`,
    t(200, 70, "¿y eso qué me da?", "fg-t-xs fg-t-cobre fg-t-b", 0, "middle"),
    escalon(150, 12, 206, ["Que se acuerden de ti", "cuando buscan dónde comer"], "fg-musgo", "fg-t-s fg-t-inv fg-t-b"),
    t(356, 70, "Lo que compra", "fg-t-xs fg-t-b", 0, "end"), t(356, 84, "el cliente", "fg-t-xs fg-t-b", 0, "end"),
  ].join(""),
};

export const FIGURAS: Record<string, Figura> = {
  "pin-mapa": pinMapa,
  bienvenida,
  cotizacion,
  "menu-link": menuLink,
  "perfil-feed": perfilFeed,
  "siete-piezas": sietePiezas,
  "embudo-ruben": embudoRuben,
  escalera,
};

/** Qué figura va en qué lección (curso/módulo/lección) y antes de qué encabezado. */
export const FIGURAS_POR_LECCION: Record<string, { id: string; antesDe: string }[]> = {
  "tu-negocio-en-google/1/1": [{ id: "pin-mapa", antesDe: "## La verificación: tres caminos" }],
  "whatsapp-que-contesta-solo/1/1": [{ id: "bienvenida", antesDe: "### Antes y después" }],
  "cotiza-en-5-minutos/1/1": [{ id: "cotizacion", antesDe: "### 1. Encabezado" }],
  "menu-con-link/1/1": [{ id: "menu-link", antesDe: "## Tres herramientas gratuitas: cuál te toca" }],
  "un-mes-de-publicaciones/1/1": [{ id: "perfil-feed", antesDe: "## El brief: diez líneas que sirven para siempre" }],
  "ventas-con-ia/1/1": [{ id: "siete-piezas", antesDe: "## Cómo se ve una pieza faltante" }],
  "ventas-con-ia/1/2": [{ id: "embudo-ruben", antesDe: "## Cómo leer tus propios números" }],
  "monetiza-ia/2/1": [{ id: "escalera", antesDe: "## Tu turno" }],
};

const MARCA = /^@@figura:([a-z0-9-]+)@@$/;

/** Inserta las marcas de figura en el texto de la lección, antes de su encabezado. */
export function conFiguras(texto: string, clave: string): string {
  let salida = texto;
  for (const { id, antesDe } of FIGURAS_POR_LECCION[clave] ?? []) {
    const i = salida.split("\n").findIndex((l) => l.trim() === antesDe);
    if (i < 0) continue;
    const lineas = salida.split("\n");
    lineas.splice(i, 0, `@@figura:${id}@@`, "");
    salida = lineas.join("\n");
  }
  return salida;
}

/** HTML de un bloque de marca, o null si el bloque no es una figura. */
export function figuraHtml(bloque: string): string | null {
  const m = bloque.trim().match(MARCA);
  const f = m ? FIGURAS[m[1]] : undefined;
  if (!f) return null;
  const id = `fg-${m![1]}`;
  return (
    `<figure class="md-figura"><svg viewBox="0 0 ${f.ancho} ${f.alto}" role="img" aria-labelledby="${id}" class="fg">` +
    `<title id="${id}">${esc(f.alt)}</title>` +
    `<defs><marker id="fg-punta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="fg-punta"/></marker></defs>` +
    f.cuerpo +
    `</svg><figcaption>${esc(f.pie)}</figcaption></figure>`
  );
}
