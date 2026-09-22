"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// El cuaderno de la lección: donde el alumno escribe SU versión del
// ejercicio mientras lee, sin salir de la página.
//
// Por qué importa: la diferencia entre "entendí la lección" y "lo hice" es
// exactamente esto. Sin un sitio donde escribirlo, el 90% lo deja para
// después y después no llega.
//
// GUARDADO: localStorage, es decir, este teléfono y nada más. No hay
// backend para esto y no se finge que lo haya — el aviso lo dice literal.
// Un campo que aparenta guardar en la cuenta y no lo hace destruye la
// confianza en todo lo demás del producto.

export function CuadernoLeccion({
  leccionId,
  titulo,
  ayuda,
}: {
  /** Aísla el borrador por lección: escribir en una no pisa otra. */
  leccionId: string;
  titulo: string;
  ayuda: string;
}) {
  const clave = `listo:cuaderno:${leccionId}`;

  // ¿Ya estamos en el navegador? En el servidor y durante la hidratación
  // devuelve false; justo después, true. Así el campo solo se dibuja cuando
  // localStorage existe de verdad, y el HTML del servidor nunca choca con el
  // del cliente. Es el patrón que React 19 pide en vez de un setState dentro
  // de un efecto, que provoca renders en cascada.
  const montado = useSyncExternalStore(
    suscribirNada,
    () => true,
    () => false
  );

  // El inicializador perezoso lee el borrador una sola vez, sin efecto.
  const [texto, setTexto] = useState(() => leer(clave));

  // Escribir en localStorage no es un setState: esto sí va en un efecto.
  useEffect(() => {
    try {
      if (texto) window.localStorage.setItem(clave, texto);
      else window.localStorage.removeItem(clave);
    } catch {
      // Modo privado o almacenamiento bloqueado: el cuaderno sigue
      // funcionando en memoria, solo no persiste.
    }
  }, [texto, clave]);

  const palabras = texto.trim() ? texto.trim().split(/\s+/).length : 0;

  return (
    <section className="cuaderno" aria-labelledby="cuaderno-titulo">
      <p className="t-folio" id="cuaderno-titulo">
        Tu cuaderno
      </p>
      <h3 className="t-titulo-4 cuaderno-titulo">{titulo}</h3>
      <p className="t-cuerpo cuaderno-ayuda">{ayuda}</p>

      <label className="cuaderno-etiqueta t-dato" htmlFor="cuaderno-campo">
        Escríbelo aquí mientras lees
      </label>
      {montado ? (
      <>
      <textarea
        id="cuaderno-campo"
        className="campo cuaderno-campo"
        rows={6}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Con tus precios, tus clientes y tus palabras…"
      />

      <div className="cuaderno-pie">
        <span className="t-dato">
          {palabras === 0
            ? "Todavía sin escribir"
            : `${palabras} ${palabras === 1 ? "palabra" : "palabras"}`}
        </span>
        <span className="t-dato cuaderno-aviso">
          Se guarda solo en este teléfono, no en tu cuenta.
        </span>
      </div>
      </>
      ) : (
        // Mismo alto que el campo real: la página no salta al montar.
        <div className="cuaderno-campo esqueleto-linea" aria-hidden="true" />
      )}
    </section>
  );
}

/** No hay nada externo a lo que suscribirse: solo interesa saber si ya
 *  estamos en el navegador. */
function suscribirNada() {
  return () => {};
}

function leer(clave: string): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(clave) ?? "";
  } catch {
    return "";
  }
}
