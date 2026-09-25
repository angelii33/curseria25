"use client";

import Link from "next/link";
import { Marca } from "@/components/logo";
import { useEffect } from "react";

// Lo que se ve si algo falla al cargar una página. Nunca «Error 500»:
// qué pasó en palabras normales, y dos salidas claras.
//
// Es Client Component (así lo exige Next) y por eso no usa la Barra, que lee
// la sesión en el servidor: aquí va una cabecera mínima con la marca.

export default function ErrorPagina({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <header className="barra">
        <div className="barra-in">
          <Link href="/" className="marca-enlace">
            <Marca />
          </Link>
        </div>
      </header>
      <main id="contenido" className="marco estado-pagina">
        <p className="sobretitulo">Algo no salió bien</p>
        <h1 className="t-titulo-1">No pudimos cargar esta página</h1>
        <p className="t-lectura">
          Suele ser la conexión o un tropiezo nuestro de un momento. Tu avance está
          guardado: no perdiste nada. Inténtalo de nuevo.
        </p>
        <div className="acciones">
          <button type="button" className="btn btn-primario" onClick={() => retry()}>
            Volver a intentar
          </button>
          <Link className="btn btn-secundario" href="/">Ir a los cursos</Link>
        </div>
        {error.digest ? (
          <p className="t-dato estado-codigo">Si nos escribes, menciona este código: {error.digest}</p>
        ) : null}
      </main>
    </>
  );
}
