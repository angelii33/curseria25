import { Barra } from "@/components/ui";

// Silueta de la página de curso: texto a la izquierda, portada a la derecha.
export default function CargandoCurso() {
  return (
    <>
      <Barra />
      <main id="contenido" className="marco esqueleto-pagina esqueleto-curso" aria-busy="true" aria-label="Cargando el curso">
        <div>
          <div className="esqueleto-linea" style={{ width: "30%", height: 12 }} />
          <div className="esqueleto-linea" style={{ width: "90%", height: 48, marginTop: 16 }} />
          <div className="esqueleto-linea" style={{ width: "70%", height: 48, marginTop: 8 }} />
          <div className="esqueleto-linea" style={{ width: "84%", height: 18, marginTop: 24 }} />
          <div className="esqueleto-linea" style={{ width: "60%", height: 18, marginTop: 10 }} />
        </div>
        <div className="esqueleto-banda esqueleto-portada" />
      </main>
    </>
  );
}
