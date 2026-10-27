import {BUILTIN_PROMPTS,PROMPT_CATEGORIES} from '../data/prompt-templates.js';
export {BUILTIN_PROMPTS,PROMPT_CATEGORIES};
export const LIBRARY_STORAGE_KEY='md_prompt_library_v1';

export function placeholders(body){
 const found=new Set();
 for(const match of String(body).matchAll(/\{\{([a-z][a-z0-9_]*)\}\}/g))found.add(match[1]);
 return [...found].slice(0,16);
}
export function fillPrompt(body,values={}){
 return String(body).replace(/\{\{([a-z][a-z0-9_]*)\}\}/g,(token,key)=>{
  const value=Object.hasOwn(values,key)?values[key]:null;
  return typeof value==='string'&&value.length?value:token;
 });
}
function isPersonal(x){
 return x&&typeof x==='object'&&!Array.isArray(x)
 &&typeof x.id==='string'&&/^own_[a-z0-9_-]{1,60}$/.test(x.id)
 &&typeof x.title==='string'&&x.title.trim().length>0&&x.title.length<=100
 &&typeof x.body==='string'&&x.body.trim().length>0&&x.body.length<=20000
 &&typeof x.description==='string'&&x.description.length<=400
 &&PROMPT_CATEGORIES.includes(x.category)&&placeholders(x.body).length<=12;
}
export function parsePromptLibrary(raw){
 let input={};
 try{input=typeof raw==='string'?JSON.parse(raw):raw||{}}catch{}
 if(!input||typeof input!=='object'||Array.isArray(input))input={};
 const personal=[],ids=new Set();
 if(Array.isArray(input.personal))for(const row of input.personal){
  if(personal.length>=50)break;
  if(!isPersonal(row)||ids.has(row.id)||BUILTIN_PROMPTS.some(x=>x.id===row.id))continue;
  personal.push({id:row.id,title:row.title.trim(),category:row.category,description:row.description.trim(),body:row.body,tip:''});
  ids.add(row.id);
 }
 const validIds=new Set([...BUILTIN_PROMPTS.map(x=>x.id),...ids]);
 const favorites=Array.isArray(input.favorites)
  ?[...new Set(input.favorites.filter(id=>typeof id==='string'&&validIds.has(id)))].slice(0,BUILTIN_PROMPTS.length+50):[];
 return {personal,favorites};
}
export function createPersonalTemplate({id,title,category,description,body}){
 if(typeof id!=='string'||!/^own_[a-z0-9_-]{1,60}$/.test(id))throw Error('Invalid ID');
 if(typeof title!=='string'||!title.trim()||title.length>100)throw Error('Invalid title');
 if(!PROMPT_CATEGORIES.includes(category))throw Error('Invalid category');
 if(typeof body!=='string'||!body.trim()||body.length>20000)throw Error('Invalid template');
 if(typeof description!=='string'||description.length>400)throw Error('Invalid description');
 if(placeholders(body).length>12)throw Error('Too many variables');
 return {id,title:title.trim(),category,description:description.trim(),body,tip:''};
}

/**
 * Match all query terms across title, description, body and category; prefer
 * concise title matches. Stable ordering keeps the catalog predictable.
 */
export function searchPromptTemplates(templates,{query='',category='all'}={}){
 const terms=String(query).toLocaleLowerCase().trim().split(/\s+/u).filter(Boolean);
 return templates
  .map((template,index)=>{
   const fields=[template.title,template.description,template.category,template.body,template.tip||'']
    .map(value=>String(value||'').toLocaleLowerCase());
   const match=(category==='all'||template.category===category)
    &&terms.every(term=>fields.some(field=>field.includes(term)));
   const score=terms.reduce((total,term)=>total
    +(fields[0].includes(term)?8:0)
    +(fields[1].includes(term)?4:0)
    +(fields[2].includes(term)?2:0)
    +(fields[3].includes(term)?1:0),0);
   return {template,index,match,score};
  })
  .filter(row=>row.match)
  .sort((a,b)=>terms.length?(b.score-a.score||a.index-b.index):a.index-b.index)
  .map(row=>row.template);
}
