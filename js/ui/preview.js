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
 return window.DOMPurify ? window.DOMPurify.sanitize(raw,{USE_PROFILES:{html:true},FORBID_TAGS:['style','iframe','form'],FORBID_ATTR:['style']}) : sanitizeHTML(raw);
}
export function updatePreview(text){lastHtml=markdownToHTML(text);document.getElementById('markdown-preview').innerHTML=lastHtml;document.getElementById('raw-html-preview').textContent=lastHtml.trim();}
export const currentHtml=()=>lastHtml;
