import {state,docKey,save} from '../core/state.js';
import {record,ensureHistory,step,status} from '../core/history.js';
import {getMultiCursorLabels} from './multi-cursor-i18n.js';
import {getWrapTextLabels} from './wrap-text-i18n.js';
import {tabFocusLabels} from './tab-focus-i18n.js';
import {editMarkdownListKey} from '../core/source-list-keyboard.js';
import {indentSourceSelection} from '../core/source-indent.js';
export const area=()=>document.getElementById('markdown-input');
const el=id=>document.getElementById(id);
let onChange=()=>{};
let multi=null,multiLoading=null,multiShortcut=()=>{};
export const multiActive=()=>Boolean(multi?.isMultiCursorMode());
export function renderWrapTextUI(){
 const toggle=el('wrap-text-toggle');
 if(!toggle)return;
 const words=getWrapTextLabels(state.lang);
 toggle.textContent=state.wrapText?words.on:words.off;
 toggle.title=words.help;
 toggle.setAttribute('aria-label',words.help);
 toggle.setAttribute('aria-pressed',String(state.wrapText));
}
export function renderTabFocusUI(){
 const toggle=el('tab-focus-toggle'),help=el('editor-tab-help');
 const words=tabFocusLabels(state.lang),focused=state.tabFocusMode;
 if(toggle){
  toggle.textContent=focused?words.focus:words.edit;
  toggle.title=focused?words.focusHelp:words.editHelp;
  toggle.setAttribute('aria-label',focused?words.focusHelp:words.editHelp);
  toggle.setAttribute('aria-pressed',String(focused));
 }
 if(help)help.textContent=focused?words.focusHelp:words.editHelp;
}
export function toggleTabFocusMode(){
 state.tabFocusMode=!state.tabFocusMode;
 save();
 renderTabFocusUI();
}
function applyWrapPreference(){
 const enabled=state.wrapText;
 el('editor-pane').classList.toggle('wrap-text-enabled',enabled);
 area().setAttribute('wrap',enabled?'soft':'off');
 multi?.setMultiCursorLineWrapping(enabled);
 renderWrapTextUI();
 renderTabFocusUI();
}
// Wrapped visual lines need a gutter that reserves height for continuation
// lines, while the numbers still count only actual Markdown source lines.
function syncWrappedGutter(){
 if(!state.wrapText||multiActive())return;
 const fragments=el('editor-highlight-backdrop').querySelectorAll('.editor-wrap-line');
 const numbers=el('line-gutter').querySelectorAll('.editor-gutter-row');
 if(!fragments.length||fragments.length!==numbers.length)return;
 for(let i=0;i<fragments.length;i++){
  const height=fragments[i].getBoundingClientRect().height;
  if(height>0)numbers[i].style.height=height+'px';
 }
}
function renderEditorHighlight(text,lines){
 const backdrop=el('editor-highlight-backdrop'),gutter=el('line-gutter');
 const colored=highlightMarkdown(text);
 if(state.wrapText){
  backdrop.innerHTML=colored.split('\n').map(line=>
   '<span class="editor-wrap-line">'+(line||'&#8203;')+'</span>').join('');
  gutter.innerHTML=lines.map((_,i)=>'<span class="editor-gutter-row">'+(i+1)+'</span>').join('');
  syncWrappedGutter();
 }else{
  backdrop.innerHTML=colored;
  gutter.textContent=lines.map((_,i)=>i+1).join('\n');
 }
 backdrop.scrollTop=area().scrollTop;
 backdrop.scrollLeft=state.wrapText?0:area().scrollLeft;
 gutter.scrollTop=area().scrollTop;
}
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
export const multiStandaloneSnippet=snippet=>multiActive()?multi.multiCursorStandaloneSnippet(snippet):false;
export const multiFencedBlock=()=>multiActive()?multi.multiCursorFencedBlock():false;
export const multiImage=()=>multiActive()?multi.multiCursorImage():false;
export const multiBlockToolbar=kind=>multiActive()?multi.multiCursorBlockToolbar(kind):false;
export const multiHeading=level=>multiActive()?multi.multiCursorHeading(level):false;
export const multiLineFormat=kind=>multiActive()?multi.multiCursorLineFormat(kind):false;
export const multiPreset=(cssClass,isBlock)=>multiActive()?multi.multiCursorPreset(cssClass,isBlock):false;
export const multiRich=(group,id)=>multiActive()?multi.multiCursorRichContent(group,id):false;
export function registerEditorShortcut(handler){multiShortcut=handler;if(multi)multi.registerMultiCursorShortcut(handler);}
async function loadMulti(){
 if(multi)return multi;
 if(!multiLoading)multiLoading=import('./multi-cursor.js').then(mod=>{
  multi=mod;mod.initMultiCursor({textarea:area(),refresh:notify=>refreshEditor({notify}),toggleTabFocus:toggleTabFocusMode});
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
 const lines=text.split('\n');
 if(!multiActive())renderEditorHighlight(text,lines);
 const words=(text.match(/[\p{L}\p{N}_]+/gu)||[]).length;
 const l=text.slice(0,a.selectionStart).split('\n');
 el('editor-stats').textContent=`Lines: ${lines.length} • Words: ${words} • Chars: ${[...text].length}`;
 el('cursor-position').textContent=`Ln ${l.length}, Col ${[...l.at(-1)].length+1}`;
 const h=multiActive()?multi.multiCursorStatus():status(docKey());el('undo-btn').disabled=!h.canUndo;el('redo-btn').disabled=!h.canRedo;
 el('history-status').textContent=`History: ${h.pointer}/${h.total}`;
 // Selection-only changes must not synchronously rewrite localStorage.
 // Multi-cursor navigation can produce hundreds of selection transactions.
 const key=docKey();
 if(state.savedDrafts[key]!==text){state.savedDrafts[key]=text;save();}
 if(notify)onChange(text);
}
export function setEditorContent(value,{resetSelection=true}={}){const a=area();a.value=value;if(resetSelection)a.setSelectionRange(value.length,value.length);ensureHistory(docKey(),value);if(multiActive())multi.loadMultiCursorDocument(value,resetSelection);refreshEditor();}
export function applyEdit(text,start,end,{focus=true}={}){if(multiActive()){multi.multiCursorEdit(text,start,end,{focus});return;}const a=area();record(docKey(),a.value,a.selectionStart,a.selectionEnd,{force:true});a.value=text;if(focus)a.focus();a.setSelectionRange(start,end);record(docKey(),text,start,end,{force:true});refreshEditor();}
// The Edit menu reads the active editor rather than assuming textarea focus.
export function sourceSelection(){
 if(multiActive())return multi.editSelection();
 return {from:area().selectionStart,to:area().selectionEnd};
}
export function selectSourceRange(from,to){
 if(multiActive())return multi.editSelectRange(from,to);
 area().focus();area().setSelectionRange(from,to);
 refreshEditor({notify:false});return true;
}
export function selectAllSource(){
 if(multiActive())return multi.editSelectAll();
 return selectSourceRange(0,area().value.length);
}
export function replaceSourceRange(from,to,insert){
 if(multiActive())return multi.editReplaceRange(from,to,insert);
 const source=area().value;
 applyEdit(source.slice(0,from)+insert+source.slice(to),from+insert.length,from+insert.length);
 return true;
}
export function replaceAllSource(nextText){
 if(nextText===area().value)return false;
 if(multiActive())return multi.editReplaceRange(0,area().value.length,nextText);
 applyEdit(nextText,0,0);
 return true;
}
export function undoOrRedo(direction){if(multiActive()){multi.multiCursorUndoOrRedo(direction);return;}const snap=step(docKey(),direction);if(!snap)return;const a=area();a.value=snap.text;a.focus();a.setSelectionRange(snap.start,snap.end);refreshEditor();}
export function initEditor(listener){onChange=listener;const a=area(),backdrop=el('editor-highlight-backdrop'),gutter=el('line-gutter');let scheduled=false;
 applyWrapPreference();
 el('tab-focus-toggle').addEventListener('click',toggleTabFocusMode);
 el('wrap-text-toggle').addEventListener('click',()=>{
  state.wrapText=!state.wrapText;
  applyWrapPreference();
  save();
  if(state.wrapText)a.scrollLeft=0;
  refreshEditor({notify:false});
 });
 // Resize of a split pane alters wrapping without changing the Markdown text.
 if(typeof ResizeObserver!=='undefined'){
  const observer=new ResizeObserver(()=>syncWrappedGutter());
  observer.observe(el('editor-pane').querySelector('.editor-container'));
 }
 el('multi-cursor-toggle').addEventListener('click',async()=>{const module=await loadMulti();module?.toggleMultiCursor();if(!multiActive())record(docKey(),area().value,area().selectionStart,area().selectionEnd,{force:true});});
 if(state.multiCursorMode)loadMulti().then(module=>module?.setMultiCursorEnabled(true,{focus:false}));
 a.addEventListener('scroll',()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{backdrop.scrollTop=a.scrollTop;backdrop.scrollLeft=a.scrollLeft;gutter.scrollTop=a.scrollTop;scheduled=false;});});
 a.addEventListener('input',e=>{record(docKey(),a.value,a.selectionStart,a.selectionEnd,{boundary:e.inputType==='insertLineBreak'||e.inputType==='insertParagraph'||/[ \n]$/.test(a.value)});refreshEditor();});
 for(const event of ['click','keyup','select'])a.addEventListener(event,()=>refreshEditor({notify:false}));
 a.addEventListener('keydown',e=>{
  // Ctrl+M toggles a keyboard-accessible route out of the source editor.
  if(e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.shiftKey&&e.code==='KeyM'&&
     !e.isComposing&&e.keyCode!==229){
   e.preventDefault();toggleTabFocusMode();return;
  }
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&!e.altKey&&e.code==='KeyZ'){e.preventDefault();undoOrRedo(e.shiftKey?1:-1);return;}
  if(mod&&!e.altKey&&e.code==='KeyY'){e.preventDefault();undoOrRedo(1);return;}
  // Never intercept native IME composition or browser Ctrl/Alt shortcuts.
  if(mod||e.altKey||e.isComposing||e.keyCode===229||multiActive())return;
  if(state.tabFocusMode&&e.key==='Tab')return;
  if(e.key==='Tab'||e.key==='Enter'){
   const start=a.selectionStart,end=a.selectionEnd;
   // Any nonempty selection is indented as whole source lines, including
   // mixed prose/lists. This matches CodeMirror instead of silently doing
   // nothing (or deleting selected Markdown text with the old Tab fallback).
   if(e.key==='Tab'&&start!==end){
    e.preventDefault();
    const changed=indentSourceSelection(a.value,start,end,e.shiftKey);
    if(changed&&changed.text!==a.value)applyEdit(changed.text,changed.start,changed.end);
    return;
   }
   const edit=editMarkdownListKey(a.value,start,end,e.key,{shiftKey:e.shiftKey});
   if(edit){e.preventDefault();applyEdit(edit.text,edit.start,edit.end);return;}
   if(e.key==='Tab'&&e.shiftKey){
    // With one caret, outdent an indented prose/code line just like CodeMirror.
    // On an unindented line, leave Shift+Tab to normal browser focus traversal.
    const outdent=indentSourceSelection(a.value,start,start,true);
    if(outdent&&outdent.text!==a.value){
     e.preventDefault();applyEdit(outdent.text,outdent.start,outdent.end);
    }
    return;
   }
   if(e.key==='Tab'&&!e.shiftKey){
    e.preventDefault();
    applyEdit(a.value.slice(0,start)+'  '+a.value.slice(end),start+2,start+2);
   }
  }
 });
}
