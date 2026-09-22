import { Pieza } from "@/components/pieza";

// La pieza con su lista de partes al lado. Es la vista de
// PROGRESO → CONSTRUCCIÓN → RESULTADO del curso.
//
// modo "venta":  todo dibujado; la lista dice qué lección construye qué.
// modo "avance": cada parte con su estado real (hecha / esta lección /
//                pendiente). El estado se dice con texto e icono, nunca
//                solo con color.

export type Parte = { titulo: string; hecha: boolean };

export function PiezaPartes({
  slug,
  nombre,
  partes,
  modo,
  actual = null,
  etiquetaParte = "Lección",
}: {
  slug: string;
  nombre: string;
  partes: Parte[];
  modo: "venta" | "avance";
  /** Índice de la parte que construye la lección abierta. */
  actual?: number | null;
  /** «Lección» o «Módulo», según cómo se reparten las partes. */
  etiquetaParte?: string;
}) {
  const estados = partes.map((p, i) =>
    modo === "venta" ? "hecha" : i === actual ? "actual" : p.hecha ? "hecha" : "pendiente"
  ) as ("hecha" | "actual" | "pendiente")[];
  const hechas = partes.filter((p) => p.hecha).length;
  const etiqueta =
    modo === "venta"
      ? `${nombre}, terminada`
      : `${nombre}: ${hechas} de ${partes.length} partes construidas`;

  return (
    <div className={`pp pp-${modo}`}>
      <figure className="pp-figura">
        <Pieza slug={slug} estados={estados} etiqueta={etiqueta} />
        {modo === "avance" ? (
          <figcaption className="t-dato pp-cuenta">
            {hechas === partes.length
              ? "Pieza terminada"
              : `${hechas} de ${partes.length} partes construidas`}
          </figcaption>
        ) : null}
      </figure>
      <ol className="pp-lista">
        {partes.map((p, i) => {
          const e = estados[i];
          return (
            <li key={p.titulo} className={`pp-item pp-item-${e}`}>
              <span className="pp-marca" aria-hidden="true">
                {modo === "avance" && e === "hecha" ? "✓" : i + 1}
              </span>
              <span className="pp-texto">
                <span className="pp-leccion">
                  {etiquetaParte} {i + 1}
                  {modo === "avance" ? (
                    <span className="pp-estado">
                      {" · "}
                      {e === "hecha" ? "hecha" : e === "actual" ? "estás aquí" : "pendiente"}
                    </span>
                  ) : null}
                </span>
                <span className="pp-titulo">{p.titulo}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
