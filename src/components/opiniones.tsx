import { clienteServidor } from "@/lib/supabase/server";

// Opiniones de alumnos reales, aprobadas y con consentimiento (RLS solo deja
// leer las aprobadas). Si no hay ninguna, la sección no existe: nada de
// relleno ni de testimonios de ejemplo.

type Opinion = { id: string; texto: string; nombre_publico: string; negocio: string | null; ciudad: string | null };

export async function Opiniones({ cursoId, titulo = "Lo que dicen quienes ya lo hicieron" }: { cursoId?: string; titulo?: string }) {
  const sb = await clienteServidor();
  let q = sb
    .from("testimonials")
    .select("id,texto,nombre_publico,negocio,ciudad")
    .eq("estado", "aprobado")
    .order("created_at", { ascending: false })
    .limit(6);
  if (cursoId) q = q.eq("course_id", cursoId);
  const { data, error } = await q;
  const lista = (error ? [] : (data ?? [])) as Opinion[];
  if (!lista.length) return null;

  return (
    <section className="seccion seccion-hundida" aria-labelledby="opiniones-titulo">
      <div className="marco">
        <div className="seccion-cab">
          <p className="sobretitulo">Alumnos</p>
          <h2 className="t-titulo-1" id="opiniones-titulo">{titulo}</h2>
        </div>
        <ul className="opiniones">
          {lista.map((o) => (
            <li key={o.id} className="opinion">
              <blockquote className="opinion-texto">«{o.texto}»</blockquote>
              <p className="t-dato opinion-quien">
                <strong>{o.nombre_publico}</strong>
                {o.negocio ? ` · ${o.negocio}` : ""}
                {o.ciudad ? ` · ${o.ciudad}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
