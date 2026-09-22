import Link from "next/link";
import { Barra, Pie } from "@/components/ui";
import { IconoPaginaFueraDeSitio } from "@/components/iconos-estado";

export default function NoEncontrado() {
  return (
    <>
      <Barra />
      <main id="contenido" className="marco estado-pagina">
        <IconoPaginaFueraDeSitio />
        <p className="sobretitulo">Página no encontrada</p>
        <h1 className="t-titulo-1">Esta página no existe (o ya no)</h1>
        <p className="t-lectura">
          Puede que el curso se haya despublicado o que el enlace esté mal escrito.
          Los cursos siguen donde siempre.
        </p>
        <div className="acciones">
          <Link className="btn btn-primario" href="/#cursos">Ver los cursos</Link>
          <Link className="btn btn-secundario" href="/mi-aprendizaje">Ir a mi aprendizaje</Link>
        </div>
      </main>
      <Pie />
    </>
  );
}
