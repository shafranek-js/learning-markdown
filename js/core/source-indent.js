// Source-preserving multi-line Tab/Shift+Tab edits shared by textarea and
// CodeMirror. One logical selected line is changed at most once, even when
// multiple cursors overlap it. No Markdown is parsed or normalized here:
// indenting a fenced block is a deliberate source edit, not a toolbar format.
function linesOf(source){
 const lines=[];let from=0;
 for(let i=0;i<=source.length;i++)if(i===source.length||source[i]==='\n'){
  lines.push({from,to:i,text:source.slice(from,i)});from=i+1;
 }
 return lines;
}
function lineAt(lines,pos){
 let low=0,high=lines.length-1;
 while(low<high){
  const middle=(low+high+1)>>1;
  if(lines[middle].from<=pos)low=middle;
  else high=middle-1;
 }
 return low;
}
export function sourceIndentEdits(source,ranges,outdent=false){
 if(typeof source!=='string'||!Array.isArray(ranges)||!ranges.length||typeof outdent!=='boolean')return null;
 const lines=linesOf(source),selected=new Set();
 for(const r of ranges){
  if(!r||!Number.isInteger(r.from)||!Number.isInteger(r.to)||
    r.from<0||r.to<r.from||r.to>source.length)return null;
  const first=lineAt(lines,r.from),last=lineAt(lines,r.to);
  const end=r.to>r.from&&last>first&&lines[last].from===r.to?last-1:last;
  for(let i=first;i<=end;i++)selected.add(i);
 }
 const edits=[];
 for(const i of [...selected].sort((a,b)=>a-b)){
  const line=lines[i];
  if(!outdent){edits.push({from:line.from,to:line.from,insert:'  '});continue;}
  const whitespace=line.text.match(/^(?: {1,2}|\t)/)?.[0];
  if(whitespace)edits.push({from:line.from,to:line.from+whitespace.length,insert:''});
 }
 return edits;
}

function mappedOffset(offset,edits){
 let delta=0;
 for(const edit of edits){
  if(offset<edit.from)break;
  if(offset<=edit.to)return edit.from+delta+edit.insert.length;
  delta+=edit.insert.length-(edit.to-edit.from);
 }
 return offset+delta;
}
export function indentSourceSelection(source,start,end,outdent=false){
 const edits=sourceIndentEdits(source,[{from:start,to:end}],outdent);
 if(edits===null)return null;
 let text=source;
 for(const edit of [...edits].reverse()){
  text=text.slice(0,edit.from)+edit.insert+text.slice(edit.to);
 }
 return {text,start:mappedOffset(start,edits),end:mappedOffset(end,edits)};
}
