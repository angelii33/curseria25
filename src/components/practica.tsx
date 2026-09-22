"use client";

import { useState } from "react";
import type { PreguntaPractica } from "@/lib/practica";
import { escribir, registrarRespuesta, useAlmacen } from "@/lib/almacen";

// ─── Pregunta previa ───────────────────────────────────────────────────────
// Se hace ANTES de leer y no se revela la respuesta: preguntar primero
// prepara la atención para lo que viene, aunque se falle (efecto de la
// pregunta previa). La respuesta correcta aparece en la comprobación final.

export function PreguntaPrevia({ clave, pregunta }: { clave: string; pregunta: PreguntaPractica }) {
  const guardado = useAlmacen(`listo:previa:${clave}`);
  const elegida = guardado === "" ? null : Number(guardado);

  return (
    <section className="previa" aria-labelledby="previa-titulo">
      <div className="previa-cab">
        <span className="previa-ico" aria-hidden="true">?</span>
        <div>
          <p className="t-folio previa-folio">Antes de leer · 10 segundos</p>
          <h2 className="previa-titulo" id="previa-titulo">{pregunta.texto}</h2>
        </div>
      </div>
      {elegida === null ? (
        <>
          <div className="previa-opciones" role="group" aria-label="Elige una respuesta">
            {pregunta.opciones.map((o, i) => (
              <button key={o} type="button" className="previa-opcion" onClick={() => escribir(`listo:previa:${clave}`, String(i))}>
                {o}
              </button>
            ))}
          </div>
          <p className="t-dato previa-nota">
            No importa si no lo sabes. Contestar antes de leer ayuda a que se te quede
            lo que viene.
          </p>
        </>
      ) : (
        <p className="previa-hecha" role="status">
          <span aria-hidden="true">✎</span> Elegiste «{pregunta.opciones[elegida]}». Lo
          comprobamos al final de la lección.
        </p>
      )}
    </section>
  );
}

// ─── Comprobación ──────────────────────────────────────────────────────────
// Práctica de recuperación con retroalimentación inmediata: se responde de
// memoria, se ve si se acertó y POR QUÉ. Cada respuesta entra al repaso
// espaciado de Mi aprendizaje. Nada de esto califica ni cuenta para el
// certificado.

export function Comprobacion({
  clave,
  preguntas,
  hayPrevia,
}: {
  clave: string;
  preguntas: PreguntaPractica[];
  /** Si la primera se hizo como pregunta previa, se recuerda qué se eligió. */
  hayPrevia: boolean;
}) {
  const previa = useAlmacen(`listo:previa:${clave}`);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(() => preguntas.map(() => null));
  const [confianza, setConfianza] = useState<"alta" | "media" | "baja" | null>(null);

  const responder = (i: number, o: number) => {
    if (respuestas[i] !== null) return;
    setRespuestas((r) => r.map((x, k) => (k === i ? o : x)));
    registrarRespuesta(`${clave}#${i}`, o === preguntas[i].correcta);
  };

  const respondidas = respuestas.filter((r) => r !== null).length;
  const aciertos = respuestas.filter((r, i) => r === preguntas[i].correcta).length;
  const todas = respondidas === preguntas.length;

  return (
    <section className="comprobacion" aria-labelledby="comprobacion-titulo">
      <div className="comprobacion-cab">
        <div>
          <p className="t-folio comprobacion-folio">Comprueba lo que entendiste</p>
          <h2 className="t-titulo-2" id="comprobacion-titulo">
            {preguntas.length} preguntas, de memoria
          </h2>
          <p className="t-cuerpo comprobacion-nota">
            Sin volver a leer. Recordar es lo que fija lo aprendido; si fallas, te
            explicamos por qué y te la volvemos a preguntar en unos días.
          </p>
        </div>
        <p className="comprobacion-cuenta" aria-live="polite">
          <strong>{respondidas}</strong>/{preguntas.length}
        </p>
      </div>

      <ol className="comprobacion-lista">
        {preguntas.map((p, i) => {
          const r = respuestas[i];
          const bien = r === p.correcta;
          return (
            <li key={p.texto} className={`reactivo ${r === null ? "" : bien ? "reactivo-bien" : "reactivo-mal"}`}>
              <p className="reactivo-texto">
                <span className="reactivo-num" aria-hidden="true">{i + 1}</span>
                {p.texto}
              </p>
              {i === 0 && hayPrevia && previa !== "" ? (
                <p className="t-dato reactivo-previa">
                  Antes de leer elegiste: «{p.opciones[Number(previa)]}»
                </p>
              ) : null}
              <div className="reactivo-opciones" role="group" aria-label={`Pregunta ${i + 1}`}>
                {p.opciones.map((o, k) => {
                  const estado =
                    r === null ? "" : k === p.correcta ? "opcion-correcta" : k === r ? "opcion-elegida" : "opcion-apagada";
                  return (
                    <button
                      key={o}
                      type="button"
                      className={`reactivo-opcion ${estado}`}
                      onClick={() => responder(i, k)}
                      disabled={r !== null}
                      aria-pressed={r === k}
                    >
                      <span className="reactivo-letra" aria-hidden="true">
                        {r !== null && k === p.correcta ? "✓" : r === k ? "×" : String.fromCharCode(65 + k)}
                      </span>
                      <span>{o}</span>
                    </button>
                  );
                })}
              </div>
              {r !== null ? (
                <div className="reactivo-explica" role="status">
                  <strong>{bien ? "Correcto." : "No exactamente."}</strong> {p.explicacion}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {todas ? (
        <div className="comprobacion-cierre" role="status">
          <p className="comprobacion-resultado">
            <strong>{aciertos} de {preguntas.length}</strong> a la primera.{" "}
            {aciertos === preguntas.length
              ? "Lo tienes claro."
              : "Las que fallaste son justo las que más se te van a quedar después de leer la explicación."}
          </p>
          <p className="t-interfaz comprobacion-pregunta">¿Qué tan seguro te sientes de hacerlo tú solo?</p>
          <div className="confianza" role="group" aria-label="Qué tan seguro te sientes">
            {(
              [
                ["alta", "Lo hago hoy"],
                ["media", "Más o menos"],
                ["baja", "Todavía no"],
              ] as const
            ).map(([v, t]) => (
              <button
                key={v}
                type="button"
                className={`confianza-btn ${confianza === v ? "confianza-activa" : ""}`}
                aria-pressed={confianza === v}
                onClick={() => setConfianza(v)}
              >
                {t}
              </button>
            ))}
          </div>
          {confianza ? (
            <p className="t-cuerpo confianza-consejo">
              {confianza === "alta"
                ? "Entonces no lo dejes para después: pasa al ejercicio de abajo y hazlo ahora, con tu negocio."
                : confianza === "media"
                  ? "Normal. Haz el ejercicio con la lección abierta al lado: se aprende más haciéndolo que releyendo."
                  : "Relee «Lo esencial» de arriba y haz solo el primer paso del ejercicio. Un paso hecho vale más que la lección entera leída dos veces."}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
