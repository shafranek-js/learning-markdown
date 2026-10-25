// Source-safe inline formatting for multi-block HTML table-cell selections.
// Unlike Range.extractContents(), this only wraps selected TEXT segments,
// leaving paragraphs, lists, quotations, and nesting untouched.
const INLINE=new Set(['strong','em','u','code']);
const FORBIDDEN='pre,code';
export function formatBlockSelection(editor,tag,selection=window.getSelection()){
 if(!editor||!INLINE.has(tag)||!selection?.rangeCount||selection.isCollapsed||
    !editor.contains(selection.anchorNode)||!editor.contains(selection.focusNode))
  return {ok:false,reason:'no-selection'};
 const range=selection.getRangeAt(0);
 if(!editor.contains(range.commonAncestorContainer))return {ok:false,reason:'no-selection'};
 const backwards=selection.anchorNode===range.endContainer&&
  selection.anchorOffset===range.endOffset&&
  !(selection.anchorNode===selection.focusNode&&selection.anchorOffset===selection.focusOffset);
 const walk=editor.ownerDocument.createTreeWalker(editor,4),segments=[];
 while(walk.nextNode()){
  const node=walk.currentNode;
  if(!node.length||!range.intersectsNode(node))continue;
  const start=range.startContainer===node?range.startOffset:0;
  const end=range.endContainer===node?range.endOffset:node.length;
  if(start>=end)continue;
  if(node.parentElement?.closest(FORBIDDEN))return {ok:false,reason:'unsafe-block'};
  segments.push({node,start,end});
  // Refuse unusually fragmented ranges instead of allocating many DOM nodes.
  if(segments.length>500)return {ok:false,reason:'too-large'};
 }
 if(!segments.length)return {ok:false,reason:'no-selection'};
 const wrappers=[];
 // Process in reverse DOM order so a split cannot shift offsets of a later
 // source text node. Each wrapper is inline and remains in its original block.
 for(let i=segments.length-1;i>=0;i--){
  const {node,start,end}=segments[i];
  if(end<node.length)node.splitText(end);
  const part=start?node.splitText(start):node;
  const wrapper=editor.ownerDocument.createElement(tag);
  part.parentNode.insertBefore(wrapper,part);
  wrapper.appendChild(part);
  wrappers.unshift(wrapper);
 }
 const first=wrappers[0],last=wrappers.at(-1);
 const restored=editor.ownerDocument.createRange();
 restored.setStartBefore(first);
 restored.setEndAfter(last);
 selection.removeAllRanges();selection.addRange(restored);
 if(backwards&&typeof selection.setBaseAndExtent==='function'){
  try{selection.setBaseAndExtent(last,last.childNodes.length,first,0);}
  catch{ /* The forward document-range selection remains valid. */ }
 }
 return {ok:true,count:wrappers.length};
}
