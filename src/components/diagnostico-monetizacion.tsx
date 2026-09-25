"use client";

import { useState } from "react";
import { BotonCopiar } from "@/components/boton-copiar";
import { escribir, useAlmacen } from "@/lib/almacen";
import {
  PREGUNTAS, calcularPerfil, completas, instruccionParaIA, perfilEnTexto, type Respuestas,
} from "@/lib/diagnostico";

// Misión gratis 1 de Monetiza IA: el diagnóstico, en el navegador. Una
// pregunta por pantalla y, al final, el perfil con su ruta y el porqué.
// Las respuestas se quedan en este teléfono (localStorage) para que el
// resultado siga ahí al volver y la misión 2 pueda usar el sector.

export const CLAVE_DIAGNOSTICO = "curseria:diagnostico";

function leerRespuestas(crudo: string): Respuestas {
  try {
    const r = JSON.parse(crudo || "{}");
    return r && typeof r === "object" ? (r as Respuestas) : {};
  } catch {
    return {};
  }
}

export function DiagnosticoMonetizacion() {
  const guardado = leerRespuestas(useAlmacen(CLAVE_DIAGNOSTICO));
  const [paso, setPaso] = useState<number | null>(null);
  const [borrador, setBorrador] = useState<Respuestas>({});

  const listo = completas(guardado) && paso === null;
  const respuestas = paso === null ? guardado : borrador;

  const empezar = () => { setBorrador({}); setPaso(0); };
  const q = paso !== null ? PREGUNTAS[paso] : null;
  const elegidas = q ? respuestas[q.clave] ?? [] : [];

  const avanzar = (r: Respuestas) => {
    if (paso === null) return;
    if (paso < PREGUNTAS.length - 1) { setBorrador(r); setPaso(paso + 1); return; }
    escribir(CLAVE_DIAGNOSTICO, JSON.stringify(r));
    setPaso(null);
  };
  const elegir = (valor: string) => {
    if (!q) return;
    if (q.varias) {
      const lista = elegidas.includes(valor) ? elegidas.filter((v) => v !== valor) : [...elegidas, valor];
      setBorrador({ ...borrador, [q.clave]: lista });
    } else {
      avanzar({ ...borrador, [q.clave]: [valor] });
    }
  };

  if (q && paso !== null) {
    return (
      <section className="diag" aria-labelledby="diag-pregunta">
        <div className="diag-cab">
          <p className="t-folio diag-folio">Tu diagnóstico · {paso + 1} de {PREGUNTAS.length}</p>
          <div className="diag-barra" aria-hidden="true"><span style={{ width: `${((paso + 1) / PREGUNTAS.length) * 100}%` }} /></div>
        </div>
        <h2 className="diag-pregunta" id="diag-pregunta">{q.texto}</h2>
        <div className="diag-opciones" role="group" aria-label={q.texto}>
          {q.opciones.map((o) => (
            <button key={o.valor} type="button" onClick={() => elegir(o.valor)}
              aria-pressed={q.varias ? elegidas.includes(o.valor) : undefined}
              className={`diag-opcion${elegidas.includes(o.valor) ? " diag-opcion-si" : ""}`}>
              {o.texto}
            </button>
          ))}
        </div>
        <div className="diag-acciones">
          {paso > 0 ? <button type="button" className="btn btn-fantasma" onClick={() => setPaso(paso - 1)}>← Atrás</button> : <span />}
          {q.varias ? (
            <button type="button" className="btn btn-primario" disabled={!elegidas.length}
              onClick={() => avanzar(borrador)}>
              {paso === PREGUNTAS.length - 1 ? "Ver mi perfil" : "Siguiente"}
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  if (!listo) {
    return (
      <section className="diag diag-inicio" aria-labelledby="diag-titulo">
        <p className="t-folio diag-folio">Misión 00 · 3 minutos</p>
        <h2 className="t-titulo-2" id="diag-titulo">Descubre qué puedes vender con IA</h2>
        <p className="t-cuerpo diag-nota">
          10 preguntas de un toque. Al final ves tu ruta recomendada entre los cinco modelos del curso, por qué
          te queda a ti y tu primera misión. Sin registrarte.
        </p>
        <button type="button" className="btn btn-primario btn-grande" onClick={empezar}>Empezar mi diagnóstico</button>
      </section>
    );
  }

  const p = calcularPerfil(respuestas);
  const max = Math.max(1, ...p.ranking.map((x) => x.puntos));
  return (
    <section className="diag diag-resultado" aria-labelledby="diag-resultado-titulo">
      <p className="t-folio diag-folio">Tu perfil de monetización</p>
      <h2 className="t-titulo-2" id="diag-resultado-titulo">Tu ruta: {p.ruta.nombre}</h2>
      <p className="diag-idea">Por ejemplo: {p.ruta.idea}.</p>
      {p.ruta.razones.length ? (
        <ul className="diag-razones">
          {p.ruta.razones.map((r) => <li key={r}>{r}</li>)}
        </ul>
      ) : null}

      <p className="t-folio diag-sub">Cómo quedaron los cinco modelos para ti</p>
      <ul className="simulador-barras diag-ranking">
        {p.ranking.map((x, i) => (
          <li key={x.modelo} className={i === 0 ? "diag-top" : ""}>
            <span>{x.nombre}</span>
            <span className="simulador-barra" aria-hidden="true">
              <span style={{ width: `${Math.max(4, (Math.max(0, x.puntos) / max) * 100)}%` }} />
            </span>
            <strong>{i === 0 ? "1°" : `${i + 1}°`}</strong>
          </li>
        ))}
      </ul>

      <div className="diag-columnas">
        <div>
          <p className="t-folio diag-sub">Tus fortalezas</p>
          <ul className="diag-lista">{p.fortalezas.map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
        {p.limites.length ? (
          <div>
            <p className="t-folio diag-sub">A considerar</p>
            <ul className="diag-lista">{p.limites.map((l) => <li key={l}>{l}</li>)}</ul>
          </div>
        ) : null}
      </div>

      <div className="diag-mision">
        <p className="t-folio">Tu primera misión, esta semana</p>
        <p>{p.primeraMision}</p>
      </div>

      <p className="t-dato diag-honesto">
        Es una recomendación inicial hecha con reglas simples a partir de tus respuestas, no una predicción. En la
        Fase 2 la confirmas con tu propia matriz.
      </p>
      <div className="diag-acciones">
        <BotonCopiar texto={perfilEnTexto(p)} etiqueta="Copiar mi perfil" />
        <BotonCopiar texto={instruccionParaIA(respuestas, p)} etiqueta="Copiar instrucción para mi IA" />
        <button type="button" className="btn btn-fantasma" onClick={empezar}>Repetir</button>
      </div>
    </section>
  );
}
