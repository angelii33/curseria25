import type { Metadata } from "next";
import Link from "next/link";
import { Contacto, PaginaLegal } from "@/components/pagina-legal";

export const metadata: Metadata = {
  title: "Reembolsos",
  description: "7 días para pedir el reembolso completo de tu curso o paquete.",
};

export default function Reembolsos() {
  return (
    <PaginaLegal sobretitulo="Garantía" titulo="7 días para pedir tu reembolso">
      <p className="legal-resumen">
        Si en los primeros 7 días naturales después de pagar ves que el curso no es para ti,
        te devolvemos el dinero completo. No te pedimos que expliques por qué.
      </p>

      <h2>Cómo pedirlo</h2>
      <ul>
        <li>Escribe a <Contacto /> desde el correo de tu cuenta.</li>
        <li>Dinos qué compraste (curso, paquete o Listo Pro). Con eso basta.</li>
        <li>Hacemos la devolución por Mercado Pago, al mismo medio con el que pagaste, en un máximo de 5 días hábiles.</li>
      </ul>

      <h2>Qué pasa con tu acceso</h2>
      <p>
        Al hacer el reembolso se cierra el acceso a lo que compraste. Lo que ya armaste para tu
        negocio —tu ficha, tu menú, tus mensajes— sigue siendo tuyo.
      </p>

      <h2>Listo Pro</h2>
      <p>
        El primer cobro de la membresía también tiene 7 días de garantía. Después, puedes
        cancelar cuando quieras desde tu cuenta de Mercado Pago o escribiéndonos: no se hacen
        más cobros y conservas el acceso hasta el final del mes que ya pagaste. Los meses ya
        cobrados después de la garantía no se reembolsan.
      </p>

      <h2>Pagos en efectivo</h2>
      <p>
        Si pagaste en OXXO u otra tienda, Mercado Pago devuelve el dinero a tu cuenta de
        Mercado Pago o te indica cómo recibirlo.
      </p>

      <p>
        ¿Dudas antes de comprar? Empieza por la <Link href="/#gratis">lección gratis</Link> de
        cualquier curso: es completa.
      </p>
    </PaginaLegal>
  );
}
