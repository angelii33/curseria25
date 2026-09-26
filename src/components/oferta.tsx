import Link from "next/link";
import { comprar, suscribirse } from "@/app/acciones";
import { precio, type Oferta } from "@/lib/catalogo";
import { ETAPAS, editorialDe } from "@/lib/editorial";

const orden = (slug: string) => ETAPAS[editorialDe(slug)?.etapa ?? "comprar"].orden;

// Tarjeta de un paquete o de la membresía. El formulario solo manda el id
// del producto: el precio lo pone la base al crear la compra.

export function TarjetaOferta({ o, volver = "/precios" }: { o: Oferta; volver?: string }) {
  const ahorro = o.suelto_cents - o.precio_cents;
  const esPro = o.tipo === "membership";
  return (
    <article className={`oferta ${o.destacado ? "oferta-destacada" : ""} ${esPro ? "oferta-pro" : ""}`}>
      {o.destacado ? <p className="oferta-sello">El más completo</p> : null}
      <h3 className="t-titulo-3 oferta-nombre">{o.nombre}</h3>
      {o.descripcion ? <p className="t-cuerpo oferta-desc">{o.descripcion}</p> : null}

      <p className="oferta-precio">
        {precio(o.precio_cents, o.moneda)} <small>{o.moneda}{esPro ? " al mes" : ""}</small>
      </p>
      <p className="t-dato oferta-nota">
        {esPro
          ? "Cobro mensual. Cancelas cuando quieras desde Mercado Pago."
          : ahorro > 0
            ? `Por separado: ${precio(o.suelto_cents, o.moneda)}. Ahorras ${precio(ahorro, o.moneda)}.`
            : "Pago único. Acceso sin caducidad."}
      </p>

      <form action={esPro ? suscribirse : comprar} className="oferta-form">
        <input type="hidden" name="producto_id" value={o.id} />
        <input type="hidden" name="volver" value={volver} />
        <button className={`btn ${o.destacado || esPro ? "btn-primario" : "btn-secundario"} btn-bloque`} type="submit">
          {esPro ? "Empezar CurserIA Pro" : "Comprar el paquete"}
        </button>
      </form>

      <ul className="oferta-cursos">
        {esPro ? <li className="oferta-todo">Todos los cursos publicados ({o.cursos.length}) y los que vayan saliendo</li> : null}
        {[...o.cursos].sort((a, b) => orden(a.slug) - orden(b.slug)).map((c) => (
          <li key={c.id}>
            <Link href={`/cursos/${c.slug}`}>{c.titulo}</Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
