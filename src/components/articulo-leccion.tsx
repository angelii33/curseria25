"use client";

import { useEffect, useRef } from "react";

// El texto de la lección, con sus botones de «Copiar» funcionando.
//
// El HTML viene del servidor (lib/md.ts) y trae los botones ya dibujados con
// `data-copiar`. Aquí solo se escucha el clic —un único listener delegado
// para todo el artículo— y se copia el bloque vecino: la plantilla o el
// mensaje que el alumno va a pegar en WhatsApp, Canva o la IA.
//
// Sin JavaScript el texto se lee igual y se puede seleccionar a mano: el
// botón es una mejora, no un requisito.

export function ArticuloLeccion({ html }: { html: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    const alClic = async (e: MouseEvent) => {
      const boton = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-copiar]");
      if (!boton || !nodo.contains(boton)) return;
      const bloque = boton.closest(".md-codigo, .md-plantilla");
      const fuente = bloque?.querySelector("pre, blockquote") as HTMLElement | null;
      if (!fuente) return;
      const texto = fuente.innerText.trim();
      let ok = false;
      try {
        await navigator.clipboard.writeText(texto);
        ok = true;
      } catch {
        // Navegadores sin permiso de portapapeles: se selecciona el texto
        // para que baste con «copiar» del propio teléfono.
        const rango = document.createRange();
        rango.selectNodeContents(fuente);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(rango);
      }
      const original = boton.dataset.texto ?? boton.textContent ?? "Copiar";
      boton.dataset.texto = original;
      boton.textContent = ok ? "Copiado ✓" : "Seleccionado";
      boton.classList.add("copiar-hecho");
      window.setTimeout(() => {
        boton.textContent = original;
        boton.classList.remove("copiar-hecho");
      }, 2200);
    };

    nodo.addEventListener("click", alClic);
    return () => nodo.removeEventListener("click", alClic);
  }, []);

  return (
    <article ref={ref} className="md" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
