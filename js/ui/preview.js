import {sanitizeHTML} from '../core/sanitize.js';
import {marked} from 'marked';
import {state} from '../core/state.js';
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
// Links to a document anchor must not overwrite the app's lesson route in location.hash.
export function initPreviewAnchors(){
 document.getElementById('markdown-preview').addEventListener('click',event=>{
  const link=event.target.closest?.('a[href^="#"]');
  if(!link)return;
  const id=link.getAttribute('href').slice(1);
  if(!/^[a-z][a-z0-9_-]{0,63}$/.test(id))return;
  const target=[...document.getElementById('markdown-preview').querySelectorAll('[id]')].find(el=>el.id===id);
  if(target){event.preventDefault();target.scrollIntoView({block:'nearest',behavior:'smooth'});}
 });
}
export function updatePreview(text){lastHtml=markdownToHTML(text);document.getElementById('markdown-preview').innerHTML=lastHtml;document.getElementById('raw-html-preview').textContent=lastHtml.trim();}
export const currentHtml=()=>lastHtml;
