import Link from "next/link";
import { usuarioActual } from "@/lib/supabase/server";
import { salir } from "@/app/acciones";
import { MARCA } from "@/lib/marca";

export { Perforacion, Sello, Insignia } from "@/components/ui-puro";

export async function Barra({ volver }: { volver?: { href: string; texto: string } }) {
  const usuario = await usuarioActual();
  return (
    <header className="barra">
      <div className="barra-in">
        <Link href="/" className="marca">{MARCA.nombre}</Link>
        <nav className="barra-nav">
          {volver && <Link href={volver.href} className="volver">{volver.texto}</Link>}
          {usuario ? (
            <>
              <Link href="/mi-aprendizaje" className="volver">Mi aprendizaje</Link>
              <form action={salir}>
                <button className="volver" type="submit">Salir</button>
              </form>
            </>
          ) : (
            <Link href="/entrar" className="volver">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
export function Pie() {
  return (
    <footer className="pie">
      <div className="marco pie-in">
        <div>
          <div className="marca-pie">{MARCA.nombre}</div>
          <p className="t-dato" style={{ marginTop: "var(--e-3)", color: "var(--musgo-300)" }}>
            {MARCA.eslogan} Para dueños de negocio en México.
          </p>
        </div>
        <nav className="pie-enlaces">
          <Link href="/">Cursos</Link>
          <Link href="/mi-aprendizaje">Mi aprendizaje</Link>
        </nav>
      </div>
    </footer>
  );
}
