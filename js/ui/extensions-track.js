import {state,save} from '../core/state.js';
import {markdownToHTML} from './preview.js';
import {EXTENSIONS_LABS,extensionsLabText,evaluateExtensionsLab} from '../data/extensions-track.js';
import {evaluateMermaidLab} from '../data/extensions-track-mermaid.js';
import {renderMermaidExportImages,validatedMermaidImageUrl} from './mermaid-preview.js';
import {mermaidLabels} from '../data/mermaid-templates.js';

const $=id=>document.getElementById(id);
const byId=id=>EXTENSIONS_LABS.find(item=>item.id===id) || EXTENSIONS_LABS[0];
let previousFocus=null;
let labRenderVersion=0,labRenderTimer=null;

function selected(){return byId(state.extensionsLabCurrent);}
function isOpen(){return !$('extensions-lab-modal').classList.contains('hidden');}

function showProgress(){
 const total=EXTENSIONS_LABS.length,completed=state.extensionsLabCompleted.length;
 $('extensions-lab-progress').textContent=completed+' / '+total;
 $('extensions-lab-open-progress').textContent=completed+' / '+total;
}

// Both output and validation use the same sanitized renderer as main Preview.
// No extension settings from the active core lesson are permitted to leak in.
function applyChecks(lab,checks){
 const locale=extensionsLabText(state.lang),entry=locale.entry[lab.id];
 const root=$('extensions-lab-checks');root.replaceChildren();
 checks.forEach((passed,index)=>{
  const li=document.createElement('li');
  const indicator=document.createElement('strong');
  indicator.textContent=passed?'✓ ':'○ ';
  const description=document.createElement('span');
  description.textContent=entry.checks[index];
  li.append(indicator,description);root.append(li);
 });
 const passed=checks.length===lab.checks.length&&checks.every(Boolean);
 $('extensions-lab-status').textContent=passed?locale.statusDone:locale.statusPending;
 if(passed&&!state.extensionsLabCompleted.includes(lab.id)){
  state.extensionsLabCompleted.push(lab.id);
  save();
 }
 showProgress();
}
// Validate Mermaid only after the actual parser/renderer returns a safe image.
// A pasted screenshot or a Mermaid snippet quoted inside a code example
// cannot earn completion. Ignore stale asynchronous work after every edit.
function checkLive(){
 const ticket=++labRenderVersion;
 clearTimeout(labRenderTimer);
 const lab=selected(),source=$('extensions-lab-source').value;
 const html=markdownToHTML(source,'gfm',{extensions:false,labFeatures:lab.labFeatures||[]});
 const preview=$('extensions-lab-preview');
 preview.innerHTML=html;
 if(!lab.mermaidType){
  applyChecks(lab,evaluateExtensionsLab(lab.id,html,source));
  return;
 }
 applyChecks(lab,[false,false]);
 if(preview.querySelectorAll('pre > code.language-mermaid').length!==1)return;
 labRenderTimer=setTimeout(async()=>{
  try{
   const {images}=await renderMermaidExportImages(html);
   if(ticket!==labRenderVersion||selected().id!==lab.id||
     $('extensions-lab-source').value!==source)return;
   const checks=evaluateMermaidLab(lab.id,html,images);
   const imageUrl=images[0]?.uri;
   if(imageUrl){
    const code=preview.querySelector('pre > code.language-mermaid');
    if(code){
     const pre=code.parentElement,placeholder=document.createComment('Mermaid lab');
     pre.before(placeholder);
     const figure=document.createElement('figure');
     figure.className='mermaid-diagram';
     const image=document.createElement('img');
     image.src=validatedMermaidImageUrl(imageUrl);
     image.alt=mermaidLabels(state.lang).alt;
     figure.append(image);
     const details=document.createElement('details');
     details.className='mermaid-source';
     const title=document.createElement('summary');
     title.textContent=mermaidLabels(state.lang).source;
     details.append(title,pre);
     figure.append(details);
     // Record the original position before moving <pre> into <details>.
     // The figure must be inserted at that same position.
     placeholder.replaceWith(figure);
    }
   }
   applyChecks(lab,checks);
  }catch(error){
   if(ticket===labRenderVersion){
    console.warn('Mermaid lab rendering failed',error);
    applyChecks(lab,[false,false]);
   }
  }
 },300);
}
function renderSelected(){
 const lab=selected(),locale=extensionsLabText(state.lang),entry=locale.entry[lab.id];
 $('extensions-lab-select').value=lab.id;
 $('extensions-lab-description').textContent=entry.description;
 $('extensions-lab-portability').textContent=locale.portability+': '+entry.portability;
 $('extensions-lab-source').value=Object.hasOwn(state.extensionsLabDrafts,lab.id)?state.extensionsLabDrafts[lab.id]:lab.starter;
 checkLive();
}
export function renderExtensionsLabLanguage(){
 const locale=extensionsLabText(state.lang);
 $('extensions-lab-open-label').textContent=locale.open;
 $('extensions-lab-title').textContent=locale.title;
 $('extensions-lab-subtitle').textContent=locale.subtitle;
 $('extensions-lab-choice-label').textContent=locale.choice;
 $('extensions-lab-source-label').textContent=locale.source;
 $('extensions-lab-preview-label').textContent=locale.preview;
 $('extensions-lab-checks-label').textContent=locale.requirements;
 $('extensions-lab-example').textContent=locale.example;
 $('extensions-lab-reset').textContent=locale.reset;
 $('extensions-lab-close').textContent=locale.close;
 $('extensions-lab-note').textContent=locale.note;
 const select=$('extensions-lab-select');select.replaceChildren();
 for(const item of EXTENSIONS_LABS){
  const option=document.createElement('option');option.value=item.id;
  option.textContent=locale.entry[item.id].title;select.append(option);
 }
 renderSelected();
}
function close(){
 ++labRenderVersion;clearTimeout(labRenderTimer);
 $('extensions-lab-modal').classList.add('hidden');
 if(previousFocus?.isConnected)previousFocus.focus();
 previousFocus=null;
}
function open(){
 // The launcher lives in a drawer that closes on open; restore visible focus.
 previousFocus=$('contents-toggle-btn');
 $('extensions-lab-modal').classList.remove('hidden');
 renderExtensionsLabLanguage();
 $('extensions-lab-select').focus();
}
export function initExtensionsLab({closeContents}={}){
 // Follow document-local anchors without replacing #lesson=... in the app route.
 $('extensions-lab-preview').addEventListener('click',event=>{
  const link=event.target.closest?.('a[href^="#"]');
  if(!link)return;
  let targetId;
  try{targetId=decodeURIComponent(link.getAttribute('href').slice(1));}catch{return;}
  if(!targetId||targetId.length>128)return;
  const target=[...$('extensions-lab-preview').querySelectorAll('[id]')].find(el=>el.id===targetId);
  if(target){event.preventDefault();target.scrollIntoView({block:'nearest'});}
 });
 $('extensions-lab-open').addEventListener('click',()=>{
  closeContents?.();
  open();
 });
 $('extensions-lab-close').addEventListener('click',close);
 $('extensions-lab-modal').addEventListener('click',event=>{
  if(event.target===$('extensions-lab-modal'))close();
 });
 $('extensions-lab-select').addEventListener('change',event=>{
  const id=event.target.value;
  if(!EXTENSIONS_LABS.some(lab=>lab.id===id))return;
  state.extensionsLabCurrent=id;save();renderSelected();
 });
 $('extensions-lab-source').addEventListener('input',event=>{
  state.extensionsLabDrafts[selected().id]=event.target.value;
  save();checkLive();
 });
 $('extensions-lab-example').addEventListener('click',()=>{
  const lab=selected();
  state.extensionsLabDrafts[lab.id]=lab.example;
  $('extensions-lab-source').value=lab.example;save();checkLive();
  $('extensions-lab-source').focus();
 });
 $('extensions-lab-reset').addEventListener('click',()=>{
  delete state.extensionsLabDrafts[selected().id];
  $('extensions-lab-source').value=selected().starter;
  save();checkLive();$('extensions-lab-source').focus();
 });
 document.addEventListener('keydown',event=>{
  if(!isOpen())return;
  if(event.key==='Escape'){event.preventDefault();close();return;}
  if(event.key!=='Tab')return;
  const focusable=[...$('extensions-lab-modal').querySelectorAll('button:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],input:not([disabled])')];
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 renderExtensionsLabLanguage();
}
