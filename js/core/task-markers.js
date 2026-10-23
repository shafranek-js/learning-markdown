// Locate task markers without including examples inside fenced code blocks.
// Only unambiguous one-to-one matches with rendered list checkboxes are editable.
export function scanTaskMarkers(source){
 const matches=[];let offset=0,fence=null;
 for(const part of String(source).match(/[^\n]*\n|[^\n]+$/g)||[]){
  const line=part.replace(/\r?\n$/,'');
  const content=line.replace(/^(?: {0,3}>[ \t]?)+/,'');
  const fm=content.match(/^ {0,3}((?:\x60{3,}|~{3,}))(.*)$/);
  if(fence){
   if(fm&&fm[1][0]===fence.char&&fm[1].length>=fence.length&&/^[ \t]*$/.test(fm[2]))fence=null;
  }else if(fm){
   fence={char:fm[1][0],length:fm[1].length};
  }else{
   const m=content.match(/^([ \t]*(?:[-+*]|\d{1,9}[.)])[ \t]+)\[([ xX])\](?=[ \t]|$)/);
   if(m)matches.push({offset:offset+line.length-content.length+m[1].length+1,checked:m[2].toLowerCase()==='x'});
  }
  offset+=part.length;
 }
 return matches;
}
export function switchTaskMarker(source,marker,checked){
 if(!marker||!Number.isInteger(marker.offset))return null;
 const char=source[marker.offset];
 if(![' ','x','X'].includes(char)||(char.toLowerCase()==='x')!==marker.checked)return null;
 return source.slice(0,marker.offset)+(checked?'x':' ')+source.slice(marker.offset+1);
}
