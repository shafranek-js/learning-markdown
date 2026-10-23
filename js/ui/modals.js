import {LESSON_CORE} from '../data/lessons.js';
import {cheats,titles} from '../data/cheatsheet.js';
import {state,save} from '../core/state.js';
import {ui,t} from '../i18n/index.js';
import {insertSnippet} from './toolbar.js';
const $=id=>document.getElementById(id);
export function toggleContents(open){$('contents-drawer').classList.toggle('-translate-x-full',!open);$('contents-backdrop').classList.toggle('hidden',!open);}
export function toggleModal(id,open){$(id).classList.toggle('hidden',!open);}
export function renderCheats(){const root=$('cheatsheet-grid');if(!root)return;root.replaceChildren();for(let i=0;i<cheats.length;i++){
 const item=cheats[i],card=document.createElement('div');card.className='p-3 rounded-xl theme-panel-alt border theme-border';
 const header=document.createElement('div');header.className='flex justify-between gap-2 items-center mb-2';
 const heading=document.createElement('strong');heading.textContent=`${i+1}. ${titles[state.lang][i]}`+(state.dialect!=='gfm'&&['tasks','table'].includes(item.key)?' · '+({en:'GFM only',cs:'pouze GFM',uk:'лише GFM',ro:'doar GFM',ru:'только GFM'}[state.lang]||'GFM only'):'');heading.style.color='var(--accent)';
 const btn=document.createElement('button');btn.textContent=t(state.lang,'insert');btn.type='button';btn.className='shrink-0 text-[11px] font-semibold px-2 py-1 rounded theme-accent-soft';btn.title=t(state.lang,'insertHint');btn.setAttribute('aria-label',t(state.lang,'insert')+': '+titles[state.lang][i]);
 btn.addEventListener('click',()=>{insertSnippet(item.code+'\n');toggleModal('cheatsheet-modal',false);});
 const pre=document.createElement('pre');pre.className='whitespace-pre-wrap break-words font-mono text-xs select-text';pre.textContent=item.code;
 header.append(heading,btn);card.append(header,pre);root.append(card);
 }}
export function updateCertificate(){const done=state.completedLessons.length===8;
 $('print-cert-btn').disabled=!done;
 $('copy-cert-md-btn').disabled=!done;
 $('cert-completed-count').textContent=`${state.completedLessons.length} / 8`;
 $('cert-tasks-count').textContent=`${LESSON_CORE.filter(l=>state.completedLessons.includes(l.id)).reduce((n,l)=>n+l.checks.length,0)} / ${LESSON_CORE.reduce((n,l)=>n+l.checks.length,0)}`;
 $('cert-locked-label').textContent=done?'':t(state.lang,'certLocked');
 $('student-name-input').value=state.name||'';
}
export function initModals(){
 $('contents-toggle-btn').addEventListener('click',()=>toggleContents(true));$('close-contents-btn').addEventListener('click',()=>toggleContents(false));$('contents-backdrop').addEventListener('click',()=>toggleContents(false));
 for(const [button,modal] of [['cheatsheet-btn','cheatsheet-modal'],['certificate-btn','certificate-modal']])$(button).addEventListener('click',()=>{if(modal==='certificate-modal')updateCertificate();else renderCheats();toggleModal(modal,true);});
 for(const [button,modal] of [['close-cheatsheet-btn','cheatsheet-modal'],['close-certificate-btn','certificate-modal']])$(button).addEventListener('click',()=>toggleModal(modal,false));
 for(const id of ['cheatsheet-modal','certificate-modal'])$(id).addEventListener('click',e=>{if(e.target===$(id))toggleModal(id,false);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){for(const id of ['cheatsheet-modal','certificate-modal'])toggleModal(id,false);toggleContents(false);}});
 $('student-name-input').addEventListener('input',e=>{state.name=e.target.value;save();});
 $('print-cert-btn').addEventListener('click',()=>{if(state.completedLessons.length===8)window.print();});
 $('copy-cert-md-btn').addEventListener('click',async()=>{if(state.completedLessons.length!==8)return;
 const text=`# 🏆 Learning Markdown Certificate\n\n**Recipient:** ${state.name.trim()||'Markdown Student'}\n\n**Completed:** 8 / 8 modules\n\n**Date:** ${new Date().toLocaleDateString(state.lang)}`;
 try{await navigator.clipboard.writeText(text);}catch{const ta=document.createElement('textarea');ta.value=text;document.body.append(ta);ta.select();document.execCommand('copy');ta.remove();}
 });
}
