import assert from 'node:assert/strict';
import {normalizeDocumentTabs,normalizeActiveDocumentTabs,tabDraftKey,safeTabName,TAB_LIMIT,DOCUMENT_LANGS} from '../js/core/document-tabs.js';

const tab={id:'tab_1234abcd',name:'Research notes.md'};
const normalized=normalizeDocumentTabs({
 en:[tab,tab,{id:'tab_good0001',name:'Second.md'}, {id:'evil',name:'Bad.md'},{id:'tab_good0003',name:'<script>.md'}],
 cs:[{id:'tab_good0002',name:'Český soubor.md'}],
 ru:'not array'
});
assert.equal(normalized.en.length,2);
assert.deepEqual(normalized.en[0],tab);
assert.equal(normalized.cs.length,1);
assert.deepEqual(normalized.ru,[]);
assert.equal(DOCUMENT_LANGS.length,5);
assert.equal(normalizeActiveDocumentTabs({en:'tab_good0001',cs:'missing'},normalized).en,'tab_good0001');
assert.equal(normalizeActiveDocumentTabs({en:'missing'},normalized).en,tab.id);
assert.equal(normalizeActiveDocumentTabs(null,normalized).ru,null);
assert.equal(tabDraftKey('en',tab.id),'sandbox_doc_en_tab_1234abcd');
assert.equal(safeTabName('normal.md'),'normal.md');
assert.equal(safeTabName('../unsafe.md'),null);
assert.equal(safeTabName('with<tags>.md'),null);
assert.equal(safeTabName(''),null);
const many=Array.from({length:30},(_,i)=>({id:'tab_test'+String(i).padStart(5,'0'),name:'Tab '+i+'.md'}));
assert.equal(normalizeDocumentTabs({en:many}).en.length,TAB_LIMIT);
console.log('Sandbox document tab metadata checks passed');
