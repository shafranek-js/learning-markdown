import {state,save} from '../core/state.js';
import {headingOutline,staticMarkdownTOC} from '../core/heading-anchors.js';
const el=id=>document.getElementById(id);
export const TOC_TEXT={
 en:{title:'Document outline',depth:'Maximum heading level',insert:'Insert static Markdown TOC',
  sample:'Try headings',empty:'No headings in this document',count:n=>n+' headings',
  nav:'Document headings',example:'# Introduction\n\n## Details\n\n## Details\n\n### More details\n\n'},
 cs:{title:'Obsah dokumentu',depth:'Maximální úroveň nadpisu',insert:'Vložit statický Markdown obsah',
  sample:'Vyzkoušet nadpisy',empty:'Dokument nemá nadpisy',count:n=>n+' nadpisů',
  nav:'Nadpisy dokumentu',example:'# Úvod\n\n## Detaily\n\n## Detaily\n\n### Více podrobností\n\n'},
 uk:{title:'Зміст документа',depth:'Максимальний рівень заголовка',insert:'Вставити статичний зміст Markdown',
  sample:'Спробувати заголовки',empty:'У документі немає заголовків',count:n=>n+' заголовків',
  nav:'Заголовки документа',example:'# Вступ\n\n## Деталі\n\n## Деталі\n\n### Докладніше\n\n'},
 ro:{title:'Cuprinsul documentului',depth:'Nivelul maxim al titlului',insert:'Inserează cuprins Markdown static',
  sample:'Încearcă titluri',empty:'Documentul nu are titluri',count:n=>n+' titluri',
  nav:'Titlurile documentului',example:'# Introducere\n\n## Detalii\n\n## Detalii\n\n### Mai multe detalii\n\n'},
 ru:{title:'Оглавление документа',depth:'Максимальный уровень заголовков',insert:'Вставить оглавление в Markdown',
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
 const panel=el('toc-panel');
 panel.open=state.tocOpen;
 panel.addEventListener('toggle',()=>{
  if(state.tocOpen===panel.open)return;
  state.tocOpen=panel.open;save();
 });
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
