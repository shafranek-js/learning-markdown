import {filterAdvancedClasses} from './advanced-presets.js';
// Strict browser-DOM sanitizer for Markdown preview and exported HTML.
const TAGS=new Set('p br h1 h2 h3 h4 h5 h6 section figure figcaption strong b em i u sup sub mark details summary del s strike blockquote pre code ul ol li dl dt dd input a img table caption thead tbody tfoot tr th td hr span div'.split(' '));
const DROP=new Set('script style iframe object embed svg math form button textarea select link meta base template noscript audio video canvas'.split(' '));
const VOID=new Set(['br','hr','img','input']);
// Strict Unicode-aware ID shape for safe multilingual heading anchors.
const SAFE_ID=/^\p{L}[\p{L}\p{M}\p{N}_-]{0,63}$/u;
// Fixed classes emitted by registered highlight.js grammars.
// Only meaningful within <pre><code>, never arbitrary user-defined CSS.
const CODE_TOKEN_CLASSES=new Set('keyword built_in type literal number string regexp subst symbol variable title section comment meta attr attribute name tag selector-tag selector-id selector-class selector-attr selector-pseudo selector-pseudo-class selector-pseudo-element property params function class operator punctuation template-variable template-tag link bullet addition deletion quote formula emphasis strong doctag'.split(' ').map(x=>'hljs-'+x));

const urlOK=(url,forImage)=>{const str=(url||'').trim().replace(/[\x00-\x20\x7f]/g,'');if(!str)return false;if(str.startsWith('#')&&!forImage)return true;
 try {const u=new URL(str,location.href);if(/^(https?:)$/.test(u.protocol))return true;if(!forImage&&u.protocol==='mailto:')return true;return false;}catch{return false;}};
export function sanitizeHTML(html){
 const usedIds=new Set();
 const doc=new DOMParser().parseFromString(html,'text/html');const result=document.createElement('div');
 function visit(node,parent){
  if(node.nodeType===Node.TEXT_NODE){parent.appendChild(document.createTextNode(node.textContent));return;}
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  const tag=node.tagName.toLowerCase();if(DROP.has(tag))return;
  // Never retain an inert-looking image element with a rejected URL.
  if(tag==='img'&&!urlOK(node.getAttribute('src'),true))return;
  if(!TAGS.has(tag)){[...node.childNodes].forEach(c=>visit(c,parent));return;}
  const el=document.createElement(tag);
  if(tag==='a'&&urlOK(node.getAttribute('href'),false)){
   const href=node.getAttribute('href');
   el.setAttribute('href',href);
   if(!href.startsWith('#')){el.setAttribute('rel','noopener noreferrer');el.setAttribute('target','_blank');}
  }
  if(tag==='img'&&urlOK(node.getAttribute('src'),true)){
   el.setAttribute('src',node.getAttribute('src'));
   el.setAttribute('loading','lazy');
   el.setAttribute('alt',(node.getAttribute('alt')||'').slice(0,400));
   const dimension=value=>{
    if(!/^[1-9][0-9]{0,3}$/.test(value||''))return null;
    const number=Number(value);
    return number>=1&&number<=1600?number:null;
   };
   const width=dimension(node.getAttribute('width'));
   const height=dimension(node.getAttribute('height'));
   if(width!==null)el.setAttribute('width',String(width));
   if(height!==null)el.setAttribute('height',String(height));
   // The only generated inline style is a validated integer pixel height.
   // Raw style attributes are always discarded.
   if(height!==null&&parent.tagName==='FIGURE'&&parent.classList.contains('af-figure-fixed'))
    el.style.height=height+'px';
  }
  if(tag==='input'){
   if(node.getAttribute('type')!=='checkbox')return;
   el.setAttribute('type','checkbox');
   el.setAttribute('disabled','');
   if(node.hasAttribute('checked'))el.setAttribute('checked','');
  }
  if(['td','th'].includes(tag)){
   // GFM emits align="left|center|right". Preserve only those exact
   // semantics; arbitrary inline styles and malformed values stay forbidden.
   const align=node.getAttribute('align');
   if(['left','center','right'].includes(align))el.setAttribute('align',align);
   for(const name of ['colspan','rowspan']){
    const raw=node.getAttribute(name)||'';
    if(/^[1-9][0-9]?$/.test(raw)&&Number(raw)<=20)el.setAttribute(name,raw);
   }
  }
  if(tag==='th'){
   const scope=node.getAttribute('scope');
   if(['auto','col','row','colgroup','rowgroup'].includes(scope))
    el.setAttribute('scope',scope);
  }
  if(tag==='ol'){
   // List continuations created by source-safe partial conversions use a
   // bounded positive start; never pass arbitrary attributes through.
   const start=node.getAttribute('start');
   if(start&&/^[1-9][0-9]{0,4}$/.test(start)&&Number(start)<=99999)
    el.setAttribute('start',start);
   const type=node.getAttribute('type');
   const styles={'1':'af-list-decimal','a':'af-list-lower-alpha','A':'af-list-upper-alpha',
    'i':'af-list-lower-roman','I':'af-list-upper-roman'};
   if(Object.prototype.hasOwnProperty.call(styles,type)){
    el.setAttribute('type',type);
    // Explicitly generated classes avoid CSS selector case-folding differences.
    el.classList.add(styles[type]);
   }
  }
  if(['span','div','h1','h2','h3','h4','h5','h6','a','li'].includes(tag)){
   const id=node.getAttribute('id')||'';
   if(SAFE_ID.test(id)&&id===id.toLocaleLowerCase('en')&&!usedIds.has(id)){el.id=id;usedIds.add(id);}
  }
  if(tag==='section'&&node.getAttribute('class')==='md-footnotes')el.className='md-footnotes';
  if(tag==='dl'&&node.getAttribute('class')==='md-definition-list')el.className='md-definition-list';
  if(tag==='figure'){
   const classes=(node.getAttribute('class')||'').split(/\s+/);
   if(classes.includes('af-figure'))
    el.className=classes.includes('af-figure-fixed')?'af-figure af-figure-fixed':'af-figure';
  }
  if(tag==='h2'&&node.getAttribute('class')==='fn-visually-hidden')el.className='fn-visually-hidden';
  if(tag==='a'&&['fn-ref','fn-backref'].includes(node.getAttribute('class'))){
   el.className=node.getAttribute('class');
   const label=node.getAttribute('aria-label');
   if(label&&label.length<=120)el.setAttribute('aria-label',label);
  }
  if(tag==='code'){const cls=node.getAttribute('class')||'';if(/^language-[\w-]{1,30}$/.test(cls))el.className=cls;}
  if(['span','div','table','td','th'].includes(tag)){
   const classes=node.getAttribute('class')||'';
   const safe=filterAdvancedClasses(classes);
   // Build-tree parents are detached until recursion completes; closest('code')
   // remains valid even before the <code> is appended to its <pre>.
   // Token classes only receive styling under pre > code in preview CSS.
   const tokens=tag==='span'&&parent.closest('code')
    ?[...new Set(classes.split(/\s+/).filter(x=>CODE_TOKEN_CLASSES.has(x)))].join(' ')
    :'';
   if(safe||tokens)el.className=[safe,tokens].filter(Boolean).join(' ');
  }
  if(!VOID.has(tag)){[...node.childNodes].forEach(c=>visit(c,el));}
  parent.appendChild(el);
 }
 [...doc.body.childNodes].forEach(n=>visit(n,result));return result.innerHTML;
}
