// Reviewed marked-footnote parser, isolated per invocation to keep the base
// CommonMark/GFM/Original renderer unchanged. Footnotes are NOT normative GFM.
import {Marked} from 'marked';
import markedFootnote from 'marked-footnote';

function canonicalizeFootnotes(raw){
 const parsed=new DOMParser().parseFromString(raw,'text/html');
 const section=parsed.querySelector('section[data-footnotes]');
 if(!section)return raw;
 const items=[...section.querySelectorAll('ol > li[id]')];
 if(!items.length)return raw;
 const existing=new Set([...parsed.querySelectorAll('[id]')]
  .filter(el=>!section.contains(el)&&!el.matches('sup > a[data-footnote-ref]'))
  .map(el=>el.id));
 const unique=base=>{
  let candidate=base,index=2;
  while(existing.has(candidate))candidate=base+'-'+index++;
  existing.add(candidate);
  return candidate;
 };
 const byOriginal=new Map();
 items.forEach((item,n)=>{
  const old=item.id;
  item.id=unique('fn-item-'+(n+1));
  byOriginal.set(old,{item,ordinal:n+1,refs:[]});
 });
 section.className='md-footnotes';
 section.removeAttribute('data-footnotes');
 const heading=section.querySelector('h2');
 if(heading){
  heading.className='fn-visually-hidden';
  heading.removeAttribute('id');
 }
 for(const link of parsed.querySelectorAll('sup > a[data-footnote-ref]')){
  const original=decodeURIComponent(link.getAttribute('href')?.slice(1)||'');
  const info=byOriginal.get(original) || byOriginal.get(link.getAttribute('href')?.slice(1));
  if(!info)continue;
  const index=info.refs.length+1;
  const refId=unique('fn-ref-'+info.ordinal+'-'+index);
  link.id=refId;
  link.href='#'+info.item.id;
  link.className='fn-ref';
  link.setAttribute('aria-label','Footnote '+info.ordinal+', reference '+index);
  link.removeAttribute('data-footnote-ref');
  link.removeAttribute('aria-describedby');
  info.refs.push(refId);
 }
 for(const info of byOriginal.values()){
  const backs=[...info.item.querySelectorAll('a[data-footnote-backref]')];
  for(let i=0;i<info.refs.length;i++){
   const back=backs[i]||parsed.createElement('a');
   back.className='fn-backref';
   back.setAttribute('href','#'+info.refs[i]);
   back.setAttribute('aria-label','Back to reference '+(i+1)+' of footnote '+info.ordinal);
   back.removeAttribute('data-footnote-backref');
   if(!backs[i]){back.textContent=' ↩';info.item.append(back);}
  }
  backs.slice(info.refs.length).forEach(el=>el.remove());
 }
 return parsed.body.innerHTML;
}
export function renderFootnotedMarkdown(source,options){
 // Never mutate the shared Marked instance. Plugin state is document-scoped.
 const parser=new Marked(markedFootnote({
  description:'Footnotes',backRefLabel:'Return to reference',
  prefixId:'footnote-',sectionClass:'footnotes'
 }));
 return canonicalizeFootnotes(parser.parse(source,options));
}
