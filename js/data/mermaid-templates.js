// GitHub-style Mermaid fences remain editable Markdown source.
// Mermaid is an application/platform extension, not normative GFM or CommonMark.
export const MERMAID_TEMPLATES=Object.freeze({
 flowchart:'flowchart LR\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Done]\n    B -->|No| A',
 sequence:'sequenceDiagram\n    participant User\n    participant App\n    User->>App: Open document\n    App-->>User: Live Preview',
 pie:'pie showData\n    title Markdown workflow\n    "Write" : 50\n    "Preview" : 30\n    "Export" : 20'
});
export const MERMAID_LABELS={
 en:{group:'Diagrams · Mermaid',insert:'Insert',types:['Flowchart','Sequence','Pie chart'],note:'Mermaid is a GitHub/platform extension, not standard GFM.',loading:'Rendering diagram',error:'Diagram could not be rendered',source:'View Mermaid source',alt:'Mermaid diagram'},
 cs:{group:'Diagramy · Mermaid',insert:'Vložit',types:['Vývojový diagram','Sekvence','Koláčový graf'],note:'Mermaid je rozšíření GitHubu/platformy, ne standardní GFM.',loading:'Vykresluji diagram',error:'Diagram nelze vykreslit',source:'Zobrazit zdroj Mermaid',alt:'Diagram Mermaid'},
 uk:{group:'Діаграми · Mermaid',insert:'Вставити',types:['Блок-схема','Послідовність','Кругова діаграма'],note:'Mermaid — розширення GitHub/платформи, а не стандарт GFM.',loading:'Будуємо діаграму',error:'Не вдалося відобразити діаграму',source:'Показати код Mermaid',alt:'Діаграма Mermaid'},
 ro:{group:'Diagrame · Mermaid',insert:'Inserează',types:['Diagramă de flux','Secvență','Diagramă circulară'],note:'Mermaid este o extensie GitHub/platformă, nu GFM standard.',loading:'Se redă diagrama',error:'Diagrama nu poate fi redată',source:'Arată sursa Mermaid',alt:'Diagramă Mermaid'},
 ru:{group:'Диаграммы · Mermaid',insert:'Вставить',types:['Блок-схема','Последовательность','Круговая диаграмма'],note:'Mermaid — расширение GitHub/платформы, а не стандарт GFM.',loading:'Строим диаграмму',error:'Не удалось построить диаграмму',source:'Показать исходный код Mermaid',alt:'Диаграмма Mermaid'}
};
export const mermaidLabels=lang=>MERMAID_LABELS[lang]||MERMAID_LABELS.en;
export function mermaidSnippet(type){
 const source=MERMAID_TEMPLATES[type];
 return source?'\n\n```mermaid\n'+source+'\n```\n\n':null;
}
