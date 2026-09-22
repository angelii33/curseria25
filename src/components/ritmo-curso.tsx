// El ritmo del curso: una barra por lección, con su duración real.
//
// Responde «¿cuánto me va a tomar?» mejor que un total: se ve que son
// sesiones cortas, que ninguna pasa de media hora y cuál es la gratis. Los
// minutos salen de la base; si una lección no tiene duración, no se dibuja
// inventada: se omite el componente entero.

export function RitmoCurso({
  lecciones,
}: {
  lecciones: { id: string; titulo: string; minutos: number | null; gratis: boolean; hecha: boolean }[];
}) {
  if (lecciones.length < 2 || lecciones.some((l) => !l.minutos)) return null;
  const max = Math.max(...lecciones.map((l) => l.minutos!));
  const total = lecciones.reduce((a, l) => a + l.minutos!, 0);

  return (
    <figure className="ritmo">
      <figcaption className="ritmo-cab">
        <span className="ritmo-total">
          {total}
          <small> min en total</small>
        </span>
        <span className="t-dato ritmo-nota">
          {lecciones.length} sesiones de {Math.min(...lecciones.map((l) => l.minutos!))} a {max} minutos
          {lecciones.length <= 7 ? " · una por día y en una semana lo tienes" : ` · a una por día, unas ${Math.ceil(lecciones.length / 5)} semanas`}
        </span>
      </figcaption>
      <ol className="ritmo-barras" aria-label="Duración de cada lección">
        {lecciones.map((l, i) => (
          <li key={l.id} className={`${l.gratis ? "ritmo-gratis" : ""} ${l.hecha ? "ritmo-hecha" : ""}`}>
            <span className="ritmo-barra" style={{ height: `${Math.round((l.minutos! / max) * 100)}%` }}>
              <span className="ritmo-min">{l.minutos}</span>
            </span>
            <span className="ritmo-num" aria-hidden="true">{i + 1}</span>
            <span className="sr-only">
              Lección {i + 1}, {l.titulo}: {l.minutos} minutos{l.gratis ? ", gratis" : ""}
              {l.hecha ? ", completada" : ""}
            </span>
          </li>
        ))}
      </ol>
      <p className="t-dato ritmo-leyenda" aria-hidden="true">
        <span><i className="ritmo-l ritmo-l-gratis" /> Gratis</span>
        <span><i className="ritmo-l" /> Del curso</span>
        {lecciones.some((l) => l.hecha) ? <span><i className="ritmo-l ritmo-l-hecha" /> Hecha</span> : null}
      </p>
    </figure>
  );
}
