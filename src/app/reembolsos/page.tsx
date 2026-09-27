import type { Metadata } from "next";
import Link from "next/link";
import { Contacto, PaginaLegal } from "@/components/pagina-legal";

export const metadata: Metadata = {
  title: "Reembolsos",
  description: "Prueba gratis la lección 1 antes de comprar. Solo devolvemos el dinero por cobro duplicado o una falla técnica que no resolvamos en 72 horas.",
};

export default function Reembolsos() {
  return (
    <PaginaLegal sobretitulo="Antes de pagar" titulo="Prueba primero, paga después">
      <p className="legal-resumen">
        La lección 1 de cada curso es gratis y completa, para que veas cómo es antes de pagar.
        Por eso las compras no tienen reembolso, salvo en los dos casos de abajo.
      </p>

      <h2>Cuándo sí devolvemos el dinero</h2>
      <ul>
        <li><strong>Cobro duplicado:</strong> si Mercado Pago te cobró dos veces lo mismo, te devolvemos el cobro de más.</li>
        <li>
          <strong>Falla técnica:</strong> si pagaste y el curso no se abre en tu cuenta, y no lo
          resolvemos en 72 horas desde que nos avisas, te devolvemos el dinero completo.
        </li>
      </ul>

      <h2>Cómo pedirlo</h2>
      <ul>
        <li>Escribe a <Contacto /> desde el correo de tu cuenta.</li>
        <li>Dinos qué compraste y qué pasó (el comprobante de Mercado Pago ayuda).</li>
        <li>La devolución se hace por Mercado Pago, al mismo medio con el que pagaste, en un máximo de 5 días hábiles.</li>
      </ul>

      <h2>CurserIA Pro</h2>
      <p>
        Puedes cancelar cuando quieras desde tu cuenta de Mercado Pago o escribiéndonos: no se
        hacen más cobros y conservas el acceso hasta el final del mes que ya pagaste. Los meses
        ya cobrados no se reembolsan, salvo cobro duplicado o falla técnica como arriba.
      </p>

      <h2>Pagos en efectivo</h2>
      <p>
        Si pagaste en OXXO u otra tienda y aplica una devolución, Mercado Pago devuelve el dinero
        a tu cuenta de Mercado Pago o te indica cómo recibirlo.
      </p>

      <p>
        ¿Dudas antes de comprar? Empieza por la <Link href="/#gratis">lección gratis</Link> de
        cualquier curso: es completa.
      </p>
    </PaginaLegal>
  );
}
