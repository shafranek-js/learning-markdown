import assert from 'node:assert/strict';
import {sourceStandaloneSnippetChanges,formatSourceStandaloneSnippet} from '../js/core/source-standalone-snippet.js';

const example='<div class="af-callout-info">Example</div>';
const apply=(source,changes)=>changes.reduceRight((doc,e)=>
 doc.slice(0,e.from)+e.insert+doc.slice(e.to),source);

{
 const source='Before SELECTED after',start=source.indexOf('SELECTED');
 const out=formatSourceStandaloneSnippet(source,start,start+8,example);
 assert.equal(out.text,'Before SELECTED after\n\n'+example+'\n');
 assert.equal(out.start,out.text.length);
 assert.equal(out.end,out.start);
 assert(out.text.includes('SELECTED'), 'all selected bytes must remain present');
}
{
 const source='Before';
 const out=formatSourceStandaloneSnippet(source,source.length,source.length,example+'\n');
 assert.equal(out.text,'Before\n'+example+'\n');
 assert.equal(out.start,out.text.length);
}
{
 const source='One\nTwo\nThree',start=0,end=source.indexOf('Three');
 const out=formatSourceStandaloneSnippet(source,start,end,example);
 assert.equal(out.text,'One\nTwo\n\n'+example+'\n\nThree');
 assert.equal(out.text.slice(0,start+end),source.slice(0,end));
}
{
 const source='A\nA\nA',ranges=[{from:0,to:1},{from:2,to:3},{from:4,to:5}];
 const changes=sourceStandaloneSnippetChanges(source,ranges,example);
 assert.equal(changes.length,3);
 const updated=apply(source,changes);
 assert.equal((updated.match(/af-callout-info/g)||[]).length,3);
 assert.equal((updated.match(/\bA\b/g)||[]).length,3);
 assert(changes.every(e=>e.to===e.from),'insertion must never delete selected bytes');
}
{
 const source='Head\n~~~js\nconsole.log(1);\n~~~\nTail';
 const inside=source.indexOf('console');
 assert.equal(formatSourceStandaloneSnippet(source,inside,inside+7,example),null);
 assert.equal(sourceStandaloneSnippetChanges(source,[{from:0,to:4},{from:inside,to:inside+7}],example),null);
 assert.equal(formatSourceStandaloneSnippet(source,-1,1,example),null);
 assert.equal(sourceStandaloneSnippetChanges(source,[],example),null);
 assert.equal(formatSourceStandaloneSnippet(source,0,0,''),null);
}
{
 const source='Text [link](https://example.org)';
 const selection=source.indexOf('[link]');
 const snippet='\n\n\x60\x60\x60mermaid\nflowchart LR\n  A --> B\n\x60\x60\x60\n';
 const out=formatSourceStandaloneSnippet(source,selection,selection+6,snippet);
 assert(out.text.startsWith('Text [link](https://example.org)\n\n\x60\x60\x60mermaid'));
 assert(out.text.endsWith('\x60\x60\x60\n'));
}
console.log('Source-safe standalone snippets: passed');
