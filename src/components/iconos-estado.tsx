// Iconografía de estado: lo que se ve cuando no hay nada, cuando algo
// se perdió, o cuando el quiz ya dio su veredicto. Mismo lenguaje que
// iconos-proceso.tsx — nunca una librería genérica, siempre trazado
// para esta marca, con el mismo grosor de línea y la misma disciplina
// de color (musgo = estructura, cobre = logro, ámbar = atención).

const LINEA = { stroke: "var(--linea-firme)", strokeWidth: 1.6, fill: "none" } as const;

/** Mi aprendizaje, vacío: una ficha sin llenar, con su propia perforación. */
export function IconoFichaVacia() {
  return (
    <svg viewBox="0 0 72 56" width="56" height="44" role="img" aria-hidden="true">
      <rect x="4" y="4" width="64" height="48" rx="6" {...LINEA} />
      <circle cx="20" cy="28" r="1.6" fill="var(--linea-firme)" />
      <circle cx="28" cy="28" r="1.6" fill="var(--linea-firme)" />
      <circle cx="36" cy="28" r="1.6" fill="var(--linea-firme)" />
      <circle cx="44" cy="28" r="1.6" fill="var(--linea-firme)" />
      <circle cx="52" cy="28" r="1.6" fill="var(--linea-firme)" />
    </svg>
  );
}

/** 404: una página fuera de sitio, con la misma inclinación del sello. */
export function IconoPaginaFueraDeSitio() {
  return (
    <svg viewBox="0 0 64 64" width="52" height="52" role="img" aria-hidden="true">
      <g transform="translate(32 32) rotate(-7)">
        <path
          d="M-16 -22h20l8 8v36h-28z"
          stroke="var(--tinta-tenue)"
          strokeWidth={1.6}
          fill="none"
          strokeLinejoin="round"
        />
        <path d="M4 -22v8h8" stroke="var(--tinta-tenue)" strokeWidth={1.6} fill="none" strokeLinejoin="round" />
        <line x1="-10" y1="-2" x2="10" y2="-2" stroke="var(--linea-firme)" strokeWidth={1.4} strokeDasharray="2 3" />
        <line x1="-10" y1="5" x2="10" y2="5" stroke="var(--linea-firme)" strokeWidth={1.4} strokeDasharray="2 3" />
      </g>
    </svg>
  );
}

/** Quiz aprobado: el mismo sello del producto, no uno distinto. */
export function IconoAprobado() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" role="img" aria-hidden="true">
      <g transform="translate(20 20) rotate(-7)">
        <circle r="14" fill="none" stroke="var(--cobre-600)" strokeWidth={2} />
        <path
          d="M-6 0l4 4.5 8-9.5"
          fill="none"
          stroke="var(--cobre-600)"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** Quiz no aprobado: una flecha que vuelve a empezar, no un aspa. */
export function IconoReintentar() {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" role="img" aria-hidden="true">
      <path
        d="M11 14A11 11 0 1 1 9 24"
        fill="none"
        stroke="var(--atencion)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M11 6v8h8" fill="none" stroke="var(--atencion)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
