import {state} from '../core/state.js';
const $=id=>document.getElementById(id);
const STRINGS={
 en:{help:'Help',guide:'Course Contents',cheats:'Markdown Cheat Sheet',prompts:'Prompt Library',shortcuts:'Keyboard Shortcuts',about:'About Learning Markdown',close:'Close dialog',intro:'A free, installable interactive Markdown course and writing studio. Drafts and settings stay in your browser.',version:'Running build',source:'Open-source project',shortcutsTitle:'Editor and file shortcuts',os:'Use Command instead of Ctrl on macOS for compatible shortcuts.',rows:['New Markdown','Open Markdown','Download Markdown','Print / PDF','Find Markdown source','Replace Markdown source','Undo / Redo','Bold / Italic','Select next occurrence (Multi-cursor)','Toggle Tab focus mode']},
 cs:{help:'Nápověda',guide:'Obsah kurzu',cheats:'Tahák Markdown',prompts:'Knihovna promptů',shortcuts:'Klávesové zkratky',about:'O aplikaci Learning Markdown',close:'Zavřít dialog',intro:'Bezplatný interaktivní kurz Markdownu a editor. Koncepty a nastavení zůstávají v prohlížeči.',version:'Aktuální sestavení',source:'Otevřený projekt',shortcutsTitle:'Zkratky editoru a souborů',os:'V systému macOS použijte u podporovaných zkratek Command místo Ctrl.',rows:['Nový Markdown','Otevřít Markdown','Stáhnout Markdown','Tisk / PDF','Najít ve zdroji Markdown','Nahradit ve zdroji Markdown','Zpět / Znovu','Tučné / Kurzíva','Další výskyt (více kurzorů)','Přepnout Tab na přesun fokusu']},
 uk:{help:'Довідка',guide:'Зміст курсу',cheats:'Шпаргалка Markdown',prompts:'Бібліотека промптів',shortcuts:'Гарячі клавіші',about:'Про Learning Markdown',close:'Закрити вікно',intro:'Безкоштовний інтерактивний курс і редактор Markdown. Чернетки й налаштування зберігаються у браузері.',version:'Поточна версія',source:'Відкритий проєкт',shortcutsTitle:'Скорочення редактора й файлів',os:'У macOS використовуйте Command замість Ctrl, де це підтримується.',rows:['Новий Markdown','Відкрити Markdown','Завантажити Markdown','Друк / PDF','Знайти в Markdown','Замінити в Markdown','Скасувати / Повторити','Жирний / Курсив','Наступний збіг (кілька курсорів)','Переключити Tab на фокус']},
 ro:{help:'Ajutor',guide:'Cuprinsul cursului',cheats:'Ghid rapid Markdown',prompts:'Biblioteca de prompturi',shortcuts:'Comenzi rapide',about:'Despre Learning Markdown',close:'Închide dialogul',intro:'Curs interactiv gratuit și editor Markdown. Ciornele și setările rămân în browser.',version:'Versiunea curentă',source:'Proiect open source',shortcutsTitle:'Comenzi rapide pentru editor și fișiere',os:'Pe macOS, folosiți Command în loc de Ctrl acolo unde este acceptat.',rows:['Markdown nou','Deschide Markdown','Descarcă Markdown','Tipărire / PDF','Caută în Markdown','Înlocuiește în Markdown','Anulare / Refacere','Aldin / Cursiv','Apariția următoare (cursoare multiple)','Tab pentru navigare prin focus']},
 ru:{help:'Справка',guide:'Содержание курса',cheats:'Шпаргалка Markdown',prompts:'Библиотека промптов',shortcuts:'Горячие клавиши',about:'О Learning Markdown',close:'Закрыть окно',intro:'Бесплатный интерактивный курс и редактор Markdown. Черновики и настройки сохраняются в браузере.',version:'Текущая сборка',source:'Открытый проект',shortcutsTitle:'Горячие клавиши редактора и файлов',os:'В macOS для поддерживаемых сочетаний используется Command вместо Ctrl.',rows:['Новый Markdown','Открыть Markdown','Скачать Markdown','Печать / PDF','Поиск по Markdown','Замена в Markdown','Отменить / Повторить','Жирный / Курсив','Следующее совпадение (мультикурсор)','Переключить Tab на навигацию']}
};
const shortcuts=['Ctrl+N','Ctrl+O','Ctrl+S','Ctrl+P','Ctrl+F','Ctrl+H','Ctrl+Z / Ctrl+Y','Ctrl+B / Ctrl+I','Ctrl+D','Ctrl+M'];
const w=()=>STRINGS[state.lang]||STRINGS.en;
const isOpen=()=>!$('help-menu').hidden;
const actions=()=>Array.from($('help-menu').querySelectorAll('[role="menuitem"]'));
function position(){
 const trigger=$('help-menu-trigger').getBoundingClientRect(),menu=$('help-menu'),rect=menu.getBoundingClientRect();
 menu.style.left=Math.max(8,Math.min(trigger.left,innerWidth-rect.width-8))+'px';
 menu.style.top=Math.max(8,Math.min(trigger.bottom+6,innerHeight-rect.height-8))+'px';
}
function closeMenu({focus=false}={}){
 $('help-menu').hidden=true;
 $('help-menu-trigger').setAttribute('aria-expanded','false');
 if(focus)$('help-menu-trigger').focus();
}
function openMenu({last=false}={}){
 $('help-menu').hidden=false;
 $('help-menu-trigger').setAttribute('aria-expanded','true');
 position();
 (last?actions().at(-1):actions()[0])?.focus();
}
function closeDialog(){
 $('help-info-dialog').hidden=true;
 $('help-menu-trigger').focus();
}
function openDialog(kind){
 const labels=w(),body=$('help-info-content');
 body.replaceChildren();
 $('help-info-title').textContent=labels[kind];
 if(kind==='shortcuts'){
  const note=document.createElement('p');
  note.textContent=labels.os;
  const table=document.createElement('table');
  for(let i=0;i<shortcuts.length;i++){
   const tr=document.createElement('tr'),left=document.createElement('td'),right=document.createElement('td');
   left.textContent=labels.rows[i];
   const kbd=document.createElement('kbd');kbd.textContent=shortcuts[i];
   right.append(kbd);tr.append(left,right);table.append(tr);
  }
  body.append(note,table);
 }else{
  const info=document.createElement('p');info.textContent=labels.intro;
  const version=document.createElement('p');
  const build=$('app-version-status')?.textContent?.trim()||'';
  version.textContent=labels.version+': '+build;
  const repo=document.createElement('a');
  repo.href='https://github.com/shafranek-js/learning-markdown';
  repo.target='_blank';repo.rel='noopener noreferrer';
  repo.textContent=labels.source;
  body.append(info,version,repo);
 }
 $('help-info-dialog').hidden=false;
 $('help-info-close').focus();
}
let openCourseContents=()=>{};
function run(command){
 if(command==='guide')openCourseContents();
 else if(command==='shortcuts'||command==='about')openDialog(command);
}
export function renderHelpMenuLanguage(){
 const labels=w();
 $('help-menu-trigger').textContent=labels.help;
 $('help-menu-trigger').setAttribute('aria-label',labels.help);
 $('help-menu').setAttribute('aria-label',labels.help);
 $('help-info-close').setAttribute('aria-label',labels.close);
 for(const e of $('help-menu').querySelectorAll('[data-help-label]'))
  e.textContent=labels[e.dataset.helpLabel]||'';
}
export function initHelpMenu({onOpenCourseContents}={}){
 if(typeof onOpenCourseContents==='function')openCourseContents=onOpenCourseContents;
 const trigger=$('help-menu-trigger'),menu=$('help-menu'),dialog=$('help-info-dialog');
 trigger.addEventListener('click',()=>isOpen()?closeMenu({focus:true}):openMenu());
 trigger.addEventListener('keydown',event=>{
  if(!['ArrowDown','ArrowUp'].includes(event.key))return;
  event.preventDefault();openMenu({last:event.key==='ArrowUp'});
 });
 // Capture before the original buttons' own handlers run. Closing the menu first
 // gives Prompt Library a visible focus-return target and keeps existing actions intact.
 menu.addEventListener('click',event=>{
  const item=event.target.closest('[data-help-action]');
  if(!item)return;
  const command=item.dataset.helpAction;
  closeMenu({focus:true});
  if(!['sandbox','prompts','cheats'].includes(command))run(command);
 },true);
 menu.addEventListener('keydown',event=>{
  const items=actions(),i=items.indexOf(document.activeElement);let next=null;
  if(event.key==='ArrowDown')next=items[(i+1)%items.length];
  if(event.key==='ArrowUp')next=items[(i-1+items.length)%items.length];
  if(event.key==='Home')next=items[0];
  if(event.key==='End')next=items.at(-1);
  if(next){event.preventDefault();next.focus();}
  if(event.key==='Tab'){
   event.preventDefault();
   closeMenu();
   const next=event.shiftKey?$('settings-menu-trigger'):
    Array.from(document.querySelectorAll('.app-header-actions button, #document-new-tab, #markdown-input'))
     .find(el=>el.getClientRects().length&&el.getAttribute('aria-hidden')!=='true');
   (next||trigger).focus();
  }
 });
 $('help-info-close').addEventListener('click',closeDialog);
 dialog.addEventListener('pointerdown',event=>{if(event.target===dialog)closeDialog();});
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=Array.from(dialog.querySelectorAll('button,a[href]')).filter(el=>el.getClientRects().length);
  if(!controls.length)return;
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 document.addEventListener('pointerdown',event=>{
  if(isOpen()&&!menu.contains(event.target)&&!trigger.contains(event.target))closeMenu();
 },true);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
   if(!dialog.hidden){event.preventDefault();event.stopPropagation();closeDialog();}
   else if(isOpen()){event.preventDefault();event.stopPropagation();closeMenu({focus:true});}
  }
 },true);
 window.addEventListener('resize',()=>{if(isOpen())position();});
 renderHelpMenuLanguage();
}
