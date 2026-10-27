import {sourceSelectionTouchesFencedCode} from './source-line-format.js';

const PLACEHOLDER_URL='https://placehold.co/600x160/png';

// CommonMark image alt labels are single-line text. Escape delimiters so
// selected Markdown is preserved as literal alt text, not parsed as markup.
// Reject the whole multi-range operation if any range is unsafe.
export function sourceImageInsertionChanges(source,ranges){
 if(sourceSelectionTouchesFencedCode(source,ranges)){
  return {changes:null,reason:'protected'};
 }
 for(const {from,to} of ranges){
  if(/[\r\n]/.test(source.slice(from,to))){
   return {changes:null,reason:'multiline'};
  }
 }
 const changes=ranges.map(({from,to})=>{
  const selected=source.slice(from,to);
  if(from===to){
   const lead=from>0&&source[from-1]!=='\n'?'\n':'';
   const insert=lead+'![Image]('+PLACEHOLDER_URL+')\n';
   const pos=from+insert.length;
   return {from,to,insert,selectionFrom:pos,selectionTo:pos};
  }
  const alt=selected.replace(/[\\[\]]/g,'\\$&');
  const insert='!['+alt+']('+PLACEHOLDER_URL+')';
  return {from,to,insert,selectionFrom:from+2,selectionTo:from+2+alt.length};
 });
 return {changes,reason:null};
}

export function formatSourceImageSelection(source,start,end){
 const {changes,reason}=sourceImageInsertionChanges(source,[{from:start,to:end}]);
 if(changes===null)return {change:null,reason};
 const {from,to,insert,selectionFrom,selectionTo}=changes[0];
 return {change:{
  text:source.slice(0,from)+insert+source.slice(to),
  start:selectionFrom,end:selectionTo
 },reason:null};
}
