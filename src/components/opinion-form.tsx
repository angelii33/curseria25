"use client";

import Link from "next/link";
import { useActionState } from "react";
import { enviarOpinion, type EstadoOpinion } from "@/app/acciones";

// Opinión de quien ya está en el curso. Se publica solo con permiso expreso
// y después de revisarla: nunca inventamos ni editamos testimonios.

export function OpinionForm({ cursoId, nombre }: { cursoId: string; nombre: string }) {
  const [estado, accion, enviando] = useActionState<EstadoOpinion, FormData>(enviarOpinion, {});

  if (estado.ok) {
    return (
      <div className="opinion-form opinion-hecha" role="status">
        <p className="t-titulo-4">Gracias. La leemos y, si todo está bien, la publicamos.</p>
        <p className="t-cuerpo">Solo aparece con el nombre y los datos que nos diste.</p>
      </div>
    );
  }

  return (
    <details className="opinion-form">
      <summary className="btn btn-secundario">¿Te sirvió? Cuéntalo</summary>
      <form action={accion} className="opinion-campos">
        <input type="hidden" name="curso_id" value={cursoId} />
        <label className="opinion-campo">
          <span className="t-dato">Qué hiciste con el curso y qué cambió</span>
          <textarea className="campo" name="texto" rows={4} minLength={20} maxLength={1200} required
            placeholder="Qué armaste, dónde lo usas y qué notaste después." />
        </label>
        <div className="opinion-fila">
          <label className="opinion-campo">
            <span className="t-dato">Nombre con el que apareces</span>
            <input className="campo" name="nombre" defaultValue={nombre} maxLength={80} required />
          </label>
          <label className="opinion-campo">
            <span className="t-dato">Tu negocio (opcional)</span>
            <input className="campo" name="negocio" maxLength={120} placeholder="Taquería Don Beto" />
          </label>
          <label className="opinion-campo">
            <span className="t-dato">Ciudad (opcional)</span>
            <input className="campo" name="ciudad" maxLength={80} placeholder="Puebla" />
          </label>
        </div>
        <label className="captura-acepto t-dato">
          <input type="checkbox" name="consentimiento" required />
          <span>
            Autorizo que publiquen esta opinión con estos datos. Puedo pedir que la quiten cuando
            quiera. <Link href="/aviso-de-privacidad">Aviso de privacidad</Link>
          </span>
        </label>
        {estado.error ? <p className="t-dato captura-error" role="alert">{estado.error}</p> : null}
        <button className="btn btn-primario" type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar mi opinión"}
        </button>
      </form>
    </details>
  );
}
