import {state,subscribe} from '../core/state.js';
import {setMobileTab} from './resizer.js';

const $=id=>document.getElementById(id);
const LABELS={
 en:{view:'View',wrap:'Word Wrap',guide:'Lesson Guide',layout:'Layout',split:'Split View',preview:'Preview Only',html:'HTML Source',font:'Editor font',smaller:'Decrease font size',larger:'Increase font size',reset:'Reset split widths (50:50)'},
 cs:{view:'Zobrazení',wrap:'Zalamování řádků',guide:'Průvodce lekcí',layout:'Rozložení',split:'Rozdělené zobrazení',preview:'Pouze náhled',html:'Zdrojový HTML',font:'Písmo editoru',smaller:'Zmenšit písmo',larger:'Zvětšit písmo',reset:'Obnovit šířky (50:50)'},
 uk:{view:'Вигляд',wrap:'Перенос рядків',guide:'Навчальний посібник',layout:'Розташування',split:'Розділений вигляд',preview:'Лише перегляд',html:'HTML-код',font:'Шрифт редактора',smaller:'Зменшити шрифт',larger:'Збільшити шрифт',reset:'Відновити ширину (50:50)'},
 ro:{view:'Vizualizare',wrap:'Încadrare text',guide:'Ghidul lecției',layout:'Aspect',split:'Vizualizare împărțită',preview:'Doar previzualizare',html:'Sursă HTML',font:'Font editor',smaller:'Micșorează fontul',larger:'Mărește fontul',reset:'Restabilește lățimile (50:50)'},
 ru:{view:'Вид',wrap:'Перенос строк',guide:'Руководство по уроку',layout:'Расположение',split:'Разделённый вид',preview:'Только предпросмотр',html:'Исходный HTML',font:'Шрифт редактора',smaller:'Уменьшить шрифт',larger:'Увеличить шрифт',reset:'Сбросить ширину панелей (50:50)'}
};

const items=()=>Array.from($('view-menu').querySelectorAll('[role^="menuitem"]'));
const menuOpen=()=>!$('view-menu').hidden;

export function syncViewMenu(){
 if(!$('view-menu'))return;
 const selections={
  wrap:state.wrapText,
  guide:state.guideVisible&&state.currentLessonIndex!==-1,
  split:state.layoutMode==='split',
  preview:state.layoutMode==='preview',
  html:state.layoutMode==='html'
 };
 for(const [action,checked] of Object.entries(selections)){
  const item=$('view-menu').querySelector('[data-view-action="'+action+'"]');
  item?.setAttribute('aria-checked',String(checked));
 }
}

export function renderViewMenuLanguage(){
 const words=LABELS[state.lang]||LABELS.en;
 $('view-menu-trigger').textContent=words.view;
 $('view-menu-trigger').setAttribute('aria-label',words.view);
 $('view-menu').setAttribute('aria-label',words.view);
 for(const element of $('view-menu').querySelectorAll('[data-view-label]')){
  element.textContent=words[element.dataset.viewLabel]||'';
 }
 syncViewMenu();
}

function positionMenu(){
 const trigger=$('view-menu-trigger').getBoundingClientRect();
 const menu=$('view-menu');
 const width=menu.getBoundingClientRect().width;
 const height=menu.getBoundingClientRect().height;
 menu.style.left=Math.max(8,Math.min(trigger.left,window.innerWidth-width-8))+'px';
 menu.style.top=Math.max(8,Math.min(trigger.bottom+6,window.innerHeight-height-8))+'px';
}

function closeMenu({focus=false}={}){
 if(!menuOpen())return;
 $('view-menu').hidden=true;
 $('view-menu-trigger').setAttribute('aria-expanded','false');
 if(focus)$('view-menu-trigger').focus();
}
function openMenu({last=false}={}){
 const menu=$('view-menu');
 syncViewMenu();
 menu.hidden=false;
 $('view-menu-trigger').setAttribute('aria-expanded','true');
 positionMenu();
 const options=items();
 (last?options.at(-1):options[0])?.focus();
}
function action(name){
 if(name==='wrap')$('wrap-text-toggle').click();
 else if(name==='guide'){
  $('theory-pane-toggle-btn').click();
  // When View is the only Guide control, toggling it on mobile must also
  // display the requested pane (and return to the editor when hiding it).
  if(window.matchMedia('(max-width:767px)').matches)
   setMobileTab(state.guideVisible&&state.currentLessonIndex!==-1?'guide':'editor');
 }
 else if(['split','preview','html'].includes(name)){
  $('layout-'+name+'-btn').click();
  if(window.matchMedia('(max-width:767px)').matches)
   setMobileTab(name==='split'?'editor':'preview');
 }else if(name==='smaller')$('font-dec-btn').click();
 else if(name==='larger')$('font-inc-btn').click();
 else if(name==='reset')$('reset-split-btn').click();
 syncViewMenu();
}

export function initViewMenu(){
 const trigger=$('view-menu-trigger'),menu=$('view-menu');
 trigger.addEventListener('click',()=>menuOpen()?closeMenu({focus:true}):openMenu());
 trigger.addEventListener('keydown',event=>{
  if(event.key!=='ArrowDown'&&event.key!=='ArrowUp')return;
  event.preventDefault();
  if(!menuOpen())openMenu({last:event.key==='ArrowUp'});
  else (event.key==='ArrowUp'?items().at(-1):items()[0])?.focus();
 });
 menu.addEventListener('click',event=>{
  const item=event.target.closest('[data-view-action]');
  if(!item||!menu.contains(item))return;
  action(item.dataset.viewAction);
  closeMenu({focus:true});
 });
 menu.addEventListener('keydown',event=>{
  const options=items(),index=options.indexOf(document.activeElement);
  let next=null;
  if(event.key==='ArrowDown')next=options[(index+1)%options.length];
  else if(event.key==='ArrowUp')next=options[(index-1+options.length)%options.length];
  else if(event.key==='Home')next=options[0];
  else if(event.key==='End')next=options.at(-1);
  if(next){event.preventDefault();next.focus();}
  if(event.key==='Tab'){
   // Continue in normal document tab order after the menu trigger.
   event.preventDefault();
   closeMenu();
   const controls=Array.from(document.querySelectorAll('button,select,input,a[href],[tabindex]:not([tabindex="-1"])'))
    .filter(node=>!node.disabled&&node.getClientRects().length);
   const nextIndex=controls.indexOf(trigger)+(event.shiftKey?-1:1);
   (controls[nextIndex]||trigger).focus();
  }
 });
 document.addEventListener('pointerdown',event=>{
  if(menuOpen()&&!menu.contains(event.target)&&!trigger.contains(event.target))closeMenu();
 },true);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&menuOpen()){
   event.preventDefault();event.stopPropagation();
   closeMenu({focus:true});
  }
 },true);
 window.addEventListener('resize',()=>{if(menuOpen())positionMenu();});
 window.addEventListener('scroll',()=>{if(menuOpen())positionMenu();},true);
 subscribe(syncViewMenu);
 renderViewMenuLanguage();
}
