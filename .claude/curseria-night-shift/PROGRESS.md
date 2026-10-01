# Progreso

## Turno 1 (2026-09-30)
- Línea base verde.
- Cabeceras de seguridad globales + `poweredByHeader: false`; verificado con `next start`.
- Test `tests/cabeceras.test.ts` (162 tests en verde).
- Auditoría de acciones del servidor: sesión validada, entradas acotadas, redirecciones internas. Sin cambios.
- Asesor de Supabase revisado; ver DECISIONS. Pendiente de la dueña: protección de contraseñas filtradas.

## Turno 2 (2026-10-01)
- CI «Verificar» en GitHub Actions (verde).
- Pruebas de pagos y del aviso de Mercado Pago (+27), validadas rompiendo el código a propósito.
- Rendimiento: `cache` por petición, sesión en paralelo, iconos/OG/robots/sitemap fuera del proxy.
- Analítica: `lesson_started` ignora bots, vistas previas y precargas.
- Auditorías sin hallazgos: accesibilidad, inyección en el renderizador, texto de las 74 lecciones, enlaces.
- Hallazgo de negocio: casi no hay tráfico real todavía; 2 intentos de compra abandonados.
