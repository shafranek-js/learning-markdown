// GitHub-style Mermaid fences remain editable Markdown source.
// Mermaid is an application/platform extension, not normative GFM or CommonMark.
export const MERMAID_TEMPLATES=Object.freeze({
 flowchart:'flowchart LR\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Done]\n    B -->|No| A',
 sequence:'sequenceDiagram\n    participant User\n    participant App\n    User->>App: Open document\n    App-->>User: Live Preview',
 pie:'pie showData\n    title Markdown workflow\n    "Write" : 50\n    "Preview" : 30\n    "Export" : 20',
 class:'classDiagram\n    class Document {\n      +String title\n      +render()\n    }\n    Document <|-- MarkdownDocument',
 state:'stateDiagram-v2\n    [*] --> Draft\n    Draft --> Review\n    Review --> Published\n    Review --> Draft',
 er:'erDiagram\n    DOCUMENT ||--o{ REVISION : contains\n    AUTHOR ||--o{ DOCUMENT : writes',
 gantt:'gantt\n    title Markdown project\n    dateFormat YYYY-MM-DD\n    section Planning\n    Write specification :done, a1, 2026-10-01, 3d\n    Test Preview :active, a2, after a1, 2d',
 mindmap:'mindmap\n  root((Markdown))\n    Syntax\n      Headings\n      Lists\n    Extensions\n      Mermaid\n      Footnotes',
 timeline:'timeline\n    title Markdown timeline\n    2004 : Markdown\n    2017 : CommonMark\n    2026 : Learning Markdown'
});
export const MERMAID_LABELS={
 en:{group:'Diagrams · Mermaid',insert:'Insert',types:['Flowchart','Sequence','Pie chart','Class diagram','State diagram','ER diagram','Gantt chart','Mind map','Timeline'],note:'Mermaid is a GitHub/platform extension, not standard GFM.',loading:'Rendering diagram',error:'Diagram could not be rendered',source:'View Mermaid source',alt:'Mermaid diagram',zoomIn:'Zoom in',zoomOut:'Zoom out',fit:'Fit to width'},
 cs:{group:'Diagramy · Mermaid',insert:'Vložit',types:['Vývojový diagram','Sekvence','Koláčový graf','Diagram tříd','Stavový diagram','ER diagram','Ganttův diagram','Myšlenková mapa','Časová osa'],note:'Mermaid je rozšíření GitHubu/platformy, ne standardní GFM.',loading:'Vykresluji diagram',error:'Diagram nelze vykreslit',source:'Zobrazit zdroj Mermaid',alt:'Diagram Mermaid',zoomIn:'Přiblížit',zoomOut:'Oddálit',fit:'Přizpůsobit šířce'},
 uk:{group:'Діаграми · Mermaid',insert:'Вставити',types:['Блок-схема','Послідовність','Кругова діаграма','Діаграма класів','Діаграма станів','ER-діаграма','Діаграма Ганта','Мапа думок','Часова шкала'],note:'Mermaid — розширення GitHub/платформи, а не стандарт GFM.',loading:'Будуємо діаграму',error:'Не вдалося відобразити діаграму',source:'Показати код Mermaid',alt:'Діаграма Mermaid',zoomIn:'Збільшити',zoomOut:'Зменшити',fit:'За шириною'},
 ro:{group:'Diagrame · Mermaid',insert:'Inserează',types:['Diagramă de flux','Secvență','Diagramă circulară','Diagramă de clase','Diagramă de stări','Diagramă ER','Diagramă Gantt','Hartă mentală','Cronologie'],note:'Mermaid este o extensie GitHub/platformă, nu GFM standard.',loading:'Se redă diagrama',error:'Diagrama nu poate fi redată',source:'Arată sursa Mermaid',alt:'Diagramă Mermaid',zoomIn:'Mărește',zoomOut:'Micșorează',fit:'Potrivește la lățime'},
 ru:{group:'Диаграммы · Mermaid',insert:'Вставить',types:['Блок-схема','Последовательность','Круговая диаграмма','Диаграмма классов','Диаграмма состояний','ER-диаграмма','Диаграмма Ганта','Интеллект-карта','Временная шкала'],note:'Mermaid — расширение GitHub/платформы, а не стандарт GFM.',loading:'Строим диаграмму',error:'Не удалось построить диаграмму',source:'Показать исходный код Mermaid',alt:'Диаграмма Mermaid',zoomIn:'Увеличить',zoomOut:'Уменьшить',fit:'По ширине'}
};
export const mermaidLabels=lang=>MERMAID_LABELS[lang]||MERMAID_LABELS.en;
export function mermaidSnippet(type){
 const source=MERMAID_TEMPLATES[type];
 return source?'\n\n```mermaid\n'+source+'\n```\n\n':null;
}
