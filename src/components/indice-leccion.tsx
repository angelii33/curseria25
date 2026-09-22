"use client";

import { useEffect, useState } from "react";

// El índice de la lección, con la sección actual resaltada.
//
// Resuelve un problema concreto: se abre una lección de 4.000 caracteres y
// no hay ninguna señal de cuánto falta. Eso es lo que hace que alguien
// cierre a la mitad. Con el índice, el alumno ve el tamaño real del camino
// (cinco secciones, no un muro) y por dónde va.
//
// En el teléfono vive pegado bajo la barra, plegado: una línea con la
// sección actual y el avance. En escritorio va en la columna lateral con la
// lista completa. Usa IntersectionObserver, nativo del navegador.

export function IndiceLeccion({
  secciones,
}: {
  secciones: { titulo: string; id: string }[];
}) {
  const [activa, setActiva] = useState<string | null>(
    secciones.length ? secciones[0].id : null
  );
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!secciones.length) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        // Se toma la sección visible que esté más arriba, no la última que
        // disparó: al hacer scroll rápido llegan varias entradas juntas y
        // sin ordenar, y sin esto el resaltado va dando saltos.
        const visibles = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visibles[0]) setActiva(visibles[0].target.id);
      },
      // El margen superior descuenta la barra fija; sin él, la sección se
      // marca activa cuando todavía está tapada por la barra.
      { rootMargin: "-120px 0px -55% 0px", threshold: 0 }
    );

    const nodos = secciones
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => n !== null);
    nodos.forEach((n) => observador.observe(n));

    return () => observador.disconnect();
  }, [secciones]);

  if (secciones.length < 2) return null;

  const i = secciones.findIndex((s) => s.id === activa);
  const pos = i >= 0 ? i + 1 : 1;
  const pct = Math.round((pos / secciones.length) * 100);

  return (
    <nav className="indice" aria-label="Secciones de la lección">
      <button
        type="button"
        className="indice-cab"
        aria-expanded={abierto}
        aria-controls="indice-lista"
        onClick={() => setAbierto((v) => !v)}
      >
        <span className="indice-cab-texto">
          <span className="t-folio">
            Sección {pos} de {secciones.length}
          </span>
          <span className="indice-actual">{secciones[pos - 1]?.titulo}</span>
        </span>
        <span className="indice-flecha" aria-hidden="true" />
      </button>
      <p className="t-folio indice-titulo">En esta lección</p>

      <div className="pista indice-pista" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>

      <ol id="indice-lista" className={`indice-lista ${abierto ? "" : "indice-plegada"}`}>
        {secciones.map((s, k) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`indice-enlace ${s.id === activa ? "indice-activa" : ""} ${k < pos - 1 ? "indice-leida" : ""}`}
              aria-current={s.id === activa ? "location" : undefined}
              onClick={() => setAbierto(false)}
            >
              {s.titulo}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
