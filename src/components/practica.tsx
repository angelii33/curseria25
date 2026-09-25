"use client";

import { useState } from "react";
import type { PreguntaPractica } from "@/lib/practica";
import { escribir, registrarRespuesta, useAlmacen } from "@/lib/almacen";
import { registrarPractica } from "@/app/acciones";

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

export type Reactivo = PreguntaPractica & {
  /** Clave del repaso espaciado (`curso/m/l#i`). */
  clave: string;
  /** Si viene de otra lección: se dice de cuál. */
  origen?: string;
};

type Estado = {
  /** Opciones ya descartadas (se equivocó con ellas). */
  descartadas: number[];
  /** Terminada: acertó, falló dos veces o dijo «No lo sé». */
  final: "bien" | "reintento" | "mal" | "no-se" | null;
};

export function Comprobacion({
  clave,
  preguntas,
  hayPrevia,
  repaso,
}: {
  clave: string;
  preguntas: PreguntaPractica[];
  /** Si la primera se hizo como pregunta previa, se recuerda qué se eligió. */
  hayPrevia: boolean;
  /** Una pregunta de una lección anterior: recuperar algo de días atrás
   *  (espaciado) y distinguirlo de lo de hoy (intercalado). */
  repaso?: Reactivo | null;
}) {
  const previa = useAlmacen(`listo:previa:${clave}`);
  const reactivos: Reactivo[] = [
    ...preguntas.map((p, i) => ({ ...p, clave: `${clave}#${i}` })),
    ...(repaso ? [repaso] : []),
  ];
  const [estados, setEstados] = useState<Estado[]>(() => reactivos.map(() => ({ descartadas: [], final: null })));
  const [confianza, setConfianza] = useState<"alta" | "media" | "baja" | null>(null);

  // Se avisa una sola vez, en el momento en que se cierra la última.
  const actualizar = (i: number, e: Estado) => {
    const nuevos = estados.map((x, k) => (k === i ? e : x));
    setEstados(nuevos);
    if (e.final && nuevos.every((x) => x.final)) {
      avisarPractica(clave, nuevos.filter((x) => x.final === "bien").length, nuevos.length);
    }
  };

  // Error → reintento → explicación. Para el repaso espaciado solo cuenta el
  // primer intento: acertar al segundo no es lo mismo que saberlo.
  const responder = (i: number, o: number) => {
    const e = estados[i];
    const p = reactivos[i];
    if (e.final || e.descartadas.includes(o)) return;
    const primera = e.descartadas.length === 0;
    if (primera) registrarRespuesta(p.clave, o === p.correcta);
    if (o === p.correcta) actualizar(i, { ...e, final: primera ? "bien" : "reintento" });
    else if (primera) actualizar(i, { descartadas: [o], final: null });
    else actualizar(i, { descartadas: [...e.descartadas, o], final: "mal" });
  };

  const noSe = (i: number) => {
    const e = estados[i];
    if (e.final) return;
    if (e.descartadas.length === 0) registrarRespuesta(reactivos[i].clave, false);
    actualizar(i, { ...e, final: "no-se" });
  };

  const terminadas = estados.filter((e) => e.final).length;
  const aciertos = estados.filter((e) => e.final === "bien").length;
  const todas = terminadas === reactivos.length;

  const elegirConfianza = (v: "alta" | "media" | "baja") => {
    setConfianza(v);
    avisarPractica(clave, aciertos, reactivos.length, v);
  };

  return (
    <section className="comprobacion" aria-labelledby="comprobacion-titulo">
      <div className="comprobacion-cab">
        <div>
          <p className="t-folio comprobacion-folio">Comprueba lo que entendiste</p>
          <h2 className="t-titulo-2" id="comprobacion-titulo">
            {reactivos.length} preguntas, de memoria
          </h2>
          <p className="t-cuerpo comprobacion-nota">
            Sin volver a leer. Si fallas, tienes otro intento; si no lo sabes, dilo: te
            explicamos por qué y te la volvemos a preguntar en unos días.
          </p>
        </div>
        <p className="comprobacion-cuenta" aria-live="polite">
          <strong>{terminadas}</strong>/{reactivos.length}
        </p>
      </div>

      <ol className="comprobacion-lista">
        {reactivos.map((p, i) => {
          const e = estados[i];
          const cerrada = e.final !== null;
          const clase = !cerrada ? (e.descartadas.length ? "reactivo-intento" : "") : e.final === "bien" ? "reactivo-bien" : "reactivo-mal";
          return (
            <li key={p.clave} className={`reactivo ${clase}`}>
              {p.origen ? <p className="t-folio reactivo-origen">Repaso · {p.origen}</p> : null}
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
                  const descartada = e.descartadas.includes(k);
                  const estado = !cerrada
                    ? descartada ? "opcion-elegida" : ""
                    : k === p.correcta ? "opcion-correcta" : descartada ? "opcion-elegida" : "opcion-apagada";
                  return (
                    <button
                      key={o}
                      type="button"
                      className={`reactivo-opcion ${estado}`}
                      onClick={() => responder(i, k)}
                      disabled={cerrada || descartada}
                      aria-pressed={descartada || (cerrada && k === p.correcta)}
                    >
                      <span className="reactivo-letra" aria-hidden="true">
                        {cerrada && k === p.correcta ? "✓" : descartada ? "×" : String.fromCharCode(65 + k)}
                      </span>
                      <span>{o}</span>
                    </button>
                  );
                })}
              </div>
              {!cerrada && e.descartadas.length === 0 ? (
                <button type="button" className="reactivo-nose" onClick={() => noSe(i)}>
                  No lo sé
                </button>
              ) : null}
              {!cerrada && e.descartadas.length > 0 ? (
                <p className="reactivo-pista" role="status">
                  No es esa. Descártala y piensa qué pasaría en tu negocio con cada opción que queda.{" "}
                  <button type="button" className="reactivo-nose" onClick={() => noSe(i)}>
                    Ver la respuesta
                  </button>
                </p>
              ) : null}
              {cerrada ? (
                <div className="reactivo-explica" role="status">
                  <strong>
                    {e.final === "bien"
                      ? "Correcto."
                      : e.final === "reintento"
                        ? "Correcto al segundo intento."
                        : `Era «${p.opciones[p.correcta]}».`}
                  </strong>{" "}
                  {p.explicacion}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {todas ? (
        <div className="comprobacion-cierre" role="status">
          <p className="comprobacion-resultado">
            <strong>{aciertos} de {reactivos.length}</strong> a la primera.{" "}
            {aciertos === reactivos.length
              ? "Lo tienes claro."
              : "Las que no salieron a la primera te las volvemos a preguntar en tu repaso de «Mi aprendizaje»."}
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
                onClick={() => elegirConfianza(v)}
              >
                {t}
              </button>
            ))}
          </div>
          {confianza ? (
            <p className="t-cuerpo confianza-consejo">
              {confianza === "alta" && aciertos < reactivos.length
                ? `Ojo: ${reactivos.length - aciertos === 1 ? "una no salió a la primera. Relee esa explicación" : `${reactivos.length - aciertos} no salieron a la primera. Relee esas explicaciones`} antes de hacerlo; es justo donde se equivoca la gente.`
                : confianza === "alta"
                  ? "Entonces no lo dejes para después: pasa al ejercicio de abajo y hazlo ahora, con tu negocio."
                  : confianza === "media"
                    ? "Normal. Haz el ejercicio con la lección abierta al lado: se aprende más haciéndolo que releyendo."
                    : "Vuelve a la sección que más dudas te dejó (está en el índice) y haz solo el primer paso del ejercicio. Un paso hecho vale más que la lección entera leída dos veces."}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

/** Cuántas salieron a la primera y con qué confianza: para medir qué se
 *  entiende y qué no. Sin datos personales; si falla, no pasa nada. */
function avisarPractica(clave: string, aciertos: number, total: number, confianza?: string) {
  registrarPractica({ clave, aciertos, total, confianza: confianza ?? null }).catch(() => {});
}
