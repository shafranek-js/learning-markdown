import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {normalizeExtensionSettings,changeExtension,extensionEnabled,FOOTNOTE_TEXT} from '../js/core/extensions.js';

const win=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/'}).window;
Object.assign(globalThis,{DOMParser:win.DOMParser,document:win.document,Node:win.Node,location:win.location,
 localStorage:{getItem:()=>null,setItem:()=>{}}});
const {state,docKey}=await import('../js/core/state.js');
const {markdownToHTML}=await import('../js/ui/preview.js');

const sample='First reference[^a] then again[^a].\n\n[^a]: **Important** source.\n\n    Second paragraph.';
const original=markdownToHTML(sample,'gfm',{extensions:false});
assert(!original.includes('md-footnotes'),'normative GFM must not enable GitHub footnotes');
state.extensionSettingsByDocument=changeExtension(state.extensionSettingsByDocument,docKey(),'footnotes',true);
const html=markdownToHTML(sample,'gfm');
const dom=new JSDOM(html).window.document;
assert.equal(dom.querySelectorAll('section.md-footnotes > ol > li').length,1);
assert.equal(dom.querySelectorAll('sup > a.fn-ref').length,2);
assert.equal(dom.querySelectorAll('li a.fn-backref').length,2);
assert.equal(dom.querySelector('section.md-footnotes li').id,'fn-item-1');
assert.equal(dom.querySelector('sup > a.fn-ref').id,'fn-ref-1-1');
assert.equal(dom.querySelectorAll('sup > a.fn-ref')[1].id,'fn-ref-1-2');
assert.equal(dom.querySelector('sup > a.fn-ref').getAttribute('href'),'#fn-item-1');
assert.equal(dom.querySelectorAll('li a.fn-backref')[1].getAttribute('href'),'#fn-ref-1-2');
assert(dom.querySelector('li strong').textContent.includes('Important'));
assert(dom.querySelectorAll('li p').length>=2,'multi-paragraph definition preserved');
assert(!markdownToHTML(sample,'commonmark').includes('md-footnotes'));
assert(!markdownToHTML(sample,'original').includes('md-footnotes'));
assert(!markdownToHTML(sample,'gfm',{extensions:false}).includes('md-footnotes'));
assert.equal(normalizeExtensionSettings({lesson_1_en:{footnotes:true}}).lesson_1_en.footnotes,true);
assert(!Object.hasOwn(normalizeExtensionSettings({lesson_1_en:{footnotes:'true'}}),'lesson_1_en'));
assert(!extensionEnabled(state.extensionSettingsByDocument,'lesson_1_en','commonmark','footnotes'));
for(const lang of ['en','cs','uk','ro','ru']){
 assert(FOOTNOTE_TEXT[lang].label&&FOOTNOTE_TEXT[lang].warning&&FOOTNOTE_TEXT[lang].sample);
}
const missing=markdownToHTML('Unresolved[^missing] without definition.','gfm');
assert(!missing.includes('md-footnotes'));
assert(missing.includes('missing'));
const duplicate=markdownToHTML('Only[^dup].\n\n[^dup]: First text.\n[^dup]: Repeated definition.','gfm');
assert.equal(new JSDOM(duplicate).window.document.querySelectorAll('.md-footnotes li').length,1);
const hostile=markdownToHTML(
 'A claim[^evil].\n\n[^evil]: <script>window.infected=true</script><img src="javascript:alert(1)" onerror="alert(2)"> Safe.',
 'gfm');
assert(!hostile.includes('<script')&&!hostile.includes('onerror=')&&!hostile.includes('javascript:'));
assert(!hostile.includes('<img'));
assert(new JSDOM(hostile).window.document.querySelector('.md-footnotes li').textContent.includes('Safe'));
const weird=markdownToHTML('Test[^x" onclick="alert(1)].\n\n[^x" onclick="alert(1)]: Value.','gfm');
assert(!weird.includes('onclick='));
const after=markdownToHTML('Plain **bold** text without notes.','gfm');
assert(!after.includes('md-footnotes'),'isolated parse must not leak notes across documents');
console.log('PASS: #11 references/backlinks, duplicate/missing labels, multi-paragraph, dialect isolation, XSS and localizations');
