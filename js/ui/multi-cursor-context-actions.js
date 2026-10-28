import {EditorSelection} from '@codemirror/state';

// Mouse-driven counterparts to CodeMirror's Alt+Click and Alt+Shift+Drag.
// Operate on the same native selection state as the keyboard commands and
// never modify the document or its undo history.
export function addCursorAtPosition(editor,position){
 const selection=editor.state.selection;
 const pos=Math.max(0,Math.min(editor.state.doc.length,position));
 const cursors=[...selection.ranges,EditorSelection.cursor(pos)];
 editor.dispatch({
  selection:EditorSelection.create(cursors,cursors.length-1),
  scrollIntoView:true
 });
 return true;
}

// The primary caret is the rectangle's anchor; the right-clicked character
// supplies its opposite corner. A column is expressed in source characters,
// clamped for shorter lines. This is deliberately source-oriented: no
// rewriting of tabs, wrapped lines or user text to fake visual geometry.
export function selectColumnToPosition(editor,position){
 const doc=editor.state.doc,selection=editor.state.selection;
 const anchor=doc.lineAt(selection.main.head);
 const end=doc.lineAt(Math.max(0,Math.min(doc.length,position)));
 const first=Math.min(anchor.number,end.number),last=Math.max(anchor.number,end.number);
 const left=Math.min(selection.main.head-anchor.from,position-end.from);
 const right=Math.max(selection.main.head-anchor.from,position-end.from);
 const ranges=[];
 for(let n=first;n<=last;n++){
  const line=doc.line(n);
  ranges.push(EditorSelection.range(
   line.from+Math.min(left,line.length),
   line.from+Math.min(right,line.length)
  ));
 }
 if(!ranges.length)return false;
 editor.dispatch({
  selection:EditorSelection.create(ranges,end.number-first),
  scrollIntoView:true
 });
 return true;
}
