import {state} from '../core/state.js';
import {markdownToHTML} from './preview.js';
import {BUILTIN_PROMPTS,PROMPT_CATEGORIES,LIBRARY_STORAGE_KEY,parsePromptLibrary,placeholders,fillPrompt,createPersonalTemplate} from '../core/prompt-library.js';

const $=id=>document.getElementById(id);
const I18N={
 en:{preview:'Rendered Markdown preview',title:'Prompt Library',subtitle:'Offline Markdown templates. No AI model is connected.',search:'Search templates',category:'Category',all:'All',favorites:'Favorites',mine:'My Templates',new:'New template',favorite:'Favorite',unfavorite:'Remove favorite',append:'Add to Sandbox',replace:'Replace Sandbox',copy:'Copy',download:'Download .md',close:'Close',output:'Prepared Markdown prompt',safety:'Text stays in your browser. Nothing is sent to an AI service.',tip:'Why this structure?',empty:'No matching templates',count:' templates',edit:'Edit my template',delete:'Delete my template',editTitle:'My template',name:'Title',description:'Description',body:'Markdown template (use {{variable}})',save:'Save template',cancel:'Cancel',variable:'Enter ',invalid:'Enter a valid title and Markdown body (up to 12 variables).',limit:'Maximum 50 personal templates.',storage:'Unable to save templates in this browser.',removeConfirm:'Delete this personal template?',unsaved:'Discard your unsaved template edits?',copied:'Copied prompt to clipboard.',copyFail:'Clipboard unavailable; select and copy the prepared prompt.',replaceConfirm:'Replace the existing Sandbox draft? You can cancel without losing any text.',allCategories:'All categories',ownType:'My template',noSelection:'Choose a template first.'},
 cs:{preview:'Vykreslený náhled Markdown',title:'Knihovna promptů',subtitle:'Offline šablony Markdown. AI model není připojen.',search:'Hledat šablony',category:'Kategorie',all:'Vše',favorites:'Oblíbené',mine:'Moje šablony',new:'Nová šablona',favorite:'Oblíbené',unfavorite:'Odebrat z oblíbených',append:'Přidat do Sandboxu',replace:'Nahradit Sandbox',copy:'Kopírovat',download:'Stáhnout .md',close:'Zavřít',output:'Připravený Markdown prompt',safety:'Text zůstává ve vašem prohlížeči. AI jej neodesíláme.',tip:'Proč tato struktura?',empty:'Žádné odpovídající šablony',count:' šablon',edit:'Upravit moji šablonu',delete:'Smazat moji šablonu',editTitle:'Moje šablona',name:'Název',description:'Popis',body:'Šablona Markdown (použijte {{variable}})',save:'Uložit šablonu',cancel:'Zrušit',variable:'Zadejte ',invalid:'Vyplňte název a text (max. 12 proměnných).',limit:'Maximum 50 vlastních šablon.',storage:'Nelze uložit šablony.',removeConfirm:'Smazat tuto šablonu?',unsaved:'Zahodit neuložené změny?',copied:'Prompt zkopírován.',copyFail:'Schránka není dostupná; vyberte text a zkopírujte jej.',replaceConfirm:'Nahradit aktuální koncept Sandboxu?',allCategories:'Všechny kategorie',ownType:'Moje šablona',noSelection:'Vyberte šablonu.'},
 uk:{preview:'Попередній перегляд Markdown',title:'Бібліотека промптів',subtitle:'Офлайн шаблони Markdown. AI не підключено.',search:'Пошук шаблонів',category:'Категорія',all:'Усі',favorites:'Обрані',mine:'Мої шаблони',new:'Новий шаблон',favorite:'В обране',unfavorite:'Прибрати з обраного',append:'Додати в Sandbox',replace:'Замінити Sandbox',copy:'Копіювати',download:'Завантажити .md',close:'Закрити',output:'Готовий Markdown промпт',safety:'Текст залишається у браузері; нічого не надсилається до AI.',tip:'Навіщо така структура?',empty:'Шаблонів не знайдено',count:' шаблонів',edit:'Редагувати мій шаблон',delete:'Видалити мій шаблон',editTitle:'Мій шаблон',name:'Назва',description:'Опис',body:'Шаблон Markdown (використовуйте {{variable}})',save:'Зберегти шаблон',cancel:'Скасувати',variable:'Уведіть ',invalid:'Потрібні назва й текст (до 12 змінних).',limit:'Максимум 50 власних шаблонів.',storage:'Не вдалося зберегти шаблони.',removeConfirm:'Видалити цей шаблон?',unsaved:'Відхилити незбережені зміни?',copied:'Промпт скопійовано.',copyFail:'Буфер недоступний; скопіюйте текст вручну.',replaceConfirm:'Замінити збережену чернетку Sandbox?',allCategories:'Усі категорії',ownType:'Мій шаблон',noSelection:'Оберіть шаблон.'},
 ro:{preview:'Previzualizare Markdown',title:'Biblioteca de prompturi',subtitle:'Șabloane Markdown offline. Fără conexiune AI.',search:'Caută șabloane',category:'Categorie',all:'Toate',favorites:'Favorite',mine:'Șabloanele mele',new:'Șablon nou',favorite:'Favorit',unfavorite:'Elimină favorit',append:'Adaugă în Sandbox',replace:'Înlocuiește Sandbox',copy:'Copiază',download:'Descarcă .md',close:'Închide',output:'Prompt Markdown pregătit',safety:'Textul rămâne în browser; nimic nu este trimis către AI.',tip:'De ce această structură?',empty:'Niciun șablon găsit',count:' șabloane',edit:'Editează șablonul',delete:'Șterge șablonul',editTitle:'Șablonul meu',name:'Titlu',description:'Descriere',body:'Șablon Markdown (folosiți {{variable}})',save:'Salvează șablonul',cancel:'Anulează',variable:'Introduceți ',invalid:'Introduceți titlul și textul (max. 12 variabile).',limit:'Maximum 50 de șabloane personale.',storage:'Nu se pot salva șabloanele.',removeConfirm:'Ștergeți acest șablon?',unsaved:'Renunțați la modificările nesalvate?',copied:'Prompt copiat.',copyFail:'Clipboard indisponibil; copiați manual textul.',replaceConfirm:'Înlocuiți ciorna Sandbox?',allCategories:'Toate categoriile',ownType:'Șablonul meu',noSelection:'Selectați un șablon.'},
 ru:{preview:'Предпросмотр Markdown',title:'Библиотека промптов',subtitle:'Офлайн-шаблоны Markdown. AI-модель не подключена.',search:'Поиск шаблонов',category:'Категория',all:'Все',favorites:'Избранное',mine:'Мои шаблоны',new:'Новый шаблон',favorite:'В избранное',unfavorite:'Убрать из избранного',append:'Добавить в Sandbox',replace:'Заменить Sandbox',copy:'Копировать',download:'Скачать .md',close:'Закрыть',output:'Подготовленный Markdown-промпт',safety:'Текст остаётся в браузере и не отправляется AI-сервисам.',tip:'Зачем такая структура?',empty:'Шаблоны не найдены',count:' шаблонов',edit:'Изменить мой шаблон',delete:'Удалить мой шаблон',editTitle:'Мой шаблон',name:'Название',description:'Описание',body:'Шаблон Markdown (используйте {{variable}})',save:'Сохранить шаблон',cancel:'Отмена',variable:'Введите ',invalid:'Укажите название и текст (не более 12 переменных).',limit:'Максимум 50 личных шаблонов.',storage:'Не удалось сохранить шаблоны в браузере.',removeConfirm:'Удалить этот шаблон?',unsaved:'Отменить несохранённые изменения?',copied:'Промпт скопирован.',copyFail:'Буфер обмена недоступен; выделите и скопируйте текст вручную.',replaceConfirm:'Заменить существующий черновик Sandbox?',allCategories:'Все категории',ownType:'Мой шаблон',noSelection:'Сначала выберите шаблон.'}
};
const labels=()=>I18N[state.lang]||I18N.en;
let data=parsePromptLibrary(null),selectedId=null,collection='all',editingId=null,dirty=false;
let values=Object.create(null),onUsePrompt=()=>false,lastFocus=null;
const allTemplates=()=>[...BUILTIN_PROMPTS,...data.personal];
const selected=()=>allTemplates().find(x=>x.id===selectedId)||null;
const mine=t=>t.id.startsWith('own_');
const active=()=>!$('prompt-library-dialog').hidden;
function store(next){
 try{localStorage.setItem(LIBRARY_STORAGE_KEY,JSON.stringify(next));data=next;return true;}
 catch(error){console.warn('Prompt library storage unavailable',error);alert(labels().storage);return false;}
}
function clearStatus(){$('prompt-library-count').textContent='';}
function button(id,text){const node=$('prompt-library-'+id);node.textContent=text;return node;}
function setText(id,text){$(id).textContent=text;}
function matchFilter(t){
 const query=$('prompt-library-search').value.trim().toLocaleLowerCase();
 const category=$('prompt-library-category').value;
 return (category==='all'||t.category===category)
 &&(collection==='all'||collection==='mine'&&mine(t)||collection==='favorites'&&data.favorites.includes(t.id))
 &&(!query||[t.title,t.description,t.category,t.body].some(x=>x.toLocaleLowerCase().includes(query)));
}
function visible(){return allTemplates().filter(matchFilter);}
function choose(id){
 if(id!==selectedId){selectedId=id;values=Object.create(null);}
 renderList();renderSelected();
}
function renderList(){
 const rows=visible(),root=$('prompt-library-list');
 root.replaceChildren();
 for(const template of rows){
  const item=document.createElement('button');item.type='button';
  item.className='prompt-library-item';item.setAttribute('role','option');
  item.setAttribute('aria-selected',String(template.id===selectedId));
  item.dataset.promptId=template.id;
  const name=document.createElement('strong');name.textContent=template.title;
  const subtitle=document.createElement('small');subtitle.textContent=template.category+(data.favorites.includes(template.id)?' · ★':'');
  item.append(name,subtitle);item.addEventListener('click',()=>choose(template.id));
  root.append(item);
 }
 $('prompt-library-count').textContent=rows.length+labels().count;
 if(!rows.length){const empty=document.createElement('p');empty.className='prompt-library-empty';empty.textContent=labels().empty;root.append(empty);}
 for(const tab of ['all','favorites','mine'])$('prompt-library-'+tab).setAttribute('aria-pressed',String(collection===tab));
}
function renderSelected(){
 let template=selected(),rows=visible();
 if(template&&!rows.some(x=>x.id===template.id))template=null;
 if(!template){
  $('prompt-library-view').hidden=true;
  return;
 }
 $('prompt-library-view').hidden=false;
 setText('prompt-library-selected-title',template.title);
 setText('prompt-library-description',template.description);
 setText('prompt-library-type',template.category+(mine(template)?' · '+labels().ownType:''));
 setText('prompt-library-tip',mine(template)?'':labels().tip+' '+template.tip);
 const starred=data.favorites.includes(template.id);
 $('prompt-library-star').setAttribute('aria-pressed',String(starred));
 button('star',starred?labels().unfavorite:labels().favorite);
 $('prompt-library-manage').hidden=!mine(template);
 const root=$('prompt-library-variables');root.replaceChildren();
 for(const variable of placeholders(template.body)){
  const wrapper=document.createElement('label');wrapper.className='prompt-library-variable';
  wrapper.textContent=labels().variable+variable;
  const input=document.createElement('textarea');input.rows=2;input.maxLength=4000;
  input.dataset.variable=variable;input.value=values[variable]||'';
  input.setAttribute('aria-label',variable);
  input.addEventListener('input',()=>{values[variable]=input.value;renderOutput();});
  wrapper.append(input);root.append(wrapper);
 }
 renderOutput();
}
function renderOutput(){
 const template=selected();
 if(!template)return;
 const output=fillPrompt(template.body,values);
 $('prompt-library-output').value=output;
 // Reuse the app's sanitized Markdown parser; user variables are untrusted text.
 $('prompt-library-rendered').innerHTML=markdownToHTML(output,state.dialect,{extensions:false});
}
function refresh(){
 const shown=visible();
 if(!shown.some(x=>x.id===selectedId)){selectedId=shown[0]?.id||null;values=Object.create(null);}
 renderList();renderSelected();
}
function cancelEdit(){
 if(!$('prompt-library-editor').hidden&&dirty&&!confirm(labels().unsaved))return false;
 dirty=false;editingId=null;
 $('prompt-library-editor').hidden=true;$('prompt-library-view').hidden=false;
 refresh();return true;
}
function startEdit(id=null){
 if(!$('prompt-library-editor').hidden&&!cancelEdit())return;
 editingId=id;dirty=false;
 const item=data.personal.find(x=>x.id===id);
 $('prompt-own-title').value=item?.title||'';
 $('prompt-own-category').value=item?.category||PROMPT_CATEGORIES[0];
 $('prompt-own-description').value=item?.description||'';
 $('prompt-own-body').value=item?.body||'';
 $('prompt-own-error').textContent='';
 $('prompt-library-view').hidden=true;$('prompt-library-editor').hidden=false;
 $('prompt-own-title').focus();
}
function close(){
 if(!active())return;
 if(!$('prompt-library-editor').hidden&&dirty&&!confirm(labels().unsaved))return;
 dirty=false;
 $('prompt-library-editor').hidden=true;
 $('prompt-library-dialog').hidden=true;
 (lastFocus?.isConnected?lastFocus:$('prompt-library-trigger')).focus();
}
export function renderPromptLibraryLanguage(){
 const w=labels();const names={
 'prompt-library-title':w.title,'prompt-library-subtitle':w.subtitle,
 'prompt-library-search-label':w.search,'prompt-library-category-label':w.category,
 'prompt-library-output-label':w.output,'prompt-library-preview-label':w.preview||'Rendered Markdown preview','prompt-library-safety':w.safety,
 'prompt-library-edit-title':w.editTitle,'prompt-own-title-label':w.name,
 'prompt-own-category-label':w.category,'prompt-own-description-label':w.description,
 'prompt-own-body-label':w.body
 };
 for(const [id,text] of Object.entries(names))setText(id,text);
 button('trigger',w.title);button('close',w.close);button('new',w.new);
 button('all',w.all);button('favorites',w.favorites);button('mine',w.mine);
 button('append',w.append);button('replace',w.replace);button('copy',w.copy);
 button('download',w.download);button('edit',w.edit);button('delete',w.delete);
 $('prompt-own-save').textContent=w.save;$('prompt-own-cancel').textContent=w.cancel;
 $('prompt-library-close').setAttribute('aria-label',w.close);
 const cat=$('prompt-library-category'),personalCat=$('prompt-own-category');
 const previous=cat.value;cat.replaceChildren();personalCat.replaceChildren();
 const make=(id,label)=>{const node=document.createElement('option');node.value=id;node.textContent=label;return node;};
 cat.append(make('all',w.allCategories));
 for(const c of PROMPT_CATEGORIES){cat.append(make(c,c));personalCat.append(make(c,c));}
 cat.value=previous||'all';
 if(active())refresh();
}
export function initPromptLibrary({usePrompt}){
 onUsePrompt=usePrompt;
 try{data=parsePromptLibrary(localStorage.getItem(LIBRARY_STORAGE_KEY));}catch{data=parsePromptLibrary(null);}
 const dialog=$('prompt-library-dialog');
 $('prompt-library-trigger').addEventListener('click',()=>{
  lastFocus=document.activeElement;
  renderPromptLibraryLanguage();refresh();dialog.hidden=false;
  $('prompt-library-search').focus();
 });
 $('prompt-library-close').addEventListener('click',close);
 dialog.addEventListener('pointerdown',event=>{if(event.target===dialog)close();});
 dialog.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}
  if(event.key!=='Tab')return;
  const controls=Array.from(dialog.querySelectorAll('button,input,select,textarea'))
   .filter(node=>!node.disabled&&!node.closest('[hidden]')&&node.getClientRects().length);
  if(!controls.length)return;
  if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls.at(-1).focus();}
  else if(!event.shiftKey&&document.activeElement===controls.at(-1)){event.preventDefault();controls[0].focus();}
 });
 for(const field of ['prompt-library-search','prompt-library-category'])
  $(field).addEventListener(field.endsWith('search')?'input':'change',refresh);
 for(const name of ['all','favorites','mine'])$('prompt-library-'+name).addEventListener('click',()=>{
  collection=name;refresh();
 });
 $('prompt-library-star').addEventListener('click',()=>{
  const template=selected();if(!template)return;
  const favorites=data.favorites.includes(template.id)?data.favorites.filter(id=>id!==template.id):[...data.favorites,template.id];
  if(store({...data,favorites}))refresh();
 });
 $('prompt-library-new').addEventListener('click',()=>startEdit());
 $('prompt-library-edit').addEventListener('click',()=>startEdit(selected()?.id));
 $('prompt-library-delete').addEventListener('click',()=>{
  const template=selected();if(!template||!mine(template)||!confirm(labels().removeConfirm))return;
  const next={personal:data.personal.filter(x=>x.id!==template.id),favorites:data.favorites.filter(x=>x!==template.id)};
  if(store(next)){selectedId=null;refresh();}
 });
 for(const id of ['prompt-own-title','prompt-own-category','prompt-own-description','prompt-own-body'])
  $(id).addEventListener('input',()=>{dirty=true;});
 $('prompt-own-cancel').addEventListener('click',cancelEdit);
 $('prompt-library-editor').addEventListener('submit',event=>{
  event.preventDefault();
  if(!editingId&&data.personal.length>=50){$('prompt-own-error').textContent=labels().limit;return;}
  try{
   const id=editingId||('own_'+crypto.randomUUID().replaceAll('-',''));
   const template=createPersonalTemplate({
    id,title:$('prompt-own-title').value,category:$('prompt-own-category').value,
    description:$('prompt-own-description').value,body:$('prompt-own-body').value
   });
   const next={...data,personal:editingId?data.personal.map(x=>x.id===id?template:x):[...data.personal,template]};
   if(!store(next))return;
   dirty=false;editingId=null;collection='mine';selectedId=id;values=Object.create(null);
   $('prompt-library-editor').hidden=true;refresh();
  }catch{$('prompt-own-error').textContent=labels().invalid;}
 });
 for(const mode of ['append','replace'])$('prompt-library-'+mode).addEventListener('click',()=>{
  const output=$('prompt-library-output').value;
  if(!selected())return;
  if(onUsePrompt(output,mode,labels().replaceConfirm))close();
 });
 $('prompt-library-copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('prompt-library-output').value);
   $('prompt-library-count').textContent=labels().copied;
  }catch{$('prompt-library-count').textContent=labels().copyFail;
   $('prompt-library-output').focus();$('prompt-library-output').select();}
 });
 $('prompt-library-download').addEventListener('click',()=>{
  const template=selected();if(!template)return;
  const file=(template.title.replace(/[^a-z0-9_-]+/gi,'-').replace(/^-|-$/g,'').slice(0,80)||'prompt')+'.md';
  const url=URL.createObjectURL(new Blob([$('prompt-library-output').value],{type:'text/markdown;charset=utf-8'}));
  const link=document.createElement('a');link.download=file;link.href=url;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 renderPromptLibraryLanguage();
}
