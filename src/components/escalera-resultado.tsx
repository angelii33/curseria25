"use client";

import { useState } from "react";
import { BotonCopiar } from "@/components/boton-copiar";
import { useAlmacen } from "@/lib/almacen";
import { calcularPerfil, completas, type Respuestas } from "@/lib/diagnostico";
import { revisarResultado } from "@/lib/escalera";
import { CLAVE_DIAGNOSTICO } from "@/components/diagnostico-monetizacion";

// Misión gratis 2 de Monetiza IA: de «lo que haría con IA» a «lo que un
// cliente paga», subiendo con «¿y eso qué me da?». Sin API: el alumno
// escribe cada peldaño y al final se revisa su frase con reglas claras.

const PELDANOS = [
  { pregunta: "¿Qué harías con IA?", ayuda: "Tal como lo dirías hoy. Ej.: «Hacer publicaciones con IA»." },
  { pregunta: "¿Y eso qué le da al cliente?", ayuda: "Ej.: «Que publique seguido sin pensar qué subir»." },
  { pregunta: "¿Y eso qué le da?", ayuda: "Ej.: «Que sus clientes se acuerden de él entre semana»." },
];

export function EscaleraResultado() {
  const crudo = useAlmacen(CLAVE_DIAGNOSTICO);
  let sector = "";
  try {
    const r = JSON.parse(crudo || "{}") as Respuestas;
    if (completas(r)) sector = calcularPerfil(r).sector;
  } catch {}

  const [pasos, setPasos] = useState<string[]>(["", "", ""]);
  const [cliente, setCliente] = useState("");
  const [ver, setVer] = useState(false);

  const para = cliente.trim() || sector;
  const minus = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
  const sinPunto = (t: string) => t.trim().replace(/[.\s]+$/, "");
  const nucleo = sinPunto(pasos[1]);
  const frase = `${para ? `Para ${para}: ${minus(nucleo)}` : nucleo}${sinPunto(pasos[2]) ? `, para ${minus(sinPunto(pasos[2]))}` : ""}.`;
  const revision = revisarResultado(frase);
  const listos = pasos.every((p) => p.trim().length > 3);

  return (
    <section className="diag escalera" aria-labelledby="escalera-titulo">
      <p className="t-folio diag-folio">Ejercicio · 5 minutos</p>
      <h2 className="t-titulo-2" id="escalera-titulo">Convierte tu idea en algo que un cliente paga</h2>
      <p className="t-cuerpo diag-nota">
        Sube la escalera: en cada peldaño pregúntate «¿y eso qué me da?». Arriba está lo que el cliente compra.
      </p>

      <div className="escalera-campos">
        <label className="t-interfaz" htmlFor="esc-cliente">¿Para quién?</label>
        <input id="esc-cliente" className="campo" value={cliente} onChange={(e) => setCliente(e.target.value)}
          placeholder={sector || "Ej.: restaurantes pequeños de mi colonia"} maxLength={80} />
        {PELDANOS.map((p, i) => (
          <div key={p.pregunta} className="escalera-peldano" style={{ marginLeft: `${i * 12}px` }}>
            <label className="t-interfaz" htmlFor={`esc-${i}`}>
              <span className="escalera-num" aria-hidden="true">{i + 1}</span> {p.pregunta}
            </label>
            <input id={`esc-${i}`} className="campo" value={pasos[i]} maxLength={140}
              onChange={(e) => setPasos(pasos.map((x, k) => (k === i ? e.target.value : x)))}
              placeholder={p.ayuda.replace(/^Tal como lo dirías hoy\. /, "")} aria-describedby={`esc-${i}-ayuda`} />
            <p id={`esc-${i}-ayuda`} className="t-dato escalera-ayuda">{p.ayuda}</p>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-primario" disabled={!listos} onClick={() => setVer(true)}>
        Ver mi frase de resultado
      </button>

      {ver && listos ? (
        <div className="diag-mision escalera-resultado" aria-live="polite">
          <p className="t-folio">Tu frase de resultado</p>
          <p className="escalera-frase">{frase}</p>
          <p className="t-dato">Lo que haces: «{pasos[0].trim()}». Lo que compra el cliente: lo de arriba.</p>
          <ul className="escalera-revision">
            {revision.map((r) => (
              <li key={r.texto} className={r.ok ? "escalera-ok" : "escalera-ojo"}>
                <span aria-hidden="true">{r.ok ? "✓" : "!"}</span> {r.texto}
              </li>
            ))}
          </ul>
          <div className="diag-acciones">
            <BotonCopiar texto={frase} etiqueta="Copiar mi frase" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
