# Estándar de lecciones

Cada lección es una guía para ejecutar, no para leer. El alumno debe saber
siempre dónde está, qué hace, por qué, qué sigue, cómo sabe que lo hizo bien
y qué hacer si falla.

## Qué pone la plataforma sola

| Parte | De dónde sale |
|---|---|
| ¿Qué vas a conseguir? | `lessons.outcome` (cabecera de la lección) |
| Antes de empezar | Sección `## Antes de empezar…` de la lección; si no existe, `necesitas` del curso en `src/lib/editorial.ts` |
| Pregunta previa y comprobación de memoria | `src/lib/practica.ts` |
| Cómo sabes que lo hiciste bien | `mission_checklists` (criterio + detalle) |
| No avances sin terminar | Aviso automático mientras falten criterios |
| Entregable | `mission_builders.asset_title` |
| Continuar | Siguiente lección del curso |

## Qué escribe la lección (Markdown en `lesson_resources.content_markdown`)

1. **Por qué importa**: breve, práctico. Nada de introducciones largas.
2. **Pasos**: numerados, con dónde entrar, qué tocar y qué escribir.
3. **Ejemplo + ahora hazlo tú**: un caso realista de negocio mexicano y la
   adaptación al negocio del alumno.
4. **`## Si algo no sale`**: reglas de decisión y errores comunes.
5. **`## Mini reto`**: una acción concreta, no una pregunta teórica.
6. **`## Lo que hiciste hoy`**: resultado y qué sigue.
7. Solo en la última lección: **`## Tu plan después del curso`** con Hoy,
   Esta semana, Próximos 30 días y Después.

## Convenciones que el renderizador reconoce (`src/lib/md.ts`)

- Error común (tres líneas seguidas, sin línea en blanco):

  ```
  **Problema:** Qué ve el alumno.
  **Causa:** Por qué pasa.
  **Solución:** Qué hacer, paso concreto.
  ```

- Regla de decisión (lista, una por línea): `- Si pasa X → haz Y`
- Nota importante: párrafo que empieza con `**Lo importante:**`
- Mensaje para copiar: cita que empieza con comillas (`> "Hola…"`)
- Instrucción para la IA: cita larga después de un párrafo que menciona
  ChatGPT, Claude, Gemini o la IA
- Sí / no: lista con `✅` y `❌`
- Fórmula: cita de una línea con términos unidos por ` + `
- Tablas de 3+ columnas se vuelven fichas en el teléfono

## Reglas

- Cero relleno: cada bloque ayuda a hacer algo mejor o se elimina.
- Cero saltos: «después configura…» esconde pasos; escríbelos.
- Un principiante debe poder seguirlo sin buscar tutoriales externos.
- Herramientas externas cambian: separa el principio del procedimiento y
  avisa que los nombres de botones pueden cambiar.
- No prometer resultados de negocio: la guía deja preparado algo; las
  ventas dependen de oferta, mercado y ejecución.
- Antes de editar contenido en producción, respaldar en el esquema
  `respaldo` de la base.
