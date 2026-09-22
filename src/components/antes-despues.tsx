import type { ReactNode } from "react";
import { Pieza, tienePieza } from "@/components/pieza";
import { editorialDe } from "@/lib/editorial";

// «Hoy» contra «al terminar»: el problema dibujado junto a la pieza hecha.
//
// Cada escena de «hoy» muestra la situación concreta que describe el
// problema del curso —el mapa donde no sales, el menú en foto borrosa, los
// chats sin contestar— con el mismo trazo y la misma paleta que la pieza.
// Así la comparación se lee de un golpe: esto es lo que tienes, esto es con
// lo que sales. Todo es SVG estático; los nombres son ejemplos de las
// lecciones, no clientes.

const T = (x: number, y: number, s: number, t: string, c = "pz-t", w = 500) => (
  <text x={x} y={y} fontSize={s} fontWeight={w} className={c}>
    {t}
  </text>
);
const B = (x: number, y: number, w: number, c = "pz-b", h = 5) => (
  <rect x={x} y={y} width={w} height={h} rx={h / 2} className={c} />
);
const pin = (x: number, y: number, c: string) => (
  <path
    d={`M${x} ${y - 12}a7 7 0 0 1 7 7c0 5.5-7 12-7 12s-7-6.5-7-12a7 7 0 0 1 7-7z`}
    className={c}
  />
);

const ANTES: Record<string, ReactNode> = {
  // El mapa con la competencia arriba y tu negocio sin aparecer.
  "tu-negocio-en-google": (
    <>
      <rect x={10} y={8} width={300} height={204} rx={12} className="pz-hoja" />
      <rect x={24} y={20} width={272} height={24} rx={12} className="pz-chip" />
      <circle cx={40} cy={32} r={5} className="ad-lupa" />
      {T(52, 36, 10, "taquería cerca de mí", "pz-t", 500)}
      <path d="M24 54h272v66H24z" className="pz-mapa" />
      <path d="M24 90 L120 72 L200 98 L296 78 M90 54 L110 120 M230 54 L214 120" className="pz-calle" />
      {pin(70, 92, "ad-pin-otro")}
      {pin(160, 80, "ad-pin-otro")}
      {pin(248, 104, "ad-pin-otro")}
      <circle cx={190} cy={106} r={9} className="ad-hueco" />
      {T(187, 110, 11, "?", "ad-tfalla", 800)}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={24} y={128 + i * 22} width={272} height={18} rx={4} className="pz-post" />
          {B(32, 134.5 + i * 22, 90 - i * 12)}
          {[0, 1, 2, 3, 4].map((k) => (
            <circle key={k} cx={250 + k * 8} cy={137 + i * 22} r={2.6} className="pz-estrella" />
          ))}
        </g>
      ))}
      {T(24, 204, 8.5, "Tu negocio no aparece en los tres de arriba", "ad-tfalla", 700)}
    </>
  ),
  // La foto borrosa del menú y las mismas preguntas una y otra vez.
  "menu-con-link": (
    <>
      <rect x={92} y={6} width={136} height={208} rx={16} className="pz-tel" />
      <rect x={99} y={14} width={122} height={192} rx={10} className="pz-hoja" />
      <rect x={140} y={24} width={74} height={58} rx={6} className="ad-borrosa" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M146 ${36 + i * 11} q10 -4 20 0 t20 0 t20 0`} className="ad-garabato" />
      ))}
      {["¿Cuánto el de suadero?", "No se lee el precio", "¿Siguen teniendo tortas?"].map((t, i) => (
        <g key={t}>
          <rect x={105} y={92 + i * 30} width={100} height={22} rx={7} className="pz-burbuja" />
          {T(111, 106 + i * 30, 7, t, "pz-t", 500)}
        </g>
      ))}
      {T(105, 196, 7, "3 sin contestar · hace 12 min", "ad-tfalla", 700)}
      <circle cx={262} cy={60} r={20} className="ad-reloj" />
      <path d="M262 48v12l8 5" className="ad-reloj-m" />
    </>
  ),
  // Los chats acumulados mientras atiendes en persona.
  "whatsapp-que-contesta-solo": (
    <>
      <rect x={92} y={6} width={136} height={208} rx={16} className="pz-tel" />
      <rect x={99} y={14} width={122} height={192} rx={10} className="pz-hoja" />
      <path d="M99 24a10 10 0 0 1 10-10h102a10 10 0 0 1 10 10v12H99z" className="pz-musgo" />
      {T(108, 30, 8, "Chats", "pz-tinv", 700)}
      {[12, 5, 8, 3, 9].map((n, i) => (
        <g key={i}>
          <circle cx={116} cy={52 + i * 30} r={9} className="pz-foto" />
          {B(130, 46 + i * 30, 50 - (i % 2) * 14, "pz-b", 4.5)}
          {B(130, 55 + i * 30, 34, "pz-b2", 4)}
          <circle cx={206} cy={52 + i * 30} r={7.5} className="ad-badge" />
          {T(n > 9 ? 201 : 203.5, 55 + i * 30, 7.5, String(n), "pz-tinv", 800)}
        </g>
      ))}
      {T(236, 60, 8, "Estás", "pz-tm", 600)}
      {T(236, 71, 8, "atendiendo", "pz-tm", 600)}
      {T(236, 82, 8, "en persona", "pz-tm", 600)}
      {T(12, 60, 8, "37 mensajes", "ad-tfalla", 800)}
      {T(12, 71, 8, "sin contestar", "ad-tfalla", 600)}
    </>
  ),
  // El perfil que dice «hace 4 meses» y la cuadrícula vacía.
  "un-mes-de-publicaciones": (
    <>
      <rect x={10} y={8} width={300} height={204} rx={12} className="pz-hoja" />
      <circle cx={42} cy={40} r={18} className="pz-foto" />
      {T(70, 36, 11, "elguero.tacos", "pz-t", 700)}
      {T(70, 50, 8, "Última publicación: hace 4 meses", "ad-tfalla", 700)}
      {Array.from({ length: 9 }, (_, i) => {
        const x = 24 + (i % 3) * 92;
        const y = 70 + Math.floor(i / 3) * 46;
        return i < 2 ? (
          <g key={i}>
            <rect x={x} y={y} width={88} height={42} rx={3} className="ad-vieja" />
            <path d={`M${x + 8} ${y + 34}l18-16 14 10 12-8 30 14`} className="pz-foto-l" />
          </g>
        ) : (
          <rect key={i} x={x} y={y} width={88} height={42} rx={3} className="ad-vacia" />
        );
      })}
    </>
  ),
  // «Son como 4 mil, más o menos» y el cliente que se queda en visto.
  "cotiza-en-5-minutos": (
    <>
      <rect x={92} y={6} width={136} height={208} rx={16} className="pz-tel" />
      <rect x={99} y={14} width={122} height={192} rx={10} className="pz-hoja" />
      <rect x={105} y={28} width={84} height={22} rx={7} className="pz-burbuja" />
      {T(111, 42, 7, "¿Cuánto por el baño?", "pz-t", 500)}
      <rect x={123} y={58} width={92} height={32} rx={7} className="pz-burbuja-v" />
      {T(129, 71, 7, "Son como 4 mil,", "pz-t", 500)}
      {T(129, 82, 7, "más o menos, depende", "pz-t", 500)}
      <rect x={105} y={98} width={82} height={22} rx={7} className="pz-burbuja" />
      {T(111, 112, 7, "¿No me lo dejas en 3?", "pz-t", 500)}
      <rect x={123} y={128} width={92} height={22} rx={7} className="pz-burbuja-v" />
      {T(129, 142, 7, "Ahí vemos cómo le hacemos", "pz-t", 500)}
      {T(105, 172, 7.5, "Visto · no volvió a escribir", "ad-tfalla", 700)}
      {T(238, 76, 22, "±", "ad-tfalla", 800)}
    </>
  ),
  // Contactos regados: notas sueltas, sin orden ni seguimiento.
  "ventas-con-ia": (
    <>
      <rect x={6} y={8} width={308} height={204} rx={12} className="pz-hoja" />
      {[
        [30, 30, -8], [120, 22, 5], [210, 36, -3], [60, 104, 6], [160, 96, -6], [236, 120, 4], [104, 160, -4],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r} ${x + 30} ${y + 18})`}>
          <rect x={x} y={y} width={62} height={38} rx={3} className={i % 3 === 0 ? "ad-nota-c" : "ad-nota"} />
          {B(x + 7, y + 10, 40, "pz-b", 4)}
          {B(x + 7, y + 19, 28, "pz-b2", 4)}
        </g>
      ))}
      <path d="M70 70 C 120 90, 140 60, 190 110 M180 60 C 150 140, 90 130, 130 170" className="ad-enredo" />
      {T(250, 192, 16, "?", "ad-tfalla", 800)}
      {T(20, 198, 8, "¿A quién le escribí? ¿Quién quedó en contestar?", "ad-tfalla", 700)}
    </>
  ),
};

export function tieneAntesDespues(slug: string) {
  return slug in ANTES && tienePieza(slug);
}

export function AntesDespues({ slug }: { slug: string }) {
  const ed = editorialDe(slug);
  if (!ed || !tieneAntesDespues(slug)) return null;
  return (
    <div className="ad">
      <figure className="ad-lado ad-antes">
        <figcaption>
          <span className="ad-et">Hoy</span>
          <span className="ad-frase">«{ed.problema}»</span>
        </figcaption>
        <svg viewBox="0 0 320 220" className="pieza" role="img" aria-label={`Hoy: ${ed.problema}`}>
          {ANTES[slug]}
        </svg>
      </figure>
      <div className="ad-flecha" aria-hidden="true">
        <span />
      </div>
      <figure className="ad-lado ad-despues">
        <figcaption>
          <span className="ad-et ad-et-logro">Al terminar</span>
          <span className="ad-frase">{ed.pieza.nombre}</span>
        </figcaption>
        <Pieza slug={slug} etiqueta={`Al terminar: ${ed.pieza.nombre}`} />
      </figure>
    </div>
  );
}
