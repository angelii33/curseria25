import { misLogros } from "@/lib/logros";

// Progreso que significa algo: XP que solo sale de terminar lecciones y
// aprobar quizzes, días seguidos con avance real e insignias por hitos.
// Nada se gana por abrir la app.

/** «Completaste 5 lecciones» → «Completa 5 lecciones»: lo que falta se dice como meta. */
const comoMeta = (d: string) =>
  d.replace(/^Completaste/, "Completa").replace(/^Aprobaste/, "Aprueba").replace(/^Comenzaste/, "Empieza");

export async function Logros() {
  const l = await misLogros();
  const ganadas = l.insignias.filter((i) => i.ganada).length;
  const proxima = l.insignias.find((i) => !i.ganada);

  return (
    <section className="logros" aria-labelledby="logros-titulo">
      <h2 className="sr-only" id="logros-titulo">Tus logros</h2>
      <div className="logros-cifras">
        <div className="logro-cifra">
          <span className="t-folio">Nivel {l.nivel}</span>
          <strong>{l.xp} XP</strong>
          <span className="logro-barra" aria-hidden="true">
            <span style={{ width: `${l.pct}%` }} />
          </span>
          <span className="t-dato">
            {l.siguiente === null ? "Nivel máximo" : `${l.faltan} XP para el nivel ${l.nivel + 1}`}
          </span>
        </div>
        <div className="logro-cifra">
          <span className="t-folio">Racha</span>
          <strong>
            {l.racha} {l.racha === 1 ? "día" : "días"}
          </strong>
          <span className="t-dato">
            {l.racha === 0 ? "Completa una lección hoy para empezarla" : "seguidos con una lección hecha"}
          </span>
        </div>
        <div className="logro-cifra">
          <span className="t-folio">Lecciones</span>
          <strong>{l.lecciones}</strong>
          <span className="t-dato">completadas en total</span>
        </div>
      </div>

      <div className="insignias-cab">
        <p className="t-folio">
          Insignias · {ganadas} de {l.insignias.length}
        </p>
        {proxima ? <p className="t-dato">Siguiente: {proxima.titulo}: {comoMeta(proxima.descripcion).toLowerCase()}</p> : null}
      </div>
      <ul className="insignias">
        {l.insignias.map((i) => (
          <li key={i.code} className={`insignia-item ${i.ganada ? "insignia-ganada" : ""}`}>
            <span className="insignia-sello" aria-hidden="true">{i.ganada ? "✓" : ""}</span>
            <span>
              <strong>{i.titulo}</strong>
              <span className="t-dato">{i.ganada ? "Ganada" : comoMeta(i.descripcion)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
