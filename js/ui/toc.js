import {state,save} from '../core/state.js';
import {headingOutline,staticMarkdownTOC} from '../core/heading-anchors.js';
const el=id=>document.getElementById(id);
export const TOC_TEXT={
 en:{custom:'Custom {#id} heading suffix (app-only)',customNote:'Not part of CommonMark or GFM. Enabled only in GFM.',customWarning:'Custom heading IDs are app-specific. Other Markdown processors may show the literal {#id} text. The .md source stays unchanged. Download anyway?',portability:'TOC links use this app’s heading IDs. Other Markdown processors may generate different anchors.',title:'Document outline',depth:'Maximum heading level',insert:'Insert static Markdown TOC',
  sample:'Try headings',empty:'No headings in this document',count:n=>n+' headings',
  nav:'Document headings',example:'# Introduction\n\n## Details\n\n## Details\n\n### More details\n\n'},
 cs:{custom:'Vlastní {#id} u nadpisů (jen aplikace)',customNote:'Není součástí CommonMark ani GFM. Jen v GFM.',customWarning:'Vlastní ID nadpisů jsou specifická pro aplikaci. Jiné procesory mohou zobrazit {#id} jako text. Zdroj .md se nemění. Stáhnout?',portability:'Odkazy obsahu používají ID této aplikace. Jiné procesory mohou používat jiné kotvy.',title:'Obsah dokumentu',depth:'Maximální úroveň nadpisu',insert:'Vložit statický Markdown obsah',
  sample:'Vyzkoušet nadpisy',empty:'Dokument nemá nadpisy',count:n=>n+' nadpisů',
  nav:'Nadpisy dokumentu',example:'# Úvod\n\n## Detaily\n\n## Detaily\n\n### Více podrobností\n\n'},
 uk:{custom:'Власний {#id} для заголовків (лише застосунок)',customNote:'Не входить до CommonMark чи GFM. Лише у GFM.',customWarning:'Власні ID заголовків працюють тільки в цьому застосунку. Інші процесори можуть показувати {#id} як текст. Завантажити?',portability:'Посилання змісту використовують ID застосунку. Інші процесори можуть створювати інші якорі.',title:'Зміст документа',depth:'Максимальний рівень заголовка',insert:'Вставити статичний зміст Markdown',
  sample:'Спробувати заголовки',empty:'У документі немає заголовків',count:n=>n+' заголовків',
  nav:'Заголовки документа',example:'# Вступ\n\n## Деталі\n\n## Деталі\n\n### Докладніше\n\n'},
 ro:{custom:'ID {#id} pentru titluri (doar aplicație)',customNote:'Nu face parte din CommonMark/GFM; doar în GFM.',customWarning:'ID-urile titlurilor sunt specifice aplicației. Alte procesoare pot afișa {#id} ca text. Descărcați?',portability:'Linkurile cuprinsului folosesc ID-urile acestei aplicații. Alte procesoare pot genera alte ancore.',title:'Cuprinsul documentului',depth:'Nivelul maxim al titlului',insert:'Inserează cuprins Markdown static',
  sample:'Încearcă titluri',empty:'Documentul nu are titluri',count:n=>n+' titluri',
  nav:'Titlurile documentului',example:'# Introducere\n\n## Detalii\n\n## Detalii\n\n### Mai multe detalii\n\n'},
 ru:{custom:'Собственные ID заголовков {#id} (только приложение)',customNote:'Не входит в CommonMark или GFM. Доступно только в режиме GFM.',customWarning:'Собственные ID заголовков работают только в этом приложении. Другие Markdown-процессоры могут показать {#id} как текст. Скачать?',portability:'Ссылки оглавления используют ID этого приложения; другие Markdown-процессоры могут создавать другие якоря.',title:'Оглавление документа',depth:'Максимальный уровень заголовков',insert:'Вставить оглавление в Markdown',
  sample:'Попробовать заголовки',empty:'В документе пока нет заголовков',count:n=>n+' заголовков',
  nav:'Заголовки документа',example:'# Введение\n\n## Подробности\n\n## Подробности\n\n### Дополнительно\n\n'}
};
const words=()=>TOC_TEXT[state.lang]||TOC_TEXT.en;
let current=[];
export function renderTOC(preview){
 const nav=el('toc-list');if(!nav)return;
 current=headingOutline(preview);
 const w=words(),depth=state.tocMaxDepth;
 el('toc-title').textContent=w.title;
 el('toc-depth-label').textContent=w.depth;
 el('toc-depth').value=String(depth);
 el('toc-insert').textContent=w.insert;
 el('toc-example').textContent=w.sample;
 el('toc-nav').setAttribute('aria-label',w.nav);
 const visible=current.filter(h=>h.level<=depth);
 el('toc-count').textContent=w.count(visible.length);
 el('toc-empty').textContent=w.empty;
 el('toc-portability').textContent=w.portability;
 el('toc-empty').hidden=visible.length>0;
 el('toc-insert').disabled=!visible.length;
 nav.replaceChildren();
 const min=visible.length?Math.min(...visible.map(h=>h.level)):1;
 for(const h of visible){
  const li=document.createElement('li');
  li.className='toc-entry';
  li.style.paddingInlineStart=((h.level-min)*12)+'px';
  const a=document.createElement('a');
  a.href='#'+h.id;a.textContent=h.text;a.className='toc-link';
  a.title=h.text;
  li.append(a);nav.append(li);
 }
}
export function initTOC({insertMarkdown}){
 // Outline is now a transient popover, closed on each page load.
 // Only the selected heading depth remains a persistent preference.
 el('toc-panel').open=false;
 el('toc-depth').addEventListener('change',event=>{
  const next=Number(event.target.value);
  if(!Number.isInteger(next)||next<1||next>6)return;
  state.tocMaxDepth=next;save();
  renderTOC(el('markdown-preview'));
 });
 el('toc-insert').addEventListener('click',()=>{
  const markdown=staticMarkdownTOC(current,state.tocMaxDepth);
  if(markdown)insertMarkdown(markdown);
 });
 el('toc-example').addEventListener('click',()=>insertMarkdown(words().example));
}
export const currentTOC=()=>current.map(h=>({...h}));
