import Link from "next/link";
import { ESCENA_POR_SLUG, escena } from "@/lib/escenas";
import { editorialDe } from "@/lib/editorial";

// «¿Qué necesitas resolver?» — la entrada por problema, no por catálogo.
//
// El dueño del negocio no llega buscando «un curso»: llega porque algo
// concreto no le funciona. Aquí entra por donde le duele, en sus palabras,
// y ve en la misma línea qué curso lo arregla y con qué pieza sale. No es
// un cuestionario ni un filtro: son seis atajos, un toque cada uno.
//
// Un curso sin editorial simplemente no aparece aquí, así que agregar
// cursos nuevos nunca rompe esta sección.

export function SelectorProblema({
  cursos,
}: {
  cursos: { id: string; slug: string; title: string; gratis: number; inscrito: boolean }[];
}) {
  const con = cursos.filter((c) => editorialDe(c.slug));
  if (con.length < 3) return null;

  return (
    <ul className="problemas">
      {con.map((c) => {
        const ed = editorialDe(c.slug)!;
        const tipo = ESCENA_POR_SLUG[c.slug];
        return (
          <li key={c.id}>
            <Link href={`/cursos/${c.slug}`} className="problema">
              {tipo ? (
                <svg viewBox="0 0 56 56" width="40" height="40" aria-hidden="true" className="problema-icono">
                  {escena(tipo, "var(--musgo-600)", "var(--cobre-600)")}
                </svg>
              ) : null}
              <span className="problema-texto">
                <span className="problema-dolor">«{ed.problema}»</span>
                <span className="problema-sol">
                  {c.title}
                  <span className="problema-meta">
                    {" · "}
                    {c.inscrito ? "ya lo tienes" : c.gratis > 0 ? "empieza gratis" : "curso completo"}
                  </span>
                </span>
              </span>
              <span className="problema-flecha" aria-hidden="true">→</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
