-- Los eventos del embudo que manda la app (src/lib/analitica.ts y el aviso
-- de pago) no estaban en la lista permitida y la base los rechazaba en
-- silencio: no se medía nada. Se amplía la lista; no se quita ninguno.
alter table public.analytics_events drop constraint if exists analytics_events_event_name_check;
alter table public.analytics_events add constraint analytics_events_event_name_check check (event_name = any (array[
  'course_viewed', 'lesson_started', 'lesson_completed', 'quiz_completed', 'checkout_started',
  'purchase_confirmed', 'subscription_started', 'subscription_cancelled', 'course_completed', 'asset_created',
  'checkout_iniciado', 'suscripcion_iniciada', 'inscripcion', 'leccion_completada', 'correo_capturado',
  'opinion_enviada', 'certificado_emitido', 'objetivo_elegido', 'pago_aprobado', 'cuenta_creada'
]));
