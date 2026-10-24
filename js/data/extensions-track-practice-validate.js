// Rendered-semantic validators for optional practical Markdown lessons.
// Source inspection is restricted to Marked lexer tokens for invisible notes:
// both comments and definitions MUST be outside fenced code.
import {marked} from 'marked';

const paragraphs=doc=>[...doc.querySelectorAll('p')].filter(p=>!p.closest('pre,code'));
const hasAll=(text,chars)=>chars.every(ch=>text.includes(ch));
export function evaluatePracticeLab(id,doc,source=''){
 if(id==='unicode-entities'){
  const ps=paragraphs(doc);
  const original=ps.find(p=>p.textContent.startsWith('Unicode:'));
  const decoded=ps.find(p=>p.textContent.startsWith('Entities:'));
  const rtl=ps.find(p=>p.textContent.startsWith('Mixed directions:'));
  return [Boolean(original&&decoded&&hasAll(original.textContent,['©','®','™','€','π','°','→'])
   &&hasAll(decoded.textContent,['©','®','™','€','→'])),
   Boolean(rtl&&rtl.textContent.includes('العربية')&&rtl.textContent.includes('עברית'))];
 }
 if(id==='emoji-shortcodes'){
  const visible=paragraphs(doc).find(p=>p.textContent.startsWith('Status:'));
  const literal=doc.querySelector('p > code');
  return [Boolean(visible&&visible.textContent.includes('🚀')&&visible.textContent.includes('🔒')
   &&!visible.textContent.includes(':rocket:')),
   Boolean(literal&&literal.textContent.includes(':rocket:'))];
 }
 if(id==='gfm-table-tricks'){
  const rows=[...doc.querySelectorAll('table tbody tr')];
  const first=rows[0]?[...rows[0].querySelectorAll('td')]:[];
  const second=rows[1]?[...rows[1].querySelectorAll('td')]:[];
  return [first.length===2&&second.length===2
   &&first[0].textContent.trim()==='A | B'&&second[0].textContent.trim()==='C | D',
   first.length===2&&second.length===2
   &&Boolean(first[1].querySelector('strong, b'))&&Boolean(first[1].querySelector('br'))
   &&Boolean(second[1].querySelector('em, i'))];
 }
 if(id==='html-table-list'){
  const cell=[...doc.querySelectorAll('table tr td')].find(td=>td.querySelector('ul'));
  const items=cell?[...cell.querySelectorAll('ul > li')]:[];
  return [Boolean(cell&&cell.querySelector('ul')),items.length===2
   &&items[0].textContent.trim()==='One'&&items[1].textContent.trim()==='Two'];
 }
 if(id==='portable-callout'){
  const outer=[...doc.querySelectorAll('blockquote')].find(q=>!q.parentElement?.closest('blockquote'));
  const bold=outer?.querySelector('p > strong, p > b');
  return [Boolean(outer&&bold?.textContent.trim()==='Note:'),
   Boolean(outer?.querySelector('blockquote > p')?.textContent.includes('A nested reply'))];
 }
 if(id==='author-notes'){
  const tokens=marked.lexer(String(source),{gfm:true});
  const definition=tokens.links?.['editor-note'];
  const hidden=doc.body.textContent;
  const publicVisible=paragraphs(doc).some(p=>p.textContent.includes('Public text stays visible.'));
  const comment=tokens.some(token=>token.type==='html'
   &&/<!--\s*Editor:.*?-->/s.test(token.raw||token.text||''));
  return [Boolean(publicVisible&&definition?.href==='#'&&definition.title?.includes('Internal:')
   &&!hidden.includes('Internal:')),
   Boolean(publicVisible&&comment&&!hidden.includes('Editor:'))];
 }
 if(id==='video-preview-links'){
  const links=[...doc.querySelectorAll('a[href="https://example.com/watch"]')];
  const textLink=links.some(a=>a.textContent.trim()==='Watch the video'&&!a.querySelector('img'));
  const thumb=links.find(a=>a.querySelector('img[alt="Video preview"]'));
  return [textLink,Boolean(thumb&&thumb.querySelector('img')?.getAttribute('src')?.startsWith('https://'))];
 }
 return [];
}
