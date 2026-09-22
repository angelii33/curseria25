import { Sello } from "@/components/ui-puro";

// «Lo esencial en 30 segundos»: las ideas que el propio texto marcó como
// clave, juntas al terminar de leer. Resumir al final ayuda a consolidar y
// sirve de acordeón para volver días después sin releer todo.

export function LoEsencial({ ideas, cierre }: { ideas: string[]; cierre: string | null }) {
  if (ideas.length < 2) return null;
  return (
    <section className="esencial" aria-labelledby="esencial-titulo">
      <p className="t-folio esencial-folio">Lo esencial en 30 segundos</p>
      <h2 className="t-titulo-3" id="esencial-titulo">Si solo recuerdas esto, ya sirvió</h2>
      <ol className="esencial-lista">
        {ideas.map((idea) => (
          <li key={idea}>{idea}</li>
        ))}
      </ol>
      {cierre ? (
        <p className="esencial-cierre">
          <Sello estado="logrado" mini /> {cierre}
        </p>
      ) : null}
    </section>
  );
}
