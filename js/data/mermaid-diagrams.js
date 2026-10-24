// Issue #18: canonical Markdown source; diagrams are an optional Preview enhancement.
// This module is dependency-free so content limits and templates are unit-testable.
export const MERMAID_TEMPLATES=Object.freeze([
 {id:'flowchart',code:'```mermaid\nflowchart LR\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Done]\n  B -->|No| A\n```'},
 {id:'sequence',code:'```mermaid\nsequenceDiagram\n  participant A as Author\n  participant R as Reviewer\n  A->>R: Request review\n  R-->>A: Approved\n```'},
 {id:'pie',code:'```mermaid\npie showData\n  title Tasks\n  "Done" : 7\n  "Open" : 3\n```'}
]);
export const MAX_MERMAID_BLOCKS=6;
export const MAX_MERMAID_CHARS=4000;
export const MERMAID_UI=Object.freeze({
 en:{button:'Diagrams / Mermaid',title:'Insert Mermaid diagram',type:'Diagram type',insert:'Insert in editor',cancel:'Close',flowchart:'Flowchart',sequence:'Sequence diagram',pie:'Pie chart',help:'Inserts editable Mermaid fenced Markdown. GitHub.com supports Mermaid; this is not part of normative GFM/CommonMark.',pending:'Rendering diagram',done:'Diagram',invalid:'Cannot render diagram',limited:'Diagram limit exceeded',oversize:'Diagram source is too long',directive:'Configuration directives are not allowed',unsupported:'Unsupported diagram type',retry:'Show Mermaid source',offline:'Diagram renderer unavailable (offline or loading failed)'},
 cs:{button:'Diagramy / Mermaid',title:'Vložit diagram Mermaid',type:'Typ diagramu',insert:'Vložit do editoru',cancel:'Zavřít',flowchart:'Vývojový diagram',sequence:'Sekvenční diagram',pie:'Koláčový graf',help:'Vkládá upravitelný zdroj Mermaid. GitHub.com podporuje Mermaid, ale syntaxe není normativní GFM/CommonMark.',pending:'Vykresluji diagram',done:'Diagram',invalid:'Diagram nelze vykreslit',limited:'Překročen počet diagramů',oversize:'Zdroj diagramu je příliš dlouhý',directive:'Konfigurační direktivy nejsou povoleny',unsupported:'Nepodporovaný typ diagramu',retry:'Zobrazit zdroj Mermaid',offline:'Modul diagramů není dostupný (offline nebo selhalo načtení)'},
 uk:{button:'Діаграми / Mermaid',title:'Вставити діаграму Mermaid',type:'Тип діаграми',insert:'Вставити в редактор',cancel:'Закрити',flowchart:'Блок-схема',sequence:'Діаграма послідовності',pie:'Кругова діаграма',help:'Вставляє редагований Mermaid у Markdown. GitHub.com підтримує Mermaid, але це не стандарт GFM/CommonMark.',pending:'Малювання діаграми',done:'Діаграма',invalid:'Не вдалося побудувати діаграму',limited:'Перевищено кількість діаграм',oversize:'Код діаграми надто довгий',directive:'Конфігураційні директиви заборонено',unsupported:'Непідтримуваний тип діаграми',retry:'Показати код Mermaid',offline:'Модуль діаграм недоступний (офлайн або помилка завантаження)'},
 ro:{button:'Diagrame / Mermaid',title:'Inserează o diagramă Mermaid',type:'Tip diagramă',insert:'Inserează în editor',cancel:'Închide',flowchart:'Diagramă flux',sequence:'Diagramă secvență',pie:'Diagramă circulară',help:'Inserează sursa Mermaid editabilă. GitHub.com acceptă Mermaid, dar nu este GFM/CommonMark normativ.',pending:'Se desenează diagrama',done:'Diagramă',invalid:'Diagrama nu poate fi desenată',limited:'Prea multe diagrame',oversize:'Sursa diagramei este prea lungă',directive:'Directivele de configurare sunt interzise',unsupported:'Tip de diagramă neacceptat',retry:'Afișează codul Mermaid',offline:'Motorul Mermaid nu este disponibil (offline sau eroare la încărcare)'},
 ru:{button:'Диаграммы / Mermaid',title:'Вставить диаграмму Mermaid',type:'Тип диаграммы',insert:'Вставить в редактор',cancel:'Закрыть',flowchart:'Блок-схема',sequence:'Диаграмма последовательности',pie:'Круговая диаграмма',help:'Вставляет редактируемый код Mermaid. GitHub.com поддерживает Mermaid, но это не часть нормативного GFM/CommonMark.',pending:'Построение диаграммы',done:'Диаграмма',invalid:'Не удалось построить диаграмму',limited:'Превышено число диаграмм',oversize:'Слишком длинный код диаграммы',directive:'Директивы конфигурации запрещены',unsupported:'Неподдерживаемый тип диаграммы',retry:'Показать исходный Mermaid',offline:'Модуль Mermaid недоступен (нет сети или ошибка загрузки)'}
});
export const mermaidText=lang=>MERMAID_UI[lang]||MERMAID_UI.en;
export function mermaidSourceProblem(source){
 const code=String(source||'');
 if(code.length>MAX_MERMAID_CHARS)return 'oversize';
 if(/(?:^|\n)\s*(?:%%\s*\{|---\s*$)/m.test(code))return 'directive';
 if(/<\s*\/?\s*(?:script|iframe|foreignobject|object|embed|svg)\b/i.test(code))return 'directive';
 if(/(?:^|\n)\s*(?:click\s+|href\s+)/im.test(code))return 'directive';
 const first=code.trimStart().split(/\r?\n/,1)[0].trim();
 if(!/^(?:flowchart\s+(?:LR|RL|TB|BT|TD)|graph\s+(?:LR|RL|TB|BT|TD)|sequenceDiagram|pie(?:\s+showData)?)$/i.test(first))return 'unsupported';
 return null;
}
