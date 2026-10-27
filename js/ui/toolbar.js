import {area,applyEdit,undoOrRedo,multiWrap,multiInsert,multiFencedBlock,multiImage,multiHeading,multiLineFormat,multiPreset,multiRich,registerEditorShortcut} from './editor.js';
import {presetClass} from '../core/advanced-presets.js';
import {makeRichSnippet} from '../data/rich-content.js';
import {formatSourceLineSelection} from '../core/source-line-format.js';
import {formatSourceInlineSelection} from '../core/source-inline-format.js';
import {formatSourceFencedBlockSelection} from '../core/source-fenced-block.js';
import {formatSourceImageSelection} from '../core/source-image-insertion.js';
import {explainProtectedSourceFormatting,explainImageSelectionFailure} from './line-format-feedback.js';
export function setHeading(level){
 if(multiHeading(level))return;
 const a=area(),start=a.selectionStart,end=a.selectionEnd,source=a.value;
 const formatted=formatSourceLineSelection(source,start,end,'h'+level);
 if(!formatted){explainProtectedSourceFormatting();return;}
 if(formatted.text===source)return;
 // Legacy single-caret heading actions leave the caret at the line end;
 // preserve that UX, while keeping a multiline selection across the edits.
 const lineStart=source.lastIndexOf('\n',start-1)+1;
 const updatedLineEnd=formatted.text.indexOf('\n',lineStart);
 const singleCaret=start===end;
 const caret=singleCaret?(updatedLineEnd<0?formatted.text.length:updatedLineEnd):formatted.start;
 applyEdit(formatted.text,caret,singleCaret?caret:formatted.end);
}
export function insertSnippet(snippet,newline=true){if(multiInsert(snippet,newline))return;const a=area(),s=a.selectionStart,e=a.selectionEnd,v=a.value,p=newline&&s>0&&v[s-1]!=='\n'?'\n':'';const value=p+snippet,pos=s+value.length;applyEdit(v.slice(0,s)+value+v.slice(e),pos,pos);}
function wrap(prefix,suffix=prefix,placeholder='text'){
 if(multiWrap(prefix,suffix,placeholder))return;
 const a=area(),formatted=formatSourceInlineSelection(a.value,a.selectionStart,a.selectionEnd,prefix,suffix,placeholder);
 if(formatted===null){explainProtectedSourceFormatting();return;}
 applyEdit(formatted.text,formatted.start,formatted.end);
}
export function applyAdvancedPreset(group,value){
 const cssClass=presetClass(group,value);
 if(!cssClass)return false;
 const isBlock=['align','indent','spacing'].includes(group);
 if(multiPreset(cssClass,isBlock))return true;
 const before=isBlock?'\n\n<div class="'+cssClass+'">':'<span class="'+cssClass+'">';
 const after=isBlock?'</div>\n\n':'</span>';
 wrap(before,after,isBlock?'Formatted paragraph':'formatted text');
 return true;
}
export function insertRichContent(group,id){
 if(multiRich(group,id))return true;
 const a=area(),selected=a.value.slice(a.selectionStart,a.selectionEnd);
 const html=makeRichSnippet(group,id,selected,a.value);
 if(!html)return false;
 insertSnippet('\n\n'+html+'\n\n');
 return true;
}
export function insertAdvancedPageBreak(){
 insertSnippet('\n<div class="af-page-break"></div>\n',true);
}
export function insertCodeBlock(){
 if(multiFencedBlock())return;
 const input=area();
 const change=formatSourceFencedBlockSelection(input.value,input.selectionStart,input.selectionEnd);
 if(change===null){explainProtectedSourceFormatting();return;}
 applyEdit(change.text,change.start,change.end);
}
export function insertImage(){
 if(multiImage())return;
 const input=area();
 const {change,reason}=formatSourceImageSelection(
  input.value,input.selectionStart,input.selectionEnd);
 if(change===null){explainImageSelectionFailure(reason);return;}
 applyEdit(change.text,change.start,change.end);
}
export function toolbarAction(action){
 if(['ul','ol','task','quote'].includes(action)){
  if(multiLineFormat(action))return;
  const a=area(),start=a.selectionStart,end=a.selectionEnd;
  // No selection preserves the familiar new-list template. A multiline
  // selection is transformed in place instead of silently being replaced.
  if(start!==end){
   const formatted=formatSourceLineSelection(a.value,start,end,action);
   if(formatted===null){explainProtectedSourceFormatting();return;}
   if(formatted.text!==a.value)applyEdit(formatted.text,formatted.start,formatted.end);
   return;
  }
 }
 switch(action){
 case 'h1':case 'h2':case 'h3':case 'h4':case 'h5':case 'h6':setHeading(Number(action[1]));break;
 case 'bold':wrap('**','**','bold text');break;case 'italic':wrap('_','_','italic text');break;
 case 'strike':wrap('~~','~~','strikethrough');break;case 'quote':insertSnippet('> Blockquote text\n');break;
 case 'ul':insertSnippet('- List item\n');break;case 'ol':insertSnippet('1. First step\n2. Second step\n');break;
 case 'task':insertSnippet('- [x] Completed task\n- [ ] Open task\n');break;
 case 'code-inline':wrap('`','`','command');break;case 'code-block':insertCodeBlock();break;
 case 'link':wrap('[','](https://example.com)','Link text');break;case 'image':insertImage();break;
 case 'table':document.getElementById('table-picker-trigger')?.click();break;
 case 'hr':insertSnippet('\n---\n\n');break;
 // Advanced HTML actions are explicit opt-ins; they do not change the Markdown dialect.
 case 'adv-underline':wrap('<u>','</u>','underlined text');break;
 case 'adv-sup':wrap('<sup>','</sup>','2');break;
 case 'adv-sub':wrap('<sub>','</sub>','2');break;
 case 'adv-highlight':wrap('<mark>','</mark>','highlighted text');break;
 case 'adv-spoiler':insertSnippet('\n<details>\n<summary>More information</summary>\n\nHidden content\n</details>\n');break;
 }}
export function initToolbar(){registerEditorShortcut(toolbarAction);document.querySelectorAll('.toolbar-btn').forEach(button=>button.addEventListener('click',()=>toolbarAction(button.dataset.action)));
 document.getElementById('undo-btn').addEventListener('click',()=>undoOrRedo(-1));document.getElementById('redo-btn').addEventListener('click',()=>undoOrRedo(1));
 area().addEventListener('keydown',e=>{const mod=e.ctrlKey||e.metaKey;if(!mod||e.altKey||e.shiftKey)return;
 const key=e.code,shortcuts={Digit1:'h1',Digit2:'h2',Digit3:'h3',Digit4:'h4',Digit5:'h5',Digit6:'h6',KeyB:'bold',KeyI:'italic',KeyK:'link'};
 if(shortcuts[key]){e.preventDefault();toolbarAction(shortcuts[key]);}
 });
}
