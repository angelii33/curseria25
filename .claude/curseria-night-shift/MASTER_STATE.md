# Night shift — estado maestro

Última actualización: 2026-09-30

## Contexto
- Next.js 16 (App Router, `proxy.ts`) + Supabase + Mercado Pago. Producción en Vercel desde `main`.
- Rama de trabajo: `claude/stoic-hawking-ljh5pl`. `main` solo avanza cuando la persona dueña dice «Despliega».
- El repositorio es público: aquí no van secretos, detalles explotables ni contenido de pago.

## Línea base (inicio del turno)
- typecheck ✔ · lint ✔ · 161 tests (12 archivos) ✔ · build ✔
- Git limpio en b38f0c1 (igual a `main`).

## Madurez por área
Ver QUALITY_SCORECARD.md.

## Bloqueos que no se resuelven desde código
Configuración en paneles (Vercel/Supabase/Google) que solo la persona dueña puede hacer:
variables legales y de contacto, «Confirm email», Google OAuth, clave de IA en Vercel,
compra de prueba de punta a punta, analítica de producto y correo transaccional.
