// Validation inspects real Markdown structure, not examples hidden inside fenced code.
export function stripFencedCodeBlocks(md) {
  return md.replace(/^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\1[ \t]*$/gm, '');
}
const visible = md => stripFencedCodeBlocks(md);
const hasH = n => md => new RegExp(`^#{${n}}[ \\t]+\\S+`, 'm').test(visible(md));
const bold = md => /\*\*\S(?:[^\n]*?\S)?\*\*|__\S(?:[^\n]*?\S)?__/.test(visible(md));
const inlineCode = md => /(^|[^`])`[^`\n]+`(?!`)/m.test(visible(md));
const quote = md => /^>[ \t]+\S+/m.test(visible(md));
const nested = md => /^>>[ \t]+\S+/m.test(visible(md));
const list = md => /^[ \t]*(?:[-*+]|\d+\.)[ \t]+\S+/gm;
const task = marked => md => new RegExp(`^[ \\t]*[-*+][ \\t]+\\[${marked}\\][ \\t]+\\S+`, 'm').test(visible(md));
export const checks = [
 [hasH(1),hasH(2),hasH(3)],
 [bold, md => {const t=visible(md).replace(/\*\*[^\n]*?\*\*|__[^\n]*?__/g,'');return /(^|[^*])\*[^*\n]+\*|(^|[^_])_[^_\n]+_/.test(t)}, md=>/~~[^~\s][^~\n]*~~/.test(visible(md))],
 [md=>(visible(md).match(/^[ \t]*[-*+][ \t]+(?!\[[ xX]\])[\S]/gm)||[]).length>=1,
  md=>(visible(md).match(/^[ \t]*\d+\.[ \t]+\S/gm)||[]).length>=1,
  md=>(visible(md).match(list(md))||[]).length>=4],
 [quote,nested,md=>/^>+[ \t]+.*(?:\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*)/m.test(visible(md))],
 [md=>/(^|[^!])\[[^\]\n]+\]\(https?:\/\/[^\s)]+\)/m.test(visible(md)),md=>/!\[[^\]\n]+\]\(https?:\/\/[^\s)]+\)/.test(visible(md))],
 [inlineCode,md=>/^```[a-zA-Z][\w+-]*[ \t]*\n[\s\S]+?\n```[ \t]*$/m.test(md)],
 [task('[xX]'),task(' '),md=>/^\|[^\n|]+\|[^\n|]+\|?\s*\n\|\s*:?-{3,}:?\s*\|\s*:?-{3,}:?\s*\|?/m.test(visible(md))],
 [hasH(1),quote,md=>bold(md)&&inlineCode(md),md=>/^```[a-zA-Z]*[ \t]*\n[\s\S]+?\n```[ \t]*$/m.test(md),md=>(visible(md).match(/^[ \t]*[-*+][ \t]+\[[ xX]\][ \t]+\S+/gm)||[]).length>=1]
];
export const supplementalTasks = {
 en:{3:['Add a bullet list','Add a numbered list','Write at least four list items in total'],4:['Write a single-level quote (`>`)','Write a nested quote (`>>`)','Format text inside a quote'],8:['Add a level 1 heading (`#`)','Write a quote (`>`)','Combine **bold** text and `inline code`','Add a fenced code block','Add a task checklist']},
 cs:{3:['Přidejte odrážkový seznam','Přidejte číslovaný seznam','Napište alespoň čtyři položky seznamů'],4:['Napište citaci (`>`)','Vytvořte vnořenou citaci (`>>`)','Naformátujte text uvnitř citace'],8:['Přidejte nadpis první úrovně','Napište citaci','Zkombinujte tučný text a vložený kód','Přidejte blok kódu','Přidejte seznam úkolů']},
 uk:{3:['Додайте маркований список','Додайте нумерований список','Створіть щонайменше чотири пункти'],4:['Створіть цитату (`>`)','Додайте вкладену цитату (`>>`)','Відформатуйте текст усередині цитати'],8:['Додайте заголовок першого рівня','Створіть цитату','Поєднайте жирний текст та рядковий код','Додайте блок коду','Додайте список завдань']},
 ro:{3:['Adăugați o listă cu marcatori','Adăugați o listă numerotată','Scrieți cel puțin patru elemente'],4:['Scrieți un citat (`>`)','Adăugați un citat imbricat (`>>`)','Formatați textul din citat'],8:['Adăugați un titlu H1','Scrieți un citat','Combinați textul îngroșat cu codul inline','Adăugați un bloc de cod','Adăugați o listă de sarcini']},
 ru:{3:['Добавьте маркированный список','Добавьте нумерованный список','Напишите не менее четырёх элементов списка'],4:['Добавьте простую цитату (`>`)','Добавьте вложенную цитату (`>>`)','Используйте форматирование внутри цитаты'],8:['Добавьте заголовок первого уровня','Создайте цитату','Используйте **жирный** текст и `код`','Добавьте многострочный блок кода','Добавьте список задач']}
};
export function getTaskDescriptions(id, lang, fallback) {
 return supplementalTasks[lang]?.[id] || fallback;
}
export function verifyLesson(lesson, markdown) {
 return lesson.tasks.map(t=>({text:t.text,id:t.id,passed:Boolean(t.check(markdown))}));
}
