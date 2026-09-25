"use client";

import { useActionState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { guardarNuevaClave } from "./acciones";
import type { Estado } from "../acciones";
import { CampoClave } from "../entrar/formulario";
import { IconoTicket } from "@/components/iconos-acceso";

const inicial: Estado = {};

const guardarSeguro = async (p: Estado, d: FormData): Promise<Estado> => {
  try {
    return await guardarNuevaClave(p, d);
  } catch {
    // Si ya se canjeó el enlace, el reintento sigue sin él.
    return { error: "No pudimos conectar. Revisa tu internet y vuelve a intentarlo.", tipo: "red", verificado: p.verificado, n: Date.now() };
  }
};

/** El token viene en «#token_hash=…» (nunca llega al servidor en la URL). */
const sinSuscripcion = () => () => {};
function useTokenDelEnlace(): string | null | undefined {
  return useSyncExternalStore(
    sinSuscripcion,
    () => {
      const t = new URLSearchParams(location.hash.slice(1)).get("token_hash");
      return t && /^[\w-]{10,200}$/.test(t) ? t : null;
    },
    () => undefined, // en el servidor aún no se sabe
  );
}

export function NuevaClave({ volver }: { volver?: string }) {
  const router = useRouter();
  const token = useTokenDelEnlace();
  const [estado, guardar, guardando] = useActionState(guardarSeguro, inicial);

  useEffect(() => {
    if (!estado.destino) return;
    const t = setTimeout(() => router.replace(estado.destino!), 1200);
    return () => clearTimeout(t);
  }, [estado.destino, router]);

  if (estado.destino) {
    return (
      <div className="superficie acceso" aria-live="polite">
        <IconoTicket />
        <h2 className="t-titulo-3" style={{ marginTop: "var(--e-3)" }}>Listo, tu contraseña quedó guardada</h2>
        <p className="t-cuerpo" style={{ marginTop: "var(--e-3)" }}>
          Úsala la próxima vez que entres. Abriendo tu cuenta…
        </p>
        <a className="btn btn-primario btn-bloque" style={{ marginTop: "var(--e-5)" }} href={estado.destino}>Ir a mi cuenta</a>
      </div>
    );
  }

  if (token === undefined) return <div className="superficie acceso" aria-busy="true" style={{ minHeight: 240 }} />;
  if (token === null && !estado.verificado) {
    return (
      <div className="superficie acceso">
        <h2 className="t-titulo-3">Este enlace no está completo</h2>
        <p className="t-cuerpo" style={{ marginTop: "var(--e-3)" }}>
          Ábrelo tocando el botón del correo. Si no funciona, pide uno nuevo.
        </p>
        <a className="btn btn-primario btn-bloque" style={{ marginTop: "var(--e-5)" }} href="/entrar?olvide=1">Pedir un enlace nuevo</a>
      </div>
    );
  }

  const vencido = estado.tipo === "codigo";
  return (
    <div className="superficie acceso">
      <h2 className="t-titulo-3">Contraseña nueva</h2>
      <div className="perforacion perforacion-sangrada" />
      <form action={guardar} style={{ display: "grid", gap: "var(--e-5)" }}>
        {!estado.verificado && token && <input type="hidden" name="token_hash" value={token} />}
        {volver && <input type="hidden" name="volver" value={volver} />}
        <CampoClave id="n-clave" nueva invalido={estado.tipo === "credenciales"} />
        {estado.error && (
          <div className="t-cuerpo aviso-falla" role="alert">
            {estado.error}
            {vencido && (
              <a className="acceso-enlace" style={{ display: "block" }} href="/entrar?olvide=1">Pedir un enlace nuevo</a>
            )}
          </div>
        )}
        <button className="btn btn-primario btn-bloque btn-grande" disabled={guardando || vencido}>
          {guardando ? "Guardando…" : "Guardar y entrar"}
        </button>
      </form>
    </div>
  );
}
