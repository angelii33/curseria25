import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { MARCA } from "./marca";

// Recuperar contraseña por correo. El enlace lo genera Supabase (admin
// generateLink: token de un solo uso) y el correo lo manda Resend con
// nuestra plantilla, así no depende del correo de Supabase ni de sus
// límites. Aquí van las piezas puras para poder probarlas.

/** Resend listo: llave, remitente con dominio verificado y llave de servicio
 *  (sin ella no se puede generar el enlace). */
export function recuperacionActiva(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

/** Huella para el límite de envíos: no se guarda el correo ni la IP. */
export function huella(valor: string): string {
  return createHash("sha256").update(`curseria:${valor}`).digest("hex");
}

const MINUTOS_PASE = 15;

/** Pase firmado que se guarda en una galleta httpOnly tras abrir el enlace:
 *  si la contraseña nueva se rechaza (débil, igual a la anterior), permite
 *  reintentar sin gastar otro enlace. Solo vale para ESE usuario y 15 min;
 *  una sesión normal no puede cambiar la contraseña desde aquí sin él. */
export function firmarPase(userId: string, secreto: string, ahora = Date.now()): string {
  const vence = ahora + MINUTOS_PASE * 60_000;
  const cuerpo = `${userId}.${vence}`;
  return `${cuerpo}.${createHmac("sha256", secreto).update(cuerpo).digest("hex")}`;
}

export function paseValido(pase: string | undefined, userId: string, secreto: string, ahora = Date.now()): boolean {
  if (!pase) return false;
  const partes = pase.split(".");
  if (partes.length !== 3) return false;
  const [id, vence, firma] = partes;
  if (id !== userId || !(Number(vence) > ahora)) return false;
  const esperada = createHmac("sha256", secreto).update(`${id}.${vence}`).digest("hex");
  return firma.length === esperada.length && timingSafeEqual(Buffer.from(firma), Buffer.from(esperada));
}

const escapar = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** El correo: una sola acción, sin imágenes remotas ni rastreadores. */
export function plantillaRecuperacion(enlace: string): { asunto: string; html: string; texto: string } {
  const asunto = `Crea tu nueva contraseña de ${MARCA.nombre}`;
  const texto = [
    "Hola:",
    "",
    `Pediste crear una contraseña nueva para tu cuenta de ${MARCA.nombre}. Abre este enlace:`,
    enlace,
    "",
    "El enlace sirve una sola vez y vence pronto. Si no lo pediste tú, ignora este correo: tu contraseña sigue igual.",
  ].join("\n");
  const e = escapar(enlace);
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapar(asunto)}</title></head>
<body style="margin:0;padding:0;background:#F4F1EA;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#25341F">
<div style="display:none;max-height:0;overflow:hidden">Un enlace para elegir tu contraseña nueva. Sirve una sola vez.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EA;padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFFFF;border-radius:12px;padding:32px 28px">
<tr><td style="font-size:22px;font-weight:700;padding-bottom:20px">${MARCA.partes[0]}<span style="color:#C3652F">${MARCA.partes[1]}</span></td></tr>
<tr><td style="font-size:20px;font-weight:700;padding-bottom:12px">Crea tu nueva contraseña</td></tr>
<tr><td style="font-size:16px;line-height:1.5;padding-bottom:24px">Pediste una contraseña nueva para tu cuenta. Toca el botón y escríbela; entras en cuanto la guardes.</td></tr>
<tr><td style="padding-bottom:24px"><a href="${e}" style="display:inline-block;background:#25341F;color:#FFFFFF;text-decoration:none;font-weight:700;font-size:16px;padding:14px 24px;border-radius:8px">Crear nueva contraseña</a></td></tr>
<tr><td style="font-size:14px;line-height:1.5;color:#5A6155;padding-bottom:16px">El enlace sirve una sola vez y vence pronto. Si el botón no abre, copia esto en tu navegador:<br><a href="${e}" style="color:#25341F;word-break:break-all">${e}</a></td></tr>
<tr><td style="font-size:14px;line-height:1.5;color:#5A6155">¿No lo pediste tú? Ignora este correo: tu contraseña sigue igual.</td></tr>
</table>
</td></tr></table>
</body></html>`;
  return { asunto, html, texto };
}

/** Manda un correo por la API de Resend. Devuelve si salió. */
export async function enviarConResend(para: string, c: { asunto: string; html: string; texto: string }): Promise<boolean> {
  const base = process.env.RESEND_API_URL?.trim() || "https://api.resend.com";
  try {
    const r = await fetch(`${base}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM, to: [para], subject: c.asunto, html: c.html, text: c.texto }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) {
      // El cuerpo de error de Resend no trae datos de la persona.
      console.error("[recuperar] resend", r.status, (await r.text()).slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[recuperar] resend sin respuesta", (e as Error).name);
    return false;
  }
}
