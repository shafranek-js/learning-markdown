import {state,save} from '../core/state.js';
import {TAB_LIMIT,newTabId,tabDraftKey,safeTabName} from '../core/document-tabs.js';
const $=id=>document.getElementById(id);
const TEXT={
 en:{add:'New tab',close:'Close',rename:'Rename document:',confirm:'Close this document? Its browser-local draft will be deleted. Download a copy first if needed.',max:'Maximum 20 documents per language.',name:'Invalid filename.',tabs:'Sandbox documents'},
 cs:{add:'Nová karta',close:'Zavřít',rename:'Přejmenovat dokument:',confirm:'Zavřít dokument? Jeho lokální koncept bude smazán. Případně jej nejprve stáhněte.',max:'Maximum 20 dokumentů na jazyk.',name:'Neplatný název souboru.',tabs:'Dokumenty Sandbox'},
 uk:{add:'Нова вкладка',close:'Закрити',rename:'Перейменувати документ:',confirm:'Закрити документ? Локальну чернетку буде видалено. За потреби спочатку завантажте копію.',max:'Максимум 20 документів для мови.',name:'Некоректна назва файлу.',tabs:'Документи Sandbox'},
 ro:{add:'Filă nouă',close:'Închide',rename:'Redenumește documentul:',confirm:'Închideți documentul? Ciorna locală va fi ștearsă. Descărcați o copie mai întâi, dacă este necesar.',max:'Maximum 20 de documente pe limbă.',name:'Nume de fișier nevalid.',tabs:'Documente Sandbox'},
 ru:{add:'Новая вкладка',close:'Закрыть',rename:'Переименовать документ:',confirm:'Закрыть документ? Его локальный черновик будет удалён. При необходимости сначала скачайте копию.',max:'Не более 20 документов на язык.',name:'Недопустимое имя файла.',tabs:'Документы Sandbox'}
};
const words=()=>TEXT[state.lang]||TEXT.en;
const ACTION_TEXT={
 en:{more:'Actions for',rename:'Rename',duplicate:'Duplicate',close:'Close tab',copy:'copy'},
 cs:{more:'Akce pro',rename:'Přejmenovat',duplicate:'Duplikovat',close:'Zavřít kartu',copy:'kopie'},
 uk:{more:'Дії для',rename:'Перейменувати',duplicate:'Дублювати',close:'Закрити вкладку',copy:'копія'},
 ro:{more:'Acțiuni pentru',rename:'Redenumește',duplicate:'Duplică',close:'Închide fila',copy:'copie'},
 ru:{more:'Действия для',rename:'Переименовать',duplicate:'Дублировать',close:'Закрыть вкладку',copy:'копия'}
};
const actionText=()=>ACTION_TEXT[state.lang]||ACTION_TEXT.en;
let actionsFor=null,actionsTrigger=null;

let activate=()=>{};
function normalizeName(input){
 if(typeof input!=='string')return null;
 const leaf=input.split(/[\\/]/).pop().trim();
 if(!leaf||leaf==='.'||leaf==='..')return null;
 const stem=leaf.replace(/\.(md|markdown|txt)$/i,'').replace(/[<>:"|?*\u0000-\u001f]/g,'_')
  .replace(/^\.+/,'').replace(/[. ]+$/,'').trim();
 const name=stem?stem.slice(0,100)+'.md':null;
 return name&&safeTabName(name)?name:null;
}
export function ensureSandboxTabs(lang=state.lang){
 let items=state.documentTabs[lang];
 if(!Array.isArray(items))items=state.documentTabs[lang]=[];
 if(items.length===0){
  const tab={id:newTabId(),name:normalizeName(state.sandboxFileName)||'Untitled.md'};
  items.push(tab);
  const legacy=state.savedDrafts['sandbox_'+lang];
  if(typeof legacy==='string')state.savedDrafts[tabDraftKey(lang,tab.id)]=legacy;
  const previousSettings=state.extensionSettingsByDocument['sandbox_'+lang];
  if(previousSettings)state.extensionSettingsByDocument[tabDraftKey(lang,tab.id)]={...previousSettings};
  state.activeDocumentTab[lang]=tab.id;
  save();
 }else if(!items.some(tab=>tab.id===state.activeDocumentTab[lang])){
  state.activeDocumentTab[lang]=items[0].id;save();
 }
 return items;
}
export function activeSandboxTab(lang=state.lang){
 const list=ensureSandboxTabs(lang);
 return list.find(tab=>tab.id===state.activeDocumentTab[lang])||list[0];
}
export function activeSandboxText(lang=state.lang,fallback=''){
 const tab=activeSandboxTab(lang);
 return state.savedDrafts[tabDraftKey(lang,tab.id)]??fallback;
}
export function renameSandboxTab(name,id=state.activeDocumentTab[state.lang]){
 const validated=normalizeName(name);
 if(!validated)return false;
 const current=ensureSandboxTabs().find(tab=>tab.id===id);
 if(!current)return false;
 current.name=validated;
 if(current.id===state.activeDocumentTab[state.lang])state.sandboxFileName=validated;
 save();renderDocumentTabs();return true;
}
function focusTab(id){
 const button=[...$('document-tab-list').querySelectorAll('[data-document-id]')]
  .find(tab=>tab.dataset.documentId===id);
 button?.focus();
}
function requestRename(id){
 const tab=ensureSandboxTabs().find(tab=>tab.id===id);
 if(!tab)return;
 const name=window.prompt(words().rename,tab.name);
 if(name!==null&&!renameSandboxTab(name,id))alert(words().name);
 focusTab(id);
}
export function duplicateSandboxTab(id=state.activeDocumentTab[state.lang]){
 const list=ensureSandboxTabs(),index=list.findIndex(tab=>tab.id===id);
 if(index===-1)return false;
 if(list.length>=TAB_LIMIT){alert(words().max);return false;}
 const original=list[index];
 const stem=original.name.replace(/\.md$/i,'');
 const label=actionText().copy;
 let name=normalizeName(stem+' ('+label+').md');
 for(let n=2;list.some(tab=>tab.name===name)&&n<100;n++){
  name=normalizeName(stem+' ('+label+' '+n+').md');
 }
 const copy={id:newTabId(list),name:name||'Untitled.md'};
 const sourceKey=tabDraftKey(state.lang,id),targetKey=tabDraftKey(state.lang,copy.id);
 state.savedDrafts[targetKey]=state.savedDrafts[sourceKey]??'';
 const extension=state.extensionSettingsByDocument[sourceKey];
 if(extension)state.extensionSettingsByDocument[targetKey]={...extension};
 list.splice(index+1,0,copy);
 state.activeDocumentTab[state.lang]=copy.id;
 state.sandboxFileName=copy.name;
 save();activate();
 focusTab(copy.id);
 return true;
}
export function createSandboxTab(text='',name='Untitled.md'){
 const list=ensureSandboxTabs();
 if(list.length>=TAB_LIMIT){alert(words().max);return false;}
 const tab={id:newTabId(list),name:normalizeName(name)||'Untitled.md'};
 list.push(tab);
 state.savedDrafts[tabDraftKey(state.lang,tab.id)]=text;
 state.activeDocumentTab[state.lang]=tab.id;
 state.sandboxFileName=tab.name;
 save();
 activate();
 return true;
}
export function switchSandboxTab(id){
 const list=ensureSandboxTabs(),tab=list.find(t=>t.id===id);
 if(!tab)return false;
 if(tab.id===state.activeDocumentTab[state.lang]&&state.currentLessonIndex===-1)return true;
 state.activeDocumentTab[state.lang]=id;
 state.sandboxFileName=tab.name;
 save();
 activate();
 return true;
}
function closeSandboxTab(id){
 const list=ensureSandboxTabs(),position=list.findIndex(t=>t.id===id);
 if(position===-1)return;
 const tab=list[position],key=tabDraftKey(state.lang,id);
 const text=state.savedDrafts[key]||'';
 if(text.length&&!confirm(words().confirm))return;
 const active=id===state.activeDocumentTab[state.lang];
 list.splice(position,1);delete state.savedDrafts[key];
 delete state.extensionSettingsByDocument[key];
 if(list.length===0){
  const blank={id:newTabId(),name:'Untitled.md'};
  list.push(blank);state.savedDrafts[tabDraftKey(state.lang,blank.id)]='';
 }
 if(active){
  const next=list[Math.min(position,list.length-1)];
  state.activeDocumentTab[state.lang]=next.id;
  state.sandboxFileName=next.name;
 }
 save();
 if(active)activate();else renderDocumentTabs();
 const activeButton=[...$('document-tab-list').querySelectorAll('[data-document-id]')]
  .find(b=>b.dataset.documentId===state.activeDocumentTab[state.lang]);
 activeButton?.focus();
}
function closeActions({restoreFocus=true}={}){
 const menu=$('document-tab-actions');
 if(menu.hidden)return;
 const restoreId=actionsFor;
 menu.hidden=true;actionsFor=null;
 if(actionsTrigger?.isConnected)actionsTrigger.setAttribute('aria-expanded','false');
 actionsTrigger=null;
 if(restoreFocus)focusTab(restoreId);
}
function openActions(id,trigger){
 const tab=ensureSandboxTabs().find(item=>item.id===id);
 if(!tab)return;
 closeActions({restoreFocus:false});
 actionsFor=id;actionsTrigger=trigger;
 const menu=$('document-tab-actions');
 const w=actionText();
 menu.setAttribute('aria-label',w.more+' '+tab.name);
 for(const action of ['rename','duplicate','close']){
  const item=menu.querySelector('[data-tab-action="'+action+'"]');
  item.textContent=w[action];
  item.disabled=action==='duplicate'&&ensureSandboxTabs().length>=TAB_LIMIT;
 }
 menu.hidden=false;
 trigger?.setAttribute('aria-expanded','true');
 const anchor=trigger?.getBoundingClientRect()||{left:0,bottom:40};
 const rect=menu.getBoundingClientRect();
 menu.style.left=Math.max(6,Math.min(anchor.left,window.innerWidth-rect.width-6))+'px';
 menu.style.top=Math.max(6,Math.min(anchor.bottom+4,window.innerHeight-rect.height-6))+'px';
 menu.querySelector('[role="menuitem"]:not(:disabled)')?.focus();
}
export function renderDocumentTabs(){
 closeActions({restoreFocus:false});
 const isSandbox=state.currentLessonIndex===-1;
 $('document-tabs').hidden=!isSandbox;
 if(!isSandbox)return;
 const list=ensureSandboxTabs(),root=$('document-tab-list'),w=words();
 root.setAttribute('aria-label',w.tabs);
 $('document-new-tab').setAttribute('aria-label',w.add);
 $('document-new-tab').title=w.add;
 root.replaceChildren();
 for(const tab of list){
  const selected=tab.id===state.activeDocumentTab[state.lang];
  const wrapper=document.createElement('div');
  wrapper.className='document-tab-item'+(selected?' is-active':'');
  wrapper.setAttribute('role','presentation');
  const button=document.createElement('button');
  button.type='button';button.className='document-tab-title';
  button.setAttribute('role','tab');button.setAttribute('aria-selected',String(selected));
  button.tabIndex=selected?0:-1;button.dataset.documentId=tab.id;
  button.textContent=tab.name;button.title=tab.name+' — '+w.rename;
  button.addEventListener('click',()=>switchSandboxTab(tab.id));
  button.addEventListener('dblclick',()=>requestRename(tab.id));
  button.addEventListener('contextmenu',event=>{event.preventDefault();openActions(tab.id,button);});
  const close=document.createElement('button');
  close.type='button';close.className='document-tab-close';
  close.setAttribute('aria-label',w.close+' '+tab.name);
  close.title=w.close+' '+tab.name;close.textContent='×';
  close.addEventListener('click',()=>closeSandboxTab(tab.id));
  const more=document.createElement('button');
  more.type='button';more.className='document-tab-more';
  more.textContent='⋯';more.title=actionText().more+' '+tab.name;
  more.setAttribute('aria-label',actionText().more+' '+tab.name);
  more.setAttribute('aria-haspopup','menu');more.setAttribute('aria-controls','document-tab-actions');
  more.setAttribute('aria-expanded','false');
  more.addEventListener('click',()=>openActions(tab.id,more));
  wrapper.append(button,more,close);root.append(wrapper);
 }
 $('document-new-tab').disabled=list.length>=TAB_LIMIT;
 const activeButton=[...root.querySelectorAll('[data-document-id]')]
  .find(node=>node.dataset.documentId===state.activeDocumentTab[state.lang]);
 activeButton?.scrollIntoView({block:'nearest',inline:'nearest'});
}
export function initDocumentTabs({onActivate}){
 activate=onActivate;
 $('document-tab-actions').addEventListener('click',event=>{
  const action=event.target.closest('[data-tab-action]')?.dataset.tabAction;
  if(!action||!actionsFor)return;
  const id=actionsFor;
  closeActions({restoreFocus:false});
  if(action==='rename')requestRename(id);
  if(action==='duplicate')duplicateSandboxTab(id);
  if(action==='close')closeSandboxTab(id);
 });
 $('document-tab-actions').addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();closeActions();return;}
  const names=['ArrowUp','ArrowDown','Home','End'];
  if(!names.includes(event.key))return;
  const items=[...$('document-tab-actions').querySelectorAll('[role="menuitem"]:not(:disabled)')];
  const current=items.indexOf(document.activeElement);
  const index=event.key==='Home'?0:event.key==='End'?items.length-1:
   (current+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
  event.preventDefault();items[index]?.focus();
 });
 document.addEventListener('pointerdown',event=>{
  if(!actionsFor)return;
  if(!event.target.closest('#document-tab-actions, .document-tab-more'))closeActions({restoreFocus:false});
 });
 document.addEventListener('keydown',event=>{
  if(!actionsFor||event.key!=='Escape')return;
  event.preventDefault();closeActions();
 });
 window.addEventListener('resize',()=>closeActions({restoreFocus:false}));
 $('document-new-tab').addEventListener('click',()=>createSandboxTab());
 $('document-tab-list').addEventListener('keydown',event=>{
  const current=event.target.closest('[data-document-id]');
  if(current&&event.key==='F2'){
   event.preventDefault();requestRename(current.dataset.documentId);return;
  }
  if(current&&(event.key==='ContextMenu'||event.shiftKey&&event.key==='F10')){
   event.preventDefault();openActions(current.dataset.documentId,current);return;
  }
  if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
  const tabs=[...$('document-tab-list').querySelectorAll('[data-document-id]')];
  if(!current)return;
  const index=tabs.indexOf(current);
  const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:
   (index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  event.preventDefault();
  switchSandboxTab(tabs[next].dataset.documentId);
  const selected=[...$('document-tab-list').querySelectorAll('[data-document-id]')]
   .find(node=>node.dataset.documentId===state.activeDocumentTab[state.lang]);
  selected?.focus();
 });
}
