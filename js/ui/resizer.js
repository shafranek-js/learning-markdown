import {state,save} from '../core/state.js';
const $=id=>document.getElementById(id);
let mode='split';
export function applyRatio(){const editor=$('editor-pane'),container=$('ide-split-container'),gutter=$('resizer-editor-preview');const width=container.clientWidth||800;
 const min=Math.min(.45,200/Math.max(width-8,1));state.editorRatio=Math.max(min,Math.min(1-min,state.editorRatio));
 editor.style.width=`${(state.editorRatio*100).toFixed(2)}%`;
 $('split-ratio-indicator').textContent=`Split: ${Math.round(state.editorRatio*100)}% / ${100-Math.round(state.editorRatio*100)}%`;
}
export function showGuide(visible){
 const panel=$('theory-panel'),splitter=$('resizer-guide-editor'),toggle=$('theory-pane-toggle-btn');
 panel.classList.toggle('hidden',!visible);
 splitter.classList.toggle('hidden',!visible);
 splitter.classList.toggle('md:flex',visible);
 $('guide-indicator-dot').className='w-2 h-2 rounded-full '+(visible?'bg-emerald-400':'bg-slate-500');
 toggle.setAttribute('aria-pressed',String(visible));
 toggle.setAttribute('aria-expanded',String(visible));
 // The editor is a workspace when the guide is closed; course actions stay accessible via Contents.
 document.querySelectorAll('[data-course-ui]').forEach(element=>{element.hidden=!visible;});
}
export function setLayoutMode(next){mode=next;state.layoutMode=next;
 const isPreview=next==='preview',isHTML=next==='html',editor=$('editor-pane'),preview=$('preview-pane'),splitter=$('resizer-editor-preview');
 editor.classList.toggle('hidden',isPreview);preview.classList.remove('hidden');splitter.classList.toggle('hidden',isPreview);splitter.classList.toggle('md:flex',!isPreview);
 $('markdown-preview').classList.toggle('hidden',isHTML);$('raw-html-preview').classList.toggle('hidden',!isHTML);
 for(const key of ['split','preview','html']){const btn=$(`layout-${key}-btn`);btn.className='px-2.5 py-0.5 rounded-md text-xs font-semibold transition '+(next===key?'theme-accent-bg':'theme-muted hover:opacity-80');}
 applyRatio();save();
}
export function setMobileTab(tab){state.mobileTab=tab;const w=$('workspace-container');w.dataset.mobileTab=tab;
 document.querySelectorAll('[data-mobile-tab]').forEach(b=>{b.classList.toggle('selected',b.dataset.mobileTab===tab);b.setAttribute('aria-pressed',String(b.dataset.mobileTab===tab));});
 save();
}
export function initResizers(){
 const center=$('resizer-editor-preview'),guide=$('resizer-guide-editor'),ide=$('ide-split-container'),theory=$('theory-panel');
 function bind(gutter,update){let pointer=null,frame=0,lastX=0;
  gutter.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType!=='touch')return;if(window.matchMedia('(max-width:767px)').matches)return;pointer=e.pointerId;gutter.setPointerCapture(pointer);gutter.classList.add('is-dragging');document.body.classList.add('resizing-active');e.preventDefault();});
  gutter.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;lastX=e.clientX;if(frame)return;frame=requestAnimationFrame(()=>{frame=0;update(lastX);});});
  const stop=e=>{if(e.pointerId!==pointer)return;pointer=null;if(frame){cancelAnimationFrame(frame);frame=0;update(lastX);}gutter.classList.remove('is-dragging');document.body.classList.remove('resizing-active');save();};
  gutter.addEventListener('pointerup',stop);gutter.addEventListener('pointercancel',stop);
 }
 bind(center,x=>{if(mode!=='split'&&mode!=='html')return;const rect=ide.getBoundingClientRect();const avail=rect.width-8;if(avail<420)return;state.editorRatio=(x-rect.left)/avail;applyRatio();});
 bind(guide,x=>{const rect=$('workspace-container').getBoundingClientRect(),avail=rect.width;const w=Math.max(240,Math.min(620,Math.min(avail-410,x-rect.left)));state.guideWidth=w;theory.style.width=`${w}px`;});
 const reset=()=>{state.editorRatio=.5;applyRatio();save();};center.addEventListener('dblclick',reset);$('reset-split-btn').addEventListener('click',reset);
 window.addEventListener('resize',applyRatio);
 for(const b of document.querySelectorAll('[data-mobile-tab]'))b.addEventListener('click',()=>setMobileTab(b.dataset.mobileTab));
 theory.style.width=`${state.guideWidth}px`;applyRatio();
}
