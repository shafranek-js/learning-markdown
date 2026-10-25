import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {handleBlockListKeydown} from '../js/ui/table-list-keyboard.js';
const dom=new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window=dom.window;
globalThis.document=dom.window.document;
function fixture(html){
 document.body.innerHTML='<div contenteditable="true" id="editable">'+html+'</div>';
 const editor=document.getElementById('editable'),selection=window.getSelection();
 selection.removeAllRanges();
 return {editor,selection};
}
function setCaret(selection,node,offset=0){
 const range=document.createRange();range.setStart(node,offset);range.collapse(true);
 selection.removeAllRanges();selection.addRange(range);
}
function key(editor,keyName,shiftKey=false,onUnsupportedSelection){
 const event=new window.KeyboardEvent('keydown',{key:keyName,shiftKey,cancelable:true});
 const result=handleBlockListKeydown(editor,event,window.getSelection(),onUnsupportedSelection);
 return {result,prevented:event.defaultPrevented};
}
{
 const {editor,selection}=fixture('<ul><li>A <strong>bold</strong></li><li>B <em>italic</em></li><li>C</li></ul>');
 const item=editor.querySelectorAll('li')[1];
 setCaret(selection,item.firstChild,1);
 assert.deepEqual(key(editor,'Tab'),{result:true,prevented:true});
 assert.equal(editor.querySelector('ul > li > ul > li em').textContent,'italic');
 assert.deepEqual(key(editor,'Tab',true),{result:true,prevented:true});
 assert.equal(editor.querySelector('ul > li > ul'),null);
 assert.equal(editor.querySelectorAll('ul > li').length,3);
 assert.equal(editor.querySelector('strong').textContent,'bold');
}
{
 const {editor,selection}=fixture('<ol><li>One</li><li>Two</li><li>Three</li><li>Four</li></ol>');
 const nodes=editor.querySelectorAll('li');
 const range=document.createRange();
 range.setStart(nodes[1].firstChild,0);
 range.setEnd(nodes[2].firstChild,5);
 selection.removeAllRanges();selection.addRange(range);
 assert.equal(key(editor,'Tab').result,true);
 assert.deepEqual([...editor.querySelectorAll('ol > li > ol > li')].map(n=>n.textContent),['Two','Three']);
 assert.equal(key(editor,'Tab',true).result,true);
 assert.deepEqual([...editor.querySelectorAll('ol > li')].map(n=>n.textContent),['One','Two','Three','Four']);
}
{
 const {editor,selection}=fixture('<ul><li>Keep</li><li><br></li></ul><p>After</p>');
 const item=editor.querySelectorAll('li')[1];
 setCaret(selection,item,0);
 assert.equal(key(editor,'Enter').result,true);
 assert.equal(editor.querySelectorAll('ul > li').length,1);
 assert.equal(editor.querySelectorAll('p').length,2);
 assert.equal(editor.querySelector('ul').textContent,'Keep');
}
{
 const {editor,selection}=fixture('<ul><li>Parent<ul><li><strong>Inner</strong></li><li>Child</li></ul></li><li>Last</li></ul>');
 const inner=editor.querySelector('strong').firstChild;
 setCaret(selection,inner,0);
 assert.equal(key(editor,'Backspace').result,true);
 assert.deepEqual([...editor.querySelectorAll('#editable > ul > li')].map(n=>n.textContent),['Parent','InnerChild','Last'],
  'remaining nested siblings must stay AFTER the promoted item');
 assert.equal(editor.querySelector('strong').textContent,'Inner');
}
{
 const {editor,selection}=fixture('<ol><li><em>Intro</em></li><li>Next</li></ol>');
 setCaret(selection,editor.querySelector('em').firstChild,0);
 assert.equal(key(editor,'Backspace').result,true);
 assert.equal(editor.firstElementChild.tagName,'P');
 assert.equal(editor.firstElementChild.querySelector('em').textContent,'Intro');
 assert.equal(editor.querySelectorAll('ol > li').length,1);
}
{
 const {editor,selection}=fixture('<p>Ordinary paragraph</p><ul><li>A</li></ul>');
 setCaret(selection,editor.querySelector('p').firstChild,2);
 assert.equal(key(editor,'Tab').result,false);
 assert.equal(editor.querySelector('ul > li').textContent,'A');
}
{
 const {editor,selection}=fixture('<ul><li>A<ul><li>B</li></ul></li></ul>');
 setCaret(selection,editor.querySelector('ul > li').firstChild,0);
 assert.equal(key(editor,'Backspace').result,false,'cannot flatten parent with nested list');
 assert.equal(editor.querySelectorAll('li').length,2);
}

// Promoting a middle selection must preserve document reading order, including
// the items following the selection, instead of leaving them under the parent
// before the promoted entries.
{
 const {editor,selection}=fixture('<ul><li>Parent<ul><li>A</li><li>B <em>rich</em></li>'+
  '<li>C</li><li>D</li><li>E</li></ul></li><li>After</li></ul>');
 const nested=editor.querySelectorAll('ul > li > ul > li');
 const range=document.createRange();
 range.setStart(nested[1].firstChild,0);
 range.setEnd(nested[2].firstChild,1);
 selection.removeAllRanges();selection.addRange(range);
 assert.deepEqual(key(editor,'Tab',true),{result:true,prevented:true});
 const top=[...editor.querySelectorAll('#editable > ul > li')];
 assert.equal(top.length,4);
 assert.deepEqual(top.map(li=>li.firstChild.textContent.trim()),['Parent','B','C','After']);
 assert.deepEqual([...top[0].querySelectorAll(':scope > ul > li')].map(x=>x.textContent),['A']);
 assert.deepEqual([...top[2].querySelectorAll(':scope > ul > li')].map(x=>x.textContent),['D','E']);
 assert.equal(top[1].querySelector('em').textContent,'rich');
 assert.equal(editor.textContent,'ParentAB richCDEAfter');
 assert.equal(selection.anchorNode.isConnected,true,'selection remains attached');
 assert.equal(selection.focusNode.isConnected,true,'selection endpoints remain attached');
}
// Ordered-list tail metadata and semantic numbering survive outdent.
{
 const {editor,selection}=fixture('<ol><li>Start<ol type="i"><li>One</li>'+
  '<li><strong>Two</strong></li><li>Three</li><li>Four</li></ol></li><li>End</li></ol>');
 const inner=editor.querySelector('strong').firstChild;
 setCaret(selection,inner,1);
 assert.deepEqual(key(editor,'Tab',true),{result:true,prevented:true});
 const top=[...editor.querySelectorAll('#editable > ol > li')];
 assert.deepEqual(top.map(li=>li.firstChild.textContent),['Start','Two','End']);
 assert.deepEqual([...top[0].querySelectorAll(':scope > ol > li')].map(li=>li.textContent),['One']);
 assert.deepEqual([...top[1].querySelectorAll(':scope > ol > li')].map(li=>li.textContent),['Three','Four']);
 assert.equal(top[1].querySelector('ol').getAttribute('type'),'i');
 assert.equal(editor.textContent,'StartOneTwoThreeFourEnd');
}
// Mixed list/paragraph or different list-depth selections must remain intact,
// and Tab must not accidentally move keyboard focus away from the editor.
{
 const html='<p>Before</p><ul><li>One</li><li>Two</li></ul><p>After</p>';
 const {editor,selection}=fixture(html);
 const first=editor.querySelector('li').firstChild;
 const after=editor.lastElementChild.firstChild;
 const range=document.createRange();range.setStart(first,0);range.setEnd(after,3);
 selection.removeAllRanges();selection.addRange(range);
 let warned=0;
 assert.deepEqual(key(editor,'Tab',false,()=>{warned++;}),{result:true,prevented:true});
 assert.equal(warned,1);
 assert.equal(editor.innerHTML,html);
 assert.equal(selection.rangeCount,1);
 // A normal Tab in an ordinary paragraph is not intercepted.
 setCaret(selection,editor.querySelector('p').firstChild,2);
 assert.deepEqual(key(editor,'Tab'),{result:false,prevented:false});
}
{
 const html='<ul><li>Outer<ul><li>Inner</li></ul></li><li>Next</li></ul>';
 const {editor,selection}=fixture(html);
 const inner=editor.querySelector('ul > li > ul > li').firstChild;
 const next=editor.querySelector(':scope > ul > li:last-child').firstChild;
 const range=document.createRange();range.setStart(inner,0);range.setEnd(next,2);
 selection.removeAllRanges();selection.addRange(range);
 let warned=false;
 assert.deepEqual(key(editor,'Tab',true,()=>{warned=true;}),{result:true,prevented:true});
 assert.equal(warned,true);
 assert.equal(editor.innerHTML,html);
}
console.log('PASS: #6 Blocks list keyboard indentation, multi-selection, empty exits, Backspace with stable order and cross-boundary guards');
