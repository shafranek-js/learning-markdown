import {markdownToHTML} from '../ui/preview.js';

// Feature-oriented portability hints; not a normative conformance certificate.
// Parse rendered/sanitized DOM rather than matching raw source so fenced code
// examples cannot be mistaken for active formatting.
export function inspectPortability(source){
 const input=String(source??'');
 const rendered=markdownToHTML(input,'gfm');
 const common=markdownToHTML(input,'commonmark');
 const legacy=markdownToHTML(input,'original');
 const documentHTML=new DOMParser().parseFromString(rendered,'text/html');
 const advanced=Boolean(documentHTML.querySelector(
  'u,sup,sub,mark,details,summary,div[id],span[class^="af-"],div[class^="af-"],table[class^="af-"],td[class^="af-"],th[class^="af-"],td[colspan],td[rowspan],th[colspan],th[rowspan],ol[type="a"],ol[type="A"],ol[type="i"],ol[type="I"]'
 ));
 const gfmDifference=rendered!==common;
 const legacyDifference=rendered!==legacy;
 // Data is intentionally advisory: sites may sanitize HTML and class attributes
 // differently, and "Original" is a legacy parser mode rather than a formal spec.
 return {advanced,gfmDifference,legacyDifference,
  portableCore:!advanced&&!gfmDifference&&!legacyDifference,
  html:rendered};
}
