export const LESSON_IDS=['01_01','01_02','01_03','01_04','02_01','02_02','02_03','03_01'];
const validLang=new Set(['en','cs','uk','ro','ru']),validThemes=new Set(['codepen','midnight','daylight','dracula','nord','solarized']);
export function readRoute(){const p=new URLSearchParams(location.hash.slice(1));const id=p.get('lesson');const index=id==='sandbox'?-1:LESSON_IDS.includes(id)?LESSON_IDS.indexOf(id):null;
 return {index,lang:validLang.has(p.get('lang'))?p.get('lang'):null,theme:validThemes.has(p.get('theme'))?p.get('theme'):null};}
export function syncRoute(state,{push=false}={}){const id=state.currentLessonIndex===-1?'sandbox':LESSON_IDS[state.currentLessonIndex];
 const hash='#'+new URLSearchParams({lesson:id,lang:state.lang,theme:state.theme});if(hash!==location.hash)history[push?'pushState':'replaceState'](null,'',hash);
}
export function onRouteChange(fn){window.addEventListener('popstate',fn);window.addEventListener('hashchange',fn);}
