// Render Mermaid SVG ONLY as an inert image, never as app DOM/innerHTML.
// SVG images do not execute scripts; fail closed on active nodes or resources.
// Only static SVG graphics and constrained filter primitives emitted by Mermaid.
// No scripts, animations, HTML foreignObjects, embedded images or active links.
const SVG_TAGS=new Set([
 'svg','g','defs','style','path','rect','circle','ellipse','line','polyline',
 'polygon','text','tspan','title','desc','marker','clippath','lineargradient','stop',
 'filter','fegaussianblur','feoffset','fecolormatrix','fecomposite','feblend',
 'femerge','femergenode','feflood','symbol','use','mask','pattern'
]);
const DANGEROUS_CSS=/(?:@import\b|@font-face\b|expression\s*\(|behavior\s*:|url\s*\(\s*(?!['"]?#))/i;
const REMOTE_VALUE=/(?:javascript\s*:|data\s*:|https?\s*:|url\s*\(\s*(?!['"]?#))/i;
const MAX_SVG_LENGTH=450000;
export function safeMermaidSvgImage(svg){
 if(typeof svg!=='string'||svg.length>MAX_SVG_LENGTH||svg.length<40)
  throw new Error('Diagram SVG exceeds the supported size.');
 const doc=new DOMParser().parseFromString(svg,'image/svg+xml');
 const root=doc.documentElement;
 if(!root||root.localName!=='svg'||doc.querySelector('parsererror'))
  throw new Error('Invalid Mermaid SVG.');
 for(const element of [root,...root.querySelectorAll('*')]){
  if(!SVG_TAGS.has(element.localName.toLowerCase()))throw new Error('Unsupported SVG element: '+element.localName);
  for(const attribute of [...element.attributes]){
   const name=attribute.name.toLowerCase(),value=attribute.value;
   if(name==='xmlns'&&value==='http://www.w3.org/2000/svg')continue;
   if(name==='xmlns:xlink'&&value==='http://www.w3.org/1999/xlink')continue;
   // SVG symbols may be reused within this one inert image; never external URLs.
   if(element.localName.toLowerCase()==='use'&&['href','xlink:href'].includes(name)
    &&/^#[a-zA-Z][\\w:-]{0,127}$/.test(value))continue;
   if(name.startsWith('on')||name==='href'||name==='xlink:href'||name==='src'
    ||name==='xml:base'||name==='formaction'
    ||REMOTE_VALUE.test(value)||name==='style'&&DANGEROUS_CSS.test(value))
    throw new Error('Unsafe SVG attribute.');
  }
  if(element.localName.toLowerCase()==='style'&&DANGEROUS_CSS.test(element.textContent))
   throw new Error('Unsafe SVG stylesheet.');
 }
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(root));
}
