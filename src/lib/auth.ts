// Piezas puras del acceso: validar y ocultar correos, traducir los errores de
// Supabase Auth y saber cuánto hay que esperar para pedir otro código.
// Sin dependencias de servidor para poder probarlas y usarlas en el cliente.

/** Segundos entre un envío y el siguiente. Coincide con el mínimo que
 *  Supabase impone por correo (60 s por omisión); si el servidor dice otra
 *  cifra, manda la del servidor. */
export const ESPERA_REENVIO = 60;

export function normalizarCorreo(valor: unknown): string {
  return String(valor ?? "").trim().toLowerCase();
}

/** Validación de forma, no de existencia: nunca se revela si hay cuenta. */
export function correoValido(correo: string): boolean {
  return correo.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);
}

/** «ana@taqueria.mx» → «an•••@taqueria.mx». Para pantallas y registros. */
export function ocultarCorreo(correo: string): string {
  const [usuario, dominio] = correo.split("@");
  if (!usuario || !dominio) return "tu correo";
  const visible = usuario.length <= 2 ? usuario.slice(0, 1) : usuario.slice(0, 2);
  return `${visible}•••@${dominio}`;
}

type ErrorAuth = { code?: string; message?: string; status?: number; name?: string } | null | undefined;

export type TipoFalla =
  | "limite"      // demasiados envíos o intentos
  | "codigo"      // código incorrecto, caducado o ya usado
  | "correo"      // correo con forma inválida o rechazado
  | "credenciales"
  | "red"         // no se pudo hablar con Supabase
  | "existe"      // al crear cuenta: ese correo ya tiene una
  | "otro";

/** «…you can only request this after 42 seconds.» → 42. */
export function segundosDeEspera(error: ErrorAuth): number {
  const n = Number(/after (\d+) seconds?/i.exec(error?.message ?? "")?.[1]);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 3600) : ESPERA_REENVIO;
}

/** El límite por correo («espera N segundos») significa que a ese correo se
 *  le mandó un código hace muy poco. El límite global del proyecto no. */
export function limitePorCorreo(error: ErrorAuth): boolean {
  return /after \d+ seconds?/i.test(error?.message ?? "");
}

/** Clasifica por código de error (estable) y, si no viene, por el texto. */
export function tipoDeFalla(error: ErrorAuth): TipoFalla {
  const codigo = error?.code ?? "";
  const texto = (error?.message ?? "").toLowerCase();
  if (
    ["over_email_send_rate_limit", "over_request_rate_limit", "over_sms_send_rate_limit"].includes(codigo) ||
    error?.status === 429 ||
    texto.includes("for security purposes") ||
    texto.includes("rate limit")
  ) return "limite";
  if (
    ["otp_expired", "flow_state_expired", "flow_state_not_found", "bad_code_verifier"].includes(codigo) ||
    texto.includes("token has expired") ||
    (texto.includes("invalid") && texto.includes("token"))
  ) return "codigo";
  if (["email_address_invalid", "email_address_not_authorized", "validation_failed"].includes(codigo))
    return "correo";
  if (codigo === "invalid_credentials" || texto.includes("invalid login credentials")) return "credenciales";
  if (
    error?.name === "AuthRetryableFetchError" ||
    error?.status === 0 ||
    codigo === "request_timeout" ||
    texto.includes("fetch failed")
  ) return "red";
  return "otro";
}

/** El texto que ve la persona. Nunca dice si un correo tiene cuenta. */
export function mensajeDeFalla(error: ErrorAuth): string {
  switch (tipoDeFalla(error)) {
    case "limite": {
      if (!limitePorCorreo(error))
        return "Ahora mismo no podemos mandar más correos: se alcanzó el límite de envíos por hora. Inténtalo más tarde o entra con tu contraseña si tienes una.";
      const s = segundosDeEspera(error);
      return `Por seguridad hay que esperar ${s} segundos antes de volver a intentarlo.`;
    }
    case "codigo":
      return "Ese código no sirve: es incorrecto, ya se usó o caducó. Usa el del correo más reciente o pide uno nuevo.";
    case "correo":
      return "Ese correo no parece válido. Revísalo y vuelve a intentarlo.";
    case "credenciales":
      return "El correo o la contraseña no coinciden.";
    case "red":
      return "No pudimos conectar con el servidor. Revisa tu internet y vuelve a intentarlo.";
    default:
      if (error?.code === "email_not_confirmed") return "Tu cuenta todavía no está confirmada. Escríbenos y la activamos.";
      if (error?.code === "user_banned") return "Esta cuenta está suspendida. Escríbenos para revisarla.";
      if (error?.code === "signup_disabled" || error?.code === "otp_disabled")
        return "El acceso con código no está disponible ahora mismo. Inténtalo más tarde.";
      return "Algo salió mal. Vuelve a intentarlo en un momento.";
  }
}
