import { IconoProceso } from "@/components/iconos-proceso";

// Los tres pasos de la lección: Entiende → Aplica → Comprueba.
//
// Va ANTES del texto, no después, y es deliberado: quien abre una lección
// gratuita todavía no sabe si le va a servir. Ver de entrada que hay un
// camino corto y con final — y cuál es el final— es lo que hace que empiece
// a leer en vez de irse.
//
// El texto de cada paso sale de los datos reales de la lección. Si un dato
// no está en la base, el paso cae a una redacción neutra que no promete
// nada concreto. Nunca se inventa un resultado.
//
// Server Component: tres tarjetas de texto no necesitan JavaScript.

export function FlujoLeccion({
  resultado,
  mision,
  criterios,
  tieneQuiz,
  primeraSeccion,
}: {
  /** `outcome` de la lección. */
  resultado: string | null;
  /** Título de la misión, si la lección tiene una. */
  mision: string | null;
  /** Cuántos criterios de revisión hay. Decide el texto del paso 3. */
  criterios: number;
  tieneQuiz: boolean;
  /** Ancla de la primera sección del texto. Con ella, cada paso es un
   *  enlace que lleva a su parte de la lección — un stepper sin una sola
   *  línea de JavaScript. */
  primeraSeccion: string | null;
}) {
  const pasos: { titulo: string; texto: string; paso: 1 | 2 | 3; href: string | null }[] = [
    {
      paso: 1,
      href: primeraSeccion ? `#${primeraSeccion}` : null,
      titulo: "Entiende",
      texto:
        "Lee la explicación de abajo. Está escrita con casos de negocios reales, no con ejemplos de manual.",
    },
    {
      paso: 2,
      href: "#aplica",
      titulo: "Aplica",
      // El título de la misión es una afirmación ("Tu negocio ya tiene
      // dueño en Google: tú."), no una tarea. Se cita tal cual, sin pasarlo
      // a minúsculas: eso rompía nombres propios ("google") y duplicaba el
      // punto final.
      texto: mision
        ? `Trabaja con tu propio negocio hasta poder decir: \u201c${mision.replace(/\.$/, "")}\u201d.`
        : "Haz el ejercicio con tus propios datos mientras lees, no después.",
    },
    {
      paso: 3,
      href: "#comprueba",
      titulo: "Comprueba",
      texto:
        criterios > 0
          ? `Revisa tu resultado contra ${criterios === 1 ? "el criterio" : `los ${criterios} criterios`} de la lista.`
          : tieneQuiz
            ? "Contesta el quiz del final para confirmar que quedó claro."
            : "Compara lo que te quedó con el resultado descrito arriba.",
    },
  ];

  return (
    <section className="flujo" aria-labelledby="flujo-titulo">
      <h2 className="t-folio" id="flujo-titulo">
        Cómo se trabaja esta lección
      </h2>
      <ol className="flujo-pasos">
        {pasos.map((p) => (
          <li key={p.paso}>
            {/* Cada paso es un enlace a su parte de la lección. Si falta el
                destino, se dibuja igual pero sin enlace: nunca un href roto. */}
            {p.href ? (
              <a href={p.href} className="flujo-paso flujo-paso-enlace">
                <IconoProceso paso={p.paso} />
                <div>
                  <p className="t-folio flujo-num">
                    Paso {p.paso} <span aria-hidden="true">·</span> {p.titulo}
                  </p>
                  <p className="t-cuerpo flujo-texto">{p.texto}</p>
                </div>
              </a>
            ) : (
              <div className="flujo-paso">
                <IconoProceso paso={p.paso} />
                <div>
                  <p className="t-folio flujo-num">
                    Paso {p.paso} <span aria-hidden="true">·</span> {p.titulo}
                  </p>
                  <p className="t-cuerpo flujo-texto">{p.texto}</p>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>
      {resultado ? (
        <p className="t-dato flujo-cierre">
          Sales con esto hecho, no con apuntes.
        </p>
      ) : null}
    </section>
  );
}
