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
  // A toolbar command leaves the selected text between the inserted markers.
  // Pressing the same button again must toggle OFF without requiring the user
  // to reselect the surrounding ** / _ / ~~ delimiters manually.
  const surrounded=canToggle&&!wrapped&&selected.length>0&&range.from>=prefix.length&&
   source.slice(range.from-prefix.length,range.from)===prefix&&
   source.slice(range.to,range.to+suffix.length)===suffix;
  const inner=wrapped?selected.slice(prefix.length,-suffix.length):(selected||placeholder);
  const from=surrounded?range.from-prefix.length:range.from;
  const to=surrounded?range.to+suffix.length:range.to;
  const insert=wrapped||surrounded?inner:prefix+inner+suffix;
  const selectionFrom=from+(wrapped||surrounded?0:prefix.length);
  return {from,to,insert,selectionFrom,selectionTo:selectionFrom+inner.length};
 });
}

export function formatSourceInlineSelection(source,start,end,prefix,suffix,placeholder){
 const changes=sourceInlineWrapChanges(source,[{from:start,to:end}],prefix,suffix,placeholder);
 if(changes===null)return null;
 const change=changes[0];
 return {text:source.slice(0,change.from)+change.insert+source.slice(change.to),
  start:change.selectionFrom,end:change.selectionTo};
}
