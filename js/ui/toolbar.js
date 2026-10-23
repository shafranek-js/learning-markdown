import {area,applyEdit,undoOrRedo} from './editor.js';
import {presetClass} from '../core/advanced-presets.js';
const FENCE='```';
export function setHeading(level){const a=area(),s=a.selectionStart,e=a.selectionEnd,v=a.value;const begin=v.lastIndexOf('\n',s-1)+1;let finish=v.indexOf('\n',e);if(finish<0)finish=v.length;
 const line=v.slice(begin,finish),m=line.match(/^(#{1,6})[ \t]*(.*)$/),content=m?m[2]:line.trim();
 const newLine=m?.[1].length===level?content:'#'.repeat(level)+' '+(content||`Heading ${level}`);
 const caret=begin+newLine.length;applyEdit(v.slice(0,begin)+newLine+v.slice(finish),caret,caret);
}
export function insertSnippet(snippet,newline=true){const a=area(),s=a.selectionStart,e=a.selectionEnd,v=a.value,p=newline&&s>0&&v[s-1]!=='\n'?'\n':'';const value=p+snippet,pos=s+value.length;applyEdit(v.slice(0,s)+value+v.slice(e),pos,pos);}
function wrap(prefix,suffix=prefix,placeholder='text'){const a=area(),s=a.selectionStart,e=a.selectionEnd,v=a.value,selection=v.slice(s,e)||placeholder;
 const next=v.slice(0,s)+prefix+selection+suffix+v.slice(e);applyEdit(next,s+prefix.length,s+prefix.length+selection.length);
}
export function applyAdvancedPreset(group,value){
 const cssClass=presetClass(group,value);
 if(!cssClass)return false;
 const a=area(),start=a.selectionStart,end=a.selectionEnd,text=a.value,selected=text.slice(start,end);
 const isBlock=['align','indent','spacing'].includes(group);
 const sample=isBlock?'Formatted paragraph':'formatted text';
 const content=selected||sample;
 const before=isBlock?'\n\n<div class="'+cssClass+'">':'<span class="'+cssClass+'">';
 const after=isBlock?'</div>\n\n':'</span>';
 const next=text.slice(0,start)+before+content+after+text.slice(end);
 applyEdit(next,start+before.length,start+before.length+content.length);
 return true;
}
export function insertAdvancedPageBreak(){
 insertSnippet('\n<div class="af-page-break"></div>\n',true);
}
export function toolbarAction(action){switch(action){
 case 'h1':case 'h2':case 'h3':case 'h4':case 'h5':case 'h6':setHeading(Number(action[1]));break;
 case 'bold':wrap('**','**','bold text');break;case 'italic':wrap('_','_','italic text');break;
 case 'strike':wrap('~~','~~','strikethrough');break;case 'quote':insertSnippet('> Blockquote text\n');break;
 case 'ul':insertSnippet('- List item\n');break;case 'ol':insertSnippet('1. First step\n2. Second step\n');break;
 case 'task':insertSnippet('- [x] Completed task\n- [ ] Open task\n');break;
 case 'code-inline':wrap('`','`','command');break;case 'code-block':insertSnippet(`${FENCE}js\nconsole.log("Markdown Studio");\n${FENCE}\n`);break;
 case 'link':wrap('[','](https://example.com)','Link text');break;case 'image':insertSnippet('![Image](https://placehold.co/600x160/png)\n');break;
 case 'table':insertSnippet('| Column 1 | Column 2 |\n| --- | --- |\n| Value A | Value B |\n');break;
 case 'hr':insertSnippet('\n---\n\n');break;
 // Advanced HTML actions are explicit opt-ins; they do not change the Markdown dialect.
 case 'adv-underline':wrap('<u>','</u>','underlined text');break;
 case 'adv-sup':wrap('<sup>','</sup>','2');break;
 case 'adv-sub':wrap('<sub>','</sub>','2');break;
 case 'adv-highlight':wrap('<mark>','</mark>','highlighted text');break;
 case 'adv-spoiler':insertSnippet('\n<details>\n<summary>More information</summary>\n\nHidden content\n</details>\n');break;
 }}
export function initToolbar(){document.querySelectorAll('.toolbar-btn').forEach(button=>button.addEventListener('click',()=>toolbarAction(button.dataset.action)));
 document.getElementById('undo-btn').addEventListener('click',()=>undoOrRedo(-1));document.getElementById('redo-btn').addEventListener('click',()=>undoOrRedo(1));
 area().addEventListener('keydown',e=>{const mod=e.ctrlKey||e.metaKey;if(!mod||e.altKey||e.shiftKey)return;
 const key=e.code,shortcuts={Digit1:'h1',Digit2:'h2',Digit3:'h3',Digit4:'h4',Digit5:'h5',Digit6:'h6',KeyB:'bold',KeyI:'italic',KeyK:'link'};
 if(shortcuts[key]){e.preventDefault();toolbarAction(shortcuts[key]);}
 });
}
