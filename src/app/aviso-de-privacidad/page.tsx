import type { Metadata } from "next";
import { Contacto, PaginaLegal } from "@/components/pagina-legal";
import { LEGAL, PENDIENTE } from "@/lib/legal";
import { MARCA } from "@/lib/marca";

export const metadata: Metadata = { title: "Aviso de privacidad" };

export default function AvisoDePrivacidad() {
  return (
    <PaginaLegal sobretitulo="Lo legal" titulo="Aviso de privacidad">
      <p className="legal-resumen">
        En corto: pedimos tu correo para guardar tu avance, no vendemos tus datos, no vemos tu
        tarjeta (el pago lo procesa Mercado Pago) y puedes pedir que borremos tu cuenta cuando
        quieras.
      </p>

      <h2>Quién es responsable de tus datos</h2>
      <p>
        {LEGAL.responsable ?? PENDIENTE}, que opera {MARCA.nombre}, con domicilio en{" "}
        {LEGAL.domicilio ?? PENDIENTE}, es responsable del tratamiento de tus datos personales
        conforme a la Ley Federal de Protección de Datos Personales en Posesión de los
        Particulares. Contacto: <Contacto />.
      </p>

      <h2>Qué datos recabamos</h2>
      <ul>
        <li>Tu correo electrónico y, si lo das, tu nombre.</li>
        <li>Tu avance: lecciones completadas, respuestas a quizzes y ejercicios, notas que guardas en tu taller.</li>
        <li>Tus compras: qué compraste, cuándo, el monto y el estado del pago. Los datos de tu tarjeta los recibe y guarda Mercado Pago, no nosotros.</li>
        <li>Si escribes una opinión del curso: el texto, el nombre con el que quieres aparecer y, si lo das, tu negocio y ciudad.</li>
        <li>Datos técnicos de uso (páginas visitadas y acciones dentro del sitio) para saber qué funciona y qué no.</li>
      </ul>
      <p>No recabamos datos personales sensibles.</p>

      <h2>Para qué los usamos</h2>
      <p>Finalidades necesarias para darte el servicio:</p>
      <ul>
        <li>Crear tu cuenta y dejarte entrar con tu correo y contraseña, o con Google.</li>
        <li>Guardar tu avance y emitir tu certificado.</li>
        <li>Procesar tus compras, darte acceso y atender reembolsos.</li>
        <li>Responder tus mensajes.</li>
      </ul>
      <p>Finalidades adicionales, que puedes rechazar sin perder el servicio:</p>
      <ul>
        <li>Mandarte la lista o material que pediste y avisos de cursos nuevos.</li>
        <li>Publicar tu opinión del curso, solo si nos das tu consentimiento expreso al enviarla.</li>
        <li>Medir el uso del sitio para mejorarlo.</li>
      </ul>
      <p>Para negarte a las finalidades adicionales, escríbenos a <Contacto />.</p>

      <h2>Con quién se comparten</h2>
      <p>
        No vendemos ni rentamos tus datos. Los tratan, por cuenta nuestra y solo para lo
        descrito aquí, los proveedores que hacen funcionar el sitio: Supabase (base de datos y
        acceso), Vercel (alojamiento) y Mercado Pago (cobros). Algunos operan fuera de México.
        Fuera de eso, solo los compartiríamos si una autoridad competente lo requiere
        legalmente.
      </p>

      <h2>Tus derechos (ARCO) y cómo ejercerlos</h2>
      <p>
        Puedes acceder a tus datos, corregirlos, pedir que los cancelemos u oponerte a su uso,
        y revocar tu consentimiento. Escribe a <Contacto /> desde el correo de tu cuenta, di qué
        derecho quieres ejercer y sobre qué datos. Te respondemos en un máximo de 20 días
        hábiles y, si procede, lo hacemos efectivo en los 15 días hábiles siguientes.
      </p>

      <h2>Cookies y almacenamiento del navegador</h2>
      <p>
        Usamos una cookie de sesión para mantenerte dentro de tu cuenta. Tus respuestas de
        práctica, tu plan y tus notas sin cuenta se guardan en tu propio navegador
        (almacenamiento local) y no nos llegan. No usamos cookies de publicidad.
      </p>

      <h2>Cambios a este aviso</h2>
      <p>
        Si cambia algo, lo publicamos en esta página con la fecha de actualización de arriba.
      </p>
    </PaginaLegal>
  );
}
