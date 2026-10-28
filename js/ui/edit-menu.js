import {state,subscribe} from '../core/state.js';
import {area,sourceSelection,selectSourceRange,selectAllSource,replaceSourceRange,replaceAllSource,historyStatus,undoOrRedo} from './editor.js';
import {nextSourceMatch,sourceMatches,selectedSourceMatches,replaceAllSourceMatches} from '../core/source-find-replace.js';

const $=id=>document.getElementById(id);
const DICTIONARY={
 en:{edit:'Edit',undo:'Undo',redo:'Redo',find:'Find…',replace:'Replace…',selectAll:'Select All',multi:'Multi-cursor',previous:'Previous',next:'Next',replacement:'Replace with',replaceOne:'Replace',replaceAll:'Replace All',matchCase:'Match case',close:'Close find panel',none:'No matches',count:n=>n+' matches'},
 cs:{edit:'Úpravy',undo:'Zpět',redo:'Znovu',find:'Najít…',replace:'Nahradit…',selectAll:'Vybrat vše',multi:'Více kurzorů',previous:'Předchozí',next:'Další',replacement:'Nahradit čím',replaceOne:'Nahradit',replaceAll:'Nahradit vše',matchCase:'Rozlišovat velikost',close:'Zavřít hledání',none:'Žádné shody',count:n=>n+' shod'},
 uk:{edit:'Редагування',undo:'Скасувати',redo:'Повторити',find:'Знайти…',replace:'Замінити…',selectAll:'Виділити все',multi:'Кілька курсорів',previous:'Попереднє',next:'Наступне',replacement:'Замінити на',replaceOne:'Замінити',replaceAll:'Замінити все',matchCase:'Враховувати регістр',close:'Закрити пошук',none:'Збігів немає',count:n=>n+' збігів'},
 ro:{edit:'Editare',undo:'Anulare',redo:'Refacere',find:'Caută…',replace:'Înlocuiește…',selectAll:'Selectează tot',multi:'Cursoare multiple',previous:'Anterior',next:'Următor',replacement:'Înlocuiește cu',replaceOne:'Înlocuiește',replaceAll:'Înlocuiește tot',matchCase:'Distinge majuscule',close:'Închide căutarea',none:'Nicio potrivire',count:n=>n+' potriviri'},
 ru:{edit:'Правка',undo:'Отменить',redo:'Повторить',find:'Найти…',replace:'Заменить…',selectAll:'Выделить всё',multi:'Мультикурсор',previous:'Назад',next:'Вперёд',replacement:'Заменить на',replaceOne:'Заменить',replaceAll:'Заменить всё',matchCase:'Учитывать регистр',close:'Закрыть поиск',none:'Совпадений нет',count:n=>n+' совпадений'}
};
const $words=()=>DICTIONARY[state.lang]||DICTIONARY.en;
const opened=()=>!$('edit-menu').hidden;
const options=()=>Array.from($('edit-menu').querySelectorAll('[role^="menuitem"]')).filter(n=>!n.disabled);
function position(element,origin){
 const r=origin.getBoundingClientRect(),size=element.getBoundingClientRect();
 element.style.left=Math.max(8,Math.min(r.left,innerWidth-size.width-8))+'px';
 element.style.top=Math.max(8,Math.min(r.bottom+6,innerHeight-size.height-8))+'px';
}
function closeMenu({focus=false}={}){
 if(!opened())return;
 $('edit-menu').hidden=true;
 $('edit-menu-trigger').setAttribute('aria-expanded','false');
 if(focus)$('edit-menu-trigger').focus();
}
function syncMenu(){
 const menu=$('edit-menu');
 if(!menu)return;
 const h=historyStatus();
 for(const [name,enabled] of [['undo',h.canUndo],['redo',h.canRedo]]){
  const item=menu.querySelector('[data-edit-action="'+name+'"]');
  item.disabled=!enabled;
  item.setAttribute('aria-disabled',String(item.disabled));
 }
 menu.querySelector('[data-edit-action="multi-cursor"]')
  .setAttribute('aria-checked',$('multi-cursor-toggle').getAttribute('aria-pressed')||'false');
}
function openMenu({last=false}={}){
 syncMenu();
 $('edit-menu').hidden=false;
 $('edit-menu-trigger').setAttribute('aria-expanded','true');
 position($('edit-menu'),$('edit-menu-trigger'));
 (last?options().at(-1):options()[0])?.focus();
}
function findOptions(){return {matchCase:$('edit-find-match-case').checked};}
function updateCount(){
 const query=$('edit-find-input').value;
 const matches=sourceMatches(area().value,query,findOptions());
 $('edit-find-count').textContent=query?(matches.length?$words().count(matches.length):$words().none):'';
}
function openFind(replace=false){
 closeMenu();
 $('edit-find-panel').hidden=false;
 $('edit-replace-row').hidden=!replace;
 position($('edit-find-panel'),$('edit-menu-trigger'));
 updateCount();
 $('edit-find-input').focus();
 $('edit-find-input').select();
}
function closeFind(){
 $('edit-find-panel').hidden=true;
 $('edit-menu-trigger').focus();
}
function navigate(backward=false){
 const term=$('edit-find-input').value;
 if(!term)return;
 const selection=sourceSelection();
 const offset=backward?selection.from:selection.to;
 const match=nextSourceMatch(area().value,term,offset,{backward,...findOptions()});
 if(match)selectSourceRange(match.from,match.to);
 updateCount();
}
function replaceOne(){
 const term=$('edit-find-input').value;
 if(!term)return;
 const selection=sourceSelection();
 if(!selectedSourceMatches(area().value,selection.from,selection.to,term,findOptions())){
  navigate();return;
 }
 replaceSourceRange(selection.from,selection.to,$('edit-replace-input').value);
 updateCount();
}
function replaceAll(){
 const term=$('edit-find-input').value;
 if(!term)return;
 const updated=replaceAllSourceMatches(area().value,term,$('edit-replace-input').value,findOptions());
 if(updated.count)replaceAllSource(updated.text);
 updateCount();
}
function run(name){
 const actions={
  undo:()=>{undoOrRedo(-1);syncMenu();},
  redo:()=>{undoOrRedo(1);syncMenu();},
  find:()=>openFind(),
  replace:()=>openFind(true),
  'select-all':selectAllSource,
  'multi-cursor':()=>{$('multi-cursor-toggle').click();}
 };
 actions[name]?.();
}
export function renderEditMenuLanguage(){
 const w=$words();
 $('edit-menu-trigger').textContent=w.edit;
 $('edit-menu-trigger').setAttribute('aria-label',w.edit);
 $('edit-menu').setAttribute('aria-label',w.edit);
 $('edit-find-panel').setAttribute('aria-label',w.find);
 $('edit-find-close').setAttribute('aria-label',w.close);
 for(const e of document.querySelectorAll('[data-edit-label]'))
  e.textContent=w[e.dataset.editLabel]||'';
 updateCount();
}
export function initEditMenu(){
 const trigger=$('edit-menu-trigger'),menu=$('edit-menu'),panel=$('edit-find-panel');
 trigger.addEventListener('click',()=>opened()?closeMenu({focus:true}):openMenu());
 trigger.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();openMenu({last:event.key==='ArrowUp'});
  }
 });
 menu.addEventListener('click',event=>{
  const item=event.target.closest('[data-edit-action]');
  if(!item||item.disabled)return;
  closeMenu({focus:true});
  run(item.dataset.editAction);
 });
 menu.addEventListener('keydown',event=>{
  const opts=options(),i=opts.indexOf(document.activeElement);
  let target=null;
  if(event.key==='ArrowDown')target=opts[(i+1)%opts.length];
  if(event.key==='ArrowUp')target=opts[(i-1+opts.length)%opts.length];
  if(event.key==='Home')target=opts[0];
  if(event.key==='End')target=opts.at(-1);
  if(target){event.preventDefault();target.focus();}
  if(event.key==='Tab'){event.preventDefault();closeMenu();(event.shiftKey?$('file-menu-trigger'):$('view-menu-trigger')).focus();}
 });
 $('edit-find-input').addEventListener('input',updateCount);
 $('edit-find-match-case').addEventListener('change',updateCount);
 $('edit-find-next').addEventListener('click',()=>navigate());
 $('edit-find-prev').addEventListener('click',()=>navigate(true));
 $('edit-replace-one').addEventListener('click',replaceOne);
 $('edit-replace-all').addEventListener('click',replaceAll);
 $('edit-find-close').addEventListener('click',closeFind);
 for(const id of ['edit-find-input','edit-replace-input']){
  $(id).addEventListener('keydown',event=>{
   if(event.key==='Enter'){
    event.preventDefault();navigate(event.shiftKey);
   }
  });
 }
 document.addEventListener('pointerdown',event=>{
  if(opened()&&!menu.contains(event.target)&&!trigger.contains(event.target))closeMenu();
 },true);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
   if(opened()){event.preventDefault();event.stopPropagation();closeMenu({focus:true});return;}
   if(!panel.hidden){event.preventDefault();event.stopPropagation();closeFind();return;}
  }
  // Only override browser find/history when editing the Markdown source.
  const insideEditor=document.activeElement?.closest('#editor-pane');
  if(!(insideEditor||document.activeElement===trigger))return;
  if((event.ctrlKey||event.metaKey)&&!event.altKey&&!event.shiftKey&&!event.isComposing){
   if(event.code==='KeyF'){event.preventDefault();openFind();event.stopPropagation();}
   if(event.code==='KeyH'){event.preventDefault();openFind(true);event.stopPropagation();}
  }
 },true);
 window.addEventListener('resize',()=>{
  if(opened())position(menu,trigger);
  if(!panel.hidden)position(panel,trigger);
 });
 subscribe(syncMenu);
 $('multi-cursor-toggle').addEventListener('click',()=>queueMicrotask(syncMenu));
 renderEditMenuLanguage();
}
