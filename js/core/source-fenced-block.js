import {sourceSelectionTouchesFencedCode} from './source-line-format.js';

// Build source-safe fenced Markdown blocks without deleting user selections.
// Every range is computed against the original source; both editors apply the
// resulting replacements as one undoable operation.
export function sourceFencedBlockChanges(source,ranges){
 if(sourceSelectionTouchesFencedCode(source,ranges))return null;
 return ranges.map(({from,to})=>{
  const leading=from>0&&source[from-1]!=='\n'?'\n':'';
  const selected=source.slice(from,to);
  // Preserve the original empty-caret template, including its trailing newline.
  if(from===to){
   const snippet='\x60\x60\x60js\nconsole.log("Markdown Studio");\n\x60\x60\x60\n';
   const insert=leading+snippet;
   const caret=from+insert.length;
   return {from,to,insert,selectionFrom:caret,selectionTo:caret};
  }
  // Backtick runs inside selected text must never terminate the new fence.
  const longest=(selected.match(/\x60+/g)||[]).reduce((n,run)=>Math.max(n,run.length),2);
  const fence='\x60'.repeat(longest+1);
  const opening=leading+fence+'\n';
  const afterBody=selected.endsWith('\n')?'':'\n';
  const trailing=to<source.length&&source[to]!=='\n'?'\n':'';
  const insert=opening+selected+afterBody+fence+trailing;
  const selectionFrom=from+opening.length;
  return {from,to,insert,selectionFrom,selectionTo:selectionFrom+selected.length};
 });
}

export function formatSourceFencedBlockSelection(source,start,end){
 const changes=sourceFencedBlockChanges(source,[{from:start,to:end}]);
 if(changes===null)return null;
 const {from,to,insert,selectionFrom,selectionTo}=changes[0];
 return {text:source.slice(0,from)+insert+source.slice(to),
  start:selectionFrom,end:selectionTo};
}
