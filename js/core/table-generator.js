export const GRID_COLUMNS=10,GRID_ROWS=8,MAX_COLUMNS=20,MAX_ROWS=50;
export function validateTableDimensions(columns,rows){
 const c=Number(columns),r=Number(rows);
 return Number.isInteger(c)&&Number.isInteger(r)&&c>=1&&r>=1&&c<=MAX_COLUMNS&&r<=MAX_ROWS?{columns:c,rows:r}:null;
}
export function makeMarkdownTable(columns,rows,label='Column'){
 const x=validateTableDimensions(columns,rows);
 if(!x)throw new RangeError('Invalid table dimensions');
 const safe=(String(label).replace(/[\r\n|]/g,' ').trim()||'Column')
  .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const header='| '+Array.from({length:x.columns},(_,i)=>safe+' '+(i+1)).join(' | ')+' |';
 const separator='| '+Array(x.columns).fill('---').join(' | ')+' |';
 const empty='| '+Array(x.columns).fill(' ').join(' | ')+' |';
 return [header,separator,...Array(x.rows-1).fill(empty)].join('\n')+'\n';
}
