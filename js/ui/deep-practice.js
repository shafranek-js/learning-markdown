import {practiceForLesson,evaluatePractice,PRACTICE_UI} from '../data/deep-practice.js';
import {state} from '../core/state.js';
import {insertSnippet} from './toolbar.js';
const $=id=>document.getElementById(id);
let renderedKey='';
const items=new Map();

export function renderPractice(lessonId,markdown,html){
 const locale=PRACTICE_UI[state.lang]||PRACTICE_UI.en;
 const key=lessonId+':'+state.lang;
 if(key!==renderedKey){
  renderedKey=key;items.clear();
  $('deep-practice-title').textContent=locale.title;
  $('deep-practice-subtitle').textContent=locale.subtitle;
  $('deep-practice-optional').textContent=locale.optional;
  const root=$('deep-practice-items');root.replaceChildren();
  for(const drill of practiceForLesson(lessonId)){
   const card=document.createElement('div');card.className='theme-panel border theme-border rounded-lg p-2';
   const heading=document.createElement('div');heading.className='flex items-center gap-2 justify-between';
   const label=document.createElement('span');label.className='text-[11px] font-semibold';
   const mark=document.createElement('span');mark.className='font-mono mr-1';mark.textContent='○';
   label.append(mark,document.createTextNode(drill.labels[state.lang]||drill.labels.en));
   const button=document.createElement('button');button.type='button';button.className='shrink-0 text-[10px] px-2 py-1 rounded theme-accent-soft border theme-border';
   button.textContent=locale.insert;button.title=drill.labels[state.lang]||drill.labels.en;
   button.addEventListener('click',()=>insertSnippet('\n'+drill.code+'\n\n'));
   const pre=document.createElement('pre');pre.className='text-[10px] font-mono theme-muted whitespace-pre-wrap break-words mt-1.5 leading-relaxed';
   pre.textContent=drill.code;
   heading.append(label,button);card.append(heading,pre);root.append(card);
   items.set(drill.id,{mark,card});
  }
 }
 const evaluated=evaluatePractice(lessonId,markdown,html);
 let passed=0;
 for(const drill of evaluated){const view=items.get(drill.id);if(!view)continue;
  view.mark.textContent=drill.passed?'✓':'○';
  view.mark.style.color=drill.passed?'var(--accent)':'';
  if(drill.passed)passed++;
 }
 $('deep-practice-progress').textContent=passed+' / '+evaluated.length;
}
