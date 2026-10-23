import {parseFragment} from 'parse5';

function toTree(node) {
  if (node.nodeName === '#text') return {text:node.value};
  if (node.nodeName === '#comment') return {comment:node.data};
  const children=(node.childNodes || []).map(toTree);
  if (!node.tagName) return {children};
  const attrs=(node.attrs||[]).map(a=>[a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0]));
  return {tag:node.tagName,attrs,children};
}
function structure(node) {
  if ('text' in node) return null;
  if ('comment' in node) return {comment:true};
  return {tag:node.tag||'fragment',children:(node.children||[]).map(structure).filter(Boolean)};
}
function textContent(node) {
  if ('text' in node) return node.text;
  if ('comment' in node) return '';
  return (node.children||[]).map(textContent).join('');
}
function attrsOnly(node) {
  if ('text' in node || 'comment' in node) return null;
  return {tag:node.tag||'fragment',attrs:node.attrs||[],children:(node.children||[]).map(attrsOnly).filter(Boolean)};
}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function compareHtml(expected, actual, error='') {
  if(error) return 'parser-error';
  if(expected.replace(/\r\n?/g,'\n')===actual.replace(/\r\n?/g,'\n')) return 'exact';
  const a=toTree(parseFragment(expected));
  const b=toTree(parseFragment(actual));
  if(same(a,b)) return 'dom-equivalent';
  if(!same(structure(a),structure(b))) return 'structure';
  if(textContent(a)===textContent(b)) return 'attributes';
  if(textContent(a).replace(/\s+/g,' ').trim()===textContent(b).replace(/\s+/g,' ').trim()
     && same(attrsOnly(a),attrsOnly(b))) return 'whitespace';
  return 'text';
}
export const CATEGORIES=['exact','dom-equivalent','attributes','whitespace','text','structure','parser-error'];
