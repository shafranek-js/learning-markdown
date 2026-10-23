// Issue #13: source-preserving, allowlisted figure snippet generation.
export const MIN_PX=1;
export const MAX_PX=1600;
const htmlEscape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')
 .replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export function figureDimension(value){
 const string=String(value??'');
 if(!/^[1-9]\d{0,3}$/.test(string))return null;
 const number=Number(string);
 return number>=MIN_PX&&number<=MAX_PX?number:null;
}
export function safeFigureUrl(value){
 const url=String(value||'').trim();
 if(!url||/[\x00-\x20\x7f<>"'\\]/.test(url))return false;
 try{
  const parsed=new URL(url);
  return parsed.protocol==='https:'&&Boolean(parsed.hostname)
   &&!parsed.username&&!parsed.password;
 }catch{return false;}
}
export function validateFigure(options={}){
 const url=String(options.url||'').trim();
 if(!safeFigureUrl(url))return {valid:false,reason:'url'};
 const decorative=options.decorative===true;
 const alt=String(options.alt||'').trim();
 if(!decorative&&!alt)return {valid:false,reason:'alt'};
 const width=figureDimension(options.width);
 if(width===null)return {valid:false,reason:'width'};
 const height=options.height===undefined||options.height===null||options.height===''
  ?null:figureDimension(options.height);
 if(options.height!==undefined&&options.height!==null&&options.height!==''&&height===null)
  return {valid:false,reason:'height'};
 const caption=String(options.caption||'').trim();
 if(alt.length>400||caption.length>500)return {valid:false,reason:'length'};
 return {valid:true,url,decorative,alt:decorative?'':alt,width,height,caption};
}
export function makeFigureSnippet(options){
 const o=validateFigure(options);
 if(!o.valid)return {html:null,error:o.reason};
 const klass=o.height===null?'af-figure':'af-figure af-figure-fixed';
 const markup='<figure class="'+klass+'">\n'
  +'<img src="'+htmlEscape(o.url)+'" alt="'+htmlEscape(o.alt)+'" width="'+o.width+'"'
  +(o.height!==null?' height="'+o.height+'"':'')+' loading="lazy">\n'
  +(o.caption?'<figcaption>'+htmlEscape(o.caption)+'</figcaption>\n':'')
  +'</figure>';
 return {html:markup,error:null};
}
export function makePortableImage(options){
 const o=validateFigure(options);
 if(!o.valid)return {html:null,error:o.reason};
 const alt=o.alt.replace(/([\\\[\]])/g,'\\$1');
 const url=o.url.replace(/\(/g,'%28').replace(/\)/g,'%29');
 return {html:'!['+alt+']('+url+')',error:null};
}
