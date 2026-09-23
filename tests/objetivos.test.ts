import { describe, expect, it } from "vitest";
import { OBJETIVOS, esObjetivo } from "@/lib/objetivos";
import { editorialDe } from "@/lib/editorial";

describe("objetivos del onboarding", () => {
  it("solo usa valores que acepta la base (user_goals.priority)", () => {
    const permitidos = ["quoting", "messaging", "collecting", "clients", "reporting"];
    for (const k of Object.keys(OBJETIVOS)) expect(permitidos).toContain(k);
  });
  it("cada objetivo recomienda cursos que existen en la editorial", () => {
    for (const o of Object.values(OBJETIVOS)) for (const slug of o.cursos) expect(editorialDe(slug)).not.toBeNull();
  });
  it("cada curso con editorial tiene palabras para el buscador", () => {
    for (const o of Object.values(OBJETIVOS)) for (const slug of o.cursos) expect(editorialDe(slug)?.buscar?.length).toBeGreaterThan(10);
  });
  it("rechaza objetivos inventados", () => {
    expect(esObjetivo("hackear")).toBe(false);
    expect(esObjetivo("clients")).toBe(true);
  });
});
