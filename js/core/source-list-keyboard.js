// Source-only Markdown list keyboard edits for the native textarea.
// Return null when the command is not applicable; do not touch CodeMirror.
const LIST=/^( *)([-+*]|\d{1,9}[.)])([ \t]+)(\[[ xX]\][ \t]+)?(.*)$/;
const FENCE=/^ {0,3}(\x60{3,}|~{3,})(.*)$/;

function fenceBefore(text,offset){
 let open=null;
 for(const line of text.slice(0,offset).split('\n')){
  const match=line.match(FENCE);
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

function enterOnList(text,start,end){
 if(start!==end)return null;
 const lineStart=startOfLine(text,start),lineEnd=endOfLine(text,start);
 if(start!==lineEnd||fenceBefore(text,lineStart))return null;
 const match=text.slice(lineStart,lineEnd).match(LIST);
 if(!match)return null;
 const [,indent,marker,space,task,content]=match;
 if(!content.trim()){
  // Enter on an empty list item exits that item; don't leave a ghost marker.
  return {text:text.slice(0,lineStart)+text.slice(lineEnd),start:lineStart,end:lineStart};
 }
 let next=marker;
 if(/^\d/.test(marker)){
  const num=Number(marker.slice(0,-1));
  if(!Number.isSafeInteger(num)||num>=999999999)return null;
  next=String(num+1)+marker.at(-1);
 }
 const insertion='\n'+indent+next+space+(task?'[ ] ':'');
 return {
  text:text.slice(0,start)+insertion+text.slice(end),
  start:start+insertion.length,
  end:start+insertion.length
 };
}

export function editMarkdownListKey(text,start,end,key,{shiftKey=false}={}){
 if(typeof text!=='string'||!Number.isInteger(start)||!Number.isInteger(end)||
    start<0||end<start||end>text.length)return null;
 if(key==='Tab')return tabOnList(text,start,end,shiftKey);
 if(key==='Enter'&&!shiftKey)return enterOnList(text,start,end);
 return null;
}
