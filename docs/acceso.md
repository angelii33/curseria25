# Acceso: cómo funciona y qué configurar

## Camino principal: cuenta con contraseña (sin correos)

- `/entrar` tiene dos pestañas: «Soy nuevo» (nombre, correo, contraseña) y
  «Ya tengo cuenta» (correo y contraseña). Google, si está activado, arriba.
  El código por correo queda como respaldo («¿Olvidaste tu contraseña?»).
- `crearCuenta`: con `SUPABASE_SERVICE_ROLE_KEY` crea la cuenta ya
  confirmada (`admin.createUser`) y abre sesión al instante. Sin la llave usa
  `signUp`, que da sesión al instante solo si en Supabase está apagado
  **Authentication → Sign In / Providers → Email → Confirm email**. Hoy está
  encendido: hay que poner la llave en Vercel o apagar ese interruptor.
- Comprar sin cuenta: el botón lleva a `/entrar?crear=1&volver=/comprar?…`.
  Al crear la cuenta (o entrar) se llega a `/comprar`, que abre Mercado Pago
  directo, sin volver a pulsar «Comprar» (`src/lib/compra.ts`).
- Contra robots: campo trampa invisible. Contraseña mínima de 8 caracteres.
- Compromiso aceptado: sin correo de confirmación no se comprueba que el
  correo sea de quien se registra. El recibo de Mercado Pago sí llega al
  correo que la persona use al pagar.

## Código por correo (respaldo)

## Flujo

1. `/entrar` → la persona escribe su correo → `pedirCodigo` llama a
   `signInWithOtp` (crea la cuenta si no existe; la respuesta es igual exista
   o no, así que nadie puede averiguar quién tiene cuenta).
2. Llega un correo con **código de 6 dígitos** y un **botón**. Los dos son el
   mismo acceso: al usar uno, el otro deja de servir.
3. Código → `verificarCodigo` (`verifyOtp` con `type: "email"`).
   Botón → `/auth/confirm` (`token_hash` con `verifyOtp`, o `code` con
   `exchangeCodeForSession`).
4. La sesión queda en galletas del servidor (`@supabase/ssr`). No hay cliente
   de Supabase en el navegador ni tokens en `localStorage`. `src/proxy.ts`
   refresca el token en cada petición y marca esas respuestas como no
   cacheables.
5. «Salir» cierra solo la sesión de ese navegador (`scope: "local"`).

Lo único que guarda el navegador es el correo y la hora del último envío
(`sessionStorage`, clave `listo:acceso`), para no perder el paso 2 al recargar.

## Entrar con Google (sin correos, sin límite de envíos)

El botón «Continuar con Google» aparece solo cuando Google está activado en
Supabase (se consulta `/auth/v1/settings` cada 5 minutos). Flujo:
`entrarConGoogle` → Google → Supabase → `/auth/confirm?code=…` →
`exchangeCodeForSession` (PKCE) → página de origen. Si la persona cancela,
vuelve a `/entrar?error=google` con aviso. El perfil toma el nombre de Google
(`full_name`).

Para activarlo:

1. console.cloud.google.com → crear proyecto → «APIs y servicios» →
   «Pantalla de consentimiento de OAuth»: tipo Externo, nombre «CurserIA», tu
   correo. Publicar la app (estado «En producción»).
2. «Credenciales» → «Crear credenciales» → «ID de cliente de OAuth» →
   Aplicación web. En «URI de redireccionamiento autorizados» pegar:
   `https://ppcjjmejawxjlfblbudt.supabase.co/auth/v1/callback`
3. Copiar el «ID de cliente» y el «Secreto del cliente».
4. Supabase → Authentication → Sign In / Providers → Google → activar,
   pegar los dos datos y guardar.
5. Supabase → Authentication → URL Configuration: Site URL = dominio de
   producción y en Redirect URLs `https://<dominio>/**`.

## Configuración en Supabase (panel, no está en el código)

**Authentication → URL Configuration**

- Site URL: el dominio de producción (hoy está en `http://localhost:3000`, por
  eso el enlace del correo mandaba a localhost).
- Redirect URLs:
  - `https://<dominio-de-producción>/**`
  - `https://*-<equipo>.vercel.app/**` (previews)
  - `http://localhost:3000/**`

**Authentication → Emails → Templates**

Pegar `supabase/templates/codigo-acceso.html` en **Magic link** y en
**Confirm signup** (la primera vez Supabase usa la de registro). Asunto:
`Tu código de acceso a CurserIA: {{ .Token }}`. Sin `{{ .Token }}` el correo no
trae código y la pantalla pide algo que nunca llega.

**Authentication → Emails → SMTP Settings**

El SMTP incluido manda desde `noreply@mail.app.supabase.io`, con límite muy
bajo por hora y solo para pruebas. Para producción: SMTP propio (Resend,
Postmark, SES…) con remitente del dominio y SPF, DKIM y DMARC configurados.
Después, subir **Rate Limits → emails por hora**.

**Authentication → Providers → Email**

- Email OTP expiration: 600–900 s es un buen punto.
- Email OTP length: 6 (la pantalla espera 6 dígitos).

**Authentication → Attack Protection**: activar la protección de contraseñas
filtradas (solo afecta a la vía con contraseña).

## Errores y lo que ve la persona

`src/lib/auth.ts` traduce por código de error de Supabase:

| Código | Mensaje |
| --- | --- |
| `otp_expired` | El código es incorrecto, ya se usó o caducó |
| `over_email_send_rate_limit` con «after N seconds» | Pasa al paso 2 y espera N s para reenviar |
| `over_email_send_rate_limit` sin segundos (límite global) | Se alcanzó el límite de envíos por hora |
| `invalid_credentials` | El correo o la contraseña no coinciden |
| red (`AuthRetryableFetchError`) | Revisa tu internet |

En registros solo aparece el código de error y el correo oculto (`an•••@…`).
Nunca códigos, tokens ni galletas.

## Pruebas

- `npm test`: `tests/auth.test.ts` (validación, ocultar correo, códigos
  pegados, clasificación de errores, sin enumeración de cuentas).
- E2E contra un Supabase simulado (`NEXT_PUBLIC_SUPABASE_URL` apuntando al
  simulador): entrar desde un curso y volver a él, recargar en el paso 2,
  código incorrecto, pegar código, recargar con sesión, `/entrar` con sesión,
  otra pestaña, salir, código ya usado, límite de reenvío, sin conexión,
  enlace `token_hash` en otro navegador, enlace reusado, `?code=` en la
  portada, error en `#`, `volver`/`next` externos ignorados, contraseña.
