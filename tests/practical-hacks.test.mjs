import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {PRACTICAL_HACKS,PRACTICAL_HACKS_UI,practicalHacksText} from '../js/data/practical-hacks.js';

const win=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/'}).window;
Object.assign(globalThis,{DOMParser:win.DOMParser,document:win.document,Node:win.Node,location:win.location,localStorage:{getItem:()=>null,setItem:()=>{}}});
const {markdownToHTML}=await import('../js/ui/preview.js');
const ids=PRACTICAL_HACKS.map(item=>item.id);
assert.equal(ids.length,10);
assert.equal(new Set(ids).size,ids.length);
for(const lang of ['en','cs','uk','ro','ru']){
 const labels=practicalHacksText(lang);
 assert(labels.heading&&labels.intro&&PRACTICAL_HACKS_UI[lang]);
 for(const item of PRACTICAL_HACKS){
  assert(labels.entries[item.id]?.title,lang+': missing title '+item.id);
  assert(labels.entries[item.id]?.note,lang+': missing caution '+item.id);
  assert(labels.levels[item.level],lang+': missing portability label '+item.id);
 }
}
assert.equal(practicalHacksText('unrecognized'),PRACTICAL_HACKS_UI.en);
const lookup=Object.fromEntries(PRACTICAL_HACKS.map(item=>[item.id,item]));
const htmlFor=id=>markdownToHTML(lookup[id].code,'gfm',{extensions:false});
for(const item of PRACTICAL_HACKS){
 const source=item.code,html=htmlFor(item.id);
 assert(html.length>0,item.id+' renders blank');
 assert(!/<(?:script|iframe|style|video|object)\b/i.test(html),item.id+' contains executable embed');
 assert(!/\s(?:onerror|onclick|onload)\s*=/i.test(html),item.id+' contains handler');
 assert(!/javascript:/i.test(html),item.id+' contains unsafe URL');
 assert.equal(lookup[item.id].code,source,'source mutated');
}
assert.match(htmlFor('portable-callout'),/<blockquote>/);
assert.match(htmlFor('portable-callout'),/<strong>Note:<\/strong>/);
assert.equal((htmlFor('table-pipe').match(/<td\b/g)||[]).length,4);
assert.match(htmlFor('table-pipe'),/A \| B/);
assert.match(htmlFor('table-pipe'),/C \| D/);
assert.match(htmlFor('table-break'),/<br\s*\/?>/);
assert.match(htmlFor('table-break'),/<strong>Important<\/strong>/);
assert.match(htmlFor('html-cell-list'),/<td>\s*<ul>/);
assert.match(htmlFor('html-cell-list'),/<li>One<\/li>/);
assert(!htmlFor('author-reference').includes('Internal:'));
assert(!htmlFor('author-html-comment').includes('Editor:'));
assert(htmlFor('author-reference').includes('Public text'));
assert(htmlFor('author-html-comment').includes('Public text'));
assert.match(htmlFor('video-link'),/<a href="https:\/\/example.com\/watch"/);
assert.match(htmlFor('video-thumbnail'),/<a href="https:\/\/example.com\/watch"/);
assert.match(htmlFor('video-thumbnail'),/<img src="https:\/\/placehold.co\/320x180\/png"/);
assert.match(htmlFor('nested-quote'),/<blockquote>/);
assert.match(htmlFor('entities-and-unicode'),/©/);
assert.match(htmlFor('entities-and-unicode'),/العربية/);
assert(!markdownToHTML(lookup['table-pipe'].code,'commonmark',{extensions:false}).includes('<table'));
console.log('PASS: #16 ten practical hacks, 5 locales, safe Preview, portability semantics');
