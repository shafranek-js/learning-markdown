import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {marked} from 'marked';
import {sanitizeHTML} from '../js/core/sanitize.js';
import {ADVANCED_IDS,ADVANCED_LOCALES,advancedLesson,verifyAdvancedLesson} from '../js/data/advanced-lessons.js';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/'});
globalThis.DOMParser=dom.window.DOMParser;
globalThis.document=dom.window.document;
globalThis.Node=dom.window.Node;
globalThis.location=dom.window.location;
const langs=['en','cs','uk','ro','ru'];
const preview=source=>sanitizeHTML(marked.parse(source,{gfm:true,pedantic:false,breaks:false}));
assert.equal(ADVANCED_IDS.length,7);
assert.equal(new Set(ADVANCED_IDS).size,7);
assert.equal(Object.keys(ADVANCED_LOCALES).length,5);
let total=0;
for(const lang of langs){
 for(let n=0;n<7;n++){
  const l=advancedLesson(n,lang);
  assert(l.id===ADVANCED_IDS[n]&&l.track==='advanced','missing lesson '+lang+' '+n);
  assert(l.title&&l.subtitle&&l.theory&&l.initial&&l.hint);
  assert(l.tasks.length===l.examples.length || n===6,'examples and checks mismatch');
  assert(l.tasks.every(t=>t.text.length>8),'missing localized task');
  assert(l.theory.includes('<p>')&&l.theory.includes('<code>'),'missing theory');
  const checks=verifyAdvancedLesson(l,l.hint,preview(l.hint));
  assert(checks.length===l.tasks.length);
  for(const check of checks)assert(check.passed,'localized solution failed '+lang+' '+l.id+' '+check.id+' HTML: '+preview(l.hint).slice(0,600));
  total+=checks.length;
  // Code fences never count as real HTML/Markdown.
  const rendered=preview('```html\n'+l.hint+'\n```');
  assert(!verifyAdvancedLesson(l,l.hint,rendered).every(c=>c.passed),'code fence must not complete '+lang+' '+l.id);
 }
}
assert.equal(total,24*5);
const sandbox=verifyAdvancedLesson(advancedLesson(0,'en'),'<script>alert(1)</script>',preview('<script>alert(1)</script>'));
assert(!sandbox.some(x=>x.passed));
const storageSource=await import('node:fs/promises').then(m=>m.readFile(new URL('../js/core/state.js',import.meta.url),'utf8'));
assert(storageSource.includes('advanced_')&&storageSource.includes('completedAdvancedLessons'));
assert(storageSource.includes("!key.startsWith('advanced_')"),'Core reset must preserve advanced drafts');
const route=await import('../js/core/router.js');
assert(route.LESSON_IDS.slice(-7).join(',')===ADVANCED_IDS.join(','));
console.log('PASS: seven advanced lessons x five languages, 120 checks, safe preview, routing and independent storage');
