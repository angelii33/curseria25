"use client";

import {
  useActionState, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import { pedirCodigo, verificarCodigo, entrarConClave, entrarConGoogle, crearCuenta, type Estado } from "../acciones";
import { IconoSobre, IconoTicket } from "@/components/iconos-acceso";
import { CodigoOtp } from "@/components/codigo-otp";
import { BotonGoogle } from "@/components/boton-google";
import { ocultarCorreo } from "@/lib/auth";

const inicial: Estado = {};

// Lo único que se guarda en el navegador: el correo y cuándo se pidió el
// código, para no perder el paso 2 al recargar. Nunca códigos ni sesiones:
// la sesión vive en galletas del servidor. Se lee con useSyncExternalStore
// (como src/lib/almacen.ts): el servidor y la hidratación ven el paso 1.
const LLAVE = "listo:acceso";
const EVENTO = "listo:acceso";
const VIGENCIA_PASO = 60 * 60 * 1000;
type Flujo = { correo: string; listoEn: number; pedidoEn: number };
let enMemoria = ""; // si el almacenamiento está bloqueado (modo privado)

function leerCrudo(): string {
  let crudo: string;
  try {
    crudo = sessionStorage.getItem(LLAVE) ?? "";
  } catch {
    crudo = enMemoria;
  }
  try {
    const f = JSON.parse(crudo || "null") as Flujo | null;
    return f && typeof f.correo === "string" && Date.now() - f.pedidoEn < VIGENCIA_PASO ? crudo : "";
  } catch {
    return "";
  }
}
function guardarFlujo(f: Flujo | null) {
  const crudo = f ? JSON.stringify(f) : "";
  try {
    if (f) sessionStorage.setItem(LLAVE, crudo);
    else sessionStorage.removeItem(LLAVE);
  } catch {
    enMemoria = crudo;
  }
  window.dispatchEvent(new Event(EVENTO));
}
function suscribir(aviso: () => void) {
  window.addEventListener(EVENTO, aviso);
  return () => window.removeEventListener(EVENTO, aviso);
}
function useFlujo(): Flujo | null {
  const crudo = useSyncExternalStore(suscribir, leerCrudo, () => "");
  return useMemo(() => (crudo ? (JSON.parse(crudo) as Flujo) : null), [crudo]);
}

/** Una acción de servidor que falla por red no debe tumbar la página. */
function sinRed(datos: FormData): Estado {
  return {
    error: "No pudimos conectar. Revisa tu internet y vuelve a intentarlo.",
    tipo: "red",
    correo: String(datos.get("correo") ?? "") || undefined,
    enviado: datos.has("paso2"),
    n: Date.now(),
  };
}
const conRed =
  (accion: (p: Estado, d: FormData) => Promise<Estado>) =>
  async (p: Estado, d: FormData): Promise<Estado> => {
    try {
      return await accion(p, d);
    } catch {
      return sinRed(d);
    }
  };
const pedirSeguro = conRed(pedirCodigo);
const verificarSeguro = conRed(verificarCodigo);
const claveSegura = conRed(entrarConClave);
const crearSeguro = conRed(crearCuenta);

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

/** Segundos que faltan hasta «hasta»; se actualiza solo mientras corre. */
function useCuentaAtras(hasta: number) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (hasta <= Date.now()) return;
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [hasta]);
  return Math.max(0, Math.ceil((hasta - ahora) / 1000));
}

export function Formulario({
  volver,
  google,
  fallo,
  crearCuentaPrimero,
}: {
  volver?: string;
  /** Abrir en «Soy nuevo» (p. ej. al llegar desde un botón de compra). */
  crearCuentaPrimero?: boolean;
  /** «Entrar con Google» activado en Supabase. */
  google?: boolean;
  fallo?: "enlace" | "google";
}) {
  const router = useRouter();
  const enLinea = useEnLinea();
  const [modo, setModo] = useState<"crear" | "entrar" | "codigo">(crearCuentaPrimero ? "crear" : "entrar");
  const vieneAComprar = Boolean(volver?.startsWith("/comprar"));
  const flujo = useFlujo();
  const [correoEscrito, setCorreoEscrito] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [reinicio, setReinicio] = useState(0);
  // Si la página se desmonta con un código en camino, es que entró (al
  // escribir la sesión, el servidor vuelve a pintar /entrar y redirige a
  // «volver»): el paso 2 guardado ya no sirve.
  const codigoEnCamino = useRef(false);

  const [pedido, pedir, pidiendo] = useActionState(async (prev: Estado, datos: FormData) => {
    const r = await pedirSeguro(prev, datos);
    if (r.correo) setCorreoEscrito(r.correo);
    if (r.enviado && r.correo) {
      const ahora = Date.now();
      guardarFlujo({
        correo: r.correo,
        pedidoEn: r.error && flujo ? flujo.pedidoEn : ahora,
        listoEn: ahora + (r.esperar ?? 0) * 1000,
      });
      setAviso(r.aviso ?? null);
      if (!r.error) setReinicio(ahora);
    }
    return r;
  }, inicial);

  const [verificado, verificar, verificando] = useActionState(async (prev: Estado, datos: FormData) => {
    codigoEnCamino.current = true;
    const r = await verificarSeguro(prev, datos);
    // Solo un error deja el flujo vivo; si entró, la página se va.
    if (r.error) codigoEnCamino.current = false;
    if (r.tipo === "codigo" && r.error !== "El código son 6 dígitos.") setReinicio(r.n ?? Date.now());
    if (!r.enviado && r.tipo === "correo") guardarFlujo(null);
    return r;
  }, inicial);

  const [conClave, entrarClave, entrandoClave] = useActionState(claveSegura, inicial);
  const [creado, crear, creando] = useActionState(crearSeguro, inicial);
  const formCodigo = useRef<HTMLFormElement>(null);

  useEffect(
    () => () => {
      if (codigoEnCamino.current) guardarFlujo(null);
    },
    []
  );

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
  const destino = verificado.destino ?? conClave.destino ?? creado.destino;
  useEffect(() => {
    if (!destino) return;
    guardarFlujo(null);
    router.replace(destino);
  }, [destino, router]);

  const cambiarCorreo = () => {
    if (flujo) setCorreoEscrito(flujo.correo);
    guardarFlujo(null);
    setAviso(null);
  };

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

  if (flujo) {
    return (
      <PasoCodigo
        google={google}
        flujo={flujo}
        volver={volver}
        aviso={aviso}
        errorPedir={pedido.enviado ? pedido.error : undefined}
        estado={verificado}
        verificando={verificando}
        pidiendo={pidiendo}
        enLinea={enLinea}
        sinConexion={sinConexion}
        reinicio={reinicio}
        formCodigo={formCodigo}
        verificar={verificar}
        pedir={pedir}
        cambiarCorreo={cambiarCorreo}
      />
    );
  }

  const avisoFallo = fallo && !pedido.n && (
    <p className="t-cuerpo aviso-falla" role="alert" style={{ marginTop: "var(--e-4)" }}>
      {fallo === "google"
        ? "No se completó la entrada con Google. Vuelve a intentarlo o usa tu correo."
        : "Ese enlace ya se usó o caducó. Entra con tu contraseña o pide un código nuevo."}
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
              {conClave.tipo === "credenciales" && " Si nunca creaste contraseña, entra con un código."}
            </p>
          )}
          <button className="btn btn-primario btn-bloque btn-grande" disabled={entrandoClave || !enLinea}>
            {entrandoClave ? "Entrando…" : vieneAComprar ? "Entrar y pagar" : "Entrar"}
          </button>
        </form>
        <div className="perforacion perforacion-sangrada" />
        <button className="btn btn-fantasma btn-bloque acceso-secundario" type="button" onClick={() => setModo("codigo")}>
          ¿Olvidaste tu contraseña? Entra con un código a tu correo
        </button>
      </div>
    );
  }

  // modo «codigo»: acceso por código al correo (la vía de respaldo).
  const errorPedir = pedido.enviado ? undefined : pedido.error;
  return (
    <div className="superficie acceso">
      <IconoSobre />
      <h2 className="t-titulo-3" style={{ marginTop: "var(--e-3)" }}>Entra con un código</h2>
      <p className="t-cuerpo" style={{ marginTop: "var(--e-3)" }}>
        Te mandamos un código de 6 dígitos a tu correo. Puede tardar un par de minutos.
      </p>
      {avisoFallo}
      <div className="perforacion perforacion-sangrada" />
      <form action={pedir} style={{ display: "grid", gap: "var(--e-5)" }}>
        {volver && <input type="hidden" name="volver" value={volver} />}
        <div>
          <label className="t-interfaz" htmlFor="correo">Tu correo</label>
          <input
            key={correoEscrito}
            id="correo" name="correo" type="email" required inputMode="email"
            className="campo" style={{ marginTop: "var(--e-3)" }}
            placeholder="nombre@negocio.mx"
            autoComplete="email" autoCapitalize="none" spellCheck={false}
            defaultValue={correoEscrito}
            aria-invalid={pedido.tipo === "correo" || undefined}
            aria-describedby={errorPedir ? "correo-error" : undefined}
          />
        </div>
        {sinConexion}
        {errorPedir && <p id="correo-error" className="t-cuerpo aviso-falla" role="alert">{errorPedir}</p>}
        <button className="btn btn-primario btn-bloque" disabled={pidiendo || !enLinea}>
          {pidiendo ? "Enviando código…" : "Mandarme el código"}
        </button>
      </form>
      <div className="perforacion perforacion-sangrada" />
      <button className="btn btn-fantasma btn-bloque acceso-secundario" type="button" onClick={() => setModo("entrar")}>
        Volver a entrar con contraseña
      </button>
    </div>
  );
}

/** Contraseña con botón para verla: en el teléfono es fácil equivocarse. */
function CampoClave({ id, nueva, invalido }: { id: string; nueva?: boolean; invalido?: boolean }) {
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

function PasoCodigo({
  google, flujo, volver, aviso, errorPedir, estado, verificando, pidiendo, enLinea, sinConexion, reinicio,
  formCodigo, verificar, pedir, cambiarCorreo,
}: {
  google?: boolean;
  flujo: Flujo;
  volver?: string;
  aviso: string | null;
  errorPedir?: string;
  estado: Estado;
  verificando: boolean;
  pidiendo: boolean;
  enLinea: boolean;
  sinConexion: ReactNode;
  reinicio: number;
  formCodigo: RefObject<HTMLFormElement | null>;
  verificar: (d: FormData) => void;
  pedir: (d: FormData) => void;
  cambiarCorreo: () => void;
}) {
  const faltan = useCuentaAtras(flujo.listoEn);
  const errorCodigo = estado.enviado ? estado.error : undefined;
  // Si el error llegó antes del último envío, ya no aplica al código nuevo.
  const errorVigente = errorCodigo && (estado.n ?? 0) > flujo.pedidoEn ? errorCodigo : undefined;

  const reenviar = (
    <form action={pedir}>
      <input type="hidden" name="correo" value={flujo.correo} />
      <input type="hidden" name="reenvio" value="1" />
      <input type="hidden" name="paso2" value="1" />
      {volver && <input type="hidden" name="volver" value={volver} />}
      <button className="btn btn-fantasma btn-bloque" type="submit" disabled={pidiendo || faltan > 0 || !enLinea}>
        {pidiendo ? "Enviando…" : faltan > 0 ? `Pedir otro código en ${faltan} s` : "Mandarme otro código"}
      </button>
    </form>
  );

  return (
    <div className="superficie acceso">
      <IconoTicket />
      <div className="t-folio" style={{ marginTop: "var(--e-3)" }}>Paso 2 de 2</div>
      <h2 className="t-titulo-3" style={{ marginTop: "var(--e-2)" }}>
        Revisa tu correo
      </h2>
      <p className="t-cuerpo" style={{ marginTop: "var(--e-3)" }}>
        Mandamos un código de 6 dígitos a <strong>{ocultarCorreo(flujo.correo)}</strong>.
        Suele llegar en menos de un minuto.
      </p>
      <button type="button" className="acceso-enlace" onClick={cambiarCorreo}>
        Cambiar correo
      </button>

      {aviso && <p className="t-cuerpo aviso-logrado" role="status" style={{ marginTop: "var(--e-4)" }}>{aviso}</p>}

      <div className="perforacion perforacion-sangrada" />

      <form ref={formCodigo} action={verificar} style={{ display: "grid", gap: "var(--e-5)" }}>
        <input type="hidden" name="correo" value={flujo.correo} />
        <input type="hidden" name="paso2" value="1" />
        {volver && <input type="hidden" name="volver" value={volver} />}

        <div>
          <p className="t-interfaz" id="codigo-etiqueta" style={{ fontWeight: 650 }}>Código</p>
          <div style={{ marginTop: "var(--e-3)" }}>
            <CodigoOtp
              key={reinicio}
              enfocar={reinicio > 0}
              idEtiqueta="codigo-etiqueta"
              idDescripcion={errorVigente ? "codigo-error" : undefined}
              deshabilitado={verificando}
              invalido={Boolean(errorVigente)}
              onCompleto={() => {
                // Al completar (tecleado, pegado o autollenado) se envía solo,
                // salvo que ya haya un envío en curso.
                if (!verificando && navigator.onLine) formCodigo.current?.requestSubmit();
              }}
            />
          </div>
        </div>

        {sinConexion}
        {errorVigente && <p id="codigo-error" className="t-cuerpo aviso-falla" role="alert">{errorVigente}</p>}

        <button className="btn btn-primario btn-bloque" disabled={verificando || !enLinea}>
          {verificando ? "Comprobando…" : "Entrar"}
        </button>
      </form>

      {errorPedir && <p className="t-cuerpo aviso-falla" role="alert" style={{ marginTop: "var(--e-4)" }}>{errorPedir}</p>}

      <div className="perforacion perforacion-sangrada" />

      {reenviar}

      <details className="acceso-ayuda">
        <summary>¿No te llegó el código?</summary>
        <ol>
          <li>
            Busca en <strong>Spam</strong>, <strong>Promociones</strong> o <strong>Notificaciones</strong> el
            correo más reciente con un código de 6 dígitos.
          </li>
          <li>
            Revisa que tu correo esté bien escrito: <strong className="acceso-correo">{flujo.correo}</strong>.
            Si no, <button type="button" className="acceso-enlace" onClick={cambiarCorreo}>cámbialo</button>.
          </li>
          <li>Los correos de empresa a veces tardan unos minutos más o lo retienen en un filtro.</li>
          <li>
            Si pides otro, usa solo el más reciente: el anterior deja de servir. Si el correo trae
            un botón para entrar, también sirve, pero es el mismo acceso: al usar uno, el otro ya no.
          </li>
        </ol>
        {google && (
          <form action={entrarConGoogle} style={{ marginTop: "var(--e-4)" }}>
            {volver && <input type="hidden" name="volver" value={volver} />}
            <BotonGoogle deshabilitado={!enLinea} />
          </form>
        )}
      </details>
    </div>
  );
}
