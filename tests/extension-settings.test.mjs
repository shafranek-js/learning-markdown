import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {
 normalizeExtensionSettings,changeExtension,extensionEnabled,parserExtensionOptions,
 EXTENSIONS,EXTENSION_TEXT
} from '../js/core/extensions.js';
const samples={lesson_1_en:{softbreaks:true},sandbox_ru:{softbreaks:true},sandbox_doc_en_tab_12345678:{softbreaks:true,footnotes:true},'sandbox_doc_en_tab_wrong!':{softbreaks:true},
 'lesson_9_en':{softbreaks:true},'__proto__':{softbreaks:true},
 lesson_2_cs:{softbreaks:'true'},advanced_1_uk:{unapproved:true}};
const clean=normalizeExtensionSettings(samples);
assert.deepEqual(Object.keys(clean).sort(),['lesson_1_en','sandbox_doc_en_tab_12345678','sandbox_ru']);
assert.equal(extensionEnabled(clean,'sandbox_doc_en_tab_12345678','gfm','softbreaks'),true);
assert.deepEqual(parserExtensionOptions(clean,'sandbox_doc_en_tab_12345678','gfm'),{breaks:true});
assert.equal(clean['__proto__'],undefined);
assert.equal(extensionEnabled(clean,'lesson_1_en','gfm','softbreaks'),true);
assert.equal(extensionEnabled(clean,'lesson_1_en','commonmark','softbreaks'),false);
assert.equal(extensionEnabled(clean,'sandbox_ru','gfm','unknown-plugin'),false);
assert.deepEqual(parserExtensionOptions(clean,'lesson_1_en','gfm'),{breaks:true});
assert.deepEqual(parserExtensionOptions(clean,'lesson_1_en','commonmark'),{});
assert.deepEqual(parserExtensionOptions(clean,'lesson_2_en','gfm'),{});
const other=changeExtension(clean,'lesson_2_en','softbreaks',true);
assert.equal(extensionEnabled(other,'lesson_2_en','gfm','softbreaks'),true);
assert.equal(extensionEnabled(clean,'lesson_2_en','gfm','softbreaks'),false);
assert.equal(Object.hasOwn(changeExtension(other,'lesson_2_en','softbreaks',false),'lesson_2_en'),false);
assert(!Object.hasOwn(changeExtension(other,'lesson_3_en','evil',true),'lesson_3_en'));
const changedTab=changeExtension(clean,'sandbox_doc_cs_tab_abcdefgh','softbreaks',true);
assert.equal(extensionEnabled(changedTab,'sandbox_doc_cs_tab_abcdefgh','gfm','softbreaks'),true);
assert.equal(extensionEnabled(changeExtension(changedTab,'sandbox_doc_cs_tab_abcdefgh','softbreaks',false),'sandbox_doc_cs_tab_abcdefgh','gfm','softbreaks'),false);
assert(!Object.hasOwn(changeExtension(clean,'sandbox_doc_en_tab_<script>','softbreaks',true),'sandbox_doc_en_tab_<script>'));
assert.equal(Object.keys(EXTENSIONS).length,5);
for(const lang of ['en','cs','uk','ro','ru']){
 const text=EXTENSION_TEXT[lang];
 assert(text.title&&text.warning&&text.matrix&&text.planned);
}
const win=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/'}).window;
Object.assign(globalThis,{
 DOMParser:win.DOMParser,document:win.document,Node:win.Node,location:win.location,
 localStorage:{getItem:()=>null,setItem:()=>{}}
});
const {state,docKey}=await import('../js/core/state.js');
const {markdownToHTML}=await import('../js/ui/preview.js');
const original='First line\nSecond line';
const defaultMarkup=markdownToHTML(original,'gfm');
assert(!defaultMarkup.includes('<br>'));
state.extensionSettingsByDocument=changeExtension(state.extensionSettingsByDocument,docKey(),'softbreaks',true);
assert(markdownToHTML(original,'gfm').includes('<br>'));
assert(!markdownToHTML(original,'gfm',{extensions:false}).includes('<br>'));
assert(!markdownToHTML(original,'commonmark').includes('<br>'));
assert(!markdownToHTML(original,'original').includes('<br>'));
assert.equal(markdownToHTML('<script>window.XSS=1</script>','gfm').includes('<script'),false);
console.log('PASS: #10 opt-in extensions, dialect isolation, document persistence schema, five-language metadata and sanitizer');
