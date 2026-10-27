import {sourceSelectionTouchesFencedCode} from './source-line-format.js';

// One source of truth for textarea selections and CodeMirror multi-ranges.
// Pure, minimal changes keep surrounding Markdown byte-identical. Reject all
// ranges atomically when any of them touches a fenced code block.
export function sourceInlineWrapChanges(source,ranges,prefix,suffix,placeholder){
 if(typeof source!=='string'||typeof prefix!=='string'||!prefix||
    typeof suffix!=='string'||!suffix||typeof placeholder!=='string'||
    sourceSelectionTouchesFencedCode(source,ranges))return null;
 const canToggle=prefix===suffix&&['**','_','~~','\x60'].includes(prefix);
 return ranges.map(range=>{
  const selected=source.slice(range.from,range.to);
  const wrapped=canToggle&&selected.length>prefix.length+suffix.length&&
   selected.startsWith(prefix)&&selected.endsWith(suffix);
  const inner=wrapped?selected.slice(prefix.length,-suffix.length):(selected||placeholder);
  const insert=wrapped?inner:prefix+inner+suffix;
  const selectionFrom=range.from+(wrapped?0:prefix.length);
  return {from:range.from,to:range.to,insert,
   selectionFrom,selectionTo:selectionFrom+inner.length};
 });
}

export function formatSourceInlineSelection(source,start,end,prefix,suffix,placeholder){
 const changes=sourceInlineWrapChanges(source,[{from:start,to:end}],prefix,suffix,placeholder);
 if(changes===null)return null;
 const change=changes[0];
 return {text:source.slice(0,start)+change.insert+source.slice(end),
  start:change.selectionFrom,end:change.selectionTo};
}
