import Link from "next/link";
import { Barra, Perforacion } from "@/components/ui";
import { IconoPaginaFueraDeSitio } from "@/components/iconos-estado";

export default function NoEncontrado() {
  return (
    <>
      <Barra />
      <main className="marco" style={{ paddingBlock: "var(--e-9)" }}>
        <IconoPaginaFueraDeSitio />
        <div className="t-folio" style={{ marginTop: "var(--e-4)" }}>Error 404</div>
        <h1 className="t-titulo-1" style={{ marginTop: "var(--e-3)" }}>
          Esta página no existe
        </h1>
        <Perforacion />
        <p className="t-lectura">
          Puede que el curso se haya despublicado o que el enlace esté mal escrito.
        </p>
        <p style={{ marginTop: "var(--e-6)" }}>
          <Link className="btn btn-primario" href="/">Ver el catálogo</Link>
        </p>
      </main>
    </>
  );
}
