"use client";

import { useFormStatus } from "react-dom";

/** Botón de «Salir» que se nota al pulsarlo y no se puede pulsar dos veces. */
export function BotonSalir({ className, texto = "Salir" }: { className?: string; texto?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className={className}
      type="submit"
      disabled={pending}
      aria-busy={pending}
      onClick={() => {
        // El paso 2 guardado de un acceso anterior no debe reaparecer.
        try { sessionStorage.removeItem("listo:acceso"); } catch {}
      }}
    >
      {pending ? "Saliendo…" : texto}
    </button>
  );
}
