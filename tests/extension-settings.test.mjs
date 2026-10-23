import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {
 normalizeExtensionSettings,changeExtension,extensionEnabled,parserExtensionOptions,
 EXTENSIONS,EXTENSION_TEXT
} from '../js/core/extensions.js';
const samples={lesson_1_en:{softbreaks:true},sandbox_ru:{softbreaks:true},
 'lesson_9_en':{softbreaks:true},'__proto__':{softbreaks:true},
 lesson_2_cs:{softbreaks:'true'},advanced_1_uk:{unapproved:true}};
const clean=normalizeExtensionSettings(samples);
assert.deepEqual(Object.keys(clean).sort(),['lesson_1_en','sandbox_ru']);
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
assert.equal(Object.keys(EXTENSIONS).length,3);
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
