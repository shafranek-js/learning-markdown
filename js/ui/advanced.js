import {state,save} from '../core/state.js';
import {insertSnippet} from './toolbar.js';

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
export const advancedLabels=lang=>TEXT[lang]||TEXT.en;
function applyAdvancedVisibility(){
 const panel=$('advanced-toolbar'),open=state.advancedToolsOpen;
 panel.classList.toggle('hidden',!open);
 const toggle=$('advanced-tools-toggle');
 toggle.setAttribute('aria-expanded',String(open));
 toggle.textContent=advancedLabels(state.lang).toggle+(open?' ▴':' ▾');
}
export function renderAdvancedUI(){
 const words=advancedLabels(state.lang);
 applyAdvancedVisibility();
 $('advanced-toolbar-warning').textContent=words.warning;
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
