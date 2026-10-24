// Optional definition lists; GFM opt-in only. Never mutate global marked.
import {Marked} from 'marked';

const MAX_TERMS=8,MAX_ENTRIES=100,MAX_LINES=1200;
const definition=/^ {0,3}:[ \t]+(\S.*)$/;
const continuation=/^(?: {2,}|\t)(?!:[ \t])(.+)$/;
const badTerm=/^(?:\s|#{1,6}(?:\s|$)|>|[-+*]\s|\d+[.)]\s|\x60{3}|~{3}|\||<|\[[^\]]+\]:)/;
const isTerm=s=>s.length>0&&s.length<=300&&!badTerm.test(s);
function findStart(source){
 // A definition can have several consecutive terms. The start hint must
 // point to the FIRST term, not the one immediately before ': Definition',
 // or Marked will consume early terms as an ordinary paragraph.
 const marker=/(?:^|\n) {0,3}:[ \t]+\S/.exec(source);
 if(!marker)return;
 let start=marker.index+(source[marker.index]==='\n'?1:0);
 for(let i=0;i<MAX_TERMS;i++){
  if(start===0)break;
  const previous=source.lastIndexOf('\n',start-2)+1;
  const term=source.slice(previous,start-1);
  if(!isTerm(term))break;
  start=previous;
 }
 return start;
}
export function definitionListExtension(){
 return {extensions:[{
  name:'definitionList',level:'block',start:findStart,
  tokenizer(source){
   if(!source||source.length>250000)return;
   const lines=source.split('\n'),entries=[];
   let pos=0;
   while(pos<lines.length&&pos<MAX_LINES&&entries.length<MAX_ENTRIES){
    const terms=[];
    while(pos<lines.length&&terms.length<MAX_TERMS&&isTerm(lines[pos])){
     terms.push(lines[pos++]);
     if(definition.test(lines[pos]||''))break;
    }
    if(!terms.length||!definition.test(lines[pos]||''))break;
    const definitions=[];
    while(pos<lines.length){
     const match=definition.exec(lines[pos]);
     if(!match)break;
     const parts=[match[1]];pos++;
     while(pos<lines.length&&continuation.test(lines[pos])){
      parts.push(lines[pos].replace(/^(?: {2,}|\t)/,'').trimEnd());pos++;
     }
     definitions.push(parts.join('\n'));
    }
    entries.push({terms,definitions});
    if(!isTerm(lines[pos]||''))break;
    let next=pos;
    while(next<lines.length&&next-pos<MAX_TERMS&&isTerm(lines[next]))next++;
    if(!definition.test(lines[next]||''))break;
   }
   if(!entries.length)return;
   const raw=lines.slice(0,pos).join('\n')+(pos<lines.length?'\n':'');
   const items=entries.map(e=>({
    terms:e.terms.map(t=>this.lexer.inlineTokens(t,[])),
    definitions:e.definitions.map(t=>this.lexer.inlineTokens(t,[]))
   }));
   return {type:'definitionList',raw,entries:items};
  },
  renderer(token){
   const inline=tokens=>this.parser.parseInline(tokens);
   return '<dl class="md-definition-list">\n'
    +token.entries.map(e=>
     e.terms.map(t=>'<dt>'+inline(t)+'</dt>\n').join('')
     +e.definitions.map(d=>'<dd>'+inline(d)+'</dd>\n').join('')
    ).join('')+'</dl>\n';
  }
 }]};
}
export function renderDefinitionLists(source,options,moreExtensions=[]){
 return new Marked(definitionListExtension(),...moreExtensions).parse(source,options);
}


/** Adjacent extension tokens may be lexed as separate lists by Marked.
 * Join only immediately adjacent safe definition lists, not arbitrary HTML.
 */
export function mergeAdjacentDefinitionLists(safeHTML){
 if(!safeHTML.includes('md-definition-list'))return safeHTML;
 const root=document.createElement('div');
 root.innerHTML=safeHTML; // Caller passes strictly sanitized markup.
 for(const current of [...root.querySelectorAll('dl.md-definition-list')]){
  if(!root.contains(current))continue;
  let next=current.nextElementSibling;
  while(next?.matches('dl.md-definition-list')){
   let sibling=current.nextSibling,onlyWhitespace=true;
   while(sibling&&sibling!==next){
    if(sibling.nodeType!==Node.TEXT_NODE||sibling.textContent.trim()){
     onlyWhitespace=false;break;
    }
    sibling=sibling.nextSibling;
   }
   if(!onlyWhitespace)break;
   while(next.firstChild)current.appendChild(next.firstChild);
   next.remove();
   next=current.nextElementSibling;
  }
 }
 return root.innerHTML;
}
