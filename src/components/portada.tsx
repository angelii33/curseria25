import Image from "next/image";
import { ESCENA_POR_SLUG, escena } from "@/lib/escenas";

// Banda de serie generada con los tokens del Design System.
// Sin archivos ni almacenamiento. ~1 KB de SVG por curso.
//
// Cuando el curso tiene cover_url, se sirve la fotografía real vía
// next/image en vez del SVG — ver Portada() más abajo.
//
// Cada uno de los 6 cursos conocidos tiene una escena propia, dibujada
// para SU tema — no decoración intercambiable. Un curso nuevo que no
// esté en el mapa cae al motivo geométrico abstracto de siempre, así
// que el sistema nunca se rompe por falta de ilustración.

const W = 360;
const H = 120;

const MOTIVOS = ["perforacion", "trama", "arcos", "escalera", "reglas"] as const;

export function varianteDe(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % MOTIVOS.length;
}

function motivo(tipo: (typeof MOTIVOS)[number], color: string) {
  const p: React.ReactNode[] = [];
  if (tipo === "perforacion") {
    for (let x = 0; x < 16; x++)
      for (let y = 0; y < 5; y++)
        p.push(<circle key={`${x}-${y}`} cx={16 + x * 23} cy={16 + y * 23} r={2.4} fill={color} />);
  } else if (tipo === "trama") {
    for (let i = 0; i < 20; i++)
      p.push(<line key={i} x1={-40 + i * 22} y1={H} x2={40 + i * 22} y2={0} stroke={color} strokeWidth={1.5} />);
  } else if (tipo === "arcos") {
    for (let i = 0; i < 7; i++)
      p.push(<circle key={i} cx={40} cy={H - 14} r={30 + i * 30} fill="none" stroke={color} strokeWidth={1.7} />);
  } else if (tipo === "escalera") {
    for (let i = 0; i < 12; i++) {
      const alto = ((i % 4) + 1) * 22;
      p.push(<rect key={i} x={8 + i * 31} y={H - 10 - alto} width={15} height={alto} fill={color} />);
    }
  } else {
    for (let i = 0; i < 7; i++)
      p.push(<line key={i} x1={0} y1={12 + i * 17} x2={i % 3 ? W : 205} y2={12 + i * 17} stroke={color} strokeWidth={1.3} />);
  }
  return p;
}

/** Marcas de registro de imprenta en las cuatro esquinas. */
function marcas(color: string) {
  const L = 10, M = 8;
  const esquinas: [number, number, number, number][] = [
    [M, M, 1, 1], [W - M, M, -1, 1], [M, H - M, 1, -1], [W - M, H - M, -1, -1],
  ];
  return esquinas.flatMap(([x, y, dx, dy], i) => [
    <line key={`h${i}`} x1={x} y1={y} x2={x + dx * L} y2={y} stroke={color} strokeWidth={1} />,
    <line key={`v${i}`} x1={x} y1={y} x2={x} y2={y + dy * L} stroke={color} strokeWidth={1} />,
  ]);
}

type ContextoPortada = "tarjeta" | "cabecera";

const SIZES_POR_CONTEXTO: Record<ContextoPortada, string> = {
  // Una columna en móvil, dos desde 900px — ver .catalogo en globals.css.
  tarjeta: "(min-width: 900px) 50vw, 100vw",
  // La cabecera respeta el marco general, topado a 1240px.
  cabecera: "(min-width: 1240px) 1240px, 100vw",
};

export function Portada({
  id,
  piezas,
  destacado = false,
  variante,
  slug,
  imagen,
  alt,
  contexto = "tarjeta",
  prioridad = false,
}: {
  id: string;
  piezas: number;
  destacado?: boolean;
  variante: number;
  /** El slug decide si hay una escena propia dibujada para este curso. */
  slug?: string;
  /** Portada fotográfica. Si falta, se dibuja la banda generada. */
  imagen?: string | null;
  alt?: string;
  /** Dónde se muestra: decide el recorte. Ver ContextoPortada arriba. */
  contexto?: ContextoPortada;
  /** Solo la cabecera de una página de curso puede ser candidata a LCP.
   *  Nunca se pasa true en una ficha de catálogo — priority ahí sería
   *  pedirle al navegador que adelante 5 o 6 imágenes a la vez. */
  prioridad?: boolean;
}) {
  const acento = destacado ? "var(--cobre-600)" : "var(--musgo-300)";

  if (imagen) {
    return (
      <div
        className={`portada-foto portada-foto-${contexto} ${destacado ? "portada-foto-destacada" : ""}`}
      >
        <Image
          src={imagen}
          alt={alt ?? ""}
          fill
          sizes={SIZES_POR_CONTEXTO[contexto]}
          priority={prioridad}
          loading={prioridad ? undefined : "lazy"}
          style={{ objectFit: "cover" }}
          className="portada-foto-img"
        />
        <span className="portada-sello" aria-hidden="true">
          <span className="sello sello-mini-foto">{piezas}</span>
          <span className="t-dato">piezas listas</span>
        </span>
      </div>
    );
  }

  const tipoEscena = slug ? ESCENA_POR_SLUG[slug] : undefined;
  const tipoMotivo = MOTIVOS[variante % MOTIVOS.length];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="portada" role="img" aria-hidden="true">
      <defs>
        <clipPath id={`${id}c`}><rect width={W} height={H} /></clipPath>
      </defs>

      <rect width={W} height={H} fill="var(--musgo-900)" />

      {tipoEscena ? (
        /* La escena vive en su propio lienzo de 56×56 (lib/escenas.tsx).
           Aquí se coloca a la derecha de la banda y se escala ×1.55 para
           que llene el alto de 120 sin deformarse: un solo dibujo sirve
           igual en la miniatura del hero que en la tarjeta de WhatsApp. */
        <g clipPath={`url(#${id}c)`} opacity={0.85}>
          <g transform="translate(228 16) scale(1.55)">
            {escena(tipoEscena, "var(--musgo-500)", acento)}
          </g>
        </g>
      ) : (
        <g clipPath={`url(#${id}c)`} opacity={0.45}>{motivo(tipoMotivo, "var(--musgo-700)")}</g>
      )}

      <rect width={W} height={4.5} fill={acento} />
      <rect y={4.5} width={W} height={1} fill="var(--musgo-700)" opacity={0.6} />
      <g opacity={0.4}>{marcas("var(--musgo-300)")}</g>

      <g transform={`translate(40 ${H / 2 + 2}) rotate(-7)`}>
        <circle r={20} fill="none" stroke={acento} strokeWidth={1.8} />
        <text y={7} className="pt-sello" fill={acento}>{piezas}</text>
      </g>
      <text x={72} y={H / 2 + 8} className="pt-pie" fill="var(--tinta-inversa)">
        piezas listas
      </text>

      {Array.from({ length: Math.floor((W - 9) / 10) + 1 }, (_, i) => (
        <circle key={i} cx={9 + i * 10} cy={H} r={3.1} fill="var(--lienzo)" />
      ))}
    </svg>
  );
}
