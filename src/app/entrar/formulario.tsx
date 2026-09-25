"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { entrarConClave, entrarConGoogle, crearCuenta, type Estado } from "../acciones";
import { pedirRecuperacion } from "../recuperar/acciones";
import { IconoTicket } from "@/components/iconos-acceso";
import { BotonGoogle } from "@/components/boton-google";

// Entrar o crear cuenta: correo y contraseña, o Google si está activado.
// Sin códigos por correo: no se manda ningún correo para entrar, así que no
// hay límites de envío, spam ni esperas. La sesión vive en galletas del
// servidor (@supabase/ssr); aquí no se guarda nada de ella.

const inicial: Estado = {};

/** Una acción de servidor que falla por red no debe tumbar la página. */
const conRed =
  (accion: (p: Estado, d: FormData) => Promise<Estado>) =>
  async (p: Estado, d: FormData): Promise<Estado> => {
    try {
      return await accion(p, d);
    } catch {
      return {
        error: "No pudimos conectar. Revisa tu internet y vuelve a intentarlo.",
        tipo: "red",
        correo: String(d.get("correo") ?? "") || undefined,
        n: Date.now(),
      };
    }
  };
const claveSegura = conRed(entrarConClave);
const crearSeguro = conRed(crearCuenta);
const recuperarSeguro = conRed(pedirRecuperacion);

function useEnLinea() {
  const [enLinea, setEnLinea] = useState(true);
  useEffect(() => {
    const actualizar = () => setEnLinea(navigator.onLine);
    actualizar();
    window.addEventListener("online", actualizar);
    window.addEventListener("offline", actualizar);
    return () => {
      window.removeEventListener("online", actualizar);
      window.removeEventListener("offline", actualizar);
    };
  }, []);
  return enLinea;
}

export function Formulario({
  volver,
  google,
  fallo,
  crearCuentaPrimero,
  contacto,
  recuperar,
  olvide,
}: {
  volver?: string;
  /** Abrir en «Soy nuevo» (p. ej. al llegar desde un botón de compra). */
  crearCuentaPrimero?: boolean;
  /** «Entrar con Google» activado en Supabase. */
  google?: boolean;
  fallo?: "enlace" | "google";
  /** Para quien olvidó su contraseña: a quién escribir. */
  contacto?: { whatsapp: string | null; correo: string | null } | null;
  /** Recuperar contraseña por correo (Resend configurado). */
  recuperar?: boolean;
  /** Abrir directamente «¿Olvidaste tu contraseña?». */
  olvide?: boolean;
}) {
  const router = useRouter();
  const enLinea = useEnLinea();
  const [modo, setModo] = useState<"crear" | "entrar">(crearCuentaPrimero ? "crear" : "entrar");
  const vieneAComprar = Boolean(volver?.startsWith("/comprar"));
  const [correoEscrito, setCorreoEscrito] = useState("");

  const [conClave, entrarClave, entrandoClave] = useActionState(claveSegura, inicial);
  const [creado, crear, creando] = useActionState(crearSeguro, inicial);
  const [recuperado, pedirEnlace, pidiendo] = useActionState(recuperarSeguro, inicial);
  // «¿Olvidaste tu contraseña?» se abre sola tras una contraseña equivocada
  // (o con ?olvide=1). Si la persona la abre o la cierra, manda su decisión:
  // un error de red posterior no debe cerrarla mientras la usa.
  const [ayudaManual, setAyudaManual] = useState<boolean | null>(null);
  const ayudaAbierta = ayudaManual ?? (Boolean(olvide) || conClave.tipo === "credenciales");

  // El navegador puede restaurar esta pantalla desde su caché de «atrás»
  // tal como quedó, sin preguntar al servidor. Se pide al servidor la
  // versión actual: si ya hay sesión, la página misma te manda adentro.
  useEffect(() => {
    const alRestaurar = (e: PageTransitionEvent) => {
      if (e.persisted) router.refresh();
    };
    window.addEventListener("pageshow", alRestaurar);
    return () => window.removeEventListener("pageshow", alRestaurar);
  }, [router]);

  // Respaldo: si el servidor no redirigió solo, se navega al destino.
  const destino = conClave.destino ?? creado.destino;
  useEffect(() => {
    if (destino) router.replace(destino);
  }, [destino, router]);

  const sinConexion = !enLinea && (
    <p className="t-cuerpo aviso-falla" role="status">
      Estás sin conexión. En cuanto vuelva el internet, sigue desde aquí.
    </p>
  );

  if (destino) {
    return (
      <div className="superficie acceso" aria-live="polite">
        <IconoTicket />
        <h2 className="t-titulo-3" style={{ marginTop: "var(--e-3)" }}>Listo, ya entraste</h2>
        <p className="t-cuerpo" style={{ marginTop: "var(--e-3)" }}>Abriendo tu cuenta…</p>
      </div>
    );
  }

  const avisoFallo = fallo && (
    <p className="t-cuerpo aviso-falla" role="alert" style={{ marginTop: "var(--e-4)" }}>
      {fallo === "google"
        ? "No se completó la entrada con Google. Vuelve a intentarlo o usa tu correo."
        : "No se pudo completar la entrada. Vuelve a intentarlo."}
    </p>
  );

  const bloqueGoogle = google && (
    <>
      <form action={entrarConGoogle}>
        {volver && <input type="hidden" name="volver" value={volver} />}
        <BotonGoogle deshabilitado={!enLinea} />
      </form>
      <p className="acceso-separador"><span>o con tu correo</span></p>
    </>
  );

  const pestanas = (
    <div className="acceso-pestanas" role="tablist" aria-label="Cuenta">
      <button type="button" role="tab" aria-selected={modo === "crear"} className="acceso-pestana"
        onClick={() => setModo("crear")}>Soy nuevo</button>
      <button type="button" role="tab" aria-selected={modo === "entrar"} className="acceso-pestana"
        onClick={() => setModo("entrar")}>Ya tengo cuenta</button>
    </div>
  );

  if (modo === "crear") {
    const yaExiste = creado.tipo === "existe";
    return (
      <div className="superficie acceso">
        {pestanas}
        <h2 className="t-titulo-3" style={{ marginTop: "var(--e-5)" }}>Crea tu cuenta en 20 segundos</h2>
        <p className="t-cuerpo" style={{ marginTop: "var(--e-3)" }}>
          {vieneAComprar
            ? "Al terminar pasas directo al pago. Sin códigos ni correos que esperar."
            : "Sin códigos ni correos que esperar: entras en cuanto la creas."}
        </p>
        {avisoFallo}
        <div className="perforacion perforacion-sangrada" />
        {bloqueGoogle}
        <form action={crear} style={{ display: "grid", gap: "var(--e-5)" }}>
          {volver && <input type="hidden" name="volver" value={volver} />}
          <input type="text" name="sitio" tabIndex={-1} autoComplete="off" aria-hidden="true" className="acceso-trampa" />
          <div>
            <label className="t-interfaz" htmlFor="r-nombre">Tu nombre</label>
            <input id="r-nombre" name="nombre" className="campo" style={{ marginTop: "var(--e-3)" }}
              placeholder="Como quieres que te llamemos" autoComplete="name" maxLength={80} />
          </div>
          <div>
            <label className="t-interfaz" htmlFor="r-correo">Tu correo</label>
            <input id="r-correo" name="correo" type="email" required inputMode="email" className="campo"
              style={{ marginTop: "var(--e-3)" }} placeholder="nombre@negocio.mx" autoComplete="email"
              autoCapitalize="none" spellCheck={false} defaultValue={creado.correo ?? correoEscrito}
              aria-invalid={creado.tipo === "correo" || undefined} />
          </div>
          <CampoClave id="r-clave" nueva invalido={creado.tipo === "credenciales"} />
          {sinConexion}
          {creado.error && (
            <div className="t-cuerpo aviso-falla" role="alert">
              {creado.error}
              {yaExiste && (
                <button type="button" className="acceso-enlace" style={{ display: "block" }}
                  onClick={() => { setCorreoEscrito(creado.correo ?? ""); setModo("entrar"); }}>
                  Entrar con este correo
                </button>
              )}
            </div>
          )}
          {creado.aviso && <p className="t-cuerpo aviso-logrado" role="status">{creado.aviso}</p>}
          <button className="btn btn-primario btn-bloque btn-grande" disabled={creando || !enLinea}>
            {creando ? "Creando tu cuenta…" : vieneAComprar ? "Crear cuenta y pagar" : "Crear mi cuenta"}
          </button>
          <p className="t-dato acceso-legal">
            Al crear tu cuenta aceptas los <a href="/terminos">términos</a> y el{" "}
            <a href="/aviso-de-privacidad">aviso de privacidad</a>.
          </p>
        </form>
      </div>
    );
  }

  if (modo === "entrar") {
    return (
      <div className="superficie acceso">
        {pestanas}
        <h2 className="t-titulo-3" style={{ marginTop: "var(--e-5)" }}>Entra a tu cuenta</h2>
        {avisoFallo}
        <div className="perforacion perforacion-sangrada" />
        {bloqueGoogle}
        <form action={entrarClave} style={{ display: "grid", gap: "var(--e-5)" }}>
          {volver && <input type="hidden" name="volver" value={volver} />}
          <div>
            <label className="t-interfaz" htmlFor="c-correo">Tu correo</label>
            <input key={correoEscrito} id="c-correo" name="correo" type="email" required className="campo"
              style={{ marginTop: "var(--e-3)" }} autoComplete="email" inputMode="email"
              autoCapitalize="none" spellCheck={false}
              defaultValue={conClave.correo ?? correoEscrito} placeholder="nombre@negocio.mx" />
          </div>
          <CampoClave id="c-clave" invalido={conClave.tipo === "credenciales"} />
          {sinConexion}
          {conClave.error && (
            <p className="t-cuerpo aviso-falla" role="alert">
              {conClave.error}
              {conClave.tipo === "credenciales" && " Revisa mayúsculas y que el correo esté bien escrito."}
            </p>
          )}
          <button className="btn btn-primario btn-bloque btn-grande" disabled={entrandoClave || !enLinea}>
            {entrandoClave ? "Entrando…" : vieneAComprar ? "Entrar y pagar" : "Entrar"}
          </button>
        </form>
        <div className="perforacion perforacion-sangrada" />
        <details className="acceso-ayuda" open={ayudaAbierta}
          onToggle={(e) => setAyudaManual(e.currentTarget.open)}>
          <summary>¿Olvidaste tu contraseña?</summary>
          {recuperar ? (
            <form action={pedirEnlace} style={{ display: "grid", gap: "var(--e-4)", marginTop: "var(--e-3)" }}>
              <p className="t-cuerpo">
                Te mandamos un enlace a tu correo para que elijas una contraseña nueva.
              </p>
              {volver && <input type="hidden" name="volver" value={volver} />}
              <input type="text" name="sitio" tabIndex={-1} autoComplete="off" aria-hidden="true" className="acceso-trampa" />
              <div>
                <label className="t-interfaz" htmlFor="o-correo">Tu correo</label>
                <input key={conClave.correo ?? correoEscrito} id="o-correo" name="correo" type="email" required
                  className="campo" style={{ marginTop: "var(--e-3)" }} autoComplete="email" inputMode="email"
                  autoCapitalize="none" spellCheck={false} placeholder="nombre@negocio.mx"
                  defaultValue={recuperado.correo ?? conClave.correo ?? correoEscrito}
                  aria-invalid={recuperado.tipo === "correo" || undefined} />
              </div>
              {recuperado.error && <p className="t-cuerpo aviso-falla" role="alert">{recuperado.error}</p>}
              {recuperado.aviso && <p className="t-cuerpo aviso-logrado" role="status">{recuperado.aviso}</p>}
              <button className="btn btn-bloque" disabled={pidiendo || !enLinea}>
                {pidiendo ? "Mandando…" : recuperado.aviso ? "Mandar otro enlace" : "Mandarme el enlace"}
              </button>
              {google && (
                <p className="t-dato" style={{ color: "var(--tinta-tenue)" }}>
                  Si tu cuenta usa tu correo de Google, también puedes entrar con el botón de arriba.
                </p>
              )}
            </form>
          ) : (
            <p className="t-cuerpo" style={{ marginTop: "var(--e-3)" }}>
              {contacto ? (
                <>
                  Escríbenos{" "}
                  {contacto.whatsapp ? (
                    <a href={`https://wa.me/${contacto.whatsapp}`} target="_blank" rel="noopener noreferrer">por WhatsApp</a>
                  ) : (
                    <a href={`mailto:${contacto.correo}`}>a {contacto.correo}</a>
                  )}{" "}
                  desde el correo de tu cuenta y te ayudamos a recuperarla.
                </>
              ) : (
                "Escríbenos desde el correo de tu cuenta y te ayudamos a recuperarla."
              )}
              {google ? " Si tu cuenta usa el mismo correo de Google, también puedes entrar con el botón de arriba." : ""}
            </p>
          )}
        </details>
      </div>
    );
  }
  return null;
}

/** Contraseña con botón para verla: en el teléfono es fácil equivocarse. */
export function CampoClave({ id, nueva, invalido }: { id: string; nueva?: boolean; invalido?: boolean }) {
  const [ver, setVer] = useState(false);
  return (
    <div>
      <label className="t-interfaz" htmlFor={id}>{nueva ? "Crea una contraseña" : "Contraseña"}</label>
      <div className="campo-clave" style={{ marginTop: "var(--e-3)" }}>
        <input id={id} name="clave" type={ver ? "text" : "password"} required className="campo"
          minLength={nueva ? 8 : undefined}
          autoComplete={nueva ? "new-password" : "current-password"}
          aria-invalid={invalido || undefined}
          aria-describedby={nueva ? `${id}-ayuda` : undefined} />
        <button type="button" className="campo-clave-ver" onClick={() => setVer(!ver)}
          aria-pressed={ver} aria-controls={id}>
          {ver ? "Ocultar" : "Ver"}
        </button>
      </div>
      {nueva && (
        <p id={`${id}-ayuda`} className="t-dato" style={{ marginTop: "var(--e-2)", color: "var(--tinta-tenue)" }}>
          Mínimo 8 caracteres.
        </p>
      )}
    </div>
  );
}
