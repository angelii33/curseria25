"use client";

import { useEffect, useState } from "react";
import { escribir, leer, useAlmacen } from "@/lib/almacen";

// El índice de la lección, con la sección actual resaltada.
//
// Resuelve un problema concreto: se abre una lección de 4.000 caracteres y
// no hay ninguna señal de cuánto falta. Eso es lo que hace que alguien
// cierre a la mitad. Con el índice, el alumno ve el tamaño real del camino
// (cinco secciones, no un muro) y por dónde va.
//
// En el teléfono vive pegado bajo la barra, plegado: una línea con la
// sección actual y el avance. En escritorio va en la columna lateral con la
// lista completa.

export function IndiceLeccion({
  secciones,
  clave,
  hecha = false,
}: {
  secciones: { titulo: string; id: string }[];
  /** Para recordar hasta dónde se leyó (en este navegador). */
  clave?: string;
  hecha?: boolean;
}) {
  // Hasta qué sección llegó la última vez: quien cierra a la mitad y vuelve
  // días después no tiene que buscar dónde iba.
  const llaveAvance = clave ? `curseria:seccion:${clave}` : "";
  const guardado = useAlmacen(llaveAvance || "curseria:sin-clave");
  const llegoA = llaveAvance && guardado ? Number(guardado) : 0;
  const [activa, setActiva] = useState<string | null>(
    secciones.length ? secciones[0].id : null
  );
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!secciones.length) return;

    // La sección activa es la última cuyo título ya cruzó la mitad
    // superior de la pantalla. Antes se usaba IntersectionObserver con una
    // franja: solo reaccionaba a los títulos que entraban o salían de ella,
    // y con secciones cortas (como «Si algo no sale» plegada) el siguiente
    // título ya estaba dentro y el indicador se quedaba atascado.
    const nodos = secciones
      .map((s) => ({ id: s.id, nodo: document.getElementById(s.id) }))
      .filter((x): x is { id: string; nodo: HTMLElement } => x.nodo !== null);
    let cuadro = 0;
    const medir = () => {
      cuadro = 0;
      const corte = Math.min(window.innerHeight * 0.45, 420);
      let actual = nodos[0]?.id ?? null;
      for (const { id, nodo } of nodos) {
        if (nodo.getBoundingClientRect().top <= corte) actual = id;
        else break;
      }
      if (!actual) return;
      setActiva(actual);
      const k = secciones.findIndex((s) => s.id === actual);
      if (llaveAvance && k > Number(leer(llaveAvance) || 0)) escribir(llaveAvance, String(k));
    };
    const alMover = () => {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", alMover);
    return () => {
      window.removeEventListener("scroll", alMover);
      window.removeEventListener("resize", alMover);
      if (cuadro) cancelAnimationFrame(cuadro);
    };
  }, [secciones, llaveAvance]);

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
      {!hecha && llegoA > 0 && llegoA < secciones.length && pos - 1 < llegoA ? (
        <button
          type="button"
          className="indice-retomar"
          onClick={() => document.getElementById(secciones[llegoA].id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          Te quedaste en «{secciones[llegoA].titulo}» · Seguir ahí <span aria-hidden="true">↓</span>
        </button>
      ) : null}
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
