/** Optional examples for issue #16: no parser or toolbar behavior is changed. */
export const PRACTICAL_HACKS = [
  {
    "id": "portable-callout",
    "level": "core",
    "code": "> **Note:** Keep the original Markdown source.\n>\n> This is an ordinary blockquote, not a GitHub alert."
  },
  {
    "id": "table-pipe",
    "level": "gfm",
    "code": "| Expression | Meaning |\n| --- | --- |\n| A \\| B | Escaped pipe |\n| C &#124; D | HTML entity pipe |"
  },
  {
    "id": "table-break",
    "level": "gfm-html",
    "code": "| Term | Explanation |\n| --- | --- |\n| **Important** | First line<br>Second line |\n| `code` | *Emphasis* inside a cell |"
  },
  {
    "id": "html-cell-list",
    "level": "html",
    "code": "<table>\n<tr><th>Topic</th><th>Details</th></tr>\n<tr><td>Steps</td><td><ul><li>One</li><li>Two</li></ul></td></tr>\n</table>"
  },
  {
    "id": "author-reference",
    "level": "core",
    "code": "Public text stays visible.\n\n[editor-note]: # (Internal: confirm the final numbers before publication)"
  },
  {
    "id": "author-html-comment",
    "level": "html",
    "code": "Public text stays visible.\n\n<!-- Editor: update this passage after legal review. -->"
  },
  {
    "id": "video-link",
    "level": "core",
    "code": "[Watch the video](https://example.com/watch)"
  },
  {
    "id": "video-thumbnail",
    "level": "external",
    "code": "[![Video preview](https://placehold.co/320x180/png)](https://example.com/watch)"
  },
  {
    "id": "nested-quote",
    "level": "core",
    "code": "> A quoted paragraph.\n>\n> > A nested reply.\n\nBack to normal text."
  },
  {
    "id": "entities-and-unicode",
    "level": "core",
    "code": "Unicode: © ® ™ € π ° →\n\nEntities: &copy; &reg; &trade; &euro; &rarr;\n\nMixed directions: English / العربية / עברית."
  }
];
export const PRACTICAL_HACKS_UI = {
  "en": {
    "heading": "Practical Markdown hacks",
    "intro": "Examples are editable and optional. Check the compatibility label before sharing.",
    "levels": {
      "core": "CommonMark",
      "gfm": "GFM only",
      "gfm-html": "GFM + HTML",
      "html": "HTML / processor-specific",
      "external": "CommonMark · external image"
    },
    "entries": {
      "portable-callout": {
        "title": "Portable note",
        "note": "Uses standard blockquotes and bold. Styled GitHub alerts are different and platform-specific."
      },
      "table-pipe": {
        "title": "Pipes in GFM table cells",
        "note": "Escape the pipe as \\| or use &#124;. Without escaping, the table gains an extra column."
      },
      "table-break": {
        "title": "Line breaks and formatting in tables",
        "note": "GFM tables support inline formatting; <br> is allowed HTML. Raw multiline Markdown lists inside a pipe-table cell are not reliably supported."
      },
      "html-cell-list": {
        "title": "A real list inside an HTML table",
        "note": "Use semantic HTML for a real list in a cell. This is not a portable GFM pipe-table technique; some platforms strip raw HTML."
      },
      "author-reference": {
        "title": "Hidden reference-definition note",
        "note": "An unused link definition normally stays in source only. Processor behavior varies; never treat this as secure storage for secrets."
      },
      "author-html-comment": {
        "title": "HTML author comment",
        "note": "The source comment is kept in Markdown, but stripped from sanitized Preview and HTML export. Other processors may expose it in HTML source."
      },
      "video-link": {
        "title": "Video as a normal link",
        "note": "A normal HTTPS link works widely and requires no iframe, embedded player or tracking script. Replace the sample URL."
      },
      "video-thumbnail": {
        "title": "Clickable video thumbnail",
        "note": "Linked image, not an embedded player. Replace both HTTPS URLs; an external thumbnail needs internet access in exported HTML."
      },
      "nested-quote": {
        "title": "Nested blockquotes and blank lines",
        "note": "Use > for each quote level; a blank line outside the quote ends the block."
      },
      "entities-and-unicode": {
        "title": "Entities, Unicode and RTL text",
        "note": "Prefer Unicode when you can. Character references are valid in Markdown text; mixed RTL/LTR line ordering depends on the renderer."
      }
    }
  },
  "cs": {
    "heading": "Praktické triky Markdownu",
    "intro": "Ukázky lze upravit; ověřte kompatibilitu před sdílením.",
    "levels": {
      "core": "CommonMark",
      "gfm": "Pouze GFM",
      "gfm-html": "GFM + HTML",
      "html": "HTML / dle procesoru",
      "external": "CommonMark · externí obrázek"
    },
    "entries": {
      "portable-callout": {
        "title": "Přenositelná poznámka",
        "note": "Používá běžnou citaci a tučné písmo. Stylizovaná upozornění GitHubu jsou specifická pro platformu."
      },
      "table-pipe": {
        "title": "Svislé čáry v tabulce GFM",
        "note": "Svislou čáru zapište jako \\| nebo &#124;. Bez escapování vznikne další sloupec."
      },
      "table-break": {
        "title": "Zalomení řádků a formátování v tabulce",
        "note": "Tabulky GFM umožňují řádkové formátování; <br> je HTML. Víceřádkové seznamy v buňce nejsou spolehlivě podporovány."
      },
      "html-cell-list": {
        "title": "Seznam uvnitř HTML tabulky",
        "note": "Pro seznam v buňce použijte HTML. Nejde o přenositelnou tabulku GFM; některé platformy HTML odstraňují."
      },
      "author-reference": {
        "title": "Skrytá poznámka v definici odkazu",
        "note": "Nepoužitá definice odkazu zůstává obvykle jen ve zdroji. Není vhodná pro tajné údaje."
      },
      "author-html-comment": {
        "title": "Autorský HTML komentář",
        "note": "Komentář zůstane v Markdownu, ale bezpečný náhled a HTML export jej odstraní. Jiné procesory se mohou lišit."
      },
      "video-link": {
        "title": "Video jako běžný odkaz",
        "note": "Běžný HTTPS odkaz nepotřebuje iframe ani skript. Nahraďte ukázkovou URL."
      },
      "video-thumbnail": {
        "title": "Klikatelný náhled videa",
        "note": "Obrázek s odkazem, nikoli přehrávač. Nahraďte obě HTTPS URL; externí obrázek potřebuje internet."
      },
      "nested-quote": {
        "title": "Vnořené citace a prázdné řádky",
        "note": "Každou úroveň citace označte >; prázdný řádek mimo citaci ukončí blok."
      },
      "entities-and-unicode": {
        "title": "Entity, Unicode a text zprava doleva",
        "note": "Pokud lze, preferujte Unicode. Zobrazení smíšených směrů závisí na vykreslení."
      }
    }
  },
  "uk": {
    "heading": "Практичні прийоми Markdown",
    "intro": "Приклади можна редагувати; перевіряйте сумісність перед публікацією.",
    "levels": {
      "core": "CommonMark",
      "gfm": "Лише GFM",
      "gfm-html": "GFM + HTML",
      "html": "HTML / залежить від процесора",
      "external": "CommonMark · зовнішнє зображення"
    },
    "entries": {
      "portable-callout": {
        "title": "Переносима примітка",
        "note": "Використовує цитату й жирний шрифт. Оформлені GitHub-попередження залежать від платформи."
      },
      "table-pipe": {
        "title": "Символи | у таблиці GFM",
        "note": "Екрануйте | як \\| або використовуйте &#124;, інакше виникає додатковий стовпець."
      },
      "table-break": {
        "title": "Переноси та форматування в таблиці",
        "note": "У таблицях GFM працює форматування, <br> — HTML. Багаторядкові списки у клітинці підтримуються не всюди."
      },
      "html-cell-list": {
        "title": "Список усередині HTML-таблиці",
        "note": "Для списку в клітинці використовуйте HTML; платформи можуть його видаляти."
      },
      "author-reference": {
        "title": "Прихована примітка у визначенні посилання",
        "note": "Невикористане визначення посилання зазвичай приховане в перегляді. Не зберігайте тут секрети."
      },
      "author-html-comment": {
        "title": "HTML-коментар автора",
        "note": "Коментар зберігається у Markdown, але видаляється з безпечного Preview та HTML експорту."
      },
      "video-link": {
        "title": "Відео як звичайне посилання",
        "note": "Звичайне HTTPS-посилання не потребує iframe або скриптів. Замініть приклад URL."
      },
      "video-thumbnail": {
        "title": "Клікабельна обкладинка відео",
        "note": "Зображення-посилання, не плеєр. Замініть обидві HTTPS-адреси; зовнішнє зображення потребує мережі."
      },
      "nested-quote": {
        "title": "Вкладені цитати й порожні рядки",
        "note": "Додавайте > для кожного рівня; порожній рядок поза цитатою завершує блок."
      },
      "entities-and-unicode": {
        "title": "Сутності, Unicode і текст справа наліво",
        "note": "За можливості використовуйте Unicode; порядок RTL/LTR залежить від середовища."
      }
    }
  },
  "ro": {
    "heading": "Trucuri practice Markdown",
    "intro": "Exemplele pot fi editate; verificați compatibilitatea înainte de distribuire.",
    "levels": {
      "core": "CommonMark",
      "gfm": "Doar GFM",
      "gfm-html": "GFM + HTML",
      "html": "HTML / specific procesorului",
      "external": "CommonMark · imagine externă"
    },
    "entries": {
      "portable-callout": {
        "title": "Notă portabilă",
        "note": "Folosește citat și text aldin. Alertele stilizate GitHub depind de platformă."
      },
      "table-pipe": {
        "title": "Bare verticale în tabel GFM",
        "note": "Folosiți \\| sau &#124;; fără escapare apare o coloană în plus."
      },
      "table-break": {
        "title": "Rând nou și formatare în tabel",
        "note": "Tabelele GFM acceptă formatare inline; <br> este HTML. Listele multiliniară din celule nu sunt portabile."
      },
      "html-cell-list": {
        "title": "Listă într-un tabel HTML",
        "note": "Folosiți HTML pentru o listă reală în celulă. Unele platforme elimină HTML."
      },
      "author-reference": {
        "title": "Notă ascunsă ca definiție de link",
        "note": "O definiție neutilizată rămâne de obicei doar în sursă. Nu puneți secrete aici."
      },
      "author-html-comment": {
        "title": "Comentariu HTML pentru autor",
        "note": "Comentariul rămâne în Markdown, dar este eliminat din previzualizare și din exportul HTML sigur."
      },
      "video-link": {
        "title": "Video ca link obișnuit",
        "note": "Un link HTTPS nu necesită iframe sau scripturi. Înlocuiți URL-ul demonstrativ."
      },
      "video-thumbnail": {
        "title": "Miniatură video clicabilă",
        "note": "Imagine cu link, nu player. Înlocuiți ambele URL-uri; imaginea externă necesită internet."
      },
      "nested-quote": {
        "title": "Citate imbricate și rânduri libere",
        "note": "Folosiți > la fiecare nivel; un rând gol în afara citatului încheie blocul."
      },
      "entities-and-unicode": {
        "title": "Entități, Unicode și text RTL",
        "note": "Preferabil Unicode; ordinea textului RTL/LTR depinde de redare."
      }
    }
  },
  "ru": {
    "heading": "Практические приёмы Markdown",
    "intro": "Примеры можно редактировать; перед публикацией проверьте совместимость.",
    "levels": {
      "core": "CommonMark",
      "gfm": "Только GFM",
      "gfm-html": "GFM + HTML",
      "html": "HTML / зависит от процессора",
      "external": "CommonMark · внешняя картинка"
    },
    "entries": {
      "portable-callout": {
        "title": "Переносимое примечание",
        "note": "Обычная цитата и жирный текст; оформленные GitHub Alerts зависят от платформы."
      },
      "table-pipe": {
        "title": "Вертикальная черта в таблице GFM",
        "note": "Экранируйте | как \\| или используйте &#124;, иначе появится лишний столбец."
      },
      "table-break": {
        "title": "Переносы и форматирование в таблице",
        "note": "В GFM-таблицах работает строчное форматирование; <br> — HTML. Многострочные списки внутри ячеек ненадёжны."
      },
      "html-cell-list": {
        "title": "Настоящий список внутри HTML-таблицы",
        "note": "Используйте HTML для списка в ячейке. Некоторые платформы очищают такой HTML."
      },
      "author-reference": {
        "title": "Скрытая заметка через определение ссылки",
        "note": "Неиспользуемое определение ссылки обычно не видно в Preview; это не способ хранить секреты."
      },
      "author-html-comment": {
        "title": "HTML-комментарий автора",
        "note": "Комментарий остаётся в Markdown, но удаляется из безопасного Preview и HTML-экспорта."
      },
      "video-link": {
        "title": "Видео как обычная ссылка",
        "note": "Обычная HTTPS-ссылка не требует iframe и скриптов. Замените пример адреса."
      },
      "video-thumbnail": {
        "title": "Кликабельная обложка видео",
        "note": "Ссылка-картинка, не встроенный плеер. Замените оба HTTPS-адреса; внешняя картинка требует интернет."
      },
      "nested-quote": {
        "title": "Вложенные цитаты и пустые строки",
        "note": "Каждому уровню цитаты соответствует >; пустая строка вне цитаты завершает блок."
      },
      "entities-and-unicode": {
        "title": "Символы, HTML-сущности и текст справа налево",
        "note": "По возможности используйте Unicode. Порядок смешанного RTL/LTR-текста зависит от среды."
      }
    }
  }
};
export const practicalHacksText = lang => PRACTICAL_HACKS_UI[lang] ?? PRACTICAL_HACKS_UI.en;
