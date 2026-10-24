import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {EXTENSIONS_LABS,EXTENSIONS_LAB_TEXT,extensionsLabText,evaluateExtensionsLab} from '../js/data/extensions-track.js';
const win=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/'}).window;
const bogusDraft='x'.repeat(20001);
const storage=JSON.stringify({
 completedLessons:[1,2],completedAdvancedLessons:['04_01'],
 extensionsLabCompleted:['gfm-table-alignment','gfm-table-alignment','unknown'],
 extensionsLabDrafts:{'gfm-table-alignment':'saved work','fenced-code-highlighting':bogusDraft,evil:'should drop'},
 extensionsLabCurrent:'wrong-id'
});
Object.assign(globalThis,{
 DOMParser:win.DOMParser,document:win.document,Node:win.Node,location:win.location,
 localStorage:{getItem:()=>storage,setItem:()=>{}}
});
const {state,resetCourse}=await import('../js/core/state.js');
const {markdownToHTML}=await import('../js/ui/preview.js');
assert.equal(EXTENSIONS_LABS.length,2);
assert.equal(new Set(EXTENSIONS_LABS.map(x=>x.id)).size,2);
assert.equal(state.extensionsLabCurrent,EXTENSIONS_LABS[0].id);
assert.deepEqual(state.extensionsLabCompleted,['gfm-table-alignment']);
assert.equal(state.extensionsLabDrafts['gfm-table-alignment'],'saved work');
assert.equal(state.extensionsLabDrafts['fenced-code-highlighting'],undefined);
assert.equal(state.extensionsLabDrafts.evil,undefined);
assert.deepEqual(state.completedLessons,[1,2]);
assert.deepEqual(state.completedAdvancedLessons,['04_01']);
for(const lang of ['en','cs','uk','ro','ru']){
 const locale=extensionsLabText(lang);
 assert(locale.title&&locale.open&&locale.note&&EXTENSIONS_LAB_TEXT[lang]);
 for(const lab of EXTENSIONS_LABS){
  const item=locale.entry[lab.id];
  assert(item.title&&item.description&&item.portability);
  assert.equal(item.checks.length,lab.checks.length);
  assert(item.checks.every(Boolean));
 }
}
for(const lab of EXTENSIONS_LABS){
 const start=markdownToHTML(lab.starter,'gfm',{extensions:false});
 assert.deepEqual(evaluateExtensionsLab(lab.id,start),[false,false],'starter must be incomplete: '+lab.id);
 const finished=markdownToHTML(lab.example,'gfm',{extensions:false});
 assert.deepEqual(evaluateExtensionsLab(lab.id,finished),[true,true],'example must actually render: '+lab.id);
 const fenced=markdownToHTML('~~~~markdown\n'+lab.example+'\n~~~~','gfm',{extensions:false});
 assert.deepEqual(evaluateExtensionsLab(lab.id,fenced),[false,false],'fenced example is not a solution: '+lab.id);
 const common=markdownToHTML(lab.example,'commonmark',{extensions:false});
 if(lab.id==='gfm-table-alignment')assert.deepEqual(evaluateExtensionsLab(lab.id,common),[false,false]);
}
const attack=markdownToHTML('<img src="javascript:alert(1)" onerror="alert(2)">\n<script>alert(3)</script>','gfm',{extensions:false});
assert(!/<script|onerror=|javascript:/i.test(attack));
assert.deepEqual(evaluateExtensionsLab('invalid','<table></table>'),[]);
resetCourse();
assert.equal(state.extensionsLabDrafts['gfm-table-alignment'],'saved work','core reset must not erase optional lab');
assert.deepEqual(state.extensionsLabCompleted,['gfm-table-alignment'],'core reset must not erase optional progress');
console.log('PASS: #17 two GFM labs, semantic checks, five locales and isolated state normalization');
