import {helpShortcutSections} from './help-shortcuts.js';
import {state} from '../core/state.js';

const CONTEXT_TEXT={
 en:{title:'Multi-cursor actions',add:'Add cursor here',column:'Select column to here',
  hint:'Column selection starts at the primary caret.'},
 cs:{title:'Akce více kurzorů',add:'Přidat kurzor sem',column:'Vybrat sloupec až sem',
  hint:'Sloupcový výběr začíná u hlavního kurzoru.'},
 uk:{title:'Дії кількох курсорів',add:'Додати курсор тут',column:'Виділити стовпчик до цієї точки',
  hint:'Виділення стовпчика починається від основного курсора.'},
 ro:{title:'Acțiuni cu mai multe cursoare',add:'Adaugă cursor aici',column:'Selectează coloana până aici',
  hint:'Selecția coloanei începe la cursorul principal.'},
 ru:{title:'Действия мультикурсора',add:'Добавить курсор здесь',column:'Выделить столбец до этой точки',
  hint:'Выделение столбца начинается от основного курсора.'}
};

// The menu mirrors the same eight commands/gestures documented under
// Help > Keyboard Shortcuts. Shortcut labels are never duplicated here.
export function createMultiCursorContextMenu(editor,{enabled,run}){
 const menu=document.createElement('div');
 menu.id='multi-cursor-context-menu';
 menu.className='multi-cursor-context-menu';
 menu.setAttribute('role','menu');
 menu.hidden=true;
 document.body.append(menu);
 let atPosition=null,selectionBeforeRightClick=null;
 const items=()=>[...menu.querySelectorAll('[role="menuitem"]')];
 const isOpen=()=>!menu.hidden;
 function hide({focus=false}={}){
  if(!isOpen())return;
  menu.hidden=true;
  atPosition=null;
  if(focus)editor.focus();
 }
 function fill(){
  const localized=CONTEXT_TEXT[state.lang]||CONTEXT_TEXT.en;
  menu.replaceChildren();
  menu.setAttribute('aria-label',localized.title);
  const header=document.createElement('div');
  header.className='multi-cursor-context-heading';
  header.textContent=localized.title;
  menu.append(header);
  const rows=helpShortcutSections(state.lang).find(section=>section.id==='multi').rows;
  for(const row of rows){
   const button=document.createElement('button');
   button.type='button';
   button.setAttribute('role','menuitem');
   button.tabIndex=-1;
   button.dataset.multiCursorAction=row.id.slice('multi-'.length);
   const label=document.createElement('span');
   label.textContent=row.id==='multi-add-click'?localized.add:
    row.id==='multi-column'?localized.column:row.label;
   const chord=document.createElement('kbd');
   chord.textContent=row.keys.join(' / ');
   button.append(label,chord);menu.append(button);
  }
  const note=document.createElement('p');
  note.className='multi-cursor-context-hint';note.textContent=localized.hint;
  menu.append(note);
 }
 function show(x,y,pos){
  if(!enabled())return;
  if(isOpen())hide();
  fill();
  atPosition=pos;
  menu.hidden=false;
  // Measure the real menu and keep every action on-screen on narrow panes,
  // smaller viewports, or when opened near the bottom-right corner.
  menu.style.left='0px';menu.style.top='0px';
  const rect=menu.getBoundingClientRect();
  menu.style.left=Math.max(8,Math.min(x,window.innerWidth-rect.width-8))+'px';
  menu.style.top=Math.max(8,Math.min(y,window.innerHeight-rect.height-8))+'px';
  items()[0]?.focus({preventScroll:true});
 }
 function caretPoint(){
  const caret=editor.coordsAtPos(editor.state.selection.main.head);
  const fallback=editor.dom.getBoundingClientRect();
  return {x:caret?.left??fallback.left+12,y:caret?.bottom??fallback.top+12};
 }
 editor.dom.addEventListener('pointerdown',event=>{
  if(event.button===2&&enabled())selectionBeforeRightClick=editor.state.selection;
 },true);
 editor.dom.addEventListener('contextmenu',event=>{
  if(!enabled())return; // Native browser menu when multi-cursor is off.
  event.preventDefault();event.stopPropagation();
  if(selectionBeforeRightClick){
   // CodeMirror/browser may move a selection during right mouse down. The
   // context menu must operate on the user's ORIGINAL multiple selections.
   if(!editor.state.selection.eq(selectionBeforeRightClick))
    editor.dispatch({selection:selectionBeforeRightClick});
   selectionBeforeRightClick=null;
  }
  const mouse=event.clientX||event.clientY;
  const p=mouse?editor.posAtCoords({x:event.clientX,y:event.clientY}):null;
  const caret=caretPoint();
  show(mouse?event.clientX:caret.x,mouse?event.clientY:caret.y,
   p??editor.state.selection.main.head);
 });
 editor.dom.addEventListener('keydown',event=>{
  if(!enabled())return;
  if(!(event.key==='ContextMenu'||event.key==='F10'&&event.shiftKey))return;
  event.preventDefault();event.stopPropagation();
  const caret=caretPoint();
  show(caret.x,caret.y,editor.state.selection.main.head);
 },true);
 menu.addEventListener('click',event=>{
  const action=event.target.closest('[data-multi-cursor-action]')?.dataset.multiCursorAction;
  if(!action)return;
  const position=atPosition;
  hide();
  if(enabled())run(action,position);
  editor.focus();
 });
 menu.addEventListener('keydown',event=>{
  const keys=['ArrowDown','ArrowUp','Home','End'];
  if(keys.includes(event.key)){
   event.preventDefault();
   const buttons=items(),index=buttons.indexOf(document.activeElement);
   const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:
    (index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;
   buttons[next]?.focus();return;
  }
  if(event.key==='Escape'||event.key==='Tab'){
   event.preventDefault();event.stopPropagation();hide({focus:true});return;
  }
  if(event.key==='Enter'||event.key===' '){
   event.preventDefault();document.activeElement?.click();
  }
 });
 document.addEventListener('pointerdown',event=>{
  if(isOpen()&&!menu.contains(event.target))hide();
 },true);
 editor.scrollDOM.addEventListener('scroll',()=>hide());
 window.addEventListener('resize',()=>hide());
 return {hide};
}
