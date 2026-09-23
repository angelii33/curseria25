import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ppcjjmejawxjlfblbudt.supabase.co";
const clave =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_OZiGkBUbrDvp4NltADfITw_oHzWweJk";

export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;

  // Si Supabase no reconoce la URL de regreso, cae en la Site URL con
  // ?code=… : se reenvía a donde se canjea en vez de ignorarlo.
  if (searchParams.has("code") && !pathname.startsWith("/auth/") && !pathname.startsWith("/api/") &&
      !pathname.startsWith("/compra/")) {
    const destino = new URL("/auth/confirm", request.url);
    destino.searchParams.set("code", searchParams.get("code")!);
    return NextResponse.redirect(destino);
  }

  // La ruta actual, para que «Entrar» sepa a dónde regresar.
  // Se arma en cada paso porque refrescar la sesión reescribe las galletas.
  const siguiente = () => {
    const cabeceras = new Headers(request.headers);
    cabeceras.set("x-ruta", pathname + search);
    return NextResponse.next({ request: { headers: cabeceras } });
  };
  let respuesta = siguiente();

  const sb = createServerClient(url, clave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (galletas, cabeceras) => {
        galletas.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = siguiente();
        galletas.forEach(({ name, value, options }) =>
          respuesta.cookies.set(name, value, options)
        );
        // Una respuesta con galletas de sesión nunca debe quedar en caché:
        // la vería otra persona.
        Object.entries(cabeceras).forEach(([k, v]) => respuesta.headers.set(k, v));
      },
    },
  });

  // Refresca el token si tocaba (Next 16 llama «proxy» a lo que antes era
  // middleware). No hacerlo aquí provoca sesiones que
  // "se caen solas" a los pocos minutos.
  await sb.auth.getUser();

  return respuesta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)"],
};
