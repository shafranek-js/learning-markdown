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
console.log('PASS: #6 selected paragraph/list structural conversion preserves order and rejects ambiguous sources');
