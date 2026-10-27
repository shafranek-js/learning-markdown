import {sourceSelectionTouchesFencedCode} from './source-line-format.js';

// Preserve all selected source bytes. These commands insert a block-level
// separator or wrap the selected fragment, never replace it with sample text.
// The same edits feed textarea and CodeMirror's atomic multi-range transaction.
const EXAMPLES={
 hr:'\n---\n\n',
 spoiler:'\n<details>\n<summary>More information</summary>\n\nHidden content\n</details>\n'
};
export function sourceBlockToolbarChanges(source,ranges,kind){
 if(!Object.hasOwn(EXAMPLES,kind)||sourceSelectionTouchesFencedCode(source,ranges))return null;
 return ranges.map(({from,to})=>{
  const selected=source.slice(from,to);
  const leading=from>0&&source[from-1]!=='\n'?'\n':'';
  if(from===to){
   const insert=leading+EXAMPLES[kind],pos=from+insert.length;
   return {from,to,insert,selectionFrom:pos,selectionTo:pos};
  }
  if(kind==='hr'){
   // Put the rule AFTER the selected content, even when a selection ends
   // mid-line. Preserve every character of the selection and its neighbors.
   const insert=selected+(selected.endsWith('\n')?'\n':'\n\n')+'---\n\n';
   const pos=from+insert.length;
   return {from,to,insert,selectionFrom:pos,selectionTo:pos};
  }
  // Preserve selected text as editable content inside the disclosure element.
  const opener=leading+'\n<details>\n<summary>More information</summary>\n\n';
  const closer=(selected.endsWith('\n')?'':'\n')+'</details>\n'+
   (to<source.length&&source[to]!=='\n'?'\n':'');
  const insert=opener+selected+closer;
  return {from,to,insert,selectionFrom:from+opener.length,
   selectionTo:from+opener.length+selected.length};
 });
}
export function formatSourceBlockToolbarSelection(source,start,end,kind){
 const edits=sourceBlockToolbarChanges(source,[{from:start,to:end}],kind);
 if(edits===null)return null;
 const {from,to,insert,selectionFrom,selectionTo}=edits[0];
 return {text:source.slice(0,from)+insert+source.slice(to),
  start:selectionFrom,end:selectionTo};
}
