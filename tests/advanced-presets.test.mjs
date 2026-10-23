import assert from 'node:assert/strict';
import {ADVANCED_PRESETS,ADVANCED_ALLOWED_CLASSES,presetClass,filterAdvancedClasses} from '../js/core/advanced-presets.js';
assert.equal(Object.keys(ADVANCED_PRESETS).length,7);
for(const [key,values] of Object.entries(ADVANCED_PRESETS)){
 for(const value of values)assert(ADVANCED_ALLOWED_CLASSES.has(presetClass(key,value)));
}
assert.equal(presetClass('color','javascript:alert(1)'),null);
assert.equal(presetClass('style','x'),null);
assert.equal(filterAdvancedClasses('af-color-blue foo af-page-break af-color-blue'), 'af-color-blue af-page-break');
assert.equal(filterAdvancedClasses('onclick=evil af-background-yellow style=color:red'),'af-background-yellow');
console.log('PASS: advanced CSS presets and class allowlist');
