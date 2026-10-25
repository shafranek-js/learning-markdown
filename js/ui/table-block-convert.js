// Explicit structural operations on selected top-level Blocks-mode content.
// These operate on a draft only; Save uses the source sanitizer/Undo pipeline.
// Never split a list or silently reinterpret a nested list as a paragraph.
const TARGETS=new Set(['p','ul','ol']);
const SAFE_INLINE=new Set('a strong b em i u del s strike sup sub mark code span br'.split(' '));
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
 if(target==='p')return {ok:false,reason:'nested-to-paragraph'};
 if(!selection.isCollapsed&&items.some(item=>!range.intersectsNode(item)))
  return {ok:false,reason:'partial-or-nested-list'};
 if(list.tagName.toLowerCase()===target)
  return {ok:false,reason:'already-formatted'};
 const changed=editor.ownerDocument.createElement(target);
 while(list.firstChild)changed.append(list.firstChild);
 list.replaceWith(changed);
 const replacement=editor.ownerDocument.createRange();
 replacement.selectNodeContents(changed);
 selection.removeAllRanges();selection.addRange(replacement);
 return {ok:true,blocks:1};
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
