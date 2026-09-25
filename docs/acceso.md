# Acceso: cómo funciona y qué configurar

## Cómo se entra

- **Correo y contraseña.** `/entrar` tiene dos pestañas: «Soy nuevo» (nombre,
  correo, contraseña) y «Ya tengo cuenta». No se manda ningún correo para
  entrar: sin códigos, sin límites de envío, sin spam.
- **Google** (opcional). El botón «Continuar con Google» aparece solo cuando
  Google está activado en Supabase (se consulta `/auth/v1/settings` cada 5
  minutos). Regresa por `/auth/confirm?code=…` (PKCE).
- **Se quitó el acceso con código por correo.** Para entrar no se manda
  ningún correo.
- **Olvidé mi contraseña** (con Resend). En «Ya tengo cuenta» →
  «¿Olvidaste tu contraseña?» se pide un enlace; también se abre solo tras
  una contraseña equivocada y con `/entrar?olvide=1`. Sin Resend configurado
  se muestra el contacto del negocio (`NEXT_PUBLIC_CONTACTO_WHATSAPP` o
  `NEXT_PUBLIC_CONTACTO_CORREO`). Detalles abajo.
- **Comprar sin cuenta:** el botón lleva a `/entrar?crear=1&volver=/comprar?…`;
  al crear la cuenta se llega a `/comprar`, que abre Mercado Pago directo.
- La sesión vive en galletas del servidor (`@supabase/ssr`). `src/proxy.ts`
  refresca el token y marca esas respuestas como no cacheables. «Salir» cierra
  solo ese navegador (`scope: "local"`).

## Lo que hay que configurar para que crear cuenta no pida correo

`crearCuenta` (src/app/acciones.ts):

- Con `SUPABASE_SERVICE_ROLE_KEY` en Vercel crea la cuenta ya confirmada
  (`admin.createUser`) y abre sesión al instante. **Recomendado.**
- Sin la llave usa `signUp`, que da sesión al instante solo si en Supabase está
  apagado **Authentication → Sign In / Providers → Email → Confirm email**. Si
  está encendido, Supabase manda un correo de confirmación y la pantalla lo
  avisa.

Además:

- **Authentication → Attack Protection:** activar la protección de contraseñas
  filtradas.
- **Authentication → URL Configuration:** Site URL = dominio de producción y en
  Redirect URLs `https://<dominio>/**` (lo usa el regreso de Google).

## Recuperar contraseña con Resend

Cómo funciona (`src/app/recuperar/`, `src/lib/recuperacion.ts`):

1. La persona escribe su correo. La respuesta es siempre la misma, exista o
   no la cuenta, y el trabajo lento corre después de responder (`after()`),
   así que ni el texto ni el tiempo revelan quién está registrado.
2. Límite en la base (`permitir_recuperacion`, migración
   `20260925_recuperacion.sql`): 1 enlace por minuto y 3 por hora por
   correo, 10 por hora por IP. Solo se guardan huellas sha256, se borran a
   las 24 h, y solo el servidor (service_role) puede llamar la función.
3. Supabase genera un token de un solo uso (`admin.generateLink`, tipo
   recovery) y Resend manda nuestro correo con el enlace
   `https://<dominio>/recuperar#token_hash=…`. El token va después de `#`:
   el navegador nunca lo manda al servidor, así que no queda en registros.
   El enlace usa siempre `NEXT_PUBLIC_SITE_URL`, nunca el dominio que diga
   la petición.
4. Abrir el enlace no gasta el token (los antivirus de correo que visitan
   enlaces no lo queman): se canjea al guardar la contraseña nueva. Si la
   contraseña se rechaza (débil o igual a la anterior), una galleta httpOnly
   firmada de 15 min permite reintentar sin pedir otro enlace; una sesión
   normal sin ella no puede cambiar la contraseña desde ahí.
5. Al guardarla: entra, y se cierran las demás sesiones de esa cuenta.

Para activarlo:

1. resend.com → **Domains** → agregar tu dominio y poner en tu DNS los
   registros que muestra (SPF y DKIM; DMARC recomendado). Esperar a que
   diga *Verified*. Sin dominio verificado Resend solo entrega a tu propio
   correo.
2. **Domains → tu dominio:** apagar *Click tracking* y *Open tracking*
   (reescriben el enlace y agregan rastreadores; no hacen falta).
3. **API Keys** → crear una con permiso *Sending access* para ese dominio.
4. En Vercel (Production): `RESEND_API_KEY`, `RESEND_FROM` (por ejemplo
   `CurserIA <acceso@tu-dominio.com>`), y verificar que existan
   `SUPABASE_SERVICE_ROLE_KEY` y `NEXT_PUBLIC_SITE_URL`. Volver a desplegar.
5. Probar con tu correo: pedir enlace, abrirlo desde el teléfono, guardar.

El plan gratis de Resend alcanza para empezar (su límite actual está en
resend.com/pricing). Los fallos de envío quedan en los registros de Vercel
como `[recuperar] resend <estado>`, sin el correo completo ni el token.

## Activar Google

1. console.cloud.google.com → proyecto → «Pantalla de consentimiento de
   OAuth»: Externo, nombre «CurserIA», publicar.
2. «Credenciales» → «ID de cliente de OAuth» → Aplicación web. URI de
   redireccionamiento: `https://ppcjjmejawxjlfblbudt.supabase.co/auth/v1/callback`
3. Supabase → Authentication → Sign In / Providers → Google: activar y pegar
   el ID y el secreto.

## Errores y lo que ve la persona

`src/lib/auth.ts` traduce por código de error de Supabase, sin revelar si un
correo tiene cuenta al entrar (`invalid_credentials` → «El correo o la
contraseña no coinciden»). En registros solo aparece el código de error y el
correo oculto (`an•••@…`), nunca contraseñas ni tokens.

Compromiso aceptado: sin correo de confirmación no se comprueba que el correo
sea de quien se registra. El recibo de Mercado Pago sí llega al correo con el
que se paga.
