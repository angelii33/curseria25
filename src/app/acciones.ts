"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { clienteServidor } from "@/lib/supabase/server";
import {
  ESPERA_REENVIO, correoValido, limitePorCorreo, limpiarCodigo, mensajeDeFalla, normalizarCorreo,
  ocultarCorreo, segundosDeEspera, tipoDeFalla, type TipoFalla,
} from "@/lib/auth";
import { URL_SITIO } from "@/lib/sitio";
import { clienteAdmin } from "@/lib/supabase/admin";
import { registrar } from "@/lib/analitica";
import { conParametro, rutaInterna } from "@/lib/rutas";
import { iniciarCompra } from "@/lib/compra";

/** Traduce los errores de la base a algo que un dueño de negocio entienda. */
function mensaje(error: string): string {
  const t = error.toLowerCase();
  if (t.includes("not_authenticated")) return "Necesitas iniciar sesión para esto.";
  if (t.includes("not_authorized_for_course")) return "Necesitas acceso a este curso para continuar.";
  if (t.includes("payment_required")) return "Este curso requiere compra antes de inscribirte.";
  if (t.includes("course_not_published")) return "Este curso no está disponible ahora mismo.";
  if (t.includes("course_not_completed")) return "Termina las lecciones que faltan para emitir tu certificado.";
  if (t.includes("quizzes_not_passed")) return "Aprueba todos los quizzes del curso para emitir tu certificado.";
  if (t.includes("already_owned")) return "Ya tienes todos los cursos de esto.";
  if (t.includes("already_subscribed")) return "Tu membresía ya está activa.";
  if (t.includes("product_not_available") || t.includes("course_not_available"))
    return "Este producto no está disponible ahora mismo.";
  if (t.includes("course_not_found") || t.includes("lesson_not_found")) return "No encontramos ese contenido.";
  return "Algo salió mal. Vuelve a intentarlo.";
}


export type Estado = {
  error?: string;
  tipo?: TipoFalla;
  aviso?: string;
  enviado?: boolean;
  correo?: string;
  /** Segundos que faltan para poder pedir otro código (lo dicta el servidor). */
  esperar?: number;
  /** Adónde ir después de entrar. Solo viene cuando ya hay sesión. */
  destino?: string;
  /** Distingue dos respuestas iguales seguidas (p. ej. dos reenvíos). */
  n?: number;
};

/** Adónde volver tras abrir el enlace del correo en este mismo navegador. */
const GALLETA_VOLVER = "listo_volver";

/** Registro seguro: código de error y correo oculto. Nunca códigos ni tokens. */
function registrarFalla(paso: string, correo: string, error: { code?: string; status?: number }) {
  console.warn(`[acceso] ${paso}`, { correo: ocultarCorreo(correo), code: error.code ?? "?", status: error.status ?? 0 });
}

/** Origen de quien pide el código (localhost, preview o producción). Supabase
 *  solo lo acepta si está en su lista de Redirect URLs; si no, usa Site URL. */
async function origen(): Promise<string> {
  const o = (await headers()).get("origin");
  return o && /^https?:\/\/[\w.-]+(:\d+)?$/.test(o) ? o : URL_SITIO;
}

/**
 * Paso 1: pedir el código. Sirve para entrar Y para registrarse: si el correo
 * no existe, Supabase crea la cuenta. La respuesta es la misma exista o no,
 * así que no se puede averiguar quién tiene cuenta.
 */
export async function pedirCodigo(_prev: Estado, datos: FormData): Promise<Estado> {
  const correo = normalizarCorreo(datos.get("correo"));
  const nombre = String(datos.get("nombre") ?? "").trim().slice(0, 80);
  const volver = rutaInterna(String(datos.get("volver") ?? ""), "/mi-aprendizaje");
  const n = Date.now();
  if (!correoValido(correo)) {
    return { error: "Escribe un correo válido, como nombre@negocio.mx.", tipo: "correo", correo, n };
  }

  const sb = await clienteServidor();
  const { error } = await sb.auth.signInWithOtp({
    email: correo,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${await origen()}/auth/confirm?next=${encodeURIComponent(volver)}`,
      data: nombre ? { display_name: nombre } : undefined,
    },
  });

  if (error) {
    registrarFalla("pedir", correo, error);
    const tipo = tipoDeFalla(error);
    // «Espera N segundos» = a este correo ya le salió un código hace nada:
    // ese código sigue sirviendo, así que se pasa al paso 2 con la espera.
    if (tipo === "limite" && limitePorCorreo(error)) {
      const esperar = segundosDeEspera(error);
      return {
        enviado: true, correo, esperar, n, tipo,
        aviso: `Ya te mandamos un código hace poco. Usa ese; podrás pedir otro en ${esperar} segundos.`,
      };
    }
    return { error: mensajeDeFalla(error), tipo, correo, n, enviado: datos.get("reenvio") === "1" };
  }

  (await cookies()).set(GALLETA_VOLVER, volver, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60, path: "/",
  });
  return {
    enviado: true, correo, esperar: ESPERA_REENVIO, n,
    aviso: datos.get("reenvio") === "1" ? "Te mandamos un código nuevo. El anterior ya no sirve." : undefined,
  };
}

/** Paso 2: canjear el código de 6 dígitos por una sesión. */
export async function verificarCodigo(_prev: Estado, datos: FormData): Promise<Estado> {
  const correo = normalizarCorreo(datos.get("correo"));
  const codigo = limpiarCodigo(datos.get("codigo"));
  const destino = rutaInterna(String(datos.get("volver") ?? ""), "/mi-aprendizaje");
  const n = Date.now();
  if (!correoValido(correo)) return { error: "Vuelve a escribir tu correo.", tipo: "correo", n };
  if (codigo.length !== 6) {
    return { enviado: true, correo, error: "El código son 6 dígitos.", tipo: "codigo", n };
  }

  const sb = await clienteServidor();
  const { error } = await sb.auth.verifyOtp({ email: correo, token: codigo, type: "email" });
  if (error) {
    // Si el enlace del correo u otra pestaña ya abrió sesión con este mismo
    // correo, el código aparece como «usado»: no es un error, ya entraste.
    const { data } = await sb.auth.getUser();
    if (data.user?.email?.toLowerCase() !== correo) {
      registrarFalla("verificar", correo, error);
      return { enviado: true, correo, error: mensajeDeFalla(error), tipo: tipoDeFalla(error), n };
    }
  }

  // Al escribir las galletas de sesión, Next vuelve a pintar /entrar, que
  // con sesión ya redirige a «volver». «destino» queda como respaldo.
  (await cookies()).delete(GALLETA_VOLVER);
  revalidatePath("/", "layout");
  return { correo, destino, n };
}

const CLAVE_MINIMA = 8;

/**
 * Crear cuenta en un paso: nombre, correo y contraseña, sin esperar ningún
 * correo. Con la llave de servicio la cuenta nace confirmada (admin); sin
 * ella se usa signUp, que da sesión al instante solo si en Supabase está
 * apagado «Confirm email». Lo que no hay es un camino que se quede a medias
 * sin decirlo.
 */
export async function crearCuenta(_prev: Estado, datos: FormData): Promise<Estado> {
  const correo = normalizarCorreo(datos.get("correo"));
  const nombre = String(datos.get("nombre") ?? "").trim().slice(0, 80);
  const clave = String(datos.get("clave") ?? "");
  const destino = rutaInterna(String(datos.get("volver") ?? ""), "/mi-aprendizaje");
  const n = Date.now();

  // Trampa para robots: un campo que una persona no ve ni llena.
  if (String(datos.get("sitio") ?? "")) return { error: "No pudimos crear la cuenta.", n };
  if (!correoValido(correo)) return { error: "Escribe un correo válido, como nombre@negocio.mx.", tipo: "correo", correo, n };
  if (clave.length < CLAVE_MINIMA) {
    return { error: `La contraseña necesita al menos ${CLAVE_MINIMA} caracteres.`, tipo: "credenciales", correo, n };
  }

  const sb = await clienteServidor();
  const metadatos = nombre ? { display_name: nombre } : undefined;
  const admin = clienteAdmin();

  if (admin) {
    const { error } = await admin.auth.admin.createUser({
      email: correo, password: clave, email_confirm: true, user_metadata: metadatos,
    });
    if (error) {
      if (error.code === "email_exists" || error.code === "user_already_exists" || error.status === 422) {
        return { error: "Ese correo ya tiene cuenta. Entra con tu contraseña o con Google.", tipo: "existe", correo, n };
      }
      if (error.code === "weak_password") return { error: "Esa contraseña es muy fácil de adivinar. Prueba otra más larga.", tipo: "credenciales", correo, n };
      registrarFalla("crear", correo, error);
      return { error: mensajeDeFalla(error), tipo: tipoDeFalla(error), correo, n };
    }
    const { error: e2 } = await sb.auth.signInWithPassword({ email: correo, password: clave });
    if (e2) {
      registrarFalla("crear-entrar", correo, e2);
      return { error: mensajeDeFalla(e2), tipo: tipoDeFalla(e2), correo, n };
    }
  } else {
    const { data, error } = await sb.auth.signUp({ email: correo, password: clave, options: { data: metadatos } });
    if (error) {
      if (error.code === "user_already_exists") return { error: "Ese correo ya tiene cuenta. Entra con tu contraseña o con Google.", tipo: "existe", correo, n };
      if (error.code === "weak_password") return { error: "Esa contraseña es muy fácil de adivinar. Prueba otra más larga.", tipo: "credenciales", correo, n };
      registrarFalla("crear", correo, error);
      return { error: mensajeDeFalla(error), tipo: tipoDeFalla(error), correo, n };
    }
    if (!data.session) {
      // Supabase pide confirmar el correo (o el correo ya existía: por
      // seguridad responde igual). Se dice tal cual, sin prometer nada.
      console.warn("[acceso] crear sin sesión: falta SUPABASE_SERVICE_ROLE_KEY o apagar «Confirm email»");
      return {
        aviso: "Te mandamos un correo para confirmar tu cuenta. Ábrelo y después entra con tu contraseña. Si ya tenías cuenta, entra directamente.",
        tipo: "existe", correo, n,
      };
    }
  }

  revalidatePath("/", "layout");
  return { correo, destino, n };
}

/** Vía de respaldo: contraseña, para cuentas que la tienen. */
export async function entrarConClave(_prev: Estado, datos: FormData): Promise<Estado> {
  const correo = normalizarCorreo(datos.get("correo"));
  const clave = String(datos.get("clave") ?? "");
  const n = Date.now();
  if (!correoValido(correo) || !clave) return { error: "Escribe tu correo y tu contraseña.", correo, n };

  const sb = await clienteServidor();
  const { error } = await sb.auth.signInWithPassword({ email: correo, password: clave });
  if (error) {
    registrarFalla("clave", correo, error);
    return { error: mensajeDeFalla(error), tipo: tipoDeFalla(error), correo, n };
  }

  revalidatePath("/", "layout");
  return { correo, destino: rutaInterna(String(datos.get("volver") ?? ""), "/mi-aprendizaje"), n };
}

/**
 * «Entrar con Google». Sin correos de por medio: Google confirma la
 * identidad y Supabase crea la cuenta la primera vez. El regreso pasa por
 * /auth/confirm, que canjea el código (PKCE) por la sesión en galletas.
 */
export async function entrarConGoogle(datos: FormData) {
  const volver = rutaInterna(String(datos.get("volver") ?? ""), "/mi-aprendizaje");
  const sb = await clienteServidor();
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await origen()}/auth/confirm?next=${encodeURIComponent(volver)}`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error || !data.url) {
    if (error) console.warn("[acceso] google", { code: error.code ?? "?", status: error.status ?? 0 });
    redirect(conParametro(`/entrar${volver === "/mi-aprendizaje" ? "" : `?volver=${encodeURIComponent(volver)}`}`, "error=google"));
  }
  redirect(data.url);
}

/** Cierra la sesión de ESTE navegador. Las de otros dispositivos siguen. */
export async function salir() {
  const sb = await clienteServidor();
  const { error } = await sb.auth.signOut({ scope: "local" });
  if (error) console.warn("[acceso] salir", { code: error.code ?? "?", status: error.status ?? 0 });
  revalidatePath("/", "layout");
  redirect("/");
}

/** Inscribe al usuario. Toda la validación vive en la RPC, no aquí. */
export async function inscribirse(datos: FormData) {
  const cursoId = String(datos.get("curso_id") ?? "");
  const slug = String(datos.get("slug") ?? "");

  const sb = await clienteServidor();
  const { data: usuario } = await sb.auth.getUser();
  if (!usuario.user) redirect(`/entrar?volver=/cursos/${slug}`);

  const { error } = await sb.rpc("enroll_in_course", { check_course_id: cursoId });
  if (error) {
    // Curso de pago sin compra registrada: no es un fallo, es un estado.
    // Se vuelve al curso con un aviso claro en vez de romper la página.
    if (error.message.toLowerCase().includes("payment_required")) {
      redirect(`/cursos/${slug}?acceso=pendiente#comprar`);
    }
    throw new Error(mensaje(error.message));
  }

  await registrar("inscripcion", { curso: slug });
  revalidatePath("/", "layout");
  redirect(`/cursos/${slug}?bienvenida=1`);
}

/**
 * XP e insignias. Las RPC award_xp_* validan que la lección esté completada o
 * el quiz aprobado y no repiten puntos (on conflict do nothing). Si fallan,
 * el avance ya quedó guardado: los puntos nunca bloquean al alumno.
 */
async function premiar(
  sb: Awaited<ReturnType<typeof clienteServidor>>,
  rpc: "award_xp_for_lesson" | "award_xp_for_quiz",
  args: Record<string, string>
): Promise<{ xp: number; insignia: string | null }> {
  try {
    const antes = new Date(Date.now() - 1000).toISOString();
    const { data, error } = await sb.rpc(rpc, args);
    if (error) return { xp: 0, insignia: null };
    const fila = Array.isArray(data) ? data[0] : data;
    const { data: nueva } = await sb
      .from("user_badges")
      .select("badges(code)")
      .gte("awarded_at", antes)
      .order("awarded_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const code = (nueva?.badges as unknown as { code: string } | null)?.code ?? null;
    return { xp: Number(fila?.xp_awarded ?? 0), insignia: code };
  } catch {
    return { xp: 0, insignia: null };
  }
}

/** Marca la lección. El backend valida el acceso antes de escribir. */
export async function completarLeccion(datos: FormData) {
  const leccionId = String(datos.get("leccion_id") ?? "");
  const ruta = String(datos.get("ruta") ?? "/");

  const sb = await clienteServidor();
  const { error } = await sb.rpc("mark_lesson_complete", { check_lesson_id: leccionId });
  if (error) throw new Error(mensaje(error.message));

  await registrar("leccion_completada", { ruta: rutaInterna(ruta) });
  const premio = await premiar(sb, "award_xp_for_lesson", { check_lesson_id: leccionId });
  revalidatePath("/", "layout");
  // ?hecha=1 dispara el aviso breve de «lección completada» en la página;
  // xp e insignia solo cambian el texto del aviso (la fuente es la base).
  const extra = `${premio.xp ? `&xp=${premio.xp}` : ""}${premio.insignia ? `&insignia=${premio.insignia}` : ""}`;
  redirect(`${rutaInterna(ruta)}?hecha=1${extra}#cierre`);
}

export type ResultadoQuiz = {
  error?: string;
  /** Porcentaje 0-100 que devuelve submit_quiz_attempt, no numero de aciertos. */
  puntaje?: number;
  aprobado?: boolean;
  /** XP ganados en este intento (0 si ya se habían dado antes). */
  xp?: number;
};

/** Califica el quiz en el servidor. El navegador nunca ve cuál es la correcta. */
export async function responderQuiz(
  _prev: ResultadoQuiz,
  datos: FormData
): Promise<ResultadoQuiz> {
  const quizId = String(datos.get("quiz_id") ?? "");
  const total = Number(datos.get("total") ?? 0);

  const respuestas: string[] = [];
  for (const [campo, valor] of datos.entries()) {
    if (campo.startsWith("p_") && typeof valor === "string" && valor) respuestas.push(valor);
  }
  if (respuestas.length < total) {
    return { error: "Contesta todas las preguntas antes de enviar." };
  }

  const sb = await clienteServidor();
  const { data, error } = await sb.rpc("submit_quiz_attempt", {
    check_quiz_id: quizId,
    selected_answer_ids: respuestas,
  });
  if (error) return { error: mensaje(error.message) };

  const fila = Array.isArray(data) ? data[0] : data;
  const premio = fila?.passed
    ? await premiar(sb, "award_xp_for_quiz", { check_quiz_id: quizId })
    : { xp: 0, insignia: null };
  revalidatePath("/", "layout");
  return {
    puntaje: fila?.score ?? 0,
    aprobado: Boolean(fila?.passed),
    xp: premio.xp,
  };
}

/** Marca la misión. El acceso lo valida la RPC, no la interfaz. */
export async function completarMision(datos: FormData) {
  const misionId = String(datos.get("mision_id") ?? "");
  const ruta = String(datos.get("ruta") ?? "/");

  const sb = await clienteServidor();
  const { error } = await sb.rpc("complete_mission", { check_mission_id: misionId });
  if (error) throw new Error(mensaje(error.message));

  revalidatePath("/", "layout");
  redirect(`${rutaInterna(ruta)}?mision=1#comprueba`);
}

/**
 * Emite (o recupera, si ya existía) el certificado del curso y manda al
 * alumno directo a verlo. issue_certificate ya revisa 100% de lecciones y
 * todos los quizzes aprobados — la interfaz solo oculta el botón antes de
 * eso, la RPC es quien de verdad lo exige.
 */
export async function emitirCertificado(datos: FormData) {
  const cursoId = String(datos.get("curso_id") ?? "");

  const sb = await clienteServidor();
  const { data, error } = await sb.rpc("issue_certificate", { check_course_id: cursoId });
  if (error) throw new Error(mensaje(error.message));

  const fila = Array.isArray(data) ? data[0] : data;
  const codigo = fila?.verification_code as string | undefined;
  if (!codigo) throw new Error("No se pudo generar el certificado. Intenta de nuevo.");

  redirect(`/certificado/${codigo}`);
}


/**
 * Compra de un curso o un paquete. El precio lo fija la base al crear la
 * intención de compra (create_purchase_intent), nunca el formulario; el
 * acceso lo abre solo el aviso de Mercado Pago tras consultar el pago.
 */
export async function comprar(datos: FormData) {
  const r = await iniciarCompra(String(datos.get("producto_id") ?? ""), String(datos.get("volver") ?? "/precios"));
  if ("error" in r) throw new Error(mensaje(r.error));
  redirect(r.url);
}

/** Alta en CurserIA Pro (cobro mensual con Mercado Pago). Mismo camino. */
export async function suscribirse(datos: FormData) {
  return comprar(datos);
}

/**
 * Guarda el cuaderno de una lección en la cuenta (tabla user_assets, con RLS:
 * cada quien solo lee y escribe lo suyo). Una entrada por lección: si ya hay,
 * se actualiza y sube de versión.
 */
export async function guardarEnTaller(
  leccionId: string,
  titulo: string,
  contenido: string
): Promise<{ ok: boolean; error?: string }> {
  const texto = contenido.slice(0, 20000);
  const nombre = titulo.trim().slice(0, 200) || "Mi borrador";
  if (!/^[0-9a-f-]{36}$/i.test(leccionId)) return { ok: false, error: "Lección no válida." };

  const sb = await clienteServidor();
  const { data: usuario } = await sb.auth.getUser();
  if (!usuario.user) return { ok: false, error: "Entra a tu cuenta para guardar." };

  const { data: previo } = await sb
    .from("user_assets")
    .select("id,version,content")
    .eq("lesson_id", leccionId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (previo) {
    if (previo.content === texto) return { ok: true };
    const { error } = await sb
      .from("user_assets")
      .update({ content: texto, title: nombre, version: (previo.version ?? 1) + 1, updated_at: new Date().toISOString() })
      .eq("id", previo.id);
    if (error) return { ok: false, error: "No se pudo guardar. Tu texto sigue en este teléfono." };
  } else {
    if (!texto.trim()) return { ok: true };
    const { error } = await sb
      .from("user_assets")
      .insert({ user_id: usuario.user.id, lesson_id: leccionId, title: nombre, content: texto, state: "draft" });
    if (error) return { ok: false, error: "No se pudo guardar. Tu texto sigue en este teléfono." };
  }
  revalidatePath("/mi-taller");
  return { ok: true };
}

/** Marca un borrador del taller como «listo» o «ya lo uso». */
export async function cambiarEstadoTaller(datos: FormData) {
  const id = String(datos.get("id") ?? "");
  const estado = String(datos.get("estado") ?? "");
  if (!["draft", "ready", "in_use"].includes(estado)) return;
  const sb = await clienteServidor();
  // RLS limita la actualización a las filas del propio usuario.
  await sb.from("user_assets").update({ state: estado, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/mi-taller");
}

export type EstadoOpinion = { ok?: boolean; error?: string };

/** Opinión de un alumno. Entra como «pendiente»: nada se publica sin revisar. */
export async function enviarOpinion(_prev: EstadoOpinion, datos: FormData): Promise<EstadoOpinion> {
  const cursoId = String(datos.get("curso_id") ?? "");
  const texto = String(datos.get("texto") ?? "").trim();
  const nombre = String(datos.get("nombre") ?? "").trim();
  const negocio = String(datos.get("negocio") ?? "").trim() || null;
  const ciudad = String(datos.get("ciudad") ?? "").trim() || null;
  if (texto.length < 20) return { error: "Cuéntanos un poco más (al menos 20 caracteres)." };
  if (texto.length > 1200) return { error: "Es muy largo: máximo 1,200 caracteres." };
  if (nombre.length < 2) return { error: "Escribe el nombre con el que quieres aparecer." };
  if (!datos.get("consentimiento")) return { error: "Necesitamos tu permiso para publicarla." };

  const sb = await clienteServidor();
  const { data: usuario } = await sb.auth.getUser();
  if (!usuario.user) return { error: "Entra a tu cuenta para opinar." };

  const { error } = await sb.from("testimonials").insert({
    user_id: usuario.user.id,
    course_id: cursoId,
    texto,
    nombre_publico: nombre.slice(0, 80),
    negocio: negocio?.slice(0, 120) ?? null,
    ciudad: ciudad?.slice(0, 80) ?? null,
    consentimiento: true,
  });
  if (error) return { error: "No se pudo enviar. ¿Estás inscrito en este curso?" };
  await registrar("opinion_enviada", { curso_id: cursoId });
  return { ok: true };
}

/**
 * Revisión con IA del cuaderno. Solo para quien puede ver la lección (gratis
 * o con acceso al curso), con límite diario. La llave vive en el servidor.
 */
export async function revisarBorrador(
  leccionId: string,
  borrador: string
): Promise<{ texto?: string; error?: string; restantes?: number }> {
  const { iaLista, revisarConIA } = await import("@/lib/ia");
  if (!iaLista()) return { error: "La revisión con IA no está disponible ahora." };
  const texto = borrador.trim();
  if (texto.length < 15) return { error: "Escribe un poco más antes de pedir la revisión." };
  if (texto.length > 6000) return { error: "Es muy largo para revisarlo de una vez (máximo 6,000 caracteres)." };
  if (!/^[0-9a-f-]{36}$/i.test(leccionId)) return { error: "Lección no válida." };

  const sb = await clienteServidor();
  const { data: usuario } = await sb.auth.getUser();
  if (!usuario.user) return { error: "Entra a tu cuenta para usar la revisión con IA." };

  const { data: leccion } = await sb
    .from("lessons")
    .select("title,outcome,is_preview,course_modules(course_id)")
    .eq("id", leccionId)
    .maybeSingle();
  if (!leccion) return { error: "Lección no encontrada." };
  const cursoId = (leccion.course_modules as unknown as { course_id: string } | null)?.course_id;
  if (!leccion.is_preview) {
    const { data: acceso } = await sb.rpc("has_course_access", { check_course_id: cursoId });
    if (acceso !== true) return { error: "La revisión con IA es para las lecciones de tus cursos." };
  }

  return revisarConIA({
    userId: usuario.user.id,
    leccion: leccion.title as string,
    resultado: (leccion.outcome as string | null) ?? null,
    borrador: texto,
  });
}


/** Guarda el objetivo inicial (user_goals, una fila por usuario, RLS propia). */
export async function guardarObjetivo(datos: FormData) {
  const { esObjetivo } = await import("@/lib/objetivos");
  const objetivo = datos.get("objetivo");
  if (!esObjetivo(objetivo)) return;
  const sb = await clienteServidor();
  const { data: usuario } = await sb.auth.getUser();
  if (!usuario.user) redirect("/entrar?volver=/mi-aprendizaje");
  await sb
    .from("user_goals")
    .upsert({ user_id: usuario.user.id, priority: objetivo, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  await registrar("objetivo_elegido", { objetivo });
  revalidatePath("/mi-aprendizaje");
}


/**
 * Resultado de la práctica de una lección (cuántas a la primera, confianza).
 * Solo para medir qué se entiende; no califica ni cuenta para el certificado.
 */
export async function registrarPractica(datos: {
  clave: string;
  aciertos: number;
  total: number;
  confianza: string | null;
}) {
  const clave = String(datos.clave ?? "").slice(0, 120);
  const total = Math.max(0, Math.min(20, Math.trunc(Number(datos.total) || 0)));
  const aciertos = Math.max(0, Math.min(total, Math.trunc(Number(datos.aciertos) || 0)));
  const confianza = ["alta", "media", "baja"].includes(String(datos.confianza)) ? String(datos.confianza) : null;
  if (!/^[a-z0-9-]+\/\d+\/\d+$/.test(clave) || total === 0) return;
  // Dos momentos: el resultado (al cerrar la última pregunta) y, si la
  // elige, la confianza. «tipo» evita contar dos veces los aciertos.
  await registrar("practica_respondida", { clave, aciertos, total, confianza, tipo: confianza ? "confianza" : "resultado" });
}
