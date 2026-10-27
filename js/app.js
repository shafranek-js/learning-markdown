import {state,save,resetCourse,docKey} from './core/state.js';
import {clearHistory,ensureHistory} from './core/history.js';
import {readRoute,syncRoute,onRouteChange} from './core/router.js';
import {ui,t,lessonTranslations} from './i18n/index.js';
import {LESSON_CORE,LINKEDIN_PROMPT_SAMPLE,lesson} from './data/lessons.js';
import {advancedLesson,verifyAdvancedLesson,ADVANCED_IDS} from './data/advanced-lessons.js';
import {verifyLesson} from './core/validator.js';
import {initEditor,area,setEditorContent,refreshEditor,applyEdit} from './ui/editor.js';
import {renderMultiCursorUI,renderWrapTextUI,renderTabFocusUI} from './ui/editor.js';
import {initToolbar,insertSnippet} from './ui/toolbar.js';
import {initTablePicker,renderTablePickerLanguage} from './ui/table-picker.js';
import {initTableEditor,renderTableEditorLanguage} from './ui/table-editor.js';
import {renderPractice} from './ui/deep-practice.js';
import {initExtensionsLab,renderExtensionsLabLanguage} from './ui/extensions-track.js';
import {initAdvancedUI,renderAdvancedUI} from './ui/advanced.js';
import {initFigureDialog,renderFigureLanguage} from './ui/figure-dialog.js';
import {initUnicodePicker,renderUnicodePickerLanguage} from './ui/unicode-picker.js';
import {updatePreview,currentHtml,initPreviewAnchors} from './ui/preview.js';
import {initTOC,TOC_TEXT} from './ui/toc.js';
import {initUtilityMenus,renderUtilityMenuLanguage} from './ui/utility-menus.js';
import {initViewMenu,renderViewMenuLanguage} from './ui/view-menu.js';
import {initFileMenu,renderFileMenuLanguage} from './ui/file-menu.js';
import {initEditMenu,renderEditMenuLanguage} from './ui/edit-menu.js';
import {initHelpMenu,renderHelpMenuLanguage} from './ui/help-menu.js';
import {standaloneHTML} from './core/export-html.js';
import {renderMermaidExportImages} from './ui/mermaid-preview.js';
import {renderPortability,portabilityStatus,portabilityLabels,initExtensionSettings} from './ui/compatibility.js';
import {extensionText,footnoteText,definitionText} from './core/extensions.js';
import {paletteLabels} from './core/unicode-palette.js';
import {initResizers,showGuide,setLayoutMode,setMobileTab} from './ui/resizer.js';
import {initModals,toggleContents,updateCertificate,renderCheats} from './ui/modals.js';
import {initAdvancedCertificate,renderAdvancedCertificate,openAdvancedCertificate} from './ui/advanced-certificate.js';
import {initInstallApp,renderInstallAppLanguage} from './ui/install-app.js';
const $=id=>document.getElementById(id);
// Vite substitutes these values at build time, so the label also works offline.
const APP_VERSION=__APP_VERSION__,APP_REVISION=__APP_REVISION__;
const VERSION_LABELS={en:'Version',cs:'Verze',uk:'Версія',ro:'Versiune',ru:'Версия'};
function renderBuildVersion(){
 const element=$('app-version-status');
 const revision=APP_REVISION==='local'?'local':APP_REVISION.slice(0,7);
 element.textContent=`v${APP_VERSION} · ${revision}`;
 element.title=`${VERSION_LABELS[state.lang]||VERSION_LABELS.en} ${APP_VERSION} · ${APP_REVISION}`;
 element.setAttribute('aria-label',element.title);
}
let currentChecks=[];
const DIALECT_UI={
 en:{label:'Standard',title:'Markdown parsing dialect',warning:'This lesson uses GFM-only syntax. Select GFM to complete these checks.'},
 cs:{label:'Standard',title:'Varianta Markdownu',warning:'Tato lekce používá syntaxi pouze pro GFM. K dokončení přepněte na GFM.'},
 uk:{label:'Стандарт',title:'Діалект Markdown',warning:'Цей урок використовує синтаксис лише GFM. Для виконання перевірок виберіть GFM.'},
 ro:{label:'Standard',title:'Dialect Markdown',warning:'Această lecție folosește sintaxă exclusiv GFM. Selectați GFM pentru a finaliza verificările.'},
 ru:{label:'Стандарт',title:'Диалект Markdown',warning:'Этот урок использует конструкции, поддерживаемые только GFM. Для завершения заданий выберите GFM.'}
};
const DIALECT_NAMES={gfm:'GFM',commonmark:'CommonMark',original:'Original · Legacy'};
const TRACK_TEXT={
 en:{core:'Core Markdown · 8 lessons',advanced:'Beyond Markdown · 7 lessons',module:'Advanced lesson',alert:'Extended HTML/CSS may be filtered by other Markdown platforms.'},
 cs:{core:'Základy Markdownu · 8 lekcí',advanced:'Nad rámec Markdownu · 7 lekcí',module:'Pokročilá lekce',alert:'Jiné platformy Markdown mohou HTML a CSS odfiltrovat.'},
 uk:{core:'Основи Markdown · 8 уроків',advanced:'Поза Markdown · 7 уроків',module:'Додатковий урок',alert:'Інші Markdown-платформи можуть фільтрувати HTML і CSS.'},
 ro:{core:'Markdown de bază · 8 lecții',advanced:'Dincolo de Markdown · 7 lecții',module:'Lecție avansată',alert:'Alte platforme Markdown pot filtra HTML și CSS.'},
 ru:{core:'Основы Markdown · 8 уроков',advanced:'За пределами Markdown · 7 уроков',module:'Продвинутый урок',alert:'Другие платформы Markdown могут удалять HTML и CSS.'}
};
function renderDialectUI(){
 const el=$('dialect-selector'),locale=DIALECT_UI[state.lang]||DIALECT_UI.en;
 el.value=state.dialect;el.title=locale.title;el.setAttribute('aria-label',locale.title);
 $('active-dialect-status').textContent=DIALECT_NAMES[state.dialect];
 document.querySelector('[data-i18n="dialectLabel"]').textContent=locale.label;
 $('preview-pane-title').textContent=ui(state.lang).previewHeader.replace(/\s*\(GFM\)/i,'')+' ('+DIALECT_NAMES[state.dialect]+')';
}
const getLesson=i=>i>=8?advancedLesson(i-8,state.lang):lesson(i,state.lang,lessonTranslations);
const isAdvanced=i=>i>=8;
const escapeHTML=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function progress(){const strings=ui(state.lang),done=state.completedLessons.length,pct=Math.round(done/8*100);
 $('progress-bar').style.width=pct+'%';$('progress-label').textContent=strings.completedOf(done,8);$('progress-percentage').textContent=pct+'%';updateCertificate();renderAdvancedCertificate();}
function drawContents(){const nav=$('lesson-nav-list');nav.replaceChildren();for(let i=0;i<LESSON_CORE.length+ADVANCED_IDS.length;i++){
 if(i===0||i===8){const heading=document.createElement('h3');heading.className='text-[11px] font-extrabold uppercase tracking-widest theme-muted px-2 pt-3 pb-1';heading.textContent=i===0?TRACK_TEXT[state.lang].core:TRACK_TEXT[state.lang].advanced;nav.append(heading);}
 const l=getLesson(i),done=isAdvanced(i)?state.completedAdvancedLessons.includes(l.id):state.completedLessons.includes(l.id),b=document.createElement('button');b.type='button';b.className=`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center gap-2 border ${state.currentLessonIndex===i?'theme-accent-soft border-current':'theme-panel border-transparent hover:opacity-80'}`;
 const tag=document.createElement('span');tag.className='w-7 h-7 rounded-lg theme-panel-alt flex items-center justify-center shrink-0 text-xs';tag.textContent=done?'✓':String(i+1);
 const text=document.createElement('span');text.className='min-w-0 flex-1';const title=document.createElement('strong');title.className='block text-xs truncate';title.textContent=`${l.tab} — ${l.title}`;
 const subtitle=document.createElement('span');subtitle.className='block text-[11px] theme-muted truncate';subtitle.textContent=l.subtitle;
 text.append(title,subtitle);b.append(tag,text);b.addEventListener('click',()=>{selectLesson(i);toggleContents(false);});nav.append(b);
 }}
function renderLocalization(){const strings=ui(state.lang);renderBuildVersion();renderInstallAppLanguage(state.lang);document.documentElement.lang=state.lang;$('course-main-title').textContent=strings.courseTitle;
 $('course-main-subtitle').textContent=strings.courseSubtitle;
 document.querySelectorAll('[data-i18n]').forEach(e=>{const val=strings[e.dataset.i18n];if(typeof val==='string')e.textContent=val;});
 $('theme-selector').value=state.theme;$('lang-selector').value=state.lang;
 $('download-html-btn').title=t(state.lang,'exportHTML');$('print-cert-btn').textContent=t(state.lang,'print');$('student-name-input').placeholder=t(state.lang,'name');
 document.querySelector('[data-mobile-tab="guide"]').textContent=t(state.lang,'guide');
 renderAdvancedCertificate();renderMultiCursorUI();renderWrapTextUI();renderTabFocusUI();document.querySelector('[data-mobile-tab="editor"]').textContent=t(state.lang,'editor');document.querySelector('[data-mobile-tab="preview"]').textContent=strings.previewView;
 const tip={
 en:['Undo','Redo','Heading 1','Heading 2','Heading 3','Heading 4','Heading 5','Heading 6','Bold','Italic','Strikethrough','Quote','Bullet list','Numbered list','Task list','Inline code','Code block','Link','Image','Table','Divider'],
 cs:['Zpět','Znovu','Nadpis 1','Nadpis 2','Nadpis 3','Nadpis 4','Nadpis 5','Nadpis 6','Tučné','Kurzíva','Přeškrtnutí','Citace','Odrážky','Číslovaný seznam','Úkoly','Kód v řádku','Blok kódu','Odkaz','Obrázek','Tabulka','Oddělovač'],
 uk:['Скасувати','Повторити','Заголовок 1','Заголовок 2','Заголовок 3','Заголовок 4','Заголовок 5','Заголовок 6','Жирний','Курсив','Закреслення','Цитата','Маркований список','Нумерований список','Завдання','Рядковий код','Блок коду','Посилання','Зображення','Таблиця','Роздільник'],
 ro:['Anulare','Refacere','Titlu 1','Titlu 2','Titlu 3','Titlu 4','Titlu 5','Titlu 6','Aldin','Cursiv','Tăiat','Citat','Marcatori','Listă numerotată','Sarcini','Cod inline','Bloc de cod','Legătură','Imagine','Tabel','Separator'],
 ru:['Отменить','Повторить','Заголовок 1','Заголовок 2','Заголовок 3','Заголовок 4','Заголовок 5','Заголовок 6','Жирный','Курсив','Зачёркнутый','Цитата','Маркеры','Нумерованный список','Список задач','Строчный код','Блок кода','Ссылка','Изображение','Таблица','Разделитель']};
 [$('undo-btn'),$('redo-btn'),...document.querySelectorAll('.toolbar-btn')].forEach((e,i)=>{const shortcut=e.title.match(/(Ctrl\+[^)]*|Cmd\+[^)]*)/i)?.[1];e.title=(tip[state.lang]?.[i]??tip.en[i])+(shortcut?` (${shortcut})`:'');});
 const titles={
 en:['Toggle course contents','Drag to resize lesson guide','Drag to resize editor and preview; double-click for equal widths','Reset current lesson','Decrease font size','Increase font size'],
 cs:['Zobrazit obsah kurzu','Tažením změnit velikost průvodce','Tažením změnit šířky; dvojklik obnoví 50:50','Resetovat lekci','Zmenšit písmo','Zvětšit písmo'],
 uk:['Відкрити зміст курсу','Перетягніть, щоб змінити ширину гіда','Перетягніть роздільник; подвійний клік — 50:50','Скинути урок','Зменшити шрифт','Збільшити шрифт'],
 ro:['Deschide cuprinsul','Trageți pentru a redimensiona ghidul','Trageți separatorul; dublu clic pentru 50:50','Resetați lecția','Micșorați fontul','Măriți fontul'],
 ru:['Открыть содержание курса','Перетащите, чтобы изменить ширину гида','Перетащите разделитель; двойной щелчок — 50:50','Сбросить урок','Уменьшить шрифт','Увеличить шрифт']};
 ['contents-toggle-btn','resizer-guide-editor','resizer-editor-preview','reset-lesson-btn','font-dec-btn','font-inc-btn'].forEach((id,i)=>$(id).title=titles[state.lang][i]);
 renderCheats();renderExtensionsLabLanguage();renderDialectUI();renderUtilityMenuLanguage();renderViewMenuLanguage();renderFileMenuLanguage();renderEditMenuLanguage();renderHelpMenuLanguage();renderAdvancedUI();renderFigureLanguage();renderUnicodePickerLanguage();renderTablePickerLanguage();renderTableEditorLanguage();renderPortability(area().value);
}
function selectLesson(index,{route=true,scroll=true}={}){
 if(index<-1||index>=LESSON_CORE.length+ADVANCED_IDS.length)return;state.currentLessonIndex=index;
 if(isAdvanced(index))state.advancedToolsOpen=true;
 save();if(route)syncRoute(state,{push:true});
 if(index===-1){$('active-tab-title').textContent='00_00 AI Prompt Sandbox';$('editor-mode-status').textContent='Sandbox';showGuide(false);}
 else {const l=getLesson(index),strings=ui(state.lang);
  $('active-tab-title').textContent=l.tab;$('editor-mode-status').textContent=l.tab;
  $('lesson-badge').textContent=isAdvanced(index)?TRACK_TEXT[state.lang].module+' '+(index-7)+' / 7':strings.moduleOf(index+1,8);
  $('lesson-title').textContent=l.title;$('lesson-subtitle').textContent=l.subtitle;
  // Theory is bundled trusted HTML; never interpolate editor content into it.
  $('lesson-theory').innerHTML=l.theory;$('hint-content').textContent=l.hint;$('hint-box').classList.add('hidden');
  const examples=$('syntax-examples-container');examples.replaceChildren();for(const ex of l.examples){
   const b=document.createElement('button');b.type='button';
   b.className='w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg theme-panel border theme-border hover:opacity-90 text-xs font-mono';
   const label=document.createElement('span');label.className='min-w-0 truncate text-left';label.textContent=ex.label;
   const action=document.createElement('span');action.className='shrink-0 text-[10px] font-sans font-semibold theme-accent-soft rounded px-1.5 py-0.5';
   action.textContent=t(state.lang,'insert');
   b.append(label,action);
   b.title=t(state.lang,'insertHint');b.setAttribute('aria-label',t(state.lang,'insert')+': '+ex.label);
   b.addEventListener('click',()=>insertSnippet(ex.code+'\n'));examples.appendChild(b);
  }
  $('prev-lesson-btn').disabled=index===0||index===8;
  $('deep-practice').classList.toggle('hidden',isAdvanced(index));
  if(isAdvanced(index))renderAdvancedUI();
  showGuide(state.guideVisible);
 }
 const saved=state.savedDrafts[docKey()],content=saved!==undefined?saved:index===-1?LINKEDIN_PROMPT_SAMPLE:getLesson(index).initial;
 setEditorContent(content);drawContents();progress();
 if(scroll){$('theory-panel').querySelector('.overflow-y-auto')?.scrollTo(0,0);}
}
function evaluate(text){updatePreview(text);renderPortability(text);
 if(state.currentLessonIndex>=0&&!isAdvanced(state.currentLessonIndex))renderPractice(state.currentLessonIndex+1,text,currentHtml());
 if(state.currentLessonIndex===-1){$('lesson-complete-banner').classList.add('hidden');return;}
 const l=getLesson(state.currentLessonIndex),advanced=isAdvanced(state.currentLessonIndex);
 const checks=advanced?verifyAdvancedLesson(l,text,currentHtml()):verifyLesson(l,text,state.dialect);currentChecks=checks;
 const warning=$('dialect-warning');warning.classList.toggle('hidden',!advanced&&(state.dialect==='gfm'||![2,7,8].includes(l.id)));
 warning.textContent=advanced?TRACK_TEXT[state.lang].alert:(DIALECT_UI[state.lang]||DIALECT_UI.en).warning;
 const list=$('task-checklist');list.replaceChildren();let done=0;
 for(const c of checks){if(c.passed)done++;const item=document.createElement('li');item.className=`p-2 rounded-lg border text-xs flex items-start gap-2 transition ${c.passed?'bg-emerald-500/15 border-emerald-500/40 text-emerald-300':'theme-panel border-transparent'}`;
 const mark=document.createElement('span');mark.className='w-4 h-4 rounded shrink-0 font-semibold';mark.textContent=c.passed?'✓':'○';
 const label=document.createElement('span');label.textContent=c.text;item.append(mark,label);list.append(item);}
 $('tasks-counter-badge').textContent=`${done} / ${checks.length}`;
 const completed=done===checks.length,banner=$('lesson-complete-banner'),pill=$('lesson-status-pill');banner.classList.toggle('hidden',!completed);
 const collection=advanced?state.completedAdvancedLessons:state.completedLessons;
 pill.textContent=completed||collection.includes(l.id)?ui(state.lang).statusDone:ui(state.lang).statusInProgress;
 if(completed&&!collection.includes(l.id)){collection.push(l.id);save();drawContents();progress();}
}
function setDialect(mode){if(!['gfm','commonmark','original'].includes(mode))return;state.dialect=mode;save();renderDialectUI();syncRoute(state);evaluate(area().value);}
function setTheme(theme){state.theme=theme;document.documentElement.dataset.theme=theme;save();syncRoute(state);}
function setLanguage(lang){state.lang=lang;save();renderLocalization();selectLesson(state.currentLessonIndex,{route:false,scroll:false});syncRoute(state);}
function download(text,name,mime){const url=URL.createObjectURL(new Blob([text],{type:mime}));const a=document.createElement('a');a.href=url;a.download=name;a.style.display='none';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);}
async function copy(text){try{await navigator.clipboard.writeText(text);}catch{const temp=document.createElement('textarea');temp.value=text;document.body.append(temp);temp.select();document.execCommand('copy');temp.remove();}}
// Resolve the exact source snapshot being exported; a user may continue
// editing while Mermaid runs. The .md download never changes.
const EXPORT_MESSAGES={
 en:{fallback:'Some Mermaid diagrams failed to render; their source code is included in the exported document.',error:'Document export failed.',print:'The browser blocked the print tab.'},
 cs:{fallback:'Některé diagramy Mermaid se nepodařilo vykreslit; v exportu zůstává jejich zdrojový kód.',error:'Export dokumentu selhal.',print:'Prohlížeč zablokoval kartu pro tisk.'},
 uk:{fallback:'Деякі діаграми Mermaid не вдалося побудувати; у документі збережено їхній код.',error:'Помилка експорту документа.',print:'Браузер заблокував вкладку друку.'},
 ro:{fallback:'Unele diagrame Mermaid nu au putut fi redate; codul sursă rămâne în document.',error:'Exportul documentului a eșuat.',print:'Browserul a blocat fila pentru imprimare.'},
 ru:{fallback:'Некоторые диаграммы Mermaid не удалось построить; их исходный код сохранён в экспортированном документе.',error:'Не удалось экспортировать документ.',print:'Браузер заблокировал вкладку печати.'}
};
async function exportDocument({print=false}={}){
 const sourceHtml=currentHtml(),language=state.lang;
 const labels=EXPORT_MESSAGES[language]||EXPORT_MESSAGES.en;
 // Opening the print tab synchronously avoids popup blockers after await.
 const tab=print?window.open('about:blank','_blank'):null;
 if(print&&!tab){alert(labels.print);return;}
 if(tab){tab.opener=null;tab.document.body.textContent='Preparing document…';}
 try{
  const {images,failures}=await renderMermaidExportImages(sourceHtml);
  const content=standaloneHTML(sourceHtml,language,images);
  if(print){
   const url=URL.createObjectURL(new Blob([content],{type:'text/html;charset=utf-8'}));
   tab.location.replace(url);
   setTimeout(()=>URL.revokeObjectURL(url),60000);
  }else download(content,'markdown-export.html','text/html;charset=utf-8');
  if(failures.length)alert(labels.fallback);
 }catch(error){
  console.error('Document export failed',error);
  if(tab)tab.close();
  alert(labels.error);
 }
}
// File menu and existing Export action share the same portable-Markdown safety checks.
function saveCurrentMarkdown(filenameOverride=null){
 if(portabilityStatus()?.advanced&&!confirm(portabilityLabels(state.lang).mdWarning))return false;
 if(portabilityStatus()?.extensionActive&&!confirm(extensionText(state.lang).warning))return false;
 if(portabilityStatus()?.footnotesActive&&!confirm(footnoteText(state.lang).warning))return false;
 if(portabilityStatus()?.customHeadingIdsActive&&!confirm((TOC_TEXT[state.lang]||TOC_TEXT.en).customWarning))return false;
 if(portabilityStatus()?.definitionListsActive&&!confirm(definitionText(state.lang).warning))return false;
 if(portabilityStatus()?.emojiShortcodesActive&&!confirm(paletteLabels(state.lang).warning))return false;
 const defaultName=state.currentLessonIndex===-1?state.sandboxFileName:$('active-tab-title').textContent.replace(/\s+/g,'_')+'.md';
 download(area().value,filenameOverride||defaultName,'text/markdown;charset=utf-8');
 return true;
}
// Course lessons and their drafts remain untouched by New/Open: both target Sandbox.
function replaceSandboxDocument(text,filename,warning){
 const existing=state.savedDrafts['sandbox_'+state.lang]||'';
 if(existing!==text&&existing.length&&!confirm(warning))return false;
 if(state.currentLessonIndex!==-1)selectLesson(-1);
 setEditorContent(text);
 state.sandboxFileName=filename;
 save();
 return true;
}
function setFromRoute(){const r=readRoute();let rerender=false;if(r.lang&&r.lang!==state.lang){state.lang=r.lang;rerender=true;}if(r.theme&&r.theme!==state.theme){state.theme=r.theme;document.documentElement.dataset.theme=state.theme;rerender=true;}
 if(r.dialect&&r.dialect!==state.dialect){state.dialect=r.dialect;rerender=true;}
 if(r.index!==null&&r.index!==state.currentLessonIndex){state.currentLessonIndex=r.index;rerender=true;}
 if(rerender){save();renderLocalization();selectLesson(state.currentLessonIndex,{route:false});}}
function toggleGuide(){
 if(state.currentLessonIndex===-1){state.guideVisible=true;selectLesson(0);return;}
 state.guideVisible=!state.guideVisible;showGuide(state.guideVisible);save();
}
function openCourseContents(){
 if(state.currentLessonIndex===-1){state.guideVisible=true;selectLesson(0);}
 else if(!state.guideVisible){state.guideVisible=true;showGuide(true);save();}
 if(window.matchMedia('(max-width:767px)').matches)setMobileTab('guide');
 toggleContents(true);
}
function init(){const route=readRoute();if(route.lang)state.lang=route.lang;if(route.theme)state.theme=route.theme;if(route.dialect)state.dialect=route.dialect;if(route.index!==null)state.currentLessonIndex=route.index;
 document.documentElement.dataset.theme=state.theme;document.documentElement.style.setProperty('--editor-font-size',`${state.fontSize}px`);
 initEditor(evaluate);initToolbar();initUnicodePicker({insertSnippet});initTablePicker();initTableEditor();initResizers();initModals();initInstallApp(()=>state.lang);initExtensionsLab({closeContents:()=>toggleContents(false)});initAdvancedCertificate();initPreviewAnchors();initAdvancedUI();initFigureDialog({insertSnippet});initTOC({insertMarkdown:insertSnippet});initUtilityMenus();initViewMenu({onGuideToggle:toggleGuide});initFileMenu({replaceSandbox:replaceSandboxDocument,saveMarkdown:saveCurrentMarkdown});initEditMenu();initHelpMenu({onOpenCourseContents:openCourseContents});initExtensionSettings(()=>evaluate(area().value),()=>insertSnippet('\nA documented claim[^source], repeated here[^source].\n\n[^source]: Add your source here.\n'),()=>insertSnippet('\n\nTerm A\n: First **definition**.\n: Another *definition*.\n\nTerm B\n: More information.\n\n'));
 $('deep-practice').open=Boolean(state.deepPracticeExpanded);
 $('deep-practice').addEventListener('toggle',event=>{state.deepPracticeExpanded=event.target.open;save();});
 renderLocalization();setLayoutMode(state.layoutMode);setMobileTab(state.mobileTab||'editor');
 selectLesson(state.currentLessonIndex,{route:false});syncRoute(state);onRouteChange(setFromRoute);
 document.addEventListener('advanced-course-open',()=>{selectLesson(8);toggleContents(false);if(window.matchMedia('(max-width:767px)').matches)setMobileTab('guide');});
 $('theme-selector').addEventListener('change',e=>setTheme(e.target.value));$('dialect-selector').addEventListener('change',e=>setDialect(e.target.value));$('lang-selector').addEventListener('change',e=>setLanguage(e.target.value));

 $('sandbox-mode-btn').addEventListener('click',()=>{selectLesson(state.currentLessonIndex===-1?0:-1);if(window.matchMedia('(max-width:767px)').matches)setMobileTab('editor');});
 $('toggle-hint-btn').addEventListener('click',()=>$('hint-box').classList.toggle('hidden'));
 $('insert-solution-btn').addEventListener('click',()=>{if(state.currentLessonIndex===-1)return;const txt=getLesson(state.currentLessonIndex).hint;applyEdit(txt,txt.length,txt.length);});
 $('clear-editor-btn').addEventListener('click',()=>applyEdit('',0,0));
 $('reset-lesson-btn').addEventListener('click',()=>{if(state.currentLessonIndex===-1)return;const txt=getLesson(state.currentLessonIndex).initial;applyEdit(txt,txt.length,txt.length);});
 $('prev-lesson-btn').addEventListener('click',()=>selectLesson(Math.max(isAdvanced(state.currentLessonIndex)?8:0,state.currentLessonIndex-1)));
 const next=()=>{if(state.currentLessonIndex===14)openAdvancedCertificate();else if(state.currentLessonIndex===7)$('certificate-btn').click();else if(state.currentLessonIndex>=0)selectLesson(state.currentLessonIndex+1);};
 $('next-lesson-btn').addEventListener('click',next);$('banner-next-btn').addEventListener('click',next);
 for(const key of ['split','preview','html'])$(`layout-${key}-btn`).addEventListener('click',()=>setLayoutMode(key));
 $('font-dec-btn').addEventListener('click',()=>{state.fontSize=Math.max(12,state.fontSize-1);document.documentElement.style.setProperty('--editor-font-size',`${state.fontSize}px`);refreshEditor({notify:false});save();});
 $('font-inc-btn').addEventListener('click',()=>{state.fontSize=Math.min(22,state.fontSize+1);document.documentElement.style.setProperty('--editor-font-size',`${state.fontSize}px`);refreshEditor({notify:false});save();});
 $('copy-md-btn').addEventListener('click',()=>copy(area().value));
 $('download-md-btn').addEventListener('click',()=>saveCurrentMarkdown());
 $('download-html-btn').addEventListener('click',()=>exportDocument());
 $('print-document-btn').addEventListener('click',()=>exportDocument({print:true}));
 $('reset-course-btn').addEventListener('click',()=>{if(!confirm(t(state.lang,'confirmReset')))return;resetCourse();clearHistory();selectLesson(0,{route:false});syncRoute(state);toggleContents(false);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.activeElement!==area())area().blur();});
 if('serviceWorker' in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));
}
init();
