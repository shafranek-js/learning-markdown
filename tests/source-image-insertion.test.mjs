import assert from 'node:assert/strict';
import {sourceImageInsertionChanges,formatSourceImageSelection} from '../js/core/source-image-insertion.js';

const PLACEHOLDER='https://placehold.co/600x160/png';
const apply=(text,edits)=>edits.reduceRight((s,e)=>
 s.slice(0,e.from)+e.insert+s.slice(e.to),text);

{
 const text='Before picture After';
 const start=text.indexOf('picture');
 const {change,reason}=formatSourceImageSelection(text,start,start+7);
 assert.equal(reason,null);
 assert.equal(change.text,'Before ![picture]('+PLACEHOLDER+') After');
 assert.equal(change.text.slice(change.start,change.end),'picture');
}
{
 const text='Image [alt] \\ path';
 const {change}=formatSourceImageSelection(text,0,text.length);
 assert.equal(change.text,'![Image \\[alt\\] \\\\ path]('+PLACEHOLDER+')');
 assert.equal(change.text.slice(change.start,change.end),'Image \\[alt\\] \\\\ path');
}
{
 const text='Before';
 const {change}=formatSourceImageSelection(text,6,6);
 assert.equal(change.text,'Before\n![Image]('+PLACEHOLDER+')\n');
 assert.equal(change.start,change.text.length);
 assert.equal(change.end,change.start);
}
{
 const text='A A A';
 const ranges=[{from:0,to:1},{from:2,to:3},{from:4,to:5}];
 const result=sourceImageInsertionChanges(text,ranges);
 assert.equal(result.reason,null);
 assert.equal(result.changes.length,3);
 assert.equal(apply(text,result.changes),Array(3).fill('![A]('+PLACEHOLDER+')').join(' '));
}
{
 const text='First\nSecond';
 const result=sourceImageInsertionChanges(text,[{from:0,to:5},{from:0,to:text.length}]);
 assert.equal(result.reason,'multiline');
 assert.equal(result.changes,null);
 assert.equal(formatSourceImageSelection(text,0,text.length).change,null);
}
{
 const text='Safe\n~~~js\nconst x=1;\n~~~\nText';
 const inside=text.indexOf('const'),safe=text.indexOf('Safe');
 assert.equal(sourceImageInsertionChanges(text,[
  {from:safe,to:safe+4},{from:inside,to:inside+5}
 ]).reason,'protected');
 assert.equal(formatSourceImageSelection(text,inside,inside+5).change,null);
 assert.equal(sourceImageInsertionChanges(text,[]).changes,null);
 assert.equal(formatSourceImageSelection(text,-1,2).reason,'protected');
}
console.log('Image toolbar source preservation: passed');
