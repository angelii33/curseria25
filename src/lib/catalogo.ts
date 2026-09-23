import { clienteServidor } from "./supabase/server";

export type Curso = {
  id: string; slug: string; title: string; subtitle: string | null;
  level: string | null; duration_minutes: number | null; cover_url: string | null;
};
export type Modulo = {
  id: string; course_id: string; title: string; sort_order: number;
  capability: string | null; minutes_saved_weekly: number | null;
};
export type Leccion = {
  id: string; module_id: string; title: string; sort_order: number;
  is_preview: boolean; duration_minutes: number | null; outcome: string | null;
};

export const precio = (cents: number, moneda = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: moneda, minimumFractionDigits: 0 })
    .format(cents / 100);

export const folio = (m: number, l: number) =>
  `M${String(m).padStart(2, "0")}\u00b7L${String(l).padStart(2, "0")}`;

/** 135 → «2 h 15 min». Redondea a 5 minutos: nadie planea con 2,1 horas. */
export const horas = (min: number | null) => {
  if (!min) return "";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = Math.round((min % 60) / 5) * 5;
  return m === 0 ? `${h} h` : m === 60 ? `${h + 1} h` : `${h} h ${m} min`;
};

/** Ids de cursos en los que el usuario está inscrito. */
async function misInscripciones() {
  const sb = await clienteServidor();
  const { data } = await sb.from("enrollments").select("course_id");
  return new Set((data ?? []).map((e) => e.course_id as string));
}

/** Ids de lecciones que el usuario ya completó. */
async function misMisiones() {
  const sb = await clienteServidor();
  const { data } = await sb.from("user_missions").select("mission_id").eq("status", "completed");
  return new Set((data ?? []).map((m) => m.mission_id as string));
}

export type Pregunta = {
  id: string;
  texto: string;
  opciones: { id: string; texto: string }[];
};

/** Quiz de una leccion. Las respuestas correctas NUNCA salen del servidor:
 *  get_quiz_questions no devuelve is_correct y la calificacion la hace la RPC. */
export async function getQuiz(leccionId: string) {
  const sb = await clienteServidor();
  const { data: quiz } = await sb
    .from("quizzes").select("id,passing_score").eq("lesson_id", leccionId).maybeSingle();
  if (!quiz) return null;

  const { data: filas, error } = await sb.rpc("get_quiz_questions", { check_quiz_id: quiz.id });
  if (error || !filas?.length) return null;

  const mapa = new Map<string, Pregunta>();
  for (const f of filas as {
    question_id: string; question_text: string; question_order: number;
    answer_id: string; answer_text: string; answer_order: number;
  }[]) {
    if (!mapa.has(f.question_id)) {
      mapa.set(f.question_id, { id: f.question_id, texto: f.question_text, opciones: [] });
    }
    mapa.get(f.question_id)!.opciones.push({ id: f.answer_id, texto: f.answer_text });
  }

  const { data: intento } = await sb
    .from("quiz_attempts").select("score,passed,completed_at")
    .eq("quiz_id", quiz.id).order("completed_at", { ascending: false }).limit(1).maybeSingle();

  return {
    id: quiz.id as string,
    minimo: (quiz.passing_score as number) ?? 0,
    preguntas: [...mapa.values()],
    intento: intento ?? null,
  };
}

async function misCompletadas() {
  const sb = await clienteServidor();
  const { data } = await sb.from("lesson_progress").select("lesson_id").eq("status", "completed");
  return new Set((data ?? []).map((p) => p.lesson_id as string));
}

export async function getCatalogo() {
  const sb = await clienteServidor();
  const { data: cursos } = await sb
    .from("courses")
    .select("id,slug,title,subtitle,level,duration_minutes,cover_url")
    .eq("status", "published")
    .order("duration_minutes", { ascending: true });

  if (!cursos?.length) return [];
  const ids = cursos.map((c) => c.id);

  const [{ data: mods }, { data: prods }, inscritos, hechas] = await Promise.all([
    sb.from("course_modules").select("id,course_id,sort_order").in("course_id", ids),
    sb.from("products").select("course_id,price_cents,currency")
      .eq("status", "active").eq("type", "course").in("course_id", ids),
    misInscripciones(),
    misCompletadas(),
  ]);

  const modIds = (mods ?? []).map((m) => m.id);
  const { data: lecs } = modIds.length
    ? await sb.from("lessons")
        .select("id,module_id,is_preview,title,sort_order,duration_minutes,outcome")
        .in("module_id", modIds)
    : { data: [] as {
        id: string; module_id: string; is_preview: boolean;
        title: string; sort_order: number; duration_minutes: number | null;
        outcome: string | null;
      }[] };

  return (cursos as Curso[])
    .map((c) => {
      const misMods = (mods ?? []).filter((m) => m.course_id === c.id);
      const setMods = new Set(misMods.map((m) => m.id));
      const misLecs = (lecs ?? []).filter((l) => setMods.has(l.module_id));
      const p = (prods ?? []).find((x) => x.course_id === c.id);
      const completadas = misLecs.filter((l) => hechas.has(l.id)).length;

      // La lección abierta es el mejor diferenciador entre cursos del mismo
      // precio: dice exactamente qué vas a poder leer sin pagar.
      const orden = new Map(misMods.map((m) => [m.id, m.sort_order as number]));
      const abierta = misLecs
        .filter((l) => l.is_preview)
        .sort((a, b) =>
          (orden.get(a.module_id) ?? 0) - (orden.get(b.module_id) ?? 0) ||
          a.sort_order - b.sort_order
        )[0];

      return {
        ...c,
        modulos: misMods.length,
        lecciones: misLecs.length,
        gratis: misLecs.filter((l) => l.is_preview).length,
        precio_cents: p?.price_cents ?? null,
        moneda: p?.currency ?? "MXN",
        inscrito: inscritos.has(c.id),
        completadas,
        pct: misLecs.length ? Math.round((completadas / misLecs.length) * 100) : 0,
        abiertaTitulo: abierta?.title ?? null,
        abiertaMin: abierta?.duration_minutes ?? null,
        abiertaResultado: abierta?.outcome ?? null,
        // Ruta directa a la lección abierta: el visitante entra a la
        // lección, no a otra página que le pida un clic más.
        abiertaRuta: abierta
          ? `/cursos/${c.slug}/${orden.get(abierta.module_id) ?? 1}/${abierta.sort_order}`
          : null,
      };
    })
    .filter((c) => c.lecciones > 0);
}

export async function getCurso(slug: string) {
  const sb = await clienteServidor();
  const { data: curso } = await sb
    .from("courses").select("id,slug,title,subtitle,level,duration_minutes,cover_url")
    .eq("slug", slug).eq("status", "published").maybeSingle();
  if (!curso) return null;

  const { data: mods } = await sb
    .from("course_modules")
    .select("id,course_id,title,sort_order,capability,minutes_saved_weekly")
    .eq("course_id", curso.id).order("sort_order");

  const modIds = (mods ?? []).map((m) => m.id);
  const { data: lecs } = modIds.length
    ? await sb.from("lessons")
        .select("id,module_id,title,sort_order,is_preview,duration_minutes,outcome")
        .in("module_id", modIds).order("sort_order")
    : { data: [] as Leccion[] };

  const [{ data: prod }, inscritos, hechas] = await Promise.all([
    sb.from("products").select("id,price_cents,currency,metadata")
      .eq("course_id", curso.id).eq("status", "active").eq("type", "course").maybeSingle(),
    misInscripciones(),
    misCompletadas(),
  ]);

  const modulos = ((mods as Modulo[]) ?? []).map((m) => ({
    ...m,
    lecciones: ((lecs as Leccion[]) ?? []).filter((l) => l.module_id === m.id),
  }));

  const todas = modulos.flatMap((m) => m.lecciones);
  const completadas = todas.filter((l) => hechas.has(l.id)).length;

  // Quizzes del curso que faltan por aprobar. issue_certificate exige TODOS:
  // sin esto, «Ver mi certificado» aparecía y la RPC lo rechazaba. Solo se
  // consulta para quien está inscrito (RLS no deja ver quizzes sin acceso).
  let quizzesPendientes: { mod: number; lec: number; titulo: string }[] = [];
  if (inscritos.has(curso.id) && todas.length) {
    const { data: qs } = await sb.from("quizzes").select("id,lesson_id").in("lesson_id", todas.map((l) => l.id));
    if (qs?.length) {
      const { data: aprobados } = await sb
        .from("quiz_attempts").select("quiz_id").eq("passed", true).in("quiz_id", qs.map((q) => q.id));
      const ok = new Set((aprobados ?? []).map((a) => a.quiz_id as string));
      quizzesPendientes = qs
        .filter((q) => !ok.has(q.id as string))
        .map((q) => {
          const m = modulos.find((x) => x.lecciones.some((l) => l.id === q.lesson_id))!;
          const l = m.lecciones.find((x) => x.id === q.lesson_id)!;
          return { mod: m.sort_order, lec: l.sort_order, titulo: l.title };
        })
        .sort((a, b) => a.mod - b.mod || a.lec - b.lec);
    }
  }

  return {
    curso: curso as Curso,
    precio_cents: prod?.price_cents ?? null,
    moneda: prod?.currency ?? "MXN",
    producto_id: (prod?.id as string | undefined) ?? null,
    lanzamiento: Boolean((prod?.metadata as { es_lanzamiento?: boolean } | null)?.es_lanzamiento),
    modulos,
    inscrito: inscritos.has(curso.id),
    hechas,
    total: todas.length,
    completadas,
    quizzesPendientes,
    pct: todas.length ? Math.round((completadas / todas.length) * 100) : 0,
    siguiente: (() => {
      for (const m of modulos)
        for (const l of m.lecciones)
          if (!hechas.has(l.id)) return { mod: m.sort_order, lec: l.sort_order, title: l.title };
      return null;
    })(),
  };
}

export async function getLeccion(slug: string, mod: number, lec: number) {
  const sb = await clienteServidor();
  const datos = await getCurso(slug);
  if (!datos) return null;

  const m = datos.modulos.find((x) => x.sort_order === mod);
  const l = m?.lecciones.find((x) => x.sort_order === lec);
  if (!m || !l) return null;

  const [{ data: recurso }, { data: mision }, { data: criterios }, misiones, quiz] = await Promise.all([
    sb.from("lesson_resources").select("content_markdown").eq("lesson_id", l.id).maybeSingle(),
    sb.from("mission_builders").select("id,title,intro,asset_title").eq("lesson_id", l.id).maybeSingle(),
    sb.from("mission_checklists").select("criterion,detail,sort_order")
      .eq("lesson_id", l.id).order("sort_order"),
    misMisiones(),
    getQuiz(l.id),
  ]);

  const planas = datos.modulos.flatMap((x) =>
    x.lecciones.map((y) => ({ mod: x.sort_order, lec: y.sort_order })));
  const i = planas.findIndex((x) => x.mod === mod && x.lec === lec);

  return {
    curso: datos.curso,
    modulo: m,
    leccion: l,
    inscrito: datos.inscrito,
    hecha: datos.hechas.has(l.id),
    contenido: recurso?.content_markdown ?? null,
    mision: mision ?? null,
    misionHecha: mision ? misiones.has(mision.id as string) : false,
    criterios: criterios ?? [],
    quiz,
    anterior: i > 0 ? planas[i - 1] : null,
    siguiente: i < planas.length - 1 ? planas[i + 1] : null,
    posicion: i + 1,
    total: planas.length,
    // Datos reales del curso para el cierre de las lecciones gratuitas.
    // Se derivan de lo que ya se consultó: ningún viaje extra a la base.
    precio_cents: datos.precio_cents,
    moneda: datos.moneda,
    modulosTotales: datos.modulos.length,
    leccionesAbiertas: datos.modulos
      .flatMap((x) => x.lecciones)
      .filter((y) => y.is_preview).length,
    // Una entrada por lección del curso, en orden, para dibujar el mapa.
    // Solo lleva lo que el mapa necesita: nada de contenido ni IDs internos.
    mapa: datos.modulos.flatMap((x) =>
      x.lecciones.map((y) => ({
        mod: x.sort_order,
        lec: y.sort_order,
        titulo: y.title,
        gratis: y.is_preview,
        hecha: datos.hechas.has(y.id),
        actual: y.id === l.id,
      }))
    ),
  };
}

/** Fechas en que el usuario completó lecciones en los últimos 7 días.
 *  Pasa por RLS: cada quien solo ve su propio avance. */
export async function miSemana(): Promise<string[]> {
  const sb = await clienteServidor();
  const desde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await sb
    .from("lesson_progress")
    .select("completed_at")
    .eq("status", "completed")
    .gte("completed_at", desde);
  return (data ?? []).map((f) => f.completed_at as string).filter(Boolean);
}

export type Oferta = {
  id: string;
  slug: string;
  nombre: string;
  tipo: "bundle" | "membership";
  precio_cents: number;
  moneda: string;
  descripcion: string | null;
  destacado: boolean;
  /** Cursos publicados que incluye, con su precio suelto. */
  cursos: { id: string; slug: string; titulo: string; precio_cents: number | null }[];
  /** Suma de los precios sueltos: solo se muestra si es mayor que el precio. */
  suelto_cents: number;
};

/** Paquetes y membresía activos, con los cursos que abren. Todo de la base. */
export async function getOfertas(): Promise<Oferta[]> {
  const sb = await clienteServidor();
  const [{ data: prods }, { data: enlaces }, { data: cursos }, { data: sueltos }] = await Promise.all([
    sb.from("products").select("id,slug,name,type,price_cents,currency,metadata")
      .eq("status", "active").in("type", ["bundle", "membership"]).order("price_cents"),
    sb.from("product_courses").select("product_id,course_id"),
    sb.from("courses").select("id,slug,title").eq("status", "published"),
    sb.from("products").select("course_id,price_cents").eq("status", "active").eq("type", "course"),
  ]);
  const publicados = cursos ?? [];
  const precioDe = new Map((sueltos ?? []).map((p) => [p.course_id as string, p.price_cents as number]));

  return (prods ?? []).map((p) => {
    const meta = (p.metadata ?? {}) as { descripcion?: string; destacado?: boolean };
    const ids = new Set((enlaces ?? []).filter((e) => e.product_id === p.id).map((e) => e.course_id as string));
    // La membresía abre todo lo publicado.
    const incluidos = p.type === "membership" ? publicados : publicados.filter((c) => ids.has(c.id));
    const lista = incluidos.map((c) => ({
      id: c.id as string, slug: c.slug as string, titulo: c.title as string,
      precio_cents: precioDe.get(c.id as string) ?? null,
    }));
    return {
      id: p.id as string,
      slug: p.slug as string,
      nombre: p.name as string,
      tipo: p.type as Oferta["tipo"],
      precio_cents: p.price_cents as number,
      moneda: (p.currency as string) ?? "MXN",
      descripcion: meta.descripcion ?? null,
      destacado: Boolean(meta.destacado),
      cursos: lista,
      suelto_cents: lista.reduce((s, c) => s + (c.precio_cents ?? 0), 0),
    };
  }).filter((o) => o.tipo === "membership" || o.cursos.length > 0);
}
