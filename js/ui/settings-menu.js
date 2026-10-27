import {state} from '../core/state.js';

const $=id=>document.getElementById(id);
const LABELS={
 en:{settings:'Settings',theme:'Theme',language:'Language',saved:'Your preferences are saved automatically.',close:'Close settings'},
 cs:{settings:'Nastavení',theme:'Motiv vzhledu',language:'Jazyk',saved:'Vaše nastavení se automaticky ukládá.',close:'Zavřít nastavení'},
 uk:{settings:'Налаштування',theme:'Тема',language:'Мова',saved:'Налаштування зберігаються автоматично.',close:'Закрити налаштування'},
 ro:{settings:'Setări',theme:'Temă',language:'Limbă',saved:'Preferințele sunt salvate automat.',close:'Închide setările'},
 ru:{settings:'Настройки',theme:'Тема оформления',language:'Язык',saved:'Настройки сохраняются автоматически.',close:'Закрыть настройки'}
};
const isOpen=()=>!$('settings-panel').hidden;
function position(){
 const trigger=$('settings-menu-trigger').getBoundingClientRect();
 const rect=$('settings-panel').getBoundingClientRect();
 $('settings-panel').style.left=Math.max(8,Math.min(trigger.left,innerWidth-rect.width-8))+'px';
 $('settings-panel').style.top=Math.max(8,Math.min(trigger.bottom+6,innerHeight-rect.height-8))+'px';
}
function close({returnFocus=false}={}){
 if(!isOpen())return;
 $('settings-panel').hidden=true;
 $('settings-menu-trigger').setAttribute('aria-expanded','false');
 if(returnFocus)$('settings-menu-trigger').focus();
}
function open(){
 $('settings-panel').hidden=false;
 $('settings-menu-trigger').setAttribute('aria-expanded','true');
 // Always reflect current persisted state, even when another UI updates it.
 $('theme-selector').value=state.theme;
 $('lang-selector').value=state.lang;
 position();
 $('theme-selector').focus();
}
export function renderSettingsLanguage(){
 const words=LABELS[state.lang]||LABELS.en;
 const trigger=$('settings-menu-trigger');
 trigger.textContent=words.settings;
 trigger.setAttribute('aria-label',words.settings);
 $('settings-close').setAttribute('aria-label',words.close);
 for(const e of $('settings-panel').querySelectorAll('[data-settings-label]'))
  e.textContent=words[e.dataset.settingsLabel]||'';
 $('theme-selector').setAttribute('aria-label',words.theme);
 $('lang-selector').setAttribute('aria-label',words.language);
}
export function initSettingsMenu(){
 const trigger=$('settings-menu-trigger'),panel=$('settings-panel');
 trigger.addEventListener('click',()=>isOpen()?close({returnFocus:true}):open());
 trigger.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
   event.preventDefault();
   if(!isOpen())open();
   (event.key==='ArrowUp'?$('lang-selector'):$('theme-selector')).focus();
  }
 });
 $('settings-close').addEventListener('click',()=>close({returnFocus:true}));
 // The settings popover is non-modal; Tab must continue through the page.
 panel.addEventListener('focusout',event=>{
  if(!event.relatedTarget||!panel.contains(event.relatedTarget)){
   // A pointer/keyboard may move to the trigger, which handles its own click.
   close();
  }
 });
 document.addEventListener('pointerdown',event=>{
  if(isOpen()&&!panel.contains(event.target)&&!trigger.contains(event.target))close();
 },true);
 document.addEventListener('keydown',event=>{
  if(isOpen()&&event.key==='Escape'){
   event.preventDefault();
   event.stopPropagation();
   close({returnFocus:true});
  }
 },true);
 window.addEventListener('resize',()=>{if(isOpen())position();});
 window.addEventListener('scroll',event=>{
  if(isOpen()&&!panel.contains(event.target))position();
 },true);
 renderSettingsLanguage();
}
