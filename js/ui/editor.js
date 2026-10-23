import {state,docKey,save} from '../core/state.js';
import {record,ensureHistory,step,status} from '../core/history.js';
import {getMultiCursorLabels} from './multi-cursor-i18n.js';
export const area=()=>document.getElementById('markdown-input');
const el=id=>document.getElementById(id);
let onChange=()=>{};
let multi=null,multiLoading=null,multiShortcut=()=>{};
export const multiActive=()=>Boolean(multi?.isMultiCursorMode());
export function renderMultiCursorUI(){
 if(multi){multi.renderMultiCursorLabels();return;}
 const b=el('multi-cursor-toggle');
 if(!b)return;
 const labels=getMultiCursorLabels(state.lang);
 b.textContent=labels.off;
 b.title=labels.help;
 b.setAttribute('aria-label',labels.help);
}
export const multiWrap=(a,b,placeholder)=>multiActive()?multi.multiCursorWrap(a,b,placeholder):false;
export const multiInsert=(s,newline)=>multiActive()?multi.multiCursorInsert(s,newline):false;
export const multiHeading=level=>multiActive()?multi.multiCursorHeading(level):false;
export const multiPreset=(cssClass,isBlock)=>multiActive()?multi.multiCursorPreset(cssClass,isBlock):false;
export const multiRich=(group,id)=>multiActive()?multi.multiCursorRichContent(group,id):false;
export function registerEditorShortcut(handler){multiShortcut=handler;if(multi)multi.registerMultiCursorShortcut(handler);}
async function loadMulti(){
 if(multi)return multi;
 if(!multiLoading)multiLoading=import('./multi-cursor.js').then(mod=>{
  multi=mod;mod.initMultiCursor({textarea:area(),refresh:notify=>refreshEditor({notify})});
  mod.registerMultiCursorShortcut(multiShortcut);return mod;
 }).catch(error=>{multiLoading=null;console.error('Multi-cursor editor unavailable',error);return null;});
 return multiLoading;
}
const escapeHTML=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
// Tokenize source first and escape token-by-token; never run regex against inserted HTML markup.
function tokenize(line){
 const parts=[];let pos=0;
 const patterns=[['tok-code',/^`[^`\n]+`/],['tok-bold',/^(?:\*\*[^*\n]+\*\*|__[^_\n]+__)/],['tok-italic',/^(?:\*[^*\n]+\*|_[^_\n]+_)/],['tok-strike',/^~~[^~\n]+~~/],['tok-link',/^!?\[[^\]\n]+\]\([^\n)]+\)/]];
 while(pos<line.length){const tail=line.slice(pos);let match=null;for(const [cls,re] of patterns){let m=tail.match(re);if(m){match=[cls,m[0]];break;}}
  if(match){parts.push(`<span class="${match[0]}">${escapeHTML(match[1])}</span>`);pos+=match[1].length;}else{parts.push(escapeHTML(line[pos]));pos++;}}
 return parts.join('');
}
export function highlightMarkdown(raw){return raw.split('\n').map((line,index,lines)=>{
  // Setext headings: their marker line follows the heading text without a blank line.
  if(index>0 && lines[index-1].trim() && /^(?:={1,}|-{1,})[ \\t]*$/.test(line))return `<span class="tok-h">${escapeHTML(line)}</span>`;
  const heading=line.match(/^(#{1,6}[ \t]+)(.*)$/);if(heading)return `<span class="tok-h">${escapeHTML(heading[1])}${tokenize(heading[2])}</span>`;
  const quote=line.match(/^(>+[ \t]*)(.*)$/);if(quote)return `<span class="tok-quote-mark">${escapeHTML(quote[1])}</span><span class="tok-quote">${tokenize(quote[2])}</span>`;
  const list=line.match(/^([ \t]*(?:[-*+]|\d+\.)[ \t]+(?:\[[ xX]\][ \t]+)?)(.*)$/);if(list)return `<span class="tok-list">${escapeHTML(list[1])}</span>${tokenize(list[2])}`;
  if(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line))return `<span class="tok-hr">${escapeHTML(line)}</span>`;
  return tokenize(line);
 }).join('\n')+(raw.endsWith('\n')?' ':'');}
export function refreshEditor({notify=true}={}){
 const a=area(),text=a.value;
 if(!multiActive())el('editor-highlight-backdrop').innerHTML=highlightMarkdown(text);
 const lines=text.split('\n');el('line-gutter').textContent=lines.map((_,i)=>i+1).join('\n');
 const words=(text.match(/[\p{L}\p{N}_]+/gu)||[]).length;
 const l=text.slice(0,a.selectionStart).split('\n');
 el('editor-stats').textContent=`Lines: ${lines.length} • Words: ${words} • Chars: ${[...text].length}`;
 el('cursor-position').textContent=`Ln ${l.length}, Col ${[...l.at(-1)].length+1}`;
 const h=multiActive()?multi.multiCursorStatus():status(docKey());el('undo-btn').disabled=!h.canUndo;el('redo-btn').disabled=!h.canRedo;
 el('history-status').textContent=`History: ${h.pointer}/${h.total}`;
 state.savedDrafts[docKey()]=text;save();
 if(notify)onChange(text);
}
export function setEditorContent(value,{resetSelection=true}={}){const a=area();a.value=value;if(resetSelection)a.setSelectionRange(value.length,value.length);ensureHistory(docKey(),value);if(multiActive())multi.loadMultiCursorDocument(value,resetSelection);refreshEditor();}
export function applyEdit(text,start,end,{focus=true}={}){if(multiActive()){multi.multiCursorEdit(text,start,end,{focus});return;}const a=area();record(docKey(),a.value,a.selectionStart,a.selectionEnd,{force:true});a.value=text;if(focus)a.focus();a.setSelectionRange(start,end);record(docKey(),text,start,end,{force:true});refreshEditor();}
export function undoOrRedo(direction){if(multiActive()){multi.multiCursorUndoOrRedo(direction);return;}const snap=step(docKey(),direction);if(!snap)return;const a=area();a.value=snap.text;a.focus();a.setSelectionRange(snap.start,snap.end);refreshEditor();}
export function initEditor(listener){onChange=listener;const a=area(),backdrop=el('editor-highlight-backdrop'),gutter=el('line-gutter');let scheduled=false;
 el('multi-cursor-toggle').addEventListener('click',async()=>{const module=await loadMulti();module?.toggleMultiCursor();if(!multiActive())record(docKey(),area().value,area().selectionStart,area().selectionEnd,{force:true});});
 if(state.multiCursorMode)loadMulti().then(module=>module?.setMultiCursorEnabled(true,{focus:false}));
 a.addEventListener('scroll',()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{backdrop.scrollTop=a.scrollTop;backdrop.scrollLeft=a.scrollLeft;gutter.scrollTop=a.scrollTop;scheduled=false;});});
 a.addEventListener('input',e=>{record(docKey(),a.value,a.selectionStart,a.selectionEnd,{boundary:e.inputType==='insertLineBreak'||e.inputType==='insertParagraph'||/[ \n]$/.test(a.value)});refreshEditor();});
 for(const event of ['click','keyup','select'])a.addEventListener(event,()=>refreshEditor({notify:false}));
 a.addEventListener('keydown',e=>{const mod=e.ctrlKey||e.metaKey;
  if(mod&&!e.altKey&&e.code==='KeyZ'){e.preventDefault();undoOrRedo(e.shiftKey?1:-1);return;}
  if(mod&&!e.altKey&&e.code==='KeyY'){e.preventDefault();undoOrRedo(1);return;}
  if(e.key==='Tab'){e.preventDefault();const start=a.selectionStart,end=a.selectionEnd;applyEdit(a.value.slice(0,start)+'  '+a.value.slice(end),start+2,start+2);}
 });
}
