import {EditorState,EditorSelection,Compartment} from '@codemirror/state';
import {EditorView,keymap,lineNumbers,drawSelection,rectangularSelection,highlightActiveLine,highlightSpecialChars} from '@codemirror/view';
import {history,historyKeymap,defaultKeymap,undo,redo,undoDepth,redoDepth,isolateHistory,addCursorAbove,addCursorBelow} from '@codemirror/commands';
import {selectNextOccurrence,selectSelectionMatches} from '@codemirror/search';
import {markdown} from '@codemirror/lang-markdown';
import {syntaxHighlighting,defaultHighlightStyle} from '@codemirror/language';
import {state,save,docKey} from '../core/state.js';
import {getMultiCursorLabels} from './multi-cursor-i18n.js';
import {makeRichSnippet} from '../data/rich-content.js';

// Optional CodeMirror engine. The existing textarea stays as a live shadow
// document for the course, table tools and exports; this is a reversible
// migration, not a separate unsaved document.
let view=null,active=false,input=null,updateUI=()=>{},shortcutAction=()=>{},sessionKey='';
const sessions=new Map();
const wrapping=new Compartment();
const $=id=>document.getElementById(id);
const words=()=>getMultiCursorLabels(state.lang);
// Map all selections after inserted prefixes, instead of leaving a caret
// before the spaces at column zero.
function dispatchFormattingChanges(editor,edits){
 if(!edits.length)return;
 const changes=editor.state.changes(edits);
 editor.dispatch({
  changes,
  selection:editor.state.selection.map(changes,1),
  annotations:isolateHistory.of('full')
 });
}

function mirror(){
 if(!view||!input)return;
 input.value=view.state.doc.toString();
 const r=view.state.selection.main;
 input.setSelectionRange(r.from,r.to);
}
// VS Code-style Shift+Alt+I: a caret at the end of each selected line.
// A selection ending at column 1 of the next line does not include that line.
export function insertCursorsAtLineEnds(editor){
 const doc=editor.state.doc;
 const lineNumbers=new Set();
 for(const range of editor.state.selection.ranges){
  const first=doc.lineAt(range.from).number;
  let last=doc.lineAt(range.to).number;
  if(!range.empty && last>first && range.to===doc.line(last).from)last--;
  for(let n=first;n<=last;n++)lineNumbers.add(n);
 }
 const cursors=[...lineNumbers].sort((a,b)=>a-b)
  .map(n=>EditorSelection.cursor(doc.line(n).to));
 if(!cursors.length)return false;
 editor.dispatch({selection:EditorSelection.create(cursors,cursors.length-1),scrollIntoView:true});
 return true;
}

// Escape collapses multiple cursors to one at the main selection head.
// The document and native undo history remain untouched.
export function collapseToSingleCursor(editor){
 const selection=editor.state.selection;
 if(selection.ranges.length===1&&selection.main.empty)return false;
 editor.dispatch({selection:EditorSelection.cursor(selection.main.head),scrollIntoView:true});
 return true;
}

// Indent the union of selected lines once, preserving multiple carets.
// With a single empty caret, Tab inserts two spaces at that caret.
export function multiCursorIndent(editor,outdent=false){
 const state=editor.state,doc=state.doc,ranges=state.selection.ranges;
 if(!outdent&&ranges.length===1&&ranges[0].empty){
  editor.dispatch({...state.replaceSelection('  '),annotations:isolateHistory.of('full')});return true;
 }
 const numbers=new Set();
 for(const r of ranges){
  const first=doc.lineAt(r.from).number;
  let last=doc.lineAt(r.to).number;
  if(!r.empty&&last>first&&r.to===doc.line(last).from)last--;
  for(let n=first;n<=last;n++)numbers.add(n);
 }
 const changes=[];
 for(const n of [...numbers].sort((a,b)=>a-b)){
  const line=doc.line(n);
  if(!outdent){changes.push({from:line.from,insert:'  '});continue;}
  const match=line.text.match(/^(?: {1,2}|\t)/);
  if(match)changes.push({from:line.from,to:line.from+match[0].length,insert:''});
 }
 dispatchFormattingChanges(editor,changes);
 return true;
}

function extensions(){
 return [
  lineNumbers(),highlightSpecialChars(),history(),drawSelection(),
  EditorState.allowMultipleSelections.of(true),
  EditorView.clickAddsSelectionRange.of(event=>event.altKey&&!event.shiftKey),
  rectangularSelection({eventFilter:event=>event.altKey&&event.shiftKey}),
  highlightActiveLine(),syntaxHighlighting(defaultHighlightStyle,{fallback:true}),
  markdown(),
  wrapping.of(state.wrapText?EditorView.lineWrapping:[]),
  keymap.of([
   {key:'Mod-d',run:selectNextOccurrence,preventDefault:true},
   {key:'Mod-Shift-l',run:selectSelectionMatches,preventDefault:true},
   {key:'Escape',run:collapseToSingleCursor,preventDefault:true},
   {key:'Tab',run:editor=>multiCursorIndent(editor),preventDefault:true},
   {key:'Shift-Tab',run:editor=>multiCursorIndent(editor,true),preventDefault:true},
   {key:'Shift-Alt-i',run:insertCursorsAtLineEnds,preventDefault:true},
   {key:'Mod-Alt-ArrowDown',run:addCursorBelow,preventDefault:true},
   {key:'Mod-Alt-ArrowUp',run:addCursorAbove,preventDefault:true},
   ...['b','i','k','1','2','3','4','5','6'].map(key=>({
     key:'Mod-'+key,run:()=>{shortcutAction(({b:'bold',i:'italic',k:'link'})[key]||'h'+key);return true;},
     preventDefault:true
   })),
   ...defaultKeymap,...historyKeymap
  ]),
  EditorView.updateListener.of(update=>{
   if(!active)return;
   if(update.docChanged||update.selectionSet){
    mirror();
    renderMultiCursorLabels();
    updateUI(update.docChanged);
   }
  }),
  EditorView.theme({
   '&':{height:'100%',fontSize:'var(--editor-font-size, 15px)',backgroundColor:'var(--bg-editor)',color:'var(--editor-text)'},
   '.cm-scroller':{overflow:'auto',fontFamily:"'JetBrains Mono',Consolas,monospace",lineHeight:'1.65'},
   '.cm-gutters':{backgroundColor:'var(--bg-editor)',color:'var(--text-ui-muted)',borderRight:'1px solid var(--border-ui)'},
   '.cm-content':{caretColor:'var(--editor-caret)',padding:'16px 8px'},
   '&.cm-focused .cm-cursor':{borderLeftColor:'var(--editor-caret)'},
   '&.cm-focused .cm-selectionBackground,.cm-selectionBackground':{backgroundColor:'rgba(99,102,241,.3)'}
  })
 ];
}
const cmExtensions=extensions();
function createState(doc,selection){
 return EditorState.create({doc,selection:selection||{anchor:doc.length},extensions:cmExtensions});
}
function ensureView(){
 if(view)return;
 view=new EditorView({state:createState(input.value,{anchor:input.selectionStart,head:input.selectionEnd}),parent:$('codemirror-mount')});
 sessionKey=docKey();
}
function activate(enabled,{focus=true}={}){
 if(enabled===active)return;
 if(enabled){
  ensureView();
  const key=docKey(),text=input.value;
  if(sessionKey!==key){
   // Restore document-specific selections/history only for unchanged content.
   if(sessionKey)sessions.set(sessionKey,view.state);
   const saved=sessions.get(key);
   view.setState(saved&&saved.doc.toString()===text
    ?saved:createState(text,{anchor:input.selectionStart,head:input.selectionEnd}));
  }else if(view.state.doc.toString()!==text){
   // Textarea edits invalidate the old CodeMirror history.
   view.setState(createState(text,{anchor:input.selectionStart,head:input.selectionEnd}));
  }
  sessionKey=key;
  active=true;
 }else{
  mirror();
  sessions.set(sessionKey,view.state);
  active=false;
 }
 $('editor-pane').classList.toggle('multi-cursor-active',active);
 $('codemirror-mount').hidden=!active;
 state.multiCursorMode=active;save();
 renderMultiCursorLabels();
 updateUI(false);
 if(focus)(active?view:input).focus();
}
export function initMultiCursor({textarea,refresh}){
 input=textarea;updateUI=refresh;
 renderMultiCursorLabels();
}
export const isMultiCursorMode=()=>active;
export const toggleMultiCursor=()=>activate(!active);
export const setMultiCursorEnabled=(enabled,options)=>activate(enabled,options);
// Reconfigure display-only wrapping without rebuilding the document or its undo history.
export function setMultiCursorLineWrapping(enabled){
 if(view)view.dispatch({effects:wrapping.reconfigure(enabled?EditorView.lineWrapping:[])});
}

export const registerMultiCursorShortcut=fn=>{shortcutAction=fn;};
export const multiCursorStatus=()=>({canUndo:active&&undoDepth(view.state)>0,canRedo:active&&redoDepth(view.state)>0,
 pointer:active?undoDepth(view.state)+1:1,total:active?undoDepth(view.state)+redoDepth(view.state)+1:1,
 count:active?view.state.selection.ranges.length:1});
export function renderMultiCursorLabels(){
 const label=words();
 const toggle=$('multi-cursor-toggle');
 if(!toggle)return;
 toggle.textContent=active?label.on:label.off;
 toggle.title=label.help;toggle.setAttribute('aria-label',label.help);
 toggle.setAttribute('aria-pressed',String(active));
 const count=$('multi-cursor-count');
 if(count){count.hidden=!active;count.textContent=label.cursors+': '+(active?view.state.selection.ranges.length:1);}
}
export function multiCursorUndoOrRedo(direction){
 if(!active)return false;
 const ok=(direction<0?undo:redo)(view);
 if(ok){mirror();updateUI(true);view.focus();}
 return ok;
}
export function loadMultiCursorDocument(text,resetSelection=true){
 if(!active)return;
 const key=docKey();
 if(sessionKey!==key){
  sessions.set(sessionKey,view.state);
  sessionKey=key;
  const stored=sessions.get(key);
  view.setState(stored&&stored.doc.toString()===text?stored:createState(text));
 }else if(view.state.doc.toString()!==text){
  view.setState(createState(text));
 }
 if(resetSelection&&!view.state.selection.main.empty){
  const pos=view.state.doc.length;view.dispatch({selection:{anchor:pos}});
 }
 mirror();
}
export function multiCursorEdit(text,start,end,{focus=true}={}){
 if(!active)return false;
 const length=view.state.doc.length;
 if(view.state.doc.toString()===text)view.dispatch({selection:{anchor:start,head:end}});
 else view.dispatch({changes:{from:0,to:length,insert:text},selection:{anchor:start,head:end}});
 mirror();
 if(focus)view.focus();
 return true;
}
export function multiCursorWrap(prefix,suffix,placeholder){
 if(!active)return false;
 const transaction=view.state.changeByRange(r=>{
  const selected=view.state.sliceDoc(r.from,r.to)||placeholder;
  const replacement=prefix+selected+suffix;
  return {changes:{from:r.from,to:r.to,insert:replacement},
   range:EditorSelection.range(r.from+prefix.length,r.from+prefix.length+selected.length)};
 });
 view.dispatch({...transaction,annotations:isolateHistory.of('full')});view.focus();return true;
}
export function multiCursorInsert(snippet,newline=true){
 if(!active)return false;
 const transaction=view.state.changeByRange(r=>{
  const lead=newline&&r.from>0&&view.state.sliceDoc(r.from-1,r.from)!=='\n'?'\n':'';
  const insertion=lead+snippet;
  return {changes:{from:r.from,to:r.to,insert:insertion},
   range:EditorSelection.cursor(r.from+insertion.length)};
 });
 view.dispatch({...transaction,annotations:isolateHistory.of('full')});view.focus();return true;
}

// All Advanced commands run as one CodeMirror transaction across every
// selection, preserving the native multi-range history and cursor positions.
export function multiCursorPreset(cssClass,isBlock=false){
 if(!active)return false;
 const prefix=isBlock?'\n\n<div class="'+cssClass+'">':'<span class="'+cssClass+'">';
 const suffix=isBlock?'</div>\n\n':'</span>';
 const placeholder=isBlock?'Formatted paragraph':'formatted text';
 return multiCursorWrap(prefix,suffix,placeholder);
}
export function multiCursorRichContent(group,id){
 if(!active)return false;
 // makeRichSnippet checks its own allowed group/id combinations and escapes
 // selected user content. Include earlier generated snippets when assigning IDs
 // so that multiple anchor selections receive distinct destinations.
 const source=view.state.doc.toString();
 let reserved=source;
 let rejected=false;
 const transaction=view.state.changeByRange(r=>{
  const selected=view.state.sliceDoc(r.from,r.to);
  const snippet=makeRichSnippet(group,id,selected,reserved);
  if(snippet===null){rejected=true;return {range:r};}
  reserved+='\n'+snippet;
  const lead=r.from>0&&view.state.sliceDoc(r.from-1,r.from)!=='\n'?'\n':'';
  const inserted=lead+'\n\n'+snippet+'\n\n';
  return {changes:{from:r.from,to:r.to,insert:inserted},
   range:EditorSelection.cursor(r.from+inserted.length)};
 });
 if(rejected)return false;
 view.dispatch({...transaction,annotations:isolateHistory.of('full')});view.focus();return true;
}
export function multiCursorHeading(level){
 if(!active)return false;
 if(!Number.isInteger(level)||level<1||level>6)return false;
 const doc=view.state.doc,changes=new Map();
 for(const range of view.state.selection.ranges){
  const first=doc.lineAt(range.from).number;
  const last=doc.lineAt(range.to).number;
  const end=range.to>range.from&&doc.line(last).from===range.to?last-1:last;
  for(let number=first;number<=Math.max(first,end);number++){
   const line=doc.line(number),match=line.text.match(/^(#{1,6})[ \t]*(.*)$/);
   const value=match?match[2]:line.text.trim();
   const updated=match?.[1].length===level?value:'#'.repeat(level)+' '+(value||'Heading '+level);
   if(updated!==line.text)changes.set(line.from,{from:line.from,to:line.to,insert:updated});
  }
 }
 if(!changes.size)return true;
 dispatchFormattingChanges(view,[...changes.values()].sort((a,b)=>a.from-b.from));
 view.focus();return true;
}

// Apply line-based Markdown formatting to every selected line, even when
// multiple selections touch the same line. All changes form one undo step.
export function multiCursorLineFormat(kind){
 if(!active)return false;
 if(!['ul','ol','task','quote'].includes(kind))return false;
 const doc=view.state.doc,lines=new Set();
 for(const r of view.state.selection.ranges){
  const first=doc.lineAt(r.from).number,last=doc.lineAt(r.to).number;
  const end=r.to>r.from&&doc.line(last).from===r.to?last-1:last;
  for(let n=first;n<=Math.max(first,end);n++)lines.add(n);
 }
 const edits=[];let ordinal=0,previous=-2;
 for(const n of [...lines].sort((a,b)=>a-b)){
  const line=doc.line(n),value=line.text;
  const indent=value.match(/^[ \t]*/)[0],body=value.slice(indent.length);
  // Preserve existing checked tasks if the same task style is reapplied.
  const taskMark=body.match(/^(?:[-*+]|\d+[.)])\s+\[([ xX])\]\s+/);
  // Replace existing Markdown list/quote markers instead of nesting them.
  const bare=body.replace(/^(?:>\s*)+/, '')
   .replace(/^(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?/, '');
  let prefix;
  if(kind==='ol'){
   if(n!==previous+1)ordinal=0;
   prefix=(++ordinal)+'. ';
  }else if(kind==='task'){
   prefix=taskMark&&/[xX]/.test(taskMark[1])?'- [x] ':'- [ ] ';
  }else prefix={ul:'- ',quote:'> '}[kind];
  previous=n;
  const next=indent+prefix+bare;
  if(next!==value)edits.push({from:line.from,to:line.to,insert:next});
 }
 dispatchFormattingChanges(view,edits);
 view.focus();return true;
}
