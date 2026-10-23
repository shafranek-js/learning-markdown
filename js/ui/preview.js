import {sanitizeHTML} from '../core/sanitize.js';
import {marked} from 'marked';
import {state} from '../core/state.js';
import {area,applyEdit} from './editor.js';
import {scanTaskMarkers,switchTaskMarker} from '../core/task-markers.js';
import {syncTableEditorPreview} from './table-editor.js';
let lastHtml='';
export const DIALECT_OPTIONS={
 gfm:{gfm:true,pedantic:false,breaks:false},
 commonmark:{gfm:false,pedantic:false,breaks:false},
 original:{gfm:false,pedantic:true,breaks:false}
};
export function markdownToHTML(text,dialect=state.dialect){
 const options=DIALECT_OPTIONS[dialect]||DIALECT_OPTIONS.gfm;
 const raw=marked.parse(text,options);
 // Use the same strict class/attribute allowlist for every preview and export.
 return sanitizeHTML(raw);
}
function enableTaskInputs(preview,source){
 if(state.dialect!=='gfm')return;
 const markers=scanTaskMarkers(source);
 const inputs=[...preview.querySelectorAll('input[type="checkbox"]')];
 // A manually supplied HTML checkbox must not shift indices for Markdown tasks.
 if(inputs.some(input=>!input.closest('li')))return;
 // Never edit on an ambiguous mapping (including source HTML inputs).
 if(!markers.length||markers.length!==inputs.length||!markers.every((marker,i)=>marker.checked===inputs[i].checked))return;
 inputs.forEach((input,i)=>{
  input.disabled=false;
  input.dataset.taskIndex=String(i);
  input.setAttribute('aria-label',input.closest('li')?.textContent?.trim().slice(0,160)||'Task');
 });
}
function handleTaskChange(event){
 const input=event.target;
 if(!(input instanceof HTMLInputElement)||input.type!=='checkbox'||!input.hasAttribute('data-task-index'))return;
 const index=Number(input.dataset.taskIndex),a=area(),source=a.value;
 const markers=scanTaskMarkers(source);
 if(state.dialect!=='gfm'||!Number.isInteger(index)||index<0||index>=markers.length
  ||markers.length!==document.querySelectorAll('#markdown-preview input[data-task-index]').length){
  updatePreview(source);return;
 }
 const edited=switchTaskMarker(source,markers[index],input.checked);
 if(edited===null){updatePreview(source);return;}
 if(edited===source)return;
 applyEdit(edited,a.selectionStart,a.selectionEnd,{focus:false});
 document.querySelector('#markdown-preview input[data-task-index="'+index+'"]')?.focus({preventScroll:true});
}
// Links to a document anchor must not overwrite the app's lesson route in location.hash.
export function initPreviewAnchors(){
 document.getElementById('markdown-preview').addEventListener('change',handleTaskChange);
 document.getElementById('markdown-preview').addEventListener('click',event=>{
  const link=event.target.closest?.('a[href^="#"]');
  if(!link)return;
  const id=link.getAttribute('href').slice(1);
  if(!/^[a-z][a-z0-9_-]{0,63}$/.test(id))return;
  const target=[...document.getElementById('markdown-preview').querySelectorAll('[id]')].find(el=>el.id===id);
  if(target){event.preventDefault();target.scrollIntoView({block:'nearest',behavior:'smooth'});}
 });
}
export function updatePreview(text){lastHtml=markdownToHTML(text);const target=document.getElementById('markdown-preview');target.innerHTML=lastHtml;enableTaskInputs(target,text);syncTableEditorPreview();document.getElementById('raw-html-preview').textContent=lastHtml.trim();}
export const currentHtml=()=>lastHtml;
