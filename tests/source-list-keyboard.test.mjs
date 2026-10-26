import assert from 'node:assert/strict';
import {editMarkdownListKey as edit} from '../js/core/source-list-keyboard.js';

const key=(text,start,name,shiftKey=false,end=start)=>edit(text,start,end,name,{shiftKey});
const enter=text=>key(text,text.length,'Enter');

// Enter continues bullets, numbered lists, and resets task completion.
assert.deepEqual(enter('- First'),{text:'- First\n- ',start:10,end:10});
assert.equal(enter('  * Nested').text,'  * Nested\n  * ');
assert.equal(enter('9. Item').text,'9. Item\n10. ');
assert.equal(enter('3) Item').text,'3) Item\n4) ');
assert.equal(enter('- [x] Done').text,'- [x] Done\n- [ ] ');
assert.equal(enter('  + [X] Checked').text,'  + [X] Checked\n  + [ ] ');
assert.equal(enter('  1. [ ] Task').text,'  1. [ ] Task\n  2. [ ] ');

// Empty items exit the list; do not delete surrounding lines.
assert.deepEqual(enter('- '),{text:'',start:0,end:0});
assert.deepEqual(enter('Before\n  - '),{text:'Before\n',start:7,end:7});
assert.equal(enter('Before\n- \nAfter'),null,'cursor not at last line');
assert.equal(edit('- Item\nAfter',5,5,'Enter'),null,'do not handle Enter before list line ends');
assert.equal(edit('- Item',2,5,'Enter'),null,'do not rewrite noncollapsed selections');
assert.equal(edit('Plain text',10,10,'Enter'),null);
assert.equal(edit('- First\n- Second',4,4,'Enter'),null,'preserve mid-line editing');

// Do not transform list-like text inside fenced code blocks.
const fenced='~~~markdown\n- code\n~~~\n- real';
assert.equal(edit(fenced,15,15,'Tab'),null);
assert.equal(enter(fenced).text,'~~~markdown\n- code\n~~~\n- real\n- ');
const backtick='\x60\x60\x60md\n- code\n\x60\x60\x60\n';
assert.equal(edit(backtick,8,8,'Enter'),null);

// Tab/Shift+Tab alter list nesting without changing item text.
const nested=key('- One',2,'Tab');
assert.deepEqual(nested,{text:'  - One',start:4,end:4});
const unnest=key(nested.text,nested.start,'Tab',true);
assert.deepEqual(unnest,{text:'- One',start:2,end:2});
assert.equal(key('- One',2,'Tab',true),null,'no negative indentation');
assert.equal(key('A normal line',2,'Tab'),null,'fallback is handled by editor');
assert.equal(key('  - One',1,'Tab',true).text,'- One','outdent up to two spaces');

// Multi-line list operations preserve selected source and adjusted selection.
const source='- One\n- Two\nOutside';
const result=key(source,0,'Tab',false,11);
assert.deepEqual(result,{text:'  - One\n  - Two\nOutside',start:2,end:15});
const restored=key(result.text,result.start,'Tab',true,result.end);
assert.deepEqual(restored,{text:source,start:0,end:11});
assert.equal(key(source,0,'Tab',false,source.length),null,
 'mixed list and paragraph selections must not be rewritten');
assert.equal(key('- One\n\n- Two',0,'Tab',false,12),null,
 'selections with blank lines do not get silently normalized');

assert.equal(edit('- One',0,0,'Enter',{shiftKey:true}),null);
assert.equal(edit('- One',5,3,'Tab'),null,'invalid selection');

console.log('PASS: native Markdown list keyboard operations, selection mapping, safe fallbacks and fenced code.');
