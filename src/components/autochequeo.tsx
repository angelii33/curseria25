"use client";

import { useState } from "react";

// Una pregunta honesta al final: "¿Ya lo tienes?".
//
// No es un quiz y no se hace pasar por uno. Ninguna lección gratuita tiene
// quiz en la base, y crear uno aquí obligaría a mandar las respuestas
// correctas al navegador — justo lo que el diseño del quiz real evita.
// Esto no califica nada, no guarda nada y no llama al servidor.
//
// Lo que sí hace: si la respuesta es "todavía no", devuelve al alumno a la
// primera sección en vez de dejarlo con la sensación de haber fallado.

export function Autochequeo({
  resultado,
  primeraSeccion,
}: {
  resultado: string;
  /** Ancla de la primera sección del texto, para el "vuelve a leer". */
  primeraSeccion: string | null;
}) {
  const [respuesta, setRespuesta] = useState<"si" | "no" | null>(null);

  return (
    <section className="auto superficie" aria-labelledby="auto-titulo">
      <p className="t-folio">Antes de seguir</p>
      <h3 className="t-titulo-4" id="auto-titulo">
        ¿Ya tienes esto?
      </h3>
      <p className="t-cuerpo auto-resultado">{resultado}</p>

      {respuesta === null ? (
        <div className="auto-botones">
          <button
            type="button"
            className="btn btn-primario"
            onClick={() => setRespuesta("si")}
          >
            Sí, ya lo tengo
          </button>
          <button
            type="button"
            className="btn btn-secundario"
            onClick={() => setRespuesta("no")}
          >
            Todavía no
          </button>
        </div>
      ) : respuesta === "si" ? (
        <p className="t-cuerpo aviso-logrado" role="status">
          Entonces esta lección ya cumplió. Lo que tienes es tuyo y funciona
          aunque no sigas con nada más.
        </p>
      ) : (
        <div className="auto-no" role="status">
          <p className="t-cuerpo">
            Normal: casi nadie lo termina a la primera lectura. Lo que falta
            suele estar en la parte práctica.
          </p>
          <div className="auto-botones">
            {primeraSeccion ? (
              <a className="btn btn-secundario" href={`#${primeraSeccion}`}>
                Volver al principio
              </a>
            ) : null}
            <a className="btn btn-fantasma" href="#aplica">
              Ir al ejercicio
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
