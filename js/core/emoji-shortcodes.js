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
