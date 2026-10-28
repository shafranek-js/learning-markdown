import {state,save,subscribe} from '../core/state.js';

const $=id=>document.getElementById(id);
const STRINGS={
 en:{file:'File',new:'New Markdown',open:'Open Markdown…',save:'Download Markdown',saveAs:'Download As…',html:'Export HTML',word:'Export Word (.docx)',print:'Print / PDF',replace:'Replace your existing Sandbox draft? The previous draft will be overwritten.',invalid:'Enter a valid Markdown filename.',readError:'Unable to read the selected file.',sizeError:'File exceeds the 5 MB limit.',typeError:'Choose a .md, .markdown or .txt file.',as:'Download as Markdown filename:'},
 cs:{file:'Soubor',new:'Nový Markdown',open:'Otevřít Markdown…',save:'Stáhnout Markdown',saveAs:'Stáhnout jako…',html:'Exportovat HTML',word:'Exportovat Word (.docx)',print:'Tisk / PDF',replace:'Nahradit aktuální koncept v Sandboxu? Předchozí obsah bude přepsán.',invalid:'Zadejte platný název souboru Markdown.',readError:'Vybraný soubor nelze přečíst.',sizeError:'Soubor přesahuje limit 5 MB.',typeError:'Vyberte soubor .md, .markdown nebo .txt.',as:'Název souboru Markdown pro stažení:'},
 uk:{file:'Файл',new:'Новий Markdown',open:'Відкрити Markdown…',save:'Завантажити Markdown',saveAs:'Завантажити як…',html:'Експорт HTML',word:'Експорт Word (.docx)',print:'Друк / PDF',replace:'Замінити поточну чернетку Sandbox? Попередній вміст буде перезаписано.',invalid:'Уведіть правильну назву файлу Markdown.',readError:'Не вдалося прочитати файл.',sizeError:'Файл перевищує обмеження 5 МБ.',typeError:'Виберіть файл .md, .markdown або .txt.',as:'Назва файлу Markdown для завантаження:'},
 ro:{file:'Fișier',new:'Markdown nou',open:'Deschide Markdown…',save:'Descarcă Markdown',saveAs:'Descarcă ca…',html:'Exportă HTML',word:'Exportă Word (.docx)',print:'Tipărire / PDF',replace:'Înlocuiți ciorna actuală din Sandbox? Conținutul anterior va fi suprascris.',invalid:'Introduceți un nume de fișier Markdown valid.',readError:'Fișierul selectat nu poate fi citit.',sizeError:'Fișierul depășește limita de 5 MB.',typeError:'Selectați un fișier .md, .markdown sau .txt.',as:'Nume de fișier Markdown pentru descărcare:'},
 ru:{file:'Файл',new:'Новый Markdown',open:'Открыть Markdown…',save:'Скачать Markdown',saveAs:'Скачать как…',html:'Экспорт HTML',word:'Экспорт Word (.docx)',print:'Печать / PDF',replace:'Заменить текущий черновик Sandbox? Предыдущее содержимое будет перезаписано.',invalid:'Введите допустимое имя Markdown-файла.',readError:'Не удалось прочитать выбранный файл.',sizeError:'Файл превышает ограничение 5 МБ.',typeError:'Выберите файл .md, .markdown или .txt.',as:'Имя Markdown-файла для скачивания:'}
};
const words=()=>STRINGS[state.lang]||STRINGS.en;
const items=()=>Array.from($('file-menu').querySelectorAll('[role="menuitem"]'));
const opened=()=>!$('file-menu').hidden;

export function normalizeMarkdownFilename(input){
 if(typeof input!=='string')return null;
 const leaf=input.split(/[\\/]/).pop().trim();
 if(!leaf||leaf==='.'||leaf==='..')return null;
 const stem=leaf.replace(/\.(md|markdown|txt)$/i,'').replace(/[<>:"|?*\u0000-\u001f]/g,'_').replace(/^\.+/,'').replace(/[. ]+$/,'').trim();
 return stem?stem.slice(0,100)+'.md':null;
}

function currentName(){
 return state.currentLessonIndex===-1
  ?(normalizeMarkdownFilename(state.sandboxFileName)||'Untitled.md')
  :normalizeMarkdownFilename($('active-tab-title').textContent)||'Lesson.md';
}
function syncName(){$('file-menu-current').textContent=currentName();}
export function renderFileMenuLanguage(){
 const labels=words();
 $('file-menu-trigger').textContent=labels.file;
 $('file-menu-trigger').setAttribute('aria-label',labels.file);
 $('file-menu').setAttribute('aria-label',labels.file);
 for(const element of $('file-menu').querySelectorAll('[data-file-label]'))
  element.textContent=labels[element.dataset.fileLabel]||'';
 syncName();
}
function closeMenu({focus=false}={}){
 if(!opened())return;
 $('file-menu').hidden=true;
 $('file-menu-trigger').setAttribute('aria-expanded','false');
 if(focus)$('file-menu-trigger').focus();
}
function position(){
 const trigger=$('file-menu-trigger').getBoundingClientRect(),menu=$('file-menu');
 const rect=menu.getBoundingClientRect();
 menu.style.left=Math.max(8,Math.min(trigger.left,innerWidth-rect.width-8))+'px';
 menu.style.top=Math.max(8,Math.min(trigger.bottom+6,innerHeight-rect.height-8))+'px';
}
function openMenu({last=false}={}){
 syncName();
 $('file-menu').hidden=false;
 $('file-menu-trigger').setAttribute('aria-expanded','true');
 position();
 (last?items().at(-1):items()[0])?.focus();
}
export function initFileMenu({createDocument,renameDocument,saveMarkdown,exportWord}){
 const trigger=$('file-menu-trigger'),menu=$('file-menu'),input=$('file-menu-open-input');
 function openPicker(){input.value='';input.click();}
 function saveAs(){
  const proposed=currentName(),chosen=window.prompt(words().as,proposed);
  if(chosen===null)return;
  const name=normalizeMarkdownFilename(chosen);
  if(!name){window.alert(words().invalid);return;}
  if(saveMarkdown(name)&&state.currentLessonIndex===-1){
   renameDocument(name);syncName();
  }
 }
 async function importFile(file){
  if(!file)return;
  if(!/\.(md|markdown|txt)$/i.test(file.name)){window.alert(words().typeError);return;}
  if(file.size>5*1024*1024){window.alert(words().sizeError);return;}
  try{
   const source=await file.text();
   const name=normalizeMarkdownFilename(file.name)||'Untitled.md';
   createDocument(source,name);
  }catch(error){console.warn('Unable to open Markdown file',error);window.alert(words().readError);}
 }
 input.addEventListener('change',()=>{const file=input.files?.[0];input.value='';if(file)void importFile(file);});
 const actions={
  new:()=>createDocument('','Untitled.md'),
  open:openPicker,
  save:()=>saveMarkdown(),
  'save-as':saveAs,
  'export-html':()=>$('download-html-btn').click(),
  'export-word':()=>void exportWord(),
  print:()=>$('print-document-btn').click()
 };
 trigger.addEventListener('click',()=>opened()?closeMenu({focus:true}):openMenu());
 trigger.addEventListener('keydown',event=>{
  if(!['ArrowDown','ArrowUp'].includes(event.key))return;
  event.preventDefault();
  if(!opened())openMenu({last:event.key==='ArrowUp'});
 });
 menu.addEventListener('click',event=>{
  const node=event.target.closest('[data-file-action]');
  if(!node||!menu.contains(node))return;
  const fn=actions[node.dataset.fileAction];
  closeMenu({focus:true});
  fn?.();
 });
 menu.addEventListener('keydown',event=>{
  const options=items(),index=options.indexOf(document.activeElement);
  let focus=null;
  if(event.key==='ArrowDown')focus=options[(index+1)%options.length];
  if(event.key==='ArrowUp')focus=options[(index-1+options.length)%options.length];
  if(event.key==='Home')focus=options[0];
  if(event.key==='End')focus=options.at(-1);
  if(focus){event.preventDefault();focus.focus();}
  if(event.key==='Tab'){
   event.preventDefault();closeMenu();
   const controls=Array.from(document.querySelectorAll('button,select,input:not([hidden]),a[href],[tabindex]:not([tabindex="-1"])'))
    .filter(element=>!element.disabled&&element.getClientRects().length);
   const next=controls.indexOf(trigger)+(event.shiftKey?-1:1);
   (controls[next]||trigger).focus();
  }
 });
 document.addEventListener('pointerdown',event=>{
  if(opened()&&!menu.contains(event.target)&&!trigger.contains(event.target))closeMenu();
 },true);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&opened()){
   event.preventDefault();event.stopPropagation();closeMenu({focus:true});
  }
  if((event.ctrlKey||event.metaKey)&&!event.altKey&&!event.shiftKey&&!event.isComposing){
   if(event.code==='KeyN'){
    event.preventDefault();closeMenu();createDocument('','Untitled.md');
   }else if(event.code==='KeyO'){
    event.preventDefault();closeMenu();openPicker();
   }else if(event.code==='KeyS'){
    event.preventDefault();closeMenu();saveMarkdown();
   }else if(event.code==='KeyP'){
    event.preventDefault();closeMenu();$('print-document-btn').click();
   }
  }
 },true);
 window.addEventListener('resize',()=>{if(opened())position();});
 subscribe(syncName);
 renderFileMenuLanguage();
}
