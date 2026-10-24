// #15: allowlisted inline emoji shortcode grammar, never installed globally.
import {Marked} from 'marked';
import {EMOJI_SHORTCODES} from './unicode-palette.js';
const CODE=/^:([a-z0-9_+-]{2,32}):/;
export function emojiShortcodeExtension(){
 return {extensions:[{
  name:'emojiShortcode',level:'inline',
  start(source){return source.indexOf(':');},
  tokenizer(source){
   const match=CODE.exec(source);
   if(!match||!Object.hasOwn(EMOJI_SHORTCODES,match[1]))return;
   return {type:'emojiShortcode',raw:match[0],text:EMOJI_SHORTCODES[match[1]]};
  },
  renderer(token){return token.text;}
 }]};
}
export function renderEmojiShortcodes(source,options){
 return new Marked(emojiShortcodeExtension()).parse(source,options);
}


// Some footnote plugins depend on the first lexer token being a footnote
// accumulator. Additional inline plugins can disrupt that assumption. For a
// footnote document, expand only text nodes of already-sanitized HTML instead.
export function expandEmojiTextInHTML(safeHtml){
 const root=document.createElement('div');
 root.innerHTML=safeHtml;
 function walk(node,insideCode=false){
  if(node.nodeType===Node.TEXT_NODE){
   if(!insideCode)
    node.textContent=node.textContent.replace(/:([a-z0-9_+-]{2,32}):/g,
     (all,id)=>Object.hasOwn(EMOJI_SHORTCODES,id)?EMOJI_SHORTCODES[id]:all);
   return;
  }
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  const tag=node.tagName.toLowerCase();
  const skip=insideCode||['pre','code','kbd','samp'].includes(tag);
  for(const child of [...node.childNodes])walk(child,skip);
 }
 for(const node of [...root.childNodes])walk(node);
 return root.innerHTML;
}
