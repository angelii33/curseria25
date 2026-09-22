import { Barra, Pie } from "@/components/ui";
import { LEGAL } from "@/lib/legal";

export function PaginaLegal({
  sobretitulo,
  titulo,
  children,
}: {
  sobretitulo: string;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Barra />
      <main id="contenido" className="seccion">
        <article className="marco marco-texto legal">
          <p className="sobretitulo">{sobretitulo}</p>
          <h1 className="t-titulo-1">{titulo}</h1>
          <p className="t-dato legal-fecha">Última actualización: {LEGAL.actualizado}</p>
          {children}
        </article>
      </main>
      <Pie />
    </>
  );
}

/** Correo de contacto como enlace, o el aviso de que falta publicarlo. */
export function Contacto() {
  return LEGAL.correo ? (
    <a href={`mailto:${LEGAL.correo}`}>{LEGAL.correo}</a>
  ) : (
    <span>el correo de contacto (dato por publicar)</span>
  );
}
