import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {convertBlockSelection} from '../js/ui/table-block-convert.js';
const dom=new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window=dom.window;
globalThis.document=dom.window.document;
function setup(html){
 document.body.innerHTML='<div id="cell" contenteditable="true">'+html+'</div>';
 const editor=document.getElementById('cell'),selection=window.getSelection();
 selection.removeAllRanges();return {editor,selection};
}
function select(selection,a,ao,b,bo){
 const range=document.createRange();
 range.setStart(a,ao);range.setEnd(b,bo);
 selection.removeAllRanges();selection.addRange(range);
}
{
 const {editor,selection}=setup('<p>Before</p><p>Alpha <strong>bold</strong></p>'+
  '<ul><li>Beta <em>italic</em></li><li>Gamma</li></ul>'+
  '<p>Delta</p><blockquote><p>After</p></blockquote>');
 const ps=editor.querySelectorAll(':scope > p'),li=editor.querySelectorAll('li');
 select(selection,ps[1].firstChild,2,ps[2].firstChild,3);
 const before=editor.textContent;
 assert.deepEqual(convertBlockSelection(editor,'ol',selection),{ok:true,blocks:1});
 assert.equal(editor.textContent,before);
 assert.deepEqual([...editor.children].map(e=>e.tagName),['P','OL','BLOCKQUOTE']);
 assert.deepEqual([...editor.querySelectorAll(':scope > ol > li')].map(li=>li.textContent),
  ['Alpha bold','Beta italic','Gamma','Delta']);
 assert.equal(editor.querySelector('ol li strong').textContent,'bold');
 assert.equal(editor.querySelector('ol li em').textContent,'italic');
 assert.equal(selection.rangeCount,1);
 assert.equal(selection.toString(),'Alpha boldBeta italicGammaDelta');
}
{
 const {editor,selection}=setup('<p>Before</p><ol type="i"><li>One</li>'+
  '<li><strong>Two</strong></li></ol><p>After</p>');
 const list=editor.querySelector('ol');
 select(selection,list.firstElementChild.firstChild,0,list.lastElementChild.firstChild.firstChild,3);
 assert.deepEqual(convertBlockSelection(editor,'p',selection),{ok:true,blocks:2});
 assert.equal(editor.innerHTML,'<p>Before</p><p>One</p><p><strong>Two</strong></p><p>After</p>');
 assert.equal(editor.textContent,'BeforeOneTwoAfter');
}
{
 const {editor,selection}=setup('<p>A</p><ul><li>B</li><li>C</li></ul><p>D</p>');
 const li=editor.querySelectorAll('li');
 select(selection,li[0].firstChild,0,li[0].firstChild,1);
 const before=editor.innerHTML;
 assert.deepEqual(convertBlockSelection(editor,'ol',selection),
  {ok:false,reason:'partial-or-nested-list'});
 assert.equal(editor.innerHTML,before);
}
{
 const {editor,selection}=setup('<p>A</p><ul><li>B<ul><li>C</li></ul></li></ul><p>D</p>');
 const child=editor.querySelector('li').firstChild;
 select(selection,child,0,child,1);
 const before=editor.innerHTML;
 assert.deepEqual(convertBlockSelection(editor,'p',selection),
  {ok:false,reason:'partial-or-nested-list'});
 assert.equal(editor.innerHTML,before);
}
{
 const {editor,selection}=setup('<p>Before</p><blockquote><p>Quote</p></blockquote><p>After</p>');
 select(selection,editor.firstElementChild.firstChild,0,editor.lastElementChild.firstChild,2);
 const before=editor.innerHTML;
 assert.deepEqual(convertBlockSelection(editor,'ul',selection),{ok:false,reason:'unsupported-block'});
 assert.equal(editor.innerHTML,before);
}
{
 const {editor,selection}=setup('<p>One</p><p>Two</p>');
 const text=editor.firstElementChild.firstChild;
 select(selection,text,0,editor.lastElementChild.firstChild,3);
 assert.deepEqual(convertBlockSelection(editor,'p',selection),{ok:false,reason:'already-formatted'});
 assert.equal(editor.innerHTML,'<p>One</p><p>Two</p>');
}
{
 const {editor,selection}=setup('<p>Before</p><p>Middle</p><p>After</p>');
 const text=editor.children[1].firstChild;
 select(selection,text,1,text,1);
 assert.deepEqual(convertBlockSelection(editor,'ul',selection),{ok:true,blocks:1});
 assert.equal(editor.innerHTML,'<p>Before</p><ul><li>Middle</li></ul><p>After</p>');
}
{
 const {editor,selection}=setup('<p>First</p><ul><li>Second</li></ul>'+
  '<p>Third <em>rich</em></p><blockquote><p>Untouched last</p></blockquote>');
 const first=editor.querySelector('ul > li').firstChild;
 const last=editor.querySelector(':scope > p:nth-of-type(2)').firstChild;
 select(selection,first,0,last,2);
 const initialText=editor.textContent;
 assert.deepEqual(convertBlockSelection(editor,'p',selection),{ok:true,blocks:2});
 assert.deepEqual([...editor.children].map(x=>x.tagName),['P','P','P','BLOCKQUOTE'],
  'a trailing selected paragraph must stay before the next untouched block');
 assert.equal(editor.textContent,initialText);
 assert.equal(editor.children[1].textContent,'Second');
 assert.equal(editor.children[2].querySelector('em').textContent,'rich');
 assert.equal(editor.lastElementChild.textContent,'Untouched last');
}
// A caret in a nested item converts only its direct child list. The outer
// ordered list, its roman numbering, siblings, and deeper sublists survive.
{
 const {editor,selection}=setup('<p>Before</p><ol type="i"><li>Parent<ol type="a">'+
  '<li>Inner A</li><li><em>Inner B</em><ul><li>Deep</li></ul></li></ol>Tail</li>'+
  '<li>Outer second</li></ol><p>After</p>');
 const inner=editor.querySelector('ol > li > ol > li em').firstChild;
 select(selection,inner,2,inner,2);
 const original=editor.textContent;
 assert.deepEqual(convertBlockSelection(editor,'ul',selection),{ok:true,blocks:1});
 assert.equal(editor.textContent,original);
 const outer=editor.querySelector(':scope > ol');
 assert.equal(outer.getAttribute('type'),'i','roman numbering outside selection survives');
 assert.equal(outer.children.length,2);
 assert.equal(outer.firstElementChild.querySelector(':scope > ol'),null);
 const replacement=outer.firstElementChild.querySelector(':scope > ul');
 assert.deepEqual([...replacement.children].map(li=>li.textContent),
  ['Inner A','Inner BDeep']);
 assert.equal(replacement.querySelector('em').textContent,'Inner B');
 assert.equal(replacement.querySelector(':scope > li > ul > li').textContent,'Deep');
 assert.equal(editor.lastElementChild.textContent,'After');
 assert.equal(selection.rangeCount,1);
 assert.equal(selection.anchorNode.isConnected,true);
 assert.deepEqual(convertBlockSelection(editor,'ol',selection),{ok:true,blocks:1},
  'subsequent conversion must still target the nested level');
 assert.equal(outer.getAttribute('type'),'i','outer roman numbering is unchanged');
 assert.equal(outer.firstElementChild.querySelector(':scope > ol').children.length,2);
 assert.deepEqual(convertBlockSelection(editor,'ul',selection),{ok:true,blocks:1});
 assert.equal(outer.firstElementChild.querySelector(':scope > ul').children.length,2);
 assert.equal(editor.textContent,original);
}
// A text selection spanning every nested sibling converts just that level.
{
 const {editor,selection}=setup('<ul><li>Parent<ul><li>One</li>'+
  '<li>Two <strong>strong</strong></li></ul>Tail</li><li>Outside</li></ul>');
 const nested=editor.querySelectorAll('ul > li > ul > li');
 select(selection,nested[0].firstChild,0,nested[1].querySelector('strong').firstChild,6);
 const before=editor.textContent;
 assert.deepEqual(convertBlockSelection(editor,'ol',selection),{ok:true,blocks:1});
 assert.equal(editor.textContent,before);
 assert.equal(editor.querySelector(':scope > ul > li > ul'),null);
 assert.equal(editor.querySelector(':scope > ul > li > ol > li strong').textContent,'strong');
 assert.equal(editor.querySelectorAll(':scope > ul > li').length,2);
 assert.equal(editor.querySelector(':scope > ul > li:last-child').textContent,'Outside');
}
// Partial ranges and ranges spanning nested and parent levels fail atomically.
{
 const html='<ol type="i"><li>Parent<ul><li>One</li><li>Two</li>'+
  '<li>Three</li></ul>Tail</li><li>Outside</li></ol>';
 const {editor,selection}=setup(html);
 const nested=editor.querySelectorAll('ol > li > ul > li');
 // Cross-depth ranges stay invalid even though partial contiguous child
 // ranges are now supported.
 select(selection,nested[0].firstChild,0,
  editor.querySelector(':scope > ol > li:last-child').firstChild,3);
 assert.deepEqual(convertBlockSelection(editor,'ol',selection),
  {ok:false,reason:'partial-or-nested-list'});
 assert.equal(editor.innerHTML,html);
 const parentText=editor.querySelector(':scope > ol > li').firstChild;
 select(selection,parentText,0,nested[0].firstChild,2);
 assert.deepEqual(convertBlockSelection(editor,'ul',selection),
  {ok:false,reason:'partial-or-nested-list'});
 assert.equal(editor.innerHTML,html);
}
// A caret in a simple nested list converts ALL its items to paragraphs
// inside the parent LI while preserving outside siblings.
{
 const html='<ul><li>Parent<ul><li>One</li><li><em>Two</em></li>'+
  '</ul>Tail</li><li>Neighbor</li></ul>';
 const {editor,selection}=setup(html);
 const text=editor.querySelector('ul > li > ul > li').firstChild;
 select(selection,text,2,text,2);
 assert.deepEqual(convertBlockSelection(editor,'p',selection),{ok:true,blocks:2});
 assert.equal(editor.innerHTML,
  '<ul><li>Parent<p>One</p><p><em>Two</em></p>Tail</li><li>Neighbor</li></ul>');
 assert.equal(selection.anchorNode.isConnected,true);
}
// Never flatten deeper nested lists or discard attributes on a selected LI.
{
 for(const html of [
  '<ul><li>Parent<ul><li>One<ul><li>Deep</li></ul></li></ul></li></ul>',
  '<ul><li>Parent<ul><li title="Keep">One</li></ul></li></ul>'
 ]){
  const {editor,selection}=setup(html),li=editor.querySelector('ul > li > ul > li');
  const text=li.firstChild;
  select(selection,text,1,text,1);
  assert.deepEqual(convertBlockSelection(editor,'p',selection),
   {ok:false,reason:'nested-to-paragraph'});
  assert.equal(editor.innerHTML,html);
 }
}
// Partial Roman nested list to paragraphs retains before/suffix numbering,
// markup, the outer list and the untouched text order.
{
 const html='<ol type="A"><li>Parent<ol type="i" start="5">'+
  '<li>Alpha</li><li><strong>Bravo</strong></li><li>Charlie</li>'+
  '<li>Delta</li></ol>Tail</li><li>Neighbor</li></ol>';
 const {editor,selection}=setup(html),items=editor.querySelectorAll('ol > li > ol > li');
 select(selection,items[1].querySelector('strong').firstChild,0,
  items[2].firstChild,7);
 const original=editor.textContent;
 assert.deepEqual(convertBlockSelection(editor,'p',selection),{ok:true,blocks:2});
 const parent=editor.querySelector(':scope > ol > li');
 assert.deepEqual([...parent.children].map(el=>el.tagName),['OL','P','P','OL']);
 assert.equal(parent.children[0].getAttribute('start'),'5');
 assert.equal(parent.children[3].getAttribute('start'),'8');
 assert.equal(parent.children[3].getAttribute('type'),'i');
 assert.equal(parent.children[1].innerHTML,'<strong>Bravo</strong>');
 assert.equal(editor.textContent,original);
 assert.equal(selection.anchorNode.isConnected,true);
}
// Partial nested range: split an ordered Roman list into three sibling lists,
// carrying ordinal continuity in a bounded 'start' on its remaining suffix.
{
 const html='<ol type="A"><li>Outer<ol type="i" start="5">'+
  '<li>Alpha</li><li>Bravo <em>rich</em></li><li>Charlie</li>'+
  '<li>Delta</li><li>Echo</li></ol>Tail</li><li>Neighbor</li></ol>';
 const {editor,selection}=setup(html),nested=editor.querySelectorAll(':scope > ol > li > ol > li');
 const original=editor.textContent;
 select(selection,nested[1].firstChild,0,nested[2].firstChild,7);
 assert.deepEqual(convertBlockSelection(editor,'ul',selection),{ok:true,blocks:1});
 assert.equal(editor.textContent,original,'the same text must retain document order');
 const outer=editor.querySelector(':scope > ol');
 assert.equal(outer.getAttribute('type'),'A');
 const segments=[...outer.firstElementChild.children].filter(x=>['OL','UL'].includes(x.tagName));
 assert.deepEqual(segments.map(x=>x.tagName),['OL','UL','OL']);
 assert.equal(segments[0].getAttribute('type'),'i');
 assert.equal(segments[0].getAttribute('start'),'5');
 assert.equal(segments[0].textContent,'Alpha');
 assert.equal(segments[1].querySelectorAll(':scope > li').length,2);
 assert.equal(segments[1].querySelector('em').textContent,'rich');
 assert.equal(segments[2].getAttribute('type'),'i');
 assert.equal(segments[2].getAttribute('start'),'8');
 assert.equal(segments[2].textContent,'DeltaEcho');
 assert.equal(outer.lastElementChild.textContent,'Neighbor');
 assert.deepEqual(convertBlockSelection(editor,'ol',selection),{ok:true,blocks:1},
  'consecutive conversion should target only the middle list');
 assert.equal(segments[2].getAttribute('start'),'8');
 assert.equal(outer.getAttribute('type'),'A');
 assert.equal(editor.textContent,original);
}
// Selecting one nested item produces separated lists without losing siblings.
{
 const {editor,selection}=setup('<ul><li>Root<ul><li>First</li>'+
  '<li><strong>Middle</strong><ul><li>Deeper</li></ul></li>'+
  '<li>Last</li></ul></li><li>Outside</li></ul>');
 const children=editor.querySelectorAll(':scope > ul > li > ul > li');
 const original=editor.textContent;
 const text=children[1].querySelector('strong').firstChild;
 select(selection,text,1,text,3);
 assert.deepEqual(convertBlockSelection(editor,'ol',selection),{ok:true,blocks:1});
 const parent=editor.querySelector(':scope > ul > li');
 assert.deepEqual([...parent.children].map(el=>el.tagName),['UL','OL','UL']);
 assert.equal(parent.querySelector(':scope > ol > li > ul > li').textContent,'Deeper');
 assert.equal(editor.textContent,original);
 assert.equal(editor.querySelector(':scope > ul > li:last-child').textContent,'Outside');
}
// Refuse overflowing ordinal suffix rather than silently renumbering.
{
 const html='<ol><li>Parent<ol start="99999"><li>One</li><li>Two</li>'+
  '<li>Three</li></ol></li></ol>';
 const {editor,selection}=setup(html),li=editor.querySelector('ol > li > ol > li');
 select(selection,li.firstChild,0,li.firstChild,3);
 assert.deepEqual(convertBlockSelection(editor,'ul',selection),
  {ok:false,reason:'partial-or-nested-list'});
 assert.equal(editor.innerHTML,html);
}
// Issue #57: metadata on any wrapper that would be rebuilt must never
// disappear silently, even if the draft has received rich HTML before Save.
{
 const html='<p title="Keep original paragraph label">Alpha</p><p>Beta</p>';
 const {editor,selection}=setup(html),p=editor.querySelectorAll('p');
 select(selection,p[0].firstChild,0,p[1].firstChild,4);
 const original=selection.toString();
 assert.deepEqual(convertBlockSelection(editor,'ul',selection),
  {ok:false,reason:'protected-metadata'});
 assert.equal(editor.innerHTML,html);
 assert.equal(selection.toString(),original);
}
{
 const html='<ul aria-label="Steps"><li>One</li><li>Two</li></ul>';
 const {editor,selection}=setup(html),li=editor.querySelectorAll('li');
 select(selection,li[0].firstChild,0,li[1].firstChild,3);
 assert.deepEqual(convertBlockSelection(editor,'ol',selection),
  {ok:false,reason:'protected-metadata'});
 assert.equal(editor.innerHTML,html);
}
{
 // A mixed selection must be rejected as one operation, not partially
 // rewritten before encountering a protected paragraph.
 const html='<p>First</p><p data-source="original">Second</p><p>Third</p>';
 const {editor,selection}=setup(html),p=editor.querySelectorAll('p');
 select(selection,p[0].firstChild,0,p[2].firstChild,5);
 assert.deepEqual(convertBlockSelection(editor,'ol',selection),
  {ok:false,reason:'protected-metadata'});
 assert.equal(editor.innerHTML,html);
}
{
 const html='<ul><li>Parent<ol data-review="keep"><li>A</li><li>B</li></ol>'+
  '</li><li>Neighbor</li></ul>';
 const {editor,selection}=setup(html),nested=editor.querySelector('ol > li').firstChild;
 select(selection,nested,1,nested,1);
 assert.deepEqual(convertBlockSelection(editor,'ul',selection),
  {ok:false,reason:'protected-metadata'});
 assert.equal(editor.innerHTML,html);
}
{
 // start/type are deliberately modeled numbering parameters and may change
 // with the list type; they do not block otherwise safe operations.
 const html='<ol type="i" start="3"><li>Three</li><li>Four</li></ol>';
 const {editor,selection}=setup(html),items=editor.querySelectorAll('li');
 select(selection,items[0].firstChild,0,items[1].firstChild,4);
 assert.deepEqual(convertBlockSelection(editor,'p',selection),{ok:true,blocks:2});
 assert.equal(editor.innerHTML,'<p>Three</p><p>Four</p>');
}
{
 // Converting the remaining list in a mixed selection must not drop a label,
 // even when that list already has the requested tag.
 const html='<ol aria-label="Preserve numbering label"><li>First</li></ol><p>Second</p>';
 const {editor,selection}=setup(html);
 select(selection,editor.querySelector('li').firstChild,0,
  editor.querySelector('p').firstChild,6);
 assert.deepEqual(convertBlockSelection(editor,'ol',selection),
  {ok:false,reason:'protected-metadata'});
 assert.equal(editor.innerHTML,html);
}
{
 // The HTML sanitizer adds a redundant class to each OL with a type.
 // That auto-generated class must not disable existing list conversions.
 const html='<p>Before</p><ol type="i" class="af-list-lower-roman">'+
  '<li>One</li><li>Two</li></ol><p>After</p>';
 const {editor,selection}=setup(html),items=editor.querySelectorAll('ol > li');
 select(selection,items[0].firstChild,0,items[1].firstChild,3);
 assert.deepEqual(convertBlockSelection(editor,'p',selection),{ok:true,blocks:2});
 assert.equal(editor.innerHTML,'<p>Before</p><p>One</p><p>Two</p><p>After</p>');
}
{
 const html='<ol><li>Root<ol type="i" start="5" class="af-list-lower-roman">'+
  '<li>One</li><li>Two</li><li>Three</li></ol></li></ol>';
 const {editor,selection}=setup(html),items=editor.querySelectorAll('ol > li > ol > li');
 select(selection,items[1].firstChild,0,items[1].firstChild,3);
 assert.deepEqual(convertBlockSelection(editor,'ul',selection),{ok:true,blocks:1});
 const segments=editor.querySelectorAll(':scope > ol > li > ol, :scope > ol > li > ul');
 assert.deepEqual([...segments].map(el=>el.tagName),['OL','UL','OL']);
 assert.equal(segments[0].getAttribute('class'),'af-list-lower-roman');
 assert.equal(segments[2].getAttribute('start'),'7');
}
{
 // Class identity must be derived from the OL type, never an arbitrary
 // class that conversion would erase without warning.
 for(const cls of ['custom','af-list-upper-roman','af-list-lower-roman extra']){
  const html='<ol type="i" class="'+cls+'"><li>Alpha</li></ol>';
  const {editor,selection}=setup(html),text=editor.querySelector('li').firstChild;
  select(selection,text,0,text,5);
  assert.deepEqual(convertBlockSelection(editor,'p',selection),
   {ok:false,reason:'protected-metadata'});
  assert.equal(editor.innerHTML,html);
 }
}
{
 // Merging an already ordered list with a neighboring paragraph would drop
 // start/type metadata even if the result is also an OL; refuse that too.
 const html='<p>Intro</p><ol type="i" start="5"><li>Five</li></ol>';
 const {editor,selection}=setup(html);
 select(selection,editor.querySelector('p').firstChild,0,
  editor.querySelector('li').firstChild,4);
 assert.deepEqual(convertBlockSelection(editor,'ol',selection),
  {ok:false,reason:'protected-metadata'});
 assert.equal(editor.innerHTML,html);
}
{
 // No-op conversion should report already-formatted without modifying the
 // metadata-bearing block.
 const html='<p aria-label="Original paragraph">One</p>';
 const {editor,selection}=setup(html),txt=editor.querySelector('p').firstChild;
 select(selection,txt,1,txt,1);
 assert.deepEqual(convertBlockSelection(editor,'p',selection),
  {ok:false,reason:'already-formatted'});
 assert.equal(editor.innerHTML,html);
}

console.log('PASS: #6 selected paragraph/list structural conversion preserves order and rejects ambiguous sources');
