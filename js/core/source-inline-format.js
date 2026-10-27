import {sourceSelectionTouchesFencedCode} from './source-line-format.js';

// One source of truth for textarea selections and CodeMirror multi-ranges.
// Pure, minimal changes keep surrounding Markdown byte-identical. Reject all
// ranges atomically when any of them touches a fenced code block.
export function sourceInlineWrapChanges(source,ranges,prefix,suffix,placeholder){
 if(typeof source!=='string'||typeof prefix!=='string'||!prefix||
    typeof suffix!=='string'||!suffix||typeof placeholder!=='string'||
    sourceSelectionTouchesFencedCode(source,ranges))return null;
 const variants=prefix==='**'&&suffix==='**'?['**','__']:
  prefix==='_'&&suffix==='_'?['_','*']:
  prefix===suffix&&['~~','\x60'].includes(prefix)?[prefix]:[];
 const markerIsValid=(marker,from,to)=>{
  const inner=source.slice(from+marker.length,to-marker.length);
  // Whitespace-only and padded delimiter pairs are literal Markdown text.
  if(!inner||/^\\s|\\s$/.test(inner))return false;
  // A backslash escaping the opening delimiter must remain untouched.
  const before=source.slice(0,from).match(/\\\\+$/)?.[0]?.length||0;
  if(before%2===1)return false;
  // CommonMark does not recognize intraword underscores as emphasis.
  if(marker.includes('_')&&/^[\\p{L}\\p{N}]$/u.test(source[from-1]||'')&&
     /^[\\p{L}\\p{N}]$/u.test(source[to]||''))return false;
  return true;
 };
 return ranges.map(range=>{
  const selected=source.slice(range.from,range.to);
  const full=variants.find(marker=>
   selected.length>marker.length*2&&selected.startsWith(marker)&&selected.endsWith(marker)&&
   markerIsValid(marker,range.from,range.to));
  // The toolbar selects only the word between markers after wrapping it.
  const around=!full&&selected.length>0?variants.find(marker=>
   range.from>=marker.length&&
   source.slice(range.from-marker.length,range.from)===marker&&
   source.slice(range.to,range.to+marker.length)===marker&&
   markerIsValid(marker,range.from-marker.length,range.to+marker.length)):null;
  const inner=full?selected.slice(full.length,-full.length):(selected||placeholder);
  const from=around?range.from-around.length:range.from;
  const to=around?range.to+around.length:range.to;
  const insert=full||around?inner:prefix+inner+suffix;
  const selectionFrom=from+(full||around?0:prefix.length);
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
