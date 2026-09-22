import Link from "next/link";
import { folio } from "@/lib/catalogo";
import { Sello } from "@/components/ui-puro";

// El temario del curso: módulos y lecciones.
//
// Cada fila dice con qué sales de esa lección (el `outcome` de la base), no
// solo cómo se llama. Es lo que convierte un índice en una lista de
// entregables. El estado se comunica con el sello Y con texto: «Gratis»,
// «Hecha», «Del curso completo» — nunca solo con color u opacidad.

type Leccion = {
  id: string;
  title: string;
  sort_order: number;
  is_preview: boolean;
  duration_minutes: number | null;
  outcome: string | null;
};

export function Temario({
  slug,
  modulos,
  inscrito,
  hechas,
  siguienteId,
}: {
  slug: string;
  modulos: {
    id: string;
    title: string;
    sort_order: number;
    capability: string | null;
    lecciones: Leccion[];
  }[];
  inscrito: boolean;
  hechas: Set<string>;
  /** La lección con la que sigue el inscrito, para marcarla. */
  siguienteId?: string | null;
}) {
  const varios = modulos.length > 1;
  return (
    <div className="temario">
      {modulos.map((m) => (
        <section key={m.id} className="modulo" aria-labelledby={`mod-${m.id}`}>
          {varios ? (
            <header className="modulo-cab">
              <p className="t-folio">Módulo {String(m.sort_order).padStart(2, "0")}</p>
              <h3 className="t-titulo-3" id={`mod-${m.id}`}>
                {m.title.replace(/^Módulo \d+\s*·\s*/, "")}
              </h3>
              {m.capability ? <p className="t-dato modulo-cap">Aprendes a: {m.capability.toLowerCase()}</p> : null}
            </header>
          ) : (
            <h3 className="sr-only" id={`mod-${m.id}`}>Lecciones</h3>
          )}
          <ol className="lecciones">
            {m.lecciones.map((l) => {
              const hecha = hechas.has(l.id);
              const abierta = inscrito || l.is_preview;
              const sigue = l.id === siguienteId;
              const estado = hecha ? "Hecha" : !abierta ? "Del curso completo" : !inscrito ? "Gratis" : sigue ? "Sigue" : null;
              const cuerpo = (
                <>
                  <Sello estado={hecha ? "logrado" : abierta ? "pendiente" : "bloqueado"} />
                  <span className="fila-cuerpo">
                    <span className="t-folio">{folio(m.sort_order, l.sort_order)}</span>
                    <span className="fila-titulo">{l.title}</span>
                    {l.outcome ? (
                      <span className="fila-sales">
                        <span className="fila-sales-et">Sales con</span> {l.outcome}
                      </span>
                    ) : null}
                  </span>
                  <span className="fila-meta">
                    {estado ? (
                      <span className={`etiqueta etiqueta-${hecha ? "hecha" : !abierta ? "cerrada" : sigue ? "sigue" : "gratis"}`}>
                        {estado}
                      </span>
                    ) : null}
                    {l.duration_minutes ? <span className="t-dato">{l.duration_minutes} min</span> : null}
                  </span>
                </>
              );
              return (
                <li key={l.id}>
                  {abierta ? (
                    <Link
                      className={`fila ${hecha ? "fila-hecha" : ""} ${sigue ? "fila-sigue" : ""}`}
                      href={`/cursos/${slug}/${m.sort_order}/${l.sort_order}`}
                    >
                      {cuerpo}
                    </Link>
                  ) : (
                    <div className="fila fila-cerrada">{cuerpo}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
