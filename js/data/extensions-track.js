// Optional learning track (#17): distinct from the 8 core and 7 advanced lessons.
export const EXTENSIONS_LABS = Object.freeze([
  {
    "id": "gfm-table-alignment",
    "category": "gfm",
    "dialect": "gfm",
    "starter": "| Feature | Score |\n| --- | --- |\n| Markdown | 5 |",
    "example": "| Feature | Score |\n| :---: | ---: |\n| Markdown | 5 |",
    "checks": [
      "center",
      "right"
    ]
  },
  {
    "id": "fenced-code-highlighting",
    "category": "commonmark-app",
    "dialect": "gfm",
    "starter": "~~~\nconst answer = 42;\nconsole.log(answer);\n~~~",
    "example": "~~~javascript\nconst answer = 42;\nconsole.log(answer);\n~~~",
    "checks": [
      "language",
      "tokens"
    ]
  }
]);
export const EXTENSIONS_LAB_TEXT = Object.freeze({
  "en": {
    "title": "Extensions & Hacks Lab",
    "open": "Extensions & Hacks · Practice",
    "subtitle": "Optional practice · separate from the 8 + 7 lessons and certificates",
    "progress": "Completed",
    "choice": "Exercise",
    "source": "Editable Markdown",
    "preview": "Safe live preview",
    "requirements": "Live checks",
    "example": "Use working example",
    "reset": "Reset this exercise",
    "close": "Close",
    "statusDone": "All checks pass",
    "statusPending": "Keep editing until both checks pass",
    "portability": "Compatibility",
    "note": "These exercises use GFM rendering only; your main document and settings do not change.",
    "entry": {
      "gfm-table-alignment": {
        "title": "GFM table alignment",
        "description": "Edit the delimiter row to center the Feature column and right-align Score. The preview must align the actual table cells.",
        "portability": "GFM table alignment (not CommonMark)",
        "checks": [
          "Feature header is centered in the rendered table",
          "Score values are right-aligned in the rendered table"
        ]
      },
      "fenced-code-highlighting": {
        "title": "Language-aware fenced code",
        "description": "Add javascript after the opening fence. Check that the fenced block is identified and syntax tokens are highlighted offline.",
        "portability": "Fenced code: CommonMark; offline token colors: this app",
        "checks": [
          "Rendered code block has the JavaScript language",
          "Rendered JavaScript contains highlighted syntax tokens"
        ]
      }
    }
  },
  "cs": {
    "title": "Laboratoř rozšíření a triků",
    "open": "Rozšíření a triky · Cvičení",
    "subtitle": "Volitelná cvičení · mimo 8 + 7 lekcí a certifikáty",
    "progress": "Dokončeno",
    "choice": "Cvičení",
    "source": "Upravitelný Markdown",
    "preview": "Bezpečný živý náhled",
    "requirements": "Kontroly",
    "example": "Vložit funkční ukázku",
    "reset": "Obnovit toto cvičení",
    "close": "Zavřít",
    "statusDone": "Všechny kontroly splněny",
    "statusPending": "Upravujte text, dokud neprojdou obě kontroly",
    "portability": "Kompatibilita",
    "note": "Cvičení používají GFM; hlavní dokument a nastavení se nemění.",
    "entry": {
      "gfm-table-alignment": {
        "title": "Zarovnání tabulky GFM",
        "description": "Změňte oddělovací řádek: sloupec Feature vystřeďte, Score zarovnejte doprava. Kontroluje se skutečné vykreslení.",
        "portability": "Zarovnání tabulek GFM (ne CommonMark)",
        "checks": [
          "Hlavička Feature je vystředěná",
          "Hodnoty Score jsou zarovnané doprava"
        ]
      },
      "fenced-code-highlighting": {
        "title": "Kódový blok s jazykem",
        "description": "Za úvodní značku přidejte javascript. Kód se musí vykreslit se zvýrazněnými tokeny offline.",
        "portability": "Blok kódu: CommonMark; barevné tokeny: aplikace",
        "checks": [
          "Blok kódu používá JavaScript",
          "JavaScript obsahuje barevně označené tokeny"
        ]
      }
    }
  },
  "uk": {
    "title": "Практикум розширень і прийомів",
    "open": "Розширення та прийоми · Практика",
    "subtitle": "Додаткові вправи · окремо від 8 + 7 уроків і сертифікатів",
    "progress": "Виконано",
    "choice": "Вправа",
    "source": "Редагований Markdown",
    "preview": "Безпечний перегляд наживо",
    "requirements": "Перевірки",
    "example": "Використати готовий приклад",
    "reset": "Скинути цю вправу",
    "close": "Закрити",
    "statusDone": "Усі перевірки пройдено",
    "statusPending": "Редагуйте, поки не пройдуть обидві перевірки",
    "portability": "Сумісність",
    "note": "Вправи використовують GFM; основний документ і налаштування не змінюються.",
    "entry": {
      "gfm-table-alignment": {
        "title": "Вирівнювання таблиці GFM",
        "description": "Змініть роздільники: Feature по центру, Score праворуч. Перевіряється справжній вигляд таблиці.",
        "portability": "Вирівнювання таблиць GFM (не CommonMark)",
        "checks": [
          "Заголовок Feature по центру",
          "Числа Score вирівняні праворуч"
        ]
      },
      "fenced-code-highlighting": {
        "title": "Підсвічування блоку коду",
        "description": "Додайте javascript після початкової огорожі. Перевірте підсвічування синтаксису без мережі.",
        "portability": "Блок коду: CommonMark; кольори токенів: застосунок",
        "checks": [
          "Для блоку визначено мову JavaScript",
          "Токени JavaScript підсвічуються"
        ]
      }
    }
  },
  "ro": {
    "title": "Laborator de extensii și trucuri",
    "open": "Extensii și trucuri · Exerciții",
    "subtitle": "Exerciții opționale · separate de cele 8 + 7 lecții și certificate",
    "progress": "Finalizate",
    "choice": "Exercițiu",
    "source": "Markdown editabil",
    "preview": "Previzualizare sigură",
    "requirements": "Verificări live",
    "example": "Folosește exemplul corect",
    "reset": "Resetează exercițiul",
    "close": "Închide",
    "statusDone": "Toate verificările au reușit",
    "statusPending": "Modifică textul până când ambele verificări reușesc",
    "portability": "Compatibilitate",
    "note": "Exercițiile folosesc GFM; documentul și setările principale rămân neschimbate.",
    "entry": {
      "gfm-table-alignment": {
        "title": "Alinierea tabelelor GFM",
        "description": "Centrează Feature și aliniază Score la dreapta prin delimitatori. Se verifică tabelul redat.",
        "portability": "Aliniere GFM (nu CommonMark)",
        "checks": [
          "Antetul Feature este centrat",
          "Valorile Score sunt aliniate la dreapta"
        ]
      },
      "fenced-code-highlighting": {
        "title": "Colorarea blocurilor de cod",
        "description": "Adaugă javascript după marcajul inițial. Tokenurile de sintaxă trebuie colorate offline.",
        "portability": "Bloc de cod: CommonMark; culori: aplicația",
        "checks": [
          "Blocul redat are limbajul JavaScript",
          "Tokenurile JavaScript sunt evidențiate"
        ]
      }
    }
  },
  "ru": {
    "title": "Практикум Extensions & Hacks",
    "open": "Расширения и приёмы · Практика",
    "subtitle": "Необязательные задания · отдельно от курсов 8 + 7 и сертификатов",
    "progress": "Выполнено",
    "choice": "Упражнение",
    "source": "Редактируемый Markdown",
    "preview": "Безопасный Live Preview",
    "requirements": "Проверки результата",
    "example": "Вставить готовый пример",
    "reset": "Сбросить это упражнение",
    "close": "Закрыть",
    "statusDone": "Все проверки пройдены",
    "statusPending": "Отредактируйте текст, чтобы пройти обе проверки",
    "portability": "Совместимость",
    "note": "Упражнения используют GFM; основной документ и его настройки не изменяются.",
    "entry": {
      "gfm-table-alignment": {
        "title": "Выравнивание таблиц GFM",
        "description": "Измените разделители: Feature — по центру, Score — по правому краю. Проверяется реальная таблица в Preview.",
        "portability": "Выравнивание таблиц GFM (не CommonMark)",
        "checks": [
          "Заголовок Feature выровнен по центру",
          "Значения Score выровнены по правому краю"
        ]
      },
      "fenced-code-highlighting": {
        "title": "Подсветка кода с указанием языка",
        "description": "Добавьте javascript после открывающей ограды. Проверьте распознавание языка и подсветку синтаксиса без интернета.",
        "portability": "Блок кода: CommonMark; цвета токенов: приложение",
        "checks": [
          "В блоке кода распознан JavaScript",
          "Синтаксические токены JavaScript подсвечены"
        ]
      }
    }
  }
});
export const extensionsLabText = lang => EXTENSIONS_LAB_TEXT[lang] || EXTENSIONS_LAB_TEXT.en;
export const extensionsLabIds = new Set(EXTENSIONS_LABS.map(lab=>lab.id));

// Validation must inspect sanitized rendered semantics. A demonstration in a
// Markdown code fence is not a rendered table or highlighted JavaScript.
export function evaluateExtensionsLab(id,renderedHTML){
 const doc=new DOMParser().parseFromString(String(renderedHTML??''),'text/html');
 if(id==='gfm-table-alignment'){
  const table=[...doc.querySelectorAll('table')].find(t=>t.querySelector('thead th')&&t.querySelector('tbody td'));
  if(!table)return [false,false];
  const th=[...table.querySelectorAll('thead th')],first=[...table.querySelectorAll('tbody tr:first-child td')];
  return [th.some(cell=>cell.textContent.trim()==='Feature'&&cell.getAttribute('align')==='center'),
   first.length>1&&first[1].textContent.trim()==='5'&&first[1].getAttribute('align')==='right'];
 }
 if(id==='fenced-code-highlighting'){
  const code=[...doc.querySelectorAll('pre > code.language-javascript')]
   .find(node=>node.textContent.includes('const answer'));
  if(!code)return [false,false];
  return [true,Boolean(code.querySelector('span.hljs-keyword'))];
 }
 return [];
}
