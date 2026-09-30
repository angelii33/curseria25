# Scorecard (CRITICAL / HIGH / MEDIUM / LOW / STABLE = riesgo pendiente)

Nada se declara «perfecto»; STABLE significa sin riesgo conocido de prioridad alta.

| Área | Riesgo | Nota |
|---|---|---|
| Autenticación | MEDIUM | Código sólido; faltan ajustes de panel (confirmación de correo, Google) |
| Autorización / RLS | STABLE | Revisado en rondas previas |
| Pagos | MEDIUM | Firma de webhook con tests; falta compra real de prueba |
| Seguridad web | LOW | Cabeceras de endurecimiento añadidas (turno 1); sin CSP completa a propósito |
| Contenido | LOW | 74 lecciones, figuras auditadas (ronda 6) |
| UX / móvil | MEDIUM | Falta recorrido real en teléfono de las lecciones gratis |
| Aprendizaje / retención | LOW | Quiz, práctica, repaso espaciado, logros, meta semanal |
| Accesibilidad | LOW | `lang`, «Saltar al contenido», `main#contenido` en todas las páginas |
| SEO | LOW | sitemap, robots, OG por curso y certificado |
| Analítica | MEDIUM | Vercel Analytics; sin embudo de producto |
| Rendimiento | LOW | — |
| Testing | MEDIUM | Unitarios buenos; sin e2e en CI |
