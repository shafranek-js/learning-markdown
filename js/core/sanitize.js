import {filterAdvancedClasses} from './advanced-presets.js';
// Offline-safe HTML allowlist. Discard potentially executable elements rather than unwrapping them.
// When DOMPurify is present, preview.js uses it; this is the bundled safe fallback.
const TAGS=new Set('p br h1 h2 h3 h4 h5 h6 strong b em i u sup sub mark details summary del s strike blockquote pre code ul ol li input a img table thead tbody tfoot tr th td hr span div'.split(' '));
const DROP=new Set('script style iframe object embed svg math form button textarea select link meta base template noscript audio video canvas'.split(' '));
const VOID=new Set(['br','hr','img','input']);
const urlOK=(url,forImage)=>{const str=(url||'').trim().replace(/[\x00-\x20\x7f]/g,'');if(!str)return false;if(str.startsWith('#')&&!forImage)return true;
 try {const u=new URL(str,location.href);if(/^(https?:)$/.test(u.protocol))return true;if(!forImage&&u.protocol==='mailto:')return true;return false;}catch{return false;}};
export function sanitizeHTML(html){
 const doc=new DOMParser().parseFromString(html,'text/html');const result=document.createElement('div');
 function visit(node,parent){
  if(node.nodeType===Node.TEXT_NODE){parent.appendChild(document.createTextNode(node.textContent));return;}
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  const tag=node.tagName.toLowerCase();if(DROP.has(tag))return;
  if(!TAGS.has(tag)){[...node.childNodes].forEach(c=>visit(c,parent));return;}
  const el=document.createElement(tag);
  if(tag==='a'&&urlOK(node.getAttribute('href'),false)){el.setAttribute('href',node.getAttribute('href'));el.setAttribute('rel','noopener noreferrer');el.setAttribute('target','_blank');}
  if(tag==='img'&&urlOK(node.getAttribute('src'),true)){el.setAttribute('src',node.getAttribute('src'));el.setAttribute('loading','lazy');el.setAttribute('alt',node.getAttribute('alt')||'');}
  if(tag==='input'){if(node.getAttribute('type')!=='checkbox')return;el.setAttribute('type','checkbox');el.disabled=true;if(node.checked)el.checked=true;}
  if(['td','th'].includes(tag)){for(const name of ['colspan','rowspan']){const value=Number(node.getAttribute(name));if(Number.isInteger(value)&&value>0&&value<=20)el.setAttribute(name,String(value));}}
  if(tag==='code'){const cls=node.getAttribute('class')||'';if(/^language-[\w-]{1,30}$/.test(cls))el.className=cls;}
  if(['span','div'].includes(tag)){
   const safe=filterAdvancedClasses(node.getAttribute('class')||'');
   if(safe)el.className=safe;
  }
  if(!VOID.has(tag)){[...node.childNodes].forEach(c=>visit(c,el));}
  parent.appendChild(el);
 }
 [...doc.body.childNodes].forEach(n=>visit(n,result));return result.innerHTML;
}
