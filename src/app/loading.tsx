import { Barra } from "@/components/ui";

// Lo que se ve mientras una página carga.
//
// Sin esto, navegar con señal lenta no muestra nada del producto: el
// navegador se queda en la página anterior y parece trabado. En vez de un
// spinner genérico —que no dice nada de la marca— se dibujan las siluetas
// vacías de las mismas fichas que van a aparecer: la página ya tiene su
// forma antes de tener su contenido, así que no salta cuando llega.

export default function Cargando() {
  return (
    <>
      <Barra />
      <main className="marco" style={{ paddingBlock: "var(--e-8)" }}>
        <div className="esqueleto-linea" style={{ width: "34%", height: 14 }} />
        <div
          className="esqueleto-linea"
          style={{ width: "72%", height: 38, marginTop: "var(--e-4)" }}
        />

        <div className="catalogo" style={{ marginTop: "var(--e-8)" }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="superficie curso curso-con-portada">
              <div className="esqueleto-banda" />
              <div className="curso-cuerpo">
                <div className="esqueleto-linea" style={{ width: "76%", height: 24 }} />
                <div
                  className="esqueleto-linea"
                  style={{ width: "94%", height: 16, marginTop: "var(--e-4)" }}
                />
                <div
                  className="esqueleto-linea"
                  style={{ width: "48%", height: 16, marginTop: "var(--e-3)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
