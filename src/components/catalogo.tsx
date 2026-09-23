"use client";

import { useMemo, useState } from "react";

// Buscador y filtro por etapa del catálogo. Las fichas llegan ya dibujadas
// desde el servidor; aquí solo se decide cuáles se muestran. Sin JavaScript
// (o antes de hidratar) se ven todas, agrupadas como siempre.

export type ItemCatalogo = { id: string; etapa: string | null; texto: string; ficha: React.ReactNode };
export type GrupoCatalogo = { etapa: string; titulo: string; nota: string };

const normal = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ ]/g, " ");

const SUGERENCIAS = ["Google", "WhatsApp", "clientes", "cotización", "redes sociales", "IA"];

export function Catalogo({ grupos, items }: { grupos: GrupoCatalogo[]; items: ItemCatalogo[] }) {
  const [q, setQ] = useState("");
  const [etapa, setEtapa] = useState<string | null>(null);

  const visibles = useMemo(() => {
    const palabras = normal(q).split(/\s+/).filter((p) => p.length > 1);
    return new Set(
      items
        .filter((it) => (etapa ? it.etapa === etapa : true))
        .filter((it) => {
          const t = normal(it.texto);
          // Basta con que coincida el inicio de una palabra: «cotiz» encuentra
          // «cotización» y «cotizar».
          return palabras.every((p) => t.split(/\s+/).some((w) => w.startsWith(p)));
        })
        .map((it) => it.id)
    );
  }, [q, etapa, items]);

  const filtrando = q.trim() !== "" || etapa !== null;
  const sinGrupo = items.filter((it) => !it.etapa);

  return (
    <div className="catalogo">
      <div className="catalogo-herramientas" role="search">
        <label className="catalogo-buscar">
          <span className="sr-only">Buscar un curso por problema o tema</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="catalogo-lupa">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            className="campo"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="¿Qué quieres resolver? Ej.: Google, WhatsApp, clientes"
            autoComplete="off"
            enterKeyHint="search"
          />
        </label>
        <div className="catalogo-chips" role="group" aria-label="Filtrar por etapa">
          <button type="button" className={`plan-chip ${etapa === null ? "plan-chip-activo" : ""}`} aria-pressed={etapa === null} onClick={() => setEtapa(null)}>
            Todos
          </button>
          {grupos.map((g) => (
            <button
              key={g.etapa}
              type="button"
              className={`plan-chip ${etapa === g.etapa ? "plan-chip-activo" : ""}`}
              aria-pressed={etapa === g.etapa}
              onClick={() => setEtapa(etapa === g.etapa ? null : g.etapa)}
            >
              {g.titulo}
            </button>
          ))}
        </div>
      </div>

      <p className="t-dato catalogo-cuenta" aria-live="polite">
        {filtrando ? `${visibles.size} ${visibles.size === 1 ? "curso" : "cursos"} para «${q.trim() || grupos.find((g) => g.etapa === etapa)?.titulo}»` : ""}
      </p>

      {visibles.size === 0 ? (
        <div className="catalogo-vacio">
          <p className="t-titulo-4">No encontramos un curso con «{q.trim()}»</p>
          <p className="t-cuerpo">Prueba con el problema que tienes, por ejemplo:</p>
          <div className="catalogo-chips">
            {SUGERENCIAS.map((s) => (
              <button key={s} type="button" className="plan-chip" onClick={() => { setQ(s); setEtapa(null); }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {grupos.map((g, i) => {
        const suyos = items.filter((it) => it.etapa === g.etapa && visibles.has(it.id));
        if (!suyos.length) return null;
        return (
          <div key={g.etapa} className="etapa">
            <div className="etapa-cab">
              <span className="etapa-num" aria-hidden="true">{i + 1}</span>
              <div>
                <h3 className="t-titulo-2">{g.titulo}</h3>
                <p className="t-cuerpo etapa-nota">{g.nota}</p>
              </div>
            </div>
            <div className="rejilla-fichas">{suyos.map((it) => <div key={it.id} className="catalogo-item">{it.ficha}</div>)}</div>
          </div>
        );
      })}

      {sinGrupo.some((it) => visibles.has(it.id)) ? (
        <div className="rejilla-fichas">
          {sinGrupo.filter((it) => visibles.has(it.id)).map((it) => <div key={it.id} className="catalogo-item">{it.ficha}</div>)}
        </div>
      ) : null}
    </div>
  );
}
