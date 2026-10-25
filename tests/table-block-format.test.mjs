import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {formatBlockSelection} from '../js/ui/table-block-format.js';
const dom=new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window=dom.window;
globalThis.document=dom.window.document;

function setup(html){
 document.body.innerHTML='<div id="editor" contenteditable="true">'+html+'</div>';
 const editor=document.getElementById('editor'),selection=window.getSelection();
 selection.removeAllRanges();
 return {editor,selection};
}
function select(selection,start,startOffset,end,endOffset,backward=false){
 const range=document.createRange();
 range.setStart(start,startOffset);range.setEnd(end,endOffset);
 selection.removeAllRanges();selection.addRange(range);
 if(backward)selection.setBaseAndExtent(end,endOffset,start,startOffset);
}

{
 const {editor,selection}=setup('<p>Alpha <em>italic</em> finish</p>'+
  '<ul><li>Bravo</li><li>Charlie</li></ul><blockquote><p>Delta</p></blockquote>');
 const original=editor.textContent;
 const p=editor.querySelector('p'),li=editor.querySelectorAll('li');
 select(selection,p.firstChild,2,li[1].firstChild,3);
 assert.deepEqual(formatBlockSelection(editor,'strong',selection),{ok:true,count:5});
 assert.equal(editor.textContent,original,'content never reordered or duplicated');
 assert.deepEqual([...editor.children].map(x=>x.tagName),['P','UL','BLOCKQUOTE']);
 assert.deepEqual([...editor.querySelectorAll('ul > li')].map(x=>x.textContent),['Bravo','Charlie']);
 assert.equal(p.querySelector('strong').textContent,'pha ');
 assert.equal(p.querySelector('em > strong').textContent,'italic');
 assert.equal(li[0].querySelector('strong').textContent,'Bravo');
 assert.equal(li[1].querySelector('strong').textContent,'Cha');
 assert.equal(li[1].textContent,'Charlie');
 assert.equal(editor.querySelector('blockquote p').textContent,'Delta');
 assert.equal(selection.rangeCount,1);
 assert.equal(selection.toString(),'pha italic finishBravoCha');
}
{
 const {editor,selection}=setup('<blockquote><p>Quoted <a href="https://example.org">link</a></p></blockquote>'+
  '<ol type="i"><li>One</li><li><em>Two</em></li></ol>');
 const original=editor.textContent;
 const first=editor.querySelector('blockquote p').firstChild,last=editor.querySelector('em').firstChild;
 select(selection,first,0,last,3,true);
 const result=formatBlockSelection(editor,'u',selection);
 assert.equal(result.ok,true);
 assert.equal(editor.textContent,original);
 assert.equal(editor.querySelector('blockquote p > u').textContent,'Quoted ');
 assert.equal(editor.querySelector('a > u').textContent,'link');
 assert.equal(editor.querySelector('em > u').textContent,'Two');
 assert.equal(editor.querySelector('ol').getAttribute('type'),'i');
 assert.equal(selection.rangeCount,1);
}
{
 const {editor,selection}=setup('<p>Before</p><pre><code>let x=1</code></pre><p>After</p>');
 const start=editor.firstElementChild.firstChild,end=editor.lastElementChild.firstChild;
 select(selection,start,1,end,3);
 const before=editor.innerHTML;
 assert.deepEqual(formatBlockSelection(editor,'em',selection),{ok:false,reason:'unsafe-block'});
 assert.equal(editor.innerHTML,before,'no partial formatting across a pre/code block');
}
{
 const {editor,selection}=setup('<p>Before <code>inline()</code> after</p>');
 const p=editor.querySelector('p');
 select(selection,p.firstChild,1,p.lastChild,2);
 const before=editor.innerHTML;
 assert.equal(formatBlockSelection(editor,'strong',selection).reason,'unsafe-block');
 assert.equal(editor.innerHTML,before);
}
{
 const {editor,selection}=setup('<p>Alpha Beta</p>');
 const text=editor.querySelector('p').firstChild;
 select(selection,text,6,text,10);
 assert.deepEqual(formatBlockSelection(editor,'em',selection),{ok:true,count:1});
 assert.equal(editor.innerHTML,'<p>Alpha <em>Beta</em></p>');
 assert.equal(editor.textContent,'Alpha Beta');
 assert.equal(formatBlockSelection(editor,'script',selection).ok,false);
}
{
 const {editor,selection}=setup('<p>Text</p>');
 const text=editor.querySelector('p').firstChild;
 select(selection,text,0,text,0);
 assert.deepEqual(formatBlockSelection(editor,'strong',selection),{ok:false,reason:'no-selection'});
 assert.equal(editor.innerHTML,'<p>Text</p>');
}
{
 const {editor,selection}=setup('<p>Inside</p><ul><li>Item</li></ul>');
 const outside=document.createElement('p');outside.textContent='Outside';document.body.append(outside);
 select(selection,editor.querySelector('p').firstChild,1,outside.firstChild,3);
 assert.equal(formatBlockSelection(editor,'strong',selection).ok,false);
 assert.equal(editor.querySelector('strong'),null);
}
console.log('PASS: #6 source-safe partial and cross-block inline formatting preserves structure and selection');
