import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {marked} from 'marked';
import {RICH_CONTENT,RICH_GROUPS,RICH_LABELS,makeRichSnippet} from '../js/data/rich-content.js';
import {sanitizeHTML} from '../js/core/sanitize.js';
const env=new JSDOM('<!DOCTYPE html><html><body></body></html>',{url:'https://example.com/'});
globalThis.document=env.window.document;globalThis.Node=env.window.Node;
globalThis.DOMParser=env.window.DOMParser;globalThis.location=env.window.location;
assert.equal(RICH_GROUPS.length,3);
assert.equal(RICH_GROUPS.flatMap(k=>RICH_CONTENT[k]).length,14);
for(const [language,locale] of Object.entries(RICH_LABELS)){
 assert(locale.groups.length===3 && locale.items.length===3 && locale.insert,language);
 for(let i=0;i<3;i++)assert.equal(locale.items[i].length,RICH_CONTENT[RICH_GROUPS[i]].length,language+' labels');
}
const safe=(source)=>sanitizeHTML(marked.parse(source,{gfm:true,breaks:false}));
for(const group of RICH_GROUPS){
 for(const template of RICH_CONTENT[group]){
  const source=makeRichSnippet(group,template.id,'','');
  assert(source && source.length>10,'empty '+group+'/'+template.id);
  const output=safe('\n\n'+source+'\n\n');
  assert(output.length>10,'blank preview '+group+'/'+template.id);
  assert(!/<script|onerror=|onclick=|<style/i.test(output),'unexpected unsafe template');
 }
}
let output=safe(makeRichSnippet('tables','colspan'));
assert.match(output,/<th colspan="2">Merged heading<\/th>/);
output=safe(makeRichSnippet('tables','rowspan'));
assert.match(output,/<th rowspan="2">Merged label<\/th>/);
output=safe(makeRichSnippet('tables','colored'));
assert.match(output,/class="af-cell-blue"/);
output=safe(makeRichSnippet('tables','borderless'));
assert.match(output,/class="af-table-borderless"/);
for(const listType of ['a','A','i','I']){
 output=safe(makeRichSnippet('numbering',listType));
 const listElement=new DOMParser().parseFromString(output,'text/html').querySelector('ol');
 assert.equal(listElement?.getAttribute('type'),listType,'List numbering type '+listType);
}
let anchor=makeRichSnippet('blocks','anchor','Target <script>','');
assert(anchor.includes('id="advanced-section"')&&anchor.includes('&lt;script&gt;'));
assert(anchor.includes('[Go to target](#advanced-section)'));
anchor=makeRichSnippet('blocks','anchor','Second target','<div id="advanced-section">Old</div>');
assert(anchor.includes('id="advanced-section-2"'));
const list=makeRichSnippet('numbering','i','First & one\n<script>alert(1)</script>');
assert(list.includes('&amp;')&&list.includes('&lt;script&gt;'));
assert.equal(makeRichSnippet('tables','unknown'),null);
const adversarial=[
 '<table class="af-table-outline evil"><tr><td class="af-cell-mint bad" colspan="2" rowspan="0" style="color:red" onclick="evil()">Safe</td></tr></table>',
 '<ol type="javascript"><li>One</li></ol>',
 '<div id="UPPER" onclick="evil()">Bad ID</div><div id="good-anchor">Good</div><div id="good-anchor">Duplicate</div>',
 '<a href="javascript:alert(1)">Bad URL</a>',
 '<th colspan="999" rowspan="1e1">Bad span</th>'
].join('\n');
output=sanitizeHTML(adversarial);
assert(output.includes('class="af-table-outline"'));
assert(output.includes('class="af-cell-mint"'));
assert(output.includes('colspan="2"'));
assert(!output.includes('evil')&&!output.includes('style=')&&!output.includes('rowspan="0"'));
assert(!output.includes('type="javascript"')&&!output.includes('href="javascript:'));
assert.equal((output.match(/id="good-anchor"/g)||[]).length,1);
assert(!output.includes('id="UPPER"'));
assert(!output.includes('colspan="999"')&&!output.includes('rowspan="1e1"'));
output=sanitizeHTML('<a href="#advanced-section">Jump</a>');
assert(output.includes('href="#advanced-section"')&&!output.includes('target="_blank"'));
console.log('PASS: 14 rich HTML snippets, 5 localizations, merged cells, anchors, lists, sanitizer security');
