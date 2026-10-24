// Practical, offline-first lessons for optional Extensions & Hacks (#17).
export const PRACTICE_LABS = Object.freeze([
  {
    "id": "unicode-entities",
    "category": "commonmark",
    "dialect": "gfm",
    "starter": "Symbols to add.",
    "example": "Unicode: © ® ™ € π ° →\n\nEntities: &copy; &reg; &trade; &euro; &rarr;\n\nMixed directions: English / العربية / עברית.",
    "checks": [
      "symbols",
      "entities-rtl"
    ]
  },
  {
    "id": "emoji-shortcodes",
    "category": "app",
    "dialect": "gfm",
    "labFeatures": [
      "emojiShortcodes"
    ],
    "starter": "Status: :rocket: :lock:",
    "example": "Status: :rocket: :lock:\n\nLiteral code: `:rocket:`",
    "checks": [
      "expanded",
      "literal-code"
    ]
  },
  {
    "id": "gfm-table-tricks",
    "category": "gfm-html",
    "dialect": "gfm",
    "starter": "| Expression | Meaning |\n| --- | --- |\n| A | B | Plain text |",
    "example": "| Expression | Meaning |\n| --- | --- |\n| A \\| B | **Important**<br>Second line |\n| C &#124; D | *Italic* inside a cell |",
    "checks": [
      "pipes",
      "inline-break"
    ]
  },
  {
    "id": "html-table-list",
    "category": "html",
    "dialect": "gfm",
    "starter": "| Topic | Details |\n| --- | --- |\n| Steps | One, Two |",
    "example": "<table>\n<tr><th>Topic</th><th>Details</th></tr>\n<tr><td>Steps</td><td><ul><li>One</li><li>Two</li></ul></td></tr>\n</table>",
    "checks": [
      "nested-list",
      "list-elements"
    ]
  },
  {
    "id": "portable-callout",
    "category": "commonmark",
    "dialect": "gfm",
    "starter": "**Note:** Keep the source readable.",
    "example": "> **Note:** Keep the original Markdown source.\n>\n> This is an ordinary blockquote, not a GitHub alert.\n>\n> > A nested reply.",
    "checks": [
      "callout",
      "nested"
    ]
  },
  {
    "id": "author-notes",
    "category": "commonmark-html",
    "dialect": "gfm",
    "starter": "Public text stays visible.",
    "example": "Public text stays visible.\n\n[editor-note]: # (Internal: confirm final numbers before publication)\n\n<!-- Editor: update this passage after review. -->",
    "checks": [
      "reference-definition",
      "html-comment"
    ]
  },
  {
    "id": "video-preview-links",
    "category": "commonmark-external",
    "dialect": "gfm",
    "starter": "Watch the video.",
    "example": "[Watch the video](https://example.com/watch)\n\n[![Video preview](https://placehold.co/320x180/png)](https://example.com/watch)",
    "checks": [
      "video-link",
      "thumbnail"
    ]
  }
]);
export const PRACTICE_LAB_TEXT = Object.freeze({
  "en": {
    "unicode-entities": {
      "title": "Unicode and HTML entities",
      "description": "Write Unicode symbols, their HTML entity equivalents and right-to-left sample text. Verify the rendered characters, not a code example.",
      "portability": "Unicode and entities: CommonMark · RTL visual order depends on the browser",
      "checks": [
        "Unicode and entity paragraphs render the expected symbols",
        "A separate paragraph contains both Arabic and Hebrew text"
      ]
    },
    "emoji-shortcodes": {
      "title": "Optional emoji shortcodes",
      "description": "Turn :rocket: and :lock: into actual symbols, but keep :rocket: literal inside inline code.",
      "portability": "App-only optional emoji grammar · not normative CommonMark/GFM",
      "checks": [
        "Emoji shortcodes expand into the correct characters",
        "Inline code retains the literal shortcode"
      ]
    },
    "gfm-table-tricks": {
      "title": "GFM table tricks",
      "description": "Escaped pipes must stay inside cells. Use <br>, bold and italic formatting inside table cells.",
      "portability": "GFM tables with inline HTML · not portable to plain CommonMark",
      "checks": [
        "Both escaped and entity pipes remain inside two-column rows",
        "Break and emphasis are rendered inside the cells"
      ]
    },
    "html-table-list": {
      "title": "Lists inside HTML tables",
      "description": "A GFM pipe table does not support block lists inside cells. Use semantic HTML table, ul and li elements instead.",
      "portability": "HTML tables and lists · support depends on host sanitizer",
      "checks": [
        "A table cell contains a real nested unordered list",
        "The list contains separate One and Two items"
      ]
    },
    "portable-callout": {
      "title": "Portable callouts and nested quotes",
      "description": "Build an ordinary Markdown blockquote with bold Note text and a nested reply, avoiding special GitHub alert syntax.",
      "portability": "CommonMark blockquotes and bold · portable; GitHub alerts differ",
      "checks": [
        "A real blockquote displays a bold Note label",
        "A nested blockquote displays the reply"
      ]
    },
    "author-notes": {
      "title": "Invisible author comments",
      "description": "Use an unused Markdown reference definition and an HTML comment to keep internal reminders out of Preview.",
      "portability": "Reference definitions: CommonMark · HTML comments: host-dependent",
      "checks": [
        "Unused reference metadata remains invisible in Preview",
        "An HTML author comment is present only in source, not Preview"
      ]
    },
    "video-preview-links": {
      "title": "Safe video links and thumbnails",
      "description": "Make a normal video link and a clickable thumbnail image. Embedded iframes are deliberately not used.",
      "portability": "CommonMark links and images · remote thumbnail needs network",
      "checks": [
        "A normal external link opens the video",
        "An image inside a link acts as a video preview"
      ]
    }
  },
  "cs": {
    "unicode-entities": {
      "title": "Unicode a HTML entity",
      "description": "Zapište symboly Unicode, jejich HTML entity a příklad zprava doleva. Kontroluje se vykreslení.",
      "portability": "Unicode a entity: CommonMark · směr RTL závisí na prohlížeči",
      "checks": [
        "Text Unicode a entit zobrazí očekávané symboly",
        "Samostatný odstavec obsahuje arabštinu i hebrejštinu"
      ]
    },
    "emoji-shortcodes": {
      "title": "Volitelné emoji kódy",
      "description": "Rozbalte :rocket: a :lock:, ale v řádkovém kódu nechte :rocket: doslova.",
      "portability": "Volitelné rozšíření aplikace · není standard GFM",
      "checks": [
        "Emoji kódy se zobrazí jako symboly",
        "V řádkovém kódu zůstane doslovný kód"
      ]
    },
    "gfm-table-tricks": {
      "title": "Triky s tabulkami GFM",
      "description": "Escapované svislice musí zůstat v buňce. Použijte <br>, tučné a kurzívu.",
      "portability": "Tabulky GFM s HTML · nefunguje ve všech CommonMark procesorech",
      "checks": [
        "Oba typy svislic zůstanou ve dvousloupcové tabulce",
        "Konce řádků a zvýraznění se vykreslí v buňce"
      ]
    },
    "html-table-list": {
      "title": "Seznamy v HTML tabulkách",
      "description": "Běžná tabulka GFM nepodporuje blokové seznamy v buňkách. Použijte HTML table, ul a li.",
      "portability": "HTML tabulka a seznam · záleží na sanitizaci platformy",
      "checks": [
        "Buňka obsahuje skutečný vnořený seznam",
        "Seznam obsahuje oddělené položky One a Two"
      ]
    },
    "portable-callout": {
      "title": "Přenositelné poznámky a citace",
      "description": "Vytvořte blockquote s tučným Note a vnořenou odpovědí bez speciálních upozornění GitHubu.",
      "portability": "Citace a tučné písmo v CommonMark · přenositelné",
      "checks": [
        "Citace obsahuje tučný nadpis Note",
        "Vnořená citace obsahuje odpověď"
      ]
    },
    "author-notes": {
      "title": "Neviditelné poznámky autora",
      "description": "Použijte nevyužitou definici odkazu a HTML komentář pro interní poznámky.",
      "portability": "Definice odkazů: CommonMark · HTML komentáře závisí na platformě",
      "checks": [
        "Interní definice odkazu není v náhledu",
        "HTML komentář zůstává pouze ve zdroji"
      ]
    },
    "video-preview-links": {
      "title": "Bezpečné odkazy na video",
      "description": "Vložte obyčejný odkaz a obrázek s odkazem na video, bez iframe.",
      "portability": "Odkazy a obrázky CommonMark · náhled potřebuje síť",
      "checks": [
        "Externí odkaz vede na video",
        "Obrázek uvnitř odkazu funguje jako náhled"
      ]
    }
  },
  "uk": {
    "unicode-entities": {
      "title": "Unicode та HTML-сутності",
      "description": "Додайте символи Unicode, HTML-сутності та текст справа наліво. Перевіряється результат.",
      "portability": "Unicode і сутності: CommonMark · напрям RTL залежить від браузера",
      "checks": [
        "Символи Unicode та сутностей відтворені правильно",
        "Окремий абзац містить арабський та іврит"
      ]
    },
    "emoji-shortcodes": {
      "title": "Додаткові emoji-коди",
      "description": "Перетворіть :rocket: і :lock: на символи, але залиште :rocket: буквальним у коді.",
      "portability": "Розширення застосунку · не нормативний GFM",
      "checks": [
        "Emoji-коди перетворені на символи",
        "У рядковому коді скорочення не змінюється"
      ]
    },
    "gfm-table-tricks": {
      "title": "Прийоми для таблиць GFM",
      "description": "Екрановані вертикальні риски мають залишатися в клітинці. Використайте <br>, жирний текст і курсив.",
      "portability": "Таблиці GFM з HTML · не у звичайному CommonMark",
      "checks": [
        "Обидві вертикальні риски залишаються в клітинках",
        "Перенос і форматування правильно відтворено"
      ]
    },
    "html-table-list": {
      "title": "Списки в HTML-таблицях",
      "description": "Для справжніх списків у клітинці використайте HTML table, ul і li.",
      "portability": "HTML таблиці та списки · залежить від платформи",
      "checks": [
        "Комірка таблиці має вкладений список",
        "Список містить окремі елементи One і Two"
      ]
    },
    "portable-callout": {
      "title": "Переносні примітки та цитати",
      "description": "Створіть звичайну цитату Markdown із жирним Note і вкладеною відповіддю.",
      "portability": "Цитати CommonMark · переносні; сповіщення GitHub окремі",
      "checks": [
        "Справжня цитата має жирну позначку Note",
        "Вкладена цитата містить відповідь"
      ]
    },
    "author-notes": {
      "title": "Приховані примітки автора",
      "description": "Використайте невикористане визначення посилання та HTML-коментар.",
      "portability": "Визначення посилання: CommonMark · HTML-коментар залежить від платформи",
      "checks": [
        "Внутрішнє визначення не показане у Preview",
        "HTML-коментар залишається лише у джерелі"
      ]
    },
    "video-preview-links": {
      "title": "Посилання на відео з прев'ю",
      "description": "Створіть звичайне посилання та клікабельне зображення замість iframe.",
      "portability": "CommonMark посилання й зображення · прев'ю потребує мережі",
      "checks": [
        "Звичайне посилання відкриває відео",
        "Зображення всередині посилання служить прев'ю"
      ]
    }
  },
  "ro": {
    "unicode-entities": {
      "title": "Unicode și entități HTML",
      "description": "Scrie simboluri Unicode, entități HTML și text de la dreapta la stânga. Verifică redarea reală.",
      "portability": "Unicode și entități: CommonMark · ordinea RTL depinde de browser",
      "checks": [
        "Simbolurile Unicode și entitățile sunt redate corect",
        "Alt paragraf conține arabă și ebraică"
      ]
    },
    "emoji-shortcodes": {
      "title": "Coduri emoji opționale",
      "description": "Extinde :rocket: și :lock:, dar păstrează :rocket: literal în codul inline.",
      "portability": "Doar extensia aplicației · nu face parte din GFM",
      "checks": [
        "Codurile emoji devin simboluri",
        "Codul inline păstrează forma literală"
      ]
    },
    "gfm-table-tricks": {
      "title": "Trucuri pentru tabele GFM",
      "description": "Păstrează barele verticale în celule. Folosește <br>, aldin și cursiv.",
      "portability": "Tabele GFM cu HTML · diferă de CommonMark",
      "checks": [
        "Ambele bare verticale rămân în celulele tabelului",
        "Saltul de rând și formatarea apar în celule"
      ]
    },
    "html-table-list": {
      "title": "Liste în tabele HTML",
      "description": "Pentru liste autentice în celule folosește table, ul și li HTML.",
      "portability": "Tabele și liste HTML · depinde de platformă",
      "checks": [
        "O celulă conține o listă imbricată",
        "Lista conține elementele One și Two"
      ]
    },
    "portable-callout": {
      "title": "Note portabile și citate",
      "description": "Construiește un citat Markdown cu Note aldin și un răspuns imbricat.",
      "portability": "Blockquote CommonMark · portabil; alertele GitHub diferă",
      "checks": [
        "Un citat real conține eticheta Note aldin",
        "Un citat imbricat conține răspunsul"
      ]
    },
    "author-notes": {
      "title": "Note invizibile pentru autor",
      "description": "Folosește o definiție de referință neutilizată și un comentariu HTML.",
      "portability": "Definiții: CommonMark · comentarii HTML în funcție de platformă",
      "checks": [
        "Definiția internă nu apare în Preview",
        "Comentariul HTML rămâne doar în sursă"
      ]
    },
    "video-preview-links": {
      "title": "Linkuri video cu miniatură",
      "description": "Creează un link normal și o miniatură clicabilă fără iframe.",
      "portability": "Linkuri și imagini CommonMark · miniatura necesită internet",
      "checks": [
        "Un link extern indică videoclipul",
        "O imagine cu link funcționează ca previzualizare"
      ]
    }
  },
  "ru": {
    "unicode-entities": {
      "title": "Unicode и HTML-сущности",
      "description": "Добавьте Unicode-символы, их HTML-сущности и текст справа налево. Проверяется результат в Preview, а не исходные строки.",
      "portability": "Unicode и HTML-сущности — CommonMark; порядок RTL зависит от браузера",
      "checks": [
        "Символы и HTML-сущности правильно отображаются",
        "В отдельном абзаце виден текст на арабском и иврите"
      ]
    },
    "emoji-shortcodes": {
      "title": "Emoji shortcodes",
      "description": "Преобразуйте :rocket: и :lock: в символы, оставив :rocket: внутри строчного кода без изменений.",
      "portability": "Необязательное расширение приложения; не часть GFM/CommonMark",
      "checks": [
        "Emoji-коды преобразованы в символы",
        "В строчном коде остался буквальный shortcode"
      ]
    },
    "gfm-table-tricks": {
      "title": "Приёмы для таблиц GFM",
      "description": "Экранируйте вертикальную черту внутри ячейки. Добавьте <br>, жирный текст и курсив.",
      "portability": "Таблицы GFM + HTML; обычный CommonMark не поддерживает таблицы GFM",
      "checks": [
        "Оба варианта вертикальной черты находятся внутри ячеек",
        "Переносы строк и выделение работают внутри таблицы"
      ]
    },
    "html-table-list": {
      "title": "Списки в HTML-таблицах",
      "description": "Для настоящего маркированного списка внутри ячейки используйте HTML table, ul и li.",
      "portability": "HTML-таблица; сохранение разметки зависит от платформы",
      "checks": [
        "В ячейке находится настоящий вложенный список",
        "Список содержит два отдельных пункта One и Two"
      ]
    },
    "portable-callout": {
      "title": "Переносимые примечания и цитаты",
      "description": "Сделайте обычную цитату Markdown с жирным Note и вложенным ответом без нестандартных GitHub Alerts.",
      "portability": "Цитата и жирное начертание — CommonMark; переносимый вариант",
      "checks": [
        "В цитате отображается жирный заголовок Note",
        "Внутри цитаты есть вложенный ответ"
      ]
    },
    "author-notes": {
      "title": "Невидимые заметки редактора",
      "description": "Добавьте неиспользуемое определение ссылки и HTML-комментарий. Ни одна заметка не должна попасть в Preview.",
      "portability": "Определение ссылки — CommonMark; HTML-комментарии зависят от платформы",
      "checks": [
        "Внутреннее определение ссылки не попало в Preview",
        "HTML-комментарий остался только в исходном Markdown"
      ]
    },
    "video-preview-links": {
      "title": "Ссылки на видео и превью",
      "description": "Создайте обычную ссылку на ролик и кликабельную обложку вместо небезопасного iframe.",
      "portability": "Ссылки и изображения — CommonMark; внешнее изображение требует интернета",
      "checks": [
        "Ссылка на видео отображается и ведёт на адрес",
        "Картинка внутри ссылки работает как обложка видео"
      ]
    }
  }
});
