// Tab metadata contains no document text; drafts remain in savedDrafts.
export const TAB_LIMIT=20;
export const DOCUMENT_LANGS=['en','cs','uk','ro','ru'];
export const safeTabId=id=>typeof id==='string'&&/^tab_[a-z0-9_-]{4,64}$/.test(id);
export function safeTabName(value){
 if(typeof value!=='string')return null;
 const name=value.trim();
 return name&&name.length<=120&&!/[\/\\\x00-\x1f<>:"|?*]/.test(name)?name:null;
}
export function normalizeDocumentTabs(value){
 const result=Object.create(null);
 for(const lang of DOCUMENT_LANGS){
  const rows=value&&typeof value==='object'&&!Array.isArray(value)?value[lang]:null;
  const used=new Set();
  result[lang]=[];
  if(!Array.isArray(rows))continue;
  for(const row of rows){
   if(result[lang].length===TAB_LIMIT)break;
   if(!row||!safeTabId(row.id)||!safeTabName(row.name)||used.has(row.id))continue;
   result[lang].push({id:row.id,name:safeTabName(row.name)});
   used.add(row.id);
  }
 }
 return result;
}
export function normalizeActiveDocumentTabs(value,lists){
 const result=Object.create(null);
 for(const lang of DOCUMENT_LANGS){
  const active=value&&typeof value==='object'?value[lang]:null;
  result[lang]=lists[lang].some(tab=>tab.id===active)?active:(lists[lang][0]?.id||null);
 }
 return result;
}
export const tabDraftKey=(lang,id)=>'sandbox_doc_'+lang+'_'+id;
export function newTabId(existing=[]){
 const used=new Set(existing.map(item=>item.id));
 let id;
 do{id='tab_'+crypto.randomUUID().replaceAll('-','');}while(used.has(id));
 return id;
}
