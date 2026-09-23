-- «Entrar con Google»: Google manda el nombre en full_name / name, no en
-- display_name. El perfil lo toma de ahí; sigue siendo idempotente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, display_name, locale)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ),
    'es-MX'
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;
