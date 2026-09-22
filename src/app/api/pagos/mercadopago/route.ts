import { firmaValida } from "@/lib/mercadopago";
import { procesarCobroSuscripcion, procesarPago, procesarSuscripcion } from "@/lib/pagos";

// Aviso de Mercado Pago. Del cuerpo solo se toma el tipo y el id; el estado
// real se consulta a su API. Responder 200 rápido evita reintentos inútiles;
// un 500 (fallo nuestro o de la red) hace que Mercado Pago lo reintente.

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const cuerpo = (await req.json().catch(() => ({}))) as {
    type?: string;
    topic?: string;
    data?: { id?: string | number };
  };
  const tipo = cuerpo.type ?? cuerpo.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic") ?? "";
  const id = String(cuerpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (!id) return Response.json({ ok: true, ignorado: "sin_id" });

  const firma = firmaValida(req.headers.get("x-signature"), req.headers.get("x-request-id"), id);
  if (firma === false) return Response.json({ ok: false }, { status: 401 });

  try {
    let r;
    if (tipo === "payment") r = await procesarPago(id);
    else if (tipo === "subscription_preapproval" || tipo === "preapproval") r = await procesarSuscripcion(id);
    else if (tipo === "subscription_authorized_payment") r = await procesarCobroSuscripcion(id);
    else return Response.json({ ok: true, ignorado: tipo || "sin_tipo" });
    return Response.json({ ok: true, estado: r.estado });
  } catch (e) {
    console.error("[webhook mp]", tipo, id, e instanceof Error ? e.message : e);
    return Response.json({ ok: false }, { status: 500 });
  }
}
