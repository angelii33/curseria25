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

/** Sombra de apoyo: dos capas desplazadas, como papel sobre la mesa. */
export const sombra = (x: number, y: number, w: number, h: number, rx: number) => (
  <>
    <rect x={x + 1} y={y + 5} width={w} height={h} rx={rx} className="pz-sombra" />
    <rect x={x} y={y + 2} width={w} height={h} rx={rx} className="pz-sombra" />
  </>
);

/** Teléfono: cuerpo, pantalla, bocina y barra de estado. */
export const telefono = (x: number, w: number, oscuro = false) => (
  <>
    {sombra(x, 6, w, 208, 18)}
    <rect x={x} y={6} width={w} height={208} rx={18} className="pz-tel" />
    <rect x={x + 7} y={13} width={w - 14} height={194} rx={12} className="pz-hoja" />
    <rect x={x + w / 2 - 14} y={16} width={28} height={5} rx={2.5} className="pz-tel" />
    {T(x + 14, 22, 5.8, "9:41", oscuro ? "pz-tinv" : "pz-t", 700)}
    <rect x={x + w - 26} y={17.5} width={11} height={5} rx={1.4} className="pz-bateria" />
    <rect x={x + w - 25} y={18.5} width={7} height={3} rx={0.8} className={oscuro ? "pz-hoja-f" : "pz-musgo"} />
  </>
);

/** Miniatura de un taco servido: tortilla, relleno, cilantro. */
export const taco = (x: number, y: number, s = 1) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={10} cy={14} rx={10} ry={3} className="pz-plato" />
    <path d="M1 12a9 9 0 0 1 18 0z" className="pz-tortilla" />
    <path d="M4 11.5a6 6 0 0 1 12 0" className="pz-relleno" />
    <circle cx={7} cy={8.5} r={1} className="pz-cilantro" />
    <circle cx={11} cy={7.6} r={1} className="pz-cilantro" />
    <circle cx={13.6} cy={9} r={0.9} className="pz-cebolla" />
  </g>
);

/** Fachada con toldo a rayas: la foto que más vende en una ficha. */
const fachada = (x: number, y: number, w: number, h: number) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={4} className="pz-cielo" />
    <rect x={x + 5} y={y + 12} width={w - 10} height={h - 12} className="pz-muro" />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={x + 4 + i * ((w - 8) / 6)} y={y + 9} width={(w - 8) / 6} height={8} className={i % 2 ? "pz-hoja-f" : "pz-cobre"} />
    ))}
    <rect x={x + w / 2 - 5} y={y + h - 14} width={10} height={14} className="pz-puerta" />
    <rect x={x + 8} y={y + h - 13} width={9} height={8} className="pz-vidrio" />
    <rect x={x + w - 17} y={y + h - 13} width={9} height={8} className="pz-vidrio" />
  </g>
);

export const avatar = (cx: number, cy: number, r: number, ini: string, clase = "pz-avatar") => (
  <>
    <circle cx={cx} cy={cy} r={r} className={clase} />
    <text x={cx} y={cy + r * 0.38} fontSize={r * 1.05} fontWeight={800} textAnchor="middle" className="pz-tinv">
      {ini}
    </text>
  </>
);

// ─── Tu negocio en Google: la ficha del mapa ───────────────────────────────
const GOOGLE: Dibujo = {
  base: (
    <>
      {sombra(10, 8, 300, 204, 12)}
      <rect x={10} y={8} width={300} height={204} rx={12} className="pz-hoja" />
    </>
  ),
  partes: [
    // 1 · Ficha reclamada: mapa con manzanas, pin, nombre, verificación
    <g key="g1">
      <path d="M10 20a12 12 0 0 1 12-12h276a12 12 0 0 1 12 12v44H10z" className="pz-mapa" />
      {[
        [18, 14, 34, 18], [58, 12, 44, 14], [214, 12, 30, 20], [252, 16, 50, 12], [20, 44, 40, 16], [240, 42, 60, 18], [120, 48, 36, 14],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx={2} className="pz-manzana" />
      ))}
      <circle cx={104} cy={40} r={11} className="pz-parque" />
      <path d="M10 46 L90 30 L170 44 L250 26 L310 38" className="pz-calle" />
      <path d="M60 8 L80 64 M200 8 L186 64" className="pz-calle" />
      <circle cx={160} cy={40} r={11} className="pz-onda" />
      <path d="M160 20a9 9 0 0 1 9 9c0 7-9 16-9 16s-9-9-9-16a9 9 0 0 1 9-9z" className="pz-cobre" />
      <circle cx={160} cy={29} r={3} className="pz-hoja-f" />
      {T(24, 88, 13, "Taquería El Güero", "pz-t", 700)}
      {T(24, 103, 8.5, "Taquería · $ · ", "pz-tm")}
      {T(78, 103, 8.5, "Abierto ahora", "pz-tok", 700)}
      <circle cx={290} cy={84} r={8} className="pz-musgo" />
      <path d="M286 84l3 3 5-6" className="pz-check" />
    </g>,
    // 2 · Ficha completa: acciones con icono, horario y descripción
    <g key="g2">
      {["Llamar", "Cómo llegar", "Horario"].map((t, i) => (
        <g key={t}>
          <rect x={24 + i * 74} y={114} width={66} height={18} rx={9} className="pz-chip" />
          <circle cx={34 + i * 74} cy={123} r={3.4} className="pz-musgo" />
          {T(41 + i * 74, 126, 7.5, t, "pz-tchip", 650)}
        </g>
      ))}
      {T(24, 146, 7.5, "Lun a sáb · 9:00 a 22:00", "pz-t", 600)}
      {barra(24, 151, 196, "pz-b2", 4)}
    </g>,
    // 3 · Fotos reales: fachada, platillo, interior, equipo
    <g key="g3">
      {fachada(24, 162, 48, 36)}
      <rect x={78} y={162} width={48} height={36} rx={4} className="pz-foto" />
      {taco(92, 170, 1)}
      <rect x={132} y={162} width={48} height={36} rx={4} className="pz-foto-c" />
      <rect x={140} y={184} width={32} height={3} className="pz-mesa" />
      <path d="M148 166v8M164 166v8" className="pz-foto-l" />
      <circle cx={148} cy={176} r={3} className="pz-foco" />
      <circle cx={164} cy={176} r={3} className="pz-foco" />
      <rect x={186} y={162} width={48} height={36} rx={4} className="pz-foto" />
      {avatar(201, 180, 7, "A", "pz-avatar")}
      {avatar(219, 180, 7, "J", "pz-avatar-2")}
    </g>,
    // 4 · Reseñas
    <g key="g4">
      {[0, 1, 2, 3, 4].map((i) => estrella(252 + i * 10, 100, 4.4, "pz-estrella", i + 10))}
      {T(252, 112, 6.8, "Reseñas nuevas", "pz-tm", 700)}
    </g>,
    // 5 · Publicación de la semana
    <g key="g5">
      <rect x={244} y={140} width={54} height={60} rx={5} className="pz-post" />
      <rect x={250} y={146} width={42} height={26} rx={3} className="pz-cobre-s" />
      {taco(261, 150, 1)}
      {T(250, 183, 7.5, "Novedad", "pz-t", 700)}
      {barra(250, 189, 34, "pz-b", 3.5)}
    </g>,
  ],
};

// ─── Tu menú con link: el teléfono con el menú abierto ─────────────────────
const PRECIOS = ["$22", "$65", "$38", "$25"];
const MENU: Dibujo = {
  base: telefono(100, 120),
  partes: [
    // 1 · Menú publicado con link
    <g key="m1">
      <rect x={113} y={27} width={94} height={12} rx={6} className="pz-chip" />
      <circle cx={120} cy={33} r={2.2} className="pz-musgo" />
      {T(125, 35.6, 6.6, "elguero.site/menu", "pz-tchip", 650)}
      <circle cx={121} cy={50} r={6} className="pz-cobre" />
      {T(118.2, 52.6, 7, "G", "pz-tinv", 800)}
      {T(131, 53, 10, "El Güero", "pz-t", 800)}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          {barra(137, 80 + i * 26, 38 - (i % 2) * 8)}
          {i !== 2 && i !== 0 ? barra(137, 88 + i * 26, 26, "pz-b2", 4) : null}
          {T(188, 86 + i * 26, 8, PRECIOS[i], "pz-t", 800)}
          <line x1={113} y1={98 + i * 26} x2={207} y2={98 + i * 26} className="pz-divisor" />
        </g>
      ))}
    </g>,
    // 2 · Fotos que dan antojo
    <g key="m2">
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={113} y={76 + i * 26} width={20} height={19} rx={3} className="pz-foto" />
          {taco(113.5, 78 + i * 26, 0.95)}
        </g>
      ))}
    </g>,
    // 3 · Categorías, combo y «más vendido»
    <g key="m3">
      {["Tacos", "Tortas", "Bebidas"].map((t, i) => (
        <g key={t}>
          <rect x={113 + i * 32} y={60} width={29} height={11} rx={5.5} className={i === 0 ? "pz-musgo" : "pz-chip"} />
          {T(117 + i * 32, 68, 6.3, t, i === 0 ? "pz-tinv" : "pz-tchip", 650)}
        </g>
      ))}
      <rect x={137} y={138} width={30} height={9} rx={2.5} className="pz-cobre" />
      {T(141, 144.8, 6, "Combo", "pz-tinv", 800)}
      <rect x={137} y={87} width={36} height={8} rx={2} className="pz-cobre-s" />
      {T(139.5, 92.9, 5.2, "Más vendido", "pz-tcobre", 800)}
    </g>,
    // 4 · El link en WhatsApp
    <g key="m4">
      <path d="M12 58h74a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H30l-8 7v-7h-4a6 6 0 0 1-6-6V64a6 6 0 0 1 6-6z" className="pz-burbuja" />
      {T(20, 72, 7.5, "Aquí está el menú:", "pz-t", 600)}
      {T(20, 84, 7.5, "elguero.site/menu", "pz-link", 800)}
      <path d="M92 76 C 98 76, 100 60, 106 58" className="pz-flecha" />
    </g>,
    // 5 · Pedido confirmado
    <g key="m5">
      <rect x={116} y={186} width={88} height={15} rx={7.5} className="pz-musgo" />
      {T(137, 196, 7.2, "Hacer pedido", "pz-tinv", 800)}
      {sombra(232, 96, 78, 104, 6)}
      <rect x={232} y={96} width={78} height={104} rx={6} className="pz-ticket" />
      {T(240, 111, 8, "Pedido #18", "pz-t", 800)}
      {["2 suadero", "1 torta", "1 agua"].map((t, i) => (
        <g key={t}>
          {T(240, 125 + i * 10, 6.4, t, "pz-tm", 600)}
          <line x1={240} y1={128 + i * 10} x2={302} y2={128 + i * 10} className="pz-divisor" />
        </g>
      ))}
      {T(240, 161, 7.4, "Total $147", "pz-t", 800)}
      <g transform="translate(290 178) rotate(-7)">
        <circle r={12} className="pz-sello" />
        <path d="M-5 0l3.5 4 7-8" className="pz-check-c" />
      </g>
    </g>,
  ],
};

// ─── WhatsApp que contesta solo: la conversación ───────────────────────────
const CHAT: Dibujo = {
  base: (
    <>
      {telefono(92, 136, true)}
      <path d="M99 26a8 8 0 0 1 8-8h106a8 8 0 0 1 8 8v12H99z" className="pz-musgo" />
      <rect x={99} y={13} width={122} height={14} rx={6} className="pz-musgo" />
      {T(106, 22, 5.8, "9:41", "pz-tinv", 700)}
      {avatar(112, 31.5, 5.2, "G", "pz-avatar")}
      {T(121, 30.5, 7.2, "El Güero", "pz-tinv", 800)}
      {T(121, 37, 5, "en línea", "pz-tinv2", 600)}
      <rect x={99} y={40} width={122} height={146} className="pz-fondo-chat" />
      <rect x={105} y={46} width={76} height={16} rx={6} className="pz-burbuja" />
      {T(110, 56.5, 6.8, "Hola, ¿precio?", "pz-t", 500)}
      {T(165, 59.5, 4.6, "13:02", "pz-tm", 600)}
      <rect x={99} y={186} width={122} height={21} className="pz-hoja-f" />
      <rect x={104} y={190} width={96} height={12} rx={6} className="pz-chip" />
      <circle cx={210} cy={196} r={6.5} className="pz-musgo" />
    </>
  ),
  partes: [
    // 1 · Bienvenida automática
    <g key="c1">
      <rect x={124} y={67} width={91} height={38} rx={7} className="pz-burbuja-v" />
      {T(130, 78, 6.6, "¡Hola! Mándame tu pedido", "pz-t", 500)}
      {T(130, 88, 6.6, "y te confirmo en 5 min.", "pz-t", 500)}
      <circle cx={132} cy={97.5} r={2.6} className="pz-musgo" />
      {T(137, 99.5, 5.4, "Automático · 13:02 ✓✓", "pz-tm", 700)}
    </g>,
    // 2 · Respuestas rápidas
    <g key="c2">
      {["/precios", "/horario", "/ubica"].map((t, i) => (
        <g key={t}>
          <rect x={105 + i * 37} y={110} width={34} height={12} rx={6} className="pz-chip" />
          {T(109 + i * 37, 118.5, 6.2, t, "pz-tchip", 800)}
        </g>
      ))}
    </g>,
    // 3 · Catálogo dentro del chat
    <g key="c3">
      <rect x={124} y={128} width={91} height={52} rx={7} className="pz-burbuja-v" />
      <rect x={130} y={134} width={28} height={28} rx={3} className="pz-foto" />
      {taco(134, 141, 1)}
      {T(163, 141, 6.6, "Orden de 3", "pz-t", 700)}
      {T(163, 151, 6.6, "$66", "pz-t", 800)}
      {T(130, 174, 6.8, "Ver catálogo completo", "pz-link", 800)}
    </g>,
    // 4 · Etiquetas
    <g key="c4">
      {sombra(6, 44, 80, 92, 6)}
      <rect x={6} y={44} width={80} height={92} rx={6} className="pz-hoja" />
      {T(12, 56, 6.5, "ETIQUETAS", "pz-tm", 800)}
      {[
        ["Nuevo", "pz-e1", "4"],
        ["Cotizando", "pz-e2", "3"],
        ["Por cobrar", "pz-e3", "2"],
        ["Frecuente", "pz-e4", "9"],
      ].map(([t, c, n], i) => (
        <g key={t}>
          <circle cx={16} cy={70 + i * 18} r={4} className={c} />
          {T(24, 73 + i * 18, 7.2, t, "pz-t", 650)}
          {T(74, 73 + i * 18, 6.6, n, "pz-tm", 800)}
        </g>
      ))}
    </g>,
    // 5 · Reconquista
    <g key="c5">
      <path d="M236 118h70a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6h-54l-8 7v-7h-8a6 6 0 0 1-6-6v-28a6 6 0 0 1 6-6z" className="pz-burbuja-v" />
      {T(242, 132, 7, "¿Te guardo tu", "pz-t", 500)}
      {T(242, 142, 7, "pedido de siempre?", "pz-t", 500)}
      <rect x={250} y={170} width={56} height={14} rx={6} className="pz-burbuja" />
      {T(255, 179.5, 6.6, "¡Sí, porfa! 🙌", "pz-t", 500)}
      <g transform="translate(240 190) rotate(-7)">
        <circle r={8} className="pz-sello" />
        <path d="M-3.5 0l2.5 3 5-5.5" className="pz-check-c" />
      </g>
    </g>,
  ],
};

// ─── Un mes de publicaciones: el calendario ────────────────────────────────
const celda = (i: number) => ({ x: 22 + (i % 7) * 40, y: 58 + Math.floor(i / 7) * 30 });
const VENTA = [3, 10, 17, 24];
const miniatura = (x: number, y: number, i: number) =>
  i % 3 === 1 ? (
    <>
      <rect x={x + 4} y={y + 4} width={26} height={13} rx={2} className="pz-cobre-s" />
      {barra(x + 8, y + 8, 18, "pz-b", 2.4)}
      {barra(x + 8, y + 12, 12, "pz-b2", 2.4)}
    </>
  ) : (
    <>
      <rect x={x + 4} y={y + 4} width={26} height={13} rx={2} className="pz-foto" />
      <path d={`M${x + 6} ${y + 15}l6-5 4 3 4-3 8 5`} className="pz-foto-l" />
      <circle cx={x + 25} cy={y + 8} r={1.8} className="pz-sol" />
    </>
  );
const CAL: Dibujo = {
  base: (
    <>
      {sombra(10, 8, 300, 204, 12)}
      <rect x={10} y={8} width={300} height={204} rx={12} className="pz-hoja" />
      {T(22, 30, 12, "Octubre", "pz-t", 800)}
      {T(80, 30, 7, "30 publicaciones", "pz-tm", 600)}
      {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
        <g key={i}>{T(35 + i * 40, 50, 6.4, d, "pz-tm", 800)}</g>
      ))}
      {Array.from({ length: 35 }, (_, i) => {
        const { x, y } = celda(i);
        return (
          <g key={i}>
            <rect x={x} y={y} width={34} height={26} rx={4} className="pz-celda" />
            {i < 31 ? T(x + 26, y + 24, 4.6, String(i + 1), "pz-tdia", 700) : null}
          </g>
        );
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
            <rect x={x} y={y} width={34} height={26} rx={4} className="pz-post" />
            {barra(x + 4, y + 20, 16, "pz-b", 3)}
          </g>
        );
      })}
    </g>,
    // 2 · Banco de fotos propias
    <g key="p2">
      {Array.from({ length: 8 }, (_, i) => {
        const { x, y } = celda(i);
        return <g key={i}>{miniatura(x, y, i)}</g>;
      })}
    </g>,
    // 3 · Los 30 días
    <g key="p3">
      {Array.from({ length: 22 }, (_, k) => {
        const i = k + 8;
        const { x, y } = celda(i);
        return (
          <g key={i}>
            <rect x={x} y={y} width={34} height={26} rx={4} className="pz-post" />
            {miniatura(x, y, i)}
            {barra(x + 4, y + 20, 14, "pz-b", 3)}
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
            <rect x={x} y={y} width={34} height={26} rx={4} className="pz-cobre-s" />
            <rect x={x} y={y} width={34} height={26} rx={4} className="pz-borde-cobre" />
            <circle cx={x + 17} cy={y + 12} r={7} className="pz-cobre" />
            {T(x + 14.2, y + 15.4, 8.6, "$", "pz-tinv", 800)}
          </g>
        );
      })}
    </g>,
    // 5 · Historias diarias
    <g key="p5">
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <circle cx={194 + i * 16} cy={26} r={6.5} className="pz-historia" />
          <circle cx={194 + i * 16} cy={26} r={4} className={i % 2 ? "pz-foto" : "pz-cobre-s"} />
        </g>
      ))}
    </g>,
  ],
};

// ─── Cotiza en 5 minutos: la cotización en PDF ─────────────────────────────
const COT: Dibujo = {
  base: (
    <>
      {sombra(62, 6, 196, 208, 6)}
      <path d="M68 6h172l18 18v184a6 6 0 0 1-6 6H68a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z" className="pz-hoja" />
      <path d="M240 6v12a6 6 0 0 0 6 6h12" className="pz-doblez" />
    </>
  ),
  partes: [
    // 1 · Plantilla de 7 bloques
    <g key="q1">
      <rect x={74} y={18} width={22} height={22} rx={4} className="pz-musgo" />
      <path d="M79 33l5-9 4 6 3-3 4 6z" className="pz-hoja-f" />
      {T(102, 28, 9, "Remodelaciones Díaz", "pz-t", 800)}
      {T(102, 37.5, 6.2, "55 1234 5678 · contacto@rdiaz.mx", "pz-tm", 500)}
      {T(206, 28, 6.4, "COTIZACIÓN", "pz-tcobre", 800)}
      {T(210, 37, 6, "Folio 0042", "pz-tm", 600)}
      <line x1={74} y1={46} x2={246} y2={46} className="pz-regla" />
      {T(74, 58, 6.6, "PARA", "pz-tm", 800)}
      {T(96, 58, 7.2, "Laura M. · 22 oct", "pz-t", 600)}
      {T(74, 71, 7.6, "Baño completo, listo para usarse", "pz-t", 800)}
      <rect x={74} y={78} width={172} height={52} rx={3} className="pz-tabla" />
      <rect x={74} y={78} width={172} height={10} rx={3} className="pz-tabla-cab" />
      {T(80, 85.5, 5.6, "CONCEPTO", "pz-tm", 800)}
      {T(214, 85.5, 5.6, "IMPORTE", "pz-tm", 800)}
      <line x1={74} y1={102} x2={246} y2={102} className="pz-regla" />
      <line x1={74} y1={116} x2={246} y2={116} className="pz-regla" />
      {T(74, 158, 6.4, "Vigencia 7 días · Anticipo 50% · Garantía 6 meses", "pz-tm", 600)}
      {barra(74, 164, 100, "pz-b2", 3.5)}
      <rect x={74} y={178} width={98} height={16} rx={3} className="pz-musgo" />
      {T(80, 188.6, 6.4, "Para agendar: anticipo 50%", "pz-tinv", 700)}
    </g>,
    // 2 · Precios con margen
    <g key="q2">
      {[
        ["Materiales", "$2,400", 97],
        ["Mano de obra (3 días)", "$1,800", 111],
        ["Retiro de escombro", "$300", 125],
      ].map(([a, b, y]) => (
        <g key={a as string}>
          {T(80, y as number, 6.8, a as string, "pz-t", 500)}
          {T(214, y as number, 6.8, b as string, "pz-t", 700)}
        </g>
      ))}
      <rect x={168} y={134} width={78} height={16} rx={3} className="pz-cobre-s" />
      {T(174, 145.5, 8.6, "Total $4,500", "pz-t", 800)}
    </g>,
    // 3 · Enviada al cliente
    <g key="q3">
      <path d="M8 104h46a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H22l-8 7v-7h-0a6 6 0 0 1-6-6v-26a6 6 0 0 1 6-6z" className="pz-burbuja-v" />
      <rect x={14} y={110} width={14} height={18} rx={2} className="pz-cobre" />
      {T(15.4, 122, 5.4, "PDF", "pz-tinv", 800)}
      {T(32, 116, 5.2, "Cotización", "pz-t", 700)}
      {T(32, 123, 4.8, "0042.pdf", "pz-tm", 600)}
      <path d="M36 132l3 3 5-6M42 132l3 3 5-6" className="pz-check-m" />
    </g>,
    // 4 · Seguimiento
    <g key="q4">
      <line x1={278} y1={36} x2={278} y2={140} className="pz-regla" />
      {["24 h", "72 h", "7 d"].map((t, i) => (
        <g key={t}>
          <circle cx={278} cy={42 + i * 46} r={6} className={i === 2 ? "pz-cobre" : "pz-musgo"} />
          {T(288, 45 + i * 46, 8, t, "pz-t", 800)}
          {T(288, 54 + i * 46, 5.4, ["recordatorio", "pregunta", "cierre"][i], "pz-tm", 600)}
        </g>
      ))}
    </g>,
    // 5 · Aceptada
    <g key="q5">
      <g transform="translate(212 188) rotate(-9)">
        <rect x={-38} y={-13} width={76} height={26} rx={4} className="pz-estampa" />
        <rect x={-35} y={-10} width={70} height={20} rx={3} className="pz-estampa-in" />
        {T(-29, 4.2, 10.5, "ACEPTADA", "pz-testampa", 800)}
      </g>
    </g>,
  ],
};

// ─── Sistemas de ventas: el tablero ────────────────────────────────────────
const col = (i: number) => 14 + i * 75;
const INICIALES = ["M", "R", "C", "L", "D", "S", "P", "A", "F"];
const tarjeta = (x: number, y: number, k: string, n: number, extra?: ReactNode) => (
  <g key={k}>
    <rect x={x} y={y} width={67} height={26} rx={4} className="pz-post" />
    {avatar(x + 10, y + 13, 5.5, INICIALES[n % INICIALES.length], n % 2 ? "pz-avatar-2" : "pz-avatar")}
    {barra(x + 20, y + 8, 30, "pz-b", 3.6)}
    {barra(x + 20, y + 15, 20, "pz-b2", 3.2)}
    {extra}
  </g>
);
const PIEZAS_VENTA = ["Cliente", "Oferta", "Mensaje", "Canal", "Contacto", "Seguim.", "Números"];
const SISTEMA: Dibujo = {
  base: (
    <>
      {sombra(6, 8, 308, 204, 12)}
      <rect x={6} y={8} width={308} height={204} rx={12} className="pz-hoja" />
      {["Nuevos", "Conversando", "Seguimiento", "Cerrados"].map((t, i) => (
        <g key={t}>
          <rect x={col(i)} y={58} width={67} height={146} rx={6} className="pz-columna" />
          {T(col(i) + 6, 71, 7.2, t, "pz-tm", 800)}
        </g>
      ))}
    </>
  ),
  partes: [
    // 1 · Mapa de 7 piezas con la fuga marcada
    <g key="s1">
      {PIEZAS_VENTA.map((t, i) => (
        <g key={t}>
          <rect x={14 + i * 42} y={18} width={38} height={28} rx={5} className={i === 5 ? "pz-cobre" : "pz-musgo-s"} />
          {T(18 + i * 42, 29, 5.6, String(i + 1).padStart(2, "0"), i === 5 ? "pz-tinv" : "pz-tm", 800)}
          {T(18 + i * 42, 40, 5.8, t, i === 5 ? "pz-tinv" : "pz-t", 700)}
        </g>
      ))}
    </g>,
    // 2 · Captación: leads nuevos
    <g key="s2">{[0, 1, 2].map((i) => tarjeta(col(0), 78 + i * 32, `n${i}`, i))}</g>,
    // 3 · Conversación y seguimiento
    <g key="s3">
      {[0, 1].map((i) => tarjeta(col(1), 78 + i * 32, `c${i}`, i + 3))}
      {[0, 1].map((i) =>
        tarjeta(
          col(2),
          78 + i * 32,
          `f${i}`,
          i + 5,
          <>
            <circle cx={col(2) + 58} cy={78 + i * 32 + 9} r={4.5} className="pz-cobre" />
            {T(col(2) + 55.6, 78 + i * 32 + 11.2, 5.4, String(i + 2), "pz-tinv", 800)}
          </>
        )
      )}
    </g>,
    // 4 · Cierres y números
    <g key="s4">
      {[0, 1].map((i) =>
        tarjeta(col(3), 78 + i * 32, `x${i}`, i + 7, <path d={`M${col(3) + 53} ${78 + i * 32 + 13}l3 3 6-7`} className="pz-check-c" />)
      )}
      <line x1={col(3) + 6} y1={196} x2={col(3) + 61} y2={196} className="pz-regla" />
      {[16, 24, 21, 34].map((h, i) => (
        <rect key={i} x={col(3) + 8 + i * 14} y={196 - h} width={9} height={h} rx={2} className={i === 3 ? "pz-cobre" : "pz-musgo"} />
      ))}
      <path d={`M${col(3) + 12} 176 L${col(3) + 26} 168 L${col(3) + 40} 171 L${col(3) + 54} 158`} className="pz-tendencia" />
    </g>,
  ],
};

// ─── Monetiza IA: el sistema de monetización, 11 partes ───────────────────
// Una parte por fase. Tres filas (4, 4, 3) sobre una hoja con título y una
// línea de avance; la última fase es el plan de 30 días, en cobre.
const PARTES_MONETIZA = [
  "Perfil", "Problema", "Nicho", "Oferta",
  "Solución", "Portafolio", "Prospectos", "Venta",
  "Entrega", "Sistema", "Plan 30d",
];
const casilla = (i: number) => {
  const fila = Math.floor(i / 4);
  const x = 16 + (i % 4) * 73 + (fila === 2 ? 36 : 0);
  const y = 44 + fila * 56;
  return { x, y };
};
const MONETIZA: Dibujo = {
  base: (
    <>
      {sombra(6, 8, 308, 204, 12)}
      <rect x={6} y={8} width={308} height={204} rx={12} className="pz-hoja" />
      {T(16, 28, 10, "Mi sistema de monetización con IA", "pz-t", 800)}
      {PARTES_MONETIZA.map((_, i) => {
        const { x, y } = casilla(i);
        return <rect key={i} x={x} y={y} width={65} height={46} rx={6} className="pz-columna" />;
      })}
    </>
  ),
  partes: PARTES_MONETIZA.map((t, i) => {
    const { x, y } = casilla(i);
    const final = i === PARTES_MONETIZA.length - 1;
    return (
      <g key={t}>
        <rect x={x} y={y} width={65} height={46} rx={6} className={final ? "pz-cobre" : "pz-musgo-s"} />
        {T(x + 7, y + 14, 7, String(i).padStart(2, "0"), final ? "pz-tinv" : "pz-tm", 800)}
        {T(x + 7, y + 27, 8.2, t, final ? "pz-tinv" : "pz-t", 700)}
        {final ? (
          [0, 1, 2, 3, 4, 5].map((k) => (
            <rect key={k} x={x + 7 + k * 9} y={y + 33} width={6} height={6} rx={1.5} className="pz-tinv2" />
          ))
        ) : (
          barra(x + 7, y + 34, 30 + ((i * 7) % 18), "pz-b", 4)
        )}
      </g>
    );
  }),
};

const DIBUJOS: Record<string, Dibujo> = {
  "monetiza-ia": MONETIZA,
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
