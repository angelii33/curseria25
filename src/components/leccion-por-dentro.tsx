// Una lección por dentro, dibujada en un teléfono.
//
// La Home promete «cada lección termina con algo hecho»; esta ilustración lo
// enseña: resultado arriba, pasos, una plantilla con su botón de copiar y la
// lista de comprobación con dos criterios ya marcados. Reproduce la interfaz
// real de la lección (mismos colores, mismos bloques) — no es una pantalla
// inventada de otro producto. Las anotaciones laterales explican cada parte.

export function LeccionPorDentro() {
  return (
    <figure className="por-dentro">
      <svg
        viewBox="0 0 360 520"
        className="por-dentro-svg"
        role="img"
        aria-label="Así se ve una lección: resultado, pasos, plantilla para copiar y lista de comprobación"
      >
        <rect x={70} y={8} width={220} height={504} rx={30} className="pz-tel" />
        <rect x={80} y={20} width={200} height={480} rx={22} className="pd-pantalla" />
        {/* barra */}
        <circle cx={100} cy={42} r={8} className="pz-sello" />
        <text x={114} y={46} fontSize={11} fontWeight={800} className="pz-t">Listo</text>
        <rect x={80} y={58} width={200} height={1} className="pz-b2" />
        {/* posición */}
        <text x={94} y={78} fontSize={7} fontWeight={700} className="pz-tm">LECCIÓN 1 DE 5</text>
        <rect x={160} y={73} width={70} height={4} rx={2} className="pd-pista" />
        <rect x={160} y={73} width={16} height={4} rx={2} className="pz-musgo" />
        <text x={94} y={98} fontSize={13} fontWeight={800} className="pz-t">Tu menú con link</text>
        <text x={94} y={113} fontSize={13} fontWeight={800} className="pz-t">esta noche</text>
        {/* resultado */}
        <rect x={94} y={124} width={172} height={50} rx={4} className="pz-hoja" />
        <rect x={94} y={124} width={3} height={50} className="pz-cobre" />
        <text x={104} y={137} fontSize={6.5} fontWeight={800} className="pd-cobre">AL TERMINAR VAS A TENER</text>
        <rect x={104} y={144} width={150} height={4} rx={2} className="pz-b" />
        <rect x={104} y={153} width={130} height={4} rx={2} className="pz-b" />
        <rect x={104} y={162} width={90} height={4} rx={2} className="pz-b" />
        {/* pasos */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={94 + i * 58} y={184} width={54} height={40} rx={4} className="pz-post" />
            <circle cx={104 + i * 58} cy={196} r={5} className={i === 2 ? "pz-sello" : "pz-musgo-s"} />
            <rect x={100 + i * 58} y={207} width={40} height={3.5} rx={1.7} className="pz-b" />
            <rect x={100 + i * 58} y={214} width={28} height={3.5} rx={1.7} className="pz-b2" />
          </g>
        ))}
        {/* plantilla */}
        <rect x={94} y={236} width={172} height={80} rx={4} className="pz-hoja" />
        <rect x={94} y={236} width={172} height={16} rx={4} className="pd-cab" />
        <text x={101} y={247} fontSize={6} fontWeight={800} className="pz-tm">PLANTILLA PARA COPIAR</text>
        <rect x={222} y={239} width={38} height={10} rx={3} className="pz-musgo" />
        <text x={228} y={246.5} fontSize={6} fontWeight={800} className="pz-tinv">Copiar</text>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={101} y={262 + i * 12} width={[120, 140, 96, 128][i]} height={4} rx={2} className="pd-mono" />
        ))}
        {/* checklist */}
        <text x={94} y={334} fontSize={7} fontWeight={800} className="pd-musgo">PASO 3 · COMPRUEBA</text>
        <rect x={94} y={340} width={172} height={4} rx={2} className="pd-pista" />
        <rect x={94} y={340} width={86} height={4} rx={2} className="pz-musgo" />
        {[true, true, false, false].map((h, i) => (
          <g key={i}>
            <rect x={94} y={352 + i * 30} width={172} height={25} rx={4} className={h ? "pz-musgo-s" : "pz-post"} />
            <rect x={101} y={359 + i * 30} width={11} height={11} rx={2.5} className={h ? "pz-musgo" : "pd-caja"} />
            {h ? <path d={`M103.5 ${364.5 + i * 30}l2.5 2.5 4-5`} className="pz-check" /> : null}
            <rect x={119} y={360 + i * 30} width={[110, 92, 120, 80][i]} height={4} rx={2} className="pz-b" />
            <rect x={119} y={368 + i * 30} width={70} height={3.5} rx={1.7} className="pz-b2" />
          </g>
        ))}
        {/* siguiente */}
        <rect x={94} y={476} width={172} height={16} rx={4} className="pz-musgo" />
        <text x={130} y={487} fontSize={7} fontWeight={800} className="pz-tinv">Siguiente lección →</text>
      </svg>
      <ul className="por-dentro-notas">
        <li style={{ top: "23%" }}><span>1</span> Con qué sales, antes de empezar</li>
        <li style={{ top: "40%" }}><span>2</span> Tres pasos: entiende, aplica, comprueba</li>
        <li style={{ top: "53%" }}><span>3</span> Plantillas que copias con un toque</li>
        <li style={{ top: "73%" }}><span>4</span> Lista para saber que quedó bien</li>
      </ul>
    </figure>
  );
}
