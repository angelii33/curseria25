// Aviso en línea: logrado, atención o falla. El tono se dice con el título
// y el icono, no solo con el color de fondo.

const ICONO = { logrado: "✓", atencion: "!", falla: "×" } as const;

export function Aviso({
  tono,
  titulo,
  children,
  vivo = false,
}: {
  tono: "logrado" | "atencion" | "falla";
  titulo: string;
  children?: React.ReactNode;
  /** true: se anuncia al lector de pantalla en cuanto aparece. */
  vivo?: boolean;
}) {
  return (
    <div className={`aviso aviso-${tono}`} role={vivo ? "status" : undefined}>
      <span className="aviso-icono" aria-hidden="true">{ICONO[tono]}</span>
      <div>
        <p className="aviso-titulo">{titulo}</p>
        {children ? <div className="aviso-texto">{children}</div> : null}
      </div>
    </div>
  );
}
