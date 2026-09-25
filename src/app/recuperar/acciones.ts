"use server";

import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { clienteServidor } from "@/lib/supabase/server";
import { clienteAdmin } from "@/lib/supabase/admin";
import { correoValido, normalizarCorreo, ocultarCorreo } from "@/lib/auth";
import { URL_SITIO } from "@/lib/sitio";
import { rutaInterna } from "@/lib/rutas";
import {
  enviarConResend, firmarPase, huella, paseValido, plantillaRecuperacion, recuperacionActiva,
} from "@/lib/recuperacion";
import type { Estado } from "../acciones";

const GALLETA = "curseria-recuperacion";
const CLAVE_MINIMA = 8;

/**
 * «Olvidé mi contraseña». Responde SIEMPRE lo mismo, exista o no la cuenta
 * (no se revela quién está registrado), y el trabajo lento —generar el
 * enlace y mandar el correo— corre después de responder, así que el tiempo
 * de respuesta tampoco lo delata.
 */
export async function pedirRecuperacion(_prev: Estado, datos: FormData): Promise<Estado> {
  const correo = normalizarCorreo(datos.get("correo"));
  const volver = rutaInterna(String(datos.get("volver") ?? ""), "");
  const n = Date.now();

  if (String(datos.get("sitio") ?? "")) return { aviso: "Listo.", n };
  if (!correoValido(correo)) return { error: "Escribe un correo válido, como nombre@negocio.mx.", tipo: "correo", correo, n };
  const admin = clienteAdmin();
  if (!recuperacionActiva() || !admin) {
    return { error: "La recuperación por correo no está disponible ahora. Escríbenos y te ayudamos.", tipo: "otro", correo, n };
  }

  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "sin-ip";
  const { data: permiso, error } = await admin.rpc("permitir_recuperacion", {
    p_correo: huella(correo), p_ip: huella(ip),
  });
  if (error) {
    console.error("[recuperar] límite", { code: error.code ?? "?" });
    return { error: "No pudimos mandar el enlace ahora. Vuelve a intentarlo en un momento.", tipo: "otro", correo, n };
  }
  if (permiso === "espera") {
    return { error: "Ya te mandamos un enlace hace un momento. Revisa tu bandeja y la carpeta de spam; en un minuto puedes pedir otro.", tipo: "limite", correo, n };
  }
  if (permiso === "limite") {
    return { error: "Pediste varios enlaces seguidos. Por seguridad, espera una hora o escríbenos y te ayudamos.", tipo: "limite", correo, n };
  }

  after(async () => {
    const { data, error: e } = await admin.auth.admin.generateLink({ type: "recovery", email: correo });
    const token = data?.properties?.hashed_token;
    if (e || !token) {
      // Lo normal aquí es que no haya cuenta con ese correo: no se manda nada.
      console.warn("[recuperar] sin enlace", { correo: ocultarCorreo(correo), code: e?.code ?? "?", status: e?.status ?? 0 });
      return;
    }
    // Siempre el dominio oficial, nunca el que diga la petición: el enlace
    // lleva un token de acceso y no debe poder apuntar a otro sitio.
    // El token va después de «#»: el navegador nunca lo manda al servidor,
    // así que no queda en registros de peticiones ni en el Referer.
    const enlace = new URL("/recuperar", URL_SITIO);
    if (volver) enlace.searchParams.set("volver", volver);
    enlace.hash = new URLSearchParams({ token_hash: token }).toString();
    const ok = await enviarConResend(correo, plantillaRecuperacion(enlace.toString()));
    if (ok) console.info("[recuperar] enviado", { correo: ocultarCorreo(correo) });
  });

  return {
    aviso: `Si hay una cuenta con ${correo}, te llegará un enlace en un minuto para crear tu contraseña nueva. Revisa también la carpeta de spam.`,
    correo, n,
  };
}

/**
 * Guarda la contraseña nueva. El token del enlace se canjea aquí, al enviar
 * el formulario, y no al abrir la página: los antivirus de correo que
 * «visitan» los enlaces no lo gastan.
 */
export async function guardarNuevaClave(_prev: Estado, datos: FormData): Promise<Estado> {
  const clave = String(datos.get("clave") ?? "");
  const tokenHash = String(datos.get("token_hash") ?? "");
  const destino = rutaInterna(String(datos.get("volver") ?? ""), "/mi-aprendizaje");
  const n = Date.now();
  const secreto = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  // Se valida antes de gastar el enlace.
  if (clave.length < CLAVE_MINIMA) {
    return { error: `La contraseña necesita al menos ${CLAVE_MINIMA} caracteres.`, tipo: "credenciales", n };
  }
  if (!secreto) return { error: "La recuperación no está disponible ahora. Escríbenos y te ayudamos.", tipo: "otro", n };

  const sb = await clienteServidor();
  const galletas = await cookies();
  const vencido: Estado = {
    error: "Este enlace ya se usó o venció. Pide uno nuevo desde «¿Olvidaste tu contraseña?».",
    tipo: "codigo", n,
  };

  if (tokenHash) {
    const { data, error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (error || !data.user) {
      console.warn("[recuperar] enlace", { code: error?.code ?? "?", status: error?.status ?? 0 });
      return vencido;
    }
    galletas.set(GALLETA, firmarPase(data.user.id, secreto), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/recuperar", maxAge: 15 * 60,
    });
  } else {
    // Reintento tras una contraseña rechazada: vale solo con el pase.
    const { data } = await sb.auth.getUser();
    if (!data.user || !paseValido(galletas.get(GALLETA)?.value, data.user.id, secreto)) return vencido;
  }

  const { error } = await sb.auth.updateUser({ password: clave });
  if (error) {
    const base = { tipo: "credenciales" as const, n, verificado: true };
    if (error.code === "same_password") return { ...base, error: "Esa es tu contraseña actual. Elige una distinta." };
    if (error.code === "weak_password") return { ...base, error: "Esa contraseña es muy fácil de adivinar. Prueba otra más larga." };
    console.warn("[recuperar] guardar", { code: error.code ?? "?", status: error.status ?? 0 });
    return { ...base, error: "No pudimos guardar la contraseña. Vuelve a intentarlo." };
  }

  galletas.delete({ name: GALLETA, path: "/recuperar" });
  // Quien pidió el cambio pudo perder el control de su cuenta: se cierran
  // las demás sesiones abiertas. Esta sigue.
  const { error: e2 } = await sb.auth.signOut({ scope: "others" });
  if (e2) console.warn("[recuperar] cerrar otras", { code: e2.code ?? "?" });
  revalidatePath("/", "layout");
  return { destino, n };
}
