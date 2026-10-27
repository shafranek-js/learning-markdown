// Literal Markdown source find/replace: offsets use original UTF-16 source.
export function sourceMatches(source,term,{matchCase=false}={}){
 if(typeof term!=='string'||!term)return [];
 const escaped=term.replace(/[|\\{}()[\]^$+*?.]/g,'\\$&');
 const regex=new RegExp(escaped,matchCase?'g':'gi');
 return [...String(source).matchAll(regex)].map(hit=>({from:hit.index,to:hit.index+hit[0].length}));
}
export function nextSourceMatch(source,term,position=0,{backward=false,matchCase=false}={}){
 const matches=sourceMatches(source,term,{matchCase});
 if(!matches.length)return null;
 if(backward)return [...matches].reverse().find(m=>m.from<position)||matches.at(-1);
 return matches.find(m=>m.from>=position)||matches[0];
}
export function replaceAllSourceMatches(source,term,replacement,{matchCase=false}={}){
 const matches=sourceMatches(source,term,{matchCase});
 if(!matches.length)return {text:source,count:0};
 let result='',offset=0;
 for(const match of matches){
  result+=source.slice(offset,match.from)+replacement;
  offset=match.to;
 }
 return {text:result+source.slice(offset),count:matches.length};
}
export function selectedSourceMatches(source,start,end,term,{matchCase=false}={}){
 if(!term||end-start!==term.length)return false;
 const selected=source.slice(start,end);
 return matchCase?selected===term:selected.toLocaleLowerCase()===term.toLocaleLowerCase();
}
