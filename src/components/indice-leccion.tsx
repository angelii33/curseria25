"use client";

import { useEffect, useState } from "react";

// El índice de la lección, con la sección actual resaltada.
//
// Resuelve un problema concreto: se abre una lección de 4.000 caracteres y
// no hay ninguna señal de cuánto falta. Eso es lo que hace que alguien
// cierre a la mitad. Con el índice, el alumno ve el tamaño real del camino
// (cinco secciones, no un muro) y por dónde va.
//
// Usa IntersectionObserver, que es nativo del navegador: cero dependencias
// nuevas y cero coste de descarga.

export function IndiceLeccion({
  secciones,
}: {
  secciones: { titulo: string; id: string }[];
}) {
  const [activa, setActiva] = useState<string | null>(
    secciones.length ? secciones[0].id : null
  );

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
      { rootMargin: "-88px 0px -55% 0px", threshold: 0 }
    );

    const nodos = secciones
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => n !== null);
    nodos.forEach((n) => observador.observe(n));

    return () => observador.disconnect();
  }, [secciones]);

  if (secciones.length < 2) return null;

  const i = secciones.findIndex((s) => s.id === activa);
  const pct = i >= 0 ? Math.round(((i + 1) / secciones.length) * 100) : 0;

  return (
    <nav className="indice" aria-label="Secciones de la lección">
      <div className="indice-cab">
        <p className="t-folio">En esta lección</p>
        <p className="t-dato indice-pos">
          {i >= 0 ? i + 1 : 1} de {secciones.length}
        </p>
      </div>

      <div className="pista indice-pista" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>

      <ol className="indice-lista">
        {secciones.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={`indice-enlace ${s.id === activa ? "indice-activa" : ""}`}
              aria-current={s.id === activa ? "true" : undefined}
            >
              {s.titulo}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
