import {state,docKey} from '../core/state.js';
import {area,applyEdit} from './editor.js';
import {findEditableTables,editTableAt,previewTableCoordinates,getTableCellText,setTableCellText,tableSelectionBounds,getTableCellHTML,setTableCellHTML} from '../core/table-operations.js';

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
const RICH_TEXT={
 en:{rich:'Rich text',plain:'Plain text',hint:'Edit formatting safely; paste inserts plain text. Changes apply on Save.',bold:'Bold',italic:'Italic',underline:'Underline',code:'Code',unsupported:'Rich editing supports inline HTML in standalone tables only.'},
 cs:{rich:'Formátovaný text',plain:'Prostý text',hint:'Formátujte bezpečně; vložený text se převede na prostý text. Změny uložíte tlačítkem Uložit.',bold:'Tučné',italic:'Kurzíva',underline:'Podtržení',code:'Kód',unsupported:'Formátování lze upravit jen v samostatných HTML tabulkách.'},
 uk:{rich:'Форматований текст',plain:'Звичайний текст',hint:'Безпечне форматування; вставлений текст без розмітки. Для збереження натисніть кнопку.',bold:'Жирний',italic:'Курсив',underline:'Підкреслення',code:'Код',unsupported:'Форматування доступне лише для окремих HTML-таблиць.'},
 ro:{rich:'Text formatat',plain:'Text simplu',hint:'Formatare sigură; lipirea adaugă doar text. Salvați pentru a aplica.',bold:'Aldin',italic:'Cursiv',underline:'Subliniat',code:'Cod',unsupported:'Editarea formatării este disponibilă doar în tabele HTML independente.'},
 ru:{rich:'Форматированный',plain:'Обычный текст',hint:'Безопасное форматирование; вставка — только текст. Изменения применяются после сохранения.',bold:'Жирный',italic:'Курсив',underline:'Подчёркнутый',code:'Код',unsupported:'Форматирование доступно только для отдельных HTML-таблиц.'}
};
const richWords=()=>RICH_TEXT[state.lang]||RICH_TEXT.en;
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
function showCellMode(){
 if(!selected)return;
 const rich=getTableCellHTML(area().value,selected.tableIndex,selected.row,selected.col);
 const eligible=rich!==null;
 const richMode=eligible&&Boolean(selected.richMode);
 $('table-edit-mode').hidden=!eligible;
 $('table-edit-content-input').hidden=richMode;
 $('table-edit-rich-panel').hidden=!richMode;
 $('table-edit-rich-choice').setAttribute('aria-pressed',String(richMode));
 $('table-edit-plain-choice').setAttribute('aria-pressed',String(!richMode));
 $('table-edit-content-label').htmlFor=richMode?'table-edit-rich-content':'table-edit-content-input';
 $('table-edit-content-warning').textContent=richMode?richWords().hint:(CONTENT_TEXT[state.lang]||CONTENT_TEXT.en)[2];
}
function refreshCellText(){
 if(!selected)return;
 const source=area().value;
 const text=getTableCellText(source,selected.tableIndex,selected.row,selected.col);
 const html=getTableCellHTML(source,selected.tableIndex,selected.row,selected.col);
 $('table-edit-content-input').value=text??'';
 $('table-edit-content-input').disabled=text===null;
 $('table-edit-content-save').disabled=text===null;
 $('table-edit-rich-choice').disabled=html===null;
 if(html!==null)$('table-edit-rich-content').innerHTML=html;
 else $('table-edit-rich-content').replaceChildren();
 showCellMode();
}
function setCellMode(rich){
 if(!selected)return;
 if(rich&&getTableCellHTML(area().value,selected.tableIndex,selected.row,selected.col)===null)return;
 if(rich===Boolean(selected.richMode))return;
 if(rich){
  // Keep unsaved plain text when switching into the rich editor.
  $('table-edit-rich-content').textContent=$('table-edit-content-input').value;
 }else{
  $('table-edit-content-input').value=$('table-edit-rich-content').textContent;
 }
 selected.richMode=rich;
 showCellMode();
 (rich?$('table-edit-rich-content'):$('table-edit-content-input')).focus();
}
function saveCell(){
 if(!selected)return;
 const before=findEditableTables(area().value)[selected.tableIndex];
 if(!before||before.raw!==selected.raw){clearSelection();return;}
 const richMode=Boolean(selected.richMode);
 const value=richMode?$('table-edit-rich-content').innerHTML:$('table-edit-content-input').value;
 const current=richMode?getTableCellHTML(area().value,selected.tableIndex,selected.row,selected.col)
  :getTableCellText(area().value,selected.tableIndex,selected.row,selected.col);
 if(value===current)return;
 const edit=richMode?setTableCellHTML(area().value,selected.tableIndex,selected.row,selected.col,value)
  :setTableCellText(area().value,selected.tableIndex,selected.row,selected.col,value);
 if(!edit){$('table-edit-message').textContent=labels().invalid;return;}
 selected.raw=findEditableTables(edit.text)[selected.tableIndex]?.raw||'';
 $('table-edit-message').textContent='';
 applyEdit(edit.text,edit.start,edit.start,{focus:false});
 syncTableEditorPreview();
 refreshCellText();
}
function insertRichNodes(nodes){
 const editor=$('table-edit-rich-content'),selection=window.getSelection();
 const range=selection?.rangeCount?selection.getRangeAt(0):null;
 if(!range||!editor.contains(range.commonAncestorContainer))return false;
 range.deleteContents();
 const fragment=document.createDocumentFragment();
 for(const node of nodes)fragment.append(node);
 const last=fragment.lastChild;
 range.insertNode(fragment);
 if(last){range.setStartAfter(last);range.collapse(true);selection.removeAllRanges();selection.addRange(range);}
 editor.focus();return true;
}
function wrapRichSelection(tag){
 if(!selected?.richMode)return;
 const editor=$('table-edit-rich-content'),selection=window.getSelection();
 if(!selection?.rangeCount)return;
 const range=selection.getRangeAt(0);
 if(range.collapsed||!editor.contains(range.commonAncestorContainer))return;
 const node=document.createElement(tag);
 node.append(range.extractContents());
 range.insertNode(node);
 range.selectNodeContents(node);range.collapse(false);
 selection.removeAllRanges();selection.addRange(range);
 editor.focus();
}
function pastePlainText(text){
 const normalized=String(text).replace(/\r\n?/g,'\n').slice(0,2000);
 const segments=normalized.split('\n'),nodes=[];
 segments.forEach((line,i)=>{
  if(i)nodes.push(document.createElement('br'));
  if(line)nodes.push(document.createTextNode(line));
 });
 insertRichNodes(nodes);
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
 }else{
  const html=getTableCellHTML(area().value,index,coords.row,coords.col);
  selected={tableIndex:index,doc:docKey(),row:coords.row,col:coords.col,other:null,
   raw:sourceTables[index].raw,richMode:html!==null&&/<(?:strong|b|em|i|u|s|del|sup|sub|mark|code|span|a|br)\b/i.test(html)};
 }
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
 const rich=richWords();
 $('table-edit-rich-choice').textContent=rich.rich;
 $('table-edit-plain-choice').textContent=rich.plain;
 for(const [key,label] of Object.entries({bold:rich.bold,italic:rich.italic,underline:rich.underline,code:rich.code})){
  const button=$('table-edit-rich-'+key);
  button.title=label;button.setAttribute('aria-label',label);
 }
 $('table-edit-rich-content').setAttribute('aria-label',rich.rich);
 if(selected)showCellMode();
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
  +'<div id="table-edit-mode" class="table-edit-mode" role="group" hidden><button type="button" id="table-edit-rich-choice" aria-pressed="false"></button><button type="button" id="table-edit-plain-choice" aria-pressed="true"></button></div>'
  +'<form id="table-edit-content-form" class="table-edit-content-form"><label id="table-edit-content-label" for="table-edit-content-input"></label><input id="table-edit-content-input" type="text" maxlength="2000" autocomplete="off">'
  +'<div id="table-edit-rich-panel" hidden><div class="table-edit-rich-actions" role="toolbar" aria-label="Rich cell formatting">'
  +'<button type="button" id="table-edit-rich-bold"><strong>B</strong></button><button type="button" id="table-edit-rich-italic"><em>I</em></button><button type="button" id="table-edit-rich-underline"><u>U</u></button><button type="button" id="table-edit-rich-code"><code>&lt;/&gt;</code></button></div>'
  +'<div id="table-edit-rich-content" contenteditable="true" role="textbox" aria-multiline="true" spellcheck="true"></div></div>'
  +'<button id="table-edit-content-save" type="submit"></button></form>'
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
 $('table-edit-rich-choice').addEventListener('click',()=>setCellMode(true));
 $('table-edit-plain-choice').addEventListener('click',()=>setCellMode(false));
 for(const [kind,tag] of Object.entries({bold:'strong',italic:'em',underline:'u',code:'code'})){
  const btn=$('table-edit-rich-'+kind);
  btn.addEventListener('pointerdown',e=>e.preventDefault());
  btn.addEventListener('click',()=>wrapRichSelection(tag));
 }
 const editor=$('table-edit-rich-content');
 editor.addEventListener('paste',event=>{
  event.preventDefault();
  pastePlainText(event.clipboardData?.getData('text/plain')||'');
 });
 editor.addEventListener('drop',event=>event.preventDefault());
 editor.addEventListener('beforeinput',event=>{
  if(event.inputType==='insertParagraph'||event.inputType==='insertLineBreak'){
   event.preventDefault();insertRichNodes([document.createElement('br')]);
  }
 });
 $('markdown-preview').addEventListener('click',chooseCell);
 $('markdown-preview').addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&/^(TD|TH)$/.test(e.target.tagName)){
   e.preventDefault();chooseCell({target:e.target,shiftKey:e.shiftKey});
   if(e.key==='Enter')$('table-edit-content-input').focus();
  }
 });
 renderTableEditorLanguage();
}
