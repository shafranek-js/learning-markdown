import {state} from '../core/state.js';
import {mermaidText,mermaidSourceProblem,MAX_MERMAID_BLOCKS} from '../data/mermaid-diagrams.js';
import {safeMermaidSvgImage} from '../core/mermaid-safe-svg.js';

let enginePromise=null,renderQueue=Promise.resolve(),version=0,renderId=0,timer=null;
let cached=new Map();
// Mermaid is requested only for detected mermaid code blocks. It is pinned and
// bundled by Vite, never fetched from a CDN or inserted as executable SVG.
function getEngine(){
 if(!enginePromise)enginePromise=import('mermaid').then(mod=>{
  const engine=mod.default;
  engine.initialize({
   startOnLoad:false,securityLevel:'strict',htmlLabels:false,
   maxTextSize:4000,maxEdges:100,suppressErrorRendering:true,
   logLevel:'fatal',theme:'neutral',flowchart:{htmlLabels:false,useMaxWidth:true},
   secure:['securityLevel','secure','startOnLoad','maxTextSize','maxEdges',
    'suppressErrorRendering','htmlLabels','theme','flowchart']
  });
  return engine;
 }).catch(error=>{enginePromise=null;throw error;});
 return enginePromise;
}
const css='mermaid-preview-card';
function statusText(key,index){
 const tr=mermaidText(state.lang);
 return (tr[key]||tr.invalid)+' '+index;
}
function showError(item,reason){
 if(!item.container.isConnected)return;
 item.card.dataset.mermaidStatus='error';
 item.label.textContent=statusText(reason==='oversize'||reason==='directive'||reason==='unsupported'||reason==='limited'?reason:'invalid',item.index);
 item.source.hidden=false;
}
function makeCard(pre,index,code){
 const card=document.createElement('div');card.className=css;
 card.dataset.mermaidIndex=String(index);
 card.dataset.mermaidStatus='pending';
 card.setAttribute('role','group');card.setAttribute('aria-label',statusText('done',index));
 const label=document.createElement('p');label.className='mermaid-preview-status';
 label.setAttribute('aria-live','polite');label.textContent=statusText('pending',index);
 const output=document.createElement('div');output.className='mermaid-preview-image';
 const toggle=document.createElement('button');toggle.type='button';
 toggle.className='mermaid-preview-source-toggle';toggle.textContent=mermaidText(state.lang).retry;
 toggle.hidden=true;
 toggle.addEventListener('click',()=>{
  const visible=pre.hidden;
  pre.hidden=!visible;
  toggle.setAttribute('aria-expanded',String(visible));
 });
 pre.after(card);card.append(label,output,toggle);
 return {container:pre.parentElement,source:pre,card,label,output,toggle,index,code};
}
function complete(item,dataUri){
 if(!item.card.isConnected)return;
 const img=document.createElement('img');
 img.alt=statusText('done',item.index);img.src=dataUri;img.decoding='async';
 img.referrerPolicy='no-referrer';img.className='mermaid-preview-diagram';
 item.output.replaceChildren(img);
 item.label.textContent=statusText('done',item.index);
 item.card.dataset.mermaidStatus='ready';
 item.source.hidden=true;item.toggle.hidden=false;
 item.toggle.setAttribute('aria-expanded','false');
}
async function renderOne(item,revision){
 if(revision!==version||!item.card.isConnected)return;
 const cache=cached.get(item.code);
 if(cache){complete(item,cache);return;}
 const host=document.createElement('div');
 host.className='mermaid-render-workspace';host.setAttribute('aria-hidden','true');
 host.style.cssText='position:fixed;left:-100000px;top:0;width:900px;visibility:hidden;pointer-events:none';
 document.body.append(host);
 try{
  const mermaid=await getEngine();
  if(revision!==version||!item.card.isConnected)return;
  // Mermaid render mutates document during layout. Keep calls serialized.
  const result=await mermaid.render('md-mermaid-'+(++renderId),item.code,host);
  const safe=safeMermaidSvgImage(result.svg);
  if(revision!==version||!item.card.isConnected)return;
  cached.set(item.code,safe);
  if(cached.size>24)cached.delete(cached.keys().next().value);
  complete(item,safe);
 }catch(error){
  if(revision!==version)return;
  // Display the original fenced code on syntax errors, never raw parser HTML.
  showError(item,'invalid');
 }finally{host.remove();}
}
export function scheduleMermaidPreview(preview){
 ++version;
 if(timer!==null){clearTimeout(timer);timer=null;}
 const revision=version,blocks=[...preview.querySelectorAll('pre > code.language-mermaid')];
 if(!blocks.length)return;
 const items=blocks.map((node,i)=>{
  const pre=node.parentElement,index=i+1,code=node.textContent;
  return makeCard(pre,index,code);
 });
 for(const item of items){
  if(item.index>MAX_MERMAID_BLOCKS){showError(item,'limited');continue;}
  const reason=mermaidSourceProblem(item.code);
  if(reason){showError(item,reason);continue;}
  const cachedSvg=cached.get(item.code);
  if(cachedSvg){complete(item,cachedSvg);}
 }
 timer=setTimeout(()=>{
  timer=null;
  for(const item of items){
   if(item.index>MAX_MERMAID_BLOCKS||mermaidSourceProblem(item.code)||cached.has(item.code))continue;
   renderQueue=renderQueue.catch(()=>{}).then(()=>renderOne(item,revision));
  }
 },300);
}
