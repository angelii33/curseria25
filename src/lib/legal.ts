/**
 * Datos del responsable del sitio para los textos legales y el contacto.
 * Se configuran en Vercel (variables públicas: aparecen en la página a
 * propósito). Si falta alguno, la página lo dice en vez de inventarlo.
 */
export const LEGAL = {
  responsable: process.env.NEXT_PUBLIC_LEGAL_RESPONSABLE?.trim() || null,
  domicilio: process.env.NEXT_PUBLIC_LEGAL_DOMICILIO?.trim() || null,
  correo: process.env.NEXT_PUBLIC_CONTACTO_CORREO?.trim() || null,
  whatsapp: process.env.NEXT_PUBLIC_CONTACTO_WHATSAPP?.replace(/\D/g, "") || null,
  actualizado: "22 de septiembre de 2026",
} as const;

export const PENDIENTE = "(dato por publicar)";
