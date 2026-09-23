"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { limpiarCodigo } from "@/lib/auth";

const LARGO = 6;

/**
 * Seis casillas para el código. Acepta pegar el código completo en cualquier
 * casilla, el autollenado del teclado (one-time-code llega entero a la
 * primera), borrar hacia atrás y moverse con flechas. El valor viaja en un
 * solo campo oculto «codigo». Para vaciarlo, el padre le cambia la «key».
 */
export function CodigoOtp({
  deshabilitado,
  invalido,
  enfocar: enfocarAlMontar,
  onCompleto,
  idEtiqueta,
  idDescripcion,
}: {
  deshabilitado?: boolean;
  invalido?: boolean;
  /** Pone el cursor en la primera casilla al aparecer. */
  enfocar?: boolean;
  onCompleto?: (codigo: string) => void;
  idEtiqueta: string;
  idDescripcion?: string;
}) {
  const [digitos, setDigitos] = useState<string[]>(() => Array(LARGO).fill(""));
  const casillas = useRef<(HTMLInputElement | null)[]>([]);
  const valor = digitos.join("");
  const enfocar = (i: number) => {
    const c = casillas.current[Math.max(0, Math.min(LARGO - 1, i))];
    c?.focus();
    c?.select();
  };

  /** Escribe «texto» a partir de la casilla i y avisa si quedó completo. */
  const escribir = (i: number, texto: string) => {
    const nuevos = limpiarCodigo(texto);
    if (!nuevos) return;
    // Un código completo siempre empieza en la primera casilla.
    const desde = nuevos.length === LARGO ? 0 : i;
    const siguiente = [...digitos];
    for (let k = 0; k < nuevos.length && desde + k < LARGO; k++) siguiente[desde + k] = nuevos[k];
    // Síncrono: el campo oculto debe llevar los 6 dígitos antes de enviar.
    flushSync(() => setDigitos(siguiente));
    const lleno = siguiente.join("");
    enfocar(Math.min(desde + nuevos.length, LARGO - 1));
    if (lleno.length === LARGO && !siguiente.includes("")) onCompleto?.(lleno);
  };

  return (
    <div className="otp" role="group" aria-labelledby={idEtiqueta} aria-describedby={idDescripcion}>
      <input type="hidden" name="codigo" value={valor} />
      {digitos.map((d, i) => (
        <input
          key={i}
          ref={(el) => { casillas.current[i] = el; }}
          className="otp-casilla"
          value={d}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={LARGO}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={i === 0 && enfocarAlMontar}
          aria-label={`Dígito ${i + 1} de ${LARGO}`}
          aria-invalid={invalido || undefined}
          disabled={deshabilitado}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const texto = e.currentTarget.value;
            if (texto === "") {
              const s = [...digitos];
              s[i] = "";
              setDigitos(s);
              return;
            }
            // Al escribir sobre una casilla llena, el dígito nuevo es el último.
            escribir(i, texto.length === 2 && d ? (texto[0] === d ? texto[1] : texto[0]) : texto);
          }}
          onPaste={(e) => {
            e.preventDefault();
            escribir(i, e.clipboardData.getData("text"));
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) {
              e.preventDefault();
              const s = [...digitos];
              s[i - 1] = "";
              setDigitos(s);
              enfocar(i - 1);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              enfocar(i - 1);
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              enfocar(i + 1);
            }
          }}
        />
      ))}
    </div>
  );
}
