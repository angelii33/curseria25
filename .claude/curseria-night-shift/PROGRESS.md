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

## Turno 3 (2026-10-01) — lecciones gratis
- 8 de las 9 lecciones gratis abren ahora con una prueba de un minuto con el negocio del alumno, y su cierre la retoma.
- Corrección en WhatsApp: la prueba pedía escribir desde el celular de alguien de la casa, pero el saludo automático no llega a quien te escribió en los últimos 14 días.
- Monetiza: dos secciones «Por qué importa» con títulos que dicen algo.
- Producción: respaldo en `respaldo.lesson_resources_20261001`, ensayo con md5 y UPDATE con guarda; 8/8 verificadas.
- Estándar de lecciones: regla de la prueba de un minuto.

## Turno 4 (2026-10-13) — auditoría de interfaz
- Capturas de todas las páginas en 390 y 1280 px, con y sin sesión, revisadas a mano.
- Portada en el teléfono: 17 085 → 14 971 px (fuera los 4 pasos repetidos, «Qué hay dentro» con 6 puntos, pasos y selector en filas, lecciones gratis compactas, etapa sin repetir en las fichas).
- Escritorio: la ficha sola en su grupo va horizontal.
- Pie compacto en el teléfono (dos columnas de enlaces).
- Lección: indicador de sección que se atascaba → cálculo por cuadro de scroll; mensaje contradictorio de guardado en la lección gratis.
- Mi aprendizaje: insignias bloqueadas plegadas; «Explora» si no hay cursos.
- Entrar: formulario primero en el teléfono; sin «Entrar» en su propia página; «¿Olvidaste…?» con el estilo del sitio.
- Cabecera móvil: «Precios» desde 360 px cuando cabe.
- Verificado: sin desbordes en 320/360/390, axe sin hallazgos en 34 combinaciones, foco visible con teclado en 5 páginas.
- Rendimiento (build de producción, 4G lenta, CPU ×4): LCP 0,4–1,9 s en todas salvo la portada (2,9 s, por la fuente del cuerpo); CLS 0.
