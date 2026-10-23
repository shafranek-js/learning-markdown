import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
const win=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/'}).window;
Object.assign(globalThis,{
 DOMParser:win.DOMParser,document:win.document,Node:win.Node,location:win.location,
 localStorage:{getItem:()=>null,setItem:()=>{}}
});
const {markdownToHTML}=await import('../js/ui/preview.js');
const {highlightLanguage,CODE_HIGHLIGHT_TIPS}=await import('../js/core/highlight-code.js');
for(const lang of ['en','cs','uk','ro','ru'])assert(CODE_HIGHLIGHT_TIPS[lang]?.includes('%s'));
const samples={
 javascript:'const answer = 42;',json:'{"name": "value", "count": 2}',
 html:'<div class="test">& "hello"</div>',
 css:'.demo { color: red; }',sql:'SELECT name FROM users WHERE id = 12;',
 python:'def add(a, b):\n    return a + b'
};
for(const [lang,source] of Object.entries(samples)){
 const md='~~~'+lang+'\n'+source+'\n~~~';
 const rendered=markdownToHTML(md,'gfm');
 const doc=new JSDOM(rendered).window.document;
 const code=doc.querySelector('pre > code');
 assert(code,'fenced code required for '+lang);
 assert.equal(code.textContent,source+'\n','must keep exact source text');
 assert(code.querySelectorAll('span[class^="hljs-"]').length>0,'colored token missing: '+lang);
 assert(!/<(?:script|style|iframe|svg)\b/i.test(rendered),'unsafe nodes emitted');
}
assert.equal(highlightLanguage('language-js'),'javascript');
assert.equal(highlightLanguage('language-py'),'python');
assert.equal(highlightLanguage('language-unknown'),null);
for(const dialect of ['gfm','commonmark','original']){
 const md='~~~js\nconst z = 1;\n~~~';
 assert(markdownToHTML(md,dialect).includes('hljs-'),'Code fences should work in '+dialect);
}
for(const sample of ['<script>alert(1)</script>',
 '<img src=x onerror=alert(1)>',
 'const txt = "</script><svg onload=alert(1)>";']){
 const rendered=markdownToHTML('~~~html\n'+sample+'\n~~~');
 assert(rendered.includes('&lt;'),'must escape HTML-like source');
 assert(!/<script|<svg|onerror=|onload=/i.test(rendered.replace(/&lt;.*?&gt;/g,'')),'unsafe markup survived');
 const output=new JSDOM(rendered).window.document;
 assert.equal(output.querySelector('pre code').textContent,sample+'\n');
}
const unknown=markdownToHTML('~~~unsupported\n<script>alert(1)</script>\n~~~');
assert(!unknown.includes('hljs-')&&!unknown.includes('<script>'));
assert(new JSDOM(unknown).window.document.querySelector('code').textContent.includes('<script>'));
const large='a'.repeat(50001);
const largeHTML=markdownToHTML('~~~javascript\n'+large+'\n~~~');
assert(!largeHTML.includes('hljs-'),'oversized source should remain plain');
console.log('PASS: #9 six languages, five translations, three dialects, safe unknown/long input');
