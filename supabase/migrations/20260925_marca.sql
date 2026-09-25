-- Cambio de marca: Listo → CurserIA. Solo el nombre visible del plan; el
-- slug se conserva porque puede estar en enlaces y registros de pago.
update public.products set name = 'CurserIA Pro' where slug = 'listo-pro-mensual' and name = 'Listo Pro';
