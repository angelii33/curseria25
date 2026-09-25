-- Objetivo inicial «Ganar dinero con IA» (lleva a Monetiza IA). Solo se
-- agrega un valor permitido; no se quita ninguno ni se tocan las políticas.
alter table public.user_goals drop constraint if exists user_goals_priority_check;
alter table public.user_goals add constraint user_goals_priority_check
  check (priority = any (array['quoting', 'messaging', 'collecting', 'clients', 'reporting', 'monetizing']));
