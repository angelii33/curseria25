import { describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({ after: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ clienteServidor: vi.fn() }));
const { esVisitaHumana } = await import("@/lib/analitica");

const h = (o: Record<string, string>) => new Headers(o);
const CHROME = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

describe("esVisitaHumana: el embudo cuenta personas", () => {
  it.each([CHROME, IPHONE])("cuenta navegadores reales", (ua) => expect(esVisitaHumana(h({ "user-agent": ua }))).toBe(true));
  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "facebookexternalhit/1.1",
    "WhatsApp/2.23.20.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/129.0 Safari/537.36",
    "vercel-screenshot/1.0",
    "curl/8.5.0",
    "",
  ])("ignora bots y vistas previas: %s", (ua) => expect(esVisitaHumana(h({ "user-agent": ua }))).toBe(false));
  it("ignora precargas", () => {
    expect(esVisitaHumana(h({ "user-agent": CHROME, "next-router-prefetch": "1" }))).toBe(false);
    expect(esVisitaHumana(h({ "user-agent": CHROME, "sec-purpose": "prefetch;prerender" }))).toBe(false);
  });
});
