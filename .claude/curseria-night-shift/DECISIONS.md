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
- **Fuentes sin cambios (2026-10-13).** El LCP de la portada (2,9 s en 4G lenta) lo marca la
  fuente del cuerpo (Newsreader con eje óptico, 129 KB). Quitar el eje bajaría el peso pero cambia
  el aspecto de todo el texto: decisión de diseño de la dueña, no del turno.
- **No se quitó ninguna sección con destino de enlace.** #problemas, #cursos y #gratis siguen
  existiendo; solo se quitaron los cuatro pasos que repetían «Cómo funciona».
