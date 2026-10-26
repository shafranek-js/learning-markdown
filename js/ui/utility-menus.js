import {state} from '../core/state.js';

const $=id=>document.getElementById(id);
const STRINGS={
 en:{outline:'Outline',export:'Export',compatibility:'Compatibility',html:'HTML (.html)',markdown:'Markdown (.md)',exportLabel:'Export document',compatibilityLabel:'Compatibility and Markdown extensions'},
 cs:{outline:'Osnova',export:'Export',compatibility:'Kompatibilita',html:'HTML (.html)',markdown:'Markdown (.md)',exportLabel:'Export dokumentu',compatibilityLabel:'Kompatibilita a rozšíření Markdownu'},
 uk:{outline:'Структура',export:'Експорт',compatibility:'Сумісність',html:'HTML (.html)',markdown:'Markdown (.md)',exportLabel:'Експорт документа',compatibilityLabel:'Сумісність і розширення Markdown'},
 ro:{outline:'Structură',export:'Export',compatibility:'Compatibilitate',html:'HTML (.html)',markdown:'Markdown (.md)',exportLabel:'Exportă documentul',compatibilityLabel:'Compatibilitate și extensii Markdown'},
 ru:{outline:'Структура',export:'Экспорт',compatibility:'Совместимость',html:'HTML (.html)',markdown:'Markdown (.md)',exportLabel:'Экспорт документа',compatibilityLabel:'Совместимость и расширения Markdown'}
};

const MENUS={
 'outline-trigger':'toc-panel',
 'compatibility-trigger':'compatibility-panel',
 'export-trigger':'preview-export-menu'
};
const setOpen=(triggerId,opened)=>{
 const trigger=$(triggerId),panel=$(MENUS[triggerId]);
 if(!trigger||!panel)return;
 if(panel.tagName==='DETAILS')panel.open=opened;
 else panel.hidden=!opened;
 trigger.setAttribute('aria-expanded',String(opened));
};
const isOpen=triggerId=>{
 const panel=$(MENUS[triggerId]);
 return panel?.tagName==='DETAILS'?panel.open:!!panel&&!panel.hidden;
};
export function closeUtilityMenus({restoreFocus=false}={}){
 let focused=null;
 for(const triggerId of Object.keys(MENUS)){
  if(isOpen(triggerId))focused=triggerId;
  setOpen(triggerId,false);
 }
 if(restoreFocus&&focused)$(focused).focus();
}
function placeCompatibility(){
 const trigger=$('compatibility-trigger'),panel=$('compatibility-panel');
 const box=trigger.getBoundingClientRect();
 const width=Math.min(420,window.innerWidth-20);
 const left=Math.max(10,Math.min(box.right-width,window.innerWidth-width-10));
 panel.style.left=left+'px';
 // Available space below the toolbar is normally larger than above it.
 const previewHeader=document.querySelector('#preview-pane > div:first-child');
 const headerBottom=previewHeader?.getBoundingClientRect().bottom||0;
 // Keep the Preview controls clickable even while Compatibility is open.
 panel.style.top=Math.min(Math.max(box.bottom+8,headerBottom+8),window.innerHeight-80)+'px';
 panel.style.width=width+'px';
}
export function initUtilityMenus(){
 for(const [triggerId,panelId] of Object.entries(MENUS)){
  const trigger=$(triggerId),panel=$(panelId);
  setOpen(triggerId,false);
  trigger.addEventListener('click',()=>{
   const next=!isOpen(triggerId);
   closeUtilityMenus();
   if(!next)return;
   setOpen(triggerId,true);
   if(triggerId==='compatibility-trigger')placeCompatibility();
   (panel.tagName==='DETAILS'?panel.querySelector('summary'):panel.querySelector('button'))?.focus();
  });
  if(panel.tagName==='DETAILS')panel.addEventListener('toggle',()=>{
   trigger.setAttribute('aria-expanded',String(panel.open));
  });
 }
 document.addEventListener('pointerdown',event=>{
  if(Object.entries(MENUS).some(([triggerId,panelId])=>
   $(triggerId).contains(event.target)||$(panelId).contains(event.target)))return;
  closeUtilityMenus();
 });
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&Object.keys(MENUS).some(isOpen)){
   event.preventDefault();
   event.stopPropagation();
   closeUtilityMenus({restoreFocus:true});
  }
 },true);
 for(const id of ['download-md-btn','download-html-btn','print-document-btn']){
  $(id).addEventListener('click',()=>closeUtilityMenus());
 }
 const dismiss=()=>{
  closeUtilityMenus();
 };
 window.addEventListener('resize',dismiss);
 // Keep the fixed popover aligned when a horizontally scrolling toolbar moves.
 // Do not dismiss on unrelated programmatic scrolling or focus: this could
 // immediately close a just-opened menu before keyboard users can reach it.
 document.addEventListener('scroll',()=>{
  if(isOpen('compatibility-trigger'))placeCompatibility();
 },true);
}
export function renderUtilityMenuLanguage(){
 const words=STRINGS[state.lang]||STRINGS.en;
 for(const [id,label] of [['outline-trigger',words.outline],['compatibility-trigger',words.compatibility],['export-trigger',words.export]]){
  $(id).textContent=label+' ▾';
  $(id).setAttribute('aria-label',label);
 }
 $('preview-export-menu').setAttribute('aria-label',words.exportLabel);
 $('compatibility-panel').setAttribute('aria-label',words.compatibilityLabel);
 $('download-html-btn').textContent=words.html;
 $('download-md-btn').textContent=words.markdown;
}
