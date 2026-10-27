import assert from 'node:assert/strict';
import {BUILTIN_PROMPTS,PROMPT_CATEGORIES,placeholders,fillPrompt,parsePromptLibrary,createPersonalTemplate,searchPromptTemplates} from '../js/core/prompt-library.js';

assert.equal(BUILTIN_PROMPTS.length,60);
assert.equal(PROMPT_CATEGORIES.length,10);
for(const [index,category] of PROMPT_CATEGORIES.entries())assert.equal(BUILTIN_PROMPTS.filter(x=>x.category===category).length,index<5?8:4);
assert.equal(new Set(BUILTIN_PROMPTS.map(x=>x.id)).size,60);
assert.deepEqual(BUILTIN_PROMPTS.slice(0,20).map(x=>x.id).filter(id=>id==='writing-blog'||id==='coding-review'||id==='work-procedure'),['writing-blog','coding-review','work-procedure']);
for(const item of BUILTIN_PROMPTS){
 assert.ok(item.title&&item.description&&item.tip);
 assert.ok(placeholders(item.body).length>0);
 assert.ok(placeholders(item.body).length<=12);
 assert.ok(item.body.length>=100);
 assert.ok(PROMPT_CATEGORIES.includes(item.category));
}
assert.deepEqual(placeholders('Hello {{topic}}, {{topic}} and {{task_name}}. {{BAD}}'),['topic','task_name']);
assert.equal(fillPrompt('{{topic}} {{topic}} {{missing}}',{topic:'$& Markdown'}),'$& Markdown $& Markdown {{missing}}');
assert.equal(fillPrompt('hello {{name}}',{name:'<img onerror=alert(1)>'}),'hello <img onerror=alert(1)>');
assert.deepEqual(parsePromptLibrary('{bad json'),{personal:[],favorites:[]});
assert.deepEqual(parsePromptLibrary({personal:'oops',favorites:['not-found']}),{personal:[],favorites:[]});
const personal=createPersonalTemplate({id:'own_abcd',title:'Custom',category:'Work',description:'Example',body:'# {{topic}}\n{{details}}'});
assert.deepEqual(placeholders(personal.body),['topic','details']);
assert.equal(parsePromptLibrary({personal:[personal],favorites:[personal.id,personal.id,'writing-blog','unknown']}).favorites.length,2);
assert.equal(parsePromptLibrary({personal:[{...personal,title:''}],favorites:[personal.id]}).personal.length,0);
assert.throws(()=>createPersonalTemplate({...personal,category:'Invalid'}));
assert.throws(()=>createPersonalTemplate({...personal,body:'{{x}} '.repeat(4000)}));
assert.throws(()=>createPersonalTemplate({...personal,body:Array.from({length:13},(_,i)=>'{{v'+i+'}}').join(' ')}));

const sqlMatches=searchPromptTemplates(BUILTIN_PROMPTS,{query:'SQL join',category:'Coding'});
assert.ok(sqlMatches.some(x=>x.id==='coding-sql-review'));
assert.equal(searchPromptTemplates(BUILTIN_PROMPTS,{category:'Research'}).length,4);
assert.equal(searchPromptTemplates(BUILTIN_PROMPTS,{category:'Design & UX'}).length,4);
assert.equal(searchPromptTemplates(BUILTIN_PROMPTS,{query:'this-term-cannot-match-anything'}).length,0);
assert.equal(searchPromptTemplates(BUILTIN_PROMPTS,{query:'mock interview'})[0]?.id,'career-mock-interview');
const legacy={personal:[personal],favorites:['writing-blog','coding-review','work-procedure',personal.id]};
assert.deepEqual(parsePromptLibrary(legacy).favorites,legacy.favorites);
const extendedFavorites=BUILTIN_PROMPTS.map(t=>t.id);
assert.equal(parsePromptLibrary({favorites:extendedFavorites}).favorites.length,60);
const newCategoryPersonal=createPersonalTemplate({...personal,id:'own_design01',category:'Design & UX'});
assert.equal(parsePromptLibrary({personal:[newCategoryPersonal]}).personal[0].category,'Design & UX');
console.log('Prompt Library unit tests passed (60 templates, 10 categories)');