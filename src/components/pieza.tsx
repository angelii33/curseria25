// La pieza terminada, dibujada.
//
// La promesa de la marca es «entras con un problema, sales con una pieza
// terminada». Esta ilustración es esa pieza: la ficha de Google, el menú en
// el teléfono, el chat que contesta solo, el mes de publicaciones, la
// cotización, el tablero de ventas. Cada una está dibujada por PARTES, y
// cada parte corresponde a una lección (o a un módulo en los cursos largos).
//
// Estados de cada parte:
//   hecha     — dibujada a color: ya la construiste.
//   actual    — resaltada en cobre: es lo que construye la lección abierta.
//   pendiente — solo el contorno punteado: el hueco que queda por llenar.
//
// Así la misma ilustración sirve para vender (todo hecho: «esto te llevas»),
// para orientar (la lección 3 construye ESTO) y para mostrar avance (llevas
// 2 de 5). Es SVG estático en un Server Component: cero JavaScript.
//
// Los nombres que aparecen dentro («Taquería El Güero», «Remodelaciones
// Díaz») son ejemplos de las propias lecciones, no clientes.

import type { ReactNode } from "react";

type EstadoParte = "hecha" | "actual" | "pendiente";

type Dibujo = {
  base: ReactNode;
  partes: ReactNode[];
};

const T = (x: number, y: number, s: number, texto: string, clase = "pz-t", peso = 500) => (
  <text x={x} y={y} fontSize={s} fontWeight={peso} className={clase}>
    {texto}
  </text>
);

const barra = (x: number, y: number, w: number, clase = "pz-b", h = 5) => (
  <rect x={x} y={y} width={w} height={h} rx={h / 2} className={clase} />
);

const estrella = (cx: number, cy: number, r: number, clase: string, k: number) => {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    p.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return <polygon key={k} points={p.join(" ")} className={clase} />;
};

// ─── Tu negocio en Google: la ficha del mapa ───────────────────────────────
const GOOGLE: Dibujo = {
  base: (
    <>
      <rect x={10} y={8} width={300} height={204} rx={12} className="pz-hoja" />
    </>
  ),
  partes: [
    // 1 · Ficha reclamada: mapa, pin, nombre, categoría, verificación
    <g key="g1">
      <path d="M10 20a12 12 0 0 1 12-12h276a12 12 0 0 1 12 12v44H10z" className="pz-mapa" />
      <path d="M10 46 L90 30 L170 44 L250 26 L310 38" className="pz-calle" />
      <path d="M60 8 L80 64 M200 8 L186 64" className="pz-calle" />
      <path d="M160 22a9 9 0 0 1 9 9c0 7-9 16-9 16s-9-9-9-16a9 9 0 0 1 9-9z" className="pz-cobre" />
      <circle cx={160} cy={31} r={3} className="pz-hoja-f" />
      {T(24, 88, 13, "Taquería El Güero", "pz-t", 700)}
      {T(24, 104, 9, "Taquería · Abierto ahora", "pz-tm")}
      <circle cx={290} cy={84} r={8} className="pz-musgo" />
      <path d="M286 84l3 3 5-6" className="pz-check" />
    </g>,
    // 2 · Ficha completa: botones de acción y descripción
    <g key="g2">
      {["Llamar", "Cómo llegar", "Horario"].map((t, i) => (
        <g key={t}>
          <rect x={24 + i * 74} y={116} width={66} height={18} rx={9} className="pz-chip" />
          {T(34 + i * 74, 128, 8, t, "pz-tchip", 600)}
        </g>
      ))}
      {barra(24, 144, 200)}
      {barra(24, 153, 150)}
    </g>,
    // 3 · Fotos reales
    <g key="g3">
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={24 + i * 54} y={166} width={48} height={34} rx={4} className="pz-foto" />
          <path d={`M${28 + i * 54} 196l10-12 8 8 6-5 14 9`} className="pz-foto-l" />
        </g>
      ))}
    </g>,
    // 4 · Reseñas
    <g key="g4">
      {[0, 1, 2, 3, 4].map((i) => estrella(252 + i * 11, 101, 4.6, "pz-estrella", i))}
    </g>,
    // 5 · Publicación de la semana
    <g key="g5">
      <rect x={244} y={140} width={54} height={60} rx={5} className="pz-post" />
      <rect x={250} y={146} width={42} height={24} rx={3} className="pz-cobre-s" />
      {T(250, 182, 7.5, "Novedad", "pz-t", 700)}
      {barra(250, 188, 34, "pz-b", 4)}
    </g>,
  ],
};

// ─── Tu menú con link: el teléfono con el menú abierto ─────────────────────
const MENU: Dibujo = {
  base: (
    <>
      <rect x={100} y={6} width={120} height={208} rx={16} className="pz-tel" />
      <rect x={107} y={14} width={106} height={192} rx={10} className="pz-hoja" />
    </>
  ),
  partes: [
    // 1 · Menú publicado con link
    <g key="m1">
      <rect x={113} y={20} width={94} height={13} rx={6.5} className="pz-chip" />
      {T(119, 29.5, 7, "elguero.site/menu", "pz-tchip", 600)}
      {T(115, 50, 11, "El Güero", "pz-t", 700)}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          {barra(137, 78 + i * 26, 42 - (i % 2) * 10)}
          {barra(137, 86 + i * 26, 28, "pz-b2", 4)}
          {T(188, 84 + i * 26, 8, ["$22", "$65", "$38", "$25"][i], "pz-t", 700)}
        </g>
      ))}
    </g>,
    // 2 · Fotos que dan antojo
    <g key="m2">
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={113} y={75 + i * 26} width={19} height={19} rx={3} className="pz-foto" />
          <circle cx={122.5} cy={84.5 + i * 26} r={5} className="pz-plato" />
        </g>
      ))}
    </g>,
    // 3 · Categorías y combo
    <g key="m3">
      {["Tacos", "Tortas", "Bebidas"].map((t, i) => (
        <g key={t}>
          <rect x={113 + i * 32} y={57} width={29} height={11} rx={5.5} className={i === 0 ? "pz-musgo" : "pz-chip"} />
          {T(117 + i * 32, 65, 6.5, t, i === 0 ? "pz-tinv" : "pz-tchip", 600)}
        </g>
      ))}
      <rect x={163} y={126} width={24} height={10} rx={3} className="pz-cobre" />
      {T(166, 133.5, 6.5, "Combo", "pz-tinv", 700)}
    </g>,
    // 4 · El link en WhatsApp
    <g key="m4">
      <path d="M12 58h74a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H30l-8 7v-7h-4a6 6 0 0 1-6-6V64a6 6 0 0 1 6-6z" className="pz-burbuja" />
      {T(20, 72, 7.5, "Aquí está el menú:", "pz-t", 600)}
      {T(20, 84, 7.5, "elguero.site/menu", "pz-link", 700)}
      <path d="M92 76 C 98 76, 100 60, 106 58" className="pz-flecha" />
    </g>,
    // 5 · Pedido confirmado
    <g key="m5">
      <rect x={116} y={184} width={88} height={16} rx={8} className="pz-musgo" />
      {T(135, 195, 7.5, "Hacer pedido", "pz-tinv", 700)}
      <rect x={232} y={96} width={78} height={98} rx={6} className="pz-ticket" />
      {T(240, 112, 8, "Pedido", "pz-t", 700)}
      {barra(240, 120, 56, "pz-b2", 4)}
      {barra(240, 129, 44, "pz-b2", 4)}
      {barra(240, 138, 50, "pz-b2", 4)}
      <g transform="translate(271 168) rotate(-7)">
        <circle r={14} className="pz-sello" />
        <path d="M-6 0l4 4.5 8-9" className="pz-check-c" />
      </g>
    </g>,
  ],
};

// ─── WhatsApp que contesta solo: la conversación ───────────────────────────
const CHAT: Dibujo = {
  base: (
    <>
      <rect x={92} y={6} width={136} height={208} rx={16} className="pz-tel" />
      <rect x={99} y={14} width={122} height={192} rx={10} className="pz-hoja" />
      <path d="M99 24a10 10 0 0 1 10-10h102a10 10 0 0 1 10 10v12H99z" className="pz-musgo" />
      <circle cx={112} cy={27} r={6} className="pz-hoja-f" />
      {T(122, 30, 8, "El Güero", "pz-tinv", 700)}
      <rect x={105} y={44} width={62} height={16} rx={7} className="pz-burbuja" />
      {T(111, 55, 7, "Hola, ¿precio?", "pz-t", 500)}
      <rect x={105} y={188} width={110} height={12} rx={6} className="pz-chip" />
    </>
  ),
  partes: [
    // 1 · Bienvenida automática
    <g key="c1">
      <rect x={124} y={66} width={91} height={36} rx={7} className="pz-burbuja-v" />
      {T(130, 77, 6.8, "¡Hola! Mándame tu pedido", "pz-t", 500)}
      {T(130, 87, 6.8, "y te confirmo en 5 min.", "pz-t", 500)}
      {T(130, 97, 6, "Respuesta automática", "pz-tm", 600)}
    </g>,
    // 2 · Respuestas rápidas
    <g key="c2">
      {["/precios", "/horario", "/ubica"].map((t, i) => (
        <g key={t}>
          <rect x={105 + i * 37} y={108} width={34} height={12} rx={6} className="pz-chip" />
          {T(109 + i * 37, 116.5, 6.3, t, "pz-tchip", 700)}
        </g>
      ))}
    </g>,
    // 3 · Catálogo dentro del chat
    <g key="c3">
      <rect x={124} y={126} width={91} height={48} rx={7} className="pz-burbuja-v" />
      <rect x={130} y={132} width={28} height={28} rx={3} className="pz-foto" />
      <circle cx={144} cy={146} r={7} className="pz-plato" />
      {barra(163, 136, 44, "pz-b", 4)}
      {barra(163, 144, 30, "pz-b2", 4)}
      {T(163, 158, 7, "Ver catálogo", "pz-link", 700)}
    </g>,
    // 4 · Etiquetas
    <g key="c4">
      {[
        ["Nuevo", "pz-e1"],
        ["Cotizando", "pz-e2"],
        ["Por cobrar", "pz-e3"],
        ["Frecuente", "pz-e4"],
      ].map(([t, c], i) => (
        <g key={t}>
          <rect x={8} y={50 + i * 22} width={76} height={17} rx={4} className="pz-chip" />
          <circle cx={17} cy={58.5 + i * 22} r={4} className={c} />
          {T(25, 61.5 + i * 22, 7.5, t, "pz-t", 600)}
        </g>
      ))}
    </g>,
    // 5 · Reconquista
    <g key="c5">
      <path d="M236 118h70a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6h-54l-8 7v-7h-8a6 6 0 0 1-6-6v-28a6 6 0 0 1 6-6z" className="pz-burbuja-v" />
      {T(242, 132, 7, "¿Te guardo tu", "pz-t", 500)}
      {T(242, 142, 7, "pedido de siempre?", "pz-t", 500)}
      <g transform="translate(290 180) rotate(-7)">
        <circle r={12} className="pz-sello" />
        <path d="M-5 0l3.5 4 7-8" className="pz-check-c" />
      </g>
      {T(236, 184, 7, "Contestó", "pz-tm", 700)}
    </g>,
  ],
};

// ─── Un mes de publicaciones: el calendario ────────────────────────────────
const celda = (i: number) => ({ x: 22 + (i % 7) * 40, y: 50 + Math.floor(i / 7) * 32 });
const VENTA = [3, 10, 17, 24];
const CAL: Dibujo = {
  base: (
    <>
      <rect x={10} y={8} width={300} height={204} rx={12} className="pz-hoja" />
      {T(22, 32, 12, "Octubre", "pz-t", 700)}
      {Array.from({ length: 35 }, (_, i) => {
        const { x, y } = celda(i);
        return <rect key={i} x={x} y={y} width={34} height={27} rx={4} className="pz-celda" />;
      })}
    </>
  ),
  partes: [
    // 1 · 8 publicaciones de esta semana
    <g key="p1">
      {Array.from({ length: 8 }, (_, i) => {
        const { x, y } = celda(i);
        return (
          <g key={i}>
            <rect x={x} y={y} width={34} height={27} rx={4} className="pz-post" />
            {barra(x + 5, y + 19, 22, "pz-b", 3.5)}
          </g>
        );
      })}
    </g>,
    // 2 · Banco de fotos propias
    <g key="p2">
      {Array.from({ length: 8 }, (_, i) => {
        const { x, y } = celda(i);
        return <rect key={i} x={x + 5} y={y + 4} width={24} height={12} rx={2} className="pz-foto" />;
      })}
    </g>,
    // 3 · Los 30 días
    <g key="p3">
      {Array.from({ length: 22 }, (_, k) => {
        const i = k + 8;
        const { x, y } = celda(i);
        return (
          <g key={i}>
            <rect x={x} y={y} width={34} height={27} rx={4} className="pz-post" />
            <rect x={x + 5} y={y + 4} width={24} height={12} rx={2} className="pz-foto" />
            {barra(x + 5, y + 19, 18, "pz-b", 3.5)}
          </g>
        );
      })}
    </g>,
    // 4 · Una publicación de venta por semana
    <g key="p4">
      {VENTA.map((i) => {
        const { x, y } = celda(i);
        return (
          <g key={i}>
            <rect x={x} y={y} width={34} height={27} rx={4} className="pz-cobre-s" />
            <circle cx={x + 17} cy={y + 13.5} r={7.5} className="pz-cobre" />
            {T(x + 13.8, y + 17, 9, "$", "pz-tinv", 800)}
          </g>
        );
      })}
    </g>,
    // 5 · Historias diarias
    <g key="p5">
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={i} cx={190 + i * 17} cy={27} r={6.5} className="pz-historia" />
      ))}
    </g>,
  ],
};

// ─── Cotiza en 5 minutos: la cotización en PDF ─────────────────────────────
const COT: Dibujo = {
  base: <rect x={62} y={6} width={196} height={208} rx={6} className="pz-hoja" />,
  partes: [
    // 1 · Plantilla de 7 bloques
    <g key="q1">
      <rect x={74} y={18} width={22} height={22} rx={4} className="pz-musgo" />
      {T(102, 28, 9, "Remodelaciones Díaz", "pz-t", 700)}
      {T(102, 38, 6.5, "55 1234 5678 · RFC en regla", "pz-tm", 500)}
      <line x1={74} y1={48} x2={246} y2={48} className="pz-regla" />
      {T(74, 60, 7, "Para: Laura M.", "pz-t", 600)}
      {T(74, 72, 7.5, "Baño completo, listo para usarse", "pz-t", 700)}
      <rect x={74} y={80} width={172} height={50} rx={3} className="pz-tabla" />
      <line x1={74} y1={96} x2={246} y2={96} className="pz-regla" />
      <line x1={74} y1={113} x2={246} y2={113} className="pz-regla" />
      {barra(74, 154, 110, "pz-b2", 4)}
      {barra(74, 162, 90, "pz-b2", 4)}
      {barra(74, 170, 100, "pz-b2", 4)}
      {T(74, 190, 7, "Para agendar: anticipo del 50%", "pz-t", 600)}
    </g>,
    // 2 · Precios con margen
    <g key="q2">
      {[
        ["Materiales", "$2,400", 91],
        ["Mano de obra", "$1,800", 108],
        ["Retiro de escombro", "$300", 125],
      ].map(([a, b, y]) => (
        <g key={a as string}>
          {T(80, (y as number) - 1, 7, a as string, "pz-t", 500)}
          {T(212, (y as number) - 1, 7, b as string, "pz-t", 700)}
        </g>
      ))}
      {T(74, 145, 10, "Total  $4,500", "pz-t", 800)}
    </g>,
    // 3 · Enviada al cliente
    <g key="q3">
      <path d="M8 104h46a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H22l-8 7v-7h-0a6 6 0 0 1-6-6v-26a6 6 0 0 1 6-6z" className="pz-burbuja-v" />
      <rect x={14} y={110} width={14} height={18} rx={2} className="pz-cobre" />
      {T(15.5, 122, 5.5, "PDF", "pz-tinv", 800)}
      {barra(32, 114, 22, "pz-b", 3.5)}
      <path d="M36 132l3 3 5-6M42 132l3 3 5-6" className="pz-check-m" />
    </g>,
    // 4 · Seguimiento
    <g key="q4">
      <line x1={278} y1={36} x2={278} y2={140} className="pz-regla" />
      {["24 h", "72 h", "7 d"].map((t, i) => (
        <g key={t}>
          <circle cx={278} cy={42 + i * 46} r={6} className="pz-musgo" />
          {T(288, 45 + i * 46, 8, t, "pz-t", 700)}
        </g>
      ))}
    </g>,
    // 5 · Aceptada
    <g key="q5">
      <g transform="translate(206 186) rotate(-9)">
        <rect x={-38} y={-13} width={76} height={26} rx={4} className="pz-estampa" />
        {T(-31, 4.5, 11, "ACEPTADA", "pz-testampa", 800)}
      </g>
    </g>,
  ],
};

// ─── Sistemas de ventas: el tablero ────────────────────────────────────────
const col = (i: number) => 14 + i * 75;
const tarjeta = (x: number, y: number, k: string, extra?: ReactNode) => (
  <g key={k}>
    <rect x={x} y={y} width={67} height={26} rx={4} className="pz-post" />
    {barra(x + 6, y + 7, 40, "pz-b", 4)}
    {barra(x + 6, y + 15, 26, "pz-b2", 3.5)}
    {extra}
  </g>
);
const SISTEMA: Dibujo = {
  base: (
    <>
      <rect x={6} y={8} width={308} height={204} rx={12} className="pz-hoja" />
      {["Nuevos", "Conversando", "Seguimiento", "Cerrados"].map((t, i) => (
        <g key={t}>
          <rect x={col(i)} y={58} width={67} height={146} rx={6} className="pz-columna" />
          {T(col(i) + 6, 72, 7.5, t, "pz-tm", 700)}
        </g>
      ))}
    </>
  ),
  partes: [
    // 1 · Mapa de 7 piezas con la fuga marcada
    <g key="s1">
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={14 + i * 42} y={20} width={38} height={24} rx={5} className={i === 5 ? "pz-cobre" : "pz-musgo-s"} />
      ))}
      {T(19 + 5 * 42, 35, 6.5, "Fuga", "pz-tinv", 800)}
    </g>,
    // 2 · Captación: leads nuevos
    <g key="s2">{[0, 1, 2].map((i) => tarjeta(col(0), 80 + i * 32, `n${i}`))}</g>,
    // 3 · Conversación y seguimiento
    <g key="s3">
      {[0, 1].map((i) => tarjeta(col(1), 80 + i * 32, `c${i}`))}
      {[0, 1].map((i) =>
        tarjeta(col(2), 80 + i * 32, `f${i}`, <circle cx={col(2) + 58} cy={80 + i * 32 + 9} r={4} className="pz-cobre" />)
      )}
    </g>,
    // 4 · Cierres y números
    <g key="s4">
      {[0, 1].map((i) =>
        tarjeta(
          col(3),
          80 + i * 32,
          `x${i}`,
          <path d={`M${col(3) + 52} ${80 + i * 32 + 13}l3 3 6-7`} className="pz-check-c" />
        )
      )}
      {[18, 26, 22, 34].map((h, i) => (
        <rect key={i} x={col(3) + 8 + i * 14} y={196 - h} width={9} height={h} rx={2} className={i === 3 ? "pz-cobre" : "pz-musgo"} />
      ))}
    </g>,
  ],
};

const DIBUJOS: Record<string, Dibujo> = {
  "tu-negocio-en-google": GOOGLE,
  "menu-con-link": MENU,
  "whatsapp-que-contesta-solo": CHAT,
  "un-mes-de-publicaciones": CAL,
  "cotiza-en-5-minutos": COT,
  "ventas-con-ia": SISTEMA,
};

export function tienePieza(slug: string) {
  return slug in DIBUJOS;
}

/**
 * @param estados Un estado por parte. Si se omite, todas se dibujan hechas
 *                (la vista de «esto te llevas»).
 */
export function Pieza({
  slug,
  estados,
  etiqueta,
  className = "",
}: {
  slug: string;
  estados?: EstadoParte[];
  /** Texto para lectores de pantalla: qué es y cuánto va construido. */
  etiqueta: string;
  className?: string;
}) {
  const d = DIBUJOS[slug];
  if (!d) return null;
  return (
    <svg
      viewBox="0 0 320 220"
      className={`pieza ${className}`}
      role="img"
      aria-label={etiqueta}
    >
      {d.base}
      {d.partes.map((p, i) => {
        const e = estados?.[i] ?? "hecha";
        return (
          <g key={i} className={`pz-parte pz-${e}`} style={{ "--i": i } as React.CSSProperties}>
            {p}
          </g>
        );
      })}
    </svg>
  );
}
