# Backlog priorizado

| # | Prioridad | Tarea | Estado |
|---|---|---|---|
| 1 | P1 | Cabeceras de seguridad HTTP (anti-marcos, nosniff, referrer, permisos) | hecho |
| 2 | P2 | Auditoría de acciones del servidor y asesor de Supabase | hecho (sin hallazgos que corregir en código) |
| 4 | Dueña | Activar «Leaked password protection» en Supabase Auth (un interruptor) | pendiente |
| 5 | P3 | Recorrido móvil real de lecciones gratis con datos de producción | pendiente (requiere acceso a producción) |
| 3 | P2 | Test que fije las cabeceras de seguridad en `next.config` | hecho |
| — | Dueña | Ajustes de panel listados en MASTER_STATE | fuera de alcance del código |
| 6 | P1 | CI en GitHub Actions (typecheck, lint, tests, build) | hecho — verde en GitHub |
| 7 | P1 | Pruebas de `procesarPago`/suscripciones y de la ruta del aviso de pago | hecho (27 pruebas, verificadas con mutaciones) |
| 8 | P1 | Menos consultas por visita: `cache` por petición, sesión en paralelo, iconos/OG fuera del proxy | hecho |
| 9 | P2 | El embudo ignora bots, vistas previas de enlaces y precargas | hecho |
| 10 | P3 | Quitar SVG de la plantilla de Next | hecho |
| 11 | P2 | Unir curso→módulos→lecciones en una consulta anidada (−2 viajes por página) | pendiente: requiere probar contra Supabase real |
| 12 | Dueña | `capturar_lead` no se usa en la app y es ejecutable por el público: decidir si se revoca o se conecta a un formulario | pendiente (cambio de permisos en la base) |
| 13 | Dueña | Panel de métricas para la dueña (hoy solo por SQL) | propuesta: toca autorización, requiere visto bueno |
