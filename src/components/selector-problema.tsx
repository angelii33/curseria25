import Link from "next/link";
import { ESCENA_POR_SLUG, PROBLEMA_POR_SLUG, escena } from "@/lib/escenas";

// "¿Qué necesitas resolver?" — la entrada por problema, no por catálogo.
//
// El comprador no llega buscando "un curso": llega porque algo concreto no
// le funciona. Esta franja le deja entrar por donde le duele, en sus
// palabras, y lo lleva directo al curso que lo arregla. No es un filtro ni
// una categoría nueva: son enlaces a los mismos 6 cursos que ya existen.
//
// Un curso sin escena o sin problema definido simplemente no aparece aquí,
// así que agregar cursos nuevos nunca rompe esta sección.

export function SelectorProblema({
  cursos,
}: {
  cursos: { id: string; slug: string }[];
}) {
  const conProblema = cursos.filter(
    (c) => ESCENA_POR_SLUG[c.slug] && PROBLEMA_POR_SLUG[c.slug]
  );
  if (conProblema.length < 3) return null;

  return (
    <section className="selector" aria-labelledby="selector-titulo">
      <h2 className="t-titulo-4" id="selector-titulo">
        ¿Qué necesitas resolver?
      </h2>
      <div className="selector-rejilla">
        {conProblema.map((c) => (
          <Link key={c.id} href={`/cursos/${c.slug}`} className="selector-ficha">
            <svg
              viewBox="0 0 56 56"
              width="30"
              height="30"
              role="img"
              aria-hidden="true"
              className="selector-icono"
            >
              {escena(ESCENA_POR_SLUG[c.slug], "var(--musgo-600)", "var(--cobre-600)")}
            </svg>
            <span className="t-interfaz">{PROBLEMA_POR_SLUG[c.slug]}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
