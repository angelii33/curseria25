"use client";

import { useState } from "react";
import { CLAVE_REPASO, leerRepaso, registrarRespuesta, useAlmacen } from "@/lib/almacen";
import type { PreguntaPractica } from "@/lib/practica";

// Repaso espaciado: «1 minuto para que no se te olvide».
//
// Las preguntas que contestaste en tus lecciones vuelven justo cuando
// empiezan a olvidarse (1, 2, 4, 8 y 16 días si aciertas; mañana si
// fallas). Es el mismo principio que usan las apps de idiomas. Vive en este
// navegador; no manda notificaciones ni cuenta para nada: es para ti.

type Item = { id: string; origen: string; pregunta: PreguntaPractica };

export function RepasoEspaciado({
  banco,
}: {
  banco: { clave: string; origen: string; preguntas: PreguntaPractica[] }[];
}) {
  const crudo = useAlmacen(CLAVE_REPASO);
  const [ahora] = useState(() => Date.now());
  const [sesion, setSesion] = useState<Item[] | null>(null);
  const [paso, setPaso] = useState(0);
  const [respuesta, setRespuesta] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);

  const estado = leerRepaso(crudo);
  const todos: Item[] = banco.flatMap((b) =>
    b.preguntas.map((p, i) => ({ id: `${b.clave}#${i}`, origen: b.origen, pregunta: p }))
  );
  const vistos = todos.filter((t) => estado[t.id]);
  const pendientes = vistos.filter((t) => estado[t.id].proxima <= ahora);
  const proxima = vistos.length ? Math.min(...vistos.map((t) => estado[t.id].proxima)) : null;

  const empezar = () => {
    setSesion(pendientes.slice(0, 5));
    setPaso(0);
    setRespuesta(null);
    setAciertos(0);
  };

  // ─── Sesión en curso ───
  if (sesion && paso < sesion.length) {
    const it = sesion[paso];
    const bien = respuesta === it.pregunta.correcta;
    return (
      <section className="repaso repaso-activo" aria-labelledby="repaso-titulo">
        <div className="repaso-cab">
          <p className="t-folio" id="repaso-titulo">Repaso · {paso + 1} de {sesion.length}</p>
          <div className="pista repaso-pista" aria-hidden="true">
            <span style={{ width: `${((paso + (respuesta !== null ? 1 : 0)) / sesion.length) * 100}%` }} />
          </div>
        </div>
        <p className="t-dato repaso-origen">{it.origen}</p>
        <p className="repaso-pregunta">{it.pregunta.texto}</p>
        <div className="reactivo-opciones" role="group" aria-label="Opciones">
          {it.pregunta.opciones.map((o, k) => {
            const cls =
              respuesta === null ? "" : k === it.pregunta.correcta ? "opcion-correcta" : k === respuesta ? "opcion-elegida" : "opcion-apagada";
            return (
              <button
                key={o}
                type="button"
                className={`reactivo-opcion ${cls}`}
                disabled={respuesta !== null}
                onClick={() => {
                  setRespuesta(k);
                  const ok = k === it.pregunta.correcta;
                  if (ok) setAciertos((a) => a + 1);
                  registrarRespuesta(it.id, ok);
                }}
              >
                <span className="reactivo-letra" aria-hidden="true">
                  {respuesta !== null && k === it.pregunta.correcta ? "✓" : respuesta === k ? "×" : String.fromCharCode(65 + k)}
                </span>
                <span>{o}</span>
              </button>
            );
          })}
        </div>
        {respuesta !== null ? (
          <>
            <div className="reactivo-explica" role="status">
              <strong>{bien ? "Correcto." : "No exactamente."}</strong> {it.pregunta.explicacion}
            </div>
            <button
              type="button"
              className="btn btn-primario"
              onClick={() => {
                setPaso((p) => p + 1);
                setRespuesta(null);
              }}
            >
              {paso + 1 < sesion.length ? "Siguiente pregunta" : "Terminar repaso"}
            </button>
          </>
        ) : null}
      </section>
    );
  }

  // ─── Sesión terminada ───
  if (sesion) {
    return (
      <section className="repaso" aria-labelledby="repaso-titulo">
        <p className="t-folio" id="repaso-titulo">Repaso hecho</p>
        <p className="repaso-pregunta">
          {aciertos} de {sesion.length} recordadas.
        </p>
        <p className="t-cuerpo repaso-nota">
          Las que recordaste vuelven en más días; las que no, mañana. Así, poco a poco,
          se quedan para siempre.
        </p>
      </section>
    );
  }

  // ─── Resumen ───
  return (
    <section className="repaso" aria-labelledby="repaso-titulo">
      <div className="repaso-fila">
        <div>
          <p className="t-folio" id="repaso-titulo">Repaso de 1 minuto</p>
          <p className="repaso-pregunta">
            {pendientes.length > 0
              ? `${pendientes.length} ${pendientes.length === 1 ? "pregunta lista" : "preguntas listas"} para repasar`
              : vistos.length > 0
                ? "Nada que repasar hoy"
                : "Aquí vuelven tus preguntas"}
          </p>
          <p className="t-cuerpo repaso-nota">
            {pendientes.length > 0
              ? "Recordar algo justo cuando empieza a olvidarse es lo que lo fija a largo plazo."
              : vistos.length > 0 && proxima
                ? `Tu siguiente repaso: ${new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(proxima)}.`
                : "Cuando contestes las preguntas de una lección, te las volvemos a hacer días después: así se quedan."}
          </p>
        </div>
        {pendientes.length > 0 ? (
          <button type="button" className="btn btn-primario" onClick={empezar}>
            Repasar ahora
          </button>
        ) : null}
      </div>
    </section>
  );
}
