import {sanitizeHTML} from '../core/sanitize.js';
let lastHtml='';
export function markdownToHTML(text){
 if(typeof window.marked?.parse!=='function')return `<pre>${text.replaceAll('&','&amp;').replaceAll('<','&lt;')}</pre>`;
 const raw=window.marked.parse(text,{gfm:true,breaks:true,headerIds:false,mangle:false});
 return window.DOMPurify ? window.DOMPurify.sanitize(raw,{USE_PROFILES:{html:true},FORBID_TAGS:['style','iframe','form'],FORBID_ATTR:['style']}) : sanitizeHTML(raw);
}
export function updatePreview(text){lastHtml=markdownToHTML(text);document.getElementById('markdown-preview').innerHTML=lastHtml;document.getElementById('raw-html-preview').textContent=lastHtml.trim();}
export const currentHtml=()=>lastHtml;
