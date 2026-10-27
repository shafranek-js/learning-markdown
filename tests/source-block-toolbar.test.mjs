import assert from 'node:assert/strict';
import {sourceBlockToolbarChanges,formatSourceBlockToolbarSelection} from '../js/core/source-block-toolbar.js';

const apply=(s,changes)=>changes.reduceRight((text,e)=>
 text.slice(0,e.from)+e.insert+text.slice(e.to),s);

{
 const src='Before Alpha After',start=src.indexOf('Alpha');
 const result=formatSourceBlockToolbarSelection(src,start,start+5,'hr');
 assert.equal(result.text,'Before Alpha\n\n---\n\n After');
 assert.equal(result.start,result.text.length-' After'.length);
 assert.equal(result.end,result.start);
 assert(result.text.includes('Alpha'));
 assert(result.text.endsWith(' After'));
}
{
 const src='Before Alpha After',start=src.indexOf('Alpha');
 const result=formatSourceBlockToolbarSelection(src,start,start+5,'spoiler');
 assert.equal(result.text,
  'Before \n<details>\n<summary>More information</summary>\n\nAlpha\n</details>\n After');
 assert.equal(result.text.slice(result.start,result.end),'Alpha');
 assert.equal(result.text.slice(0,7),'Before ');
}
{
 const src='First\nSecond\nLast',start=src.indexOf('First'),end=src.indexOf('Last');
 const result=formatSourceBlockToolbarSelection(src,start,end,'spoiler');
 assert(result.text.includes('First\nSecond\n</details>\n'));
 assert.equal(result.text.slice(result.start,result.end),'First\nSecond\n');
 assert(result.text.endsWith('Last'));
}
{
 const src='A\nA\nA',ranges=[{from:0,to:1},{from:2,to:3},{from:4,to:5}];
 for(const kind of ['hr','spoiler']){
  const edits=sourceBlockToolbarChanges(src,ranges,kind);
  assert.equal(edits.length,3);
  const updated=apply(src,edits);
  assert.equal((updated.match(/\bA\b/g)||[]).length,3);
  assert.equal((updated.match(kind==='hr'?/\n---\n/g:/<details>/g)||[]).length,3);
 }
}
{
 const source='Prefix';
 const hr=formatSourceBlockToolbarSelection(source,6,6,'hr');
 const spoiler=formatSourceBlockToolbarSelection(source,6,6,'spoiler');
 assert.equal(hr.text,'Prefix\n\n---\n\n');
 assert.equal(spoiler.text,'Prefix\n\n<details>\n<summary>More information</summary>\n\nHidden content\n</details>\n');
 assert.equal(hr.start,hr.text.length);
 assert.equal(spoiler.start,spoiler.text.length);
}
{
 const src='Plain\n~~~md\n# literal\n~~~\nRest';
 const unsafe=src.indexOf('literal');
 for(const kind of ['hr','spoiler']){
  assert.equal(formatSourceBlockToolbarSelection(src,unsafe,unsafe+7,kind),null);
  assert.equal(sourceBlockToolbarChanges(src,[{from:0,to:5},{from:unsafe,to:unsafe+7}],kind),null);
  assert.equal(formatSourceBlockToolbarSelection(src,-1,0,kind),null);
 }
 assert.equal(sourceBlockToolbarChanges(src,[{from:0,to:5}],'unknown'),null);
 assert.equal(sourceBlockToolbarChanges(src,[],'hr'),null);
}
console.log('Block toolbar selection-safe HR and Spoiler: passed');
