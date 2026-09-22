"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clienteServidor } from "@/lib/supabase/server";
import { registrar } from "@/lib/analitica";
import { crearPreferencia, crearSuscripcion, mercadoPagoListo } from "@/lib/mercadopago";

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
  if (t.includes("invalid login credentials")) return "El correo o la contraseña no coinciden.";
  if (t.includes("user already registered")) return "Ese correo ya tiene cuenta. Inicia sesión.";
  if (t.includes("password should be at least")) return "La contraseña necesita al menos 6 caracteres.";
  if (t.includes("email not confirmed")) return "Confirma tu correo con el enlace que te enviamos y vuelve a entrar.";
  if (t.includes("for security purposes")) return "Espera un minuto antes de volver a intentarlo.";
  return "Algo salió mal. Vuelve a intentarlo.";
}

/** Solo rutas internas. Un campo oculto del formulario lo puede editar
 *  cualquiera: sin esto, `redirect()` serviría de trampolín a otro sitio. */
function rutaInterna(ruta: string, porDefecto = "/"): string {
  return ruta.startsWith("/") && !ruta.startsWith("//") && !ruta.includes("\\") ? ruta : porDefecto;
}

export type Estado = { error?: string; aviso?: string; enviado?: boolean; correo?: string };

/**
 * Paso 1: pedir el código. Sirve para entrar Y para registrarse: si el correo
 * no existe, Supabase crea la cuenta. No hay contraseñas en todo el producto.
 */
export async function pedirCodigo(_prev: Estado, datos: FormData): Promise<Estado> {
  const correo = String(datos.get("correo") ?? "").trim().toLowerCase();
  const nombre = String(datos.get("nombre") ?? "").trim();
  if (!correo || !correo.includes("@")) {
    return { error: "Escribe un correo válido." };
  }

  const sb = await clienteServidor();
  const { error } = await sb.auth.signInWithOtp({
    email: correo,
    options: {
      shouldCreateUser: true,
      data: nombre ? { display_name: nombre } : undefined,
    },
  });
  if (error) return { error: mensaje(error.message), correo };

  return { enviado: true, correo };
}

/** Paso 2: canjear el código de 6 dígitos por una sesión. */
export async function verificarCodigo(_prev: Estado, datos: FormData): Promise<Estado> {
  const correo = String(datos.get("correo") ?? "").trim().toLowerCase();
  const codigo = String(datos.get("codigo") ?? "").replace(/\D/g, "");
  if (codigo.length !== 6) {
    return { enviado: true, correo, error: "El código son 6 dígitos." };
  }

  const sb = await clienteServidor();
  const { error } = await sb.auth.verifyOtp({ email: correo, token: codigo, type: "email" });
  if (error) return { enviado: true, correo, error: mensaje(error.message) };

  const volver = String(datos.get("volver") ?? "");
  revalidatePath("/", "layout");
  redirect(rutaInterna(volver, "/mi-aprendizaje"));
}

/** Vía de respaldo: contraseña. Se mantiene mientras el correo por código
 *  no esté confirmado en producción. Se retirará después. */
export async function entrarConClave(_prev: Estado, datos: FormData): Promise<Estado> {
  const correo = String(datos.get("correo") ?? "").trim().toLowerCase();
  const clave = String(datos.get("clave") ?? "");
  if (!correo || !clave) return { error: "Escribe tu correo y tu contraseña." };

  const sb = await clienteServidor();
  const { error } = await sb.auth.signInWithPassword({ email: correo, password: clave });
  if (error) return { error: mensaje(error.message) };

  const volver = String(datos.get("volver") ?? "");
  revalidatePath("/", "layout");
  redirect(rutaInterna(volver, "/mi-aprendizaje"));
}

export async function salir() {
  const sb = await clienteServidor();
  await sb.auth.signOut();
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

/** Marca la lección. El backend valida el acceso antes de escribir. */
export async function completarLeccion(datos: FormData) {
  const leccionId = String(datos.get("leccion_id") ?? "");
  const ruta = String(datos.get("ruta") ?? "/");

  const sb = await clienteServidor();
  const { error } = await sb.rpc("mark_lesson_complete", { check_lesson_id: leccionId });
  if (error) throw new Error(mensaje(error.message));

  await registrar("leccion_completada", { ruta: rutaInterna(ruta) });
  revalidatePath("/", "layout");
  // ?hecha=1 dispara el aviso breve de «lección completada» en la página.
  redirect(`${rutaInterna(ruta)}?hecha=1#cierre`);
}

export type ResultadoQuiz = {
  error?: string;
  /** Porcentaje 0-100 que devuelve submit_quiz_attempt, no numero de aciertos. */
  puntaje?: number;
  aprobado?: boolean;
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
  revalidatePath("/", "layout");
  return {
    puntaje: fila?.score ?? 0,
    aprobado: Boolean(fila?.passed),
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

/** Añade un parámetro a una ruta interna respetando su «#ancla». */
function conParametro(ruta: string, param: string) {
  const [camino, ancla] = ruta.split("#");
  return `${camino}${camino.includes("?") ? "&" : "?"}${param}${ancla ? `#${ancla}` : ""}`;
}

/**
 * Compra de un curso o un paquete. El precio lo fija la base al crear la
 * intención de compra (create_purchase_intent), nunca el formulario; el
 * acceso lo abre solo el aviso de Mercado Pago tras consultar el pago.
 */
export async function comprar(datos: FormData) {
  const productoId = String(datos.get("producto_id") ?? "");
  const volver = rutaInterna(String(datos.get("volver") ?? "/precios"), "/precios");

  const sb = await clienteServidor();
  const { data: usuario } = await sb.auth.getUser();
  if (!usuario.user) redirect(`/entrar?volver=${encodeURIComponent(volver)}`);

  // Sin llaves de Mercado Pago no se crea nada: se avisa con calma.
  if (!mercadoPagoListo()) redirect(conParametro(volver, "acceso=pendiente"));

  const { data, error } = await sb.rpc("create_purchase_intent", { check_product_id: productoId });
  if (error) {
    if (error.message.includes("already_owned")) redirect(conParametro(volver, "acceso=ya"));
    throw new Error(mensaje(error.message));
  }
  const intento = Array.isArray(data) ? data[0] : data;
  await registrar("checkout_iniciado", { producto_id: productoId, centavos: intento.amount_cents });
  const { data: producto } = await sb.from("products").select("name").eq("id", productoId).maybeSingle();

  const destino = await crearPreferencia({
    compraId: intento.purchase_id,
    titulo: producto?.name ?? "Curso de Listo",
    centavos: intento.amount_cents,
    moneda: intento.currency,
    email: usuario.user.email,
    volverA: volver.split("#")[0],
  });
  redirect(destino);
}

/** Alta en Listo Pro (cobro mensual con Mercado Pago). */
export async function suscribirse(datos: FormData) {
  const productoId = String(datos.get("producto_id") ?? "");
  const volver = rutaInterna(String(datos.get("volver") ?? "/precios"), "/precios");

  const sb = await clienteServidor();
  const { data: usuario } = await sb.auth.getUser();
  if (!usuario.user?.email) redirect(`/entrar?volver=${encodeURIComponent(volver)}`);
  if (!mercadoPagoListo()) redirect(conParametro(volver, "acceso=pendiente"));

  const { data, error } = await sb.rpc("create_subscription_intent", { check_product_id: productoId });
  if (error) {
    if (error.message.includes("already_subscribed")) redirect(conParametro(volver, "acceso=ya"));
    throw new Error(mensaje(error.message));
  }
  const intento = Array.isArray(data) ? data[0] : data;

  await registrar("suscripcion_iniciada", { producto_id: productoId });
  const destino = await crearSuscripcion({
    suscripcionId: intento.subscription_id,
    titulo: intento.product_name,
    centavos: intento.amount_cents,
    moneda: intento.currency,
    email: usuario.user.email,
  });
  redirect(destino);
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

export type EstadoCorreo = { ok?: boolean; error?: string };

/** Deja el correo para recibir avisos. Validación y deduplicado en la RPC. */
export async function capturarCorreo(_prev: EstadoCorreo, datos: FormData): Promise<EstadoCorreo> {
  const correo = String(datos.get("correo") ?? "").trim().toLowerCase();
  const origen = String(datos.get("origen") ?? "sitio").slice(0, 60);
  const curso = String(datos.get("curso") ?? "").slice(0, 120) || null;
  if (!datos.get("acepto")) return { error: "Marca la casilla para aceptar el aviso de privacidad." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo) || correo.length > 254) {
    return { error: "Escribe un correo válido." };
  }
  const sb = await clienteServidor();
  const { error } = await sb.rpc("capturar_lead", { p_email: correo, p_origen: origen, p_curso_slug: curso });
  if (error) return { error: "No se pudo guardar. Intenta de nuevo en un momento." };
  await registrar("correo_capturado", { origen, curso });
  return { ok: true };
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

