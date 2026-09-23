import { describe, expect, it } from "vitest";
import { nivelDe, racha } from "@/lib/logros";

describe("nivelDe (mismos umbrales que public.level_for_xp)", () => {
  it.each([
    [0, 1], [249, 1], [250, 2], [749, 2], [750, 3], [1500, 4], [3000, 5], [5000, 6], [8000, 7], [99999, 7],
  ])("%i XP → nivel %i", (xp, nivel) => expect(nivelDe(xp).nivel).toBe(nivel));

  it("dice cuánto falta al siguiente nivel", () => {
    expect(nivelDe(200)).toMatchObject({ siguiente: 250, faltan: 50, pct: 80 });
    expect(nivelDe(9000)).toMatchObject({ siguiente: null, faltan: 0, pct: 100 });
  });
});

describe("racha (días de México)", () => {
  const hoy = new Date("2026-09-23T18:00:00Z"); // 12:00 en CDMX
  it("cuenta días seguidos hasta hoy", () => {
    expect(racha(["2026-09-23T15:00:00Z", "2026-09-22T15:00:00Z", "2026-09-21T15:00:00Z"], hoy)).toBe(3);
  });
  it("si hoy aún no hay lección, la racha de ayer sigue viva", () => {
    expect(racha(["2026-09-22T15:00:00Z", "2026-09-21T15:00:00Z"], hoy)).toBe(2);
  });
  it("un hueco la corta", () => {
    expect(racha(["2026-09-23T15:00:00Z", "2026-09-21T15:00:00Z"], hoy)).toBe(1);
    expect(racha([], hoy)).toBe(0);
  });
  it("una lección a las 11 p. m. en CDMX cuenta para ese día, no para el siguiente en UTC", () => {
    // 2026-09-22 23:00 CDMX = 2026-09-23 05:00 UTC
    expect(racha(["2026-09-23T05:00:00Z"], new Date("2026-09-23T04:00:00Z"))).toBe(1);
    expect(racha(["2026-09-23T05:00:00Z", "2026-09-21T20:00:00Z"], new Date("2026-09-23T04:30:00Z"))).toBe(2);
  });
});
