# Acceso: cómo funciona y qué configurar

## Cómo se entra

- **Correo y contraseña.** `/entrar` tiene dos pestañas: «Soy nuevo» (nombre,
  correo, contraseña) y «Ya tengo cuenta». No se manda ningún correo para
  entrar: sin códigos, sin límites de envío, sin spam.
- **Google** (opcional). El botón «Continuar con Google» aparece solo cuando
  Google está activado en Supabase (se consulta `/auth/v1/settings` cada 5
  minutos). Regresa por `/auth/confirm?code=…` (PKCE).
- **Se quitó el acceso con código por correo.** Quien olvida su contraseña ve
  el contacto del negocio (`NEXT_PUBLIC_CONTACTO_WHATSAPP` o
  `NEXT_PUBLIC_CONTACTO_CORREO`) y, si está activo, el botón de Google.
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
