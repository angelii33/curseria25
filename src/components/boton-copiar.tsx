"use client";

import { useState } from "react";

export function BotonCopiar({ texto, etiqueta = "Copiar" }: { texto: string; etiqueta?: string }) {
  const [hecho, setHecho] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-secundario"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setHecho(true);
          setTimeout(() => setHecho(false), 1800);
        } catch {
          setHecho(false);
        }
      }}
    >
      <span aria-live="polite">{hecho ? "Copiado ✓" : etiqueta}</span>
    </button>
  );
}
