import { describe, expect, it } from "vitest";
import { haceCuanto } from "@/lib/fechas";

describe("haceCuanto (hora de CDMX)", () => {
  const ahora = new Date("2026-09-25T18:00:00Z"); // 12:00 en CDMX
  it("hoy y ayer por día de calendario, no por 24 h", () => {
    expect(haceCuanto("2026-09-25T15:00:00Z", ahora)).toBe("hoy");
    // 23:30 del 24 en CDMX = 05:30Z del 25: sigue siendo «ayer» allá
    expect(haceCuanto("2026-09-25T05:30:00Z", ahora)).toBe("ayer");
  });
  it("días, semanas y meses", () => {
    expect(haceCuanto("2026-09-22T18:00:00Z", ahora)).toBe("hace 3 días");
    expect(haceCuanto("2026-09-04T18:00:00Z", ahora)).toBe("hace 3 semanas");
    expect(haceCuanto("2026-06-25T18:00:00Z", ahora)).toBe("hace 3 meses");
  });
});
