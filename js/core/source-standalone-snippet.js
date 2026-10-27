import {sourceSelectionTouchesFencedCode} from './source-line-format.js';

// Insert a trusted, standalone template after the selected source. A template
// is a new block, never a replacement for the author's selected Markdown.
// Empty-caret insertions keep the legacy snippet and newline convention.
export function sourceStandaloneSnippetChanges(source,ranges,snippet){
 if(typeof snippet!=='string'||!snippet.length||snippet.length>50000||
    sourceSelectionTouchesFencedCode(source,ranges))return null;
 return ranges.map(({from,to})=>{
  const hasSelection=to>from;
  let insert;
  if(hasSelection){
   // A block can interrupt ordinary Markdown; isolate it from the selected
   // text and the untouched suffix without changing either's source bytes.
   const before=to>0&&source[to-1]!=='\n'?'\n\n':'\n';
   const after=to<source.length&&source[to]!=='\n'?'\n\n':'\n';
   insert=before+snippet.replace(/^\n+|\n+$/g,'')+after;
  }else{
   const prefix=to>0&&source[to-1]!=='\n'?'\n':'';
   insert=prefix+snippet;
  }
  const pos=to+insert.length;
  return {from:to,to,insert,selectionFrom:pos,selectionTo:pos};
 });
}
export function formatSourceStandaloneSnippet(source,start,end,snippet){
 const changes=sourceStandaloneSnippetChanges(source,[{from:start,to:end}],snippet);
 if(changes===null)return null;
 const change=changes[0];
 return {text:source.slice(0,change.from)+change.insert+source.slice(change.to),
  start:change.selectionFrom,end:change.selectionTo};
}
