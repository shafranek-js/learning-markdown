import assert from 'node:assert/strict';
import {sourceMatches,nextSourceMatch,replaceAllSourceMatches,selectedSourceMatches} from '../js/core/source-find-replace.js';

assert.deepEqual(sourceMatches('Alpha alpha ALPHA','alpha').map(m=>m.from),[0,6,12]);
assert.deepEqual(sourceMatches('Alpha alpha ALPHA','alpha',{matchCase:true}).map(m=>m.from),[6]);
assert.deepEqual(sourceMatches('**a+b** and a+b','a+b').map(m=>m.from),[2,12]);
assert.deepEqual(sourceMatches('Text with [link] and [link]','[link]').map(m=>m.from),[10,21]);
assert.deepEqual(sourceMatches('Whatever',''),[]);
assert.deepEqual(nextSourceMatch('test test','test',5),{from:5,to:9});
assert.deepEqual(nextSourceMatch('test test','test',9),{from:0,to:4});
assert.deepEqual(nextSourceMatch('test test','test',0,{backward:true}),{from:5,to:9});
assert.deepEqual(nextSourceMatch('test test','test',5,{backward:true}),{from:0,to:4});
assert.deepEqual(replaceAllSourceMatches('a+b a+b','a+b','$&'),{text:'$& $&',count:2});
assert.deepEqual(replaceAllSourceMatches('# Alpha\n\n**alpha**','alpha','beta'),{text:'# beta\n\n**beta**',count:2});
assert.deepEqual(replaceAllSourceMatches('abc','', 'x'),{text:'abc',count:0});
assert.ok(selectedSourceMatches('Hello',0,5,'hello'));
assert.ok(!selectedSourceMatches('Hello',0,5,'hello',{matchCase:true}));
console.log('Source Find/Replace checks passed');
