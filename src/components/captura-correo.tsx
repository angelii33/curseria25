"use client";

import Link from "next/link";
import { useActionState } from "react";
import { capturarCorreo, type EstadoCorreo } from "@/app/acciones";

// Para quien terminó una lección gratis sin cuenta: dejar el correo para
// enterarse de lo nuevo. Sin casilla premarcada y sin promesas que el
// sistema no cumple: aquí no se manda nada automático.

export function CapturaCorreo({ origen, curso }: { origen: string; curso?: string }) {
  const [estado, accion, enviando] = useActionState<EstadoCorreo, FormData>(capturarCorreo, {});

  if (estado.ok) {
    return (
      <section className="captura captura-hecha" role="status">
        <p className="t-titulo-4">Listo, quedó apuntado.</p>
        <p className="t-cuerpo">
          Te escribimos cuando haya una lección gratis o un curso nuevo. Nada más.
        </p>
      </section>
    );
  }

  return (
    <section className="captura" aria-labelledby="captura-titulo">
      <div className="captura-texto">
        <p className="t-folio">Sin cuenta, sin compromiso</p>
        <h2 className="t-titulo-3" id="captura-titulo">¿Te aviso cuando salga la siguiente lección gratis?</h2>
        <p className="t-cuerpo">
          Un correo cuando haya algo nuevo que puedas usar en tu negocio. Máximo dos al mes;
          te das de baja respondiendo «baja».
        </p>
      </div>
      <form action={accion} className="captura-form" noValidate>
        <input type="hidden" name="origen" value={origen} />
        {curso ? <input type="hidden" name="curso" value={curso} /> : null}
        <label className="captura-campo">
          <span className="t-dato">Tu correo</span>
          <input
            className="campo"
            type="email"
            name="correo"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="tu@negocio.com"
            aria-invalid={Boolean(estado.error) || undefined}
            aria-describedby={estado.error ? "captura-error" : undefined}
          />
        </label>
        <label className="captura-acepto t-dato">
          <input type="checkbox" name="acepto" required />
          <span>
            Acepto el <Link href="/aviso-de-privacidad">aviso de privacidad</Link>.
          </span>
        </label>
        {estado.error ? (
          <p className="t-dato captura-error" id="captura-error" role="alert">{estado.error}</p>
        ) : null}
        <button className="btn btn-primario" type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : "Avísame"}
        </button>
      </form>
    </section>
  );
}
