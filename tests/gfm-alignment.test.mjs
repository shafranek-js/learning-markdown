import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {marked} from 'marked';

const {window}=new JSDOM('<!doctype html><html><body></body></html>',{
 url:'https://example.test/'
});
Object.assign(globalThis,{
 DOMParser:window.DOMParser,
 document:window.document,
 Node:window.Node,
 location:window.location
});
const {sanitizeHTML}=await import('../js/core/sanitize.js');

const sample='| Product | Quantity | Price |\n| :--- | :---: | ---: |\n| Box | 12 | 99.50 |';
const html=sanitizeHTML(marked.parse(sample,{gfm:true,pedantic:false,breaks:false}));
const result=new JSDOM('<main class="md-preview">'+html+'</main>').window.document;
const headers=[...result.querySelectorAll('thead th')];
const cells=[...result.querySelectorAll('tbody td')];
assert.deepEqual(headers.map(x=>x.getAttribute('align')),['left','center','right']);
assert.deepEqual(cells.map(x=>x.getAttribute('align')),['left','center','right']);
assert.equal(result.querySelector('tbody tr td:last-child').textContent,'99.50');
for(const dialect of [{gfm:false,pedantic:false},{gfm:false,pedantic:true}]){
 const other=sanitizeHTML(marked.parse(sample,dialect));
 assert(!other.includes('<table>'),'Non-GFM modes must not silently gain table support');
}
const malicious=sanitizeHTML('<table><tr>'
 +'<td align="right" style="text-align:left" onclick="alert(1)">Safe</td>'
 +'<td align="center;position:fixed" style="color:red">Blocked</td>'
 +'<th align="javascript:alert(1)">Blocked</th>'
 +'<td align="left" colspan="2">Merged</td>'
 +'</tr></table>');
const parsed=new JSDOM(malicious).window.document;
assert.equal(parsed.querySelector('td').getAttribute('align'),'right');
assert.equal(parsed.querySelector('td').hasAttribute('style'),false);
assert.equal(parsed.querySelector('td').hasAttribute('onclick'),false);
assert.equal(parsed.querySelectorAll('td')[1].hasAttribute('align'),false);
assert.equal(parsed.querySelector('th').hasAttribute('align'),false);
assert.equal(parsed.querySelectorAll('td')[2].getAttribute('colspan'),'2');
const css=await readFile(new URL('../css/preview.css',import.meta.url),'utf8');
for(const alignment of ['left','center','right']){
 assert(css.includes('.md-preview th[align="'+alignment+'"]'));
 assert(css.includes('.md-preview td[align="'+alignment+'"]'));
 assert(css.includes('text-align: '+alignment+';'));
}
console.log('PASS: #8 GFM alignment, safety, dialect isolation and shared export CSS');
