import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {marked} from 'marked';
import {figureDimension,safeFigureUrl,validateFigure,makeFigureSnippet,makePortableImage} from '../js/core/figures.js';
import {sanitizeHTML} from '../js/core/sanitize.js';
const win=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/'}).window;
Object.assign(globalThis,{DOMParser:win.DOMParser,document:win.document,Node:win.Node,location:win.location});
const picture='https://example.org/demo.png';
for(const n of [1,320,960,1600])assert.equal(figureDimension(n),n);
for(const n of [-1,0,1601,99999,'10px','100%','calc(100px)','1e2','01','1.5','NaN'])
 assert.equal(figureDimension(n),null,'Unsafe dimension '+n);
for(const bad of ['javascript:alert(1)','data:image/svg+xml,abc','http://example.org/a.png',
 'https://user:pass@example.org/a.png','https://example.org/x.png" onerror="x','file:///tmp/secret.png'])
 assert(!safeFigureUrl(bad),bad);
assert(safeFigureUrl(picture));
assert.deepEqual(validateFigure({url:picture,alt:'',width:640}).reason,'alt');
assert(validateFigure({url:picture,alt:'',decorative:true,width:640}).valid);
const built=makeFigureSnippet({url:picture,alt:'A "demo" & more',width:640,
 caption:'A <caption> & original'});
assert.equal(built.error,null);
assert(built.html.includes('width="640"'));
assert(built.html.includes('&quot;demo&quot;'));
assert(built.html.includes('&lt;caption&gt; &amp;'));
const rendered=sanitizeHTML(marked.parse('\n'+built.html+'\n',{gfm:true}));
const dom=new JSDOM(rendered).window.document;
assert.equal(dom.querySelectorAll('figure.af-figure').length,1);
assert.equal(dom.querySelector('figure img').getAttribute('width'),'640');
assert.equal(dom.querySelector('figure img').getAttribute('height'),null);
assert.equal(dom.querySelector('figure img').getAttribute('alt'),'A "demo" & more');
assert.equal(dom.querySelector('figure figcaption').textContent,'A <caption> & original');
const fixed=makeFigureSnippet({url:picture,alt:'Fixed',width:640,height:320,caption:'Fixed size'});
const parsedFixed=new JSDOM(sanitizeHTML(fixed.html)).window.document;
assert.equal(parsedFixed.querySelector('figure').className,'af-figure af-figure-fixed');
assert.equal(parsedFixed.querySelector('img').getAttribute('height'),'320');
assert.equal(parsedFixed.querySelector('img').style.height,'320px');
const dangerous=sanitizeHTML('<figure class="af-figure af-figure-fixed evil" style="position:fixed" onclick="x()">'
 +'<img src="'+picture+'" alt="Accessible" width="100%" height="1601" style="position:fixed" onerror="x()">'
 +'<figcaption onclick="x()" style="color:red"><script>alert(1)</script>Safe</figcaption></figure>');
const doc=new JSDOM(dangerous).window.document;
assert.equal(doc.querySelector('figure').className,'af-figure af-figure-fixed');
assert.equal(doc.querySelector('figure').hasAttribute('style'),false);
assert.equal(doc.querySelector('img').hasAttribute('width'),false);
assert.equal(doc.querySelector('img').hasAttribute('height'),false);
assert.equal(doc.querySelector('img').hasAttribute('style'),false);
assert.equal(doc.querySelector('img').hasAttribute('onerror'),false);
assert.equal(doc.querySelector('figcaption').hasAttribute('style'),false);
assert.equal(doc.querySelector('script'),null);
assert.equal(doc.querySelector('figcaption').textContent,'Safe');
for(const href of ['javascript:alert(1)','data:image/png;base64,AAAA']){
 assert(!sanitizeHTML('<figure><img src="'+href+'"></figure>').includes('<img'));
}
const oversized=sanitizeHTML('<img src="'+picture+'" width="1601" height="-5" style="height:9000px">');
assert(!oversized.includes('width=')&&!oversized.includes('height=')&&!oversized.includes('style='));
const portable=makePortableImage({url:picture,alt:'Photo [one]',width:640,caption:'Ignored'});
assert.equal(portable.html,'![Photo \\[one\\]]('+picture+')');
assert(!portable.html.includes('figcaption'));
const decorative=makeFigureSnippet({url:picture,alt:'ignored',decorative:true,width:320});
assert(decorative.html.includes('alt=""'));
for(const source of ['css/preview.css','css/components.css']){
 const content=await readFile(new URL('../'+source,import.meta.url),'utf8');
 assert(content.includes('af-figure')||content.includes('figure-dialog'));
}
console.log('PASS: #13 safe HTTPS figures, captions, 1–1600px, accessible alt, mobile/print styles and hostile inputs');
