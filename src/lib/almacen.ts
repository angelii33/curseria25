"use client";

import { useSyncExternalStore } from "react";

// Guardado local (este navegador) para la práctica y el repaso.
//
// Se usa useSyncExternalStore: en el servidor y en la hidratación el valor
// es vacío, y justo después se lee lo guardado. Así nunca hay desajuste
// entre el HTML del servidor y el del cliente. Si el almacenamiento está
// bloqueado (modo privado), todo sigue funcionando en memoria de la página.

const EVENTO = "listo:almacen";

function suscribir(aviso: () => void) {
  window.addEventListener("storage", aviso);
  window.addEventListener(EVENTO, aviso);
  return () => {
    window.removeEventListener("storage", aviso);
    window.removeEventListener(EVENTO, aviso);
  };
}

export function leer(clave: string): string {
  try {
    return window.localStorage.getItem(clave) ?? "";
  } catch {
    return "";
  }
}

export function escribir(clave: string, valor: string | null) {
  try {
    if (valor === null) window.localStorage.removeItem(clave);
    else window.localStorage.setItem(clave, valor);
  } catch {
    // Sin almacenamiento: no hay dónde guardar.
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function useAlmacen(clave: string): string {
  return useSyncExternalStore(suscribir, () => leer(clave), () => "");
}

// ─── Repaso espaciado (cajas de Leitner) ───────────────────────────────────
// Cada pregunta respondida entra en una caja. Acertar la sube de caja y la
// aleja en el tiempo; fallar la regresa a la primera. Volver a recordar algo
// justo cuando empieza a olvidarse es lo que lo fija a largo plazo.

export const CLAVE_REPASO = "listo:repaso";
const DIAS = [1, 2, 4, 8, 16];
const DIA = 24 * 60 * 60 * 1000;

export type EstadoRepaso = Record<string, { caja: number; proxima: number }>;

export function leerRepaso(crudo: string): EstadoRepaso {
  try {
    return crudo ? (JSON.parse(crudo) as EstadoRepaso) : {};
  } catch {
    return {};
  }
}

export function registrarRespuesta(id: string, acierto: boolean) {
  const estado = leerRepaso(leer(CLAVE_REPASO));
  const antes = estado[id]?.caja ?? -1;
  const caja = acierto ? Math.min(antes + 1, DIAS.length - 1) : 0;
  estado[id] = { caja, proxima: Date.now() + DIAS[caja] * DIA };
  escribir(CLAVE_REPASO, JSON.stringify(estado));
}
