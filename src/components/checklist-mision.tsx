"use client";

import { useState } from "react";
import { Sello } from "@/components/ui-puro";

// Los criterios de la misión, marcables de verdad.
//
// Antes eran una lista que se leía y ya. El problema de eso es que el
// alumno trabaja en otra pestaña —en Google, en WhatsApp, en su menú— y al
// volver no sabe por dónde iba. Marcar es lo que convierte la lista en una
// herramienta de trabajo en vez de un adorno.
//
// Es Client Component porque necesita estado real. No hay alternativa de
// servidor para "marcar una casilla y que se quede marcada".
//
// HONESTIDAD SOBRE EL GUARDADO: para quien no está inscrito, esto vive solo
// en la memoria de la pestaña. Se dice con todas sus letras, porque un
// checklist que parece guardar y no guarda es peor que no tenerlo.

export function ChecklistMision({
  criterios,
  misionHecha,
  inscrito,
  children,
}: {
  criterios: { criterion: string; detail: string | null }[];
  /** Si el backend ya selló la misión, todo aparece marcado y bloqueado:
   *  el estado real del servidor manda sobre el estado local. */
  misionHecha: boolean;
  inscrito: boolean;
  /** El botón de sellar (Server Action) se inyecta desde la página, para
   *  no meter lógica de servidor dentro de un componente de cliente. */
  children?: React.ReactNode;
}) {
  const [marcados, setMarcados] = useState<boolean[]>(
    () => criterios.map(() => false)
  );

  const alternar = (i: number) =>
    setMarcados((prev) => prev.map((v, j) => (j === i ? !v : v)));

  const hechos = misionHecha ? criterios.length : marcados.filter(Boolean).length;
  const todos = hechos === criterios.length && criterios.length > 0;
  const pct = criterios.length ? Math.round((hechos / criterios.length) * 100) : 0;

  return (
    <div className="chk">
      <div className="chk-avance">
        <div className="pista" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="t-dato chk-conteo" role="status">
          {hechos} de {criterios.length} listos
        </p>
      </div>

      <ul className="chk-lista">
        {criterios.map((c, i) => {
          const activo = misionHecha || marcados[i];
          return (
            <li key={i}>
              <label className={`chk-item ${activo ? "chk-item-hecho" : ""}`}>
                <input
                  type="checkbox"
                  checked={activo}
                  disabled={misionHecha}
                  onChange={() => alternar(i)}
                />
                <span>
                  <span className="t-interfaz chk-texto">{c.criterion}</span>
                  {c.detail ? (
                    <span className="t-dato chk-detalle">{c.detail}</span>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {/* El cierre solo aparece cuando de verdad están todos. Es el único
          momento de celebración de la lección, y por eso se gana. */}
      {todos && !misionHecha ? (
        <div className="chk-cierre">
          <Sello estado="logrado" />
          <p className="t-cuerpo">
            Ya está hecho. Eso es exactamente lo que esta lección prometía.
          </p>
        </div>
      ) : null}

      {!inscrito ? (
        <p className="t-dato chk-aviso">
          Marca aquí mientras trabajas. Esto no se guarda en ningún lado: es
          para que no pierdas el hilo si cambias de pestaña.
        </p>
      ) : null}

      {children}
    </div>
  );
}
