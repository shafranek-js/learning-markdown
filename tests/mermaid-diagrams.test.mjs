import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {MERMAID_TEMPLATES,MERMAID_UI,mermaidText,mermaidSourceProblem,MAX_MERMAID_CHARS,MAX_MERMAID_BLOCKS} from '../js/data/mermaid-diagrams.js';
const win=new JSDOM('',{url:'https://example.test/'}).window;
Object.assign(globalThis,{DOMParser:win.DOMParser,XMLSerializer:win.XMLSerializer,document:win.document});
const {safeMermaidSvgImage}=await import('../js/core/mermaid-safe-svg.js');
assert.equal(MERMAID_TEMPLATES.length,3);
assert.equal(MAX_MERMAID_BLOCKS,6);
assert.equal(MAX_MERMAID_CHARS,4000);
assert.deepEqual(MERMAID_TEMPLATES.map(t=>t.id),['flowchart','sequence','pie']);
for(const template of MERMAID_TEMPLATES){
 assert(template.code.startsWith('```mermaid\n'));
 const source=template.code.split('\n').slice(1,-1).join('\n');
 assert.equal(mermaidSourceProblem(source),null,template.id);
}
for(const lang of ['en','cs','uk','ro','ru']){
 const labels=mermaidText(lang);
 assert(MERMAID_UI[lang]);
 for(const key of ['button','title','type','insert','cancel','flowchart','sequence','pie','pending','done','invalid','limited','directive','oversize','unsupported','retry','help','offline'])
  assert(typeof labels[key]==='string'&&labels[key].length>2,lang+': '+key);
}
for(const bad of [
 '%%{init: {"securityLevel": "loose"}}%%\nflowchart LR\n A-->B',
 '---\nconfig:\n  securityLevel: loose\n---\nflowchart LR',
 'flowchart LR\nclick A "javascript:alert(1)"',
 'flowchart LR\nA["<script>alert(1)</script>"]'
])assert.equal(mermaidSourceProblem(bad),'directive',bad);
assert.equal(mermaidSourceProblem('flowchart LR\n'+'x'.repeat(4000)),'oversize');
assert.equal(mermaidSourceProblem('journey\n section My journey'), 'unsupported');
assert.equal(mermaidSourceProblem('sequenceDiagram\n A->>B: Hello'), null);
const valid='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="90" viewBox="0 0 200 90"><defs><marker id="arrow"><path d="M0,0 L6,3 L0,6"/></marker></defs><rect width="200" height="90" fill="#fff"/><text x="10" y="20">Safe</text></svg>';
const data=safeMermaidSvgImage(valid);
assert(data.startsWith('data:image/svg+xml;charset=utf-8,'));
assert(decodeURIComponent(data.split(',').slice(1).join(',')).includes('<svg'));
assert(decodeURIComponent(data.split(',').slice(1).join(',')).includes('Safe'));
const safeFilterSymbol='<svg xmlns="http://www.w3.org/2000/svg" width="200" height="90">'
 +'<defs><symbol id="safe-shape"><path d="M0,0 L6,3 L0,6"/></symbol>'
 +'<filter id="soft-shadow"><feGaussianBlur stdDeviation="1"/><feDropShadow dx="1" dy="1" stdDeviation="1"/></filter></defs>'
 +'<use href="#safe-shape" filter="url(#soft-shadow)"/></svg>';
assert(safeMermaidSvgImage(safeFilterSymbol).startsWith('data:image/svg+xml'));
for(const malicious of [
 '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject><body>Attack</body></foreignObject></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><path d="M0,0"/></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://evil.test/a.png"/></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg"><style>@import url(https://evil.test/evil.css);</style></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg"><path fill="url(https://evil.test/id)" d="M0,0"/></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg"><use href="https://evil.test/icon.svg#id"/></svg>',
 '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)">Bad</a></svg>'
 ])assert.throws(()=>safeMermaidSvgImage(malicious),/Unsafe|Unsupported|Invalid/);
assert.throws(()=>safeMermaidSvgImage('garbage'),/Invalid|exceeds/);
assert.throws(()=>safeMermaidSvgImage('<svg/>'),/exceeds/);
console.log('PASS: #18 pinned Mermaid templates, 5 locales, unsafe directive filtering and inert SVG images');
