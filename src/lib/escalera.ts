// Revisión de una frase de resultado (misión gratis 2 de Monetiza IA). Tres
// reglas de la propia misión, sin IA: no menciona la herramienta, no usa
// palabras vagas y no promete lo que no controlas.

const VAGAS = /\b(mejorar|optimizar|potenciar|impulsar|crecer|maximizar|revolucionar|transformar)\w*/i;
const PROMESAS = /\b(duplic|tripl|garantiz|asegur|más ventas|mas ventas|vender más|vender mas|hazte rico|ingresos?)\w*/i;
const IA = /\b(ia|inteligencia artificial|chatgpt|claude|gemini|prompts?|bots?|chatbots?)\b/i;

export function revisarResultado(frase: string): { ok: boolean; texto: string }[] {
  return [
    IA.test(frase)
      ? { ok: false, texto: "Menciona la herramienta. El cliente compra el resultado, no la IA: quítala de la frase." }
      : { ok: true, texto: "No menciona la IA: habla de lo que gana el cliente." },
    VAGAS.test(frase)
      ? { ok: false, texto: `Usa una palabra vaga («${frase.match(VAGAS)![0]}»). Cámbiala por lo que el cliente verá o podrá contar.` }
      : { ok: true, texto: "Sin palabras vagas." },
    PROMESAS.test(frase)
      ? { ok: false, texto: "Promete algo que no controlas (ventas, ingresos). Describe lo que tú entregas." }
      : { ok: true, texto: "No promete lo que no controlas." },
  ];
}
