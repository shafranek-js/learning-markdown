import {JSDOM} from 'jsdom';
import {sanitizeHTML} from '../js/core/sanitize.js';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://example.test/'});
globalThis.document=dom.window.document;
globalThis.DOMParser=dom.window.DOMParser;
globalThis.Node=dom.window.Node;
globalThis.location=dom.window.location;
import assert from 'node:assert/strict';
import {ADVANCED_PRESETS,ADVANCED_ALLOWED_CLASSES,presetClass,filterAdvancedClasses} from '../js/core/advanced-presets.js';
assert.equal(Object.keys(ADVANCED_PRESETS).length,7);
for(const [key,values] of Object.entries(ADVANCED_PRESETS)){
 for(const value of values)assert(ADVANCED_ALLOWED_CLASSES.has(presetClass(key,value)));
}
assert.equal(presetClass('color','javascript:alert(1)'),null);
assert.equal(presetClass('style','x'),null);
assert.equal(filterAdvancedClasses('af-color-blue foo af-page-break af-color-blue'), 'af-color-blue af-page-break');
assert.equal(filterAdvancedClasses('onclick=evil af-background-yellow style=color:red'),'af-background-yellow');
// Sanitization must preserve the case of the numbering type attribute.
const html='<ol type="a"><li>lower</li></ol><ol type="A"><li>upper</li></ol><ol type="i"><li>roman lower</li></ol><ol type="I"><li>roman upper</li></ol><ol type="1"><li>numeric</li></ol>';
const types=[...new DOMParser().parseFromString(sanitizeHTML(html),'text/html').querySelectorAll('ol')].map(x=>x.getAttribute('type'));
assert.deepEqual(types,['a','A','i','I','1']);
console.log('PASS: advanced CSS presets and class allowlist');
