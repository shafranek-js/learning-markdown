import {inspectPortability} from '../core/compatibility.js';
import {state,docKey,save} from '../core/state.js';
import {extensionEnabled,changeExtension,extensionText,footnoteText} from '../core/extensions.js';
import {TOC_TEXT} from './toc.js';
export const PORTABILITY_TEXT={
  "en": {
    "title": "Compatibility & export",
    "summary": "Check how this document may behave on other Markdown platforms.",
    "core": "Basic Markdown",
    "gfm": "GFM-specific rendering",
    "advanced": "Advanced HTML / CSS",
    "standalone": "Standalone HTML (with bundled CSS)",
    "available": "Available",
    "difference": "May differ",
    "none": "Not detected",
    "notPortable": "May be removed by other renderers",
    "mdWarning": "This document uses Advanced HTML/CSS. A .md file preserves the source, but other Markdown applications may remove the tags or ignore CSS classes. Export HTML for more consistent appearance. Download the .md anyway?",
    "print": "Print / PDF",
    "printTip": "Open a standalone print-ready HTML version; use Ctrl+P to save as PDF.",
    "external": "External image URLs still require a network connection.",
    "notice": "Compatibility is indicative, not a formal CommonMark/GFM certification."
  },
  "cs": {
    "title": "Kompatibilita a export",
    "summary": "Jak se dokument může zobrazit na jiných Markdown platformách.",
    "core": "Základní Markdown",
    "gfm": "Vykreslení specifické pro GFM",
    "advanced": "Rozšířené HTML / CSS",
    "standalone": "Samostatné HTML (s CSS)",
    "available": "K dispozici",
    "difference": "Může se lišit",
    "none": "Nezjištěno",
    "notPortable": "Jiné platformy mohou obsah odstranit",
    "mdWarning": "Dokument používá pokročilé HTML/CSS. Soubor .md zachová zdroj, ale jiné aplikace mohou odstranit značky či ignorovat styly. Pro věrný vzhled exportujte HTML. Stáhnout .md přesto?",
    "print": "Tisk / PDF",
    "printTip": "Otevřít HTML připravené k tisku a uložit přes Ctrl+P.",
    "external": "Externí obrázky vyžadují připojení k internetu.",
    "notice": "Kompatibilita je orientační, nikoliv certifikace."
  },
  "uk": {
    "title": "Сумісність та експорт",
    "summary": "Як документ може відображатися на інших Markdown-платформах.",
    "core": "Базовий Markdown",
    "gfm": "Особливості GFM",
    "advanced": "Розширений HTML / CSS",
    "standalone": "Самостійний HTML (із CSS)",
    "available": "Доступно",
    "difference": "Можуть бути відмінності",
    "none": "Не знайдено",
    "notPortable": "Інші платформи можуть видаляти форматування",
    "mdWarning": "Документ містить розширений HTML/CSS. Файл .md збереже вихідний текст, але інші застосунки можуть видалити теги чи стилі. Експортуйте HTML для точного вигляду. Завантажити .md?",
    "print": "Друк / PDF",
    "printTip": "Відкрити HTML для друку і зберегти PDF через Ctrl+P.",
    "external": "Зовнішні зображення потребують інтернету.",
    "notice": "Оцінка сумісності орієнтовна, а не сертифікат стандарту."
  },
  "ro": {
    "title": "Compatibilitate și export",
    "summary": "Cum se poate afișa documentul pe alte platforme Markdown.",
    "core": "Markdown de bază",
    "gfm": "Redare specifică GFM",
    "advanced": "HTML / CSS avansat",
    "standalone": "HTML independent (cu CSS)",
    "available": "Disponibil",
    "difference": "Poate varia",
    "none": "Nu a fost detectat",
    "notPortable": "Alte platforme pot elimina formatarea",
    "mdWarning": "Acest document folosește HTML/CSS avansat. Fișierul .md păstrează sursa, dar alte aplicații pot elimina etichete sau ignora clasele CSS. Exportați HTML pentru aspect fidel. Descărcați oricum .md?",
    "print": "Tipărire / PDF",
    "printTip": "Deschideți HTML pregătit pentru tipărire, apoi Ctrl+P.",
    "external": "Imaginile externe necesită internet.",
    "notice": "Compatibilitatea este orientativă, nu o certificare."
  },
  "ru": {
    "title": "Совместимость и экспорт",
    "summary": "Как документ может выглядеть в других Markdown-приложениях.",
    "core": "Базовый Markdown",
    "gfm": "Особенности GFM",
    "advanced": "Расширенное HTML / CSS",
    "standalone": "Автономный HTML (со встроенными стилями)",
    "available": "Доступно",
    "difference": "Может отличаться",
    "none": "Не обнаружено",
    "notPortable": "Другие платформы могут удалять оформление",
    "mdWarning": "Документ использует расширенное HTML/CSS. Файл .md сохранит исходный код, но другие приложения могут удалить HTML-теги или проигнорировать CSS-классы. Для сохранения оформления лучше экспортировать HTML. Всё равно скачать .md?",
    "print": "Печать / PDF",
    "printTip": "Открыть HTML с оформлением и сохранить PDF через Ctrl+P.",
    "external": "Для внешних изображений потребуется интернет.",
    "notice": "Это ориентировочная оценка, а не сертификат соответствия стандартам."
  }
};
export const portabilityLabels=lang=>PORTABILITY_TEXT[lang]||PORTABILITY_TEXT.en;
const $=id=>document.getElementById(id);
const set=(id,value)=>{$(id).textContent=value;};
let last=null;
export function initExtensionSettings(onChange,onInsertFootnoteExample){
 $('extension-softbreaks-toggle').addEventListener('change',event=>{
  if(state.dialect!=='gfm')return;
  state.extensionSettingsByDocument=changeExtension(
   state.extensionSettingsByDocument,docKey(),'softbreaks',event.target.value==='on');
  save();onChange();
 });
 $('extension-headingids-toggle').addEventListener('change',event=>{
  if(state.dialect!=='gfm')return;
  state.extensionSettingsByDocument=changeExtension(
   state.extensionSettingsByDocument,docKey(),'headingIds',event.target.value==='on');
  save();onChange();
 });
 $('extension-footnotes-toggle').addEventListener('change',event=>{
  if(state.dialect!=='gfm')return;
  state.extensionSettingsByDocument=changeExtension(
   state.extensionSettingsByDocument,docKey(),'footnotes',event.target.value==='on');
  save();onChange();
 });
 $('extension-footnote-demo').addEventListener('click',()=>{
  if(!extensionEnabled(state.extensionSettingsByDocument,docKey(),state.dialect,'footnotes'))return;
  onInsertFootnoteExample();
 });
}
function renderExtensionMatrix(w,enabled,footnoteOn,customOn){
 const toggle=$('extension-softbreaks-toggle');
 toggle.disabled=state.dialect!=='gfm';
 toggle.value=enabled?'on':'off';
 $('optional-extension-title').textContent=w.title;
 $('extension-softbreaks-label').textContent=w.label;
 toggle.options[0].textContent=w.off;
 toggle.options[1].textContent=w.on;
 $('extension-softbreaks-note').textContent=toggle.disabled?w.unavailable:w.note;
 $('extension-matrix-title').textContent=w.matrix;
 $('extension-matrix').setAttribute('aria-label',w.matrix);
 for(const [col,id] of Object.entries({feature:'ext-col-feature',core:'ext-col-core',gfm:'ext-col-gfm',github:'ext-col-github',app:'ext-col-app'}))
  $(id).textContent=w[col];
 const rows=[
  [w.headings,w.yes,w.yes,w.yes,w.yes],
  [w.tables,w.no,w.yes,w.yes,w.yes],
  [w.breaks,w.no,w.no,w.varies,enabled?w.yes:w.no],
  [w.html,w.varies,w.varies,w.varies,w.yes],
  [w.footnotes,w.no,w.no,w.yes,footnoteOn?w.yes:w.no],
  [TOC_TEXT[state.lang]?.custom||TOC_TEXT.en.custom,w.no,w.no,w.no,customOn?w.yes:w.no]
 ];
 const tbody=$('extension-matrix-body');tbody.replaceChildren();
 for(const cells of rows){
  const tr=document.createElement('tr');
  cells.forEach((value,i)=>{
   const cell=document.createElement(i?'td':'th');
   if(!i)cell.scope='row';
   cell.textContent=value;
   cell.className='px-1 py-1 border-b theme-border';
   tr.append(cell);
  });tbody.append(tr);
 }
}
export function renderPortability(source){
 const words=portabilityLabels(state.lang);
 const enabled=extensionEnabled(state.extensionSettingsByDocument,docKey(),state.dialect,'softbreaks');
 const notesEnabled=extensionEnabled(state.extensionSettingsByDocument,docKey(),state.dialect,'footnotes');
 const customEnabled=extensionEnabled(state.extensionSettingsByDocument,docKey(),state.dialect,'headingIds');
 const headingsLabels=TOC_TEXT[state.lang]||TOC_TEXT.en;
 const customControl=$('extension-headingids-toggle');
 customControl.disabled=state.dialect!=='gfm';
 customControl.value=customEnabled?'on':'off';
 customControl.options[0].textContent=extensionText(state.lang).off;
 customControl.options[1].textContent=extensionText(state.lang).on;
 $('extension-headingids-label').textContent=headingsLabels.custom;
 $('extension-headingids-note').textContent=customControl.disabled
  ?extensionText(state.lang).unavailable:headingsLabels.customNote;
 const labels=extensionText(state.lang),notes=footnoteText(state.lang);
 const control=$('extension-footnotes-toggle');
 control.disabled=state.dialect!=='gfm';
 control.value=notesEnabled?'on':'off';
 control.options[0].textContent=labels.off;
 control.options[1].textContent=labels.on;
 $('extension-footnotes-label').textContent=notes.label;
 $('extension-footnotes-note').textContent=control.disabled?labels.unavailable:notes.note;
 $('extension-footnote-demo').textContent=notes.sample;
 $('extension-footnote-demo').disabled=!notesEnabled;
 $('extension-footnote-demo').hidden=!notesEnabled;
 const practice=$('extension-footnote-practice');
 practice.hidden=!notesEnabled;
 const refs=[...document.querySelectorAll('#markdown-preview a.fn-ref[href]')];
 const targets=refs.map(el=>el.getAttribute('href'));
 const repeated=targets.some((href,i)=>targets.indexOf(href)<i);
 practice.textContent=notes.exercise+' — '+(repeated?notes.done:notes.pending);
 last={...inspectPortability(source),extensionActive:enabled,footnotesActive:notesEnabled,customHeadingIdsActive:customEnabled};
 renderExtensionMatrix(labels,enabled,notesEnabled,customEnabled);
 set('compatibility-title',words.title);
 set('compatibility-description',words.summary);
 set('compatibility-core',words.core);
 set('compatibility-gfm',words.gfm);
 set('compatibility-advanced',words.advanced);
 set('compatibility-html',words.standalone);
 set('compatibility-core-status',words.available);
 set('compatibility-gfm-status',last.gfmDifference?words.difference:words.none);
 set('compatibility-advanced-status',last.advanced?words.notPortable:words.none);
 set('compatibility-html-status',words.available);
 set('compatibility-footnote',words.notice);
 set('compatibility-external',words.external);
 $('print-document-btn').textContent=words.print;
 $('print-document-btn').title=words.printTip;
 return last;
}
export function portabilityStatus(){return last;}
