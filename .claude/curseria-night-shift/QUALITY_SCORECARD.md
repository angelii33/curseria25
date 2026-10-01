# Scorecard (CRITICAL / HIGH / MEDIUM / LOW / STABLE = riesgo pendiente)

Nada se declara «perfecto»; STABLE significa sin riesgo conocido de prioridad alta.

| Área | Riesgo | Nota |
|---|---|---|
| Autenticación | MEDIUM | Código sólido; faltan ajustes de panel (confirmación de correo, Google) |
| Autorización / RLS | STABLE | Revisado en rondas previas |
| Pagos | MEDIUM | Firma, ruta del aviso y procesamiento con pruebas; falta compra real de prueba |
| Seguridad web | LOW | Cabeceras de endurecimiento añadidas (turno 1); sin CSP completa a propósito |
| Contenido | LOW | 74 lecciones; sin negritas rotas ni signos faltantes; figuras auditadas |
| UX / móvil | MEDIUM | Falta recorrido real en teléfono de las lecciones gratis |
| Aprendizaje / retención | LOW | Quiz, práctica, repaso espaciado, logros, meta semanal |
| Accesibilidad | STABLE | axe (WCAG A/AA + buenas prácticas) sin hallazgos en 17 páginas, 390 y 1280 px, con y sin sesión |
| SEO | LOW | sitemap, robots, OG por curso y certificado |
| Analítica | MEDIUM | Embudo en `analytics_events`, ya sin bots; sin panel para verlo |
| Rendimiento | LOW | Consultas deduplicadas por petición; queda la cadena curso→módulos→lecciones |
| Testing | LOW | 199 pruebas + CI en cada push; e2e solo local |

| Tracción | HIGH | Producción casi sin usuarios reales y sin pagos: el siguiente salto es tráfico, no código |
