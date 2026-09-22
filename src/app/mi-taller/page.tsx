import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { clienteServidor, usuarioActual } from "@/lib/supabase/server";
import { Barra, Pie } from "@/components/ui";
import { BotonCopiar } from "@/components/boton-copiar";
import { cambiarEstadoTaller } from "@/app/acciones";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi taller",
  robots: { index: false, follow: false },
};

const ESTADOS = [
  { v: "draft", t: "Borrador" },
  { v: "ready", t: "Listo" },
  { v: "in_use", t: "Ya lo uso" },
] as const;

type Fila = {
  id: string;
  title: string;
  content: string;
  state: string;
  updated_at: string;
  version: number;
  lessons: {
    title: string;
    sort_order: number;
    course_modules: { sort_order: number; courses: { slug: string; title: string } | null } | null;
  } | null;
};

// Todo lo que el alumno escribió en los cuadernos de las lecciones, en un solo
// lugar: su versión del mensaje, del menú, de la cotización. RLS garantiza
// que cada quien ve solo lo suyo.
export default async function MiTaller() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/entrar?volver=/mi-taller");

  const sb = await clienteServidor();
  const { data } = await sb
    .from("user_assets")
    .select("id,title,content,state,updated_at,version,lessons(title,sort_order,course_modules(sort_order,courses(slug,title)))")
    .order("updated_at", { ascending: false });
  const filas = ((data ?? []) as unknown as Fila[]).filter((f) => f.content.trim());
  const fecha = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" });

  return (
    <>
      <Barra volver={{ href: "/mi-aprendizaje", texto: "Mi aprendizaje" }} />
      <main id="contenido" className="seccion pagina-taller">
        <div className="marco">
          <div className="seccion-cab">
            <p className="sobretitulo">Mi taller</p>
            <h1 className="t-titulo-1">Lo que ya escribiste para tu negocio</h1>
            <p className="t-lectura seccion-bajada">
              Cada vez que escribes en el cuaderno de una lección, queda aquí. Cópialo, pégalo
              donde va y márcalo cuando ya lo estés usando.
            </p>
          </div>

          {filas.length === 0 ? (
            <div className="vacio">
              <p className="t-titulo-4">Todavía no hay nada en tu taller</p>
              <p className="t-cuerpo">
                Abre una lección y escribe tu versión en «Tu cuaderno». Se guarda aquí sola.
              </p>
              <div className="acciones">
                <Link className="btn btn-primario" href="/mi-aprendizaje">Ir a mis cursos</Link>
              </div>
            </div>
          ) : (
            <ul className="taller">
              {filas.map((f) => {
                const curso = f.lessons?.course_modules?.courses ?? null;
                const ruta =
                  curso && f.lessons?.course_modules
                    ? `/cursos/${curso.slug}/${f.lessons.course_modules.sort_order}/${f.lessons.sort_order}#aplica`
                    : null;
                return (
                  <li key={f.id} className="taller-item">
                    <div className="taller-cab">
                      <div>
                        <p className="t-folio">{curso?.title ?? "Lección"}</p>
                        <h2 className="t-titulo-4 taller-titulo">{f.title}</h2>
                      </div>
                      <span className="t-dato taller-fecha">
                        {fecha.format(new Date(f.updated_at))} · v{f.version}
                      </span>
                    </div>
                    <pre className="taller-texto">{f.content}</pre>
                    <div className="taller-pie">
                      <BotonCopiar texto={f.content} />
                      {ruta ? <Link className="btn btn-fantasma" href={ruta}>Editar en la lección</Link> : null}
                      <form action={cambiarEstadoTaller} className="taller-estados" aria-label="Estado">
                        <input type="hidden" name="id" value={f.id} />
                        {ESTADOS.map((e) => (
                          <button
                            key={e.v}
                            name="estado"
                            value={e.v}
                            type="submit"
                            className={`plan-chip ${f.state === e.v ? "plan-chip-activo" : ""}`}
                            aria-pressed={f.state === e.v}
                          >
                            {e.t}
                          </button>
                        ))}
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
      <Pie />
    </>
  );
}
