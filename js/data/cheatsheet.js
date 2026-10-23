export const cheats = [
 {key:'heading',code:'# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4\n##### Heading 5\n###### Heading 6'},
 {key:'emphasis',code:'**Bold text**\n*Italic text*\n~~Strikethrough~~'},
 {key:'quotes',code:'> Quote from an expert\n>> Nested quote'},
 {key:'lists',code:'- First item\n- Second item\n1. Step one\n2. Step two'},
 {key:'tasks',code:'- [x] Completed task\n- [ ] Open task'},
 {key:'link',code:'[CommonMark](https://commonmark.org)'},
 {key:'image',code:'![Demo image](https://placehold.co/600x160/png)'},
 {key:'inline',code:'Run `npm run dev` to begin.'},
 {key:'fenced',code:'```javascript\nconsole.log("Hello, Markdown!");\n```'},
 {key:'table',code:'| Tool | Benefit |\n| --- | --- |\n| Markdown | Fast formatting |'},
 {key:'divider',code:'---\n\n***\n\n___'},
 {key:'escaping',code:'Use \\* to show a literal star'},
 {key:'prompt',code:'## AI Prompt\n> Act as a helpful writing assistant.\n\n- [ ] List your assumptions\n- [ ] Provide an example'}
,
 {"key":"setext","code":"Heading level 1\n===============\n\nHeading level 2\n---------------"},
 {"key":"paragraph","code":"First paragraph.\n\nSecond paragraph.\n\nFirst line with two trailing spaces  \nSecond line."},
 {"key":"combined","code":"***Bold and italic together***"},
 {"key":"nested-lists","code":"- Outer item\n  - Nested item\n    - Deeper item"},
 {"key":"reference-links","code":"Read the [documentation][spec].\n\n[spec]: https://spec.commonmark.org/ \"CommonMark specification\""},
 {"key":"indented-code","code":"Indented code block:\n\n    const answer = 42;\n    console.log(answer);"},
 {"key":"autolinks","code":"<https://commonmark.org/>\n\n<hello@example.com>"},
 {"key":"html","code":"Markdown with safe HTML: <em>emphasis</em> and <br> a line break."}
];
export const titles = {
 en:['Headings','Emphasis','Nested Quotes','Lists','Task Checklists','Links','Images','Inline Code','Fenced Code','GFM Tables','Divider','Escaping','AI Prompt',"Setext Headings","Paragraphs & Line Breaks","Bold + Italic","Nested Lists","Reference Links","Indented Code","Automatic Links","Safe Inline HTML"],
 cs:['Nadpisy','Zvýraznění','Vnořené citace','Seznamy','Seznam úkolů','Odkazy','Obrázky','Vložený kód','Blok kódu','Tabulky GFM','Oddělovač','Escapování','AI prompt',"Podtržené nadpisy","Odstavce a zalomení řádků","Tučné + kurzíva","Vnořené seznamy","Referenční odkazy","Odsazený kód","Automatické odkazy","Bezpečné HTML"],
 uk:['Заголовки','Виділення','Вкладені цитати','Списки','Список завдань','Посилання','Зображення','Рядковий код','Блок коду','Таблиці GFM','Роздільник','Екранування','AI-промпт',"Заголовки Setext","Абзаци та розриви рядків","Жирний + курсив","Вкладені списки","Посилання за посиланням","Код із відступом","Автоматичні посилання","Безпечний HTML"],
 ro:['Titluri','Evidențiere','Citate imbricate','Liste','Sarcini','Legături','Imagini','Cod inline','Bloc de cod','Tabele GFM','Separator','Escapare','Prompt AI',"Titluri Setext","Paragrafe și rânduri noi","Aldin + cursiv","Liste imbricate","Linkuri de referință","Cod indentat","Linkuri automate","HTML sigur"],
 ru:['Заголовки','Выделение','Вложенные цитаты','Списки','Списки задач','Ссылки','Изображения','Строчный код','Блок кода','Таблицы GFM','Разделитель','Экранирование','AI-промпт',"Заголовки Setext","Абзацы и переносы строк","Жирный + курсив","Вложенные списки","Ссылки по идентификатору","Код с отступом","Автоматические ссылки","Безопасный HTML"]
};
