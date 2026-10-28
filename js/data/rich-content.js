// Trusted HTML snippets for the optional Beyond Markdown ribbon.
// No arbitrary HTML, CSS, JavaScript or user-selected style strings are accepted.
export const RICH_CONTENT={
  "tables": [
    {
      "id": "colspan",
      "label": "Merge across columns",
      "html": "<table class=\"af-table-outline\">\n<thead><tr><th colspan=\"2\">Merged heading</th></tr></thead>\n<tbody><tr><td>Value A</td><td>Value B</td></tr></tbody>\n</table>"
    },
    {
      "id": "rowspan",
      "label": "Merge across rows",
      "html": "<table class=\"af-table-outline\">\n<tbody><tr><th rowspan=\"2\">Merged label</th><td>First value</td></tr>\n<tr><td>Second value</td></tr></tbody>\n</table>"
    },
    {
      "id": "colored",
      "label": "Colored cells",
      "html": "<table class=\"af-table-outline\">\n<thead><tr><th class=\"af-cell-blue\">Name</th><th class=\"af-cell-mint\">Status</th></tr></thead>\n<tbody><tr><td>Task A</td><td class=\"af-cell-sand\">In progress</td></tr></tbody>\n</table>"
    },
    {
      "id": "borderless",
      "label": "Invisible borders",
      "html": "<table class=\"af-table-borderless\">\n<tbody><tr><td>Left</td><td>Right</td></tr>\n<tr><td>Below left</td><td>Below right</td></tr></tbody>\n</table>"
    },
    {
      "id": "compact",
      "label": "Compact table",
      "html": "<table class=\"af-table-compact af-table-outline\">\n<tbody><tr><th>Label</th><th>Value</th></tr>\n<tr><td>Item</td><td>42</td></tr></tbody>\n</table>"
    }
  ],
  "blocks": [
    {
      "id": "info",
      "label": "Information box",
      "html": "<div class=\"af-callout-info\"><strong>Information</strong><p>Additional context for the reader.</p></div>"
    },
    {
      "id": "warning",
      "label": "Warning box",
      "html": "<div class=\"af-callout-warning\"><strong>Warning</strong><p>Check important details before continuing.</p></div>"
    },
    {
      "id": "success",
      "label": "Success box",
      "html": "<div class=\"af-callout-success\"><strong>Success</strong><p>The task has been completed.</p></div>"
    },
    {
      "id": "anchor",
      "label": "Internal link & anchor",
      "html": null
    },
    {
      "id": "details",
      "label": "Expandable details",
      "html": "<details><summary>More information</summary><p>Hidden until expanded.</p></details>"
    }
  ],
  "numbering": [
    {
      "id": "a",
      "label": "Lowercase letters",
      "html": "<ol type=\"a\"><li>First</li><li>Second</li><li>Third</li></ol>"
    },
    {
      "id": "A",
      "label": "Uppercase letters",
      "html": "<ol type=\"A\"><li>First</li><li>Second</li><li>Third</li></ol>"
    },
    {
      "id": "i",
      "label": "Lowercase Roman",
      "html": "<ol type=\"i\"><li>First</li><li>Second</li><li>Third</li></ol>"
    },
    {
      "id": "I",
      "label": "Uppercase Roman",
      "html": "<ol type=\"I\"><li>First</li><li>Second</li><li>Third</li></ol>"
    }
  ]
};
export const RICH_LABELS={
  "en": {
    "heading": "Rich HTML",
    "groups": [
      "Tables",
      "Callouts & links",
      "List numbering"
    ],
    "insert": "Insert",
    "description": "Advanced HTML · may be filtered on other Markdown platforms",
    "items": [
      [
        "Merge columns",
        "Merge rows",
        "Colored cells",
        "No borders",
        "Compact table"
      ],
      [
        "Information box",
        "Warning box",
        "Success box",
        "Internal link & anchor",
        "Expandable section"
      ],
      [
        "a, b, c",
        "A, B, C",
        "i, ii, iii",
        "I, II, III"
      ]
    ]
  },
  "cs": {
    "heading": "Rozšířené HTML",
    "groups": [
      "Tabulky",
      "Bloky a odkazy",
      "Číslování seznamů"
    ],
    "insert": "Vložit",
    "description": "Pokročilé HTML · jiné platformy Markdown ho mohou filtrovat",
    "items": [
      [
        "Sloučit sloupce",
        "Sloučit řádky",
        "Barevné buňky",
        "Bez okrajů",
        "Kompaktní tabulka"
      ],
      [
        "Informační box",
        "Upozornění",
        "Úspěch",
        "Odkaz uvnitř stránky",
        "Rozbalovací sekce"
      ],
      [
        "a, b, c",
        "A, B, C",
        "i, ii, iii",
        "I, II, III"
      ]
    ]
  },
  "uk": {
    "heading": "Розширений HTML",
    "groups": [
      "Таблиці",
      "Блоки та посилання",
      "Нумерація списків"
    ],
    "insert": "Вставити",
    "description": "Розширений HTML · інші Markdown-платформи можуть його фільтрувати",
    "items": [
      [
        "Об'єднати стовпці",
        "Об'єднати рядки",
        "Кольорові клітинки",
        "Без меж",
        "Компактна таблиця"
      ],
      [
        "Інформаційний блок",
        "Попередження",
        "Успіх",
        "Внутрішнє посилання",
        "Розгортаний блок"
      ],
      [
        "a, b, c",
        "A, B, C",
        "i, ii, iii",
        "I, II, III"
      ]
    ]
  },
  "ro": {
    "heading": "HTML extins",
    "groups": [
      "Tabele",
      "Casete și linkuri",
      "Numerotarea listelor"
    ],
    "insert": "Inserează",
    "description": "HTML avansat · alte platforme Markdown îl pot filtra",
    "items": [
      [
        "Îmbină coloane",
        "Îmbină rânduri",
        "Celule colorate",
        "Fără margini",
        "Tabel compact"
      ],
      [
        "Informație",
        "Avertizare",
        "Succes",
        "Link intern și ancoră",
        "Secțiune extensibilă"
      ],
      [
        "a, b, c",
        "A, B, C",
        "i, ii, iii",
        "I, II, III"
      ]
    ]
  },
  "ru": {
    "heading": "Расширенный HTML",
    "groups": [
      "Таблицы",
      "Блоки и ссылки",
      "Нумерация списков"
    ],
    "insert": "Вставить",
    "description": "Расширенный HTML · другие Markdown-платформы могут его фильтровать",
    "items": [
      [
        "Объединить столбцы",
        "Объединить строки",
        "Цветные ячейки",
        "Без границ",
        "Компактная таблица"
      ],
      [
        "Информационный блок",
        "Предупреждение",
        "Успех",
        "Внутренняя ссылка и якорь",
        "Раскрывающийся блок"
      ],
      [
        "a, b, c",
        "A, B, C",
        "i, ii, iii",
        "I, II, III"
      ]
    ]
  }
};
export const richLabels=lang=>RICH_LABELS[lang]||RICH_LABELS.en;
export const RICH_GROUPS=Object.keys(RICH_CONTENT);
const escapeHTML=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function nextAnchorId(source){
 const used=new Set([...String(source).matchAll(/\bid="([a-z][a-z0-9_-]{0,63})"/g)].map(m=>m[1]));
 let candidate='advanced-section',counter=2;
 while(used.has(candidate))candidate='advanced-section-'+counter++;
 return candidate;
}
// A static template does not use selected Markdown. The selection must stay
// in the source and the new block should be inserted after its complete line.
// Text-aware callouts/numbered lists and anchors retain their conversion UX.
export function richTemplateIgnoresSelection(group,id,selection=''){
 if(group==='tables'||(group==='blocks'&&id==='details'))return true;
 if(group==='blocks'&&id==='anchor')return false;
 return !String(selection).trim();
}
export function makeRichSnippet(group,id,selection='',documentText=''){
 const item=RICH_CONTENT[group]?.find(entry=>entry.id===id);
 if(!item)return null;
 if(group==='blocks'&&id==='anchor'){
  const slug=nextAnchorId(documentText);
  return '<div id="'+slug+'">'+escapeHTML(selection.trim()||'Target section')+'</div>\n\n[Go to target](#'+slug+')';
 }
 if(group==='numbering'&&selection.trim()){
  const lines=selection.trim().split(/\r?\n/).map(line=>line.trim()).filter(Boolean).slice(0,100);
  return '<ol type="'+id+'">\n'+lines.map(line=>'<li>'+escapeHTML(line)+'</li>').join('\n')+'\n</ol>';
 }
 if(group==='blocks'&&selection.trim()&&['info','warning','success'].includes(id)){
  const word=id[0].toUpperCase()+id.slice(1);
  return '<div class="af-callout-'+id+'"><strong>'+word+'</strong><p>'+escapeHTML(selection.trim())+'</p></div>';
 }
 return item.html;
}
