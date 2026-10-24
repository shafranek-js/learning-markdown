import {state} from '../core/state.js';
import {MERMAID_TEMPLATES,mermaidText} from '../data/mermaid-diagrams.js';
const $=id=>document.getElementById(id);
let returnFocus=null;
function renderSample(){
 const template=MERMAID_TEMPLATES.find(t=>t.id===$('mermaid-dialog-type').value)||MERMAID_TEMPLATES[0];
 $('mermaid-dialog-source').textContent=template.code;
}
export function renderMermaidDialogLanguage(){
 const labels=mermaidText(state.lang);
 $('mermaid-dialog-trigger').textContent=labels.button;
 $('mermaid-dialog-trigger').title=labels.help;
 $('mermaid-dialog-title').textContent=labels.title;
 $('mermaid-dialog-help').textContent=labels.help;
 $('mermaid-dialog-type-label').textContent=labels.type;
 $('mermaid-dialog-close').textContent=labels.cancel;
 $('mermaid-dialog-insert').textContent=labels.insert;
 const select=$('mermaid-dialog-type'),previous=select.value||MERMAID_TEMPLATES[0].id;
 select.replaceChildren();
 for(const template of MERMAID_TEMPLATES){
  const option=document.createElement('option');
  option.value=template.id;option.textContent=labels[template.id];select.append(option);
 }
 select.value=previous;renderSample();
}
export function initMermaidDialog({insertSnippet}){
 const open=()=>{
  returnFocus=document.activeElement;
  renderMermaidDialogLanguage();
  $('mermaid-dialog').classList.remove('hidden');
  $('mermaid-dialog-type').focus();
 };
 const close=()=>{
  $('mermaid-dialog').classList.add('hidden');
  returnFocus?.focus();returnFocus=null;
 };
 $('mermaid-dialog-trigger').addEventListener('click',open);
 $('mermaid-dialog-close').addEventListener('click',close);
 $('mermaid-dialog').addEventListener('click',event=>{
  if(event.target===$('mermaid-dialog'))close();
 });
 $('mermaid-dialog-type').addEventListener('change',renderSample);
 $('mermaid-dialog-insert').addEventListener('click',()=>{
  const template=MERMAID_TEMPLATES.find(t=>t.id===$('mermaid-dialog-type').value);
  if(!template)return;
  close();
  insertSnippet('\n'+template.code+'\n');
 });
 document.addEventListener('keydown',event=>{
  if($('mermaid-dialog').classList.contains('hidden'))return;
  if(event.key==='Escape'){event.preventDefault();close();return;}
  if(event.key==='Tab'){
   const controls=[$('mermaid-dialog-type'),$('mermaid-dialog-close'),$('mermaid-dialog-insert')];
   const first=controls[0],last=controls[controls.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 });
 renderMermaidDialogLanguage();
}
