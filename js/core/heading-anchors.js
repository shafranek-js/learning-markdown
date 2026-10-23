// Generate deterministic, safe heading IDs after the Markdown parser and
// sanitizer. This is output decoration, never a mutation of Markdown source.
const SAFE_ID=/^\p{L}[\p{L}\p{M}\p{N}_-]{0,63}$/u;
const MAX_BASE=52;
export const isSafeHeadingId=id=>typeof id==='string'&&SAFE_ID.test(id)&&id===id.toLocaleLowerCase('en');

export function headingSlug(text){
 const normalized=String(text||'').normalize('NFKC').toLocaleLowerCase('en');
 let slug=normalized.replace(/[^\p{L}\p{M}\p{N}]+/gu,'-')
  .replace(/^-+|-+$/g,'');
 slug=Array.from(slug).slice(0,MAX_BASE).join('').replace(/-+$/,'');
 if(!slug)return 'section';
 if(!/^\p{L}/u.test(slug))slug='section-'+slug;
 return slug;
}
const CUSTOM_SUFFIX=/\s+\{#([\p{L}][\p{L}\p{M}\p{N}_-]{0,63})\}\s*$/u;
export function addHeadingAnchors(safeHTML,{customIds=false}={}){
 if(!/<h[1-6](?:\s|>)/i.test(safeHTML))return safeHTML;
 const root=document.createElement('div');
 root.innerHTML=safeHTML; // Already sanitized before entering.
 const headings=[...root.querySelectorAll('h1,h2,h3,h4,h5,h6')]
  .filter(h=>!h.closest('section.md-footnotes'));
 // Reserve every pre-existing ID (including footnotes and advanced HTML).
 const used=new Set([...root.querySelectorAll('[id]')].map(el=>el.id));
 for(const heading of headings){
  let requested=null;
  if(customIds){
   const tail=heading.lastChild;
   if(tail?.nodeType===3){
    const match=tail.textContent.match(CUSTOM_SUFFIX);
    if(match&&isSafeHeadingId(match[1])){
     requested=match[1];
     tail.textContent=tail.textContent.slice(0,match.index);
    }
   }
  }
  if(heading.id&&isSafeHeadingId(heading.id)&&!requested)continue;
  // When explicit custom syntax replaces a raw heading ID, free its old ID.
  if(heading.id){used.delete(heading.id);heading.removeAttribute('id');}
  const base=requested||headingSlug(heading.textContent);
  let candidate=base,num=2;
  while(used.has(candidate)||!isSafeHeadingId(candidate)){
   const suffix='-'+num++;
   candidate=Array.from(base).slice(0,64-suffix.length).join('')+suffix;
  }
  heading.id=candidate;
  used.add(candidate);
 }
 return root.innerHTML;
}
export function headingOutline(root){
 if(!root)return [];
 return [...root.querySelectorAll('h1,h2,h3,h4,h5,h6')]
  .filter(node=>!node.closest('section.md-footnotes')&&isSafeHeadingId(node.id))
  .map(node=>({
   id:node.id,
   level:Number(node.tagName[1]),
   text:node.textContent.replace(/\s+/g,' ').trim()||'Section'
  }));
}
const escapeLabel=label=>label.replace(/\\/g,'\\\\').replace(/([\[\]*_])/g,'\\$1');
export function staticMarkdownTOC(headings,maxDepth=6){
 const visible=headings.filter(h=>h.level<=maxDepth&&isSafeHeadingId(h.id));
 if(!visible.length)return '';
 const min=Math.min(...visible.map(h=>h.level));
 return visible.map(h=>{
  const spaces='  '.repeat(Math.max(0,h.level-min));
  return spaces+'- ['+escapeLabel(h.text)+'](#'+h.id+')';
 }).join('\n')+'\n\n';
}
