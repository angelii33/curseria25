-- ============================================================================
-- LISTO — Capa comercial: paquetes, membresía, captura de correos y
-- testimonios. Aditiva: no borra datos ni columnas. Todo con RLS.
-- ============================================================================

-- ─── 1. Paquetes: qué cursos incluye cada producto «bundle» ────────────────
create table if not exists public.product_courses (
  product_id uuid not null references public.products(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete restrict,
  primary key (product_id, course_id)
);
alter table public.product_courses enable row level security;
drop policy if exists product_courses_public_read on public.product_courses;
create policy product_courses_public_read on public.product_courses
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'active'));
drop policy if exists product_courses_admin_all on public.product_courses;
create policy product_courses_admin_all on public.product_courses
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create index if not exists idx_product_courses_course on public.product_courses(course_id);

-- Una compra de paquete da un acceso POR CURSO: el índice pasa de
-- «uno por compra» a «uno por compra y curso».
drop index if exists public.entitlements_source_purchase_unique;
create unique index if not exists entitlements_source_purchase_course_unique
  on public.entitlements (source_purchase_id, course_id)
  where source_purchase_id is not null;

-- Cursos que cubre un producto (curso suelto o paquete).
create or replace function public.product_course_ids(check_product_id uuid)
returns setof uuid
language sql stable security definer set search_path = public, pg_temp
as $$
  select p.course_id from public.products p where p.id = check_product_id and p.course_id is not null
  union
  select pc.course_id from public.product_courses pc where pc.product_id = check_product_id;
$$;
revoke all on function public.product_course_ids(uuid) from public, anon, authenticated;
grant execute on function public.product_course_ids(uuid) to service_role;

-- ─── 2. Intención de compra: cursos y paquetes ─────────────────────────────
create or replace function public.create_purchase_intent(check_product_id uuid)
returns table(purchase_id uuid, amount_cents integer, currency text, course_id uuid)
language plpgsql security definer set search_path = public, pg_temp
as $function$
declare
  v_uid uuid := auth.uid();
  v_product public.products%rowtype;
  v_purchase public.purchases%rowtype;
  v_total int; v_publicados int; v_con_acceso int;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select * into v_product from public.products where id = check_product_id and status = 'active';
  if not found then raise exception 'product_not_available'; end if;
  if v_product.type not in ('course', 'bundle') then raise exception 'product_type_not_supported'; end if;
  if v_product.billing_interval is not null then raise exception 'recurring_not_supported'; end if;

  select count(*),
         count(*) filter (where c.status = 'published'),
         count(*) filter (where public.has_course_access(c.id))
    into v_total, v_publicados, v_con_acceso
    from public.product_course_ids(v_product.id) x(id)
    join public.courses c on c.id = x.id;

  if v_total = 0 then raise exception 'product_without_course'; end if;
  if v_publicados < v_total then raise exception 'course_not_available'; end if;
  -- Nadie paga dos veces por lo que ya tiene.
  if v_con_acceso = v_total then raise exception 'already_owned'; end if;

  insert into public.purchases (user_id, product_id, provider, amount_cents, currency, status)
  values (v_uid, v_product.id, 'mercadopago', v_product.price_cents, v_product.currency, 'created')
  returning * into v_purchase;

  return query select v_purchase.id, v_purchase.amount_cents, v_purchase.currency, v_product.course_id;
end;
$function$;

-- ─── 3. Conceder acceso tras el pago (solo el servidor) ────────────────────
create or replace function public.grant_purchase_access(
  p_purchase_id uuid, p_provider_payment_id text, p_amount_cents integer, p_currency text)
returns table(enrollment_id uuid, entitlement_id uuid, already_granted boolean)
language plpgsql security definer set search_path = public, pg_temp
as $function$
declare
  v_p public.purchases%rowtype;
  v_course uuid; v_enr uuid; v_ent uuid; v_ya boolean := false;
  v_primer_enr uuid; v_primer_ent uuid;
begin
  select * into v_p from public.purchases where id = p_purchase_id for update;
  if not found then raise exception 'purchase_not_found'; end if;

  -- El monto y la moneda que reporta Mercado Pago deben coincidir con los de
  -- la compra, que se fijaron desde el producto al crear la intención.
  if v_p.amount_cents <> p_amount_cents or v_p.currency <> p_currency then
    raise exception 'amount_mismatch';
  end if;
  if v_p.status in ('refunded','chargeback','cancelled','rejected','expired') then
    raise exception 'purchase_not_payable';
  end if;
  if v_p.provider_payment_id is not null and v_p.provider_payment_id <> p_provider_payment_id then
    raise exception 'payment_already_linked';
  end if;

  if v_p.status = 'approved' then
    v_ya := true;
  else
    update public.purchases
       set status = 'approved', provider_payment_id = p_provider_payment_id,
           purchased_at = now(), updated_at = now()
     where id = v_p.id;
    insert into public.audit_logs (actor_id, action, entity_type, entity_id, before, after)
    values (null, 'purchase_approved', 'purchase', v_p.id,
            jsonb_build_object('status', v_p.status),
            jsonb_build_object('status', 'approved', 'provider_payment_id', p_provider_payment_id));
  end if;

  for v_course in select * from public.product_course_ids(v_p.product_id) loop
    insert into public.enrollments (user_id, course_id) values (v_p.user_id, v_course)
    on conflict (user_id, course_id) do nothing;
    select e.id into v_enr from public.enrollments e where e.user_id = v_p.user_id and e.course_id = v_course;

    insert into public.entitlements (user_id, scope, course_id, source_purchase_id)
    values (v_p.user_id, 'course', v_course, v_p.id)
    on conflict (source_purchase_id, course_id) where source_purchase_id is not null do nothing;
    select t.id into v_ent from public.entitlements t
     where t.source_purchase_id = v_p.id and t.course_id = v_course;

    v_primer_enr := coalesce(v_primer_enr, v_enr);
    v_primer_ent := coalesce(v_primer_ent, v_ent);
  end loop;

  if v_primer_ent is null then raise exception 'product_without_course'; end if;
  return query select v_primer_enr, v_primer_ent, v_ya;
end;
$function$;

-- Las funciones antiguas de una sola concesión quedan compatibles con el
-- nuevo índice (un acceso por curso dentro de la compra).
create or replace function public.grant_entitlement_for_purchase(check_purchase_id uuid)
returns table(entitlement_id uuid, granted boolean, already_granted boolean)
language plpgsql security definer set search_path = public, pg_temp
as $function$
declare
  v_purchase public.purchases%rowtype; v_course uuid; v_id uuid; v_nuevo boolean := false; v_primero uuid;
begin
  select * into v_purchase from public.purchases where id = check_purchase_id;
  if not found then raise exception 'purchase_not_found'; end if;
  if v_purchase.status <> 'approved' then raise exception 'purchase_not_approved'; end if;
  if v_purchase.provider_payment_id is null or length(trim(v_purchase.provider_payment_id)) = 0 then
    raise exception 'payment_not_verified';
  end if;
  for v_course in select * from public.product_course_ids(v_purchase.product_id) loop
    insert into public.entitlements (user_id, scope, course_id, source_purchase_id)
    values (v_purchase.user_id, 'course', v_course, check_purchase_id)
    on conflict (source_purchase_id, course_id) where source_purchase_id is not null do nothing
    returning id into v_id;
    if v_id is not null then v_nuevo := true; end if;
    select id into v_id from public.entitlements where source_purchase_id = check_purchase_id and course_id = v_course;
    v_primero := coalesce(v_primero, v_id);
  end loop;
  if v_primero is null then raise exception 'product_without_course'; end if;
  return query select v_primero, v_nuevo, not v_nuevo;
end;
$function$;

create or replace function public.restore_entitlement_for_purchase(check_purchase_id uuid)
returns table(entitlement_id uuid, restored boolean, already_active boolean)
language plpgsql security definer set search_path = public, pg_temp
as $function$
declare v_purchase public.purchases%rowtype; v_n int; v_id uuid;
begin
  select * into v_purchase from public.purchases where id = check_purchase_id;
  if not found then raise exception 'purchase_not_found'; end if;
  if v_purchase.status <> 'approved' then raise exception 'purchase_not_approved'; end if;
  select id into v_id from public.entitlements where source_purchase_id = check_purchase_id limit 1;
  if v_id is null then raise exception 'entitlement_not_found'; end if;
  update public.entitlements set revoked_at = null, updated_at = now()
   where source_purchase_id = check_purchase_id and revoked_at is not null;
  get diagnostics v_n = row_count;
  return query select v_id, v_n > 0, v_n = 0;
end;
$function$;

-- ─── 4. Membresía (Listo Pro) ──────────────────────────────────────────────
create or replace function public.create_subscription_intent(check_product_id uuid)
returns table(subscription_id uuid, amount_cents integer, currency text, billing_interval text, product_name text)
language plpgsql security definer set search_path = public, pg_temp
as $function$
declare v_uid uuid := auth.uid(); v_product public.products%rowtype; v_sub public.subscriptions%rowtype;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_product from public.products
   where id = check_product_id and status = 'active' and type = 'membership' and billing_interval is not null;
  if not found then raise exception 'product_not_available'; end if;
  if exists (select 1 from public.subscriptions s
              where s.user_id = v_uid and s.product_id = v_product.id and s.status = 'active') then
    raise exception 'already_subscribed';
  end if;
  insert into public.subscriptions (user_id, product_id, provider, status)
  values (v_uid, v_product.id, 'mercadopago', 'pending')
  returning * into v_sub;
  return query select v_sub.id, v_product.price_cents, v_product.currency, v_product.billing_interval, v_product.name;
end;
$function$;

create or replace function public.apply_subscription_status(
  p_subscription_id uuid, p_provider_subscription_id text, p_status text, p_period_end timestamptz)
returns text
language plpgsql security definer set search_path = public, pg_temp
as $function$
declare v_s public.subscriptions%rowtype; v_fin timestamptz;
begin
  if p_status not in ('active','pending','paused','cancelled','expired','payment_failed') then
    raise exception 'invalid_status';
  end if;
  select * into v_s from public.subscriptions where id = p_subscription_id for update;
  if not found then raise exception 'subscription_not_found'; end if;
  if v_s.provider_subscription_id is not null and v_s.provider_subscription_id <> p_provider_subscription_id then
    raise exception 'subscription_already_linked';
  end if;

  update public.subscriptions
     set status = p_status, provider_subscription_id = p_provider_subscription_id,
         current_period_end = coalesce(p_period_end, current_period_end),
         cancel_at = case when p_status = 'cancelled' then coalesce(cancel_at, now()) else cancel_at end,
         updated_at = now()
   where id = v_s.id;

  if p_status = 'active' then
    -- Acceso a todo hasta el fin del periodo pagado, con 3 días de gracia
    -- para que un cobro que tarda no deje fuera a nadie.
    v_fin := coalesce(p_period_end, now() + interval '31 days') + interval '3 days';
    insert into public.entitlements (user_id, scope, source_subscription_id, expires_at)
    values (v_s.user_id, 'all_access', v_s.id, v_fin)
    on conflict (source_subscription_id) where source_subscription_id is not null
    do update set expires_at = excluded.expires_at, revoked_at = null, updated_at = now();
  elsif p_status = 'cancelled' then
    -- Cancelar no quita lo ya pagado: el acceso dura hasta el fin del periodo.
    update public.entitlements
       set expires_at = coalesce(least(expires_at, coalesce(p_period_end, v_s.current_period_end) + interval '3 days'), now()),
           updated_at = now()
     where source_subscription_id = v_s.id;
  elsif p_status in ('expired','paused','payment_failed') then
    update public.entitlements set expires_at = now(), updated_at = now()
     where source_subscription_id = v_s.id;
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before, after)
  values (null, 'subscription_' || p_status, 'subscription', v_s.id,
          jsonb_build_object('status', v_s.status), jsonb_build_object('status', p_status, 'period_end', p_period_end));
  return p_status;
end;
$function$;

revoke all on function public.create_subscription_intent(uuid) from public, anon;
grant execute on function public.create_subscription_intent(uuid) to authenticated, service_role;
revoke all on function public.apply_subscription_status(uuid, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.apply_subscription_status(uuid, text, text, timestamptz) to service_role;
revoke all on function public.grant_purchase_access(uuid, text, integer, text) from public, anon, authenticated;
grant execute on function public.grant_purchase_access(uuid, text, integer, text) to service_role;

-- ─── 5. Inscribirse también con la membresía ───────────────────────────────
-- Igual que antes, más un caso: quien tiene acceso total (membresía) puede
-- inscribirse. En ese caso NO se crea un acceso por curso: al terminar la
-- membresía, el acceso termina con ella.
create or replace function public.enroll_in_course(check_course_id uuid)
returns table(enrollment_id uuid, entitlement_id uuid, already_enrolled boolean)
language plpgsql security definer set search_path = public, pg_temp
as $function$
declare
  v_uid uuid := auth.uid();
  v_published boolean; v_enr_id uuid; v_ent_id uuid; v_already boolean := false;
  v_por_curso boolean; v_gratis boolean; v_admin boolean; v_membresia boolean;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select (c.status = 'published') into v_published from public.courses c where c.id = check_course_id;
  if v_published is null then raise exception 'course_not_found'; end if;
  if v_published is not true then raise exception 'course_not_published'; end if;

  select exists (select 1 from public.entitlements t
                  where t.user_id = v_uid and t.scope = 'course' and t.course_id = check_course_id
                    and t.revoked_at is null) into v_por_curso;
  select exists (select 1 from public.products p
                  where p.course_id = check_course_id and p.status = 'active'
                    and p.billing_interval is null and p.price_cents = 0) into v_gratis;
  v_admin := public.is_admin(v_uid);
  v_membresia := public.has_course_access(check_course_id);

  if not (v_por_curso or v_gratis or v_admin or v_membresia) then
    raise exception 'payment_required';
  end if;

  select e.id into v_enr_id from public.enrollments e where e.user_id = v_uid and e.course_id = check_course_id;
  if v_enr_id is not null then
    v_already := true;
  else
    insert into public.enrollments(user_id, course_id) values (v_uid, check_course_id) returning id into v_enr_id;
  end if;

  select t.id into v_ent_id from public.entitlements t
   where t.user_id = v_uid and t.scope = 'course' and t.course_id = check_course_id and t.revoked_at is null;
  if v_ent_id is null and (v_gratis or v_admin) then
    insert into public.entitlements(user_id, scope, course_id, granted_by)
    values (v_uid, 'course', check_course_id, v_uid) returning id into v_ent_id;
  end if;

  return query select v_enr_id, v_ent_id, v_already;
end;
$function$;

-- ─── 6. Captura de correos (quien no compra hoy) ───────────────────────────
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) between 5 and 254),
  origen text not null check (length(origen) between 1 and 60),
  curso_slug text check (curso_slug is null or length(curso_slug) <= 120),
  consentimiento boolean not null default true,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index if not exists leads_email_curso_unique on public.leads (lower(email), coalesce(curso_slug, ''));
alter table public.leads enable row level security;
drop policy if exists leads_admin_select on public.leads;
create policy leads_admin_select on public.leads for select to authenticated using (public.is_admin());

-- Única forma de escribir: valida el correo y no revela si ya existía.
create or replace function public.capturar_lead(p_email text, p_origen text, p_curso_slug text)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $function$
declare v_email text := lower(trim(p_email));
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' or length(v_email) > 254 then
    raise exception 'invalid_email';
  end if;
  insert into public.leads (email, origen, curso_slug, user_id)
  values (v_email, left(coalesce(nullif(trim(p_origen), ''), 'sitio'), 60), left(p_curso_slug, 120), auth.uid())
  on conflict (lower(email), coalesce(curso_slug, '')) do nothing;
  return true;
end;
$function$;
revoke all on function public.capturar_lead(text, text, text) from public;
grant execute on function public.capturar_lead(text, text, text) to anon, authenticated;

-- ─── 7. Testimonios reales, con consentimiento y aprobación ────────────────
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  texto text not null check (length(trim(texto)) between 20 and 1200),
  nombre_publico text not null check (length(trim(nombre_publico)) between 2 and 80),
  negocio text check (negocio is null or length(negocio) <= 120),
  ciudad text check (ciudad is null or length(ciudad) <= 80),
  consentimiento boolean not null check (consentimiento),
  estado text not null default 'pendiente' check (estado in ('pendiente','aprobado','rechazado')),
  created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;
drop policy if exists testimonials_public_read on public.testimonials;
create policy testimonials_public_read on public.testimonials
  for select to anon, authenticated using (estado = 'aprobado');
drop policy if exists testimonials_select_own on public.testimonials;
create policy testimonials_select_own on public.testimonials
  for select to authenticated using (user_id = auth.uid());
drop policy if exists testimonials_insert_own on public.testimonials;
-- Solo quien está inscrito en el curso puede opinar de él, y siempre entra
-- como «pendiente»: nada se publica sin revisión.
create policy testimonials_insert_own on public.testimonials
  for insert to authenticated
  with check (
    user_id = auth.uid() and estado = 'pendiente' and consentimiento
    and exists (select 1 from public.enrollments e where e.user_id = auth.uid() and e.course_id = testimonials.course_id)
  );
drop policy if exists testimonials_admin_all on public.testimonials;
create policy testimonials_admin_all on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create index if not exists idx_testimonials_course on public.testimonials(course_id, estado);

-- ─── 8. Productos: paquetes por etapa y membresía ──────────────────────────
insert into public.products (slug, name, type, price_cents, currency, status, metadata) values
  ('paquete-que-te-encuentren', 'Paquete «Que te encuentren»', 'bundle', 19900, 'MXN', 'active',
    '{"etapa":"encontrar","descripcion":"Tu negocio en Google + Un mes de publicaciones listas"}'),
  ('paquete-que-te-pidan', 'Paquete «Que te pidan sin fricción»', 'bundle', 19900, 'MXN', 'active',
    '{"etapa":"pedir","descripcion":"Tu menú o catálogo con link + WhatsApp que contesta solo"}'),
  ('paquete-que-te-compren', 'Paquete «Que te compren»', 'bundle', 44900, 'MXN', 'active',
    '{"etapa":"comprar","descripcion":"Cotiza en 5 minutos + Sistemas de Ventas con IA"}'),
  ('paquete-negocio-completo', 'Negocio completo: los 6 cursos', 'bundle', 69900, 'MXN', 'active',
    '{"destacado":true,"descripcion":"Los seis cursos publicados, del «¿dónde están?» al «¿cuándo empiezas?»"}')
on conflict (slug) do nothing;

insert into public.products (slug, name, type, price_cents, currency, billing_interval, status, metadata) values
  ('listo-pro-mensual', 'Listo Pro', 'membership', 19900, 'MXN', 'month', 'active',
    '{"descripcion":"Todos los cursos mientras tu membresía esté activa. Cancelas cuando quieras."}')
on conflict (slug) do nothing;

insert into public.product_courses (product_id, course_id)
select p.id, c.id from public.products p join public.courses c on c.slug = any (
  case p.slug
    when 'paquete-que-te-encuentren' then array['tu-negocio-en-google','un-mes-de-publicaciones']
    when 'paquete-que-te-pidan' then array['menu-con-link','whatsapp-que-contesta-solo']
    when 'paquete-que-te-compren' then array['cotiza-en-5-minutos','ventas-con-ia']
    when 'paquete-negocio-completo' then array['tu-negocio-en-google','un-mes-de-publicaciones','menu-con-link','whatsapp-que-contesta-solo','cotiza-en-5-minutos','ventas-con-ia']
  end)
where p.type = 'bundle'
on conflict do nothing;
