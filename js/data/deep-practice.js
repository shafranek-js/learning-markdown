// Markdown Guide Basic Syntax: non-blocking exercises for each lesson.
export const PRACTICE_DRILLS=[
  {
    "id": "setext-h1",
    "lesson": 1,
    "code": "Document title\n===============",
    "labels": {
      "en": "Setext H1 (= underline)",
      "cs": "Nadpis H1 podtržený =",
      "uk": "Заголовок H1 із =",
      "ro": "Titlu H1 cu =",
      "ru": "Заголовок H1 с ="
    }
  },
  {
    "id": "setext-h2",
    "lesson": 1,
    "code": "Section title\n-------------",
    "labels": {
      "en": "Setext H2 (- underline)",
      "cs": "Nadpis H2 podtržený -",
      "uk": "Заголовок H2 із -",
      "ro": "Titlu H2 cu -",
      "ru": "Заголовок H2 с -"
    }
  },
  {
    "id": "bold-italic",
    "lesson": 2,
    "code": "***Important emphasis***",
    "labels": {
      "en": "Combined bold + italic",
      "cs": "Současně tučné a kurzíva",
      "uk": "Жирний текст із курсивом",
      "ro": "Aldin combinat cu cursiv",
      "ru": "Жирный и курсив одновременно"
    }
  },
  {
    "id": "hard-break",
    "lesson": 2,
    "code": "First line with two spaces  \nSecond line",
    "labels": {
      "en": "Hard line break (two spaces)",
      "cs": "Pevný konec řádku",
      "uk": "Розрив рядка (два пробіли)",
      "ro": "Rând nou forțat (două spații)",
      "ru": "Перенос строки (два пробела)"
    }
  },
  {
    "id": "nested-list",
    "lesson": 3,
    "code": "- Main item\n  - Nested detail",
    "labels": {
      "en": "Nested bullet list",
      "cs": "Vnořený odrážkový seznam",
      "uk": "Вкладений маркований список",
      "ro": "Listă cu marcatori imbricată",
      "ru": "Вложенный маркированный список"
    }
  },
  {
    "id": "escaped-number",
    "lesson": 3,
    "code": "- 1968\\. A memorable year",
    "labels": {
      "en": "Escaped number in a list",
      "cs": "Escapované číslo v seznamu",
      "uk": "Екрановане число у списку",
      "ro": "Număr escapat într-o listă",
      "ru": "Экранированное число в списке"
    }
  },
  {
    "id": "quote-paragraphs",
    "lesson": 4,
    "code": "> First paragraph\n>\n> Second paragraph",
    "labels": {
      "en": "Blockquote with two paragraphs",
      "cs": "Citace se dvěma odstavci",
      "uk": "Цитата з двома абзацами",
      "ro": "Citat cu două paragrafe",
      "ru": "Цитата с двумя абзацами"
    }
  },
  {
    "id": "quote-heading",
    "lesson": 4,
    "code": "> ### Quoted heading",
    "labels": {
      "en": "Heading inside a blockquote",
      "cs": "Nadpis uvnitř citace",
      "uk": "Заголовок усередині цитати",
      "ro": "Titlu în interiorul citatului",
      "ru": "Заголовок внутри цитаты"
    }
  },
  {
    "id": "reference-link",
    "lesson": 5,
    "code": "Read [CommonMark][spec].\n\n[spec]: https://spec.commonmark.org/",
    "labels": {
      "en": "Reference-style link",
      "cs": "Referenční odkaz",
      "uk": "Посилання за ідентифікатором",
      "ro": "Link prin referință",
      "ru": "Ссылка по идентификатору"
    }
  },
  {
    "id": "email-autolink",
    "lesson": 5,
    "code": "<hello@example.com>",
    "labels": {
      "en": "Email autolink",
      "cs": "Automatický e-mailový odkaz",
      "uk": "Автоматичне посилання на пошту",
      "ro": "Link automat pentru e-mail",
      "ru": "Автоссылка на email"
    }
  },
  {
    "id": "indented-code",
    "lesson": 6,
    "code": "Code block:\n\n    const answer = 42;",
    "labels": {
      "en": "Indented code block",
      "cs": "Odsazený blok kódu",
      "uk": "Блок коду з відступом",
      "ro": "Bloc de cod indentat",
      "ru": "Кодовый блок с отступом"
    }
  },
  {
    "id": "double-backticks",
    "lesson": 6,
    "code": "Use ``code with ` backtick`` here.",
    "labels": {
      "en": "Double-backtick inline code",
      "cs": "Kód se dvěma zpětnými apostrofy",
      "uk": "Код із подвійними бектиками",
      "ro": "Cod cu două backtick-uri",
      "ru": "Код с двойными бэктиками"
    }
  },
  {
    "id": "alt-rule",
    "lesson": 7,
    "code": "***",
    "labels": {
      "en": "Alternative horizontal rule",
      "cs": "Alternativní vodorovná čára",
      "uk": "Альтернативна горизонтальна лінія",
      "ro": "Linie orizontală alternativă",
      "ru": "Альтернативная горизонтальная линия"
    }
  },
  {
    "id": "escaped-star",
    "lesson": 7,
    "code": "\\*literal asterisk\\*",
    "labels": {
      "en": "Escaped literal asterisk",
      "cs": "Escapovaná hvězdička",
      "uk": "Екранована зірочка",
      "ro": "Asterisc escapat",
      "ru": "Экранированная звёздочка"
    }
  },
  {
    "id": "image-title",
    "lesson": 8,
    "code": "![Course icon](./assets/icon.svg \"Course icon\")",
    "labels": {
      "en": "Image with alt text and title",
      "cs": "Obrázek s alt textem a popiskem",
      "uk": "Зображення з alt і заголовком",
      "ro": "Imagine cu alt și titlu",
      "ru": "Изображение с alt и заголовком"
    }
  },
  {
    "id": "safe-html",
    "lesson": 8,
    "code": "Use <em>safe HTML</em> in Markdown.",
    "labels": {
      "en": "Safe inline HTML",
      "cs": "Bezpečné vložené HTML",
      "uk": "Безпечний HTML у рядку",
      "ro": "HTML inline sigur",
      "ru": "Безопасный встроенный HTML"
    }
  }
];
export const PRACTICE_UI={
  "en": {
    "title": "Deep Practice",
    "subtitle": "Optional challenges · live checked",
    "insert": "Insert example",
    "optional": "Does not affect your certificate"
  },
  "cs": {
    "title": "Pokročilá praxe",
    "subtitle": "Volitelná cvičení · kontrola v reálném čase",
    "insert": "Vložit příklad",
    "optional": "Neovlivňuje certifikát"
  },
  "uk": {
    "title": "Додаткова практика",
    "subtitle": "Необов'язкові вправи · перевірка наживо",
    "insert": "Вставити приклад",
    "optional": "Не впливає на сертифікат"
  },
  "ro": {
    "title": "Exerciții avansate",
    "subtitle": "Provocări opționale · verificate automat",
    "insert": "Inserează exemplul",
    "optional": "Nu afectează certificatul"
  },
  "ru": {
    "title": "Дополнительная практика",
    "subtitle": "Необязательные задания · проверка в реальном времени",
    "insert": "Вставить пример",
    "optional": "Не влияет на сертификат"
  }
};
const validation={
"setext-h1":(s,h)=>/^.+\n={2,}[ \t]*$/m.test(s)&&/<h1(?:\s|>)/i.test(h),
"setext-h2":(s,h)=>/^.+\n-{2,}[ \t]*$/m.test(s)&&/<h2(?:\s|>)/i.test(h),
"bold-italic":(_,h)=>/<(?:strong|em)>\s*<(?:em|strong)>[^<]+<\/(?:em|strong)><\/(?:strong|em)>/i.test(h),
"hard-break":(s,h)=>/ {2,}\r?\n/.test(s)&&/<br\s*\/?>/i.test(h),
"nested-list":(_,h)=>/<ul\b[^>]*>[\s\S]*?<li\b[^>]*>[\s\S]*?<ul\b/i.test(h),
"escaped-number":(s,h)=>/^[ \t]*[-+*][ \t]+\d+\\\.[ \t]+\S/m.test(s)&&/<ul\b/i.test(h)&&/\d+\./.test(h),
"quote-paragraphs":(_,h)=>{const b=h.match(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/i);return !!b&&(b[1].match(/<p\b/gi)||[]).length>=2;},
"quote-heading":(_,h)=>/<blockquote\b[^>]*>[\s\S]*?<h[1-6]\b/i.test(h),
"reference-link":(s,h)=>/\[[^\]\n]+\]\[[^\]\n]+\]/.test(s)&&/^\[[^\]\n]+\]:[ \t]*\S+/m.test(s)&&/<a\s[^>]*href=/i.test(h),
"email-autolink":(s,h)=>/<[\w.+-]+@[\w.-]+\.[a-z]{2,}>/i.test(s)&&/href="mailto:/i.test(h),
"indented-code":(s,h)=>/^ {4}\S/m.test(s)&&/<pre\b[^>]*>[\s\S]*?<code\b/i.test(h),
"double-backticks":(s,h)=>/``[^`\n]+`[^`\n]*``/.test(s)&&/<code\b[^>]*>[^<]*`[^<]*<\/code>/i.test(h),
"alt-rule":(s,h)=>/^(?:[ \t]*\*(?:[ \t]*\*){2,}[ \t]*|[ \t]*_(?:[ \t]*_){2,}[ \t]*)$/m.test(s)&&/<hr\b/i.test(h),
"escaped-star":(s,h)=>/\\\*[^*\n]+\\\*/.test(s)&&/\*[^*<]+\*/.test(h),
"image-title":(s,h)=>/!\[[^\]\n]+\]\([^)]+[ \t]+["'][^"']+["']\)/.test(s)&&/<img\b[^>]*\balt=/i.test(h),
"safe-html":(s,h)=>/<em>[^<>]+<\/em>/.test(s)&&/<em>[^<>]+<\/em>/i.test(h)
};
export const practiceForLesson=id=>PRACTICE_DRILLS.filter(d=>d.lesson===id);
export function evaluatePractice(id,source,renderedHTML){return practiceForLesson(id).map(d=>({...d,passed:Boolean(validation[d.id](source,renderedHTML))}));}
