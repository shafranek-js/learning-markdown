import {normalizeExtensionSettings} from './extensions.js';
import {EXTENSIONS_LABS,extensionsLabIds} from '../data/extensions-track.js';
export const STORAGE_KEY='md_course_state_v1';
const LEGACY_KEY='learning_markdown_studio_v3';
export const defaults={lang:'en',theme:'codepen',currentLessonIndex:0,completedLessons:[],completedAdvancedLessons:[],extensionsLabCompleted:[],extensionsLabDrafts:{},extensionsLabCurrent:EXTENSIONS_LABS[0].id,savedDrafts:{},sandboxFileName:'Untitled.md',extensionSettingsByDocument:{},tocMaxDepth:6,tocOpen:false,guideVisible:true,guideWidth:350,editorRatio:0.5,fontSize:15,multiCursorMode:false,wrapText:true,tabFocusMode:false,dialect:'gfm',deepPracticeExpanded:false,advancedToolsOpen:false,advancedCategory:'all',advancedLabExpanded:false,advancedPresetChoices:{},advancedRichChoices:{},layoutMode:'split',mobileTab:'editor',name:''};
const LANGS=new Set(['en','cs','uk','ro','ru']);
export const DIALECTS=new Set(['gfm','commonmark','original']);
const THEMES=new Set(['codepen','midnight','daylight','dracula','nord','solarized']);
function safeLabDrafts(value){
 const out=Object.create(null);
 if(!value||typeof value!=='object'||Array.isArray(value))return out;
 for(const [key,draft] of Object.entries(value))
  if(extensionsLabIds.has(key)&&typeof draft==='string'&&draft.length<=20000)out[key]=draft;
 return out;
}
function fromStorage(){
 try {
  const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem(LEGACY_KEY);
  const saved=raw?JSON.parse(raw):{};
  return {
   ...defaults,...saved,
   lang:LANGS.has(saved.lang)?saved.lang:'en',theme:THEMES.has(saved.theme)?saved.theme:'codepen',dialect:DIALECTS.has(saved.dialect)?saved.dialect:'gfm',
   currentLessonIndex:Number.isInteger(saved.currentLessonIndex)&&saved.currentLessonIndex>=-1&&saved.currentLessonIndex<15?saved.currentLessonIndex:0,
   completedLessons:Array.isArray(saved.completedLessons)?[...new Set(saved.completedLessons.filter(v=>Number.isInteger(v)&&v>=1&&v<=8))]:[],
   completedAdvancedLessons:Array.isArray(saved.completedAdvancedLessons)?[...new Set(saved.completedAdvancedLessons.filter(v=>typeof v==='string'&&/^04_0[1-7]$/.test(v)))]:[],
   extensionsLabCompleted:Array.isArray(saved.extensionsLabCompleted)?[...new Set(saved.extensionsLabCompleted.filter(v=>extensionsLabIds.has(v)))]:[],
   extensionsLabDrafts:safeLabDrafts(saved.extensionsLabDrafts),
   extensionsLabCurrent:extensionsLabIds.has(saved.extensionsLabCurrent)?saved.extensionsLabCurrent:EXTENSIONS_LABS[0].id,
   savedDrafts:saved.savedDrafts&&typeof saved.savedDrafts==='object'&&!Array.isArray(saved.savedDrafts)?saved.savedDrafts:{},
   sandboxFileName:typeof saved.sandboxFileName==='string'&&/^[^\/\\\x00-\x1f]{1,120}\.md$/i.test(saved.sandboxFileName)?saved.sandboxFileName:'Untitled.md',
   extensionSettingsByDocument:normalizeExtensionSettings(saved.extensionSettingsByDocument),
   tocMaxDepth:Number.isInteger(saved.tocMaxDepth)&&saved.tocMaxDepth>=1&&saved.tocMaxDepth<=6?saved.tocMaxDepth:6,
   tocOpen:Boolean(saved.tocOpen),
   editorRatio:Math.max(.18,Math.min(.82,Number(saved.editorRatio)||.5)),
   guideWidth:Math.max(240,Math.min(620,Number(saved.guideWidth)||350)),
   fontSize:Math.max(12,Math.min(22,Number(saved.fontSize)||15)),
   multiCursorMode:Boolean(saved.multiCursorMode),
   wrapText:saved.wrapText!==false,
   tabFocusMode:saved.tabFocusMode===true,
   deepPracticeExpanded:Boolean(saved.deepPracticeExpanded),
   advancedToolsOpen:Boolean(saved.advancedToolsOpen),
   advancedCategory:['all','text','paragraph','tables','blocks','lists'].includes(saved.advancedCategory)?saved.advancedCategory:'all',
   advancedLabExpanded:Boolean(saved.advancedLabExpanded),
   advancedPresetChoices:saved.advancedPresetChoices&&typeof saved.advancedPresetChoices==='object'&&!Array.isArray(saved.advancedPresetChoices)?saved.advancedPresetChoices:{},
   advancedRichChoices:saved.advancedRichChoices&&typeof saved.advancedRichChoices==='object'&&!Array.isArray(saved.advancedRichChoices)?saved.advancedRichChoices:{}
  };
 } catch(error){console.warn('Unable to restore saved progress:',error);return {...defaults};}
}
export const state=fromStorage();
const observers=new Set();
export function subscribe(fn){observers.add(fn);return ()=>observers.delete(fn);}
export function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(error){console.warn('Unable to save progress:',error);}observers.forEach(fn=>fn(state));}
export function resetCourse(){state.completedLessons=[];for(const key of Object.keys(state.savedDrafts))if(!key.startsWith('advanced_'))delete state.savedDrafts[key];state.currentLessonIndex=0;save();}
export const docKey=()=>state.currentLessonIndex===-1?`sandbox_${state.lang}`:state.currentLessonIndex>=8?`advanced_${state.currentLessonIndex-7}_${state.lang}`:`lesson_${state.currentLessonIndex+1}_${state.lang}`;
