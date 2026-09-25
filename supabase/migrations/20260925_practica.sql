-- Resultado de la práctica de cada lección (aciertos a la primera y
-- confianza): mide qué se entiende. Se agrega a la lista; no se quita nada.
alter table public.analytics_events drop constraint if exists analytics_events_event_name_check;
alter table public.analytics_events add constraint analytics_events_event_name_check check (event_name = any (array[
  'course_viewed', 'lesson_started', 'lesson_completed', 'quiz_completed', 'checkout_started',
  'purchase_confirmed', 'subscription_started', 'subscription_cancelled', 'course_completed', 'asset_created',
  'checkout_iniciado', 'suscripcion_iniciada', 'inscripcion', 'leccion_completada', 'correo_capturado',
  'opinion_enviada', 'certificado_emitido', 'objetivo_elegido', 'pago_aprobado', 'cuenta_creada',
  'practica_respondida'
]));
