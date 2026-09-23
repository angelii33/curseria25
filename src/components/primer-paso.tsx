import Link from "next/link";
import { guardarObjetivo } from "@/app/acciones";
import { OBJETIVOS, type Objetivo } from "@/lib/objetivos";

type Curso = { slug: string; title: string; abiertaRuta: string | null; abiertaTitulo: string | null; abiertaMin: number | null };

// Para quien todavía no empieza: una sola pregunta y un solo siguiente paso.
// La respuesta se guarda en user_goals y decide qué curso recomendar.

export function PrimerPaso({ objetivo, cursos, cambiando }: { objetivo: Objetivo | null; cursos: Curso[]; cambiando: boolean }) {
  if (!objetivo || cambiando) {
    return (
      <section className="primer-paso" aria-labelledby="primer-paso-titulo">
        <p className="t-folio">Para empezar</p>
        <h2 className="t-titulo-2" id="primer-paso-titulo">¿Qué quieres conseguir primero?</h2>
        <p className="t-cuerpo primer-paso-nota">Elige una. Te decimos por dónde empezar; puedes cambiarla cuando quieras.</p>
        <form action={guardarObjetivo} className="primer-paso-opciones">
          {(Object.keys(OBJETIVOS) as Objetivo[]).map((k) => (
            <button key={k} type="submit" name="objetivo" value={k} className={`primer-paso-opcion ${k === objetivo ? "primer-paso-actual" : ""}`}>
              <strong>{OBJETIVOS[k].titulo}</strong>
              <span className="t-dato">{OBJETIVOS[k].detalle}</span>
            </button>
          ))}
        </form>
      </section>
    );
  }

  const o = OBJETIVOS[objetivo];
  const recomendado = o.cursos.map((s) => cursos.find((c) => c.slug === s)).find((c) => c?.abiertaRuta) ?? null;
  return (
    <section className="primer-paso primer-paso-listo" aria-labelledby="primer-paso-titulo">
      <p className="t-folio">Tu objetivo: {o.titulo.toLowerCase()}</p>
      {recomendado ? (
        <>
          <h2 className="t-titulo-2" id="primer-paso-titulo">Tu primer paso: {recomendado.title}</h2>
          <p className="t-cuerpo primer-paso-nota">
            Empieza por la lección gratis «{recomendado.abiertaTitulo}»
            {recomendado.abiertaMin ? `, unos ${recomendado.abiertaMin} minutos` : ""}. Al terminarla ya tienes algo
            funcionando en tu negocio.
          </p>
          <div className="acciones">
            <Link className="btn btn-primario" href={recomendado.abiertaRuta!}>Empezar la lección gratis</Link>
            <Link className="btn btn-fantasma" href="/mi-aprendizaje?objetivo=cambiar">Cambiar objetivo</Link>
          </div>
        </>
      ) : (
        <h2 className="t-titulo-2" id="primer-paso-titulo">Revisa los cursos de abajo para empezar</h2>
      )}
    </section>
  );
}
