# Decisiones

- **Sin CSP completa.** Solo `frame-ancestors 'none'`. Una política de scripts/estilos
  estricta rompería con facilidad pagos, inicio de sesión y analítica; el beneficio
  no compensa el riesgo sin pruebas en producción.
- **Nada se despliega sin «Despliega».** Todo queda en la rama de trabajo.
- **Avisos del asesor de Supabase (2026-09-30), sin cambios.** Las funciones RPC con
  privilegios elevados que puede llamar el público son las que la app usa a propósito
  (validan la sesión adentro). Las políticas permisivas múltiples siguen el patrón
  administrador + propio. Tocar permisos o RLS requiere confirmación de la dueña, y
  el beneficio es de rendimiento menor. Las tablas de respaldo sin llave primaria se
  quedan: no se borran datos.
