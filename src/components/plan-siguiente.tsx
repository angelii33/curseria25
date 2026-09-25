"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { escribir, useAlmacen } from "@/lib/almacen";

// «¿Cuándo lo haces?» — una intención de implementación.
//
// Decidir de antemano cuándo y dónde se hará algo es de las técnicas con
// más evidencia para cerrar la brecha entre querer y hacer; en cursos en
// línea de HarvardX, pedir un plan así aumentó la finalización (Yeomans y
// Reich, 2017). Aquí el alumno arma su frase «el jueves a las 8, en el
// local, abro la lección 2» y puede llevársela a su calendario.
//
// Todo pasa en el navegador: no mandamos recordatorios ni pedimos permisos.
// El archivo .ics lo abre la app de calendario del propio teléfono.

const HORAS = ["07:00", "13:00", "20:00"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function opcionesDeDia(hoy: Date) {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() + i);
    const etiqueta = i === 0 ? "Hoy" : i === 1 ? "Mañana" : DIAS[d.getDay()].replace(/^./, (c) => c.toUpperCase());
    return { i, etiqueta, fecha: d };
  });
}

const dos = (n: number) => String(n).padStart(2, "0");

function ics(inicio: Date, titulo: string, detalle: string, url: string) {
  const f = (d: Date) =>
    `${d.getFullYear()}${dos(d.getMonth() + 1)}${dos(d.getDate())}T${dos(d.getHours())}${dos(d.getMinutes())}00`;
  const fin = new Date(inicio.getTime() + 30 * 60 * 1000);
  const limpiar = (s: string) => s.replace(/[,;\\]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Listo//Plan de leccion//ES",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@listo`,
    `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(inicio)}`,
    `DTEND:${f(fin)}`,
    `SUMMARY:${limpiar(titulo)}`,
    `DESCRIPTION:${limpiar(`${detalle}\n${url}`)}`,
    `URL:${url}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT10M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${limpiar(titulo)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function PlanSiguiente({
  clave,
  accion,
  ruta,
}: {
  clave: string;
  /** Qué va a hacer, en infinitivo: «abrir la lección 2: Fotos que antojan». */
  accion: string;
  /** Ruta interna a la que lleva el recordatorio. */
  ruta: string;
}) {
  const guardado = useAlmacen(`listo:plan:${clave}`);
  // Los días dependen del reloj y la zona horaria del teléfono: se dibujan
  // solo en el navegador, nunca con la fecha del servidor.
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const dias = useMemo(() => opcionesDeDia(new Date()), []);
  const [dia, setDia] = useState(1);
  const [hora, setHora] = useState(HORAS[2]);
  const [lugar, setLugar] = useState("");
  const [editando, setEditando] = useState(false);

  const fechaTexto = (i: number) =>
    i === 0 ? "Hoy" : i === 1 ? "Mañana" : `El ${DIAS[dias[i].fecha.getDay()]}`;
  const frase = `${fechaTexto(dia)} a las ${hora}${lugar.trim() ? `, ${lugar.trim()}` : ""}, voy a ${accion}.`;

  const guardar = () => {
    escribir(`listo:plan:${clave}`, frase);
    setEditando(false);
  };

  const descargar = () => {
    const [h, m] = hora.split(":").map(Number);
    const inicio = new Date(dias[dia].fecha);
    inicio.setHours(h, m, 0, 0);
    const url = `${window.location.origin}${ruta}`;
    const archivo = ics(inicio, `Listo: ${accion}`, frase, url);
    const blob = new Blob([archivo], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "mi-plan-listo.ics";
    a.click();
    URL.revokeObjectURL(a.href);
    guardar();
  };

  if (!montado) return <section className="plan plan-cargando" aria-hidden="true" />;

  if (guardado && !editando) {
    return (
      <section className="plan plan-hecho" aria-labelledby="plan-titulo">
        <p className="t-folio plan-folio" id="plan-titulo">Tu plan</p>
        <p className="plan-frase">{guardado}</p>
        <button type="button" className="btn btn-fantasma" onClick={() => setEditando(true)}>
          Cambiar mi plan
        </button>
      </section>
    );
  }

  return (
    <section className="plan" aria-labelledby="plan-titulo">
      <p className="t-folio plan-folio">Antes de cerrar</p>
      <h2 className="t-titulo-3" id="plan-titulo">¿Cuándo lo haces?</h2>
      <p className="t-cuerpo plan-nota">
        Decidir ahora cuándo y dónde es de lo que más ayuda a terminar un curso. Toma
        diez segundos.
      </p>

      <fieldset className="plan-grupo">
        <legend className="t-dato">Día</legend>
        <div className="plan-chips">
          {dias.map((d) => (
            <button
              key={d.i}
              type="button"
              className={`plan-chip ${dia === d.i ? "plan-chip-activo" : ""}`}
              aria-pressed={dia === d.i}
              onClick={() => setDia(d.i)}
            >
              {d.etiqueta}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="plan-grupo">
        <legend className="t-dato">Hora</legend>
        <div className="plan-chips">
          {HORAS.map((h) => (
            <button
              key={h}
              type="button"
              className={`plan-chip ${hora === h ? "plan-chip-activo" : ""}`}
              aria-pressed={hora === h}
              onClick={() => setHora(h)}
            >
              {h}
            </button>
          ))}
          <label className="plan-hora">
            <span className="sr-only">Otra hora</span>
            <input type="time" value={hora} onChange={(e) => e.target.value && setHora(e.target.value)} className="campo" />
          </label>
        </div>
      </fieldset>

      <label className="plan-grupo plan-lugar">
        <span className="t-dato">Dónde (opcional)</span>
        <input
          className="campo"
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
          placeholder="en el local, antes de abrir"
          maxLength={60}
        />
      </label>

      <p className="plan-frase" aria-live="polite">{frase}</p>

      <div className="acciones">
        <button type="button" className="btn btn-secundario" onClick={descargar}>
          Agregar a mi calendario
        </button>
        <button type="button" className="btn btn-fantasma" onClick={guardar}>
          Solo guardar mi plan
        </button>
      </div>
    </section>
  );
}
