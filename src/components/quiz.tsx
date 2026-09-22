"use client";

import { useActionState } from "react";
import { responderQuiz, type ResultadoQuiz } from "@/app/acciones";
import type { Pregunta } from "@/lib/catalogo";
import { IconoAprobado, IconoReintentar } from "@/components/iconos-estado";

const inicial: ResultadoQuiz = {};

export function Quiz({
  quizId,
  preguntas,
  minimo,
  intento,
}: {
  quizId: string;
  preguntas: Pregunta[];
  minimo: number;
  intento: { score: number; passed: boolean } | null;
}) {
  const [estado, ejecutar, pendiente] = useActionState(responderQuiz, inicial);
  const hayResultado = estado.puntaje !== undefined;

  return (
    <section className="superficie" style={{ marginTop: "var(--e-8)", maxWidth: "66ch" }}>
      <div className="t-folio">Paso 3 · Comprueba</div>
      <h2 className="t-titulo-3" style={{ marginTop: "var(--e-2)" }}>
        Confirma que quedó claro
      </h2>
      <p className="t-cuerpo" style={{ marginTop: "var(--e-3)", color: "var(--tinta-media)" }}>
        {preguntas.length} preguntas sobre lo que acabas de leer. Sin límite de
        intentos y sin penalización: es para ti, no para calificarte.
      </p>

      {intento && !hayResultado && (
        <p className="t-dato" style={{ marginTop: "var(--e-3)", color: "var(--tinta-media)" }}>
          Último intento: {intento.score}%{intento.passed ? " · aprobado" : ""}
        </p>
      )}

      <div className="perforacion perforacion-sangrada" />

      {hayResultado ? (
        <div className={estado.aprobado ? "aviso-logrado" : "aviso-atencion"}>
          <div style={{ marginBottom: "var(--e-3)" }}>
            {estado.aprobado ? <IconoAprobado /> : <IconoReintentar />}
          </div>
          <p className="t-titulo-4" style={{ marginBottom: "var(--e-2)" }}>
            {estado.puntaje}% de aciertos
          </p>
          <p className="t-cuerpo">
            {estado.aprobado
              ? "Quedó claro. Puedes seguir con la siguiente lección."
              : `Te faltan algunas. Con ${minimo}% queda aprobado — vuelve al texto de arriba y repite el quiz las veces que quieras.`}
          </p>
        </div>
      ) : (
        <form action={ejecutar} style={{ display: "grid", gap: "var(--e-7)" }}>
          <input type="hidden" name="quiz_id" value={quizId} />
          <input type="hidden" name="total" value={preguntas.length} />

          {preguntas.map((p, i) => (
            <fieldset key={p.id} style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="t-interfaz" style={{ marginBottom: "var(--e-4)" }}>
                {i + 1}. {p.texto}
              </legend>
              <div style={{ display: "grid", gap: "var(--e-3)" }}>
                {p.opciones.map((o) => (
                  <label key={o.id} className="opcion">
                    <input type="radio" name={`p_${p.id}`} value={o.id} required />
                    <span className="t-cuerpo">{o.texto}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          {estado.error && <p className="t-cuerpo aviso-falla">{estado.error}</p>}

          <button className="btn btn-primario" disabled={pendiente}>
            {pendiente ? "Revisando…" : "Comprobar mis respuestas"}
          </button>
        </form>
      )}
    </section>
  );
}
