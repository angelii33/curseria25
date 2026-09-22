// Preguntas frecuentes como acordeón nativo (<details>): se abre con teclado,
// lo anuncia el lector de pantalla y no manda JavaScript al teléfono.

export function Preguntas({ items }: { items: { p: string; r: string }[] }) {
  return (
    <div className="preguntas">
      {items.map((it) => (
        <details key={it.p} className="pregunta">
          <summary>
            <span>{it.p}</span>
            <span className="pregunta-signo" aria-hidden="true" />
          </summary>
          <p className="t-cuerpo">{it.r}</p>
        </details>
      ))}
    </div>
  );
}
