// Isolated history per lesson and language. First snapshot is never coalesced away.
const histories = new Map();
const MAX = 180;
const take=(text,start,end)=>({text,start,end,time:Date.now()});
export function ensureHistory(key,text){if(!histories.has(key)){histories.set(key,{stack:[take(text,text.length,text.length)],pointer:0,lastType:null});}return histories.get(key);}
export function record(key,text,start,end,{force=false,boundary=false}={}) {
 const h=ensureHistory(key,text),current=h.stack[h.pointer];
 if(current.text===text){current.start=start;current.end=end;return h;}
 const now=Date.now();
 if(h.pointer<h.stack.length-1) h.stack.splice(h.pointer+1);
 const canMerge=!force&&!boundary&&h.lastType==='typing'&&h.pointer>0&&now-current.time<420&&Math.abs(text.length-current.text.length)<=3;
 if(canMerge){h.stack[h.pointer]=take(text,start,end);}
 else {h.stack.push(take(text,start,end));h.pointer=h.stack.length-1;}
 h.lastType=force?'action':'typing';
 if(h.stack.length>MAX){h.stack.shift();h.pointer=Math.max(0,h.pointer-1);}
 return h;
}
export function step(key,direction){const h=histories.get(key);if(!h)return null;const p=h.pointer+direction;if(p<0||p>=h.stack.length)return null;h.pointer=p;h.lastType='undo';return h.stack[p];}
export function status(key){const h=histories.get(key);return {canUndo:!!h&&h.pointer>0,canRedo:!!h&&h.pointer<h.stack.length-1,pointer:(h?.pointer??0)+1,total:h?.stack.length??1};}
export function clearHistory(){histories.clear();}
