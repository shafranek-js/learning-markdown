import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {lessonTranslations,LANGUAGES} from '../js/i18n/index.js';
import {lesson,LESSON_CORE} from '../js/data/lessons.js';
import {verifyLesson} from '../js/core/validator.js';
import {cheats,titles} from '../js/data/cheatsheet.js';
import {ADVANCED_EXAMPLES,advancedLabels} from '../js/ui/advanced.js';
import {PRACTICE_DRILLS,PRACTICE_UI,evaluatePractice,practiceForLesson} from '../js/data/deep-practice.js';

// CommonMark/GFM switch must change the actual rendered HTML, not just a label.
globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
globalThis.window={DOMPurify:{sanitize:html=>html}};
const {markdownToHTML,DIALECT_OPTIONS}=await import('../js/ui/preview.js');
assert.deepEqual(Object.keys(DIALECT_OPTIONS),['gfm','commonmark','original']);
const parse=(text,dialect)=>markdownToHTML(text,dialect);
const heading='# One\n## Two\n### Three\n#### Four\n##### Five\n###### Six';
for(const dialect of Object.keys(DIALECT_OPTIONS)){
 const html=parse(heading,dialect);
 for(let h=1;h<=6;h++)assert(html.includes('<h'+h),dialect+' should support H'+h);
 assert(parse('Title\n=====\n\nSection\n-------',dialect).includes('<h2'));
 assert(parse('Two paragraphs.\n\nSecond paragraph.',dialect).match(/<p>/g).length===2);
 assert(parse('**bold** and *italic*',dialect).includes('<strong>bold</strong>'));
 assert(parse('> A quotation',dialect).includes('<blockquote>'));
 assert(parse('- First\n- Second',dialect).includes('<ul>'));
 assert(parse('1. Step one\n2. Step two',dialect).includes('<ol>'));
 assert(parse('Type \`npm run build\`',dialect).includes('<code>npm run build</code>'));
 assert(parse('    const answer = 42;',dialect).includes('<pre>'));
 assert(parse('***',dialect).includes('<hr'));
 assert(parse('![Alt](https://example.com/image.png "Picture")',dialect).includes('<img '));
 assert(parse('<em>HTML</em>',dialect).includes('<em>HTML</em>'));
 assert(parse('***strong italic***',dialect).includes('<strong>'));

 assert(parse('First line  \nSecond line',dialect).includes('<br'));
 assert(parse('Read [the spec][spec].\n\n[spec]: https://spec.commonmark.org/',dialect).includes('<a '));
 assert(parse('Backslash: \\*literal\\*',dialect).includes('*literal*'));
}
const extensions='|A|B|\n|---|---|\n|1|2|\n\n~~deleted~~\n\n- [x] done\n- [ ] open';
assert(parse(extensions,'gfm').includes('<table>'));
assert(parse(extensions,'gfm').includes('<del>'));
assert(parse(extensions,'gfm').includes('type="checkbox"'));
for(const dialect of ['commonmark','original']){
 assert(!parse(extensions,dialect).includes('<table>'));
 assert(!parse(extensions,dialect).includes('<del>'));
 assert(!parse(extensions,dialect).includes('type="checkbox"'));
}
assert(!parse('soft\nline','gfm').includes('<br')); // Strict GFM file, not comment-style breaks.
assert.equal(LESSON_CORE.length,8);
for(const lang of LANGUAGES){
 assert.equal(titles[lang].length,cheats.length,'Cheat sheet translations incomplete: '+lang);
 for(let i=0;i<8;i++){
  const data=lesson(i,lang,lessonTranslations);
  assert(data.title&&data.theory&&data.tasks.length,'localized lesson missing content');
  assert(data.tasks.every(t=>t.check(data.hint)),'Solution failed: '+lang+' lesson '+(i+1));
 }
 const first=lesson(0,lang,lessonTranslations);
 assert.equal(first.tasks.length,6);
 assert(first.initial.includes('######'), 'H6 missing from first-lesson instructions: '+lang);
 assert(first.tasks.every(t=>t.check(first.hint)),'Missing localized heading solution: '+lang);
}
const wrong='### Heading 3';
assert(!LESSON_CORE[0].checks[0](wrong));
assert(!LESSON_CORE[0].checks[1](wrong));
assert(LESSON_CORE[0].checks[2](wrong));
assert(!LESSON_CORE[0].checks[3](wrong));
const list='- One\n- Two\n1. Three\n2. Four';
assert(LESSON_CORE[2].checks.every(check=>check(list)));
const strike=lesson(1,'en',lessonTranslations);
assert(verifyLesson(strike,strike.hint,'gfm').every(t=>t.passed));
assert(!verifyLesson(strike,strike.hint,'commonmark')[2].passed);
const table=lesson(6,'en',lessonTranslations);
assert(verifyLesson(table,table.hint,'gfm').every(t=>t.passed));
assert(!verifyLesson(table,table.hint,'original').some(t=>t.passed));
assert.equal(PRACTICE_DRILLS.length,16);
assert.equal(ADVANCED_EXAMPLES.length,5);
for(const lang of LANGUAGES)assert.equal(advancedLabels(lang).actions.length,5);
for(const tag of ['u','sup','sub','mark','details','summary'])assert((await readFile(new URL('../js/core/sanitize.js',import.meta.url),'utf8')).includes(tag));
for(const lang of LANGUAGES)assert(PRACTICE_UI[lang]?.title,'Practice UI not localized for '+lang);
for(let i=1;i<=8;i++)assert.equal(practiceForLesson(i).length,2);
for(const drill of PRACTICE_DRILLS){
 assert(drill.code&&LANGUAGES.every(l=>drill.labels[l]));
 for(const dialect of ['gfm','commonmark']){
  const results=evaluatePractice(drill.lesson,drill.code,parse(drill.code,dialect));
  assert(results.find(x=>x.id===drill.id)?.passed,drill.id+' sample failed in '+dialect);
 }
}
for(let lessonId=1;lessonId<=8;lessonId++){
 assert(!evaluatePractice(lessonId,'\`\`\`md\\n# Sample\\n\`\`\`','<pre><code># Sample</code></pre>').some(d=>d.passed),'Do not credit unrelated fenced code');
}
const appSource=await readFile(new URL('../js/app.js',import.meta.url),'utf8');
const modalSource=await readFile(new URL('../js/ui/modals.js',import.meta.url),'utf8');
assert(!appSource.includes("ex.label+'  +'"),'Ambiguous plus suffix must not return');
assert(!modalSource.includes("'↳ +'"),'Ambiguous plus action must not return');
assert(appSource.includes("setAttribute('aria-label',t(state.lang,'insert')"),'Snippet action must have a localized accessible label');
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
assert(html.includes('id="deep-practice"'));
for(let h=1;h<=6;h++)assert(html.includes('data-action="h'+h+'"'));
assert(html.includes('id="dialect-selector"'));
assert(html.includes('id="active-dialect-status"'));
console.log('PASS: three dialects, six heading levels, 8 lessons x 5 languages, GFM extensions, 21 syntax examples');
