import {filterAdvancedClasses} from './advanced-presets.js';
// Strict browser-DOM sanitizer for Markdown preview and exported HTML.
const TAGS=new Set('p br h1 h2 h3 h4 h5 h6 strong b em i u sup sub mark details summary del s strike blockquote pre code ul ol li input a img table thead tbody tfoot tr th td hr span div'.split(' '));
const DROP=new Set('script style iframe object embed svg math form button textarea select link meta base template noscript audio video canvas'.split(' '));
const VOID=new Set(['br','hr','img','input']);
const urlOK=(url,forImage)=>{const str=(url||'').trim().replace(/[\x00-\x20\x7f]/g,'');if(!str)return false;if(str.startsWith('#')&&!forImage)return true;
 try {const u=new URL(str,location.href);if(/^(https?:)$/.test(u.protocol))return true;if(!forImage&&u.protocol==='mailto:')return true;return false;}catch{return false;}};
export function sanitizeHTML(html){
 const usedIds=new Set();
 const doc=new DOMParser().parseFromString(html,'text/html');const result=document.createElement('div');
 function visit(node,parent){
  if(node.nodeType===Node.TEXT_NODE){parent.appendChild(document.createTextNode(node.textContent));return;}
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  const tag=node.tagName.toLowerCase();if(DROP.has(tag))return;
  if(!TAGS.has(tag)){[...node.childNodes].forEach(c=>visit(c,parent));return;}
  const el=document.createElement(tag);
  if(tag==='a'&&urlOK(node.getAttribute('href'),false)){
   const href=node.getAttribute('href');
   el.setAttribute('href',href);
   if(!href.startsWith('#')){el.setAttribute('rel','noopener noreferrer');el.setAttribute('target','_blank');}
  }
  if(tag==='img'&&urlOK(node.getAttribute('src'),true)){el.setAttribute('src',node.getAttribute('src'));el.setAttribute('loading','lazy');el.setAttribute('alt',node.getAttribute('alt')||'');}
  if(tag==='input'){if(node.getAttribute('type')!=='checkbox')return;el.setAttribute('type','checkbox');el.disabled=true;if(node.checked)el.checked=true;}
  if(['td','th'].includes(tag)){
   for(const name of ['colspan','rowspan']){
    const raw=node.getAttribute(name)||'';
    if(/^[1-9][0-9]?$/.test(raw)&&Number(raw)<=20)el.setAttribute(name,raw);
   }
  }
  if(tag==='ol'&&['1','a','A','i','I'].includes(node.getAttribute('type')))el.setAttribute('type',node.getAttribute('type'));
  if(['span','div','h1','h2','h3','h4','h5','h6'].includes(tag)){
   const id=node.getAttribute('id')||'';
   if(/^[a-z][a-z0-9_-]{0,63}$/.test(id)&&!usedIds.has(id)){el.id=id;usedIds.add(id);}
  }
  if(tag==='code'){const cls=node.getAttribute('class')||'';if(/^language-[\w-]{1,30}$/.test(cls))el.className=cls;}
  if(['span','div','table','td','th'].includes(tag)){
   const safe=filterAdvancedClasses(node.getAttribute('class')||'');
   if(safe)el.className=safe;
  }
  if(!VOID.has(tag)){[...node.childNodes].forEach(c=>visit(c,el));}
  parent.appendChild(el);
 }
 [...doc.body.childNodes].forEach(n=>visit(n,result));return result.innerHTML;
}
