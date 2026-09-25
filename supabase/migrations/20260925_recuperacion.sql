-- Recuperar contraseña por correo (Resend): límite de envíos.
-- Evita que alguien use el formulario para llenar de correos la bandeja de
-- otra persona o gastar la cuota de envíos. Solo se guardan huellas (sha256)
-- del correo y de la IP, nunca el correo, y se borran a las 24 h.
-- Tabla en un esquema que la API no expone; la única entrada es la función,
-- que solo puede ejecutar el servidor (service_role).

create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;

create table if not exists privado.recuperaciones (
  id bigint generated always as identity primary key,
  correo_huella text not null,
  ip_huella text not null,
  creado timestamptz not null default now()
);
create index if not exists recuperaciones_correo_idx on privado.recuperaciones (correo_huella, creado);
create index if not exists recuperaciones_ip_idx on privado.recuperaciones (ip_huella, creado);
alter table privado.recuperaciones enable row level security;
revoke all on privado.recuperaciones from public, anon, authenticated;

-- 'ok' registra el envío; 'espera' = mismo correo hace menos de 60 s;
-- 'limite' = 3 por correo o 10 por IP en la última hora.
create or replace function public.permitir_recuperacion(p_correo text, p_ip text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  ultimo timestamptz;
begin
  -- Un solo pase a la vez por correo: dos clics simultáneos no cuentan doble.
  perform pg_advisory_xact_lock(hashtext('recuperacion:' || p_correo));

  delete from privado.recuperaciones where creado < now() - interval '24 hours';

  select max(creado) into ultimo from privado.recuperaciones where correo_huella = p_correo;
  if ultimo is not null and ultimo > now() - interval '60 seconds' then
    return 'espera';
  end if;
  if (select count(*) from privado.recuperaciones
        where correo_huella = p_correo and creado > now() - interval '1 hour') >= 3
     or (select count(*) from privado.recuperaciones
        where ip_huella = p_ip and creado > now() - interval '1 hour') >= 10 then
    return 'limite';
  end if;

  insert into privado.recuperaciones (correo_huella, ip_huella) values (p_correo, p_ip);
  return 'ok';
end;
$$;

revoke all on function public.permitir_recuperacion(text, text) from public, anon, authenticated;
grant execute on function public.permitir_recuperacion(text, text) to service_role;
