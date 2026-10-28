import {Document,Packer,Paragraph} from 'docx';
import {htmlToContent} from 'docx/html';
import {sanitizeHTML} from './sanitize.js';

// DOCX is built locally from the same sanitized HTML as Live Preview.
// Unreachable external images are replaced with readable links, never
// omitted silently or downloaded by Word on opening the file.
const MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_IMAGE_BYTES=3*1024*1024;
const MAX_IMAGES=16;
const IMAGE_TYPES=new Set(['image/png','image/jpeg','image/gif','image/bmp']);
export const WORD_MIME=MIME;

function imageFallback(image,url){
 const link=document.createElement('a');
 const name=image.getAttribute('alt')?.trim()||'Image';
 link.textContent=name+' [image: '+url+']';
 // Source HTML has already gone through the shared URL sanitizer.
 if(/^https?:\/\//i.test(url))link.href=url;
 image.replaceWith(link);
}

async function embedImage(url,fetchImage){
 if(!/^https:\/\//i.test(url))return null;
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),6000);
 try{
  const res=await fetchImage(url,{mode:'cors',credentials:'omit',redirect:'follow',signal:controller.signal});
  if(!res.ok||!/^https:\/\//i.test(res.url||url))return null;
  const mime=(res.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
  if(!IMAGE_TYPES.has(mime)||Number(res.headers.get('content-length')||0)>MAX_IMAGE_BYTES)return null;
  const blob=await res.blob();
  if(blob.size===0||blob.size>MAX_IMAGE_BYTES)return null;
  return new Uint8Array(await blob.arrayBuffer());
 }catch{return null;}
 finally{clearTimeout(timeout);}
}

// A dedicated export module is loaded on demand so editing does not pay the
// DOCX library's bundle cost before the user selects File -> Export Word.
export async function createWordDocument(previewHtml,{title='Markdown document',fetchImage=fetch}={}){
 const root=document.createElement('div');
 root.innerHTML=sanitizeHTML(String(previewHtml||''));
 const images=Object.create(null),warnings=[];
 const imageElements=[...root.querySelectorAll('img[src]')];
 for(const image of imageElements){
  const url=image.getAttribute('src');
  if(imageElements.indexOf(image)>=MAX_IMAGES){imageFallback(image,url);warnings.push('image-limit');continue;}
  if(!Object.prototype.hasOwnProperty.call(images,url)){
   const data=await embedImage(url,fetchImage);
   if(data)images[url]=data;
  }
  if(!images[url]){imageFallback(image,url);warnings.push('external-image');}
 }
 if(root.querySelector('pre > code.language-mermaid'))warnings.push('mermaid-source');
 const conversionWarnings=[];
 const children=htmlToContent(root.innerHTML,{
  images,maxImageWidth:520,notes:'footnotes',
  onWarning:warning=>conversionWarnings.push(warning)
 });
 if(conversionWarnings.length)warnings.push('formatting');
 const doc=new Document({
  creator:'Learning Markdown',
  title:String(title||'Markdown document').slice(0,180),
  description:'Native Word document exported from Learning Markdown',
  sections:[{children:children.length?[...children]:[new Paragraph('')]}]
 });
 const blob=await Packer.toBlob(doc);
 if(!blob||blob.size<200||blob.type&&!blob.type.includes('wordprocessingml')){
  // A valid DOCX must be a non-empty OOXML package; the calling UI reports failures.
  if(!blob||blob.size<200)throw new Error('Empty Word document');
 }
 return {blob,warnings:[...new Set(warnings)]};
}
