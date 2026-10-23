import {marked} from 'marked';
import {sanitizeHTML} from './sanitize.js';
import {MAX_COLUMNS,MAX_ROWS} from './table-generator.js';

// Only standalone, top-level GFM or HTML tables are writable. The source remains
// canonical, with exact start/end offsets, so no unrelated text is rewritten.
export function findEditableTables(source){
 const text=String(source),out=[];
 let cursor=0;
 for(const token of marked.lexer(text,{gfm:true,pedantic:false})){
  if(!token.raw)continue;
  const start=text.indexOf(token.raw,cursor);
  if(start<0)continue;
  cursor=start+token.raw.length;
  if(token.type==='table'){
   out.push({type:'gfm',start,end:cursor,token,raw:token.raw});
  }else if(token.type==='html'){
   const trimmed=token.raw.trim();
   if(/^<table\b[\s\S]*<\/table>$/i.test(trimmed)){
    const leading=token.raw.indexOf(trimmed);
    out.push({type:'html',start:start+leading,end:start+leading+trimmed.length,raw:trimmed});
   }
  }
 }
 return out;
}
const columnDelimiter=a=>a==='center'?':---:':a==='right'?'---:':a==='left'?':---':'---';
const cellText=c=>String(c?.text??'').trim().replace(/(^|[^\\])\|/g,'$1\\|');
function gfmMatrix(token){
 const rows=[token.header.map(cellText),...token.rows.map(row=>row.map(cellText))];
 return {rows,align:token.align||[]};
}
function serializeGFM({rows,align}){
 const c=rows[0].length,render=row=>'| '+row.join(' | ')+' |';
 return [render(rows[0]),render(Array.from({length:c},(_,i)=>columnDelimiter(align[i]))),
  ...rows.slice(1).map(render)].join('\n')+'\n';
}
function updateGFM(table,operation,row,col){
 const matrix=gfmMatrix(table.token),rows=matrix.rows;
 if(row<0||row>=rows.length||col<0||col>=rows[0].length)return null;
 const width=rows[0].length;
 switch(operation){
  case 'row-above':case 'row-below':{
   if(rows.length>=MAX_ROWS)return null;
   const at=row+(operation==='row-below'?1:0);
   rows.splice(at,0,Array(width).fill(' '));break;
  }
  case 'column-left':case 'column-right':{
   if(width>=MAX_COLUMNS)return null;
   const at=col+(operation==='column-right'?1:0);
   rows.forEach(r=>r.splice(at,0,' '));matrix.align.splice(at,0,null);break;
  }
  case 'delete-row':{
   if(rows.length<=1)return null;
   rows.splice(row,1);break;
  }
  case 'delete-column':{
   if(width<=1)return null;
   rows.forEach(r=>r.splice(col,1));matrix.align.splice(col,1);break;
  }
  default:return null;
 }
 return serializeGFM(matrix);
}
const spanValue=(el,name)=>{const n=Number(el.getAttribute(name)||1);return Number.isInteger(n)&&n>0&&n<=20?n:1};
function modelFromHTML(html){
 const doc=new DOMParser().parseFromString(sanitizeHTML(html),'text/html');
 const table=doc.querySelector('table');
 if(!table||table.querySelectorAll('table').length)return null;
 const trs=[...table.querySelectorAll('tr')];if(!trs.length||trs.length>MAX_ROWS)return null;
 const cells=[],occupied=Array.from({length:trs.length},()=>[]);
 let width=0;
 for(let row=0;row<trs.length;row++){
  let col=0;
  for(const el of [...trs[row].children].filter(e=>/^(TH|TD)$/.test(e.tagName))){
   while(occupied[row][col])col++;
   const rs=spanValue(el,'rowspan'),cs=spanValue(el,'colspan');
   if(col+cs>MAX_COLUMNS||row+rs>trs.length)return null;
   for(let r=row;r<row+rs;r++)for(let c=col;c<col+cs;c++){
    if(occupied[r][c])return null;
    occupied[r][c]=true;
   }
   cells.push({row,col,rs,cs,tag:el.tagName.toLowerCase(),html:el.innerHTML,
    cls:el.getAttribute('class')||''});
   col+=cs;width=Math.max(width,col);
  }
 }
 if(!width||width>MAX_COLUMNS)return null;
 if(occupied.some(row=>Array.from({length:width},(_,col)=>row[col]).some(v=>!v)))return null;
 return {rows:trs.length,cols:width,cells,cls:table.getAttribute('class')||''};
}
const empty=(row,col,header=false)=>({row,col,rs:1,cs:1,tag:header?'th':'td',html:'',cls:''});
function cellsAt(model,row,col){
 return model.cells.find(c=>row>=c.row&&row<c.row+c.rs&&col>=c.col&&col<c.col+c.cs);
}
function serializeHTML(model){
 const parts=['<table'+(model.cls?' class="'+model.cls+'"':'')+'>','<tbody>'];
 for(let r=0;r<model.rows;r++){
  parts.push('<tr>');
  for(const c of model.cells.filter(c=>c.row===r).sort((a,b)=>a.col-b.col)){
   parts.push('<'+c.tag+(c.cs>1?' colspan="'+c.cs+'"':'')+(c.rs>1?' rowspan="'+c.rs+'"':'')
     +(c.cls?' class="'+c.cls+'"':'')+'>'+c.html+'</'+c.tag+'>');
  }
  parts.push('</tr>');
 }
 parts.push('</tbody>','</table>');
 return sanitizeHTML(parts.join('\n'));
}
function normalize(model){
 model.cells.sort((a,b)=>a.row-b.row||a.col-b.col);
 const seen=Array.from({length:model.rows},()=>Array(model.cols).fill(false));
 for(const c of model.cells){
  if(c.row<0||c.col<0||c.rs<1||c.cs<1||c.row+c.rs>model.rows||c.col+c.cs>model.cols)return false;
  for(let r=c.row;r<c.row+c.rs;r++)for(let col=c.col;col<c.col+c.cs;col++){
   if(seen[r][col])return false;seen[r][col]=true;
  }
 }
 return seen.every(row=>row.every(Boolean));
}
function updateHTML(model,operation,row,col,other){
 if(row<0||row>=model.rows||col<0||col>=model.cols)return null;
 const anchor=cellsAt(model,row,col);
 if(!anchor)return null;
 if(operation==='row-above'||operation==='row-below'){
  if(model.rows>=MAX_ROWS)return null;
  const at=row+(operation==='row-below'?1:0);
  for(const c of model.cells){
   if(c.row>=at)c.row++;
   else if(c.row+c.rs>at)c.rs++;
  }
  model.rows++;
  for(let column=0;column<model.cols;column++){
   if(!cellsAt(model,at,column))model.cells.push(empty(at,column,at===0));
  }
 }else if(operation==='column-left'||operation==='column-right'){
  if(model.cols>=MAX_COLUMNS)return null;
  const at=col+(operation==='column-right'?1:0);
  for(const c of model.cells){
   if(c.col>=at)c.col++;
   else if(c.col+c.cs>at)c.cs++;
  }
  model.cols++;
  for(let r=0;r<model.rows;r++)if(!cellsAt(model,r,at))model.cells.push(empty(r,at));
 }else if(operation==='delete-row'){
  if(model.rows<=1)return null;
  model.cells=model.cells.filter(c=>{
   if(c.row===row){if(c.rs===1)return false;c.rs--;return true;}
   if(c.row<row&&c.row+c.rs>row){c.rs--;return true;}
   if(c.row>row)c.row--;
   return true;
  });
  // A spanning owner starting on the deleted row remains at its old index,
  // now occupied by the next physical row.
  model.rows--;
 }else if(operation==='delete-column'){
  if(model.cols<=1)return null;
  model.cells=model.cells.filter(c=>{
   if(c.col===col){if(c.cs===1)return false;c.cs--;return true;}
   if(c.col<col&&c.col+c.cs>col){c.cs--;return true;}
   if(c.col>col)c.col--;
   return true;
  });
  model.cols--;
 }else if(operation==='merge'){
  const second=other||{row,col};
  const r0=Math.min(row,second.row),r1=Math.max(row,second.row);
  const c0=Math.min(col,second.col),c1=Math.max(col,second.col);
  if(r0===r1&&c0===c1)return null;
  if(r1>=model.rows||c1>=model.cols)return null;
  const group=model.cells.filter(c=>c.row<=r1&&c.row+c.rs>r0&&c.col<=c1&&c.col+c.cs>c0);
  if(group.some(c=>c.row<r0||c.col<c0||c.row+c.rs-1>r1||c.col+c.cs-1>c1))return null;
  const first=group.find(c=>c.row===r0&&c.col===c0);if(!first)return null;
  first.html=group.slice().sort((a,b)=>a.row-b.row||a.col-b.col)
   .map(c=>c.html.trim()).filter(Boolean).join('<br>');
  first.rs=r1-r0+1;first.cs=c1-c0+1;
  model.cells=model.cells.filter(c=>c===first||!group.includes(c));
 }else if(operation==='merge-right'||operation==='merge-down'){
  return updateHTML(model,'merge',row,col,
   operation==='merge-right'?{row,col:col+1}:{row:row+1,col});
 }else if(operation==='split'){
  if(anchor.rs===1&&anchor.cs===1)return null;
  const {row:r,col:c,rs,cs}=anchor;anchor.rs=1;anchor.cs=1;
  for(let y=r;y<r+rs;y++)for(let x=c;x<c+cs;x++){
   if(y!==r||x!==c)model.cells.push(empty(y,x));
  }
 }else if(operation==='cell-blue'||operation==='cell-mint'||operation==='cell-sand'){
  anchor.cls=anchor.cls.split(/\s+/).filter(v=>v&&!/^af-cell-/.test(v)).concat('af-'+operation).join(' ');
 }else if(operation==='borderless'||operation==='outline'){
  model.cls=model.cls.split(/\s+/).filter(v=>v&&!/^af-table-(?:borderless|outline)$/.test(v))
   .concat('af-table-'+operation).join(' ');
 }else return null;
 return normalize(model)?serializeHTML(model):null;
}
export function editTableAt(source,index,operation,selection){
 const tables=findEditableTables(source),table=tables[index];
 if(!table||!selection)return null;
 const {row,col,other}=selection;
 if(!Number.isInteger(row)||!Number.isInteger(col))return null;
 const basic=['row-above','row-below','column-left','column-right','delete-row','delete-column'];
 let updated=null;
 if(table.type==='gfm'&&basic.includes(operation))updated=updateGFM(table,operation,row,col);
 else {
  const existing=table.type==='gfm'?sanitizeHTML(marked.parse(table.raw,{gfm:true})):table.raw;
  const model=modelFromHTML(existing);
  if(!model)return null;
  updated=updateHTML(model,operation,row,col,other);
 }
 if(updated===null)return null;
 return {text:source.slice(0,table.start)+updated+source.slice(table.end),
  start:table.start,end:table.end,kind:updated.trimStart().startsWith('<table')?'html':'gfm'};
}
const previewCache=new WeakMap();
export function previewTableCoordinates(table,cell){
 const rows=[...table.querySelectorAll('tr')],row=rows.indexOf(cell.closest('tr'));
 if(row<0)return null;
 let parsed=previewCache.get(table);
 if(!parsed){parsed=modelFromHTML(table.outerHTML);if(parsed)previewCache.set(table,parsed);}
 if(!parsed)return null;
 const candidates=parsed.cells.filter(c=>c.row===row).sort((a,b)=>a.col-b.col);
 const cellIndex=[...cell.parentElement.children].filter(el=>/^(TH|TD)$/.test(el.tagName)).indexOf(cell);
 const selected=candidates[cellIndex];
 return selected?{row:selected.row,col:selected.col,rs:selected.rs,cs:selected.cs}:null;
}
