// Offline, fixed-language syntax highlighting. Never use automatic language
// detection or consume highlighter-provided markup without sanitizing it.
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import sql from 'highlight.js/lib/languages/sql';
import python from 'highlight.js/lib/languages/python';
import {sanitizeHTML} from './sanitize.js';

for(const [id,grammar] of Object.entries({javascript,json,xml,css,sql,python}))
 hljs.registerLanguage(id,grammar);

const LANGUAGES=Object.freeze({
 javascript:'javascript',js:'javascript',json:'json',
 html:'xml',xml:'xml',css:'css',sql:'sql',
 python:'python',py:'python'
});
export const HIGHLIGHT_NAMES=Object.freeze({
 javascript:'JavaScript',json:'JSON',xml:'HTML / XML',css:'CSS',sql:'SQL',python:'Python'
});
export function highlightLanguage(className=''){
 const match=String(className).match(/(?:^|\s)language-([\w-]+)(?:\s|$)/);
 return match&&Object.hasOwn(LANGUAGES,match[1].toLowerCase())
  ?LANGUAGES[match[1].toLowerCase()]:null;
}
const MAX_CODE_LENGTH=50000; // Large files stay safely escaped, never block typing.
export function highlightCodeBlocks(safeHTML){
 if(!/<pre[\s>]/i.test(safeHTML)||!/\blanguage-/i.test(safeHTML))return safeHTML;
 const root=document.createElement('div');
 root.innerHTML=safeHTML; // Input is strictly sanitized before entering this function.
 let changed=false;
 for(const code of root.querySelectorAll('pre > code[class]')){
  const language=highlightLanguage(code.className);
  const source=code.textContent;
  if(!language||!source||source.length>MAX_CODE_LENGTH)continue;
  try{
   // Only the six locally registered grammars; no network or dynamic imports.
   code.innerHTML=hljs.highlight(source,{language,ignoreIllegals:true}).value;
   changed=true;
  }catch{
   code.textContent=source;
  }
 }
 return changed?sanitizeHTML(root.innerHTML):safeHTML;
}
export const CODE_HIGHLIGHT_TIPS=Object.freeze({
 en:'Offline syntax colors for %s. The Markdown source remains unchanged.',
 cs:'Offline zvýraznění syntaxe: %s. Zdrojový Markdown zůstává beze změny.',
 uk:'Офлайн-підсвічування синтаксису: %s. Вихідний Markdown не змінюється.',
 ro:'Evidențiere offline a sintaxei: %s. Sursa Markdown rămâne neschimbată.',
 ru:'Офлайн-подсветка синтаксиса: %s. Исходный Markdown не изменяется.'
});
export const highlightTooltip=(language,locale='en')=>
 (CODE_HIGHLIGHT_TIPS[locale]||CODE_HIGHLIGHT_TIPS.en)
 .replace('%s',HIGHLIGHT_NAMES[language]||language);
