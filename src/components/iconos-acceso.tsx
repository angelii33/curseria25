// Iconografía del acceso — mismo trazo y disciplina que iconos-proceso.tsx.
// Tres pasos, tres marcas propias: correo, código, contraseña.

const TRAZO = { stroke: "var(--musgo-600)", strokeWidth: 1.6, fill: "none" } as const;

/** Paso 1 — Escribe tu correo: un sobre, sin nada dentro todavía. */
export function IconoSobre() {
  return (
    <svg viewBox="0 0 56 56" width="40" height="40" role="img" aria-hidden="true">
      <rect x="8" y="14" width="40" height="28" rx="3" {...TRAZO} />
      <path d="M8 16l20 15l20-15" {...TRAZO} strokeLinejoin="round" />
    </svg>
  );
}

/** Paso 2 — Revisa tu correo: el mismo "ticket" que ya describe el campo
 *  de código en el propio sistema — dígitos, no una llave genérica. */
export function IconoTicket() {
  return (
    <svg viewBox="0 0 56 56" width="40" height="40" role="img" aria-hidden="true">
      <path
        d="M6 18a4 4 0 0 0 0 8v8a3 3 0 0 0 3 3h38a3 3 0 0 0 3-3v-8a4 4 0 0 1 0-8v-8a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3z"
        {...TRAZO}
        strokeLinejoin="round"
      />
      <line x1="20" y1="10" x2="20" y2="46" stroke="var(--musgo-600)" strokeWidth={1.4} strokeDasharray="3 3" />
      <circle cx="34" cy="28" r="1.8" fill="var(--musgo-600)" stroke="none" />
      <circle cx="41" cy="28" r="1.8" fill="var(--musgo-600)" stroke="none" />
    </svg>
  );
}

/** Vía de respaldo — con contraseña: un candado, no el camino principal. */
export function IconoCandado() {
  return (
    <svg viewBox="0 0 56 56" width="40" height="40" role="img" aria-hidden="true">
      <rect x="12" y="26" width="32" height="22" rx="4" {...TRAZO} />
      <path d="M18 26v-6a10 10 0 0 1 20 0v6" {...TRAZO} />
      <circle cx="28" cy="36" r="2.6" fill="var(--musgo-600)" stroke="none" />
      <line x1="28" y1="38" x2="28" y2="43" stroke="var(--musgo-600)" strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}
