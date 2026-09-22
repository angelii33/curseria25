// Iconografía propia del método — tres trazos, mismo grosor de línea,
// mismo lenguaje visual que el resto del sistema (sello, perforación,
// portadas). Nada de librerías de iconos genéricas: esto se dibujó para
// esta marca y no existe en ningún otro sitio.

const TRAZO = { stroke: "var(--musgo-600)", strokeWidth: 1.6, fill: "none" } as const;

/** 01 — Lees qué vas a construir: una página con la esquina doblada. */
function IconoLectura() {
  return (
    <svg viewBox="0 0 56 56" width="44" height="44" role="img" aria-hidden="true">
      <path d="M14 8h20l8 8v32H14z" {...TRAZO} strokeLinejoin="round" />
      <path d="M34 8v8h8" {...TRAZO} strokeLinejoin="round" />
      <line x1="20" y1="26" x2="36" y2="26" {...TRAZO} strokeLinecap="round" />
      <line x1="20" y1="33" x2="36" y2="33" {...TRAZO} strokeLinecap="round" />
      <line x1="20" y1="40" x2="30" y2="40" {...TRAZO} strokeLinecap="round" />
    </svg>
  );
}

/** 02 — Lo haces con tu negocio: una llave, herramienta de taller. */
function IconoTaller() {
  return (
    <svg viewBox="0 0 56 56" width="44" height="44" role="img" aria-hidden="true">
      <g transform="rotate(-32 28 28)">
        <path
          d="M16 20a6 6 0 1 1 6 6l16 16-4 4-16-16a6 6 0 0 1-2-10z"
          {...TRAZO}
          strokeLinejoin="round"
        />
        <circle cx="19.5" cy="19.5" r="2" fill="var(--cobre-600)" stroke="none" />
      </g>
    </svg>
  );
}

/** 03 — Queda sellado: el mismo sello del producto, no uno inventado. */
function IconoSello() {
  return (
    <svg viewBox="0 0 56 56" width="44" height="44" role="img" aria-hidden="true">
      <g transform="translate(28 28) rotate(-7)">
        <circle r="19" {...TRAZO} stroke="var(--cobre-600)" strokeWidth={2} />
        <path
          d="M-8 0l5 6 11-13"
          fill="none"
          stroke="var(--cobre-600)"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function IconoProceso({ paso }: { paso: 1 | 2 | 3 }) {
  if (paso === 1) return <IconoLectura />;
  if (paso === 2) return <IconoTaller />;
  return <IconoSello />;
}
