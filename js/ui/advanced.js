import {state,save} from '../core/state.js';
import {insertSnippet,applyAdvancedPreset,insertAdvancedPageBreak} from './toolbar.js';
import {ADVANCED_PRESETS} from '../core/advanced-presets.js';
import {RICH_CONTENT,RICH_GROUPS,richLabels} from '../data/rich-content.js';
import {insertRichContent} from './toolbar.js';

const $=id=>document.getElementById(id);
export const ADVANCED_EXAMPLES=[
 {action:'adv-underline',source:'<u>Underlined text</u>'},
 {action:'adv-sup',source:'Area: m<sup>2</sup>'},
 {action:'adv-sub',source:'Water: H<sub>2</sub>O'},
 {action:'adv-highlight',source:'<mark>Important note</mark>'},
 {action:'adv-spoiler',source:'<details>\n<summary>Open to read</summary>\n\nThis content is initially collapsed.\n</details>'}
];
const TEXT={
 en:{toggle:'HTML / Advanced',warning:'HTML · may not work on GitHub or other Markdown platforms',
   lab:'Beyond Markdown · HTML Lab',description:'Optional HTML examples. Standard Markdown lessons and certificate are unchanged.',
   insert:'Insert',actions:['Underline','Superscript','Subscript','Highlight','Expandable section']},
 cs:{toggle:'HTML / Pokročilé',warning:'HTML · nemusí fungovat na GitHubu ani na jiných Markdown platformách',
   lab:'Nad rámec Markdownu · HTML Lab',description:'Volitelné HTML příklady. Běžné lekce ani certifikát se nemění.',
   insert:'Vložit',actions:['Podtržení','Horní index','Dolní index','Zvýraznění','Rozbalovací sekce']},
 uk:{toggle:'HTML / Додатково',warning:'HTML · може не працювати на GitHub та інших Markdown платформах',
   lab:'Поза Markdown · HTML Lab',description:'Необов’язкові приклади HTML. Стандартні уроки та сертифікат не змінюються.',
   insert:'Вставити',actions:['Підкреслення','Верхній індекс','Нижній індекс','Виділення','Розгортаний блок']},
 ro:{toggle:'HTML / Avansat',warning:'HTML · poate să nu funcționeze pe GitHub sau alte platforme Markdown',
   lab:'Dincolo de Markdown · Laborator HTML',description:'Exemple HTML opționale. Lecțiile standard și certificatul rămân neschimbate.',
   insert:'Inserează',actions:['Subliniere','Exponent','Indice','Evidențiere','Secțiune extensibilă']},
 ru:{toggle:'HTML / Расширенное',warning:'HTML · может не работать на GitHub и других Markdown-платформах',
   lab:'За пределами Markdown · HTML Lab',description:'Дополнительные HTML-примеры. Основные уроки и сертификат не изменяются.',
   insert:'Вставить',actions:['Подчёркивание','Верхний индекс','Нижний индекс','Выделение','Раскрывающийся блок']}
};

const PRESET_GROUPS=Object.keys(ADVANCED_PRESETS);
export const ADVANCED_PRESET_TEXT={"en":{"names":["Text","Highlight","Font","Size","Align","Indent","Line spacing"],"apply":"Apply","pageBreak":"Page break (print/PDF)","options":{"color":["Ink","Red","Blue","Green","Purple"],"background":["Yellow","Mint","Rose","Sky"],"font":["Sans-serif","Serif","Monospace"],"size":["Small","Normal","Large","Extra large"],"align":["Left","Center","Right","Justify"],"indent":["None","Small","Medium","Large"],"spacing":["Compact","Normal","Relaxed","Double"]}},"cs":{"names":["Text","Zvýraznění","Písmo","Velikost","Zarovnání","Odsazení","Řádkování"],"apply":"Použít","pageBreak":"Konec stránky (tisk/PDF)","options":{"color":["Tmavá","Červená","Modrá","Zelená","Fialová"],"background":["Žlutá","Mátová","Růžová","Světle modrá"],"font":["Bezpatkové","Patkové","Neproporcionální"],"size":["Malá","Normální","Velká","Velmi velká"],"align":["Vlevo","Na střed","Vpravo","Do bloku"],"indent":["Žádné","Malé","Střední","Velké"],"spacing":["Kompaktní","Normální","Volné","Dvojité"]}},"uk":{"names":["Колір","Тло","Шрифт","Розмір","Вирівнювання","Відступ","Інтервал"],"apply":"Застосувати","pageBreak":"Розрив сторінки (друк/PDF)","options":{"color":["Темний","Червоний","Синій","Зелений","Фіолетовий"],"background":["Жовтий","М’ятний","Рожевий","Блакитний"],"font":["Без зарубок","Із зарубками","Моноширинний"],"size":["Малий","Звичайний","Великий","Дуже великий"],"align":["Ліворуч","По центру","Праворуч","За шириною"],"indent":["Без відступу","Малий","Середній","Великий"],"spacing":["Щільний","Звичайний","Вільний","Подвійний"]}},"ro":{"names":["Culoare","Fundal","Font","Mărime","Aliniere","Indentare","Spațiere"],"apply":"Aplică","pageBreak":"Pagină nouă (tipărire/PDF)","options":{"color":["Închis","Roșu","Albastru","Verde","Violet"],"background":["Galben","Mentă","Roz","Albastru pal"],"font":["Fără serife","Cu serife","Monospațiat"],"size":["Mic","Normal","Mare","Foarte mare"],"align":["Stânga","Centru","Dreapta","Justificat"],"indent":["Fără","Mică","Medie","Mare"],"spacing":["Compactă","Normală","Aerisit","Dublă"]}},"ru":{"names":["Цвет текста","Фон","Шрифт","Размер","Выравнивание","Отступ","Интервал"],"apply":"Применить","pageBreak":"Разрыв страницы (печать/PDF)","options":{"color":["Тёмный","Красный","Синий","Зелёный","Фиолетовый"],"background":["Жёлтый","Мятный","Розовый","Голубой"],"font":["Без засечек","С засечками","Моноширинный"],"size":["Маленький","Обычный","Большой","Очень большой"],"align":["Влево","По центру","Вправо","По ширине"],"indent":["Без отступа","Маленький","Средний","Большой"],"spacing":["Компактный","Обычный","Свободный","Двойной"]}}};
function renderPresetControls(){
 const words=ADVANCED_PRESET_TEXT[state.lang]||ADVANCED_PRESET_TEXT.en;
 const root=$('advanced-preset-controls');root.replaceChildren();
 PRESET_GROUPS.forEach((group,index)=>{
  const label=document.createElement('label');
  label.className='flex items-center gap-1 shrink-0 text-[11px] font-semibold theme-muted';
  const name=document.createElement('span');name.textContent=words.names[index];
  const select=document.createElement('select');select.id='advanced-'+group;
  select.className='rounded-md theme-panel-alt border theme-border px-1.5 py-1 text-[11px] cursor-pointer';
  select.setAttribute('aria-label',words.names[index]);
  const values=ADVANCED_PRESETS[group];
  values.forEach((value,i)=>{
   const option=document.createElement('option');option.value=value;
   option.textContent=words.options[group][i]||value;select.append(option);
  });
  const choice=state.advancedPresetChoices?.[group];
  select.value=values.includes(choice)?choice:values[0];
  select.addEventListener('change',()=>{
   if(!state.advancedPresetChoices||typeof state.advancedPresetChoices!=='object')state.advancedPresetChoices={};
   state.advancedPresetChoices[group]=select.value;save();
  });
  const apply=document.createElement('button');apply.type='button';
  apply.className='rounded-md border theme-border theme-accent-soft px-1.5 py-1 text-[10px] font-bold';
  apply.textContent=words.apply;apply.dataset.advancedApply=group;
  apply.setAttribute('aria-label',words.apply+': '+words.names[index]);
  apply.title=words.names[index]+' · HTML/CSS';
  apply.addEventListener('click',()=>applyAdvancedPreset(group,select.value));
  label.append(name,select,apply);root.append(label);
 });
 const pageBreak=document.createElement('button');pageBreak.type='button';
 pageBreak.id='advanced-page-break';
 pageBreak.className='shrink-0 rounded-md border theme-border theme-accent-soft px-2 py-1 text-[11px] font-semibold';
 pageBreak.textContent=words.pageBreak;pageBreak.title=words.pageBreak;
 pageBreak.addEventListener('click',insertAdvancedPageBreak);root.append(pageBreak);
}

function renderRichControls(){
 const locale=richLabels(state.lang),root=$('advanced-rich-controls');root.replaceChildren();
 $('advanced-rich-heading').textContent=locale.heading;
 for(let i=0;i<RICH_GROUPS.length;i++){
  const group=RICH_GROUPS[i],options=RICH_CONTENT[group],label=document.createElement('label');
  label.className='flex items-center gap-1.5 shrink-0 text-[11px] theme-muted font-semibold';
  const title=document.createElement('span');title.textContent=locale.groups[i];
  const select=document.createElement('select');select.id='rich-'+group;
  select.setAttribute('aria-label',locale.groups[i]);
  select.className='rounded-md theme-panel-alt border theme-border px-1.5 py-1 text-[11px]';
  options.forEach((option,index)=>{
   const entry=document.createElement('option');entry.value=option.id;
   entry.textContent=locale.items[i][index]||option.label;select.append(entry);
  });
  const chosen=state.advancedRichChoices?.[group];
  if(options.some(o=>o.id===chosen))select.value=chosen;
  select.addEventListener('change',()=>{
   if(!state.advancedRichChoices||typeof state.advancedRichChoices!=='object')state.advancedRichChoices={};
   state.advancedRichChoices[group]=select.value;save();
  });
  const apply=document.createElement('button');apply.type='button';
  apply.className='rounded-md theme-accent-soft border theme-border px-2 py-1 font-bold text-[11px]';
  apply.dataset.richApply=group;apply.textContent=locale.insert;
  apply.setAttribute('aria-label',locale.insert+': '+locale.groups[i]);
  apply.addEventListener('click',()=>insertRichContent(group,select.value));
  label.append(title,select,apply);root.append(label);
 }
 const examples=$('advanced-rich-lab-examples');examples.replaceChildren();
 for(let i=0;i<RICH_GROUPS.length;i++){
  const group=RICH_GROUPS[i];
  RICH_CONTENT[group].forEach((option,j)=>{
   const item=document.createElement('button');item.type='button';
   item.className='w-full flex gap-2 items-center justify-between rounded-lg border theme-border theme-panel px-2 py-1.5 text-xs';
   item.dataset.richExample=group+':'+option.id;
   const name=document.createElement('span');name.className='min-w-0 text-left font-semibold';
   name.textContent=locale.items[i][j]||option.label;
   const insert=document.createElement('span');insert.className='theme-accent-soft font-semibold text-[10px] px-1.5 py-1 rounded shrink-0';
   insert.textContent=locale.insert;
   item.setAttribute('aria-label',locale.insert+': '+name.textContent);
   item.addEventListener('click',()=>insertRichContent(group,option.id));
   item.append(name,insert);examples.append(item);
  });
 }
 $('advanced-rich-lab-title').textContent=locale.heading+' · '+locale.description;
}
export const advancedLabels=lang=>TEXT[lang]||TEXT.en;
function applyAdvancedVisibility(){
 const panel=$('advanced-toolbar'),open=state.advancedToolsOpen;
 panel.classList.toggle('hidden',!open);
 $('advanced-rich-toolbar').classList.toggle('hidden',!open);
 const toggle=$('advanced-tools-toggle');
 toggle.setAttribute('aria-expanded',String(open));
 toggle.textContent=advancedLabels(state.lang).toggle+(open?' ▴':' ▾');
}
export function renderAdvancedUI(){
 const words=advancedLabels(state.lang);
 applyAdvancedVisibility();
 $('advanced-toolbar-warning').textContent=words.warning;
 renderPresetControls();
 renderRichControls();
 $('advanced-lab-title').textContent=words.lab;
 $('advanced-lab-description').textContent=words.description;
 const root=$('advanced-lab-examples');root.replaceChildren();
 ADVANCED_EXAMPLES.forEach((item,i)=>{
  const btn=document.createElement('button');
  btn.type='button';btn.className='w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg theme-panel border theme-border hover:opacity-90 text-xs font-mono';
  const label=document.createElement('span');label.className='truncate text-left';label.textContent=item.source;
  const action=document.createElement('span');action.className='shrink-0 text-[10px] font-sans font-semibold theme-accent-soft rounded px-1.5 py-0.5';
  action.textContent=words.insert;
  btn.setAttribute('aria-label',words.insert+': '+words.actions[i]);
  btn.title=words.actions[i]+' · HTML';
  btn.append(label,action);
  btn.addEventListener('click',()=>insertSnippet(item.source+'\n'));
  root.append(btn);
  const toolbarButton=document.querySelector('[data-action="'+item.action+'"]');
  if(toolbarButton){toolbarButton.title=words.actions[i]+' · HTML';toolbarButton.setAttribute('aria-label',words.actions[i]+' · HTML');}
 });
}
export function initAdvancedUI(){
 const button=$('advanced-tools-toggle');
 button.addEventListener('click',()=>{
  state.advancedToolsOpen=!state.advancedToolsOpen;
  applyAdvancedVisibility();save();
 });
 $('advanced-lab').open=state.advancedLabExpanded;
 $('advanced-lab').addEventListener('toggle',e=>{
  state.advancedLabExpanded=e.target.open;save();
 });
 renderAdvancedUI();
}
