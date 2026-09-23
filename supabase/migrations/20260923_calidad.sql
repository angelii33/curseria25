-- Calidad: lección gratis que cuenta, permisos más estrictos y RLS más rápida.
-- Aditiva: no borra datos ni tablas; solo reemplaza una función y ajusta
-- permisos, índices y la forma (no el significado) de las políticas.

-- ─── 1. La lección gratis también se puede completar ───────────────────────
-- Antes, solo quien tenía acceso al curso podía marcar una lección. La
-- lección abierta es la demostración del producto: quien tiene cuenta debe
-- poder guardarla como hecha. Solo aplica a lecciones is_preview de cursos
-- publicados; el resto sigue exigiendo has_course_access.
create or replace function public.mark_lesson_complete(check_lesson_id uuid)
returns table(lesson_id uuid, status text, completed_at timestamptz)
language plpgsql security definer set search_path = public
as $function$
#variable_conflict use_column
declare
  v_uid uuid := auth.uid();
  v_course_id uuid;
  v_preview boolean;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select cm.course_id, l.is_preview into v_course_id, v_preview
  from public.lessons l
  join public.course_modules cm on cm.id = l.module_id
  where l.id = check_lesson_id;

  if v_course_id is null then raise exception 'lesson_not_found'; end if;

  if not public.has_course_access(v_course_id)
     and not (v_preview and public.is_course_published(v_course_id)) then
    raise exception 'not_authorized_for_course';
  end if;

  insert into public.lesson_progress as lp (user_id, lesson_id, status, started_at, completed_at)
  values (v_uid, check_lesson_id, 'completed', now(), now())
  on conflict (user_id, lesson_id) do update
    set status = 'completed',
        started_at = coalesce(lp.started_at, now()),
        completed_at = coalesce(lp.completed_at, now());

  update public.enrollments e
     set last_accessed_at = now()
   where e.user_id = v_uid and e.course_id = v_course_id;

  return query
    select lp2.lesson_id, lp2.status, lp2.completed_at
    from public.lesson_progress lp2
    where lp2.user_id = v_uid and lp2.lesson_id = check_lesson_id;
end;
$function$;

-- ─── 2. Sin oráculo de respuestas ──────────────────────────────────────────
-- submit_quiz_answer dice si UNA respuesta es correcta: permitía probar
-- opciones una a una y aprobar sin saber. La app califica con
-- submit_quiz_attempt (todas juntas); esta queda solo para el servidor.
revoke execute on function public.submit_quiz_answer(uuid, uuid) from authenticated, anon, public;

-- ─── 3. Índices de llaves foráneas nuevas ──────────────────────────────────
create index if not exists idx_leads_user_id on public.leads(user_id);
create index if not exists idx_testimonials_user_id on public.testimonials(user_id);

-- ─── 4. RLS: auth.uid() una vez por consulta, no por fila ──────────────────
-- Misma regla, evaluada como subconsulta (recomendación de Supabase).
do $$
declare r record; v_q text; v_c text; v_sql text;
begin
  for r in
    select tablename, policyname, qual, with_check from pg_policies
    where schemaname = 'public'
      and (qual like '%auth.uid()%' or with_check like '%auth.uid()%')
      and coalesce(qual, '') not like '%select auth.uid()%'
      and coalesce(with_check, '') not like '%select auth.uid()%'
  loop
    v_q := replace(r.qual, 'auth.uid()', '(select auth.uid())');
    v_c := replace(r.with_check, 'auth.uid()', '(select auth.uid())');
    v_sql := format('alter policy %I on public.%I', r.policyname, r.tablename);
    if v_q is not null then v_sql := v_sql || format(' using (%s)', v_q); end if;
    if v_c is not null then v_sql := v_sql || format(' with check (%s)', v_c); end if;
    execute v_sql;
  end loop;
end $$;
