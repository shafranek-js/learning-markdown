import {state} from '../core/state.js';
import {insertStandaloneSnippet} from './toolbar.js';
import {multiActive} from './editor.js';
import {GRID_COLUMNS,GRID_ROWS,MAX_COLUMNS,MAX_ROWS,makeMarkdownTable,validateTableDimensions} from '../core/table-generator.js';
const L={
 en:['Insert Table','Columns','Rows','Insert','Cancel','Hover or use arrow keys to select.','Markdown tables render in GFM mode.','Column'],
 cs:['Vložit tabulku','Sloupce','Řádky','Vložit','Zrušit','Vyberte rozměry myší nebo šipkami.','Markdown tabulky se zobrazují v režimu GFM.','Sloupec'],
 uk:['Вставити таблицю','Стовпці','Рядки','Вставити','Скасувати','Виберіть розмір мишею або стрілками.','Markdown-таблиці відображаються у режимі GFM.','Стовпець'],
 ro:['Inserează tabel','Coloane','Rânduri','Inserează','Anulează','Selectați dimensiunea cu mouse-ul sau săgețile.','Tabelele Markdown se afișează în modul GFM.','Coloana'],
 ru:['Вставить таблицу','Столбцы','Строки','Вставить','Отмена','Выберите размер мышью или стрелками.','Markdown-таблицы отображаются в режиме GFM.','Столбец']
};
const $=id=>document.getElementById(id);
let size={columns:2,rows:2},visible=false,cells=[],selection=null;
const words=()=>L[state.lang]||L.en;
function update(){
 $('table-picker-size').textContent=size.columns+' × '+size.rows;
 $('table-picker-columns').value=size.columns;
 $('table-picker-rows').value=size.rows;
 for(const cell of cells)cell.classList.toggle('selected',Number(cell.dataset.col)<=size.columns&&Number(cell.dataset.row)<=size.rows);
 $('table-picker-mode-hint').hidden=state.dialect==='gfm';
}
function setSize(c,r){const valid=validateTableDimensions(c,r);if(valid){size=valid;update();}}
function position(){
 const b=$('table-picker-trigger').getBoundingClientRect(),popup=$('table-picker-popup');
 const w=popup.offsetWidth||320,h=popup.offsetHeight||370;
 const left=Math.max(8,Math.min(b.left,window.innerWidth-w-8));
 const top=b.bottom+h+8>window.innerHeight&&b.top>h+8?b.top-h-6:b.bottom+6;
 popup.style.left=left+'px';popup.style.top=Math.max(8,Math.min(top,window.innerHeight-h-8))+'px';
}
function close(focus=false){if(!visible)return;visible=false;$('table-picker-popup').hidden=true;$('table-picker-trigger').setAttribute('aria-expanded','false');if(focus)$('table-picker-trigger').focus();}
function open(){
 if(visible){close(true);return;}
 const input=$('markdown-input');selection={start:input.selectionStart,end:input.selectionEnd,lesson:state.currentLessonIndex};
 visible=true;$('table-picker-popup').hidden=false;$('table-picker-trigger').setAttribute('aria-expanded','true');
 renderTablePickerLanguage();position();
}
function insert(){
 if(!validateTableDimensions(size.columns,size.rows))return;
 // Restore native selection after popup focus; CodeMirror retains its own ranges.
 if(!multiActive()&&selection?.lesson===state.currentLessonIndex)
  $('markdown-input').setSelectionRange(selection.start,selection.end);
 const text=makeMarkdownTable(size.columns,size.rows,words()[7]);
 close();insertStandaloneSnippet('\n'+text+'\n');
}
export function renderTablePickerLanguage(){
 const w=words(),names=['title','columns-label','rows-label','insert','cancel','hint','mode-hint'];
 const text=[w[0],w[1],w[2],w[3],w[4],w[5],w[6]];
 names.forEach((name,i)=>{$('table-picker-'+name).textContent=text[i];});
 $('table-picker-trigger').title=w[0];$('table-picker-trigger').setAttribute('aria-label',w[0]);
 $('table-picker-columns').setAttribute('aria-label',w[1]);
 $('table-picker-rows').setAttribute('aria-label',w[2]);
 cells.forEach(c=>c.setAttribute('aria-label',c.dataset.col+' × '+c.dataset.row));
 update();
}
export function initTablePicker(){
 const popup=document.createElement('div');popup.id='table-picker-popup';popup.className='table-picker';popup.hidden=true;
 popup.setAttribute('role','dialog');popup.setAttribute('aria-modal','false');popup.setAttribute('aria-labelledby','table-picker-title');
 popup.innerHTML='<strong id="table-picker-title"></strong><div id="table-picker-size" aria-live="polite"></div>'
 +'<div id="table-picker-grid" role="group"></div><p id="table-picker-hint"></p>'
 +'<form id="table-picker-form"><label><span id="table-picker-columns-label"></span><input id="table-picker-columns" type="number" min="1" max="'+MAX_COLUMNS+'" required></label>'
 +'<label><span id="table-picker-rows-label"></span><input id="table-picker-rows" type="number" min="1" max="'+MAX_ROWS+'" required></label>'
 +'<button id="table-picker-insert" type="submit"></button><button id="table-picker-cancel" type="button"></button></form>'
 +'<p id="table-picker-mode-hint" hidden></p>';
 document.body.append(popup);
 const grid=$('table-picker-grid');
 for(let row=1;row<=GRID_ROWS;row++)for(let col=1;col<=GRID_COLUMNS;col++){
  const b=document.createElement('button');b.type='button';b.className='table-picker-cell';b.dataset.col=col;b.dataset.row=row;
  b.tabIndex=col===2&&row===2?0:-1;
  b.addEventListener('pointerenter',()=>setSize(col,row));
  b.addEventListener('focus',()=>setSize(col,row));
  b.addEventListener('click',()=>{setSize(col,row);insert();});
  b.addEventListener('keydown',e=>{
   const move={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]}[e.key];if(!move)return;
   e.preventDefault();const c=Math.max(1,Math.min(GRID_COLUMNS,col+move[0])),r=Math.max(1,Math.min(GRID_ROWS,row+move[1]));
   cells.forEach(x=>x.tabIndex=x.dataset.col==c&&x.dataset.row==r?0:-1);
   grid.querySelector('[data-col="'+c+'"][data-row="'+r+'"]').focus();
  });cells.push(b);grid.append(b);
 }
 const trigger=$('table-picker-trigger');
 trigger.addEventListener('click',open);
 trigger.addEventListener('keydown',e=>{if(e.key==='ArrowDown'&&!visible){e.preventDefault();open();grid.querySelector('[data-col="1"][data-row="1"]').focus();}});
 $('table-picker-form').addEventListener('submit',e=>{
  e.preventDefault();const c=Number($('table-picker-columns').value),r=Number($('table-picker-rows').value);
  if(validateTableDimensions(c,r)){setSize(c,r);insert();}
 });
 for(const id of ['columns','rows'])$('table-picker-'+id).addEventListener('input',()=>{
  const c=Number($('table-picker-columns').value),r=Number($('table-picker-rows').value);
  if(validateTableDimensions(c,r))setSize(c,r);
 });
 $('table-picker-cancel').addEventListener('click',()=>close(true));
 document.addEventListener('pointerdown',e=>{if(visible&&!popup.contains(e.target)&&!trigger.contains(e.target))close();});
 document.addEventListener('keydown',e=>{if(visible&&e.key==='Escape'){e.preventDefault();close(true);}});
 window.addEventListener('resize',()=>{if(visible)position();});
 window.addEventListener('scroll',()=>{if(visible)position();},true);
 renderTablePickerLanguage();
}
