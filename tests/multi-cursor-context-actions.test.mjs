import assert from 'node:assert/strict';
import {EditorState,EditorSelection} from '@codemirror/state';
import {history,undoDepth} from '@codemirror/commands';
import {addCursorAtPosition,selectColumnToPosition} from '../js/ui/multi-cursor-context-actions.js';

function editorFor(source,selection){
 const result={state:EditorState.create({
  doc:source,selection,
  extensions:[EditorState.allowMultipleSelections.of(true),history()]
 })};
 result.dispatch=function(spec){this.state=this.state.update(spec).state;};
 return result;
}
{
 const editor=editorFor('First\nSecond\nThird',{anchor:0});
 const initial=editor.state.doc.toString();
 assert.equal(addCursorAtPosition(editor,13),true);
 assert.deepEqual(editor.state.selection.ranges.map(r=>r.from),[0,13]);
 assert.equal(editor.state.selection.main.head,13);
 assert.equal(editor.state.doc.toString(),initial);
 assert.equal(undoDepth(editor.state),0);
 // Clicking an existing caret must not generate an overlapping fake cursor.
 addCursorAtPosition(editor,13);
 assert.deepEqual(editor.state.selection.ranges.map(r=>r.from),[0,13]);
 assert.equal(undoDepth(editor.state),0);
}
{
 const editor=editorFor('alpha\nbeta\ngamma',{anchor:2});
 assert.equal(selectColumnToPosition(editor,15),true);
 assert.deepEqual(editor.state.selection.ranges.map(r=>editor.state.sliceDoc(r.from,r.to)),
  ['ph','ta','mm']);
 assert.equal(editor.state.selection.main.from,13);
 assert.equal(editor.state.selection.main.to,15);
 assert.equal(editor.state.doc.toString(),'alpha\nbeta\ngamma');
 assert.equal(undoDepth(editor.state),0);
}
{
 const source='a\nabcdef\nx';
 const editor=editorFor(source,{anchor:source.indexOf('x')+1});
 selectColumnToPosition(editor,0);
 assert.deepEqual(editor.state.selection.ranges.map(r=>[r.from,r.to]),[
  [0,1],[2,3],[9,10]
 ]);
 assert.equal(editor.state.doc.toString(),source);
}
{
 const editor=editorFor('red\nblue\ngreen',{anchor:5});
 const before=editor.state.doc.toString();
 // A right-click on the same line still forms one ordinary selection.
 selectColumnToPosition(editor,8);
 assert.equal(editor.state.selection.ranges.length,1);
 assert.equal(editor.state.sliceDoc(editor.state.selection.main.from,editor.state.selection.main.to),'blu');
 assert.equal(editor.state.doc.toString(),before);
 assert.equal(undoDepth(editor.state),0);
}
console.log('PASS: context cursor and column actions preserve source, main range and undo history');
