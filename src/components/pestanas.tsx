"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

// Pestañas accesibles (patrón WAI-ARIA): flechas para moverse, Inicio/Fin,
// y solo la pestaña activa en el orden de tabulación. Los paneles llegan ya
// dibujados desde el servidor; aquí solo se decide cuál se ve.

export function Pestanas({
  etiqueta,
  pestanas,
}: {
  etiqueta: string;
  pestanas: { id: string; titulo: string; panel: ReactNode }[];
}) {
  const [activa, setActiva] = useState(0);
  const base = useId();

  const alTeclear = (e: KeyboardEvent<HTMLButtonElement>) => {
    const n = pestanas.length;
    const sig =
      e.key === "ArrowRight" ? (activa + 1) % n
      : e.key === "ArrowLeft" ? (activa - 1 + n) % n
      : e.key === "Home" ? 0
      : e.key === "End" ? n - 1
      : null;
    if (sig === null) return;
    e.preventDefault();
    setActiva(sig);
    document.getElementById(`${base}-t-${sig}`)?.focus();
  };

  return (
    <div className="pestanas">
      <div role="tablist" aria-label={etiqueta} className="pestanas-lista">
        {pestanas.map((p, i) => (
          <button
            key={p.id}
            id={`${base}-t-${i}`}
            role="tab"
            type="button"
            aria-selected={i === activa}
            aria-controls={`${base}-p-${i}`}
            tabIndex={i === activa ? 0 : -1}
            className="pestana"
            onClick={() => setActiva(i)}
            onKeyDown={alTeclear}
          >
            {p.titulo}
          </button>
        ))}
      </div>
      {pestanas.map((p, i) => (
        <div
          key={p.id}
          id={`${base}-p-${i}`}
          role="tabpanel"
          aria-labelledby={`${base}-t-${i}`}
          hidden={i !== activa}
          className="pestanas-panel"
        >
          {p.panel}
        </div>
      ))}
    </div>
  );
}
