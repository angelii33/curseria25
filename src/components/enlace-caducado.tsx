"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Cuando un enlace de acceso falla, Supabase regresa a la página con el error
 * en el «#» (…#error_code=otp_expired), que el servidor nunca ve. Aquí se
 * detecta y se lleva a /entrar con un aviso claro, en vez de dejar a la
 * persona en la portada sin saber qué pasó.
 */
export function EnlaceCaducado() {
  const router = useRouter();
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("error_code=") && !hash.includes("error=")) return;
    const p = new URLSearchParams(hash.slice(1));
    if (!p.get("error_code") && !p.get("error")) return;
    router.replace("/entrar?error=enlace");
  }, [router]);
  return null;
}
