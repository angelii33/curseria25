# Matriz de verificación

| Check | Comando | Último resultado |
|---|---|---|
| Tipos | `npm run typecheck` | ✔ |
| Lint | `npm run lint` | ✔ |
| Unitarios | `npm test` | ✔ 199 |
| Build | `npm run build` | ✔ |
| Cabeceras | `next start` + `curl -I` | ✔ las 5 presentes, sin `X-Powered-By` |
| CI | GitHub Actions «Verificar» | ✔ |
| Accesibilidad | axe en 17 páginas × 2 anchos, con/sin sesión (local) | ✔ sin hallazgos |
| Consultas por página | simulador con contador (local) | lección con sesión 18→16; Auth 3→2 |
| Inyección en lecciones | fuzz de `md()` (local) | ✔ todo escapado |
