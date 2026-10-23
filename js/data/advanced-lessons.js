// Independent optional advanced course, seven modules / 5 languages.
export const ADVANCED_LESSON_SPECS=[
  {
    "slug": "04_01",
    "types": [
      "u",
      "sup",
      "sub"
    ],
    "theoryCode": "<u>text</u> · x<sup>2</sup> · H<sub>2</sub>O",
    "snippets": [
      "<u>{{underlined}}</u>",
      "x<sup>2</sup>",
      "H<sub>2</sub>O"
    ],
    "solution": "<u>{{underlined}}</u>\n\nx<sup>2</sup> and H<sub>2</sub>O"
  },
  {
    "slug": "04_02",
    "types": [
      "mark",
      "color",
      "font"
    ],
    "theoryCode": "<mark>text</mark> · <span class=\"af-color-blue\">blue</span>",
    "snippets": [
      "<mark>{{important}}</mark>",
      "<span class=\"af-color-blue\">{{blue}}</span>",
      "<span class=\"af-font-serif af-size-large\">{{typography}}</span>"
    ],
    "solution": "<mark>{{important}}</mark>\n\n<span class=\"af-color-blue\">{{blue}}</span>\n\n<span class=\"af-font-serif af-size-large\">{{typography}}</span>"
  },
  {
    "slug": "04_03",
    "types": [
      "align",
      "indent",
      "break"
    ],
    "theoryCode": "<div class=\"af-align-center\">center</div> · af-page-break",
    "snippets": [
      "<div class=\"af-align-center\">{{centered}}</div>",
      "<div class=\"af-indent-medium af-spacing-double\">{{indented}}</div>",
      "<div class=\"af-page-break\"></div>"
    ],
    "solution": "<div class=\"af-align-center\">{{centered}}</div>\n\n<div class=\"af-indent-medium af-spacing-double\">{{indented}}</div>\n\n<div class=\"af-page-break\"></div>"
  },
  {
    "slug": "04_04",
    "types": [
      "colspan",
      "rowspan",
      "cell"
    ],
    "theoryCode": "<th colspan=\"2\"> … </th> · <td rowspan=\"2\"> … </td>",
    "snippets": [
      "<table class=\"af-table-outline\"><tr><th colspan=\"2\">{{merged}}</th></tr><tr><td>{{first}}</td><td>{{second}}</td></tr></table>",
      "<table class=\"af-table-outline\"><tr><th rowspan=\"2\">{{merged}}</th><td>{{first}}</td></tr><tr><td>{{second}}</td></tr></table>",
      "<table class=\"af-table-outline\"><tr><td class=\"af-cell-mint\">{{important}}</td></tr></table>"
    ],
    "solution": "<table class=\"af-table-outline\">\n<tr><th colspan=\"2\">{{merged}}</th></tr>\n<tr><th rowspan=\"2\">{{merged}}</th><td class=\"af-cell-mint\">{{first}}</td></tr>\n<tr><td>{{second}}</td></tr>\n</table>"
  },
  {
    "slug": "04_05",
    "types": [
      "details",
      "callout",
      "anchor"
    ],
    "theoryCode": "<details><summary>…</summary>…</details> · [link](#target)",
    "snippets": [
      "<details><summary>{{details}}</summary><p>{{important}}</p></details>",
      "<div class=\"af-callout-warning\"><strong>{{warning}}</strong><p>{{important}}</p></div>",
      "<div id=\"section-demo\">{{section}}</div>\n\n[{{go}}](#section-demo)"
    ],
    "solution": "<details><summary>{{details}}</summary><p>{{important}}</p></details>\n\n<div class=\"af-callout-warning\"><strong>{{warning}}</strong><p>{{important}}</p></div>\n\n<div id=\"section-demo\">{{section}}</div>\n\n[{{go}}](#section-demo)"
  },
  {
    "slug": "04_06",
    "types": [
      "alpha",
      "roman",
      "list"
    ],
    "theoryCode": "<ol type=\"a\"> · <ol type=\"I\"> · <li>item</li>",
    "snippets": [
      "<ol type=\"a\"><li>{{first}}</li><li>{{second}}</li></ol>",
      "<ol type=\"I\"><li>{{first}}</li><li>{{second}}</li></ol>",
      "<ol type=\"i\"><li>{{first}}</li><li>{{second}}</li><li>{{third}}</li></ol>"
    ],
    "solution": "<ol type=\"a\"><li>{{first}}</li><li>{{second}}</li></ol>\n\n<ol type=\"I\"><li>{{first}}</li><li>{{second}}</li></ol>\n\n<ol type=\"i\"><li>{{first}}</li><li>{{second}}</li><li>{{third}}</li></ol>"
  },
  {
    "slug": "04_07",
    "types": [
      "heading",
      "text",
      "layout",
      "table",
      "callout",
      "list"
    ],
    "theoryCode": "Markdown H1 + safe HTML typography, layout, table, callout and list",
    "snippets": [
      "# {{report}}\n\n<mark>{{important}}</mark>",
      "<div class=\"af-align-center\">{{centered}}</div>",
      "<table class=\"af-table-outline\"><tr><th colspan=\"2\">{{merged}}</th></tr><tr><td>{{first}}</td><td>{{second}}</td></tr></table>"
    ],
    "solution": "# {{report}}\n\n<mark>{{important}}</mark>\n\n<div class=\"af-align-center\">{{centered}}</div>\n\n<table class=\"af-table-outline\">\n<tr><th colspan=\"2\">{{merged}}</th></tr>\n<tr><td>{{first}}</td><td>{{second}}</td></tr>\n</table>\n\n<div class=\"af-callout-success\"><strong>{{success}}</strong><p>{{important}}</p></div>\n\n<ol type=\"i\"><li>{{first}}</li><li>{{second}}</li></ol>"
  }
];
export const ADVANCED_LOCALES={
  "en": {
    "titles": [
      "HTML & Portability",
      "Advanced Text Styles",
      "Paragraph & Page Layout",
      "Merged & Colored Tables",
      "Interactive Blocks & Anchors",
      "Custom List Numbering",
      "Advanced Document Project"
    ],
    "sub": [
      "What stays portable across Markdown platforms",
      "Emphasis, superscript, color, font and highlight",
      "Alignment, indents, line spacing and page breaks",
      "Colspan, rowspan and safely styled cells",
      "Collapsible details, callouts and section links",
      "Alphabetic and Roman ordered lists",
      "Combine everything into a formatted document"
    ],
    "theory": [
      "Markdown supports basic structure, but underline and scientific indices need HTML. Some Markdown platforms strip HTML or its styles. Preview shows safe HTML; export an HTML document for predictable presentation.",
      "Use semantic <mark>, and fixed CSS classes for color, font family and size. HTML/CSS is optional and may not survive third-party Markdown rendering.",
      "Alignment, indentation and line spacing use class-based HTML wrappers. Page breaks affect printed HTML or PDF and are displayed as guides on screen.",
      "Use HTML table cells when GFM tables cannot merge rows or columns. Colspan and rowspan are bounded, and table/cell colors use approved CSS classes.",
      "Expandable details use native HTML. Callouts use approved preset classes. Internal links point to validated section IDs without changing the lesson route.",
      "An HTML ordered list can number items a, A, i or I. Use semantic ol and li rather than inserting number labels as plain characters.",
      "Build a formatted report: combine real Markdown headings and safe HTML typography, layout, merged tables, a callout and a numbered list. Export to standalone HTML for best portability."
    ],
    "tasks": [
      [
        "Create an underlined phrase with <u>",
        "Write a superscript using <sup>",
        "Write a subscript using <sub>"
      ],
      [
        "Highlight text using <mark>",
        "Apply an approved foreground color class",
        "Apply both a font-family and font-size class"
      ],
      [
        "Center or right-align a paragraph",
        "Apply an indent and line-spacing preset",
        "Insert a print/PDF page break"
      ],
      [
        "Merge at least two columns",
        "Merge at least two rows",
        "Style a table cell with a preset background"
      ],
      [
        "Create a details block with a summary",
        "Create an information, warning or success callout",
        "Link to a valid internal anchor"
      ],
      [
        "Use alphabetic ordered-list numbering",
        "Use Roman-numeral numbering",
        "Build a list with at least three semantic items"
      ],
      [
        "Add a Markdown H1 heading",
        "Apply advanced text formatting",
        "Add an aligned paragraph",
        "Include a merged HTML table",
        "Add a callout block",
        "Include a custom-numbered list"
      ]
    ],
    "phrases": [
      "Underlined text",
      "Important note",
      "Blue text",
      "Styled text",
      "Centered paragraph",
      "Indented paragraph",
      "Merged heading",
      "First",
      "Second",
      "Third",
      "More details",
      "Warning",
      "Section target",
      "Go to section",
      "Success",
      "Formatted report"
    ]
  },
  "cs": {
    "titles": [
      "HTML a přenositelnost",
      "Pokročilý styl textu",
      "Odstavce a rozvržení",
      "Sloučené a barevné tabulky",
      "Interaktivní bloky a kotvy",
      "Vlastní číslování seznamů",
      "Závěrečný projekt"
    ],
    "sub": [
      "Co funguje na různých Markdown platformách",
      "Zvýraznění, indexy, barvy a písma",
      "Zarovnání, odsazení, řádkování a konce stránek",
      "Colspan, rowspan a bezpečné barvy buněk",
      "Rozbalovací sekce, upozornění a interní odkazy",
      "Abecední a římské číslování",
      "Spojte vše v jeden upravený dokument"
    ],
    "theory": [
      "Markdown nabízí základní strukturu, ale podtržení a indexy vyžadují HTML. Některé platformy HTML či styly odstraňují. Pro věrný výstup použijte export HTML.",
      "Používejte značku <mark> a přednastavené třídy CSS pro barvu, typ a velikost písma. Tyto funkce nemusí fungovat v jiných Markdown editorech.",
      "Zarovnání, odsazení a řádkování používají HTML s bezpečnými třídami. Konec stránky se projeví při tisku nebo exportu PDF.",
      "HTML tabulky umožňují spojovat buňky. Hodnoty colspan a rowspan jsou omezené a barvy buněk používají bezpečné třídy.",
      "Rozbalovací bloky používají HTML. Informační boxy mají přednastavené styly a interní odkazy vedou na platné kotvy.",
      "HTML seznamy mohou používat abecední nebo římské číslování. Použijte skutečné značky ol a li.",
      "Vytvořte dokument s nadpisem Markdown, HTML typografií, zarovnáním, sloučenou tabulkou, informačním boxem a číslovaným seznamem."
    ],
    "tasks": [
      [
        "Podtrhněte text pomocí <u>",
        "Vytvořte horní index <sup>",
        "Vytvořte dolní index <sub>"
      ],
      [
        "Zvýrazněte text pomocí <mark>",
        "Použijte přednastavenou barvu textu",
        "Použijte třídy písma a velikosti"
      ],
      [
        "Zarovnejte odstavec na střed nebo doprava",
        "Použijte odsazení a řádkování",
        "Vložte konec stránky pro tisk"
      ],
      [
        "Sloučte dva nebo více sloupců",
        "Sloučte dva nebo více řádků",
        "Obarvěte buňku tabulky"
      ],
      [
        "Vytvořte blok details se summary",
        "Vložte informační či varovný box",
        "Propojte interní odkaz a kotvu"
      ],
      [
        "Vytvořte abecedně číslovaný seznam",
        "Použijte římské číslování",
        "Vytvořte tři položky seznamu"
      ],
      [
        "Použijte nadpis H1 v Markdownu",
        "Přidejte pokročilé formátování textu",
        "Zarovnejte odstavec",
        "Vložte sloučenou HTML tabulku",
        "Přidejte informační box",
        "Vložte vlastní číslovaný seznam"
      ]
    ],
    "phrases": [
      "Podtržený text",
      "Důležitá poznámka",
      "Modrý text",
      "Upravený text",
      "Vycentrovaný odstavec",
      "Odsazený odstavec",
      "Sloučený nadpis",
      "První",
      "Druhý",
      "Třetí",
      "Další informace",
      "Upozornění",
      "Cílová sekce",
      "Přejít na sekci",
      "Hotovo",
      "Formátovaný dokument"
    ]
  },
  "uk": {
    "titles": [
      "HTML і сумісність",
      "Розширене оформлення тексту",
      "Абзаци та макет сторінки",
      "Об’єднані й кольорові таблиці",
      "Інтерактивні блоки та якорі",
      "Додаткова нумерація списків",
      "Підсумковий документ"
    ],
    "sub": [
      "Що працює на різних Markdown-платформах",
      "Виділення, індекси, колір і шрифти",
      "Вирівнювання, відступи та розриви сторінок",
      "Colspan, rowspan і безпечні кольори клітинок",
      "Розгортання, примітки та внутрішні посилання",
      "Алфавітна й римська нумерація",
      "Поєднайте все в одному документі"
    ],
    "theory": [
      "Markdown підтримує базову структуру, але підкреслення та індекси потребують HTML. Деякі платформи видаляють HTML або стилі. Для точного результату експортуйте HTML.",
      "Використовуйте <mark> та фіксовані CSS-класи для кольорів, шрифтів і розмірів. Ці можливості можуть не працювати в інших Markdown-застосунках.",
      "Вирівнювання, відступи та міжрядкові інтервали використовують безпечні HTML-класи. Розрив сторінки діє під час друку або створення PDF.",
      "HTML-таблиці підтримують об’єднання клітинок. Colspan і rowspan мають обмеження, а колір задається дозволеними класами.",
      "Розгортані блоки використовують HTML. Інформаційні блоки мають фіксовані стилі; внутрішні посилання ведуть на перевірені якорі.",
      "HTML-списки підтримують буквені й римські номери. Використовуйте справжні теги ol і li.",
      "Створіть документ із заголовком Markdown, HTML-стилями, вирівнюванням, об’єднаною таблицею, блоком інформації та нумерованим списком."
    ],
    "tasks": [
      [
        "Створіть підкреслення через <u>",
        "Використайте верхній індекс <sup>",
        "Використайте нижній індекс <sub>"
      ],
      [
        "Виділіть текст через <mark>",
        "Застосуйте дозволений колір тексту",
        "Застосуйте клас шрифту та розміру"
      ],
      [
        "Вирівняйте абзац по центру або праворуч",
        "Додайте відступ і міжрядковий інтервал",
        "Додайте розрив сторінки для друку"
      ],
      [
        "Об’єднайте два або більше стовпців",
        "Об’єднайте два або більше рядків",
        "Задайте колір клітинки таблиці"
      ],
      [
        "Створіть блок details із summary",
        "Додайте інформаційний блок",
        "Створіть внутрішнє посилання на якір"
      ],
      [
        "Створіть список із буквеною нумерацією",
        "Створіть список із римською нумерацією",
        "Додайте щонайменше три елементи списку"
      ],
      [
        "Додайте заголовок Markdown H1",
        "Використайте розширене оформлення тексту",
        "Вирівняйте абзац",
        "Додайте таблицю з об’єднаними клітинками",
        "Додайте інформаційний блок",
        "Використайте нестандартну нумерацію"
      ]
    ],
    "phrases": [
      "Підкреслений текст",
      "Важлива примітка",
      "Синій текст",
      "Оформлений текст",
      "Абзац по центру",
      "Абзац із відступом",
      "Об’єднаний заголовок",
      "Перший",
      "Другий",
      "Третій",
      "Додаткова інформація",
      "Попередження",
      "Цільовий розділ",
      "Перейти до розділу",
      "Готово",
      "Оформлений документ"
    ]
  },
  "ro": {
    "titles": [
      "HTML și compatibilitate",
      "Stilizarea avansată a textului",
      "Paragrafe și paginare",
      "Tabele cu celule îmbinate",
      "Blocuri interactive și ancore",
      "Numerotarea personalizată",
      "Proiectul final avansat"
    ],
    "sub": [
      "Ce se păstrează pe platformele Markdown",
      "Subliniere, indici, culori și fonturi",
      "Aliniere, indentare și întreruperi de pagină",
      "Colspan, rowspan și celule colorate",
      "Secțiuni extensibile, casete și legături interne",
      "Liste alfabetice și cifre romane",
      "Combinați totul într-un document"
    ],
    "theory": [
      "Markdown oferă structură de bază, dar sublinierea și indicii folosesc HTML. Unele platforme elimină HTML sau stilurile. Exportați HTML pentru un rezultat fidel.",
      "Folosiți <mark> și clase CSS prestabilite pentru culoare, font și dimensiune. Unele aplicații Markdown nu acceptă aceste opțiuni.",
      "Alinierea, indentarea și spațierea folosesc clase HTML sigure. Întreruperile de pagină au efect la imprimare sau în PDF.",
      "Tabelele HTML permit îmbinarea celulelor. Valorile colspan și rowspan sunt limitate și culorile se aleg din clase aprobate.",
      "Secțiunile extensibile folosesc HTML. Casetele informative au stiluri fixe, iar legăturile interne duc la ancore validate.",
      "Listele HTML pot fi numerotate alfabetic sau cu cifre romane. Folosiți elementele ol și li.",
      "Creați un document cu titlu Markdown, stiluri HTML, aliniere, tabel cu celule îmbinate, casetă și listă numerotată."
    ],
    "tasks": [
      [
        "Subliniați text cu <u>",
        "Folosiți indice superior <sup>",
        "Folosiți indice inferior <sub>"
      ],
      [
        "Evidențiați text cu <mark>",
        "Aplicați o culoare de text aprobată",
        "Aplicați font și dimensiune presetate"
      ],
      [
        "Aliniați un paragraf la centru sau la dreapta",
        "Aplicați indentare și spațiere",
        "Adăugați întrerupere de pagină"
      ],
      [
        "Îmbinați două sau mai multe coloane",
        "Îmbinați două sau mai multe rânduri",
        "Colorați o celulă a tabelului"
      ],
      [
        "Creați un bloc details cu summary",
        "Creați o casetă de informații sau avertizare",
        "Creați o legătură către o ancoră"
      ],
      [
        "Folosiți numerotarea alfabetică",
        "Folosiți numerotarea romană",
        "Creați cel puțin trei elemente de listă"
      ],
      [
        "Adăugați un titlu Markdown H1",
        "Folosiți stilizarea avansată a textului",
        "Aliniați un paragraf",
        "Adăugați un tabel cu celule îmbinate",
        "Adăugați o casetă informativă",
        "Creați o listă cu numerotare specială"
      ]
    ],
    "phrases": [
      "Text subliniat",
      "Notă importantă",
      "Text albastru",
      "Text stilizat",
      "Paragraf centrat",
      "Paragraf indentat",
      "Antet îmbinat",
      "Primul",
      "Al doilea",
      "Al treilea",
      "Mai multe detalii",
      "Avertizare",
      "Secțiune țintă",
      "Mergi la secțiune",
      "Succes",
      "Document formatat"
    ]
  },
  "ru": {
    "titles": [
      "HTML и совместимость",
      "Расширенное оформление текста",
      "Абзацы и макет страницы",
      "Объединённые и цветные таблицы",
      "Интерактивные блоки и якоря",
      "Нестандартная нумерация",
      "Итоговый проект"
    ],
    "sub": [
      "Какие возможности переносимы между Markdown-платформами",
      "Выделение, индексы, цвет, шрифт и размер",
      "Выравнивание, отступы, интервалы и разрывы страниц",
      "Colspan, rowspan и оформление ячеек",
      "Раскрывающиеся блоки, предупреждения и ссылки",
      "Буквенные и римские номера списков",
      "Создайте полноценный оформленный документ"
    ],
    "theory": [
      "Markdown поддерживает базовую разметку, но подчёркивание и индексы требуют HTML. Другие платформы могут удалять HTML и CSS. Для точного внешнего вида экспортируйте самостоятельный HTML-файл.",
      "Для выделения используйте тег <mark>, для цветов, шрифтов и размеров — только разрешённые CSS-классы. Такое оформление необязательно поддерживается другими Markdown-платформами.",
      "Выравнивание, отступы и межстрочные интервалы работают через HTML с безопасными классами. Разрыв страницы действует при печати и создании PDF.",
      "HTML-таблицы поддерживают объединение строк и столбцов. Значения colspan и rowspan ограничены, а для окраски ячеек используются предустановленные классы.",
      "Раскрывающиеся блоки используют стандартный HTML. Информационные и предупреждающие блоки имеют готовые стили, а внутренние ссылки ведут к проверенным якорям.",
      "HTML-списки могут нумероваться буквами или римскими цифрами. Используйте настоящие теги ol и li, а не просто символы перед текстом.",
      "Создайте документ с Markdown-заголовком, продвинутым оформлением текста, выравниванием, объединённой таблицей, информационным блоком и нумерованным списком."
    ],
    "tasks": [
      [
        "Подчеркните фразу тегом <u>",
        "Создайте верхний индекс <sup>",
        "Создайте нижний индекс <sub>"
      ],
      [
        "Выделите текст с помощью <mark>",
        "Примените допустимый цвет текста",
        "Примените классы шрифта и размера"
      ],
      [
        "Выровняйте абзац по центру или вправо",
        "Примените отступ и межстрочный интервал",
        "Добавьте разрыв страницы для PDF/печати"
      ],
      [
        "Объедините минимум два столбца",
        "Объедините минимум две строки",
        "Раскрасьте ячейку таблицы"
      ],
      [
        "Создайте раскрывающийся блок details/summary",
        "Добавьте информационный или предупреждающий блок",
        "Создайте внутреннюю ссылку на якорь"
      ],
      [
        "Создайте буквенную нумерацию",
        "Добавьте римскую нумерацию",
        "Создайте список минимум из трёх элементов"
      ],
      [
        "Добавьте заголовок Markdown H1",
        "Используйте расширенное оформление текста",
        "Выровняйте абзац",
        "Добавьте таблицу с объединением ячеек",
        "Добавьте информационный блок",
        "Добавьте список с нестандартной нумерацией"
      ]
    ],
    "phrases": [
      "Подчёркнутый текст",
      "Важная заметка",
      "Синий текст",
      "Оформленный текст",
      "Абзац по центру",
      "Абзац с отступом",
      "Объединённый заголовок",
      "Первый",
      "Второй",
      "Третий",
      "Подробнее",
      "Предупреждение",
      "Целевой раздел",
      "Перейти к разделу",
      "Успех",
      "Оформленный отчёт"
    ]
  }
};
const TOKENS=["underlined","important","blue","typography","centered","indented","merged","first","second","third","details","warning","section","go","success","report"];
export const ADVANCED_IDS=ADVANCED_LESSON_SPECS.map(x=>x.slug);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export const replaceTokens=(source,lang)=>{
 const local=ADVANCED_LOCALES[lang]||ADVANCED_LOCALES.en;
 return source.replace(/\{\{(\w+)\}\}/g,(_,token)=>{
  const i=TOKENS.indexOf(token);
  return i<0?'':esc(local.phrases[i]);
 });
};
export function advancedLesson(index,lang='en'){
 const spec=ADVANCED_LESSON_SPECS[index];
 if(!spec)return null;
 const l=ADVANCED_LOCALES[lang]||ADVANCED_LOCALES.en;
 const tip=spec.theoryCode.replaceAll('<','&lt;').replaceAll('>','&gt;');
 const first=l.phrases[15];
 return {id:spec.slug,index,track:'advanced',tab:spec.slug+' '+l.titles[index],
  title:l.titles[index],subtitle:l.sub[index],
  theory:'<p>'+esc(l.theory[index])+'</p><p><code>'+tip+'</code></p>',
  initial:'# '+esc(first)+'\n\n',hint:replaceTokens(spec.solution,lang),
  examples:spec.snippets.map((s,j)=>({label:l.tasks[index][j],code:replaceTokens(s,lang)})),
  tasks:spec.types.map((type,j)=>({id:spec.slug+'_'+j,text:l.tasks[index][j],type}))
 };
}
const query=(doc,selector)=>Boolean(doc.querySelector(selector));
const count=(doc,selector)=>doc.querySelectorAll(selector).length;
const styles=doc=>[...doc.querySelectorAll('[class]')].flatMap(el=>[...el.classList]);
const hasClass=(doc,pattern)=>styles(doc).some(x=>pattern.test(x));
const anchorValid=doc=>[...doc.querySelectorAll('a[href^="#"]')].some(a=>{
 const id=a.getAttribute('href').slice(1);
 return [...doc.querySelectorAll('[id]')].some(el=>el.id===id);
});
const CHECKS={
 u:doc=>query(doc,'u'),sup:doc=>query(doc,'sup'),sub:doc=>query(doc,'sub'),
 mark:doc=>query(doc,'mark'),color:doc=>hasClass(doc,/^af-color-(?:ink|red|blue|green|purple)$/),
 font:doc=>hasClass(doc,/^af-font-(?:sans|serif|mono)$/)&&hasClass(doc,/^af-size-(?:small|normal|large|xlarge)$/),
 align:doc=>hasClass(doc,/^af-align-(?:center|right|justify)$/),
 indent:doc=>hasClass(doc,/^af-indent-(?:small|medium|large)$/)&&hasClass(doc,/^af-spacing-(?:compact|normal|relaxed|double)$/),
 break:doc=>query(doc,'.af-page-break'),
 colspan:doc=>[...doc.querySelectorAll('table th[colspan],table td[colspan]')].some(x=>Number(x.getAttribute('colspan'))>=2),
 rowspan:doc=>[...doc.querySelectorAll('table th[rowspan],table td[rowspan]')].some(x=>Number(x.getAttribute('rowspan'))>=2),
 cell:doc=>query(doc,'table .af-cell-blue,table .af-cell-mint,table .af-cell-sand'),
 details:doc=>query(doc,'details summary'),
 callout:doc=>query(doc,'.af-callout-info,.af-callout-warning,.af-callout-success'),
 anchor:doc=>anchorValid(doc),
 alpha:doc=>query(doc,'ol[type="a"],ol[type="A"]'),
 roman:doc=>query(doc,'ol[type="i"],ol[type="I"]'),
 list:doc=>[...doc.querySelectorAll('ol')].some(ol=>ol.querySelectorAll('li').length>=3),
 heading:doc=>query(doc,'h1'),
 text:doc=>query(doc,'mark,u,sup,sub,.af-color-green,.af-color-blue,.af-size-large'),
 layout:doc=>hasClass(doc,/^af-align-(?:center|right|justify)$/),
 table:doc=>CHECKS.colspan(doc)||CHECKS.rowspan(doc)
};
export function verifyAdvancedLesson(lesson,markdown,html){
 if(!lesson)return [];
 const doc=new DOMParser().parseFromString(String(html||''),'text/html');
 const types=ADVANCED_LESSON_SPECS[lesson.index].types;
 return types.map((type,i)=>({id:lesson.id+'_'+i,text:lesson.tasks[i].text,passed:Boolean(CHECKS[type]?.(doc))}));
}
