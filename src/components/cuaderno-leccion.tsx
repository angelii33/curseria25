"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { guardarEnTaller, revisarBorrador } from "@/app/acciones";

// El cuaderno de la lección: donde el alumno escribe SU versión del
// ejercicio mientras lee, sin salir de la página.
//
// Por qué importa: la diferencia entre "entendí la lección" y "lo hice" es
// exactamente esto. Sin un sitio donde escribirlo, el 90% lo deja para
// después y después no llega.
//
// GUARDADO: siempre en este teléfono (localStorage). Con sesión, además, en
// la cuenta (Mi taller), un momento después de dejar de escribir. El aviso
// dice exactamente dónde quedó: un campo que aparenta guardar y no lo hace
// destruye la confianza en todo lo demás del producto.

export function CuadernoLeccion({
  leccionId,
  titulo,
  ayuda,
  conCuenta = false,
  inicial = null,
  conIA = false,
}: {
  /** Aísla el borrador por lección: escribir en una no pisa otra. */
  leccionId: string;
  titulo: string;
  ayuda: string;
  /** Con sesión: el texto también se guarda en la cuenta. */
  conCuenta?: boolean;
  /** Lo que ya estaba guardado en la cuenta para esta lección. */
  inicial?: string | null;
  /** Hay revisión con IA configurada en el servidor. */
  conIA?: boolean;
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
  // Lo de la cuenta manda; si no hay nada ahí, lo que haya en el teléfono.
  const [texto, setTexto] = useState(() => inicial || leer(clave));
  const [nube, setNube] = useState<"igual" | "pendiente" | "guardando" | "guardado" | "error">("igual");
  const ultimo = useRef(inicial ?? "");
  const [revision, setRevision] = useState<{ texto?: string; error?: string; restantes?: number } | null>(null);
  const [revisando, setRevisando] = useState(false);

  const pedirRevision = async () => {
    setRevisando(true);
    setRevision(null);
    const r = await revisarBorrador(leccionId, texto).catch(() => ({
      error: "No se pudo revisar ahora. Intenta en un momento.",
    }));
    setRevision(r);
    setRevisando(false);
  };
  // La parte «Versión sugerida:» de la revisión, para reemplazar el borrador.
  const sugerida = revision?.texto?.split(/Versi[oó]n sugerida:\s*/i)[1]?.trim() ?? null;

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

  // Guardado en la cuenta: 1.5 s después de la última tecla.
  useEffect(() => {
    if (!conCuenta || texto === ultimo.current) return;
    const t = setTimeout(async () => {
      setNube("guardando");
      const r = await guardarEnTaller(leccionId, titulo, texto).catch(() => ({ ok: false }));
      if (r.ok) ultimo.current = texto;
      setNube(r.ok ? "guardado" : "error");
    }, 1500);
    return () => clearTimeout(t);
  }, [texto, conCuenta, leccionId, titulo]);

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
        onChange={(e) => {
          setTexto(e.target.value);
          if (conCuenta) setNube("pendiente");
        }}
        placeholder="Con tus precios, tus clientes y tus palabras…"
      />

      <div className="cuaderno-pie">
        <span className="t-dato">
          {palabras === 0
            ? "Todavía sin escribir"
            : `${palabras} ${palabras === 1 ? "palabra" : "palabras"}`}
        </span>
        <span className="t-dato cuaderno-aviso" aria-live="polite">
          {!conCuenta ? (
            <>Se guarda solo en este teléfono. <Link href="/entrar">Entra</Link> para guardarlo en tu cuenta.</>
          ) : nube === "guardando" || nube === "pendiente" ? (
            "Guardando en tu cuenta…"
          ) : nube === "error" ? (
            "No se pudo guardar en tu cuenta; sigue en este teléfono."
          ) : texto.trim() ? (
            <>Guardado en tu cuenta · <Link href="/mi-taller">Mi taller</Link></>
          ) : (
            "Se guarda en tu cuenta mientras escribes."
          )}
        </span>
      </div>
      {conCuenta && conIA ? (
        <div className="cuaderno-ia">
          <button
            type="button"
            className="btn btn-secundario"
            onClick={pedirRevision}
            disabled={revisando || texto.trim().length < 15}
          >
            {revisando ? "Revisando…" : "Revisar mi borrador con IA"}
          </button>
          {texto.trim().length < 15 ? (
            <span className="t-dato">Escribe un poco más para pedir la revisión.</span>
          ) : null}
          <div aria-live="polite">
            {revision?.error ? <p className="t-dato captura-error">{revision.error}</p> : null}
            {revision?.texto ? (
              <div className="cuaderno-revision">
                <p className="t-folio">Revisión</p>
                <pre className="cuaderno-revision-texto">{revision.texto}</pre>
                <div className="acciones">
                  {sugerida ? (
                    <button type="button" className="btn btn-primario" onClick={() => { setTexto(sugerida); setNube("pendiente"); }}>
                      Usar la versión sugerida
                    </button>
                  ) : null}
                  <button type="button" className="btn btn-fantasma" onClick={() => setRevision(null)}>
                    Cerrar
                  </button>
                </div>
                <p className="t-dato cuaderno-revision-nota">
                  Revisión automática: léela antes de usarla y confirma tus datos.
                  {typeof revision.restantes === "number" ? ` Te quedan ${revision.restantes} hoy.` : ""}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
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
