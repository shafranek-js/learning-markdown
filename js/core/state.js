export const STORAGE_KEY='md_course_state_v1';
const LEGACY_KEY='learning_markdown_studio_v3';
export const defaults={lang:'en',theme:'codepen',currentLessonIndex:0,completedLessons:[],savedDrafts:{},guideVisible:true,guideWidth:350,editorRatio:0.5,fontSize:15,layoutMode:'split',mobileTab:'editor',name:''};
const LANGS=new Set(['en','cs','uk','ro','ru']);
const THEMES=new Set(['codepen','midnight','daylight','dracula','nord','solarized']);
function fromStorage(){
 try {
  const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem(LEGACY_KEY);
  const saved=raw?JSON.parse(raw):{};
  return {
   ...defaults,...saved,
   lang:LANGS.has(saved.lang)?saved.lang:'en',theme:THEMES.has(saved.theme)?saved.theme:'codepen',
   currentLessonIndex:Number.isInteger(saved.currentLessonIndex)&&saved.currentLessonIndex>=-1&&saved.currentLessonIndex<8?saved.currentLessonIndex:0,
   completedLessons:Array.isArray(saved.completedLessons)?[...new Set(saved.completedLessons.filter(v=>Number.isInteger(v)&&v>=1&&v<=8))]:[],
   savedDrafts:saved.savedDrafts&&typeof saved.savedDrafts==='object'&&!Array.isArray(saved.savedDrafts)?saved.savedDrafts:{},
   editorRatio:Math.max(.18,Math.min(.82,Number(saved.editorRatio)||.5)),
   guideWidth:Math.max(240,Math.min(620,Number(saved.guideWidth)||350)),
   fontSize:Math.max(12,Math.min(22,Number(saved.fontSize)||15))
  };
 } catch(error){console.warn('Unable to restore saved progress:',error);return {...defaults};}
}
export const state=fromStorage();
const observers=new Set();
export function subscribe(fn){observers.add(fn);return ()=>observers.delete(fn);}
export function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(error){console.warn('Unable to save progress:',error);}observers.forEach(fn=>fn(state));}
export function resetCourse(){state.completedLessons=[];state.savedDrafts={};state.currentLessonIndex=0;save();}
export const docKey=()=>state.currentLessonIndex===-1?`sandbox_${state.lang}`:`lesson_${state.currentLessonIndex+1}_${state.lang}`;
