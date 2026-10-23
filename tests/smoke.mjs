import assert from 'node:assert/strict';
import {lessonTranslations,LANGUAGES} from '../js/i18n/index.js';
import {lesson,LESSON_CORE} from '../js/data/lessons.js';
import {readFile} from 'node:fs/promises';
assert.equal(LESSON_CORE.length,8);
for(const lang of LANGUAGES){for(let i=0;i<8;i++){
 const data=lesson(i,lang,lessonTranslations);
 assert(data.title&&data.theory&&data.tasks.length,'localized lesson missing content');
 assert(data.tasks.every(t=>t.check(data.hint)),`Solution failed: ${lang} lesson ${i+1}`);
}}
const wrong='### Heading 3';assert(!LESSON_CORE[0].checks[0](wrong));assert(!LESSON_CORE[0].checks[1](wrong));assert(LESSON_CORE[0].checks[2](wrong));
const list='- One\n- Two\n1. Three\n2. Four';assert(LESSON_CORE[2].checks.every(check=>check(list)));
const file=await readFile(new URL('../index.html',import.meta.url),'utf8');assert(file.includes('type="module"'));
console.log('PASS: 8 lessons × 5 languages, solutions, strict headings, 4-item lists, ES module entrypoint');
