// Source-only Markdown list keyboard edits for the native textarea.
// Return null when the command is not applicable; do not touch CodeMirror.
const LIST=/^( *)([-+*]|\d{1,9}[.)])([ \t]+)(\[[ xX]\][ \t]+)?(.*)$/;
const FENCE=/^ {0,3}(\x60{3,}|~{3,})(.*)$/;
const QUOTED_LIST=/^( {0,3}(?:>[ \t]?)+)( *)([-+*]|\d{1,9}[.)])([ \t]+)(\[[ xX]\][ \t]+)?(.*)$/;
const QUOTE_PREFIX=/^ {0,3}(?:>[ \t]?)+/;

// Fences inside a blockquote belong to its quote depth. Do not interpret
// list-looking source within those fences as an editable Markdown list.
function fenceBefore(text,offset,quoteDepth=0){
 let open=null;
 const preceding=text.slice(0,offset);
 const lines=(preceding.endsWith('\n')?preceding.slice(0,-1):preceding).split('\n');
 for(const line of lines){
  const prefix=line.match(QUOTE_PREFIX)?.[0]||'';
  const depth=(prefix.match(/>/g)||[]).length;
  if(depth!==quoteDepth){
   // Within a quoted fence, extra > characters are literal code content,
   // not a nested quote that closes the fence. Only a shallower nonmatching
   // quote prefix ends this block. Never auto-continue a fenced list line.
   if(quoteDepth>0&&depth<quoteDepth)open=null;
   continue;
  }
  const match=(prefix?line.slice(prefix.length):line).match(FENCE);
  if(!match)continue;
  const token=match[1],symbol=token[0],size=token.length;
  if(!open){open={symbol,size};continue;}
  if(symbol===open.symbol&&size>=open.size&&match[2].trim()==='')open=null;
 }
 return Boolean(open);
}

const startOfLine=(text,pos)=>pos===0?0:text.lastIndexOf('\n',pos-1)+1;
const endOfLine=(text,pos)=>{const end=text.indexOf('\n',pos);return end===-1?text.length:end;};

function tabOnList(text,start,end,shiftKey){
 const first=startOfLine(text,start);
 const last=end>start&&text[end-1]==='\n' ? Math.max(first,end-1) : end;
 const lastStart=startOfLine(text,last);
 const edits=[];
 for(let lineStart=first;lineStart<=lastStart;){
  const lineEnd=endOfLine(text,lineStart);
  const line=text.slice(lineStart,lineEnd);
  if(!LIST.test(line)||fenceBefore(text,lineStart))return null;
  if(shiftKey){
   const spaces=line.match(/^ */)[0].length;
   if(spaces===0)return null;
   edits.push({at:lineStart,deleteCount:Math.min(2,spaces),insert:''});
  }else edits.push({at:lineStart,deleteCount:0,insert:'  '});
  if(lineEnd===text.length)break;
  lineStart=lineEnd+1;
 }
 if(!edits.length)return null;
 let updated=text;
 for(const edit of [...edits].reverse()){
  updated=updated.slice(0,edit.at)+edit.insert+updated.slice(edit.at+edit.deleteCount);
 }
 const map=pos=>{
  let delta=0;
  for(const edit of edits){
   if(pos<edit.at)break;
   if(pos<=edit.at+edit.deleteCount)return edit.at+delta+edit.insert.length;
   delta+=edit.insert.length-edit.deleteCount;
  }
  return pos+delta;
 };
 return {text:updated,start:map(start),end:map(end)};
}

// Describe a *minimal* document change so both textarea and CodeMirror
// can apply the same list rules without rewriting unaffected source lines.
export function markdownListEnterChange(text,pos){
 if(typeof text!=='string'||!Number.isInteger(pos)||pos<0||pos>text.length)return null;
 const lineStart=startOfLine(text,pos),lineEnd=endOfLine(text,pos);
 if(pos!==lineEnd)return null;
 const line=text.slice(lineStart,lineEnd);
 const quoted=line.match(QUOTED_LIST);
 const match=quoted||line.match(LIST);
 if(!match)return null;
 const quotePrefix=quoted?quoted[1]:'';
 const quoteDepth=(quotePrefix.match(/>/g)||[]).length;
 if(fenceBefore(text,lineStart)||(quoteDepth>0&&fenceBefore(text,lineStart,quoteDepth)))return null;
 const [indent,marker,space,task,content]=quoted?quoted.slice(2):match.slice(1);
 if(!content.trim()){
  // Enter on an empty list item exits that item; preserve adjacent lines.
  const insert=quotePrefix?(/[ \t]$/.test(quotePrefix)?quotePrefix:quotePrefix+' '):'';
  return {from:lineStart,to:lineEnd,insert,caret:lineStart+insert.length};
 }
 let next=marker;
 if(/^\d/.test(marker)){
  const num=Number(marker.slice(0,-1));
  if(!Number.isSafeInteger(num)||num>=999999999)return null;
  next=String(num+1)+marker.at(-1);
 }
 const insert='\n'+quotePrefix+indent+next+space+(task?'[ ] ':'');
 return {from:pos,to:pos,insert,caret:pos+insert.length};
}

function enterOnList(text,start,end){
 if(start!==end)return null;
 const change=markdownListEnterChange(text,start);
 if(!change)return null;
 const {from,to,insert,caret}=change;
 return {text:text.slice(0,from)+insert+text.slice(to),start:caret,end:caret};
}

export function editMarkdownListKey(text,start,end,key,{shiftKey=false}={}){
 if(typeof text!=='string'||!Number.isInteger(start)||!Number.isInteger(end)||
    start<0||end<start||end>text.length)return null;
 if(key==='Tab')return tabOnList(text,start,end,shiftKey);
 if(key==='Enter'&&!shiftKey)return enterOnList(text,start,end);
 return null;
}
