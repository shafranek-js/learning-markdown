import assert from 'node:assert/strict';
import {sourceLineFormatEdits,formatSourceLineSelection} from '../js/core/source-line-format.js';

const apply=(source,edits)=>[...edits].reverse().reduce((text,e)=>
 text.slice(0,e.from)+e.insert+text.slice(e.to),source);

{
 const source='Before\n\nAlpha\nBeta\n\nAfter';
 const start=source.indexOf('Alpha'),end=source.indexOf('\n\nAfter');
 const result=formatSourceLineSelection(source,start,end,'ul');
 assert.equal(result.text,'Before\n\n- Alpha\n- Beta\n\nAfter');
 assert.equal(result.text.slice(result.start,result.end),'- Alpha\n- Beta');
}
{
 const source='Before\nOne\nTwo\nAfter',start=source.indexOf('One'),end=source.indexOf('After');
 assert.equal(formatSourceLineSelection(source,start,end,'ol').text,
  'Before\n1. One\n2. Two\nAfter');
}
{
 const source='  - [x] First\n  - [ ] Second\nAnother';
 const result=formatSourceLineSelection(source,0,source.indexOf('Another'),'task');
 assert.equal(result.text,source);
 assert.equal(result.start,0);
}
{
 const source='    - Alpha\n    3. Beta\nParagraph';
 assert.equal(formatSourceLineSelection(source,0,source.indexOf('Paragraph'),'quote').text,
  '    > Alpha\n    > Beta\nParagraph');
}
{
 const source='Start\nA\nB\nC\nEnd';
 const edits=sourceLineFormatEdits(source,[
  {from:source.indexOf('A'),to:source.indexOf('C')},
  {from:source.indexOf('B'),to:source.indexOf('B')}
 ],'ol');
 assert.equal(edits.length,2);
 assert.equal(apply(source,edits),'Start\n1. A\n2. B\nC\nEnd');
}
{
 const source='One\n~~~js\nx = 1\n~~~\nTwo';
 const start=source.indexOf('One'),end=source.length;
 assert.equal(sourceLineFormatEdits(source,[{from:start,to:end}],'ul'),null);
 assert.equal(formatSourceLineSelection(source,start,end,'ul'),null);
 assert.deepEqual(sourceLineFormatEdits(source,[{from:0,to:0}],'quote'),
  [{from:0,to:3,insert:'> One'}]);
}
{
 const tick=String.fromCharCode(96);
 const source='Start\n'+tick.repeat(4)+'js\ncode\n'+tick.repeat(3)+'\nend\n'+tick.repeat(4)+'\nDone';
 assert.equal(sourceLineFormatEdits(source,[{from:source.indexOf('code'),to:source.indexOf('code')}],'task'),null);
 assert.equal(sourceLineFormatEdits(source,[{from:source.indexOf('end'),to:source.indexOf('end')}],'task'),null);
 assert.notEqual(sourceLineFormatEdits(source,[{from:source.indexOf('Done'),to:source.length}],'task'),null);
}
{
 const source='Hello\r\nWorld\r\n';
 const formatted=formatSourceLineSelection(source,0,source.indexOf('World'),'ul');
 assert.equal(formatted.text,'- Hello\r\nWorld\r\n');
}
assert.equal(sourceLineFormatEdits('ABC',[{from:2,to:1}],'quote'),null);
assert.equal(sourceLineFormatEdits('ABC',[{from:0,to:1}],'invalid'),null);
console.log('Source line toolbar formatting: passed');
