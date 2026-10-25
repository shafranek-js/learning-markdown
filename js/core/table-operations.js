import {marked} from 'marked';
import {sanitizeHTML} from './sanitize.js';
import {MAX_COLUMNS,MAX_ROWS} from './table-generator.js';
import {safeFigureUrl,figureDimension} from './figures.js';

// Only standalone top-level GFM/HTML table blocks are source-mapped.
// A nested LEAF HTML table may be edited through its containing source block;
// outer tables with descendants remain read-only to protect complex content.
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
    const offset=start+leading;
    out.push({type:'html',start:offset,end:offset+trimmed.length,raw:trimmed,innerIndex:0});
    // Preview enumerates tables in DOM order. Give each nested table a
    // matching editor index while keeping the outer source block as its
    // transactional/Undo boundary.
    const doc=new DOMParser().parseFromString(sanitizeHTML(trimmed),'text/html');
    const nested=[...doc.querySelectorAll('table')].slice(1);
    if(nested.length<=25)for(let i=0;i<nested.length;i++){
     out.push({type:'nested',start:offset,end:offset+trimmed.length,raw:trimmed,innerIndex:i+1});
    }
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
// Resolve the selected leaf table from its original source-backed HTML block.
function selectedHTMLTable(entry){
 if(!entry||!['html','nested'].includes(entry.type))return null;
 const doc=new DOMParser().parseFromString(sanitizeHTML(entry.raw),'text/html');
 const tables=[...doc.querySelectorAll('table')];
 if(tables.length>26)return null;
 const target=tables[entry.innerIndex||0];
 if(!target||target.querySelector('table'))return null;
 // Nested tables must remain inside a proper table cell; don't rewrite
 // browser-repaired malformed hierarchies or arbitrary foreign wrappers.
 if(entry.type==='nested'){
  if(!target.parentElement?.closest('td,th'))return null;
  let ancestor=target.parentElement.closest('table');
  while(ancestor){
   const copy=ancestor.cloneNode(true);
   copy.querySelectorAll('table').forEach(inner=>inner.replaceWith(doc.createTextNode('Nested table')));
   if(!modelFromHTML(copy.outerHTML))return null;
   ancestor=ancestor.parentElement?.closest('table');
  }
 }
 return {doc,target,root:tables[0],model:modelFromHTML(target.outerHTML)};
}
function replaceSelectedTable(entry,resolved,updated){
 if(!updated)return null;
 if(entry.type!=='nested')return updated;
 const replacement=new DOMParser().parseFromString(updated,'text/html').querySelector('table');
 if(!replacement)return null;
 resolved.target.replaceWith(replacement);
 // Every layer is re-sanitized before crossing the source editor boundary.
 const output=sanitizeHTML(resolved.root.outerHTML);
 const doc=new DOMParser().parseFromString(output,'text/html');
 if(doc.querySelectorAll('table').length!==
    new DOMParser().parseFromString(sanitizeHTML(entry.raw),'text/html').querySelectorAll('table').length)
  return null;
 return output;
}
const empty=(row,col,header=false)=>({row,col,rs:1,cs:1,tag:header?'th':'td',html:'',cls:''});
function cellsAt(model,row,col){
 return model.cells.find(c=>row>=c.row&&row<c.row+c.rs&&col>=c.col&&col<c.col+c.cs);
}
// A visual rectangle may intersect a cell that already has rowspan/colspan.
// Expand it to a fixed point so the subsequent merge consumes WHOLE cells,
// never a partial owner. The grid is capped at MAX_ROWS x MAX_COLUMNS.
function closedSelectionBounds(model,row,col,other={row,col}){
 if(!Number.isInteger(row)||!Number.isInteger(col)||
    !Number.isInteger(other?.row)||!Number.isInteger(other?.col))return null;
 let r0=Math.min(row,other.row),r1=Math.max(row,other.row);
 let c0=Math.min(col,other.col),c1=Math.max(col,other.col);
 if(r0<0||c0<0||r1>=model.rows||c1>=model.cols)return null;
 for(let pass=0;pass<=model.cells.length;pass++){
  let changed=false;
  for(const c of model.cells){
   if(c.row>r1||c.row+c.rs-1<r0||c.col>c1||c.col+c.cs-1<c0)continue;
   const nr0=Math.min(r0,c.row),nr1=Math.max(r1,c.row+c.rs-1);
   const nc0=Math.min(c0,c.col),nc1=Math.max(c1,c.col+c.cs-1);
   if(nr0!==r0||nr1!==r1||nc0!==c0||nc1!==c1){
    r0=nr0;r1=nr1;c0=nc0;c1=nc1;changed=true;
   }
  }
  if(!changed)return {r0,r1,c0,c1};
 }
 return null;
}
// Shared between editing and Preview highlighting: the visual selection must
// reflect the exact rectangle the merge operation will consume.
export function tableSelectionBounds(source,index,selection){
 const table=findEditableTables(source)[index];
 if(!table||!selection)return null;
 const html=table.type==='gfm'?sanitizeHTML(marked.parse(table.raw,{gfm:true})):null;
 const model=table.type==='gfm'?modelFromHTML(html):selectedHTMLTable(table)?.model;
 if(!model)return null;
 return closedSelectionBounds(model,selection.row,selection.col,selection.other||{row:selection.row,col:selection.col});
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
 }else if(operation==='merge'||operation==='merge-right'||operation==='merge-down'){
  // Merge Right/Down starts immediately after the entire merged owner,
  // rather than selecting another coordinate inside that same cell.
  const second=operation==='merge'
   ?(other||{row,col})
   :operation==='merge-right'
    ?{row:anchor.row,col:anchor.col+anchor.cs}
    :{row:anchor.row+anchor.rs,col:anchor.col};
  const bounds=closedSelectionBounds(model,row,col,second);
  if(!bounds)return null;
  const {r0,r1,c0,c1}=bounds;
  const group=model.cells.filter(c=>c.row<=r1&&c.row+c.rs-1>=r0&&c.col<=c1&&c.col+c.cs-1>=c0);
  // Re-selecting a single pre-merged owner is not a change.
  if(group.length<2)return null;
  const first=group.find(c=>c.row===r0&&c.col===c0);
  if(!first)return null;
  first.html=group.slice().sort((a,b)=>a.row-b.row||a.col-b.col)
   .map(c=>c.html.trim()).filter(Boolean).join('<br>');
  first.rs=r1-r0+1;first.cs=c1-c0+1;
  model.cells=model.cells.filter(c=>c===first||!group.includes(c));
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
  const existing=table.type==='gfm'?sanitizeHTML(marked.parse(table.raw,{gfm:true})):null;
  const target=table.type==='gfm'?null:selectedHTMLTable(table);
  const model=table.type==='gfm'?modelFromHTML(existing):target?.model;
  if(!model)return null;
  updated=updateHTML(model,operation,row,col,other);
  if(table.type==='nested')updated=replaceSelectedTable(table,target,updated);
 }
 if(updated===null)return null;
 return {text:source.slice(0,table.start)+updated+source.slice(table.end),
  start:table.start,end:table.end,kind:updated.trimStart().startsWith('<table')?'html':'gfm'};
}
// Editing a cell never requires an HTML conversion for GFM tables. For
// advanced tables the selected span owner is edited as escaped plain text.
const escapeText=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function getTableCellText(source,index,row,col){
 const table=findEditableTables(source)[index];
 if(!table||!Number.isInteger(row)||!Number.isInteger(col))return null;
 if(table.type==='gfm'){
  const rows=[table.token.header,...table.token.rows];
  return rows[row]?.[col]?.text??null;
 }
 const model=selectedHTMLTable(table)?.model;
 if(!model||row<0||row>=model.rows||col<0||col>=model.cols)return null;
 const owner=cellsAt(model,row,col);
 if(!owner)return null;
 const doc=new DOMParser().parseFromString(owner.html,'text/html');
 return doc.body.textContent||'';
}
export function setTableCellText(source,index,row,col,value){
 if(typeof value!=='string'||value.length>2000||/[\r\n]/.test(value))return null;
 const table=findEditableTables(source)[index];
 if(!table||!Number.isInteger(row)||!Number.isInteger(col))return null;
 let updated;
 if(table.type==='gfm'){
  const matrix=gfmMatrix(table.token);
  if(row<0||row>=matrix.rows.length||col<0||col>=matrix.rows[0].length)return null;
  matrix.rows[row][col]=escapeText(value).replaceAll('|','\\|');
  updated=serializeGFM(matrix);
 }else{
  const target=selectedHTMLTable(table),model=target?.model;
  if(!model||row<0||row>=model.rows||col<0||col>=model.cols)return null;
  const owner=cellsAt(model,row,col);
  if(!owner)return null;
  owner.html=escapeText(value);
  updated=replaceSelectedTable(table,target,serializeHTML(model));
 }
 if(!updated||updated===table.raw)return null;
 return {text:source.slice(0,table.start)+updated+source.slice(table.end),
  start:table.start,end:table.end,kind:table.type};
}
// Rich cell editing is deliberately restricted to stand-alone HTML tables and
// the HTML sanitizer's inline subset. GFM source remains GFM unless the user
// explicitly performs a structural/advanced operation.
const CELL_INLINE_TAGS=new Set('strong b em i u s del sup sub mark code span a br'.split(' '));
export function sanitizeInlineCellHTML(value){
 if(typeof value!=='string'||value.length>12000)return null;
 const parsed=new DOMParser().parseFromString(value,'text/html');
 // DOMParser hoists some forbidden elements (notably <script>/<style>)
 // into <head>. Reject those, never turn them into an empty cell.
 if(parsed.head.children.length)return null;
 // Block/foreign DOM cannot be safely represented by a single inline cell.
 // Refuse it instead of silently losing table structure or other content.
 if([...parsed.body.querySelectorAll('*')].some(el=>!CELL_INLINE_TAGS.has(el.tagName.toLowerCase())))
  return null;
 if((parsed.body.textContent||'').length>2000)return null;
 const clean=sanitizeHTML(value);
 const doc=new DOMParser().parseFromString(clean,'text/html');
 if([...doc.body.querySelectorAll('*')].some(el=>!CELL_INLINE_TAGS.has(el.tagName.toLowerCase())))return null;
 return doc.body.innerHTML;
}
export function getTableCellHTML(source,index,row,col){
 const table=findEditableTables(source)[index];
 if(!['html','nested'].includes(table?.type)||!Number.isInteger(row)||!Number.isInteger(col))return null;
 const model=selectedHTMLTable(table)?.model;
 if(!model||row<0||col<0||row>=model.rows||col>=model.cols)return null;
 const owner=cellsAt(model,row,col);
 return owner?sanitizeInlineCellHTML(owner.html):null;
}
export function setTableCellHTML(source,index,row,col,value){
 const inline=sanitizeInlineCellHTML(value);
 if(inline===null)return null;
 const table=findEditableTables(source)[index];
 if(!['html','nested'].includes(table?.type)||!Number.isInteger(row)||!Number.isInteger(col))return null;
 const target=selectedHTMLTable(table),model=target?.model;
 if(!model||row<0||col<0||row>=model.rows||col>=model.cols)return null;
 const owner=cellsAt(model,row,col);
 if(!owner)return null;
 if(sanitizeInlineCellHTML(owner.html)===null)return null;
 owner.html=inline;
 const updated=replaceSelectedTable(table,target,serializeHTML(model));
 if(!updated||updated===table.raw)return null;
 return {text:source.slice(0,table.start)+updated+source.slice(table.end),
  start:table.start,end:table.end,kind:'html'};
}


// Block cell editing is a separate explicit mode: inline-only operations must
// never flatten paragraphs, lists, quotations or preformatted text.
const CELL_BLOCK_TAGS=new Set('p div ul ol li blockquote pre h2 h3 h4'.split(' '));
const CELL_SAFE_TAGS=new Set([...CELL_INLINE_TAGS,...CELL_BLOCK_TAGS]);
export function sanitizeBlockCellHTML(value){
 if(typeof value!=='string'||value.length>20000)return null;
 const parsed=new DOMParser().parseFromString(value,'text/html');
 if(parsed.head.children.length||[...parsed.body.querySelectorAll('*')]
   .some(el=>!CELL_SAFE_TAGS.has(el.tagName.toLowerCase())))return null;
 if((parsed.body.textContent||'').length>5000)return null;
 // Reject orphan list items, and improper children inside list containers.
 for(const el of parsed.body.querySelectorAll('li,ul,ol')){
  const type=el.tagName.toLowerCase(),parent=el.parentElement?.tagName.toLowerCase();
  if(type==='li'&&parent!=='ul'&&parent!=='ol')return null;
  if((type==='ul'||type==='ol')&&[...el.children].some(child=>child.tagName!=='LI'))return null;
 }
 const clean=sanitizeHTML(value);
 const doc=new DOMParser().parseFromString(clean,'text/html');
 if(doc.head.children.length||[...doc.body.querySelectorAll('*')]
   .some(el=>!CELL_SAFE_TAGS.has(el.tagName.toLowerCase())))return null;
 return doc.body.innerHTML;
}
export function getTableCellBlocks(source,index,row,col){
 const table=findEditableTables(source)[index];
 if(!['html','nested'].includes(table?.type)||!Number.isInteger(row)||!Number.isInteger(col))return null;
 const model=selectedHTMLTable(table)?.model;
 if(!model||row<0||col<0||row>=model.rows||col>=model.cols)return null;
 const owner=cellsAt(model,row,col);
 return owner?sanitizeBlockCellHTML(owner.html):null;
}
export function setTableCellBlocks(source,index,row,col,value){
 const safe=sanitizeBlockCellHTML(value);
 if(safe===null)return null;
 const table=findEditableTables(source)[index];
 if(!['html','nested'].includes(table?.type)||!Number.isInteger(row)||!Number.isInteger(col))return null;
 const target=selectedHTMLTable(table),model=target?.model;
 if(!model||row<0||col<0||row>=model.rows||col>=model.cols)return null;
 const owner=cellsAt(model,row,col);
 if(!owner||sanitizeBlockCellHTML(owner.html)===null)return null;
 owner.html=safe;
 const updated=replaceSelectedTable(table,target,serializeHTML(model));
 if(!updated||updated===table.raw)return null;
 return {text:source.slice(0,table.start)+updated+source.slice(table.end),
  start:table.start,end:table.end,kind:'html'};
}

// A complex cell with ONE existing HTTPS image can expose its image metadata
// without flattening paragraphs, captions, lists, or neighboring cells.
// General contenteditable never owns the whole cell in this mode.
const IMAGE_CELL_TAGS=new Set([...CELL_SAFE_TAGS,'img','figure','figcaption']);
function imageCellOwner(source,index,row,col){
 const entry=findEditableTables(source)[index];
 if(!['html','nested'].includes(entry?.type)||!Number.isInteger(row)||!Number.isInteger(col))return null;
 // Inspect the raw HTML block as well as its sanitized representation:
 // dropped foreign/media tags elsewhere in the containing table must not be
 // silently removed during an otherwise legitimate image-property edit.
 const rawDoc=new DOMParser().parseFromString(entry.raw,'text/html');
 const allowed=new Set([...IMAGE_CELL_TAGS,'table','thead','tbody','tfoot','tr','td','th']);
 if(rawDoc.head.children.length||[...rawDoc.body.querySelectorAll('*')]
    .some(el=>!allowed.has(el.tagName.toLowerCase())))return null;
 const target=selectedHTMLTable(entry),model=target?.model;
 if(!model||row<0||col<0||row>=model.rows||col>=model.cols)return null;
 const owner=cellsAt(model,row,col);
 if(!owner||owner.html.length>25000)return null;
 const parsed=new DOMParser().parseFromString(owner.html,'text/html');
 if(parsed.head.children.length||[...parsed.body.querySelectorAll('*')]
    .some(el=>!IMAGE_CELL_TAGS.has(el.tagName.toLowerCase())))return null;
 const images=[...parsed.body.querySelectorAll('img')];
 if(images.length!==1)return null;
 const image=images[0],url=image.getAttribute('src')||'';
 // Refuse to rewrite old HTTP, data:, file:, and malformed media sources.
 if(!safeFigureUrl(url))return null;
 return {entry,target,model,owner,parsed,image,url};
}
export function getTableCellImage(source,index,row,col){
 const found=imageCellOwner(source,index,row,col);
 if(!found)return null;
 const {image,url}=found,alt=image.getAttribute('alt')||'';
 return {url,alt,decorative:alt==='',width:image.getAttribute('width')||'',
  height:image.getAttribute('height')||''};
}
export function setTableCellImage(source,index,row,col,options={}){
 const found=imageCellOwner(source,index,row,col);
 if(!found||!options||typeof options!=='object')return null;
 const {url,alt,decorative,width,height}=options;
 if(typeof url!=='string'||url.length>2048||!safeFigureUrl(url))return null;
 if(typeof alt!=='string'||alt.length>400)return null;
 if(decorative!==true&&!alt.trim())return null;
 const optionalDimension=value=>value==null||value===''?'':figureDimension(value);
 const w=optionalDimension(width),h=optionalDimension(height);
 if(w===null||h===null)return null;
 const {image,parsed,owner,model,entry,target}=found;
 image.setAttribute('src',url);
 image.setAttribute('alt',decorative===true?'':alt);
 if(w==='')image.removeAttribute('width');else image.setAttribute('width',String(w));
 if(h==='')image.removeAttribute('height');else image.setAttribute('height',String(h));
 const content=sanitizeHTML(parsed.body.innerHTML);
 // The sanitizer is the only route into the Markdown source. Verify the
 // resulting image and HTML subtree remained structurally recognizable.
 const clean=new DOMParser().parseFromString(content,'text/html');
 if(clean.querySelectorAll('img').length!==1||[...clean.body.querySelectorAll('*')]
    .some(el=>!IMAGE_CELL_TAGS.has(el.tagName.toLowerCase())))return null;
 if(content===owner.html)return null;
 owner.html=content;
 const updated=replaceSelectedTable(entry,target,serializeHTML(model));
 if(!updated||updated===entry.raw)return null;
 return {text:source.slice(0,entry.start)+updated+source.slice(entry.end),
  start:entry.start,end:entry.end,kind:'html'};
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
