import assert from 'node:assert/strict';
import {sourceIndentEdits,indentSourceSelection} from '../js/core/source-indent.js';

const apply=(source,edits)=>[...edits].reverse().reduce((text,e)=>
 text.slice(0,e.from)+e.insert+text.slice(e.to),source);

{
 const source='Before\nAlpha\n\nBeta\nAfter',start=source.indexOf('Alpha'),end=source.indexOf('After');
 const changed=indentSourceSelection(source,start,end);
 assert.equal(changed.text,'Before\n  Alpha\n  \n  Beta\nAfter');
 assert.equal(changed.text.slice(changed.start,changed.end),'Alpha\n  \n  Beta\n');
 // The start stays attached to the first character; the end excludes After.
 assert.equal(changed.start,source.indexOf('Alpha')+2);
 assert.equal(changed.end,end+6);
 const restored=indentSourceSelection(changed.text,changed.start,changed.end,true);
 assert.equal(restored.text,source);
 assert.equal(restored.start,start);
 assert.equal(restored.end,end);
}
{
 const src='  - One\n    Paragraph\n\tCode\nUnindented';
 const result=indentSourceSelection(src,0,src.indexOf('Unindented'),true);
 assert.equal(result.text,'- One\n  Paragraph\nCode\nUnindented');
}
{
 const src='A\nB\nC';
 const edits=sourceIndentEdits(src,[{from:0,to:3},{from:2,to:2},{from:2,to:5}]);
 assert.equal(edits.length,3,'overlapping ranges must indent lines only once');
 assert.equal(apply(src,edits),'  A\n  B\n  C');
}
{
 const src='First\nSecond';
 assert.equal(apply(src,sourceIndentEdits(src,[{from:0,to:src.indexOf('Second')}])), '  First\nSecond');
 assert.equal(indentSourceSelection('Single line',3,8).text,'  Single line',
  'a partial single-line selection indents the entire line rather than replacing selected text');
}
{
 const src='~~~md\n- literal\n~~~\nText';
 const edited=indentSourceSelection(src,0,src.length);
 assert.equal(edited.text,'  ~~~md\n  - literal\n  ~~~\n  Text');
 assert.equal(indentSourceSelection(edited.text,edited.start,edited.end,true).text,src);
}
{
 const src='Hello\r\nWorld\r\n';
 const changed=indentSourceSelection(src,0,src.indexOf('World'));
 assert.equal(changed.text,'  Hello\r\nWorld\r\n');
}
// Collapsed cursors outdent only their own logical line and preserve the
// position relative to the remaining text, including mixed whitespace.
{
 const source='Before\n  Ordinary text\nAfter';
 const caret=source.indexOf('text');
 const change=indentSourceSelection(source,caret,caret,true);
 assert.deepEqual(change,{text:'Before\nOrdinary text\nAfter',start:caret-2,end:caret-2});
 assert.deepEqual(indentSourceSelection(change.text,change.start,change.end,true),
  {text:change.text,start:change.start,end:change.end});
}
{
 const source='  Heading';
 assert.deepEqual(indentSourceSelection(source,1,1,true),
  {text:'Heading',start:0,end:0});
}
{
 const source='Before\n\tcode literal\nAfter';
 const caret=source.indexOf('literal');
 const change=indentSourceSelection(source,caret,caret,true);
 assert.equal(change.text,'Before\ncode literal\nAfter');
 assert.equal(change.start,caret-1);
}

assert.equal(sourceIndentEdits('abc',[{from:3,to:2}]),null);
assert.equal(sourceIndentEdits('abc',[{from:0,to:4}]),null);
assert.equal(sourceIndentEdits('abc',[{from:0,to:1}],1),null);
assert.equal(sourceIndentEdits('abc',[]),null);
assert.deepEqual(indentSourceSelection('plain',0,5,true),{text:'plain',start:0,end:5});
console.log('Source multi-line Tab/Shift+Tab indentation: passed');
