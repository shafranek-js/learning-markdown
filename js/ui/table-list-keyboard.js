// Keyboard list editing for the visual HTML table-cell Blocks editor.
// Operates on the local contenteditable draft only. A subsequent explicit Save
// commits through setTableCellBlocks's sanitizer and source-backed Undo history.
const LIST_TAGS=new Set(['UL','OL']);
const isList=node=>node?.nodeType===1&&LIST_TAGS.has(node.tagName);
const isItem=node=>node?.nodeType===1&&node.tagName==='LI';
const parentElement=node=>node?.nodeType===1?node:node?.parentElement;
function nearestItem(node,editor){
 const item=parentElement(node)?.closest('li');
 return item&&editor.contains(item)&&isList(item.parentElement)?item:null;
}
function children(list){
 return [...list.children].filter(isItem);
}
function activeItems(editor,selection){
 if(!selection?.rangeCount||!editor.contains(selection.anchorNode)||
    !editor.contains(selection.focusNode))return null;
 const first=nearestItem(selection.anchorNode,editor);
 const last=nearestItem(selection.focusNode,editor);
 if(!first||!last||first.parentElement!==last.parentElement)return null;
 const list=first.parentElement,siblings=children(list);
 const x=siblings.indexOf(first),y=siblings.indexOf(last);
 if(x<0||y<0)return null;
 return {list,items:siblings.slice(Math.min(x,y),Math.max(x,y)+1),first};
}
function restoreSelection(editor,selection,snapshot,fallback){
 const [a,ao,b,bo]=snapshot;
 try{
  if(a&&b&&editor.contains(a)&&editor.contains(b)){
   selection.setBaseAndExtent(a,Math.min(ao,a.nodeType===3?a.length:a.childNodes.length),
    b,Math.min(bo,b.nodeType===3?b.length:b.childNodes.length));
   return;
  }
 }catch{ /* Detached or transformed selection anchors. */}
 const range=document.createRange();
 const target=fallback||editor;
 range.selectNodeContents(target);
 range.collapse(false);
 selection.removeAllRanges();selection.addRange(range);
}
function indent(info){
 const {list,items}=info,siblings=children(list);
 const firstIndex=siblings.indexOf(items[0]);
 if(firstIndex===0)return false;
 const previous=siblings[firstIndex-1];
 // Reuse the last direct child list of the same type when possible.
 const nested=[...previous.children].filter(isList).at(-1);
 const target=nested?.tagName===list.tagName?nested:document.createElement(list.tagName.toLowerCase());
 if(!target.parentElement)previous.append(target);
 for(const item of items)target.append(item);
 return true;
}
function outdent(info){
 const {list,items}=info,holder=list.parentElement;
 if(!isItem(holder)||!isList(holder.parentElement))return false;
 const outer=holder.parentElement,after=holder.nextSibling;
 // Lifting a middle range must not reorder the unselected trailing items.
 // Keep their reading order by nesting that tail under the LAST lifted item.
 // Clone the list shell to retain ordered-list type and approved presets.
 const trailing=[];
 for(let next=items.at(-1).nextElementSibling;next;next=next.nextElementSibling)
  if(isItem(next))trailing.push(next);
 if(trailing.length){
  const remainder=list.cloneNode(false);
  for(const item of trailing)remainder.append(item);
  items.at(-1).append(remainder);
 }
 for(const item of items)outer.insertBefore(item,after);
 if(!children(list).length)list.remove();
 return true;
}
function ownText(item){
 const clone=item.cloneNode(true);
 for(const list of [...clone.querySelectorAll('ul,ol')])list.remove();
 return clone.textContent.replace(/\u00a0/g,'').trim();
}
function hasChildList(item){
 return [...item.children].some(isList);
}
function caretAtStart(selection,item){
 if(!selection.isCollapsed||!selection.rangeCount)return false;
 const range=document.createRange();
 range.setStart(item,0);
 try{range.setEnd(selection.anchorNode,selection.anchorOffset);}
 catch{return false;}
 return range.toString().replace(/\u00a0/g,'').trim()==='';
}
function exitToParagraph(item,editor){
 const list=item.parentElement;
 if(!isList(list)||isItem(list.parentElement)||hasChildList(item))return null;
 const afterItems=[];
 for(let next=item.nextElementSibling;next;next=next.nextElementSibling)
  if(isItem(next))afterItems.push(next);
 const paragraph=document.createElement('p');
 while(item.firstChild)paragraph.append(item.firstChild);
 if(!paragraph.hasChildNodes()||
    !(paragraph.textContent||'').replace(/\u00a0/g,'').trim()&&
    !paragraph.querySelector('br'))paragraph.append(document.createElement('br'));
 // Split middle items into a second list. Never reparent arbitrary siblings,
 // and never promote a nested list into a paragraph.
 if(afterItems.length){
  const following=list.cloneNode(false);
  for(const followingItem of afterItems)following.append(followingItem);
  list.after(paragraph,following);
 }else list.after(paragraph);
 item.remove();
 if(!children(list).length)list.remove();
 return paragraph;
}
// Returns true only for a consumed key. Tab/Shift+Tab operate on one or
// multiple contiguous siblings, preserving the user's selected text nodes.
// Enter exits an empty top-level item, or outdents an empty nested item.
// Backspace at the start of a nested item outdents; at the beginning of the
// first top-level item it promotes the existing inline content to a paragraph.
export function handleBlockListKeydown(editor,event,selection=window.getSelection(),onUnsupportedSelection){
 if(!editor||!['Tab','Enter','Backspace'].includes(event.key)||
    event.altKey||event.ctrlKey||event.metaKey||event.isComposing)return false;
 const info=activeItems(editor,selection);
 if(!info){
  // Browser Tab would otherwise abandon an active selection crossing a
  // paragraph/list boundary, losing the user's selection with no explanation.
  // Such mixed-depth edits need a structural algorithm, not native focus Tab.
  if(event.key==='Tab'&&selection?.rangeCount&&!selection.isCollapsed&&
     editor.contains(selection.anchorNode)&&editor.contains(selection.focusNode)&&
     (nearestItem(selection.anchorNode,editor)||nearestItem(selection.focusNode,editor))){
   event.preventDefault();
   if(typeof onUnsupportedSelection==='function')onUnsupportedSelection();
   return true;
  }
  return false;
 }
 const {list,items}=info;
 const snapshot=[selection.anchorNode,selection.anchorOffset,
  selection.focusNode,selection.focusOffset];
 if(event.key==='Tab'){
  event.preventDefault();
  if(event.shiftKey?outdent(info):indent(info))
   restoreSelection(editor,selection,snapshot,items[0]);
  return true;
 }
 if(items.length!==1||!selection.isCollapsed)return false;
 const item=items[0];
 if(event.key==='Enter'){
  if(ownText(item)!==''||hasChildList(item))return false;
  event.preventDefault();
  if(isItem(list.parentElement)){
   if(outdent(info))restoreSelection(editor,selection,snapshot,item);
  }else{
   const paragraph=exitToParagraph(item,editor);
   if(paragraph)restoreSelection(editor,selection,[null,0,null,0],paragraph);
  }
  return true;
 }
 if(event.key==='Backspace'&&caretAtStart(selection,item)){
  if(isItem(list.parentElement)){
   event.preventDefault();
   if(outdent(info))restoreSelection(editor,selection,snapshot,item);
   return true;
  }
  if(!item.previousElementSibling&&!hasChildList(item)){
   event.preventDefault();
   const paragraph=exitToParagraph(item,editor);
   if(paragraph)restoreSelection(editor,selection,[null,0,null,0],paragraph);
   return true;
  }
 }
 return false;
}
