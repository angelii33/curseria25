import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { iniciarCompra } from "@/lib/compra";
import { conParametro, rutaInterna } from "@/lib/rutas";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comprar",
  robots: { index: false, follow: false },
};

// Paso intermedio sin pantalla: tras crear la cuenta (o entrar) para
// comprar, se llega aquí y se sigue directo a Mercado Pago. Nadie enlaza
// esta ruta; solo se llega por el «volver» de /entrar.
export default async function Comprar({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string; volver?: string }>;
}) {
  const { producto = "", volver = "/precios" } = await searchParams;
  const r = await iniciarCompra(producto, volver);
  if ("error" in r) {
    console.warn("[compra] no se pudo iniciar", r.error);
    redirect(conParametro(rutaInterna(volver, "/precios"), "acceso=error"));
  }
  redirect(r.url);
}
