// #15: offline, keyboard-accessible Unicode picker.
import {state} from '../core/state.js';
import {PALETTE_CATEGORIES,paletteLabels,searchPalette} from '../core/unicode-palette.js';
const $=id=>document.getElementById(id);
let insert=()=>{},selected='all',visible=[];
function choose(item){
 if(!item)return;
 $('unicode-picker-dialog').close();
 insert(item.char,false);
}
function renderResults(){
 const labels=paletteLabels(state.lang),grid=$('unicode-results');
 visible=searchPalette($('unicode-search').value,selected,state.lang);
 grid.replaceChildren();
 for(const item of visible){
  const button=document.createElement('button');
  button.type='button';button.className='unicode-result';button.dataset.itemId=item.id;
  button.setAttribute('aria-label',labels.insert+': '+item.name);
  button.title=item.name;
  const symbol=document.createElement('span');
  symbol.className='unicode-character';symbol.textContent=item.char;
  const title=document.createElement('span');
  title.className='unicode-item-name';title.textContent=item.name;
  button.append(symbol,title);
  button.addEventListener('click',()=>choose(item));
  grid.append(button);
 }
 $('unicode-empty').hidden=visible.length>0;
 $('unicode-count').textContent=labels.count(visible.length);
}
function renderCategories(){
 const labels=paletteLabels(state.lang),buttons=$('unicode-categories');
 buttons.replaceChildren();
 for(const name of PALETTE_CATEGORIES){
  const b=document.createElement('button');
  b.type='button';b.className='unicode-category';b.textContent=labels[name];
  b.dataset.category=name;
  b.setAttribute('aria-pressed',String(selected===name));
  b.addEventListener('click',()=>{selected=name;renderCategories();renderResults();$('unicode-search').focus();});
  buttons.append(b);
 }
}
export function renderUnicodePickerLanguage(){
 const w=paletteLabels(state.lang);
 if(!$('unicode-picker-title'))return;
 $('unicode-picker-title').textContent=w.title;
 $('unicode-picker-trigger').textContent=w.trigger;
 $('unicode-picker-trigger').setAttribute('aria-label',w.title);
 $('unicode-search-label').textContent=w.search;
 $('unicode-search').placeholder=w.search;
 $('unicode-lesson-example').textContent=w.lesson;
 $('unicode-hint').textContent=w.hint;
 $('unicode-empty').textContent=w.empty;
 $('unicode-close').textContent=w.close;
 renderCategories();
 renderResults();
}
export function initUnicodePicker({insertSnippet}){
 insert=insertSnippet;
 const dialog=$('unicode-picker-dialog'),search=$('unicode-search');
 $('unicode-picker-trigger').addEventListener('click',()=>{
  selected='all';search.value='';
  renderUnicodePickerLanguage();
  dialog.showModal();
  search.focus();
 });
 $('unicode-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>$('unicode-picker-trigger').focus({preventScroll:true}));
 $('unicode-lesson-example').addEventListener('click',()=>{
  dialog.close();insert(paletteLabels(state.lang).lessonText,false);
 });
 search.addEventListener('input',renderResults);
 // Attach directly to the search input: browser-native search-box arrow
 // behavior can otherwise consume navigation before dialog bubbling.
 search.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'){
   const first=$('unicode-results button');
   if(first){event.preventDefault();event.stopPropagation();first.focus();}
  }
 });
 dialog.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();dialog.close();return;}
  if(event.target===search&&event.key==='ArrowDown'){
   const first=$('unicode-results button');if(first){event.preventDefault();first.focus();}
  }
  if(event.target===search&&event.key==='Enter'){
   event.preventDefault();choose(visible[0]);return;
  }
  if(event.target.closest?.('#unicode-results')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
   const list=[...$('unicode-results').querySelectorAll('button')],at=list.indexOf(event.target);
   if(at<0)return;
   const columns=Math.max(1,Math.floor($('unicode-results').clientWidth / 80));
   const delta=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:event.key==='ArrowDown'?columns:-columns;
   event.preventDefault();list[Math.max(0,Math.min(list.length-1,at+delta))].focus();
  }
 });
 renderUnicodePickerLanguage();
}
