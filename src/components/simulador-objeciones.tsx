"use client";

import { useState } from "react";
import { AREAS, ESCENARIOS, total, type Area } from "@/lib/simulador";

// Simulador de objeciones sin API: el alumno elige un cliente, lee su
// objeción y escoge cómo responder. Recibe al instante la calificación en
// las cinco áreas y el porqué, puede volver a intentar, y el resumen le
// dice qué área repetir. Nada sale del navegador ni se guarda.

export function SimuladorObjeciones() {
  const [actual, setActual] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  // Primera respuesta de cada cliente: la que cuenta para el resumen.
  const [primeras, setPrimeras] = useState<Record<string, number>>({});

  const esc = ESCENARIOS[actual];
  const resp = elegida === null ? null : esc.respuestas[elegida];

  const responder = (i: number) => {
    setElegida(i);
    setPrimeras((p) => (esc.id in p ? p : { ...p, [esc.id]: i }));
  };
  const cambiar = (i: number) => {
    setActual(i);
    setElegida(null);
  };

  const hechos = ESCENARIOS.filter((e) => e.id in primeras);
  const promedio = (a: Area) =>
    hechos.length ? hechos.reduce((s, e) => s + e.respuestas[primeras[e.id]].calificacion[a], 0) / hechos.length : 0;
  const masBaja = hechos.length ? [...AREAS].sort((x, y) => promedio(x.clave) - promedio(y.clave))[0] : null;

  return (
    <section className="simulador" aria-labelledby="simulador-titulo">
      <p className="t-folio simulador-folio">Simulador · sin conexión, al instante</p>
      <h2 className="t-titulo-2" id="simulador-titulo">Practica con 8 clientes</h2>
      <p className="t-cuerpo simulador-nota">
        Todos usan la oferta de ejemplo de Daniela (caso ilustrativo). Elige cómo responderías y mira tu
        calificación en las cinco áreas. Después practica con tu propia oferta usando la instrucción para tu IA.
      </p>

      <div className="simulador-perfiles" role="group" aria-label="Elige un cliente">
        {ESCENARIOS.map((e, i) => (
          <button key={e.id} type="button" onClick={() => cambiar(i)} aria-pressed={i === actual}
            className={`simulador-perfil${e.id in primeras ? " simulador-perfil-hecho" : ""}`}>
            {e.id in primeras ? "✓ " : ""}{e.perfil}
          </button>
        ))}
      </div>

      <div className="simulador-escena">
        <p className="t-dato simulador-situacion">{esc.situacion}</p>
        <p className="simulador-cliente"><span className="sr-only">El cliente dice: </span>«{esc.cliente}»</p>

        <div className="reactivo-opciones" role="group" aria-label="¿Qué respondes?">
          {esc.respuestas.map((r, i) => {
            const clase = elegida === null ? "" : i === esc.mejor ? " opcion-correcta" : i === elegida ? " opcion-elegida" : " opcion-apagada";
            return (
              <button key={r.texto} type="button" className={`reactivo-opcion${clase}`}
                disabled={elegida !== null} onClick={() => responder(i)}>
                <span className="reactivo-letra" aria-hidden="true">{"ABC"[i]}</span>
                <span>{r.texto}</span>
              </button>
            );
          })}
        </div>

        {resp ? (
          <div className="simulador-evaluacion" aria-live="polite">
            <p className="simulador-total">
              Evaluación: <strong>{total(resp.calificacion)}/10</strong>
              {elegida === esc.mejor ? " · la mejor respuesta" : ""}
            </p>
            <ul className="simulador-barras">
              {AREAS.map((a) => (
                <li key={a.clave}>
                  <span>{a.nombre}</span>
                  <span className="simulador-barra" aria-hidden="true">
                    <span style={{ width: `${resp.calificacion[a.clave] * 10}%` }} />
                  </span>
                  <strong>{resp.calificacion[a.clave]}/10</strong>
                </li>
              ))}
            </ul>
            <p className="reactivo-explica">{resp.comentario}</p>
            {elegida !== esc.mejor ? (
              <p className="reactivo-explica">
                <strong>La mejor respuesta es la {"ABC"[esc.mejor]}:</strong> {esc.respuestas[esc.mejor].comentario}
              </p>
            ) : null}
            <div className="simulador-acciones">
              <button type="button" className="btn" onClick={() => setElegida(null)}>Intentar otra respuesta</button>
              {actual < ESCENARIOS.length - 1 ? (
                <button type="button" className="btn btn-primario" onClick={() => cambiar(actual + 1)}>Siguiente cliente</button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {masBaja ? (
        <div className="simulador-resumen" aria-live="polite">
          <p className="t-folio">Tu resumen · {hechos.length} de {ESCENARIOS.length} clientes</p>
          <ul className="simulador-barras">
            {AREAS.map((a) => (
              <li key={a.clave}>
                <span>{a.nombre}</span>
                <span className="simulador-barra" aria-hidden="true">
                  <span style={{ width: `${promedio(a.clave) * 10}%` }} />
                </span>
                <strong>{promedio(a.clave).toFixed(1)}</strong>
              </li>
            ))}
          </ul>
          <p className="reactivo-explica">
            <strong>Tu área más baja: {masBaja.nombre}.</strong> {masBaja.consejo} Repite con esa área en mente,
            y luego practícala con tu oferta en el simulador de tu IA.
          </p>
        </div>
      ) : null}
    </section>
  );
}
