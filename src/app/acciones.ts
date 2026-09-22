"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clienteServidor } from "@/lib/supabase/server";

/** Traduce los errores de la base a algo que un dueño de negocio entienda. */
function mensaje(error: string): string {
  const t = error.toLowerCase();
  if (t.includes("not_authenticated")) return "Necesitas iniciar sesión para esto.";
  if (t.includes("not_authorized_for_course")) return "Necesitas acceso a este curso para continuar.";
  if (t.includes("course_not_published")) return "Este curso no está disponible ahora mismo.";
  if (t.includes("course_not_completed")) return "Termina las lecciones que faltan para emitir tu certificado.";
  if (t.includes("quizzes_not_passed")) return "Aprueba todos los quizzes del curso para emitir tu certificado.";
  if (t.includes("course_not_found") || t.includes("lesson_not_found")) return "No encontramos ese contenido.";
  if (t.includes("invalid login credentials")) return "El correo o la contraseña no coinciden.";
  if (t.includes("user already registered")) return "Ese correo ya tiene cuenta. Inicia sesión.";
  if (t.includes("password should be at least")) return "La contraseña necesita al menos 6 caracteres.";
  if (t.includes("email not confirmed")) return "Confirma tu correo con el enlace que te enviamos y vuelve a entrar.";
  if (t.includes("for security purposes")) return "Espera un minuto antes de volver a intentarlo.";
  return "Algo salió mal. Vuelve a intentarlo.";
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
  redirect(volver.startsWith("/") ? volver : "/mi-aprendizaje");
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
  redirect(volver.startsWith("/") ? volver : "/mi-aprendizaje");
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
  if (error) throw new Error(mensaje(error.message));

  revalidatePath("/", "layout");
  redirect(`/cursos/${slug}`);
}

/** Marca la lección. El backend valida el acceso antes de escribir. */
export async function completarLeccion(datos: FormData) {
  const leccionId = String(datos.get("leccion_id") ?? "");
  const ruta = String(datos.get("ruta") ?? "/");

  const sb = await clienteServidor();
  const { error } = await sb.rpc("mark_lesson_complete", { check_lesson_id: leccionId });
  if (error) throw new Error(mensaje(error.message));

  revalidatePath("/", "layout");
  redirect(ruta);
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
  redirect(ruta);
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
