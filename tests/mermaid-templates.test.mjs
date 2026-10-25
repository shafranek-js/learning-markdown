import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {MERMAID_TEMPLATES,MERMAID_LABELS,mermaidLabels,mermaidSnippet} from '../js/data/mermaid-templates.js';
import {mermaidImageDataUrl} from '../js/ui/mermaid-preview.js';

assert.deepEqual(Object.keys(MERMAID_TEMPLATES),['flowchart','sequence','pie','class','state','er','gantt','mindmap','timeline']);
assert.deepEqual(Object.keys(MERMAID_LABELS).sort(),['cs','en','ro','ru','uk']);
for(const locale of Object.values(MERMAID_LABELS)){
 assert.equal(locale.types.length,Object.keys(MERMAID_TEMPLATES).length);
 for(const label of [locale.zoomIn,locale.zoomOut,locale.fit])assert.ok(label.length>2);
}
for(const [type,source] of Object.entries(MERMAID_TEMPLATES)){
 const fence=mermaidSnippet(type);
 assert.ok(fence.startsWith('\n\n```mermaid\n'));
 assert.ok(fence.includes(source));
 assert.ok(fence.endsWith('\n```\n\n'));
 assert.ok(!/<script|<iframe|%%\{/i.test(source));
}
assert.equal(mermaidSnippet('unknown'),null);
assert.equal(mermaidLabels('xx'),MERMAID_LABELS.en);

const {window}=new JSDOM('<!doctype html><html><body></body></html>');
globalThis.DOMParser=window.DOMParser;
globalThis.XMLSerializer=window.XMLSerializer;
const ok='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><style>rect{fill:#acf}</style><rect width="10" height="10"/></svg>';
const data=mermaidImageDataUrl(ok);
assert.ok(data.startsWith('data:image/svg+xml;charset=utf-8,'));
assert.ok(decodeURIComponent(data.split(',')[1]).includes('<rect'));
for(const payload of [
 '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><p>HTML</p></foreignObject></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://example.org/pixel"/></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>',
 '<svg xmlns="http://www.w3.org/2000/svg"><style>@import url(https://example.org/x.css)</style></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)">Click</a></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg"><style>rect{fill:url(\'https://example.org/tracker\')}</style></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg"><rect style="filter:url(&quot;https://example.org/x&quot;)"/></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg"><style>@import \'https://example.org/a.css\';</style></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg"><rect style="fill:url(https://example.org/x)"/></svg>'
])assert.throws(()=>mermaidImageDataUrl(payload),/Unsafe|External/);
const localMarker='<svg xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrow"><path d="M0 0"/></marker></defs><path style="marker-end:url(\'#arrow\')" d="M0 0"/></svg>';
assert.ok(mermaidImageDataUrl(localMarker).startsWith('data:image/svg+xml'));
console.log('Mermaid templates, i18n and SVG-as-image security checks passed.');
