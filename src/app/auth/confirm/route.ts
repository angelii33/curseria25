import type { EmailOtpType } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { clienteServidor } from "@/lib/supabase/server";
import { rutaInterna } from "@/lib/rutas";

// Destino de los enlaces que manda Supabase por correo.
//
// Llegan de dos formas:
//  · ?token_hash=…&type=email — plantilla propia (supabase/templates). Funciona
//    en cualquier navegador, aunque el código se haya pedido en otro.
//  · ?code=… — plantilla por omisión con PKCE. Solo funciona en el navegador
//    que pidió el código, porque ahí está la galleta con el verificador.
// En ambos casos la sesión queda en galletas del servidor, como el resto.

const TIPOS: EmailOtpType[] = ["email", "magiclink", "signup", "invite", "recovery", "email_change"];

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const next = rutaInterna(p.get("next") ?? request.cookies.get("listo_volver")?.value, "/mi-aprendizaje");
  const tokenHash = p.get("token_hash");
  const tipo = p.get("type") as EmailOtpType | null;
  const code = p.get("code");

  // Quien cancela en la pantalla de Google (o Google falla) vuelve con ?error.
  if (p.has("error") && !code && !tokenHash) {
    console.warn("[acceso] proveedor", { code: p.get("error_code") ?? p.get("error") ?? "?" });
    const destino = new URL("/entrar", request.url);
    destino.searchParams.set("error", "google");
    if (next !== "/mi-aprendizaje") destino.searchParams.set("volver", next);
    return NextResponse.redirect(destino);
  }

  const sb = await clienteServidor();
  let error: { code?: string; status?: number } | null = null;

  if (tokenHash && tipo && TIPOS.includes(tipo)) {
    ({ error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type: tipo }));
  } else if (code) {
    ({ error } = await sb.auth.exchangeCodeForSession(code));
  } else {
    error = { code: "sin_parametros" };
  }

  if (error) {
    // Un enlace viejo pero con la sesión ya abierta (doble clic, otra
    // pestaña) no es un fallo: se entra igual.
    const { data } = await sb.auth.getUser();
    if (!data.user) {
      console.warn("[acceso] enlace", { code: error.code ?? "?", status: error.status ?? 0 });
      const destino = new URL("/entrar", request.url);
      destino.searchParams.set("error", "enlace");
      if (next !== "/mi-aprendizaje") destino.searchParams.set("volver", next);
      return NextResponse.redirect(destino);
    }
  }

  revalidatePath("/", "layout");
  const respuesta = NextResponse.redirect(new URL(next, request.url));
  respuesta.cookies.delete("listo_volver");
  return respuesta;
}
