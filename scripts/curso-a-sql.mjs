#!/usr/bin/env node
// Convierte un curso escrito como módulo (<carpeta>/index.mjs) en archivos
// SQL para cargarlo en Supabase (SQL editor o MCP). Uso:
//
//   node scripts/curso-a-sql.mjs <carpeta-del-curso> <carpeta-de-salida>
//
// El contenido de los cursos de pago NO vive en este repositorio (es
// público): la carpeta del curso va fuera de él, y la base es la fuente.
// Salida: 00-curso.sql (curso y módulos) y un archivo por fase (lecciones,
// contenido, misiones y criterios), para cargarlos en orden.
//
// Qué hace el SQL:
// - Crea el curso como BORRADOR si no existe. Si existe, actualiza sus textos
//   y respeta su estado (no lo publica ni lo despublica).
// - Reemplaza módulos, lecciones, contenido, criterios y misiones.
// - Se DETIENE si alguien ya está inscrito: reemplazar lecciones borraría su
//   avance. Con alumnos, edita lección por lección.
// Todo va en una transacción: o se carga completo o no cambia nada.

import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join, resolve } from "node:path";

const [carpeta, salida] = process.argv.slice(2);
if (!carpeta || !salida) {
  console.error("Uso: node scripts/curso-a-sql.mjs <carpeta-del-curso> <carpeta-de-salida>");
  process.exit(1);
}
const { curso } = await import(pathToFileURL(resolve(carpeta, "index.mjs")).href);

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const errores = [];
const TIPOS = ["template", "system", "criterion", "action"];

let minutos = 0;
const CURSO = `(select id from public.courses where slug = ${q(curso.slug)})`;
const modulos = [];
const archivosFase = [];
curso.fases.forEach((f, i) => {
  modulos.push(`(${CURSO}, ${q(f.titulo)}, ${i + 1}, ${q(f.capacidad)}, null)`);
  const filas = { lecciones: [], recursos: [], misiones: [], criterios: [] };
  const modulo = `(select id from public.course_modules where course_id = ${CURSO} and sort_order = ${i + 1})`;
  f.lecciones.forEach((l, j) => {
    const donde = `${f.titulo} › ${l.titulo}`;
    if (!TIPOS.includes(l.tipo)) errores.push(`${donde}: tipo «${l.tipo}» no válido`);
    if (!l.md?.includes("## Lo que hiciste hoy")) errores.push(`${donde}: falta «## Lo que hiciste hoy»`);
    if (/`|\$\{/.test(l.md)) errores.push(`${donde}: contiene \` o \${`);
    if (!l.criterios?.length) errores.push(`${donde}: sin criterios`);
    minutos += l.minutos;
    const lid = randomUUID();
    filas.lecciones.push(
      `(${q(lid)}, ${modulo}, ${q(l.titulo)}, ${l.minutos}, ${j + 1}, ${l.gratis ? "true" : "false"}, ${q(l.resultado)}, ${q(l.tipo)})`
    );
    filas.recursos.push(`(${q(lid)}, ${q(l.md.trim())})`);
    filas.misiones.push(
      `(${q(lid)}, ${q(l.cuaderno.titulo)}, ${q(l.cuaderno.intro)}, '[]'::jsonb, '', ${q(l.entregable)}, 1)`
    );
    l.criterios.forEach(([c, d], k) => filas.criterios.push(`(${q(lid)}, ${q(c)}, ${q(d)}, ${k + 1})`));
  });
  archivosFase.push(`-- ${f.titulo}
begin;
insert into public.lessons (id, module_id, title, duration_minutes, sort_order, is_preview, outcome, outcome_type) values
${filas.lecciones.join(",\n")};
insert into public.lesson_resources (lesson_id, content_markdown) values
${filas.recursos.join(",\n")};
insert into public.mission_builders (lesson_id, title, intro, fields, template, asset_title, sort_order) values
${filas.misiones.join(",\n")};
insert into public.mission_checklists (lesson_id, criterion, detail, sort_order) values
${filas.criterios.join(",\n")};
commit;
`);
});

if (errores.length) {
  console.error(errores.join("\n"));
  process.exit(1);
}

const inicio = `-- Generado por scripts/curso-a-sql.mjs (${curso.slug}). No editar a mano.
begin;

do $$
declare
  cid uuid;
begin
  select id into cid from public.courses where slug = ${q(curso.slug)};
  if cid is not null and exists (select 1 from public.enrollments where course_id = cid) then
    raise exception 'El curso % ya tiene alumnos inscritos: no se reemplazan lecciones', ${q(curso.slug)};
  end if;
end $$;

insert into public.courses (slug, title, subtitle, description, category_id, level, duration_minutes, status)
values (${q(curso.slug)}, ${q(curso.titulo)}, ${q(curso.subtitulo)}, ${q(curso.descripcion)}, ${q(curso.categoria)}, ${q(curso.nivel)}, ${minutos}, 'draft')
on conflict (slug) do update set
  title = excluded.title, subtitle = excluded.subtitle, description = excluded.description,
  category_id = excluded.category_id, level = excluded.level, duration_minutes = excluded.duration_minutes;

delete from public.course_modules where course_id = ${CURSO};

insert into public.course_modules (course_id, title, sort_order, capability, minutes_saved_weekly) values
${modulos.join(",\n")};

commit;
`;

mkdirSync(salida, { recursive: true });
writeFileSync(join(salida, "00-curso.sql"), inicio);
archivosFase.forEach((t, i) => writeFileSync(join(salida, `${String(i + 1).padStart(2, "0")}-fase.sql`), t));
console.log(`${curso.fases.length} fases, ${minutos} min → ${salida}`);
