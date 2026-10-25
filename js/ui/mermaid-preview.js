import {mermaidLabels} from '../data/mermaid-templates.js';

// The ordinary Markdown sanitizer intentionally excludes SVG. Diagram SVG
// is never added to innerHTML; after validation it is displayed ONLY as an
// image. No arbitrary SVG element or Mermaid event handler enters the DOM.
const SVG_NS='http://www.w3.org/2000/svg';
const BAD_SVG_TAGS=new Set([
 'script','foreignobject','iframe','object','embed','image','a','animate',
 'animatetransform','animatemotion','set','feimage','video','audio'
]);
let version=0;
let debounceTimer=null;
let mermaidModule=null;
let workQueue=Promise.resolve();
let exportRenderCounter=0;
const diagramCache=new Map();
const MAX_CACHED_DIAGRAMS=24;
function getMermaid(){
 if(!mermaidModule)mermaidModule=import('mermaid').then(({default:mermaid})=>{
  mermaid.initialize({
   startOnLoad:false,securityLevel:'strict',htmlLabels:false,
   suppressErrorRendering:true,maxTextSize:12000,maxEdges:200,
   flowchart:{htmlLabels:false,useMaxWidth:true},
   sequence:{useMaxWidth:true},theme:'default',
   secure:['securityLevel','htmlLabels','maxTextSize','maxEdges','suppressErrorRendering']
  });
  return mermaid;
 }).catch(error=>{mermaidModule=null;throw error;});
 return mermaidModule;
}
function unsafeCss(value){
 // SVG-as-image must not embed network resources, including quoted CSS URLs.
 // Only local fragment URLs, used by Mermaid for markers/clips, are allowed.
 if(/@import|@font-face|expression\s*\(|\\[0-9a-f]{1,6}\s?/i.test(value))return true;
 const urls=/url\s*\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi;
 let match,rest=value;
 while((match=urls.exec(value))){
  const fragment=(match[1]??match[2]??match[3]??'').trim();
  if(!/^#[\w.:-]+$/.test(fragment))return true;
  rest=rest.replace(match[0],'');
 }
 return /url\s*\(/i.test(rest);
}
export function mermaidImageDataUrl(svgText){
 if(typeof svgText!=='string'||svgText.length>1500000)throw new Error('SVG exceeds the allowed size');
 const doc=new DOMParser().parseFromString(svgText,'image/svg+xml');
 if(doc.querySelector('parsererror')||doc.documentElement?.localName!=='svg'
  ||doc.documentElement.namespaceURI!==SVG_NS)throw new Error('Invalid diagram SVG');
 for(const el of [doc.documentElement,...doc.documentElement.querySelectorAll('*')]){
  const tag=el.localName.toLowerCase();
  if(el.namespaceURI!==SVG_NS||BAD_SVG_TAGS.has(tag))throw new Error('Unsafe SVG element');
  if(tag==='style'&&unsafeCss(el.textContent||''))throw new Error('Unsafe SVG stylesheet');
  for(const attr of [...el.attributes]){
   const name=attr.name.toLowerCase(),value=attr.value.trim();
   if(name.startsWith('on')||name==='src'||name==='srcset'
    ||name==='externalresourcesrequired')throw new Error('Unsafe SVG attribute');
   if((name==='href'||name.endsWith(':href'))&&!/^#[\w.-]+$/.test(value))
    throw new Error('External SVG link is not allowed');
   if((name==='style'||value.includes('url('))&&unsafeCss(value))
    throw new Error('External SVG resource is not allowed');
  }
 }
 return 'data:image/svg+xml;charset=utf-8,'+
  encodeURIComponent(new XMLSerializer().serializeToString(doc.documentElement));
}
function validSource(source){
 // Reject frontmatter/config directives and interactive navigation until a
 // dedicated vetted parser policy exists. No document can relax strict mode.
 return source.length>0&&source.length<=12000
  &&!/(?:%%\s*\{|^\s*---\s*$|^\s*(?:click|href)\s+)/im.test(source);
}
function visibleError(status,locale,index,message){
 status.className='mermaid-status mermaid-error';
 status.setAttribute('role','alert');
 status.textContent=locale.error+' '+index+': '+String(message||'').slice(0,180);
}

const SVG_DATA_PREFIX='data:image/svg+xml;charset=utf-8,';
function trustedSvgSource(data){
 if(typeof data!=='string'||!data.startsWith(SVG_DATA_PREFIX))throw new Error('Not a validated SVG image');
 // Revalidate instead of treating arbitrary data: payloads as trusted HTML.
 const plain=decodeURIComponent(data.slice(SVG_DATA_PREFIX.length));
 const normalized=mermaidImageDataUrl(plain);
 return {svg:decodeURIComponent(normalized.slice(SVG_DATA_PREFIX.length)),uri:normalized};
}
// Re-export a single trust boundary for standalone document embedding.
export function validatedMermaidImageUrl(data){
 return trustedSvgSource(data).uri;
}
function saveDiagramBlob(blob,name){
 const url=URL.createObjectURL(blob);
 const link=document.createElement('a');
 link.href=url;link.download=name;
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),4000);
}
function exportSvg(data,index){
 const {svg}=trustedSvgSource(data);
 saveDiagramBlob(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),'mermaid-diagram-'+index+'.svg');
}
async function exportPng(data,index,scale){
 const {uri}=trustedSvgSource(data);
 const image=new Image();
 image.src=uri;
 await image.decode();
 const width=Math.ceil(image.naturalWidth*scale),height=Math.ceil(image.naturalHeight*scale);
 if(!width||!height||width>4096||height>4096||width*height>16000000)
  throw new Error('Diagram dimensions exceed PNG safety limits');
 const canvas=document.createElement('canvas');
 canvas.width=width;canvas.height=height;
 const context=canvas.getContext('2d');
 if(!context)throw new Error('Canvas unavailable');
 context.drawImage(image,0,0,width,height);
 const blob=await new Promise((resolve,reject)=>{
  canvas.toBlob(result=>result?resolve(result):reject(new Error('PNG encoding failed')),'image/png');
 });
 saveDiagramBlob(blob,'mermaid-diagram-'+index+'.png');
}

function showDiagram(pre,src,index,locale,status=null){
 // Preserve insertion position before the source <pre> moves into <details>.
 const anchor=status||document.createComment('Mermaid preview');
 if(!status)pre.before(anchor);
 const container=document.createElement('figure');
 container.className='mermaid-diagram';
 const controls=document.createElement('div');
 controls.className='mermaid-zoom-controls';
 controls.setAttribute('role','group');
 controls.setAttribute('aria-label',locale.alt+' '+index);
 const viewport=document.createElement('div');
 viewport.className='mermaid-viewport';
 const img=document.createElement('img');
 img.src=src;img.alt=locale.alt+' '+index;img.loading='eager';
 let zoom=1;
 const level=document.createElement('output');
 level.className='mermaid-zoom-level';
 level.setAttribute('aria-live','off');
 const reflect=()=>{
  img.style.width=Math.round(zoom*100)+'%';
  level.textContent=Math.round(zoom*100)+'%';
  minus.disabled=zoom<=0.75;
  plus.disabled=zoom>=2;
 };
 const makeButton=(text,label,action)=>{
  const button=document.createElement('button');
  button.type='button';button.textContent=text;
  button.setAttribute('aria-label',label);button.title=label;
  button.addEventListener('click',action);
  return button;
 };
 const minus=makeButton('−',locale.zoomOut,()=>{zoom=Math.max(.75,zoom-.25);reflect();});
 const plus=makeButton('+',locale.zoomIn,()=>{zoom=Math.min(2,zoom+.25);reflect();});
 const fit=makeButton(locale.fit,locale.fit,()=>{zoom=1;viewport.scrollLeft=0;reflect();});
 controls.append(minus,level,plus,fit);
 viewport.append(img);
 container.append(controls,viewport);
 reflect();
 const exports=document.createElement('div');
 exports.className='mermaid-export-controls';
 exports.setAttribute('role','group');
 exports.setAttribute('aria-label',locale.alt+' '+index);
 const message=document.createElement('output');
 message.className='mermaid-export-status';
 message.setAttribute('role','status');
 message.setAttribute('aria-live','polite');
 const safeAction=action=>async()=>{
  message.textContent='';
  try{await action();}
  catch(error){message.textContent=locale.exportError;console.warn('Mermaid export failed',error);}
 };
 const copy=makeButton(locale.copy,locale.copy,safeAction(async()=>{
  if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
  await navigator.clipboard.writeText(pre.textContent.trim());
  message.textContent=locale.copied;
 }));
 const svgButton=makeButton(locale.svg,locale.svg,safeAction(()=>exportSvg(src,index)));
 const scaleLabel=document.createElement('label');
 scaleLabel.className='mermaid-scale-label';
 scaleLabel.textContent=locale.scale;
 const scale=document.createElement('select');
 scale.setAttribute('aria-label',locale.scale);
 for(const value of [1,2]){
  const option=document.createElement('option');
  option.value=String(value);option.textContent=value+'×';
  scale.append(option);
 }
 scaleLabel.append(scale);
 const pngButton=makeButton(locale.png,locale.png,safeAction(()=>exportPng(src,index,Number(scale.value))));
 exports.append(copy,svgButton,scaleLabel,pngButton,message);
 container.append(exports);
 const details=document.createElement('details');
 details.className='mermaid-source';
 const summary=document.createElement('summary');
 summary.textContent=locale.source;
 details.append(summary,pre);
 container.append(details);
 anchor.replaceWith(container);
 // Moving the original code into <details> keeps a trustworthy source fallback.
 return container;
}
function rememberDiagram(source,src){
 if(diagramCache.has(source))diagramCache.delete(source);
 diagramCache.set(source,src);
 if(diagramCache.size>MAX_CACHED_DIAGRAMS)
  diagramCache.delete(diagramCache.keys().next().value);
}
async function renderOne(pre,source,index,ticket,locale){
 if(ticket!==version||!pre.isConnected)return;
 const status=document.createElement('p');
 status.className='mermaid-status';
 status.setAttribute('role','status');
 status.textContent=locale.loading+' '+index+'…';
 pre.before(status);
 try{
  if(!validSource(source))throw new Error('Source exceeds limits or contains an unsupported directive');
  const mermaid=await getMermaid();
  if(ticket!==version||!pre.isConnected)return;
  // Mermaid maintains temporary render elements, so serialize its calls.
  const {svg}=await mermaid.render('md-mermaid-'+ticket+'-'+index,source);
  if(ticket!==version||!pre.isConnected)return;
  const src=mermaidImageDataUrl(svg);
  rememberDiagram(source,src);
  showDiagram(pre,src,index,locale,status);
 }catch(error){
  if(ticket!==version||!pre.isConnected)return;
  visibleError(status,locale,index,error?.message);
 }
}
// Produce static, validated images independently of the (debounced) Live Preview.
// A click immediately after editing must export the NEW source, not a stale
// rendered image. Render jobs share Mermaid's serialized queue with Preview.
export async function renderMermaidExportImages(safeDocumentHtml){
 const host=document.createElement('div');
 host.innerHTML=safeDocumentHtml; // markdownToHTML() already strictly sanitized.
 const sources=[...host.querySelectorAll('pre > code.language-mermaid')]
  .map(code=>code.textContent.trim());
 const images=[],failures=[];
 for(const [index,source] of sources.entries()){
  try{
   if(index>=25)throw new Error('Document exceeds the 25-diagram export limit');
   if(!validSource(source))throw new Error('Unsafe or oversized Mermaid source');
   let uri=diagramCache.get(source);
   if(!uri){
    const id=++exportRenderCounter;
    const job=workQueue.catch(()=>{}).then(async()=>{
     const mermaid=await getMermaid();
     const {svg}=await mermaid.render('md-document-export-'+id,source);
     return mermaidImageDataUrl(svg);
    });
    workQueue=job.catch(()=>{});
    uri=await job;
    rememberDiagram(source,uri);
   }
   const mermaid=await getMermaid();
   const type=typeof mermaid.detectType==='function'?mermaid.detectType(source):'';
   images.push({source,uri:validatedMermaidImageUrl(uri),type});
  }catch(error){
   const detail=String(error?.message||'Rendering error').slice(0,180);
   images.push({source,error:detail});
   failures.push({index:index+1,message:detail});
  }
 }
 return {images,failures};
}
export function scheduleMermaidPreview(root,language='en'){
 const ticket=++version;
 clearTimeout(debounceTimer);
 const blocks=[...root.querySelectorAll('pre > code.language-mermaid')];
 if(!blocks.length)return;
 const locale=mermaidLabels(language),pending=[];
 for(const [i,code] of blocks.entries()){
  const pre=code.parentElement,source=code.textContent.trim();
  const cached=diagramCache.get(source);
  if(cached)showDiagram(pre,cached,i+1,locale);
  else pending.push({pre,source,index:i+1});
 }
 if(!pending.length)return;
 debounceTimer=setTimeout(()=>{
  for(const {pre,source,index} of pending){
   workQueue=workQueue.catch(()=>{}).then(()=>renderOne(pre,source,index,ticket,locale));
  }
 },300);
}
