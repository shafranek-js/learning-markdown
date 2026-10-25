import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {marked} from 'marked';
import {findEditableTables,editTableAt,previewTableCoordinates,getTableCellText,setTableCellText,tableSelectionBounds,getTableCellHTML,setTableCellHTML,sanitizeInlineCellHTML} from '../js/core/table-operations.js';
import {sanitizeHTML} from '../js/core/sanitize.js';

const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/'});
globalThis.DOMParser=dom.window.DOMParser;
globalThis.document=dom.window.document;
globalThis.Node=dom.window.Node;
globalThis.location=dom.window.location;

const source='# Before\n\n| A | B |\n| --- | --- |\n| Alpha | Beta |\n\nAfter';
const select=(row=1,col=0,other)=>({row,col,other});
const apply=(src,op,selected=select())=>editTableAt(src,0,op,selected);
assert.equal(findEditableTables(source).length,1);
assert.equal(findEditableTables(source)[0].type,'gfm');
const row=apply(source,'row-below');
assert(row&&row.text.startsWith('# Before')&&row.text.endsWith('After'));
assert.equal(marked.lexer(row.text,{gfm:true}).find(t=>t.type==='table').rows.length,2);
assert(!row.text.trim().startsWith('<table'));
const col=apply(source,'column-right');
assert.equal(marked.lexer(col.text,{gfm:true}).find(t=>t.type==='table').header.length,3);
assert(col.text.includes('Alpha'));
const delRow=apply(source,'delete-row');
assert.equal(marked.lexer(delRow.text,{gfm:true}).find(t=>t.type==='table').rows.length,0);
const delCol=apply(source,'delete-column');
assert.equal(marked.lexer(delCol.text,{gfm:true}).find(t=>t.type==='table').header.length,1);
assert.equal(apply('| A |\n| --- |\n','delete-column',select(0,0)),null);
const merged=apply(source,'merge-right');
assert(merged.text.includes('<table')&&merged.text.includes('colspan="2"'));
assert(merged.text.includes('Alpha<br>Beta'),'merging must preserve all cell content');
assert(merged.text.includes('After'));
assert.equal(findEditableTables(merged.text).length,1);
assert.equal(findEditableTables(merged.text)[0].type,'html');
const split=apply(merged.text,'split');
assert(split.text.includes('Alpha<br>Beta')&&!split.text.includes('colspan="2"'));
const colored=apply(source,'cell-blue');
assert(colored.text.includes('af-cell-blue')&&colored.text.includes('<table'));
assert(!colored.text.includes('onclick'));
const bordered=apply(source,'borderless');
assert(bordered.text.includes('af-table-borderless'));
const rect=apply(source,'merge',select(0,0,{row:1,col:1}));
assert(rect.text.includes('rowspan="2"')&&rect.text.includes('colspan="2"'));
for(const content of ['A','B','Alpha','Beta'])assert(rect.text.includes(content));
const parsed=new DOMParser().parseFromString(marked.parse(source,{gfm:true}),'text/html').querySelector('table');
assert.deepEqual(previewTableCoordinates(parsed,parsed.querySelector('tbody td:last-child')),{row:1,col:1,rs:1,cs:1});
const withSpan=apply(source,'merge-down',select(0,0));
assert(withSpan.text.includes('rowspan="2"'));
const insertThroughSpan=apply(withSpan.text,'row-below',select(0,1));
assert(insertThroughSpan.text.includes('rowspan="3"')||insertThroughSpan.text.includes('rowspan="2"'));
const afterCol=apply(withSpan.text,'column-right',select(0,0));
assert(afterCol&&afterCol.text.includes('Alpha'));
assert.equal(apply(source,'merge',select(0,0,{row:55,col:0})),null);
const html='<table class="af-table-outline"><tr><td class="af-cell-mint">A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>';
assert.equal(findEditableTables(html)[0].type,'html');
const safe=apply(html,'merge',select(0,0,{row:1,col:1}));
assert(safe.text.includes('rowspan="2"')&&safe.text.includes('colspan="2"'));
const bg=apply(html,'cell-sand',select(0,0));
assert(bg.text.includes('af-cell-sand')&&!bg.text.includes('af-cell-mint'));
const malicious=apply('<table><tr><td onclick="alert(1)">Hello</td><td><img src=x onerror="alert(1)"></td></tr></table>','merge-right',select(0,0));
assert(malicious&& !/onclick=|onerror=|<script/i.test(malicious.text));
const fenced='~~~html\n<table><tr><td>Sample</td></tr></table>\n~~~';
assert.equal(findEditableTables(fenced).length,0);
const mixed='| H |\n| --- |\n\n<table><tr><td>B</td></tr></table>';
assert.equal(findEditableTables(mixed).length,2);
const second=editTableAt(mixed,1,'cell-blue',select(0,0));
assert(second&&second.text.includes('af-cell-blue')&&second.text.startsWith('| H |'));

const editSource='Before\n\n| Product | Qty |\n| --- | --- |\n| Widget | 2 |\n\nAfter';
assert.equal(getTableCellText(editSource,0,1,0),'Widget');
const updatedCell=setTableCellText(editSource,0,1,0,'A | <script>');
assert(updatedCell.text.includes('A \\| &lt;script&gt;')&&!updatedCell.text.includes('<table'));
assert(updatedCell.text.startsWith('Before')&&updatedCell.text.endsWith('After'));
assert.equal(getTableCellText(updatedCell.text,0,1,0),'A | &lt;script&gt;');
assert.equal(setTableCellText(editSource,0,1,1,'Bad\nvalue'),null);
assert.equal(setTableCellText(editSource,0,10,0,'Bad'),null);
const mergedText='<table><tbody><tr><td colspan="2"><strong>Rich</strong></td></tr><tr><td>One</td><td>Two</td></tr></tbody></table>';
assert.equal(getTableCellText(mergedText,0,0,0),'Rich');
const changedMerged=setTableCellText(mergedText,0,0,0,'Safe <img onerror="go()">');
assert(changedMerged.text.includes('colspan="2"'));
assert(changedMerged.text.includes('&lt;img')&&!changedMerged.text.includes('<img'));
assert(changedMerged.text.includes('One')&&changedMerged.text.includes('Two'));


const complicated='<table class="af-table-outline">'+
 '<tr><td>A</td><td>B</td><td>C</td></tr>'+
 '<tr><td colspan="2">D</td><td>E</td></tr>'+
 '<tr><td>F</td><td>G</td><td>H</td></tr></table>';
const partial=select(0,1,{row:2,col:1});
assert.deepEqual(tableSelectionBounds(complicated,0,partial),{r0:0,r1:2,c0:0,c1:1});
const closed=apply(complicated,'merge',partial);
assert(closed,'partial intersection of a merged owner must expand to a full rectangle');
const closedTable=new DOMParser().parseFromString(closed.text,'text/html').querySelector('table');
const owner=closedTable.querySelector('td[rowspan="3"][colspan="2"]');
assert(owner,'expanded region contains all three rows and both columns');
for(const value of ['A','B','D','F','G'])assert(owner.textContent.includes(value));
for(const value of ['C','E','H'])assert(closedTable.textContent.includes(value));
assert.equal(closedTable.querySelectorAll('td').length,4);
assert.equal(getTableCellText(closed.text,0,1,1),owner.textContent);
const repeatMerge=apply(closed.text,'merge',select(0,0,{row:2,col:1}));
assert.equal(repeatMerge,null,'merging one existing owner is a no-op');

const wideTop='<table><tr><td colspan="2">Top</td><td>Right</td></tr>'+
 '<tr><td>Below 1</td><td>Below 2</td><td>Below 3</td></tr></table>';
const rightOfSpan=apply(wideTop,'merge-right',select(0,0));
assert(rightOfSpan?.text.includes('colspan="3"'));
assert(rightOfSpan.text.includes('Top<br>Right'));
const belowSpan=apply(wideTop,'merge-down',select(0,0));
assert(belowSpan?.text.includes('rowspan="2"'));
assert(belowSpan.text.includes('colspan="2"'));
for(const value of ['Top','Below 1','Below 2'])assert(belowSpan.text.includes(value));
assert(belowSpan.text.includes('Below 3'));
assert.equal(apply(wideTop,'merge-right',select(0,2)),null,'right edge must not wrap');
assert.equal(tableSelectionBounds(wideTop,0,select(0,0,{row:80,col:1})),null);
assert.equal(tableSelectionBounds(wideTop,0,select(0,0,{row:0.4,col:1})),null);
const nestedHTML='<table><tr><td>Outer<table><tr><td>Inner</td></tr></table></td></tr></table>';
assert.equal(tableSelectionBounds(nestedHTML,0,select(0,0)),null);
assert.equal(apply(nestedHTML,'merge-right',select(0,0)),null);


// Rich editing is allowed only for safe inline HTML within standalone tables.
const richSource='Before\n\n<table class="af-table-outline"><tr><td rowspan="2" colspan="2" class="af-cell-mint">'+
 '<strong>Title</strong> <em>italic</em> <a href="https://example.org/guide">read</a>'+
 '</td><td>Other</td></tr><tr><td>More</td></tr></table>\n\nAfter';
const htmlBefore=getTableCellHTML(richSource,0,0,0);
assert(htmlBefore.includes('<strong>Title</strong>'));
assert(htmlBefore.includes('<em>italic</em>'));
assert(htmlBefore.includes('https://example.org/guide'));
assert.equal(getTableCellHTML(richSource,0,1,1),htmlBefore,'merged owner is addressable throughout its span');
assert.equal(getTableCellHTML(editSource,0,1,0),null,'GFM source is never implicitly rewritten');
const modified=setTableCellHTML(richSource,0,0,0,
 '<strong>Updated</strong> <em>italic</em> <a href="https://example.org/guide">read now</a> <u>underlined</u>');
assert(modified?.text.startsWith('Before\n\n'));
assert(modified?.text.endsWith('\n\nAfter'));
assert(modified.text.includes('rowspan="2"'));
assert(modified.text.includes('colspan="2"'));
assert(modified.text.includes('af-cell-mint'));
assert(modified.text.includes('<strong>Updated</strong>'));
assert(modified.text.includes('<em>italic</em>'));
assert(modified.text.includes('<u>underlined</u>'));
assert(modified.text.includes('href="https://example.org/guide"'));
assert(modified.text.includes('Other')&&modified.text.includes('More'));
const safeScript=setTableCellHTML(richSource,0,0,0,'<strong>Valid</strong><span onclick="alert(1)">text</span>');
assert(safeScript&&!/onclick=|<script/.test(safeScript.text),'event handlers removed by sanitizer');
const unsafeLink=setTableCellHTML(richSource,0,0,0,'<a href="javascript:alert(1)">Open</a>');
assert(unsafeLink&&!/javascript:/i.test(unsafeLink.text));
assert.equal(setTableCellHTML(richSource,0,0,0,'<script>alert(1)</script>'),null);
assert.equal(setTableCellHTML(richSource,0,0,0,'<table><tr><td>Nested</td></tr></table>'),null);
assert.equal(setTableCellHTML(richSource,0,0,0,'<p>Block</p>'),null);
assert.equal(setTableCellHTML(richSource,0,0,0,'<img src="https://example.com/a.png">'),null);
assert.equal(setTableCellHTML(richSource,0,0,0,'x'.repeat(2001)),null);
assert.equal(sanitizeInlineCellHTML('<strong>X</strong><em>Y</em><code>Z</code><br>'),
 '<strong>X</strong><em>Y</em><code>Z</code><br>');
assert.equal(sanitizeInlineCellHTML('<svg onload="alert(1)"/>'),null);
assert.equal(getTableCellHTML(nestedHTML,0,0,0),null);
assert.equal(setTableCellHTML(nestedHTML,0,0,0,'Test'),null);

console.log('PASS: source-scoped GFM/HTML table edits, merged grid topology, safety, spans and reversible representations');
