import { Barra } from "@/components/ui";

// Lo que se ve mientras una página carga: las siluetas de lo que va a
// aparecer, no un spinner. La página ya tiene su forma antes de tener su
// contenido, así que no salta cuando llega.

export default function Cargando() {
  return (
    <>
      <Barra />
      <main id="contenido" className="marco esqueleto-pagina" aria-busy="true" aria-label="Cargando">
        <div className="esqueleto-linea" style={{ width: "30%", height: 14 }} />
        <div className="esqueleto-linea" style={{ width: "78%", height: 44, marginTop: 16 }} />
        <div className="esqueleto-linea" style={{ width: "56%", height: 44, marginTop: 8 }} />
        <div className="rejilla-fichas" style={{ marginTop: 48 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="ficha esqueleto-ficha">
              <div className="esqueleto-banda" />
              <div className="ficha-cuerpo">
                <div className="esqueleto-linea" style={{ width: "40%", height: 12 }} />
                <div className="esqueleto-linea" style={{ width: "80%", height: 24 }} />
                <div className="esqueleto-linea" style={{ width: "92%", height: 14 }} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
