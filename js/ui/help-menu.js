import {state} from '../core/state.js';
import {helpShortcutSections,HELP_SHORTCUT_TEXT} from './help-shortcuts.js';
const $=id=>document.getElementById(id);
const STRINGS={
 en:{help:'Help',guide:'Course Contents',cheats:'Markdown Cheat Sheet',prompts:'Prompt Library',shortcuts:'Keyboard Shortcuts',about:'About Learning Markdown',close:'Close dialog',intro:'A free, installable interactive Markdown course and writing studio. Drafts and settings stay in your browser.',version:'Running build',source:'Open-source project',shortcutsTitle:'Editor and file shortcuts'},
 cs:{help:'Nápověda',guide:'Obsah kurzu',cheats:'Tahák Markdown',prompts:'Knihovna promptů',shortcuts:'Klávesové zkratky',about:'O aplikaci Learning Markdown',close:'Zavřít dialog',intro:'Bezplatný interaktivní kurz Markdownu a editor. Koncepty a nastavení zůstávají v prohlížeči.',version:'Aktuální sestavení',source:'Otevřený projekt',shortcutsTitle:'Zkratky editoru a souborů'},
 uk:{help:'Довідка',guide:'Зміст курсу',cheats:'Шпаргалка Markdown',prompts:'Бібліотека промптів',shortcuts:'Гарячі клавіші',about:'Про Learning Markdown',close:'Закрити вікно',intro:'Безкоштовний інтерактивний курс і редактор Markdown. Чернетки й налаштування зберігаються у браузері.',version:'Поточна версія',source:'Відкритий проєкт',shortcutsTitle:'Скорочення редактора й файлів'},
 ro:{help:'Ajutor',guide:'Cuprinsul cursului',cheats:'Ghid rapid Markdown',prompts:'Biblioteca de prompturi',shortcuts:'Comenzi rapide',about:'Despre Learning Markdown',close:'Închide dialogul',intro:'Curs interactiv gratuit și editor Markdown. Ciornele și setările rămân în browser.',version:'Versiunea curentă',source:'Proiect open source',shortcutsTitle:'Comenzi rapide pentru editor și fișiere'},
 ru:{help:'Справка',guide:'Содержание курса',cheats:'Шпаргалка Markdown',prompts:'Библиотека промптов',shortcuts:'Горячие клавиши',about:'О Learning Markdown',close:'Закрыть окно',intro:'Бесплатный интерактивный курс и редактор Markdown. Черновики и настройки сохраняются в браузере.',version:'Текущая сборка',source:'Открытый проект',shortcutsTitle:'Горячие клавиши редактора и файлов'}
};
const CONTACT_HEADING={en:'Contact',cs:'Kontakt',uk:'Контакти',ro:'Contact',ru:'Контакты'};
const GITHUB_LABELS={en:'Learning Markdown on GitHub',cs:'Learning Markdown na GitHubu',uk:'Learning Markdown на GitHub',ro:'Learning Markdown pe GitHub',ru:'Learning Markdown на GitHub'};
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
  const t=HELP_SHORTCUT_TEXT[state.lang]||HELP_SHORTCUT_TEXT.en;
  const note=document.createElement('p');note.textContent=t.note;
  const os=document.createElement('p');os.textContent=t.os;
  body.append(note,os);
  for(const section of helpShortcutSections(state.lang)){
   const heading=document.createElement('h3');heading.textContent=section.title;
   const hint=document.createElement('p');
   hint.className='workspace-shortcut-hint';hint.textContent=section.hint;
   const table=document.createElement('table');
   table.className='workspace-shortcuts-table';
   table.setAttribute('aria-label',section.title);
   for(const command of section.rows){
    const tr=document.createElement('tr');tr.dataset.shortcutId=command.id;
    const name=document.createElement('th');name.scope='row';name.textContent=command.label;
    const value=document.createElement('td');
    const keys=document.createElement('span');keys.className='workspace-shortcut-keys';
    for(const key of command.keys){
     const kbd=document.createElement('kbd');kbd.textContent=key;keys.append(kbd);
    }
    value.append(keys);tr.append(name,value);table.append(tr);
   }
   body.append(heading,hint,table);
  }
 }else{
  const info=document.createElement('p');info.textContent=labels.intro;
  const version=document.createElement('p');
  const build=$('app-version-status')?.textContent?.trim()||'';
  version.textContent=labels.version+': '+build;
  const repo=document.createElement('a');
  repo.href='https://github.com/shafranek-js/learning-markdown';
  repo.target='_blank';repo.rel='noopener noreferrer';
  repo.textContent=labels.source;
  const contactsTitle=document.createElement('h3');
  contactsTitle.textContent=CONTACT_HEADING[state.lang]||CONTACT_HEADING.en;
  const contacts=document.createElement('div');
  contacts.className='workspace-help-contacts';
  const email=document.createElement('a');
  email.href='mailto:pavel.p.popovic@gmail.com';
  email.textContent='pavel.p.popovic@gmail.com';
  const telegram=document.createElement('a');
  telegram.href='https://t.me/jsx_xsj';
  telegram.target='_blank';telegram.rel='noopener noreferrer';
  telegram.textContent='t.me/jsx_xsj';
  contacts.append(email,telegram);
  body.append(info,version,repo,contactsTitle,contacts);
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
 const github=$('github-repository-link');
 if(github){const name=GITHUB_LABELS[state.lang]||GITHUB_LABELS.en;
  github.setAttribute('aria-label',name);github.title=name;}
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
