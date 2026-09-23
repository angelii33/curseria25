import Link from "next/link";
import { emitirCertificado } from "@/app/acciones";
import { folio } from "@/lib/catalogo";

// Qué ve quien terminó todas las lecciones. El certificado exige también
// los quizzes aprobados (lo valida issue_certificate); si falta alguno, se
// dice cuál y se lleva directo a él, en vez de un botón que falla.

export function CierreCurso({
  slug,
  cursoId,
  total,
  pendientes,
  bloque = false,
}: {
  slug: string;
  cursoId: string;
  total: number;
  pendientes: { mod: number; lec: number; titulo: string }[];
  bloque?: boolean;
}) {
  if (pendientes.length > 0) {
    const p = pendientes[0];
    return (
      <div className="cierre-curso">
        <p className="t-cuerpo">
          Terminaste las {total} lecciones. Para tu certificado solo falta{" "}
          {pendientes.length === 1 ? "aprobar un quiz" : `aprobar ${pendientes.length} quizzes`}:
        </p>
        <ul className="cierre-curso-lista">
          {pendientes.map((q) => (
            <li key={`${q.mod}-${q.lec}`}>
              <span className="t-folio">{folio(q.mod, q.lec)}</span> {q.titulo}
            </li>
          ))}
        </ul>
        <Link className={`btn btn-primario ${bloque ? "btn-bloque" : ""}`} href={`/cursos/${slug}/${p.mod}/${p.lec}#quiz`}>
          Ir al quiz
        </Link>
      </div>
    );
  }
  return (
    <div className="cierre-curso">
      <p className="t-cuerpo">Terminaste las {total} lecciones. Tu certificado ya está listo.</p>
      <form action={emitirCertificado}>
        <input type="hidden" name="curso_id" value={cursoId} />
        <button className={`btn btn-primario ${bloque ? "btn-bloque" : ""}`} type="submit">
          Ver mi certificado
        </button>
      </form>
    </div>
  );
}
