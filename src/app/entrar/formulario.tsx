"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { pedirCodigo, verificarCodigo, entrarConClave, type Estado } from "../acciones";
import { IconoSobre, IconoTicket, IconoCandado } from "@/components/iconos-acceso";

const inicial: Estado = {};

export function Formulario({ volver }: { volver?: string }) {
  const [modo, setModo] = useState<"codigo" | "clave">("codigo");
  const [claveEstado, entrarClave, entrandoClave] = useActionState(entrarConClave, inicial);
  const [correoEstado, pedir, pidiendo] = useActionState(pedirCodigo, inicial);
  const [codigoEstado, verificar, verificando] = useActionState(verificarCodigo, inicial);

  // El navegador puede restaurar esta pantalla desde su caché de "atrás"
  // sin pasar por el servidor — con el código ya usado todavía escrito.
  // Ahí es donde alguien reintenta un código que ya entró y ve un error
  // que no tiene nada que ver con si su cuenta funciona o no. Un
  // "pageshow" con persisted=true es exactamente esa restauración: se
  // fuerza una carga real, que si ya hay sesión, te manda adentro solo.
  useEffect(() => {
    const alRestaurar = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", alRestaurar);
    return () => window.removeEventListener("pageshow", alRestaurar);
  }, []);

  // El paso 2 hereda el correo del paso 1.
  const correo = codigoEstado.correo ?? correoEstado.correo ?? "";
  const enviado = Boolean(correoEstado.enviado);
  const campoCodigo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (enviado) campoCodigo.current?.focus();
  }, [enviado]);

  if (modo === "clave") {
    return (
      <div className="superficie acceso">
        <IconoCandado />
        <div className="t-folio" style={{ marginTop: "var(--e-3)" }}>Con contraseña</div>
        <h2 className="t-titulo-3" style={{ marginTop: "var(--e-2)" }}>
          Entra con tu contraseña
        </h2>
        <div className="perforacion perforacion-sangrada" />
        <form action={entrarClave} style={{ display: "grid", gap: "var(--e-5)" }}>
          {volver && <input type="hidden" name="volver" value={volver} />}
          <div>
            <label className="t-interfaz" htmlFor="c-correo">Tu correo</label>
            <input id="c-correo" name="correo" type="email" required className="campo"
              style={{ marginTop: "var(--e-3)" }} autoComplete="email"
              placeholder="nombre@negocio.mx" />
          </div>
          <div>
            <label className="t-interfaz" htmlFor="c-clave">Contraseña</label>
            <input id="c-clave" name="clave" type="password" required className="campo"
              style={{ marginTop: "var(--e-3)" }} autoComplete="current-password" />
          </div>
          {claveEstado.error && <p className="t-cuerpo aviso-falla">{claveEstado.error}</p>}
          <button className="btn btn-primario" disabled={entrandoClave}>
            {entrandoClave ? "Comprobando…" : "Entrar"}
          </button>
        </form>
        <div className="perforacion perforacion-sangrada" />
        <button className="btn btn-fantasma" type="button" onClick={() => setModo("codigo")}>
          Mejor mándame un código
        </button>
      </div>
    );
  }

  if (!enviado) {
    return (
      <div className="superficie acceso">
        <IconoSobre />
        <div className="t-folio" style={{ marginTop: "var(--e-3)" }}>Paso 1 de 2</div>
        <h2 className="t-titulo-3" style={{ marginTop: "var(--e-2)" }}>
          Escribe tu correo
        </h2>
        <p className="t-cuerpo" style={{ marginTop: "var(--e-3)", color: "var(--tinta-media)" }}>
          Te mandamos un código de 6 dígitos. Sin contraseñas que inventar ni
          recordar.
        </p>

        <div className="perforacion perforacion-sangrada" />

        <form action={pedir} style={{ display: "grid", gap: "var(--e-5)" }}>
          <div>
            <label className="t-interfaz" htmlFor="nombre">Tu nombre</label>
            <input
              id="nombre" name="nombre" className="campo"
              style={{ marginTop: "var(--e-3)" }}
              placeholder="Como quieres que te llamemos"
              autoComplete="name"
            />
            <p className="t-dato" style={{ marginTop: "var(--e-2)", color: "var(--tinta-tenue)" }}>
              Solo si es tu primera vez. Si ya tienes cuenta, déjalo vacío.
            </p>
          </div>

          <div>
            <label className="t-interfaz" htmlFor="correo">Tu correo</label>
            <input
              id="correo" name="correo" type="email" required inputMode="email"
              className="campo" style={{ marginTop: "var(--e-3)" }}
              placeholder="nombre@negocio.mx"
              autoComplete="email"
              defaultValue={correoEstado.correo ?? ""}
            />
          </div>

          {correoEstado.error && <p className="t-cuerpo aviso-falla">{correoEstado.error}</p>}

          <button className="btn btn-primario" disabled={pidiendo}>
            {pidiendo ? "Enviando…" : "Mandarme el código"}
          </button>
        </form>

        <div className="perforacion perforacion-sangrada" />
        <button className="btn btn-fantasma" type="button" onClick={() => setModo("clave")}>
          Ya tengo contraseña, entrar con ella
        </button>
      </div>
    );
  }

  return (
    <div className="superficie acceso">
      <IconoTicket />
      <div className="t-folio" style={{ marginTop: "var(--e-3)" }}>Paso 2 de 2</div>
      <h2 className="t-titulo-3" style={{ marginTop: "var(--e-2)" }}>
        Revisa tu correo
      </h2>
      <p className="t-cuerpo" style={{ marginTop: "var(--e-3)", color: "var(--tinta-media)" }}>
        Mandamos 6 dígitos a <strong>{correo}</strong>. Llegan en menos de un
        minuto. Si no lo ves, mira en spam.
      </p>

      <div className="perforacion perforacion-sangrada" />

      <form action={verificar} style={{ display: "grid", gap: "var(--e-5)" }}>
        <input type="hidden" name="correo" value={correo} />
        {volver && <input type="hidden" name="volver" value={volver} />}

        <div>
          <label className="t-interfaz" htmlFor="codigo">Código</label>
          <input
            ref={campoCodigo}
            id="codigo" name="codigo" required
            inputMode="numeric" pattern="[0-9]*" maxLength={6}
            autoComplete="one-time-code"
            className="campo campo-codigo"
            style={{ marginTop: "var(--e-3)" }}
            placeholder="000000"
          />
        </div>

        {codigoEstado.error && <p className="t-cuerpo aviso-falla">{codigoEstado.error}</p>}

        <button className="btn btn-primario" disabled={verificando}>
          {verificando ? "Comprobando…" : "Entrar"}
        </button>
      </form>

      <div className="perforacion perforacion-sangrada" />

      <form action={pedir}>
        <input type="hidden" name="correo" value={correo} />
        <button className="btn btn-fantasma" type="submit" disabled={pidiendo}>
          {pidiendo ? "Enviando…" : "No me llegó, mándalo otra vez"}
        </button>
      </form>
    </div>
  );
}
