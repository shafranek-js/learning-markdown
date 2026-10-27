import assert from 'node:assert/strict';
import {BUILTIN_PROMPTS,PROMPT_CATEGORIES,placeholders,fillPrompt,parsePromptLibrary,createPersonalTemplate} from '../js/core/prompt-library.js';

assert.equal(BUILTIN_PROMPTS.length,20);
for(const category of PROMPT_CATEGORIES)assert.equal(BUILTIN_PROMPTS.filter(x=>x.category===category).length,4);
assert.equal(new Set(BUILTIN_PROMPTS.map(x=>x.id)).size,20);
for(const item of BUILTIN_PROMPTS){
 assert.ok(item.title&&item.description&&item.tip);
 assert.ok(placeholders(item.body).length>0);
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
console.log('Prompt Library unit tests passed');