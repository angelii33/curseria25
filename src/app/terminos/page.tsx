import type { Metadata } from "next";
import Link from "next/link";
import { Contacto, PaginaLegal } from "@/components/pagina-legal";
import { LEGAL, PENDIENTE } from "@/lib/legal";
import { MARCA } from "@/lib/marca";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function Terminos() {
  return (
    <PaginaLegal sobretitulo="Lo legal" titulo="Términos y condiciones">
      <p>
        Estos términos regulan el uso de {MARCA.nombre}, plataforma de cursos en línea operada
        por {LEGAL.responsable ?? PENDIENTE} (domicilio: {LEGAL.domicilio ?? PENDIENTE};
        contacto: <Contacto />). Al crear una cuenta o comprar, los aceptas.
      </p>

      <h2>1. Tu cuenta</h2>
      <p>
        Entras con tu correo y una contraseña, o con tu cuenta de Google. La cuenta es
        personal: no la compartas ni compartas tu contraseña. Eres responsable de lo que se haga con ella.
      </p>

      <h2>2. Qué compras</h2>
      <ul>
        <li><strong>Curso o paquete:</strong> pago único y acceso sin caducidad a sus lecciones, ejercicios y plantillas, mientras {MARCA.nombre} opere.</li>
        <li><strong>CurserIA Pro:</strong> membresía mensual con acceso a todos los cursos publicados mientras esté activa. Se renueva cada mes hasta que la canceles.</li>
      </ul>
      <p>
        Los precios están en pesos mexicanos y son el total a pagar. El precio que ves antes de
        pagar es el que se cobra. Si un precio cambia, no afecta lo que ya compraste.
      </p>

      <h2>3. Pagos</h2>
      <p>
        Los cobros los procesa Mercado Pago. {MARCA.nombre} no recibe ni guarda los datos de tu
        tarjeta. El acceso se abre cuando Mercado Pago confirma el pago.
      </p>

      <h2>4. Reembolsos</h2>
      <p>
        Tienes 7 días naturales después de pagar para pedir el reembolso completo. Detalles en{" "}
        <Link href="/reembolsos">Reembolsos</Link>.
      </p>

      <h2>5. Uso del contenido</h2>
      <p>
        Puedes usar las plantillas, textos y ejemplos en tu propio negocio sin límite. No puedes
        revender, publicar ni compartir el contenido de los cursos de pago con quien no lo
        compró.
      </p>

      <h2>6. Resultados</h2>
      <p>
        Los cursos te enseñan a hacer cosas concretas en tu negocio. Los resultados en ventas o
        clientes dependen de tu negocio, tu mercado y de que apliques lo aprendido; no los
        garantizamos.
      </p>

      <h2>7. Certificados</h2>
      <p>
        El certificado acredita que completaste el curso en {MARCA.nombre}. No es un título ni
        tiene validez oficial ante la SEP.
      </p>

      <h2>8. Cambios y contacto</h2>
      <p>
        Podemos actualizar estos términos; la fecha de arriba indica la última versión. Si tienes
        una queja, escríbenos a <Contacto />. También puedes acudir a la Procuraduría Federal del
        Consumidor (Profeco).
      </p>
    </PaginaLegal>
  );
}
