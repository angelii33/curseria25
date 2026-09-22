// Las 6 escenas de curso, en un lienzo propio de 56×56.
//
// Antes vivían dentro de portada.tsx, dibujadas en coordenadas absolutas
// de la banda de 360×120 — servían ahí y en ningún otro sitio. Al pasarlas
// a un viewBox propio se pueden usar a cualquier tamaño: la miniatura del
// hero, la banda del catálogo, la imagen que se ve al compartir por
// WhatsApp. Un solo dibujo por curso, una sola fuente de verdad.
//
// `linea` es el trazo del objeto; `acento` marca el ÚNICO punto de logro
// de cada escena — el pin encontrado, el visto del chat, el día agendado.
// Esa distinción es la que hace que se lean como una historia y no como
// un ícono más.

import { editorialDe } from "./editorial";

export type TipoEscena =
  | "mapa"
  | "menu"
  | "chat"
  | "calendario"
  | "documento"
  | "sistema";

export const ESCENA_POR_SLUG: Record<string, TipoEscena> = {
  "tu-negocio-en-google": "mapa",
  "menu-con-link": "menu",
  "whatsapp-que-contesta-solo": "chat",
  "un-mes-de-publicaciones": "calendario",
  "cotiza-en-5-minutos": "documento",
  "ventas-con-ia": "sistema",
};

/** El problema que resuelve cada curso, en las palabras del dueño del
 *  negocio. La fuente es la capa editorial (lib/editorial.ts); esto se
 *  mantiene por compatibilidad con quien ya lo importaba. */
export const PROBLEMA_POR_SLUG: Record<string, string> = Object.fromEntries(
  Object.keys(ESCENA_POR_SLUG)
    .map((slug) => [slug, editorialDe(slug)?.problema])
    .filter((par): par is [string, string] => Boolean(par[1]))
);

/**
 * Dibuja una escena dentro de un viewBox de 56×56.
 * Devuelve los nodos sueltos: quien la use decide el <svg> que la envuelve.
 */
export function escena(tipo: TipoEscena, linea: string, acento: string) {
  if (tipo === "mapa") {
    return (
      <g fill="none" stroke={linea} strokeWidth={1.8}>
        <circle cx={24} cy={22} r={10} />
        <path d="M17 29 L24 46 L31 29" strokeLinejoin="round" />
        <circle cx={24} cy={22} r={3.4} fill={acento} stroke="none" />
        <path d="M39 13 A16 16 0 0 1 39 27" strokeWidth={1.4} strokeLinecap="round" opacity={0.75} />
        <path d="M46 7 A24 24 0 0 1 46 33" strokeWidth={1.4} strokeLinecap="round" opacity={0.4} />
      </g>
    );
  }
  if (tipo === "menu") {
    return (
      <g fill="none" stroke={linea}>
        <g strokeWidth={1.7}>
          <rect x={7} y={8} width={30} height={40} rx={3} />
          <line x1={13} y1={17} x2={31} y2={17} strokeWidth={1.4} strokeLinecap="round" />
          <line x1={13} y1={24} x2={27} y2={24} strokeWidth={1.4} strokeLinecap="round" />
          <line x1={13} y1={31} x2={29} y2={31} strokeWidth={1.4} strokeLinecap="round" />
          <line x1={13} y1={40} x2={24} y2={40} stroke={acento} strokeWidth={2.4} strokeLinecap="round" />
        </g>
        <g transform="translate(43 22) rotate(18)" strokeWidth={1.6}>
          <rect x={-8} y={-9} width={16} height={9} rx={4.5} />
          <rect x={-2} y={0} width={16} height={9} rx={4.5} />
        </g>
      </g>
    );
  }
  if (tipo === "chat") {
    return (
      <g fill="none" stroke={linea}>
        <path
          d="M11 9h34a5 5 0 0 1 5 5v19a5 5 0 0 1-5 5H26l-9 8v-8h-6a5 5 0 0 1-5-5V14a5 5 0 0 1 5-5z"
          strokeWidth={1.7}
          strokeLinejoin="round"
        />
        <line x1={15} y1={18} x2={38} y2={18} strokeWidth={1.4} strokeLinecap="round" />
        <line x1={15} y1={24} x2={31} y2={24} strokeWidth={1.4} strokeLinecap="round" />
        <path d="M30 32l4 4 8-9" stroke={acento} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  }
  if (tipo === "calendario") {
    const celdas: React.ReactNode[] = [];
    for (let f = 0; f < 2; f++)
      for (let c = 0; c < 4; c++) {
        const hecho = f === 0 && c === 2;
        celdas.push(
          <rect
            key={`${f}-${c}`}
            x={12 + c * 9}
            y={27 + f * 10}
            width={6.5} height={6.5} rx={1.4}
            fill={hecho ? acento : "none"}
            stroke={hecho ? "none" : linea}
            strokeWidth={1.3}
          />
        );
      }
    return (
      <g fill="none" stroke={linea} strokeWidth={1.7}>
        <rect x={7} y={12} width={42} height={36} rx={3} />
        <line x1={17} y1={7} x2={17} y2={16} strokeLinecap="round" />
        <line x1={39} y1={7} x2={39} y2={16} strokeLinecap="round" />
        <line x1={7} y1={21} x2={49} y2={21} strokeWidth={1.3} />
        {celdas}
      </g>
    );
  }
  if (tipo === "documento") {
    return (
      <g fill="none" stroke={linea}>
        <g strokeWidth={1.7}>
          <path d="M10 6h20l8 8v34H10z" strokeLinejoin="round" />
          <path d="M30 6v8h8" strokeLinejoin="round" />
          <line x1={16} y1={22} x2={32} y2={22} strokeWidth={1.4} strokeLinecap="round" />
          <line x1={16} y1={29} x2={28} y2={29} strokeWidth={1.4} strokeLinecap="round" />
          <line x1={16} y1={40} x2={26} y2={40} stroke={acento} strokeWidth={2.4} strokeLinecap="round" />
        </g>
        <g transform="translate(43 40)" stroke={acento} strokeWidth={1.8}>
          <circle r={10} />
          <line x1={0} y1={0} x2={0} y2={-6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={4} y2={2} strokeLinecap="round" />
        </g>
      </g>
    );
  }
  // sistema — la red de piezas conectadas
  return (
    <g fill="none" stroke={linea} strokeWidth={1.7}>
      <line x1={15} y1={16} x2={22} y2={25} strokeWidth={1.3} />
      <line x1={41} y1={16} x2={34} y2={25} strokeWidth={1.3} />
      <line x1={28} y1={35} x2={28} y2={42} strokeWidth={1.3} />
      <circle cx={12} cy={13} r={6} />
      <circle cx={44} cy={13} r={6} />
      <circle cx={28} cy={30} r={6.5} stroke={acento} strokeWidth={2} />
      <circle cx={28} cy={47} r={6} />
    </g>
  );
}
