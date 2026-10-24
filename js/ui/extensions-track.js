import {state,save} from '../core/state.js';
import {markdownToHTML} from './preview.js';
import {EXTENSIONS_LABS,extensionsLabText,evaluateExtensionsLab} from '../data/extensions-track.js';

const $=id=>document.getElementById(id);
const byId=id=>EXTENSIONS_LABS.find(item=>item.id===id) || EXTENSIONS_LABS[0];
let previousFocus=null;

function selected(){return byId(state.extensionsLabCurrent);}
function isOpen(){return !$('extensions-lab-modal').classList.contains('hidden');}

function showProgress(){
 const total=EXTENSIONS_LABS.length,completed=state.extensionsLabCompleted.length;
 $('extensions-lab-progress').textContent=completed+' / '+total;
 $('extensions-lab-open-progress').textContent=completed+' / '+total;
}

// Both output and validation use the same sanitized renderer as main Preview.
// No extension settings from the active core lesson are permitted to leak in.
function checkLive(){
 const lab=selected(),source=$('extensions-lab-source').value;
 const html=markdownToHTML(source,'gfm',{extensions:false});
 $('extensions-lab-preview').innerHTML=html;
 const checks=evaluateExtensionsLab(lab.id,html);
 const locale=extensionsLabText(state.lang),entry=locale.entry[lab.id];
 const root=$('extensions-lab-checks');root.replaceChildren();
 checks.forEach((passed,index)=>{
  const li=document.createElement('li');
  const indicator=document.createElement('strong');
  indicator.textContent=passed?'✓ ':'○ ';
  const description=document.createElement('span');
  description.textContent=entry.checks[index];
  li.append(indicator,description);root.append(li);
 });
 const passed=checks.length===lab.checks.length&&checks.every(Boolean);
 $('extensions-lab-status').textContent=passed?locale.statusDone:locale.statusPending;
 if(passed&&!state.extensionsLabCompleted.includes(lab.id)){
  state.extensionsLabCompleted.push(lab.id);
  save();
 }
 showProgress();
}
function renderSelected(){
 const lab=selected(),locale=extensionsLabText(state.lang),entry=locale.entry[lab.id];
 $('extensions-lab-select').value=lab.id;
 $('extensions-lab-description').textContent=entry.description;
 $('extensions-lab-portability').textContent=locale.portability+': '+entry.portability;
 $('extensions-lab-source').value=Object.hasOwn(state.extensionsLabDrafts,lab.id)?state.extensionsLabDrafts[lab.id]:lab.starter;
 checkLive();
}
export function renderExtensionsLabLanguage(){
 const locale=extensionsLabText(state.lang);
 $('extensions-lab-open-label').textContent=locale.open;
 $('extensions-lab-title').textContent=locale.title;
 $('extensions-lab-subtitle').textContent=locale.subtitle;
 $('extensions-lab-choice-label').textContent=locale.choice;
 $('extensions-lab-source-label').textContent=locale.source;
 $('extensions-lab-preview-label').textContent=locale.preview;
 $('extensions-lab-checks-label').textContent=locale.requirements;
 $('extensions-lab-example').textContent=locale.example;
 $('extensions-lab-reset').textContent=locale.reset;
 $('extensions-lab-close').textContent=locale.close;
 $('extensions-lab-note').textContent=locale.note;
 const select=$('extensions-lab-select');select.replaceChildren();
 for(const item of EXTENSIONS_LABS){
  const option=document.createElement('option');option.value=item.id;
  option.textContent=locale.entry[item.id].title;select.append(option);
 }
 renderSelected();
}
function close(){
 $('extensions-lab-modal').classList.add('hidden');
 if(previousFocus?.isConnected)previousFocus.focus();
 previousFocus=null;
}
function open(){
 previousFocus=document.activeElement;
 $('extensions-lab-modal').classList.remove('hidden');
 renderExtensionsLabLanguage();
 $('extensions-lab-select').focus();
}
export function initExtensionsLab({closeContents}={}){
 $('extensions-lab-open').addEventListener('click',()=>{
  closeContents?.();
  open();
 });
 $('extensions-lab-close').addEventListener('click',close);
 $('extensions-lab-modal').addEventListener('click',event=>{
  if(event.target===$('extensions-lab-modal'))close();
 });
 $('extensions-lab-select').addEventListener('change',event=>{
  const id=event.target.value;
  if(!EXTENSIONS_LABS.some(lab=>lab.id===id))return;
  state.extensionsLabCurrent=id;save();renderSelected();
 });
 $('extensions-lab-source').addEventListener('input',event=>{
  state.extensionsLabDrafts[selected().id]=event.target.value;
  save();checkLive();
 });
 $('extensions-lab-example').addEventListener('click',()=>{
  const lab=selected();
  state.extensionsLabDrafts[lab.id]=lab.example;
  $('extensions-lab-source').value=lab.example;save();checkLive();
  $('extensions-lab-source').focus();
 });
 $('extensions-lab-reset').addEventListener('click',()=>{
  delete state.extensionsLabDrafts[selected().id];
  $('extensions-lab-source').value=selected().starter;
  save();checkLive();$('extensions-lab-source').focus();
 });
 document.addEventListener('keydown',event=>{
  if(!isOpen())return;
  if(event.key==='Escape'){event.preventDefault();close();return;}
  if(event.key!=='Tab')return;
  const focusable=[...$('extensions-lab-modal').querySelectorAll('button:not([disabled]),select:not([disabled]),textarea:not([disabled])')];
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 renderExtensionsLabLanguage();
}
