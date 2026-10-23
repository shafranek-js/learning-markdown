import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {marked} from 'marked';
import {changeExtension,extensionEnabled,normalizeExtensionSettings,DEFINITION_TEXT} from '../js/core/extensions.js';
const win=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/'}).window;
Object.assign(globalThis,{DOMParser:win.DOMParser,document:win.document,Node:win.Node,location:win.location,
 localStorage:{getItem:()=>null,setItem:()=>{}}});
const {state,docKey}=await import('../js/core/state.js');
const {markdownToHTML}=await import('../js/ui/preview.js');
const render=(source,dialect='gfm',args)=>new JSDOM(markdownToHTML(source,dialect,args)).window.document;
const sample='Term A\nTerm B\n: A **bold** definition\n: Another *italic* definition\n  with multiline detail.\nOther term\n: Link to [guide](https://example.com).\n\nNormal: paragraph';
for(const dialect of ['gfm','commonmark','original']){
 const base=render(sample,dialect);
 assert.equal(base.querySelectorAll('dl').length,0,'base modes unchanged: '+dialect);
}
const key=docKey();
state.extensionSettingsByDocument=changeExtension(state.extensionSettingsByDocument,key,'definitionLists',true);
assert(extensionEnabled(state.extensionSettingsByDocument,key,'gfm','definitionLists'));
assert(!extensionEnabled(state.extensionSettingsByDocument,key,'commonmark','definitionLists'));
const html=render(sample);
const dl=html.querySelector('dl.md-definition-list');
console.log('Definition parse diagnostic:',html.body.innerHTML.slice(0,1600));
assert(dl,'enabled grammar produces definition list');
assert.equal(dl.querySelectorAll('dt').length,3);
assert.equal(dl.querySelectorAll('dd').length,3);
assert(dl.querySelector('strong').textContent==='bold');
assert(dl.querySelector('em').textContent==='italic');
assert(dl.querySelector('a[href="https://example.com"]').textContent==='guide');
assert(dl.textContent.includes('with multiline detail.'));
assert(html.body.textContent.includes('Normal: paragraph'));
assert.equal(render(sample,'commonmark').querySelectorAll('dl').length,0);
assert.equal(render(sample,'original').querySelectorAll('dl').length,0);
assert.equal(render(sample,'gfm',{extensions:false}).querySelectorAll('dl').length,0);
assert.equal(render('This is prose: no definition list.').querySelectorAll('dl').length,0);
assert.equal(render('Term\n\n: Not a definition after a blank line').querySelectorAll('dl').length,0);
const literal=render('<dl class="evil" onclick="alert(1)"><dt style="color:red">Safe</dt><dd><strong>Bold</strong><script>alert(1)</script> Text</dd></dl>');
assert.equal(literal.querySelectorAll('dl').length,1);
assert.equal(literal.querySelector('dl').hasAttribute('onclick'),false);
assert.equal(literal.querySelector('dt').hasAttribute('style'),false);
assert.equal(literal.querySelector('script'),null);
assert(literal.querySelector('dd strong'));
const injection=render('Bad\n: <img src="javascript:alert(1)" onerror="alert(2)"> **Safe**');
assert(!injection.body.innerHTML.includes('<img'));
assert(!injection.body.innerHTML.includes('onerror='));
assert(injection.querySelector('dd strong'));
const sampleFootnotes='Word[^one].\n\n[^one]: Footnote content.\n\nTerm\n: Definition';
state.extensionSettingsByDocument=changeExtension(state.extensionSettingsByDocument,key,'footnotes',true);
const combined=render(sampleFootnotes);
assert(combined.querySelector('section.md-footnotes'));
assert(combined.querySelector('dl.md-definition-list'));
assert.equal(combined.querySelectorAll('a.fn-backref').length,1);
assert.equal(normalizeExtensionSettings({sandbox_en:{definitionLists:true}}).sandbox_en.definitionLists,true);
assert.equal(normalizeExtensionSettings({sandbox_en:{definitionLists:'true'}}).sandbox_en,undefined);
for(const lang of ['en','cs','uk','ro','ru']){
 assert(DEFINITION_TEXT[lang].sample&&DEFINITION_TEXT[lang].html&&DEFINITION_TEXT[lang].warning);
}
assert.equal(marked.parse('Term\n: Definition',{gfm:true}).includes('<dl'),false,'global Marked not mutated');
console.log('PASS: #14 definition grammar, multiple terms and definitions, inline markup, safety, dialects and footnotes');
