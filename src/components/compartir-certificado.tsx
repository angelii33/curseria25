"use client";

import { useState } from "react";
import { MARCA } from "@/lib/marca";

// Compartir el certificado donde sí lo ve un cliente: WhatsApp (estado o
// chat), LinkedIn (sección de licencias y certificaciones) o el enlace.

export function CompartirCertificado({
  url,
  curso,
  codigo,
  emitido,
}: {
  url: string;
  curso: string;
  codigo: string;
  emitido: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const texto = `Terminé el curso «${curso}» en ${MARCA.nombre}. Aquí se puede verificar: ${url}`;
  const f = new Date(emitido);
  const linkedin =
    "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME" +
    `&name=${encodeURIComponent(curso)}` +
    `&organizationName=${encodeURIComponent(MARCA.nombre)}` +
    `&issueYear=${f.getFullYear()}&issueMonth=${f.getMonth() + 1}` +
    `&certUrl=${encodeURIComponent(url)}&certId=${encodeURIComponent(codigo)}`;

  return (
    <section className="compartir" aria-labelledby="compartir-titulo">
      <h2 className="t-titulo-4" id="compartir-titulo">Enséñalo</h2>
      <div className="compartir-botones">
        <a className="btn btn-primario" href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer">
          Compartir por WhatsApp
        </a>
        <a className="btn btn-secundario" href={linkedin} target="_blank" rel="noopener noreferrer">
          Agregar a LinkedIn
        </a>
        <button
          type="button"
          className="btn btn-fantasma"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 1800);
            } catch {}
          }}
        >
          <span aria-live="polite">{copiado ? "Enlace copiado ✓" : "Copiar enlace"}</span>
        </button>
      </div>
    </section>
  );
}
