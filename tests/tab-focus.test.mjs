import assert from 'node:assert/strict';
import {tabFocusLabels} from '../js/ui/tab-focus-i18n.js';

for(const lang of ['en','cs','uk','ro','ru']){
 const value=tabFocusLabels(lang);
 for(const field of ['edit','focus','editHelp','focusHelp'])
  assert.equal(typeof value[field],'string',lang+':'+field);
 assert(value.edit.includes('Tab')&&value.focus.includes('Tab'));
 assert(value.editHelp.includes('Ctrl+M'));
 assert(value.focusHelp.includes('Ctrl+M'));
 assert.notEqual(value.edit,value.focus);
 assert.notEqual(value.editHelp,value.focusHelp);
}
assert.deepEqual(tabFocusLabels('invalid'),tabFocusLabels('en'));
console.log('Tab focus navigation labels: five languages and fallback passed');
