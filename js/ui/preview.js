import {sanitizeHTML} from '../core/sanitize.js';
import {highlightCodeBlocks,highlightLanguage,highlightTooltip} from '../core/highlight-code.js';
import {renderFootnotedMarkdown} from '../core/footnotes.js';
import {definitionListExtension,renderDefinitionLists,mergeAdjacentDefinitionLists,preRenderDefinitionListsForFootnotes,completeDefinitionsWithFootnotes} from '../core/definition-lists.js';
import {emojiShortcodeExtension,renderEmojiShortcodes,expandEmojiTextInHTML} from '../core/emoji-shortcodes.js';
import {addHeadingAnchors} from '../core/heading-anchors.js';
import {renderTOC} from './toc.js';
import {extensionEnabled} from '../core/extensions.js';
import {marked} from 'marked';
import {state,docKey} from '../core/state.js';
import {parserExtensionOptions} from '../core/extensions.js';
import {area,applyEdit} from './editor.js';
import {scanTaskMarkers,switchTaskMarker} from '../core/task-markers.js';
import {syncTableEditorPreview} from './table-editor.js';
let lastHtml='';
export const DIALECT_OPTIONS={
 gfm:{gfm:true,pedantic:false,breaks:false},
 commonmark:{gfm:false,pedantic:false,breaks:false},
 original:{gfm:false,pedantic:true,breaks:false}
};
export function markdownToHTML(text,dialect=state.dialect,{extensions=true,labFeatures=[]}={}){
 const base=DIALECT_OPTIONS[dialect]||DIALECT_OPTIONS.gfm;
 const options=extensions?{...base,...parserExtensionOptions(state.extensionSettingsByDocument,docKey(),dialect)}:base;
 // The optional learning lab may exercise selected already-reviewed grammar
 // extensions without reading or mutating the current document's opt-ins.
 // Never activate lab features in CommonMark, Original, or normal Preview.
 const allowedLabFeatures=new Set(['footnotes','headingIds','definitionLists']);
 const isolated=!extensions&&dialect==='gfm'&&Array.isArray(labFeatures)
  ?new Set(labFeatures.filter(id=>allowedLabFeatures.has(id))):new Set();
 const enabled=id=>isolated.has(id)||(extensions&&extensionEnabled(state.extensionSettingsByDocument,docKey(),dialect,id));
 const footnotes=enabled('footnotes');
 const definitions=enabled('definitionLists');
 const shortcodes=enabled('emojiShortcodes');
 const extra=shortcodes&&!footnotes?[emojiShortcodeExtension()]:[];
 // The footnote parser assumes its accumulator is the initial lexer token.
 // Pre-render semantic definition tokens rather than composing block plugins.
 const input=footnotes&&definitions?preRenderDefinitionListsForFootnotes(text,options):text;
 const raw=footnotes
  ?renderFootnotedMarkdown(input,options,state.lang)
  :definitions?renderDefinitionLists(text,options,extra)
  :shortcodes?renderEmojiShortcodes(text,options):marked.parse(text,options);
 // Use the same strict class/attribute allowlist for every preview and export.
 const safe=highlightCodeBlocks(sanitizeHTML(raw));
 const repaired=definitions&&footnotes?completeDefinitionsWithFootnotes(safe):safe;
 const normalized=definitions?mergeAdjacentDefinitionLists(repaired):repaired;
 const withEmoji=shortcodes&&footnotes?expandEmojiTextInHTML(normalized):normalized;
 return addHeadingAnchors(withEmoji,{
  customIds:enabled('headingIds')
 });
}
function enableTaskInputs(preview,source){
 if(state.dialect!=='gfm')return;
 const markers=scanTaskMarkers(source);
 const inputs=[...preview.querySelectorAll('input[type="checkbox"]')];
 // A manually supplied HTML checkbox must not shift indices for Markdown tasks.
 if(inputs.some(input=>!input.closest('li')))return;
 // Never edit on an ambiguous mapping (including source HTML inputs).
 if(!markers.length||markers.length!==inputs.length||!markers.every((marker,i)=>marker.checked===inputs[i].checked))return;
 inputs.forEach((input,i)=>{
  input.disabled=false;
  input.dataset.taskIndex=String(i);
  input.setAttribute('aria-label',input.closest('li')?.textContent?.trim().slice(0,160)||'Task');
 });
}
function handleTaskChange(event){
 const input=event.target;
 if(!(input instanceof HTMLInputElement)||input.type!=='checkbox'||!input.hasAttribute('data-task-index'))return;
 const index=Number(input.dataset.taskIndex),a=area(),source=a.value;
 const markers=scanTaskMarkers(source);
 if(state.dialect!=='gfm'||!Number.isInteger(index)||index<0||index>=markers.length
  ||markers.length!==document.querySelectorAll('#markdown-preview input[data-task-index]').length){
  updatePreview(source);return;
 }
 const edited=switchTaskMarker(source,markers[index],input.checked);
 if(edited===null){updatePreview(source);return;}
 if(edited===source)return;
 applyEdit(edited,a.selectionStart,a.selectionEnd,{focus:false});
 document.querySelector('#markdown-preview input[data-task-index="'+index+'"]')?.focus({preventScroll:true});
}
// Links to a document anchor must not overwrite the app's lesson route in location.hash.
export function initPreviewAnchors(){
 document.getElementById('markdown-preview').addEventListener('change',handleTaskChange);
 const followDocumentAnchor=event=>{
  const link=event.target.closest?.('a[href^="#"]');
  if(!link)return;
  let id;
  try{id=decodeURIComponent(link.getAttribute('href').slice(1));}catch{return;}
  if(id.length>128)return;
  const target=[...document.getElementById('markdown-preview').querySelectorAll('[id]')].find(el=>el.id===id);
  if(target){event.preventDefault();target.scrollIntoView({block:'nearest',behavior:'smooth'});}
 };
 document.getElementById('markdown-preview').addEventListener('click',followDocumentAnchor);
 document.getElementById('toc-nav').addEventListener('click',followDocumentAnchor);
}
export function updatePreview(text){
 lastHtml=markdownToHTML(text);
 const target=document.getElementById('markdown-preview');
 target.innerHTML=lastHtml;
 for(const code of target.querySelectorAll('pre > code[class]')){
  const language=highlightLanguage(code.className);
  if(!language||!code.querySelector('[class^="hljs-"]'))continue;
  const tip=highlightTooltip(language,state.lang);
  code.parentElement.title=tip;
  code.parentElement.setAttribute('aria-label',tip);
 }
 enableTaskInputs(target,text);
 renderTOC(target);
 syncTableEditorPreview();
 document.getElementById('raw-html-preview').textContent=lastHtml.trim();
}
export const currentHtml=()=>lastHtml;
