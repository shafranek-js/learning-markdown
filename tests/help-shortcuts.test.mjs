import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {HELP_SHORTCUT_SECTIONS,HELP_SHORTCUT_TEXT,helpShortcutSections} from '../js/ui/help-shortcuts.js';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const sources=await Promise.all([
 read('js/ui/file-menu.js'),read('js/ui/edit-menu.js'),
 read('js/ui/toolbar.js'),read('js/ui/editor.js'),
 read('js/ui/multi-cursor.js'),read('js/ui/document-tabs.js'),
 read('js/ui/table-list-keyboard.js'),read('js/ui/table-editor.js'),
 read('js/ui/help-menu.js'),read('index.html')
]);
const [file,edit,toolbar,editor,multi,tabs,tableKeys,tableUI,help,markup]=sources;
const sections=helpShortcutSections('en');
assert.deepEqual(sections.map(section=>section.id),
 ['files','editing','source','multi','tabs','search','tables','menus']);
assert.equal(sections.reduce((n,section)=>n+section.rows.length,0),43,
 'every app-specific shortcut / keyboard gesture should have its own row');
const ids=sections.flatMap(section=>section.rows.map(row=>row.id));
assert.equal(new Set(ids).size,ids.length,'help shortcut ids are unique');
for(const lang of ['en','cs','uk','ro','ru']){
 const text=HELP_SHORTCUT_TEXT[lang];
 assert(text?.note?.trim()&&text.os.trim(),'scope/OS help must be translated for '+lang);
 const entries=helpShortcutSections(lang);
 assert.deepEqual(entries.map(section=>section.id),sections.map(section=>section.id));
 for(let i=0;i<entries.length;i++){
  const actual=entries[i],expected=HELP_SHORTCUT_SECTIONS[i];
  assert(text[actual.id]?.title?.trim(),'missing group title '+lang+'/'+actual.id);
  assert(text[actual.id]?.hint?.trim(),'missing group context '+lang+'/'+actual.id);
  assert.equal(text[actual.id].rows.length,expected.rows.length,
   'labels out of sync: '+lang+'/'+actual.id);
  for(const row of actual.rows){
   assert(row.label?.trim(),'missing localized label '+lang+'/'+row.id);
   assert(row.keys.length&&row.keys.every(key=>key.trim()),'missing key '+row.id);
  }
 }
}
const find=(section,id)=>sections.find(item=>item.id===section)?.rows
 .find(row=>row.id===section+'-'+id);
const hasKey=(section,id,key)=>assert(find(section,id)?.keys.includes(key),
 'missing keyboard help: '+section+'/'+id+' '+key);
// The list must cover all explicitly owned app keyboard bindings rather than
// just those that happened to be included in the old 10-row Help menu.
for(const [code,action,chord] of [
 ['KeyN','new','Ctrl+N'],['KeyO','open','Ctrl+O'],
 ['KeyS','save','Ctrl+S'],['KeyP','print','Ctrl+P']
]){
 assert(file.includes("event.code==='"+code+"'"));
 hasKey('files',action,chord);
}
for(const [code,action,chord] of [
 ['KeyF','find','Ctrl+F'],['KeyH','replace','Ctrl+H']
]){
 assert(edit.includes("event.code==='"+code+"'"));
 hasKey('editing',action,chord);
}
for(const [code,action,chord] of [
 ['KeyB','bold','Ctrl+B'],['KeyI','italic','Ctrl+I'],
 ['KeyK','link','Ctrl+K']
]){
 assert(toolbar.includes(code+":'"+action+"'"));
 hasKey('editing',action,chord);
}
for(let n=1;n<=6;n++)assert(toolbar.includes("Digit"+n+":'h"+n+"'"),
 'a heading binding is undocumented or removed');
assert(find('editing','heading').keys[0].includes('Ctrl+1'));
assert(find('editing','heading').keys[0].includes('Ctrl+6'));
assert(editor.includes("e.code==='KeyZ'")&&editor.includes("e.code==='KeyY'"));
hasKey('editing','undo','Ctrl+Z');
hasKey('editing','redo','Ctrl+Y');
hasKey('editing','redo','Ctrl+Shift+Z');
assert(markup.includes('data-edit-action="select-all"')&&markup.includes('<kbd>Ctrl+A</kbd>'));
hasKey('editing','select-all','Ctrl+A');
assert(editor.includes("e.code==='KeyM'")&&multi.includes("key:'Ctrl-m'"));
hasKey('source','focus-mode','Ctrl+M');
for(const [implementation,action,chord] of [
 ["key:'Mod-d'",'next','Ctrl+D'],
 ["key:'Mod-Shift-l'",'all','Ctrl+Shift+L'],
 ["key:'Shift-Alt-i'",'line-ends','Shift+Alt+I'],
 ["key:'Mod-Alt-ArrowUp'",'above','Ctrl+Alt+↑'],
 ["key:'Mod-Alt-ArrowDown'",'below','Ctrl+Alt+↓'],
 ["key:'Escape'",'collapse','Esc']
]){
 assert(multi.includes(implementation));
 hasKey('multi',action,chord);
}
assert(multi.includes('event.altKey&&!event.shiftKey'));
assert(multi.includes('event.altKey&&event.shiftKey'));
hasKey('multi','add-click','Alt+Click');
hasKey('multi','column','Alt+Shift+Drag');
assert(tabs.includes("event.key==='F2'"));
assert(tabs.includes("event.shiftKey&&event.key==='F10'"));
hasKey('tabs','rename','F2');
hasKey('tabs','actions','Shift+F10');
assert(edit.includes("navigate(event.shiftKey)"));
hasKey('search','next','Enter');
hasKey('search','previous','Shift+Enter');
for(const key of ['Tab','Enter','Backspace'])assert(tableKeys.includes("event.key==='"+key+"'"));
assert(tableUI.includes("e.key==='Enter'||e.key===' '"));
hasKey('tables','backspace','Backspace');
assert(help.includes('helpShortcutSections(state.lang)'));
assert(!help.includes('const shortcuts=['),'Help must not retain the obsolete 10-row list');
console.log('PASS: 43 actual keyboard bindings/gestures, 8 groups, 5 locales, implementation evidence');
