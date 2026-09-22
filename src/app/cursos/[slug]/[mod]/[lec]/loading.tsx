import { Barra } from "@/components/ui";

// Silueta de una lección: cabecera, resultado y los primeros párrafos.
export default function CargandoLeccion() {
  return (
    <>
      <Barra />
      <main id="contenido" className="marco esqueleto-pagina" aria-busy="true" aria-label="Cargando la lección">
        <div className="esqueleto-linea" style={{ width: "45%", height: 12 }} />
        <div className="esqueleto-linea" style={{ width: "24%", height: 12, marginTop: 20 }} />
        <div className="esqueleto-linea" style={{ width: "86%", height: 36, marginTop: 12 }} />
        <div className="esqueleto-bloque" style={{ marginTop: 28 }} />
        {[92, 88, 95, 60].map((w, i) => (
          <div key={i} className="esqueleto-linea" style={{ width: `${w}%`, maxWidth: 680, height: 16, marginTop: 14 }} />
        ))}
      </main>
    </>
  );
}
