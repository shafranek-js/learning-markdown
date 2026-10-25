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
function key(editor,keyName,shiftKey=false){
 const event=new window.KeyboardEvent('keydown',{key:keyName,shiftKey,cancelable:true});
 const result=handleBlockListKeydown(editor,event);
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
 assert.deepEqual([...editor.querySelectorAll('#editable > ul > li')].map(n=>n.textContent),['ParentChild','Inner','Last']);
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
console.log('PASS: #6 Blocks list keyboard indentation, multi-selection, empty exits, Backspace and non-list guards');
