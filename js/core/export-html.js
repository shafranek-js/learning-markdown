import previewStyles from '../../css/preview.css?inline';
import advancedStyles from '../../css/advanced.css?inline';
import {sanitizeHTML} from './sanitize.js';
import {validatedMermaidImageUrl} from '../ui/mermaid-preview.js';

// Current HTML is already sanitized by the live-preview pipeline; keep export
// styles fully bundled, so no CSS/JS/CDN requests are needed when opened offline.
export function standaloneHTML(safeDocumentHtml,language='en',mermaidImages=null){
 const lang=['en','cs','uk','ro','ru'].includes(language)?language:'en';
 // Sanitize ALL Markdown first. Trusted Mermaid images are inserted only into
 // code blocks matching their exact original text, after SVG revalidation.
 // Do not permit user-supplied <img src="data:..."> through the sanitizer.
 const host=document.createElement('div');
 host.innerHTML=sanitizeHTML(String(safeDocumentHtml||''));
 if(Array.isArray(mermaidImages)){
  const codes=[...host.querySelectorAll('pre > code.language-mermaid')];
  codes.forEach((code,index)=>{
   const expected=code.textContent.trim(),entry=mermaidImages[index],pre=code.parentElement;
   if(entry?.source===expected&&entry.uri){
    try{
     const image=document.createElement('img');
     image.src=validatedMermaidImageUrl(entry.uri);
     image.alt='Mermaid diagram '+(index+1);
     image.loading='eager';
     const figure=document.createElement('figure');
     figure.className='md-mermaid-export';
     figure.append(image);
     pre.replaceWith(figure);
     return;
    }catch{
     // An invalid artifact never gains an HTML or URL injection path.
    }
   }
   // Rendering errors remain visible and the original Markdown code stays.
   const note=document.createElement('p');
   note.className='md-mermaid-export-error';
   note.textContent='Mermaid diagram '+(index+1)+' could not be rendered. Source retained below.';
   pre.before(note);
  });
 }
 const base=`:root{--preview-text:#18212f;--accent:#1755a5;--preview-quote-border:#64748b;
--preview-quote-bg:#eef2f7;--preview-code-bg:#e8ebf0;--preview-code-text:#17212f;
--preview-pre-bg:#18212f;--preview-pre-text:#f8fafc;--preview-border:#cbd5e1;
--border-ui:#cbd5e1;--bg-preview:#ffffff}
*{box-sizing:border-box}body{margin:0;background:#edf1f5;color:#18212f;font-family:Arial,sans-serif}
main.md-preview{max-width:880px;min-height:100vh;margin:0 auto;padding:2.5rem 3rem;background:#fff}
@media print{body{background:#fff}main.md-preview{max-width:none;padding:0;min-height:0}}`;
 return '<!DOCTYPE html>\n<html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
   +'<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; script-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; img-src https: data:; connect-src &#39;none&#39;; font-src &#39;none&#39;; object-src &#39;none&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;">'
   +'<title>Learning Markdown — HTML export</title><style>\n'
   +base+'\n'+previewStyles+'\n'+advancedStyles+'\n</style></head><body><main class="md-preview">\n'
   +host.innerHTML+'\n</main></body></html>';
}
