import {sourceSelectionTouchesFencedCode} from './source-line-format.js';

// Insert a trusted, standalone template after the selected source. A template
// is a new block, never a replacement for the author's selected Markdown.
// Empty-caret insertions keep the legacy snippet and newline convention.
export function sourceStandaloneSnippetChanges(source,ranges,snippet){
 if(typeof snippet!=='string'||!snippet.length||snippet.length>50000||
    sourceSelectionTouchesFencedCode(source,ranges))return null;
 return ranges.map(({from,to})=>{
  const hasSelection=to>from;
  // A partial-line selection might be a Markdown link label, inline code or
  // an emphasis span. Insert AFTER that entire line, never inside its syntax.
  // A selection ending exactly at the next line's start already has a safe
  // block boundary and must not consume that next line.
  const lineEnd=hasSelection&&to<source.length&&source[to-1]!=='\n'
   ?source.indexOf('\n',to):-1;
  const at=hasSelection&&to<source.length&&source[to-1]!=='\n'
   ?(lineEnd>=0?lineEnd:source.length):to;
  let insert;
  if(hasSelection){
   const before=at>0&&source[at-1]!=='\n'?'\n\n':'\n';
   const after=at<source.length&&source[at]!=='\n'?'\n\n':'\n';
   insert=before+snippet.replace(/^\n+|\n+$/g,'')+after;
  }else{
   const prefix=to>0&&source[to-1]!=='\n'?'\n':'';
   insert=prefix+snippet;
  }
  const pos=at+insert.length;
  return {from:at,to:at,insert,selectionFrom:pos,selectionTo:pos};
 });
}
export function formatSourceStandaloneSnippet(source,start,end,snippet){
 const changes=sourceStandaloneSnippetChanges(source,[{from:start,to:end}],snippet);
 if(changes===null)return null;
 const change=changes[0];
 return {text:source.slice(0,change.from)+change.insert+source.slice(change.to),
  start:change.selectionFrom,end:change.selectionTo};
}
