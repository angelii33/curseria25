import { MARCA } from "@/lib/marca";

// El logotipo de CurserIA: la diana (el objetivo concreto de cada curso), el
// libro abierto (aprender) y la flecha que sale de él (aplicarlo). Dibujado en
// SVG a partir del logotipo original (public/marca/curseria-logo.png) para que
// se vea nítido a cualquier tamaño.
//
// El verde toma `currentColor`, así el mismo dibujo funciona sobre fondo claro
// y sobre el pie oscuro; la flecha siempre es naranja de la marca.
// Sin nada de servidor: lo usan también las páginas de error (cliente).

export function IconoMarca({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth={7}>
        <circle cx={50} cy={50} r={37} strokeDasharray="46.1 12" strokeDashoffset={52.1} />
        <path
          d="M50 38 C44 33 36 32 29 33 V65 C37 64 44 65 50 69 C56 65 63 64 71 65 V33 C64 32 56 33 50 38"
          strokeWidth={5.5}
          strokeLinejoin="round"
        />
      </g>
      <g fill="currentColor">
        <rect x={46.5} y={3} width={7} height={17} rx={1} />
        <rect x={46.5} y={80} width={7} height={17} rx={1} />
        <rect x={3} y={46.5} width={17} height={7} rx={1} />
        <rect x={80} y={46.5} width={17} height={7} rx={1} />
      </g>
      <path
        className="marca-flecha"
        d="M66 31 L60.5 55 L55.5 49.5 L46 64 L41 60.5 L50.5 46 L44 44 Z"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Símbolo + nombre: «Curser» en verde, «IA» en naranja, como el logotipo. */
export function Marca({ inversa = false }: { inversa?: boolean }) {
  const [a, b] = MARCA.partes;
  return (
    <span className={`marca ${inversa ? "marca-inversa" : ""}`}>
      <IconoMarca className="marca-icono" />
      <span className="marca-nombre">
        {a}
        <span className="marca-ia">{b}</span>
      </span>
    </span>
  );
}
