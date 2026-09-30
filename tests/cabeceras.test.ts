import { describe, expect, it } from "vitest";
import config from "../next.config";

describe("cabeceras de seguridad", () => {
  it("se aplican a todas las rutas y no anuncian el framework", async () => {
    expect(config.poweredByHeader).toBe(false);
    const reglas = await config.headers!();
    const global = reglas.find((r) => r.source === "/:path*");
    const valores = Object.fromEntries((global?.headers ?? []).map((h) => [h.key, h.value]));
    expect(valores["X-Frame-Options"]).toBe("DENY");
    expect(valores["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(valores["X-Content-Type-Options"]).toBe("nosniff");
    expect(valores["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
  });
});
