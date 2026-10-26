import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const {version}=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
const config=(await import('../vite.config.js')).default;
const html=await readFile(new URL('index.html',root),'utf8');
const app=await readFile(new URL('js/app.js',root),'utf8');

assert.equal(JSON.parse(config.define.__APP_VERSION__),version,'Version must come from package.json');
assert.match(JSON.parse(config.define.__APP_REVISION__),/^(?:local|[a-f0-9]{7,40})$/,'Build revision must be a verified Git hash or local');
assert.match(html,/<footer[\s\S]*id="app-version-status"/,'The version must appear in the persistent footer');
assert.match(html,/id="app-version-status"[^>]*aria-label=/,'The version is accessible to screen readers');
assert.match(app,/function renderBuildVersion\(/);
assert.match(app,/renderLocalization\(\)\{[^\n]*renderBuildVersion\(\)/,'Version label must update when the language changes');
console.log('Visible app version and embedded revision checks passed.');
