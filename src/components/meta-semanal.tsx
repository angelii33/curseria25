// Tu semana: lecciones completadas en los últimos 7 días, contra una meta
// pequeña y alcanzable. Poner una meta concreta ayuda a sostener el ritmo;
// aquí no hay rachas que se «pierden» ni castigos por un día sin avanzar:
// cada punto marca un día en que terminaste algo.

const ZONA = "America/Mexico_City";
const META = 3;

function claveDia(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function MetaSemanal({ fechas }: { fechas: string[] }) {
  const hoy = new Date();
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    return {
      clave: claveDia(d),
      letra: new Intl.DateTimeFormat("es-MX", { timeZone: ZONA, weekday: "narrow" }).format(d).toUpperCase(),
      nombre: new Intl.DateTimeFormat("es-MX", { timeZone: ZONA, weekday: "long" }).format(d),
      hoy: i === 6,
    };
  });
  const porDia = new Map<string, number>();
  for (const f of fechas) {
    const k = claveDia(new Date(f));
    porDia.set(k, (porDia.get(k) ?? 0) + 1);
  }
  const total = fechas.length;
  const cumplida = total >= META;
  const pct = Math.min(100, Math.round((total / META) * 100));

  return (
    <section className="semana" aria-labelledby="semana-titulo">
      <div className="semana-anillo" role="img" aria-label={`${total} de ${META} lecciones esta semana`}>
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="18" className="semana-fondo" />
          <circle
            cx="22"
            cy="22"
            r="18"
            className="semana-avance"
            strokeDasharray={`${(pct / 100) * 113.1} 113.1`}
            transform="rotate(-90 22 22)"
          />
        </svg>
        <span className="semana-cifra">{total}</span>
      </div>
      <div className="semana-texto">
        <p className="t-folio" id="semana-titulo">Tus últimos 7 días</p>
        <p className="semana-titulo">
          {cumplida
            ? `Meta cumplida: ${total} lecciones`
            : total === 0
              ? `Meta sugerida: ${META} lecciones por semana`
              : `${total} de ${META} lecciones · te ${META - total === 1 ? "falta una" : `faltan ${META - total}`}`}
        </p>
        <ol className="semana-dias" aria-label="Días con lecciones completadas">
          {dias.map((d) => {
            const n = porDia.get(d.clave) ?? 0;
            return (
              <li key={d.clave} className={`${n ? "semana-dia-hecho" : ""} ${d.hoy ? "semana-hoy" : ""}`}>
                <span className="semana-punto" aria-hidden="true">{n ? "✓" : ""}</span>
                <span className="semana-letra" aria-hidden="true">{d.letra}</span>
                <span className="sr-only">
                  {d.nombre}: {n ? `${n} ${n === 1 ? "lección" : "lecciones"}` : "sin lecciones"}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
