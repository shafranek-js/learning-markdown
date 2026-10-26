// Shared source-preserving line formatting for textarea and CodeMirror.
// Each operation computes non-overlapping, minimal replacements; reject the
// whole request if a selection touches a fenced code block.
const FENCE=/^ {0,3}(\x60{3,}|~{3,})(.*)$/;
const KINDS=new Set(['ul','ol','task','quote']);

function sourceLines(source){
 const lines=[];let start=0;
 for(let pos=0;pos<=source.length;pos++){
  if(pos===source.length||source[pos]==='\n'){
   lines.push({from:start,to:pos,text:source.slice(start,pos)});
   start=pos+1;
  }
 }
 return lines;
}

function lineIndex(lines,position){
 let low=0,high=lines.length-1;
 while(low<high){
  const middle=(low+high+1)>>1;
  if(lines[middle].from<=position)low=middle;
  else high=middle-1;
 }
 return low;
}

function protectedFences(lines){
 const result=new Set();
 let opened=null;
 lines.forEach((line,i)=>{
  const marker=line.text.match(FENCE);
  if(opened){
   result.add(i);
   if(marker&&marker[1][0]===opened.char&&marker[1].length>=opened.size&&!marker[2].trim())opened=null;
  }else if(marker){
   opened={char:marker[1][0],size:marker[1].length};
   result.add(i);
  }
 });
 return result;
}

export function sourceLineFormatEdits(source,ranges,kind){
 if(typeof source!=='string'||!Array.isArray(ranges)||!ranges.length||!KINDS.has(kind))return null;
 const lines=sourceLines(source),fenced=protectedFences(lines),selected=new Set();
 for(const range of ranges){
  if(!range||!Number.isInteger(range.from)||!Number.isInteger(range.to)||
     range.from<0||range.to<range.from||range.to>source.length)return null;
  const first=lineIndex(lines,range.from),last=lineIndex(lines,range.to);
  // The final line is excluded when a non-empty selection ends at its start.
  const end=range.to>range.from&&last>first&&lines[last].from===range.to?last-1:last;
  for(let i=first;i<=end;i++){
   if(fenced.has(i))return null;
   selected.add(i);
  }
 }
 const edits=[];let ordinal=0,previous=-2;
 for(const i of [...selected].sort((a,b)=>a-b)){
  const line=lines[i],value=line.text;
  const indent=value.match(/^[ \t]*/)[0],body=value.slice(indent.length);
  const taskMark=body.match(/^(?:[-*+]|\d+[.)])\s+\[([ xX])\]\s+/);
  const bare=body.replace(/^(?:>\s*)+/,'')
   .replace(/^(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?/,'');
  let prefix;
  if(kind==='ol'){
   if(i!==previous+1)ordinal=0;
   prefix=(++ordinal)+'. ';
  }else if(kind==='task'){
   prefix=taskMark&&/[xX]/.test(taskMark[1])?'- [x] ':'- [ ] ';
  }else prefix={ul:'- ',quote:'> '}[kind];
  previous=i;
  const next=indent+prefix+bare;
  if(next!==value)edits.push({from:line.from,to:line.to,insert:next});
 }
 return edits;
}

function mappedOffset(offset,source,edits){
 let delta=0;
 for(const edit of edits){
  if(offset<edit.from)break;
  const original=source.slice(edit.from,edit.to),insert=edit.insert;
  if(offset<=edit.to){
   if(offset===edit.from)return edit.from+delta;
   if(offset===edit.to)return edit.from+delta+insert.length;
   let sameTail=0;
   while(sameTail<original.length&&sameTail<insert.length&&
     original[original.length-1-sameTail]===insert[insert.length-1-sameTail])sameTail++;
   const tailStart=edit.to-sameTail;
   return edit.from+delta+(offset>=tailStart
    ?insert.length-(edit.to-offset)
    :Math.min(offset-edit.from,insert.length));
  }
  delta+=insert.length-original.length;
 }
 return offset+delta;
}

export function formatSourceLineSelection(source,start,end,kind){
 const edits=sourceLineFormatEdits(source,[{from:start,to:end}],kind);
 if(edits===null)return null;
 let text=source;
 for(const edit of [...edits].reverse()){
  text=text.slice(0,edit.from)+edit.insert+text.slice(edit.to);
 }
 return {text,start:mappedOffset(start,source,edits),end:mappedOffset(end,source,edits)};
}
