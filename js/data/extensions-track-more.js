// Second wave of the optional Extensions & Hacks learning track.
export const MORE_LABS = Object.freeze([
  {
    "id": "github-footnotes",
    "category": "github-platform",
    "dialect": "gfm",
    "labFeatures": [
      "footnotes"
    ],
    "starter": "A documented claim[^source].",
    "example": "A documented claim[^source], cited again[^source].\n\n[^source]: **Primary reference** for the claim.",
    "checks": [
      "reference",
      "backlink"
    ]
  },
  {
    "id": "custom-heading-toc",
    "category": "app",
    "dialect": "gfm",
    "labFeatures": [
      "headingIds"
    ],
    "starter": "# Overview\n\n[Jump to section](#manual-overview)",
    "example": "# Overview {#manual-overview}\n\n[Jump to section](#manual-overview)\n\n## Background",
    "checks": [
      "custom-id",
      "target-link"
    ]
  },
  {
    "id": "figure-caption",
    "category": "html",
    "dialect": "gfm",
    "labFeatures": [],
    "starter": "![Front of carton](https://example.org/carton.png)",
    "example": "<figure class=\"af-figure\">\n<img src=\"https://example.org/carton.png\" alt=\"Carton front\" width=\"640\">\n<figcaption>Front of carton</figcaption>\n</figure>",
    "checks": [
      "caption",
      "image-size"
    ]
  },
  {
    "id": "definition-list",
    "category": "app",
    "dialect": "gfm",
    "labFeatures": [
      "definitionLists"
    ],
    "starter": "Term\n\nA plain explanation.",
    "example": "Term\n: First **definition**.\n: Another *definition*.",
    "checks": [
      "terms",
      "meanings"
    ]
  }
]);
export const MORE_LAB_TEXT = Object.freeze({
  "en": {
    "github-footnotes": {
      "title": "GitHub footnotes",
      "description": "Define a note and cite it twice. Confirm that both references have a working backlink.",
      "portability": "GitHub.com extension; not normative GFM",
      "checks": [
        "Two references point to the same rendered note",
        "Backlinks lead to both references"
      ]
    },
    "custom-heading-toc": {
      "title": "Custom heading IDs & TOC",
      "description": "Add {#manual-overview} to the heading and link to it. A generated slug alone does not pass.",
      "portability": "Custom ID: app-only; anchor links: CommonMark",
      "checks": [
        "Heading has the custom ID",
        "Link targets that heading"
      ]
    },
    "figure-caption": {
      "title": "Figure, alt & caption",
      "description": "Create HTML figure/figcaption with accessible alt text and an allowed width of 640px.",
      "portability": "Safe HTML; support varies; external image needs a network",
      "checks": [
        "Figure has a visible caption",
        "Image preserves alt text and a safe width"
      ]
    },
    "definition-list": {
      "title": "Definition lists",
      "description": "Add a term and two definitions, using bold and italic formatting.",
      "portability": "Opt-in app grammar; not normative GFM",
      "checks": [
        "A semantic list with a term is rendered",
        "Two definitions retain bold and italic markup"
      ]
    }
  },
  "cs": {
    "github-footnotes": {
      "title": "Poznámky pod čarou GitHub",
      "description": "Definujte poznámku a dvakrát na ni odkažte. Oba odkazy musí mít zpětný odkaz.",
      "portability": "Rozšíření GitHub.com; není normativní GFM",
      "checks": [
        "Dva odkazy míří na stejnou poznámku",
        "Zpětné odkazy vedou na obě zmínky"
      ]
    },
    "custom-heading-toc": {
      "title": "Vlastní ID nadpisu a obsah",
      "description": "Přidejte nadpisu {#manual-overview} a odkaz na něj. Automatický slug nestačí.",
      "portability": "Vlastní ID: pouze aplikace; odkazy: CommonMark",
      "checks": [
        "Nadpis má vlastní ID",
        "Odkaz míří na nadpis"
      ]
    },
    "figure-caption": {
      "title": "Obrázek, alt a popisek",
      "description": "Vytvořte HTML figure s popiskem, alt textem a šířkou 640px.",
      "portability": "Bezpečné HTML; externí obrázek potřebuje připojení",
      "checks": [
        "Figure obsahuje popisek",
        "Obrázek zachová alt a šířku"
      ]
    },
    "definition-list": {
      "title": "Seznam definic",
      "description": "Přidejte termín a dvě definice, tučně a kurzívou.",
      "portability": "Volitelná syntaxe aplikace; není GFM",
      "checks": [
        "Vykreslí se sémantický seznam",
        "Dvě definice obsahují tučné a kurzívu"
      ]
    }
  },
  "uk": {
    "github-footnotes": {
      "title": "Виноски GitHub",
      "description": "Створіть виноску та двічі посилайтеся на неї. Перевірте обидва зворотні посилання.",
      "portability": "Розширення GitHub.com; не нормативний GFM",
      "checks": [
        "Два посилання ведуть до однієї виноски",
        "Зворотні посилання ведуть до обох згадок"
      ]
    },
    "custom-heading-toc": {
      "title": "Власні ID заголовків і зміст",
      "description": "Додайте {#manual-overview} до заголовка й посилання на нього.",
      "portability": "ID — лише застосунок; посилання — CommonMark",
      "checks": [
        "Заголовок отримав власний ID",
        "Посилання веде на заголовок"
      ]
    },
    "figure-caption": {
      "title": "Зображення, alt і підпис",
      "description": "Створіть HTML figure із підписом, alt і шириною 640px.",
      "portability": "Безпечний HTML; зовнішнє зображення потребує мережі",
      "checks": [
        "У figure є підпис",
        "Зображення має alt та ширину"
      ]
    },
    "definition-list": {
      "title": "Список визначень",
      "description": "Додайте термін і два визначення, із жирним і курсивом.",
      "portability": "Синтаксис застосунку; не нормативний GFM",
      "checks": [
        "Є семантичний список з терміном",
        "Два визначення мають жирний і курсив"
      ]
    }
  },
  "ro": {
    "github-footnotes": {
      "title": "Note de subsol GitHub",
      "description": "Definește o notă și refer-o de două ori, cu trimiteri înapoi.",
      "portability": "Extensie GitHub.com; nu GFM normativ",
      "checks": [
        "Două referințe indică aceeași notă",
        "Legăturile inverse indică ambele referințe"
      ]
    },
    "custom-heading-toc": {
      "title": "ID-uri personalizate și cuprins",
      "description": "Adaugă {#manual-overview} unui titlu și un link către el.",
      "portability": "ID personalizat: aplicația; link: CommonMark",
      "checks": [
        "Titlul are ID personalizat",
        "Linkul indică titlul"
      ]
    },
    "figure-caption": {
      "title": "Imagine, alt și legendă",
      "description": "Creează HTML figure cu legendă, alt și lățime de 640px.",
      "portability": "HTML sigur; imaginea externă necesită rețea",
      "checks": [
        "Figure conține legendă",
        "Imaginea păstrează alt și lățimea"
      ]
    },
    "definition-list": {
      "title": "Liste de definiții",
      "description": "Scrie un termen și două definiții folosind aldin și cursiv.",
      "portability": "Sintaxă opțională a aplicației; nu GFM",
      "checks": [
        "Se afișează lista semantică",
        "Două definiții păstrează aldin și cursiv"
      ]
    }
  },
  "ru": {
    "github-footnotes": {
      "title": "Сноски GitHub",
      "description": "Создайте определение сноски и дважды сошлитесь на неё. Проверьте обе обратные ссылки.",
      "portability": "Расширение GitHub.com; не входит в нормативный GFM",
      "checks": [
        "Два упоминания ведут к одной сноске",
        "Обратные ссылки ведут к обоим упоминаниям"
      ]
    },
    "custom-heading-toc": {
      "title": "ID заголовков и оглавление",
      "description": "Задайте заголовку {#manual-overview} и сделайте ссылку на него. Автоматического slug недостаточно.",
      "portability": "Свой ID — расширение приложения; ссылка — CommonMark",
      "checks": [
        "Заголовок получил пользовательский ID",
        "Ссылка ведёт на этот заголовок"
      ]
    },
    "figure-caption": {
      "title": "Изображение, alt и подпись",
      "description": "Создайте HTML figure с подписью, осмысленным alt и шириной 640px.",
      "portability": "Очищенный HTML; внешний рисунок требует интернета",
      "checks": [
        "У figure есть подпись figcaption",
        "Изображение сохранило alt и заданную ширину"
      ]
    },
    "definition-list": {
      "title": "Список определений",
      "description": "Создайте термин с двумя определениями, выделив текст жирным и курсивом.",
      "portability": "Нестандартный синтаксис приложения; не GFM",
      "checks": [
        "В Preview есть список определений с термином",
        "Два определения сохранили жирный и курсив"
      ]
    }
  }
});
export const MORE_LAB_NOTES = Object.freeze({
  "en": "Labs use GFM as a base. Optional platform/app grammar runs only inside its exercise, never in the main document.",
  "cs": "Základem je GFM. Rozšíření platí pouze v daném cvičení, nikoli v hlavním dokumentu.",
  "uk": "Основа — GFM. Розширення діють лише у відповідній вправі, а не в основному документі.",
  "ro": "Baza este GFM. Extensiile funcționează doar în exercițiul ales, nu în documentul principal.",
  "ru": "Основа — GFM. Дополнительный синтаксис действует только в своём упражнении, не в основном документе."
});
// Validate sanitized rendered DOM, never raw Markdown syntax or fenced examples.
export function evaluateMoreLab(id,doc){
 if(id==='github-footnotes'){
  const refs=[...doc.querySelectorAll('sup > a.fn-ref[href^="#fn-item-"]')];
  const item=doc.querySelector('section.md-footnotes ol > li[id]');
  const valid=Boolean(item&&refs.length>=2&&item.querySelector('strong')&&refs.every(a=>a.getAttribute('href')==='#'+item.id));
  const backs=item?[...item.querySelectorAll('a.fn-backref')]:[];
  return [valid,valid&&refs.slice(0,2).every(a=>backs.some(back=>back.getAttribute('href')==='#'+a.id))];
 }
 if(id==='custom-heading-toc'){
  const heading=doc.querySelector('h1#manual-overview');
  const link=doc.querySelector('a[href="#manual-overview"]');
  return [Boolean(heading&&heading.textContent.trim()==='Overview'),Boolean(heading&&link)];
 }
 if(id==='figure-caption'){
  const fig=doc.querySelector('figure.af-figure'),caption=fig?.querySelector('figcaption'),img=fig?.querySelector('img');
  return [Boolean(caption?.textContent.trim()),Boolean(img&&img.getAttribute('alt')?.trim()&&img.getAttribute('width')==='640'&&img.getAttribute('src')?.startsWith('https://'))];
 }
 if(id==='definition-list'){
  const list=doc.querySelector('dl.md-definition-list'),defs=list?[...list.querySelectorAll('dd')]:[];
  return [Boolean(list?.querySelector('dt')?.textContent.trim()),defs.length>=2&&Boolean(defs[0].querySelector('strong'))&&Boolean(defs[1].querySelector('em'))];
 }
 return [];
}
