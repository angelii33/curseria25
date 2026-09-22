"use client";

import { useSyncExternalStore } from "react";
import { Sello } from "@/components/ui-puro";

// Los criterios de la misión, marcables de verdad.
//
// El alumno trabaja en otra pestaña —en Google, en WhatsApp, en su menú— y
// al volver tiene que saber por dónde iba. Por eso las marcas se guardan en
// este navegador (localStorage), por lección. No se guardan en la cuenta: el
// sello oficial de la misión es el botón de abajo, que sí va al servidor.
//
// HONESTIDAD SOBRE EL GUARDADO: se dice con todas sus letras dónde vive lo
// que marcas. Un checklist que parece guardar en la cuenta y no lo hace es
// peor que no tenerlo.

const EVENTO = "listo:checklist";

function suscribir(aviso: () => void) {
  window.addEventListener("storage", aviso);
  window.addEventListener(EVENTO, aviso);
  return () => {
    window.removeEventListener("storage", aviso);
    window.removeEventListener(EVENTO, aviso);
  };
}

function leer(clave: string): string {
  try {
    return window.localStorage.getItem(clave) ?? "";
  } catch {
    return "";
  }
}

export function ChecklistMision({
  leccionId,
  criterios,
  misionHecha,
  inscrito,
  children,
}: {
  leccionId: string;
  criterios: { criterion: string; detail: string | null }[];
  /** Si el backend ya selló la misión, todo aparece marcado y bloqueado:
   *  el estado real del servidor manda sobre el estado local. */
  misionHecha: boolean;
  inscrito: boolean;
  /** El botón de sellar (Server Action) se inyecta desde la página, para
   *  no meter lógica de servidor dentro de un componente de cliente. */
  children?: React.ReactNode;
}) {
  const clave = `listo:checklist:${leccionId}`;
  // En el servidor y durante la hidratación no hay nada marcado; justo
  // después se lee lo guardado. Sin desajustes entre servidor y cliente.
  const guardado = useSyncExternalStore(suscribir, () => leer(clave), () => "");
  const marcados = new Set(guardado ? guardado.split(",").map(Number) : []);

  const alternar = (i: number) => {
    const nuevo = new Set(marcados);
    if (nuevo.has(i)) nuevo.delete(i);
    else nuevo.add(i);
    try {
      if (nuevo.size) window.localStorage.setItem(clave, [...nuevo].join(","));
      else window.localStorage.removeItem(clave);
    } catch {
      // Almacenamiento bloqueado: no hay dónde guardar, y se dice abajo.
    }
    window.dispatchEvent(new Event(EVENTO));
  };

  const hechos = misionHecha ? criterios.length : criterios.filter((_, i) => marcados.has(i)).length;
  const todos = hechos === criterios.length && criterios.length > 0;
  const pct = criterios.length ? Math.round((hechos / criterios.length) * 100) : 0;
  const faltan = criterios.length - hechos;

  return (
    <div className="chk">
      <div className="chk-avance">
        <div className="pista" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="t-dato chk-conteo" aria-live="polite">
          {todos
            ? "Todo listo"
            : `${hechos} de ${criterios.length} · ${faltan === 1 ? "te falta uno" : `te faltan ${faltan}`}`}
        </p>
      </div>

      <ul className="chk-lista">
        {criterios.map((c, i) => {
          const activo = misionHecha || marcados.has(i);
          return (
            <li key={i}>
              <label className={`chk-item ${activo ? "chk-item-hecho" : ""}`}>
                <input
                  type="checkbox"
                  checked={activo}
                  disabled={misionHecha}
                  onChange={() => alternar(i)}
                />
                <span className="chk-caja" aria-hidden="true" />
                <span>
                  <span className="chk-texto">{c.criterion}</span>
                  {c.detail ? <span className="chk-detalle">{c.detail}</span> : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {/* El cierre solo aparece cuando de verdad están todos. Es el
          momento de celebración de la lección, y por eso se gana. */}
      {todos && !misionHecha ? (
        <div className="chk-cierre" role="status">
          <Sello estado="logrado" />
          <p className="t-cuerpo">
            <strong>Ya está hecho.</strong> Eso es exactamente lo que esta lección prometía.
          </p>
        </div>
      ) : null}

      {!inscrito ? (
        <p className="t-dato chk-aviso">
          Tus marcas se guardan en este navegador para que no pierdas el hilo si
          cambias de pestaña. Para guardar tu avance en tu cuenta, necesitas el curso.
        </p>
      ) : null}

      {children}
    </div>
  );
}
