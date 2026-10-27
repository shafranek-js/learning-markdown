import assert from 'node:assert/strict';
import {sourceFencedBlockChanges,formatSourceFencedBlockSelection} from '../js/core/source-fenced-block.js';
const fence='\x60\x60\x60';
const apply=(text,edits)=>edits.reduceRight((out,{from,to,insert})=>
 out.slice(0,from)+insert+out.slice(to),text);

{
 const source='Before alpha After',start=source.indexOf('alpha');
 const changed=formatSourceFencedBlockSelection(source,start,start+5);
 assert.equal(changed.text,'Before \n'+fence+'\nalpha\n'+fence+'\n After');
 assert.equal(changed.text.slice(changed.start,changed.end),'alpha');
 assert.equal(changed.start,source.indexOf('alpha')+1+fence.length+1);
 // All original bytes survive in source order; no content is replaced.
 assert.equal(changed.text.replace('\n'+fence+'\n','').replace('\n'+fence+'\n',''),source);
}
{
 const source='Before\nline one\nline two\nAfter',start=source.indexOf('line one');
 const end=source.indexOf('After');
 const changed=formatSourceFencedBlockSelection(source,start,end);
 assert.equal(changed.text,'Before\n'+fence+'\nline one\nline two\n'+fence+'\nAfter');
 assert.equal(changed.text.slice(changed.start,changed.end),'line one\nline two\n');
}
{
 const source='One\nOne\nOne';
 const ranges=[{from:0,to:3},{from:4,to:7},{from:8,to:11}];
 const edits=sourceFencedBlockChanges(source,ranges);
 assert.equal(edits.length,3);
 assert.equal(apply(source,edits),Array(3).fill(fence+'\nOne\n'+fence).join('\n'));
 assert.deepEqual(edits.map(e=>e.insert.includes('One')),[true,true,true]);
}
{
 const source='Left \x60\x60\x60 inline Right';
 const start=source.indexOf('Left'),end=source.length;
 const changed=formatSourceFencedBlockSelection(source,start,end);
 const longer='\x60\x60\x60\x60';
 assert.equal(changed.text,longer+'\n'+source+'\n'+longer);
 assert.equal(changed.text.slice(changed.start,changed.end),source);
}
{
 const changed=formatSourceFencedBlockSelection('Before',6,6);
 assert.equal(changed.text,'Before\n'+fence+'js\nconsole.log("Markdown Studio");\n'+fence+'\n');
 assert.equal(changed.start,changed.text.length);
 assert.equal(changed.end,changed.start);
}
{
 const source='Good\n~~~js\nconsole.log(1)\n~~~\nSafe';
 const safe=source.indexOf('Good'),inside=source.indexOf('console');
 assert.equal(sourceFencedBlockChanges(source,[{from:safe,to:safe+4},{from:inside,to:inside+7}]),null);
 assert.equal(formatSourceFencedBlockSelection(source,inside,inside+7),null);
 assert.equal(formatSourceFencedBlockSelection(source,-1,2),null);
 assert.equal(formatSourceFencedBlockSelection(source,5,3),null);
 assert.equal(formatSourceFencedBlockSelection(source,0,source.length+1),null);
 assert.equal(sourceFencedBlockChanges(source,[]),null);
}
console.log('Source fenced code block selection parity: passed');
