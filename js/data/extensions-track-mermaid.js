// Optional Mermaid labs: GitHub-platform fenced diagrams, not normative GFM.
// The exercises use the same safely rendered Markdown pipeline as the editor.
export const MERMAID_LABS=Object.freeze([
 {id:'mermaid-flowchart',category:'github-platform',dialect:'gfm',mermaidType:'flowchart',
  starter:'~~~\nflowchart LR\n  A[Draft] --> B[Review]\n~~~',
  example:'~~~mermaid\nflowchart LR\n  A[Draft] --> B[Review]\n~~~',
  checks:['type','labels']},
 {id:'mermaid-sequence',category:'github-platform',dialect:'gfm',mermaidType:'sequence',
  starter:'~~~\nsequenceDiagram\n  participant User\n  participant App\n  User->>App: Request\n~~~',
  example:'~~~mermaid\nsequenceDiagram\n  participant User\n  participant App\n  User->>App: Request\n~~~',
  checks:['type','labels']},
 {id:'mermaid-pie',category:'github-platform',dialect:'gfm',mermaidType:'pie',
  starter:'~~~\npie showData\n  "Write" : 50\n  "Preview" : 50\n~~~',
  example:'~~~mermaid\npie showData\n  "Write" : 50\n  "Preview" : 50\n~~~',
  checks:['type','labels']}
]);
export const MERMAID_LAB_TEXT=Object.freeze({
 en:{
  'mermaid-flowchart':{title:'Mermaid: Flowcharts',description:'Turn this fenced code into a Mermaid flowchart. Confirm that Draft and Review appear as connected nodes in the actual diagram.',portability:'Mermaid is a GitHub/platform extension, not CommonMark/GFM syntax.',checks:['Flowchart is parsed and rendered successfully','The rendered diagram contains Draft and Review labels']},
  'mermaid-sequence':{title:'Mermaid: Sequence diagrams',description:'Create a Mermaid sequence diagram where User sends Request to App. The preview must render the participants and message.',portability:'Mermaid is supported by GitHub.com and this app, not normative GFM.',checks:['Sequence diagram is parsed and rendered successfully','User, App and Request appear in the rendered diagram']},
  'mermaid-pie':{title:'Mermaid: Pie charts',description:'Create a Mermaid pie chart with Write and Preview slices. Check the rendered chart, not a pasted picture.',portability:'Mermaid is a platform extension; portable Markdown shows the fenced source.',checks:['Pie diagram is parsed and rendered successfully','Write and Preview labels appear in the rendered chart']}
 },
 cs:{
  'mermaid-flowchart':{title:'Mermaid: Vývojové diagramy',description:'Vytvořte diagram Mermaid s propojenými uzly Draft a Review. Kontroluje se skutečné vykreslení.',portability:'Mermaid je rozšíření GitHubu/platformy, ne součást GFM.',checks:['Vývojový diagram je úspěšně zpracován a vykreslen','V diagramu jsou popisky Draft a Review']},
  'mermaid-sequence':{title:'Mermaid: Sekvenční diagramy',description:'Vytvořte sekvenční diagram: User odesílá zprávu Request aplikaci App.',portability:'Mermaid funguje na GitHub.com a v této aplikaci, ne ve standardním GFM.',checks:['Sekvenční diagram je úspěšně vykreslen','V diagramu jsou User, App a Request']},
  'mermaid-pie':{title:'Mermaid: Koláčové grafy',description:'Vytvořte koláčový graf se segmenty Write a Preview. Nestačí vložit obrázek.',portability:'Mermaid je rozšíření platformy; přenosný Markdown zachová zdrojový kód.',checks:['Koláčový graf je úspěšně vykreslen','V grafu jsou popisky Write a Preview']}
 },
 uk:{
  'mermaid-flowchart':{title:'Mermaid: Блок-схеми',description:'Створіть блок-схему Mermaid із пов’язаними вузлами Draft і Review. Перевіряється саме зображення.',portability:'Mermaid — розширення GitHub/платформи, не частина GFM.',checks:['Блок-схему успішно розібрано та побудовано','У схемі видно Draft і Review']},
  'mermaid-sequence':{title:'Mermaid: Діаграми послідовності',description:'Створіть діаграму, де User надсилає повідомлення Request учаснику App.',portability:'Mermaid працює на GitHub.com та в застосунку, але не в нормативному GFM.',checks:['Діаграму послідовності успішно побудовано','Є підписи User, App і Request']},
  'mermaid-pie':{title:'Mermaid: Кругові діаграми',description:'Створіть кругову діаграму з секторами Write і Preview; перевіряється результат.',portability:'Mermaid — розширення платформи; Markdown зберігає вихідний код.',checks:['Кругову діаграму успішно побудовано','У діаграмі видно Write і Preview']}
 },
 ro:{
  'mermaid-flowchart':{title:'Mermaid: Diagrame de flux',description:'Creează o diagramă Mermaid cu nodurile conectate Draft și Review. Se verifică imaginea redată.',portability:'Mermaid este o extensie GitHub/platformă, nu GFM standard.',checks:['Diagrama de flux este analizată și redată corect','Etichetele Draft și Review apar în diagramă']},
  'mermaid-sequence':{title:'Mermaid: Diagrame de secvență',description:'Creează o diagramă în care User trimite mesajul Request către App.',portability:'Mermaid este acceptat de GitHub.com și aplicație, nu de GFM standard.',checks:['Diagrama de secvență este redată corect','User, App și Request apar în diagramă']},
  'mermaid-pie':{title:'Mermaid: Diagrame circulare',description:'Creează o diagramă circulară cu segmentele Write și Preview, nu o imagine lipită.',portability:'Mermaid este o extensie de platformă; sursa Markdown se păstrează.',checks:['Diagrama circulară este redată corect','Etichetele Write și Preview sunt vizibile']}
 },
 ru:{
  'mermaid-flowchart':{title:'Mermaid: Блок-схемы',description:'Сделайте блок-схему Mermaid с соединёнными блоками Draft и Review. Проверяется построенная диаграмма, а не только код.',portability:'Mermaid — расширение GitHub/платформы, а не нормативный GFM.',checks:['Блок-схема успешно разобрана и построена','На диаграмме видны подписи Draft и Review']},
  'mermaid-sequence':{title:'Mermaid: Диаграммы последовательности',description:'Создайте диаграмму: User отправляет сообщение Request участнику App. Проверяется реальная отрисовка.',portability:'Mermaid работает на GitHub.com и в приложении, но не входит в GFM.',checks:['Диаграмма последовательности успешно построена','На диаграмме видны User, App и Request']},
  'mermaid-pie':{title:'Mermaid: Круговые диаграммы',description:'Постройте круговую диаграмму с секторами Write и Preview. Вставленная картинка не засчитывается.',portability:'Mermaid — расширение платформы; в Markdown остаётся редактируемый код.',checks:['Круговая диаграмма успешно построена','На диаграмме видны Write и Preview']}
 }
});

const EXPECTED={
 'mermaid-flowchart':{types:['flowchart','flowchart-v2'],labels:['Draft','Review']},
 'mermaid-sequence':{types:['sequence'],labels:['User','App','Request']},
 'mermaid-pie':{types:['pie'],labels:['Write','Preview']}
};
// The caller supplies results ONLY from renderMermaidExportImages, which
// invokes Mermaid's actual parser, renderer, SVG validation and safe data URI.
export function evaluateMermaidLab(id,renderedHTML,images){
 const target=EXPECTED[id];
 if(!target)return [false,false];
 const doc=new DOMParser().parseFromString(String(renderedHTML||''),'text/html');
 const blocks=[...doc.querySelectorAll('pre > code.language-mermaid')];
 if(blocks.length!==1||!Array.isArray(images)||images.length!==1)return [false,false];
 const image=images[0],source=blocks[0].textContent.trim();
 if(image?.source!==source||typeof image.uri!=='string'||
  !image.uri.startsWith('data:image/svg+xml;charset=utf-8,')||
  !target.types.includes(image.type))return [false,false];
 try{
  const svgSource=decodeURIComponent(image.uri.slice('data:image/svg+xml;charset=utf-8,'.length));
  const xml=new DOMParser().parseFromString(svgSource,'image/svg+xml');
  if(xml.querySelector('parsererror')||xml.documentElement.localName!=='svg')return [false,false];
  const labels=[...xml.querySelectorAll('text,tspan')].map(node=>node.textContent.trim()).join(' ');
  return [true,target.labels.every(label=>labels.includes(label))];
 }catch{return [false,false];}
}
