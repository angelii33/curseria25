// Piezas visuales puras: sin datos, sin sesión, sin servidor.
//
// Viven aparte de ui.tsx por una razón concreta: ui.tsx también contiene
// Barra, que lee la sesión con cookies() — algo que SOLO existe en el
// servidor. Cuando un componente de cliente (el checklist, por ejemplo)
// importaba Sello desde ui.tsx, arrastraba ese código de servidor al
// navegador y el build fallaba. Aquí solo hay HTML y clases: se pueden
// usar desde cualquier lado.
//
// ui.tsx las reexporta, así que ningún import existente cambia.

export function Perforacion({ sangrada = false }: { sangrada?: boolean }) {
  return <div className={sangrada ? "perforacion perforacion-sangrada" : "perforacion"} />;
}

export function Sello({
  estado = "pendiente",
  mini = false,
}: {
  estado?: "pendiente" | "logrado" | "bloqueado";
  mini?: boolean;
}) {
  const clase = [
    "sello",
    estado === "logrado" ? "sello-logrado" : "",
    estado === "bloqueado" ? "sello-bloqueado" : "",
    mini ? "sello-mini" : "",
  ].filter(Boolean).join(" ");
  const etiqueta =
    estado === "logrado" ? "Completada" : estado === "bloqueado" ? "Bloqueada" : "Pendiente";
  return (
    <span className={clase} role="img" aria-label={etiqueta}>
      {estado === "logrado" ? "✓" : estado === "bloqueado" ? "·" : ""}
    </span>
  );
}

export function Insignia({
  children, tono = "musgo",
}: {
  children: React.ReactNode;
  tono?: "musgo" | "precio" | "logrado" | "bloqueado" | "estado";
}) {
  const extra =
    tono === "precio" ? "insignia-precio"
    : tono === "logrado" ? "insignia-estado insignia-logrado"
    : tono === "bloqueado" ? "insignia-estado insignia-bloqueado"
    : tono === "estado" ? "insignia-estado" : "";
  return <span className={`insignia ${extra}`}>{children}</span>;
}
