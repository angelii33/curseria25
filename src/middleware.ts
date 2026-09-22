import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ppcjjmejawxjlfblbudt.supabase.co";
const clave =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_OZiGkBUbrDvp4NltADfITw_oHzWweJk";

export async function middleware(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const sb = createServerClient(url, clave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (galletas) => {
        galletas.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        galletas.forEach(({ name, value, options }) =>
          respuesta.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresca el token si tocaba. No hacerlo aquí provoca sesiones que
  // "se caen solas" a los pocos minutos.
  await sb.auth.getUser();

  return respuesta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)"],
};
