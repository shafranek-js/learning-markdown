// Explicit structural operations on selected top-level Blocks-mode content.
// These operate on a draft only; Save uses the source sanitizer/Undo pipeline.
// Never split a list or silently reinterpret a nested list as a paragraph.
const TARGETS=new Set(['p','ul','ol']);
const SAFE_INLINE=new Set('a strong b em i u del s strike sup sub mark code span br'.split(' '));
// Changing a block wrapper discards its attributes. When an ordered list
// changes to bullets or paragraphs, losing numbering is deliberate. The HTML
// sanitizer also generates one redundant af-list-* class from the OL type.
// Allow only that exact derived class, never an author's arbitrary class,
// accessibility attribute, or metadata on an otherwise unchanged list.
const ORDERED_NUMBERING=new Set(['type','start']);
const ORDERED_TYPE_CLASS={
 '1':'af-list-decimal',a:'af-list-lower-alpha',A:'af-list-upper-alpha',
 i:'af-list-lower-roman',I:'af-list-upper-roman'
};
function hasProtectedWrapperAttributes(element,target){
 if(element.tagName!=='OL'||target==='ol')return element.attributes.length>0;
 const generatedClass=ORDERED_TYPE_CLASS[element.getAttribute('type')];
 return [...element.attributes].some(attribute=>
  !ORDERED_NUMBERING.has(attribute.name)&&
  !(attribute.name==='class'&&generatedClass&&attribute.value===generatedClass));
}
function topBlock(editor,node){
 const element=node?.nodeType===1?node:node?.parentElement;
 if(!element||!editor.contains(element))return null;
 let block=element;
 while(block&&block.parentElement!==editor)block=block.parentElement;
 return block?.parentElement===editor?block:null;
}
function selectedTopBlocks(editor,range){
 const children=[...editor.children];
 return children.filter(block=>range.intersectsNode(block));
}
function safeList(list,target,range){
 if(![...list.childNodes].every(node=>node.nodeType===1&&node.tagName==='LI'||
     node.nodeType===3&&!node.textContent.trim()))return false;
 const items=[...list.children];
 // When converting a list, all items must be selected. Partial list
 // conversions can renumber the remaining ordered items unexpectedly.
 if(!items.length||items.some(item=>!range.intersectsNode(item)))return false;
 if(target==='p'&&items.some(item=>item.attributes.length||[...item.querySelectorAll('*')].some(el=>
    el.tagName==='UL'||el.tagName==='OL'||!SAFE_INLINE.has(el.tagName.toLowerCase()))))return false;
 return true;
}
function nestedItem(editor,node){
 const element=node?.nodeType===1?node:node?.parentElement;
 const item=element?.closest('li');
 return item&&editor.contains(item)&&
  ['UL','OL'].includes(item.parentElement?.tagName)?item:null;
}
function convertNestedList(editor,target,selection,range){
 const a=nestedItem(editor,selection.anchorNode),b=nestedItem(editor,selection.focusNode);
 const aNested=a?.parentElement?.parentElement?.tagName==='LI';
 const bNested=b?.parentElement?.parentElement?.tagName==='LI';
 if(!aNested&&!bNested)return null;
 // Refuse a cross-depth/cross-list selection instead of reformatting the
 // entire ancestor list. A nested range must belong to ONE direct child list.
 if(!aNested||!bNested||a.parentElement!==b.parentElement)
  return {ok:false,reason:'partial-or-nested-list'};
 const list=a.parentElement,items=[...list.children];
 if(!items.length||items.some(item=>item.tagName!=='LI')||
    [...list.childNodes].some(node=>node.nodeType!==1&&
      (node.nodeType!==3||node.textContent.trim())))
  return {ok:false,reason:'partial-or-nested-list'};
 if(list.tagName.toLowerCase()===target)
  return {ok:false,reason:'already-formatted'};
 if(hasProtectedWrapperAttributes(list,target))
  return {ok:false,reason:'protected-metadata'};
 const aIndex=items.indexOf(a),bIndex=items.indexOf(b);
 if(aIndex<0||bIndex<0)return {ok:false,reason:'partial-or-nested-list'};
 // A caret retains the previous whole-list conversion behavior.
 // A noncollapsed selection converts the inclusive contiguous LI range.
 const first=selection.isCollapsed?0:Math.min(aIndex,bIndex);
 const last=selection.isCollapsed?items.length-1:Math.max(aIndex,bIndex);
 const selected=items.slice(first,last+1);
 // A nested item can become a paragraph only when its LI wrapper contains
 // inline markup. Never discard per-item attributes or flatten deeper lists,
 // media, headings or other block containers during the conversion.
 if(target==='p'&&selected.some(item=>item.attributes.length||
    [...item.querySelectorAll('*')].some(el=>!SAFE_INLINE.has(el.tagName.toLowerCase()))))
  return {ok:false,reason:'nested-to-paragraph'};
 const doc=editor.ownerDocument;
 const changed=target==='p'?doc.createDocumentFragment():doc.createElement(target);
 const inserted=[];
 const appendConverted=item=>{
  if(target==='p'){
   const paragraph=doc.createElement('p');
   while(item.firstChild)paragraph.append(item.firstChild);
   changed.append(paragraph);inserted.push(paragraph);
  }else changed.append(item);
 };
 const partial=first>0||last<items.length-1;
 if(!partial){
  if(target==='p')items.forEach(appendConverted);
  else while(list.firstChild)changed.append(list.firstChild);
  list.replaceWith(changed);
 }else{
  // For ordered lists, preserve the suffix's ordinal after splitting.
  // start is explicitly allowlisted and bounded by the HTML sanitizer.
  const initial=list.tagName==='OL'?Number(list.getAttribute('start')||1):1;
  const suffixStart=initial+last+1;
  if(list.tagName==='OL'&&last<items.length-1&&
     (!Number.isInteger(suffixStart)||suffixStart>99999))
   return {ok:false,reason:'partial-or-nested-list'};
  const before=first>0?list.cloneNode(false):null;
  const after=last<items.length-1?list.cloneNode(false):null;
  if(after?.tagName==='OL')after.setAttribute('start',String(suffixStart));
  items.forEach((item,index)=>{
   if(index<first)before.append(item);
   else if(index<=last)appendConverted(item);
   else after.append(item);
  });
  const fragment=doc.createDocumentFragment();
  if(before)fragment.append(before);
  fragment.append(changed);
  if(after)fragment.append(after);
  list.replaceWith(fragment);
 }
 // Keep the selection at its original depth for subsequent conversions.
 const replacement=doc.createRange();
 if(target==='p'){
  replacement.setStartBefore(inserted[0]);
  replacement.setEndAfter(inserted.at(-1));
 }else{
  replacement.setStart(changed.firstElementChild,0);
  replacement.setEnd(changed.lastElementChild,changed.lastElementChild.childNodes.length);
 }
 selection.removeAllRanges();selection.addRange(replacement);
 return {ok:true,blocks:target==='p'?inserted.length:1};
}
export function convertBlockSelection(editor,target,selection=window.getSelection()){
 if(!editor||!TARGETS.has(target)||!selection?.rangeCount||
    !editor.contains(selection.anchorNode)||!editor.contains(selection.focusNode))
  return {ok:false,reason:'no-selection'};
 const range=selection.getRangeAt(0);
 if(!editor.contains(range.commonAncestorContainer))return {ok:false,reason:'no-selection'};
 const nested=convertNestedList(editor,target,selection,range);
 if(nested)return nested;
 const blocks=selection.isCollapsed?
  [topBlock(editor,selection.anchorNode)].filter(Boolean):selectedTopBlocks(editor,range);
 if(!blocks.length)return {ok:false,reason:'no-selection'};
 // Check ALL selected blocks before touching the DOM.
 for(const block of blocks){
  const type=block.tagName.toLowerCase();
  if(type!=='p'&&type!=='ul'&&type!=='ol')return {ok:false,reason:'unsupported-block'};
  if(type!=='p'&&!safeList(block,target,range))return {ok:false,reason:'partial-or-nested-list'};
 }
 if(blocks.every(block=>block.tagName.toLowerCase()===target))
  return {ok:false,reason:'already-formatted'};
 // Paragraphs keep their own wrapper when converting to paragraphs. Every
 // other selected wrapper is reconstructed and would lose its attributes.
 if(blocks.some(block=>(block.tagName!=='P'||target!=='p')&&
   hasProtectedWrapperAttributes(block,target)))
  return {ok:false,reason:'protected-metadata'};
 // Remember the insertion boundary BEFORE any selected paragraph is moved.
 // Otherwise a trailing paragraph would become detached and lose nextSibling.
 const after=blocks.at(-1).nextSibling;
 const doc=editor.ownerDocument,fragment=doc.createDocumentFragment();
 const inserted=[];
 if(target==='p'){
  for(const block of blocks){
   if(block.tagName==='P'){fragment.append(block);inserted.push(block);continue;}
   for(const item of [...block.children]){
    const p=doc.createElement('p');
    while(item.firstChild)p.append(item.firstChild);
    fragment.append(p);inserted.push(p);
   }
  }
 }else{
  const list=doc.createElement(target);
  for(const block of blocks){
   if(block.tagName==='P'){
    const item=doc.createElement('li');
    while(block.firstChild)item.append(block.firstChild);
    list.append(item);
   }else{
    for(const item of [...block.children])list.append(item);
   }
  }
  fragment.append(list);inserted.push(list);
 }
 // Inserting before a selected block that was MOVED into the fragment would
 // fail; retain the position with a marker independent of the moved content.
 // Use its previous sibling if available, otherwise the original next sibling.
 for(const block of blocks)if(block.parentElement===editor)block.remove();
 editor.insertBefore(fragment,after);
 const replacement=doc.createRange();
 replacement.setStartBefore(inserted[0]);replacement.setEndAfter(inserted.at(-1));
 selection.removeAllRanges();selection.addRange(replacement);
 return {ok:true,blocks:inserted.length};
}
