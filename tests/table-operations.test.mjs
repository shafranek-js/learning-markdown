import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {marked} from 'marked';
import {findEditableTables,getTableReadOnlyReason,editTableAt,previewTableCoordinates,getTableCellText,setTableCellText,tableSelectionBounds,getTableCellHTML,setTableCellHTML,getTableCellBlocks,setTableCellBlocks,sanitizeBlockCellHTML,sanitizeInlineCellHTML,getTableCellImage,setTableCellImage,getTableCellImageInsertion,insertTableCellImage} from '../js/core/table-operations.js';
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


// #6: The source-backed visual editor must not silently repair malformed
// topology, combine adjacent tables, or erase unsupported table sections.
const adjacentTables='<table><tr><td>First</td></tr></table>'+
 '<table><tr><td>Second</td></tr></table>';
assert.equal(editTableAt(adjacentTables,0,'cell-blue',select(0,0)),null,
 'adjacent independent tables may never be serialized as one');
assert.equal(setTableCellText(adjacentTables,0,0,0,'Lost sibling'),null);
const brokenCells='<table><tr><td>First<td>Second</td></tr></table>';
assert.equal(apply(brokenCells,'merge-right',select(0,0)),null,
 'browser-inserted closing tags must not alter user source');
assert.equal(setTableCellText(brokenCells,0,0,0,'Changed'),null);
const invalidSpan='<table><tr><td colspan="0">First</td><td>Second</td></tr></table>';
assert.equal(apply(invalidSpan,'cell-blue',select(0,0)),null,
 'invalid spans must not be quietly normalized to 1');
const semanticSections='<table><thead><tr><th>Title</th></tr></thead>'+
 '<tbody><tr><td>Value</td></tr></tbody></table>';
assert.equal(apply(semanticSections,'cell-blue',select(1,0)),null,
 'do not silently remove thead/tfoot or captions');
const customSection='<table><tbody class="important"><tr><td>Value</td></tr></tbody></table>';
assert.equal(apply(customSection,'cell-blue',select(0,0)),null,
 'unmodeled section metadata must be preserved by declining visual editing');
// Alignment is allowed by the sanitizer and must survive safe HTML operations,
// including GFM-to-HTML conversion for advanced cell formatting.
const htmlAligned='<table><tr><td align="right">One</td><td align="center">Two</td></tr></table>';
const changedAligned=apply(htmlAligned,'cell-blue',select(0,0));
assert(changedAligned?.text.includes('align="right"'));
assert(changedAligned.text.includes('align="center"'));
const gfmAligned='| Left | Right |\n| :--- | ---: |\n| one | two |\n';
const convertedAligned=apply(gfmAligned,'cell-blue',select(1,0));
assert(convertedAligned?.text.includes('<table'));
assert(convertedAligned.text.includes('align="left"'));
assert(convertedAligned.text.includes('align="right"'));

// Source-side read-only classifications used by the contextual Preview.
assert.equal(getTableReadOnlyReason(source,0),null,'GFM tables remain editable');
assert.equal(getTableReadOnlyReason(html,0),null,'ordinary HTML tables remain editable');
assert.equal(getTableReadOnlyReason(adjacentTables,0),'multiple-roots');
assert.equal(getTableReadOnlyReason(brokenCells,0),'malformed');
assert.equal(getTableReadOnlyReason(invalidSpan,0),'invalid-spans');
assert.equal(getTableReadOnlyReason(semanticSections,0),'unsupported');
assert.equal(getTableReadOnlyReason(customSection,0),'unsupported');
assert.equal(getTableReadOnlyReason(nestedHTML,0),'container');
assert.equal(getTableReadOnlyReason(nestedHTML,1),null,'nested leaf stays editable');
assert.equal(getTableReadOnlyReason('No tables',0),'unmapped');

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



// #6: Only a nested LEAF table is editable. Its parent stays read-only,
// and every change uses the complete enclosing Markdown source block.
const nestedDocument='# Outer\n\n'+
 '<table class="af-table-outline"><tr><td>Intro <strong>keep</strong>'+
 '<table class="af-table-borderless"><tr><td><strong>Alpha</strong></td><td>Beta</td></tr>'+
 '<tr><td>Gamma</td><td>Delta</td></tr></table>'+
 ' Outro</td><td>Sibling</td></tr></table>\n\n# After';
const nestedTables=findEditableTables(nestedDocument);
assert.equal(nestedTables.length,2);
assert.deepEqual(nestedTables.map(entry=>entry.type),['html','nested']);
assert.equal(nestedTables[0].raw,nestedTables[1].raw);
assert.equal(getTableCellText(nestedDocument,0,0,0),null,'outer remains safely read-only');
assert.equal(getTableCellText(nestedDocument,1,0,0),'Alpha');
assert.equal(getTableCellHTML(nestedDocument,1,0,0),'<strong>Alpha</strong>');
assert.deepEqual(tableSelectionBounds(nestedDocument,1,select(0,0,{row:1,col:1})),{r0:0,r1:1,c0:0,c1:1});
assert.equal(tableSelectionBounds(nestedDocument,0,select(0,0)),null);
const nestedChanged=setTableCellHTML(nestedDocument,1,0,0,
 '<em>Updated</em> <a href="https://example.org/docs">help</a>');
assert(nestedChanged?.text.startsWith('# Outer\n\n'));
assert(nestedChanged?.text.endsWith('\n\n# After'));
assert(nestedChanged.text.includes('Intro <strong>keep</strong>'));
assert(nestedChanged.text.includes(' Outro'));
assert(nestedChanged.text.includes('Sibling'));
assert(nestedChanged.text.includes('af-table-borderless'));
assert(nestedChanged.text.includes('af-table-outline'));
assert(nestedChanged.text.includes('<em>Updated</em>'));
assert(nestedChanged.text.includes('href="https://example.org/docs"'));
assert.equal(getTableCellText(nestedChanged.text,1,0,0),'Updated help');
const nestedPlain=setTableCellText(nestedDocument,1,1,0,'Changed | <script>');
assert(nestedPlain.text.includes('Changed | &lt;script&gt;'));
assert(nestedPlain.text.includes('Intro <strong>keep</strong>'));
assert(nestedPlain.text.includes('Sibling'));
assert.equal(findEditableTables(nestedPlain.text).length,2);
const nestedMerged=editTableAt(nestedDocument,1,'merge',select(0,0,{row:1,col:1}));
assert(nestedMerged.text.includes('rowspan="2"')&&nestedMerged.text.includes('colspan="2"'));
assert(nestedMerged.text.includes('Sibling'));
assert(nestedMerged.text.includes('Intro <strong>keep</strong>'));
const nestedOwner=new DOMParser().parseFromString(nestedMerged.text,'text/html').querySelector('table table td');
assert(nestedOwner.textContent.includes('Alpha'));
assert(nestedOwner.textContent.includes('Beta'));
assert(nestedOwner.textContent.includes('Gamma'));
assert(nestedOwner.textContent.includes('Delta'));
const nestedSplit=editTableAt(nestedMerged.text,1,'split',select(0,0));
assert(nestedSplit?.text.includes('Alpha'));
assert.equal(findEditableTables(nestedSplit.text).length,2);
const nestedAdded=editTableAt(nestedDocument,1,'row-below',select(0,0));
assert(nestedAdded&&new DOMParser().parseFromString(nestedAdded.text,'text/html').querySelector('table table').rows.length===3);
assert.equal(editTableAt(nestedDocument,0,'row-below',select(0,0)),null,'parent structure never rewritten');
assert.equal(getTableCellHTML(nestedDocument,1,4,0),null);
assert.equal(setTableCellHTML(nestedDocument,1,0,0,'<script>alert(1)</script>'),null);
assert.equal(setTableCellHTML(nestedDocument,1,0,0,'<table><tr><td>Bad</td></tr></table>'),null);
const doubleNested='<table><tr><td>Top<table><tr><td>Middle'+
 '<table><tr><td>Deep</td></tr></table></td></tr></table></td></tr></table>';
assert.deepEqual(findEditableTables(doubleNested).map(t=>t.type),['html','nested','nested']);
assert.equal(getTableCellText(doubleNested,1,0,0),null);
assert.equal(getTableCellText(doubleNested,2,0,0),'Deep');
const deepEdit=setTableCellText(doubleNested,2,0,0,'Inner changed');
assert(deepEdit?.text.includes('Top'));
assert(deepEdit.text.includes('Middle'));
assert.equal(getTableCellText(deepEdit.text,2,0,0),'Inner changed');
const fencedNested='~~~html\n'+nestedDocument+'\n~~~';
assert.equal(findEditableTables(fencedNested).length,0);


// #6: Mixed block content is editable ONLY via the explicit Blocks mode.
const blockCellSource='# Before\n\n<table class="af-table-outline"><tr><td rowspan="2">'+
 '<p>Introduction <strong>important</strong> <a href="https://example.org/manual">manual</a>.</p>'+
 '<ul><li>First <em>item</em></li><li>Second<ul><li>Nested item</li></ul></li></ul>'+
 '<blockquote><p>Quoted <u>text</u></p></blockquote><pre><code>let x = 1;</code></pre>'+
 '</td><td>Neighbor 1</td></tr><tr><td>Neighbor 2</td></tr></table>\n\n# After';
const initialBlocks=getTableCellBlocks(blockCellSource,0,0,0);
assert(initialBlocks.includes('<p>Introduction'));
assert(initialBlocks.includes('<ul><li>First'));
assert(initialBlocks.includes('Nested item'));
assert(initialBlocks.includes('<blockquote>'));
assert(initialBlocks.includes('<pre><code>let x = 1;</code></pre>'));
assert.equal(getTableCellHTML(blockCellSource,0,0,0),null,'inline mode must refuse mixed block content');
assert.equal(getTableCellBlocks(editSource,0,1,0),null,'GFM pipe tables keep their source representation');
const changedBlocks=setTableCellBlocks(blockCellSource,0,1,0,
 initialBlocks.replace('First <em>item</em>','First <em>revised</em>')+
 '<ol><li>New number</li></ol><p>Ending</p>');
assert(changedBlocks?.text.startsWith('# Before\n\n'));
assert(changedBlocks.text.endsWith('\n\n# After'));
assert(changedBlocks.text.includes('rowspan="2"'));
for(const content of ['manual','Neighbor 1','Neighbor 2','Nested item','Quoted','New number','Ending'])assert(changedBlocks.text.includes(content));
assert(changedBlocks.text.includes('href="https://example.org/manual"'));
assert.equal(getTableCellBlocks(changedBlocks.text,0,0,0).includes('First <em>revised</em>'),true);
assert.equal(setTableCellHTML(blockCellSource,0,0,0,'<strong>Replacement</strong>'),null);
assert.equal(setTableCellBlocks(blockCellSource,0,0,0,'<script>alert(1)</script>'),null);
assert.equal(setTableCellBlocks(blockCellSource,0,0,0,'<table><tr><td>Nested</td></tr></table>'),null);
assert.equal(setTableCellBlocks(blockCellSource,0,0,0,'<img src="https://example.com/image.jpg">'),null);
assert.equal(setTableCellBlocks(blockCellSource,0,0,0,'<button>Button</button>'),null);
assert.equal(setTableCellBlocks(blockCellSource,0,0,0,'<ul><p>Illegal list child</p></ul>'),null);
assert.equal(setTableCellBlocks(blockCellSource,0,0,0,'<li>Orphan</li>'),null);
assert.equal(setTableCellBlocks(blockCellSource,0,0,0,'<style>body{display:none}</style>'),null);
assert.equal(setTableCellBlocks(blockCellSource,0,0,0,'X'.repeat(5001)),null);
assert.equal(sanitizeBlockCellHTML('<p><strong>Safe</strong></p><ul><li>One</li></ul>'),
 '<p><strong>Safe</strong></p><ul><li>One</li></ul>');
const harmlessAttrs=setTableCellBlocks(blockCellSource,0,0,0,
 '<p style="position:absolute" onmouseover="alert(1)">Text</p><a href="javascript:alert(1)">Unsafe link</a>');
assert(harmlessAttrs&&!/onmouseover=|position:absolute|javascript:/i.test(harmlessAttrs.text));
const nestedBlocks='# A\n\n<table><tr><td>Parent <table><tr><td>'+
 '<p>First</p><ul><li>Leaf item</li></ul></td></tr></table> tail</td></tr></table>\n\n# B';
assert.equal(getTableCellBlocks(nestedBlocks,0,0,0),null);
assert(getTableCellBlocks(nestedBlocks,1,0,0).includes('Leaf item'));
const nestedBlockChange=setTableCellBlocks(nestedBlocks,1,0,0,
 '<p>Changed</p><ul><li><strong>Safe</strong> leaf</li></ul>');
assert(nestedBlockChange?.text.includes('Parent'));
assert(nestedBlockChange.text.includes('tail'));
assert(nestedBlockChange.text.includes('<p>Changed</p>'));
assert(nestedBlockChange.text.includes('Safe</strong> leaf'));
assert.equal(findEditableTables(nestedBlockChange.text).length,2);



// #6: Image properties are edited in place without flattening mixed content.
const pictureSrc='Before\n\n<table class="af-table-outline"><tr><td rowspan="2">'+
 '<p>Caption <strong>bold</strong> <a href="https://example.org/guide">guide</a>.</p>'+
 '<img src="https://example.org/old.png" alt="Old picture" width="300" height="150">'+
 '<blockquote><p>Original quote</p></blockquote></td><td>Other cell</td></tr>'+
 '<tr><td>Second cell</td></tr></table>\n\nAfter';
assert.deepEqual(getTableCellImage(pictureSrc,0,0,0),{
 url:'https://example.org/old.png',alt:'Old picture',decorative:false,width:'300',height:'150'
});
assert.equal(getTableCellImage(pictureSrc,0,1,0).url,'https://example.org/old.png');
assert.equal(getTableCellImage(pictureSrc,0,0,1),null);
assert.equal(getTableCellImage(editSource,0,1,0),null,'GFM remains untouched');
const pictureEdit=setTableCellImage(pictureSrc,0,0,0,{
 url:'https://example.org/new.png',alt:'Updated artwork',decorative:false,width:'600',height:''
});
assert(pictureEdit?.text.startsWith('Before\n\n'));
assert(pictureEdit.text.endsWith('\n\nAfter'));
for(const t of ['rowspan="2"','class="af-table-outline"','Other cell','Second cell',
 '<strong>bold</strong>','https://example.org/guide','<blockquote>','Original quote',
 'src="https://example.org/new.png"','alt="Updated artwork"','width="600"'])
 assert(pictureEdit.text.includes(t),'preserves surrounding markup: '+t);
assert(!pictureEdit.text.includes('height="150"'));
assert(!pictureEdit.text.includes('old.png'));
assert.deepEqual(getTableCellImage(pictureEdit.text,0,0,0),{
 url:'https://example.org/new.png',alt:'Updated artwork',decorative:false,width:'600',height:''
});
const decorativePicture=setTableCellImage(pictureSrc,0,0,0,{
 url:'https://example.org/decorative.png',alt:'',decorative:true,width:'',height:''
});
assert(decorativePicture?.text.includes('alt=""'));
assert(!decorativePicture.text.includes('width="300"'));
assert.equal(getTableCellImage(decorativePicture.text,0,0,0).decorative,true);
const badPicture={
 url:'javascript:alert(1)',alt:'Bad',decorative:false,width:'300',height:'150'
};
assert.equal(setTableCellImage(pictureSrc,0,0,0,badPicture),null);
assert.equal(setTableCellImage(pictureSrc,0,0,0,{...badPicture,url:'http://example.org/image.png'}),null);
assert.equal(setTableCellImage(pictureSrc,0,0,0,{...badPicture,url:'data:image/svg+xml,<svg />'}),null);
assert.equal(setTableCellImage(pictureSrc,0,0,0,{...badPicture,url:'https://example.org/x.png',alt:''}),null);
assert.equal(setTableCellImage(pictureSrc,0,0,0,{...badPicture,url:'https://example.org/x.png',width:'1601'}),null);
assert.equal(setTableCellImage(pictureSrc,0,0,0,{...badPicture,url:'https://example.org/x.png',height:'-1'}),null);
assert.equal(setTableCellImage(pictureSrc,0,0,0,{...badPicture,url:'https://example.org/x.png',alt:'x'.repeat(401)}),null);
assert.equal(setTableCellImage(pictureSrc,0,0,0,{...badPicture,url:'https://example.org/'+ 'x'.repeat(2049)}),null);
const twoPictures='<table><tr><td>Both <img src="https://example.org/a.png" alt="A">'+
 '<img src="https://example.org/b.png" alt="B"></td></tr></table>';
assert.equal(getTableCellImage(twoPictures,0,0,0),null);
assert.equal(setTableCellImage(twoPictures,0,0,0,{...badPicture,url:'https://example.org/x.png'}),null);
assert.equal(getTableCellImage('<table><tr><td><img src="http://example.org/a.png" alt="A"></td></tr></table>',0,0,0),null);

const unsafeExisting='<table><tr><td><img src="https://example.org/ok.png" alt="OK">'+
 '<video src="https://example.org/video.mp4"></video></td></tr></table>';
assert.equal(getTableCellImage(unsafeExisting,0,0,0),null,
 'unsupported original foreign/media tags must remain read-only even if sanitizer drops them');
assert.equal(setTableCellImage(unsafeExisting,0,0,0,{
 url:'https://example.org/new.png',alt:'New',decorative:false,width:'',height:''
}),null);
const scriptedExisting='<table><tr><td><img src="https://example.org/ok.png" alt="OK">'+
 '<script>doSomething()</script></td></tr></table>';
assert.equal(getTableCellImage(scriptedExisting,0,0,0),null);
const rejectedSiblingImage='<table><tr><td><img src="https://example.org/ok.png" alt="OK"></td>'+
 '<td><img src="data:image/svg+xml,%3Csvg%3E" alt="Untrusted"></td></tr></table>';
assert.equal(getTableCellImage(rejectedSiblingImage,0,0,0),null,
 'editing one image must not silently delete an unsafe image in another cell');

const figureImage='<table><tr><td><figure class="af-figure">'+
 '<img src="https://example.org/figure.png" alt="Captioned">'+
 '<figcaption><strong>Keep this caption</strong></figcaption></figure>'+
 '<p>And this paragraph</p></td></tr></table>';
const figureUpdated=setTableCellImage(figureImage,0,0,0,{
 url:'https://example.org/revised.png',alt:'New picture',decorative:false,width:'480',height:''
});
assert(figureUpdated?.text.includes('af-figure'));
assert(figureUpdated.text.includes('<figcaption><strong>Keep this caption</strong></figcaption>'));
assert(figureUpdated.text.includes('<p>And this paragraph</p>'));

assert.equal(getTableCellImage(nestedHTML,0,0,0),null);
const nestedImage='<table><tr><td>Outer text <table><tr><td><p>Inner text</p>'+
 '<img src="https://example.org/leaf.png" alt="Leaf"></td></tr></table>'+
 ' Closing text</td></tr></table>';
assert.equal(getTableCellImage(nestedImage,0,0,0),null);
assert.equal(getTableCellImage(nestedImage,1,0,0).url,'https://example.org/leaf.png');
const nestedPictureEdit=setTableCellImage(nestedImage,1,0,0,{
 url:'https://example.org/leaf-new.png',alt:'New leaf',decorative:false,width:'280',height:''
});
assert(nestedPictureEdit?.text.includes('Outer text'));
assert(nestedPictureEdit?.text.includes('Closing text'));
assert(nestedPictureEdit?.text.includes('Inner text'));
assert(nestedPictureEdit?.text.includes('New leaf'));
assert.equal(findEditableTables(nestedPictureEdit.text).length,2);



// #6: Explicit image insertion never overwrites existing formatted cell data.
const emptyImageSource='Header\n\n<table class="af-table-outline"><tr>'+
 '<td rowspan="2"><p>Before <strong>bold</strong> <a href="https://example.org/guide">guide</a></p>'+
 '<ul><li>List item</li></ul><blockquote><p>Quote</p></blockquote></td><td>Sibling</td></tr>'+
 '<tr><td>Last</td></tr></table>\n\nFooter';
assert.deepEqual(getTableCellImageInsertion(emptyImageSource,0,0,0),{format:'html'});
const addImage=insertTableCellImage(emptyImageSource,0,1,0,{
 url:'https://example.org/new.png',alt:'Inserted image',decorative:false,width:'420',height:''
});
assert(addImage?.text.startsWith('Header\n\n'));
assert(addImage.text.endsWith('\n\nFooter'));
for(const token of ['class="af-table-outline"','rowspan="2"','<strong>bold</strong>',
 'https://example.org/guide','<ul>','List item','<blockquote>','Sibling','Last',
 'src="https://example.org/new.png"','alt="Inserted image"','width="420"'])
 assert(addImage.text.includes(token),'preserves existing content: '+token);
assert.deepEqual(getTableCellImage(addImage.text,0,0,0),{
 url:'https://example.org/new.png',alt:'Inserted image',decorative:false,width:'420',height:''
});
assert.equal(getTableCellImageInsertion(addImage.text,0,0,0),null,'duplicate image insertion refused');
assert.equal(insertTableCellImage(addImage.text,0,0,0,{
 url:'https://example.org/two.png',alt:'Second',decorative:false,width:'',height:''
}),null);
const plainHTML='<table><tr><td>First <em>emphasis</em></td><td>Second</td></tr></table>';
const insertedPlain=insertTableCellImage(plainHTML,0,0,0,{
 url:'https://example.org/img.png',alt:'New',decorative:false,width:'',height:''
});
assert(insertedPlain.text.includes('First <em>emphasis</em><br><img'));
assert(insertedPlain.text.includes('<td>Second</td>'));
const decorativeAdded=insertTableCellImage('<table><tr><td></td></tr></table>',0,0,0,{
 url:'https://example.org/decorative.png',alt:'',decorative:true,width:'',height:''
});
assert(decorativeAdded?.text.includes('alt=""'));
assert.equal(getTableCellImage(decorativeAdded.text,0,0,0).decorative,true);
const insertOptions={url:'https://example.org/image.png',alt:'Accessible image',decorative:false,width:'',height:''};
assert.equal(insertTableCellImage(plainHTML,0,0,0,{...insertOptions,url:'javascript:alert(1)'}),null);
assert.equal(insertTableCellImage(plainHTML,0,0,0,{...insertOptions,url:'data:image/svg+xml,<svg>'}),null);
assert.equal(insertTableCellImage(plainHTML,0,0,0,{...insertOptions,url:'http://example.org/x.png'}),null);
assert.equal(insertTableCellImage(plainHTML,0,0,0,{...insertOptions,url:'https://example.org/'+ 'x'.repeat(2100)}),null);
assert.equal(insertTableCellImage(plainHTML,0,0,0,{...insertOptions,alt:''}),null);
assert.equal(insertTableCellImage(plainHTML,0,0,0,{...insertOptions,alt:'a'.repeat(401)}),null);
assert.equal(insertTableCellImage(plainHTML,0,0,0,{...insertOptions,alt:'line\nbreak'}),null);
assert.equal(insertTableCellImage(plainHTML,0,0,0,{...insertOptions,width:'1601'}),null);
assert.equal(insertTableCellImage(plainHTML,0,0,0,{...insertOptions,height:'0'}),null);
assert.equal(getTableCellImageInsertion('<table><tr><td><iframe src="https://example.org"></iframe></td></tr></table>',0,0,0),null);
assert.equal(getTableCellImageInsertion(twoPictures,0,0,0),null);
assert.equal(getTableCellImageInsertion(rejectedSiblingImage,0,0,0),null);
assert.equal(getTableCellImageInsertion(nestedHTML,0,0,0),null);
const nestedInsert='<table><tr><td>Outer <table><tr><td><p>Inner <strong>safe</strong></p></td>'+
 '</tr></table> Final</td></tr></table>';
assert.equal(getTableCellImageInsertion(nestedInsert,0,0,0),null);
assert.deepEqual(getTableCellImageInsertion(nestedInsert,1,0,0),{format:'html'});
const nestedAddedImage=insertTableCellImage(nestedInsert,1,0,0,insertOptions);
assert(nestedAddedImage?.text.includes('Outer'));
assert(nestedAddedImage.text.includes('Final'));
assert(nestedAddedImage.text.includes('<strong>safe</strong>'));
assert.equal(getTableCellImage(nestedAddedImage.text,1,0,0).url,insertOptions.url);
const pipeImageSource='| Item | Notes |\n| --- | --- |\n| First **bold** | Keep text |\n';
assert.deepEqual(getTableCellImageInsertion(pipeImageSource,0,1,0),{format:'gfm'});
const pipeInserted=insertTableCellImage(pipeImageSource,0,1,0,{
 url:'https://example.org/picture(a).png',alt:'Art [test] | sample',decorative:false,width:'',height:''
});
assert(pipeInserted?.text.includes('First **bold**'));
assert(pipeInserted.text.includes('![Art \\[test\\] \\| sample](https://example.org/picture%28a%29.png)'));
assert(pipeInserted.text.includes('| Keep text |'));
assert(!pipeInserted.text.includes('<table'));
assert.equal(marked.lexer(pipeInserted.text,{gfm:true}).find(token=>token.type==='table').rows.length,1);
assert.equal(getTableCellImageInsertion(pipeInserted.text,0,1,0),null);
assert.equal(insertTableCellImage(pipeImageSource,0,1,0,{...insertOptions,width:'300'}),null,
 'GFM image syntax cannot express a pixel width');
assert.equal(getTableCellImageInsertion(fenced,0,0,0),null);

console.log('PASS: source-scoped GFM/HTML table edits, merged grid topology, safety, spans and reversible representations');
