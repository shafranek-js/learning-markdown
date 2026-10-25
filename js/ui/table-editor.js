import {state,docKey} from '../core/state.js';
import {area,applyEdit} from './editor.js';
import {findEditableTables,editTableAt,previewTableCoordinates,getTableCellText,setTableCellText,tableSelectionBounds} from '../core/table-operations.js';

const $=id=>document.getElementById(id);
const UI={
 en:{title:'Edit table',cell:'Cell',rows:'Rows',cols:'Columns',merge:'Merge / Split',style:'Style',close:'Close',
  invalid:'This table structure cannot be edited safely. The source remains unchanged.',
  select:'Shift+click another cell to select a rectangular area.',
  expanded:"Selection automatically includes entire merged cells.",
  ops:['Row above','Row below','Delete row','Column left','Column right','Delete column','Merge selection','Merge right','Merge down','Split cell','Blue cell','Mint cell','Sand cell','No borders','Borders']},
 cs:{title:'Upravit tabulku',cell:'Buňka',rows:'Řádky',cols:'Sloupce',merge:'Sloučit / Rozdělit',style:'Styl',close:'Zavřít',
  invalid:'Tuto strukturu tabulky nelze bezpečně upravit. Zdroj se nezměnil.',
  select:'Shift+kliknutí na další buňku vybere oblast.',
  expanded:"Výběr automaticky zahrnuje celé sloučené buňky.",
  ops:['Řádek nad','Řádek pod','Smazat řádek','Sloupec vlevo','Sloupec vpravo','Smazat sloupec','Sloučit výběr','Sloučit vpravo','Sloučit dolů','Rozdělit buňku','Modrá buňka','Mátová buňka','Žlutá buňka','Bez okrajů','Okraje']},
 uk:{title:'Редагувати таблицю',cell:'Клітинка',rows:'Рядки',cols:'Стовпці',merge:'Об’єднати / Розділити',style:'Стиль',close:'Закрити',
  invalid:'Не вдалося безпечно змінити структуру таблиці. Вихідний текст не змінено.',
  select:'Shift+клік по іншій клітинці виділяє прямокутну область.',
  expanded:"Виділення автоматично охоплює всі об’єднані клітинки повністю.",
  ops:['Рядок вище','Рядок нижче','Видалити рядок','Стовпець ліворуч','Стовпець праворуч','Видалити стовпець','Об’єднати вибране','Об’єднати праворуч','Об’єднати вниз','Розділити клітинку','Синя клітинка','М’ятна клітинка','Жовта клітинка','Без меж','Межі']},
 ro:{title:'Editează tabel',cell:'Celulă',rows:'Rânduri',cols:'Coloane',merge:'Îmbină / Separă',style:'Stil',close:'Închide',
  invalid:'Structura tabelului nu poate fi modificată în siguranță. Sursa rămâne neschimbată.',
  select:'Shift+clic pe o altă celulă selectează o zonă dreptunghiulară.',
  expanded:"Selecția include automat toate celulele îmbinate în întregime.",
  ops:['Rând deasupra','Rând dedesubt','Șterge rândul','Coloană stânga','Coloană dreapta','Șterge coloana','Îmbină selecția','Îmbină la dreapta','Îmbină în jos','Separă celula','Celulă albastră','Celulă mentă','Celulă galbenă','Fără borduri','Borduri']},
 ru:{title:'Изменить таблицу',cell:'Ячейка',rows:'Строки',cols:'Столбцы',merge:'Объединить / Разделить',style:'Оформление',close:'Закрыть',
  invalid:'Нельзя безопасно изменить эту структуру таблицы. Исходный код не изменён.',
  select:'Shift+клик по другой ячейке выделяет прямоугольную область.',
  expanded:"Выделение автоматически захватывает объединённые ячейки целиком.",
  ops:['Строка выше','Строка ниже','Удалить строку','Столбец слева','Столбец справа','Удалить столбец','Объединить выделение','Объединить вправо','Объединить вниз','Разделить ячейку','Синяя ячейка','Мятная ячейка','Жёлтая ячейка','Без границ','Границы']}
};
const CONTENT_TEXT={
 en:['Cell text','Save cell','Text only; existing markup is replaced.','Edit cell content'],
 cs:['Text buňky','Uložit buňku','Pouze text; původní formátování bude nahrazeno.','Upravit obsah buňky'],
 uk:['Текст клітинки','Зберегти клітинку','Лише текст; попередню розмітку буде замінено.','Редагувати вміст клітинки'],
 ro:['Textul celulei','Salvează celula','Doar text; formatarea anterioară se înlocuiește.','Editează conținutul'],
 ru:['Текст ячейки','Сохранить ячейку','Только текст; прежняя разметка ячейки будет заменена.','Изменить содержимое ячейки']
};
const GROUPS=[
 {key:'rows',items:['row-above','row-below','delete-row']},
 {key:'cols',items:['column-left','column-right','delete-column']},
 {key:'merge',items:['merge','merge-right','merge-down','split']},
 {key:'style',items:['cell-blue','cell-mint','cell-sand','borderless','outline']}
];
let selected=null;
function labels(){return UI[state.lang]||UI.en;}
function clearSelection(){
 selected=null;
 $('table-edit-bar').hidden=true;
 document.querySelectorAll('#markdown-preview .table-edit-selected').forEach(c=>c.classList.remove('table-edit-selected'));
}
function refreshCellText(){
 if(!selected)return;
 const text=getTableCellText(area().value,selected.tableIndex,selected.row,selected.col);
 $('table-edit-content-input').value=text??'';
 $('table-edit-content-input').disabled=text===null;
 $('table-edit-content-save').disabled=text===null;
}
function saveCell(){
 if(!selected)return;
 const before=findEditableTables(area().value)[selected.tableIndex];
 if(!before||before.raw!==selected.raw){clearSelection();return;}
 const value=$('table-edit-content-input').value;
 const current=getTableCellText(area().value,selected.tableIndex,selected.row,selected.col);
 if(value===current)return;
 const edit=setTableCellText(area().value,selected.tableIndex,selected.row,selected.col,value);
 if(!edit){$('table-edit-message').textContent=labels().invalid;return;}
 selected.raw=findEditableTables(edit.text)[selected.tableIndex]?.raw||'';
 $('table-edit-message').textContent='';
 applyEdit(edit.text,edit.start,edit.start,{focus:false});
 syncTableEditorPreview();
}
function highlight(){
 const preview=$('markdown-preview');
 preview.querySelectorAll('.table-edit-selected').forEach(cell=>cell.classList.remove('table-edit-selected'));
 if(!selected)return;
 const tables=[...preview.querySelectorAll('table')];
 const table=tables[selected.tableIndex];
 if(!table)return clearSelection();
 const bounds=tableSelectionBounds(area().value,selected.tableIndex,selected);
 if(!bounds)return clearSelection();
 const cells=[...table.querySelectorAll('th,td')];
 for(const cell of cells){
  const p=previewTableCoordinates(table,cell);
  if(!p)continue;
  if(p.row<=bounds.r1&&p.row+p.rs-1>=bounds.r0&&
     p.col<=bounds.c1&&p.col+p.cs-1>=bounds.c0)cell.classList.add('table-edit-selected');
 }
 const l=labels();
 const other=selected.other||{row:selected.row,col:selected.col};
 const expanded=bounds.r0!==Math.min(selected.row,other.row)||
  bounds.r1!==Math.max(selected.row,other.row)||
  bounds.c0!==Math.min(selected.col,other.col)||
  bounds.c1!==Math.max(selected.col,other.col);
 $('table-edit-status').textContent=l.cell+' '+(bounds.r0+1)+', '+(bounds.c0+1)+
  (selected.other?' → '+(bounds.r1+1)+', '+(bounds.c1+1):'')+
  (expanded?' · '+l.expanded:'');
 $('table-edit-bar').hidden=false;
}
export function syncTableEditorPreview(){
 const tables=[...$('markdown-preview').querySelectorAll('table')],sourceTables=findEditableTables(area().value);
 if(tables.length!==sourceTables.length)return clearSelection();
 for(const table of tables)for(const cell of table.querySelectorAll('td,th'))cell.tabIndex=0;
 if(!selected)return;
 if(selected.doc!==docKey()||!tables[selected.tableIndex]||sourceTables[selected.tableIndex]?.raw!==selected.raw)return clearSelection();
 highlight();
}
function chooseCell(event){
 const cell=event.target.closest?.('th,td');
 if(!cell||event.target.closest('input,button,a'))return;
 const table=cell.closest('table');if(!table||!$('markdown-preview').contains(table))return;
 const tables=[...$('markdown-preview').querySelectorAll('table')],index=tables.indexOf(table);
 const sourceTables=findEditableTables(area().value);
 if(index<0||sourceTables.length!==tables.length)return;
 const coords=previewTableCoordinates(table,cell);
 if(!coords)return;
 if(event.shiftKey&&selected?.doc===docKey()&&selected.tableIndex===index){
  selected.other={row:coords.row,col:coords.col};
 }else selected={tableIndex:index,doc:docKey(),row:coords.row,col:coords.col,other:null,raw:sourceTables[index].raw};
 highlight();
 refreshCellText();
}
function applyOperation(op){
 if(!selected)return;
 const existing=findEditableTables(area().value)[selected.tableIndex];
 if(!existing||existing.raw!==selected.raw){clearSelection();return;}
 const edit=editTableAt(area().value,selected.tableIndex,op,selected);
 if(!edit){$('table-edit-message').textContent=labels().invalid;return;}
 const old=selected;old.other=null;old.row=0;old.col=0;
 old.raw=findEditableTables(edit.text)[old.tableIndex]?.raw||'';
 const caret=Math.min(edit.text.length,edit.start);
 $('table-edit-message').textContent='';
 applyEdit(edit.text,caret,caret,{focus:false});
 syncTableEditorPreview();
 refreshCellText();
}
export function renderTableEditorLanguage(){
 const l=labels(),bar=$('table-edit-bar');if(!bar)return;
 $('table-edit-title').textContent=l.title;
 $('table-edit-close').setAttribute('aria-label',l.close);
 $('table-edit-hint').textContent=l.select;
 const content=CONTENT_TEXT[state.lang]||CONTENT_TEXT.en;
 $('table-edit-content-label').textContent=content[0];
 $('table-edit-content-save').textContent=content[1];
 $('table-edit-content-warning').textContent=content[2];
 $('table-edit-content-input').setAttribute('aria-label',content[3]);
 GROUPS.forEach(({key,items})=>{
  const select=$('table-edit-'+key);
  const prior=select.value;
  select.replaceChildren(new Option(l[key],''),...items.map((op,i)=>{
   const n=GROUPS.flatMap(g=>g.items).indexOf(op);
   return new Option(l.ops[n],op);
  }));
  select.value=items.includes(prior)?prior:'';
  select.setAttribute('aria-label',l[key]);
 });
 if(selected)highlight();
}
export function initTableEditor(){
 const bar=document.createElement('div');bar.id='table-edit-bar';bar.className='table-edit-bar';bar.hidden=true;
 bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','Edit table');
 bar.innerHTML='<div class="table-edit-heading"><strong id="table-edit-title"></strong>'
  +'<span id="table-edit-status" aria-live="polite"></span><button id="table-edit-close" type="button">✕</button></div>'
  +'<div class="table-edit-actions"></div>'
  +'<form id="table-edit-content-form" class="table-edit-content-form"><label id="table-edit-content-label" for="table-edit-content-input"></label><input id="table-edit-content-input" type="text" maxlength="2000" autocomplete="off"><button id="table-edit-content-save" type="submit"></button></form>'
  +'<p id="table-edit-content-warning"></p><p id="table-edit-hint"></p><p id="table-edit-message" role="status" aria-live="polite"></p>';
 const actions=bar.querySelector('.table-edit-actions');
 for(const {key} of GROUPS){
  const select=document.createElement('select');select.id='table-edit-'+key;
  select.addEventListener('change',()=>{
   if(select.value)applyOperation(select.value);
   select.value='';
  });actions.append(select);
 }
 document.body.append(bar);
 $('table-edit-close').addEventListener('click',clearSelection);
 $('table-edit-content-form').addEventListener('submit',e=>{e.preventDefault();saveCell();});
 $('markdown-preview').addEventListener('click',chooseCell);
 $('markdown-preview').addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&/^(TD|TH)$/.test(e.target.tagName)){
   e.preventDefault();chooseCell({target:e.target,shiftKey:e.shiftKey});
   if(e.key==='Enter')$('table-edit-content-input').focus();
  }
 });
 renderTableEditorLanguage();
}
