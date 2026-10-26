import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';

const root=new URL('../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('manifest.json',root),'utf8'));
assert.equal(manifest.display,'standalone');
assert.equal(manifest.start_url,'./');
assert.equal(manifest.scope,'./');
for(const size of [192,512]){
 assert(manifest.icons.some(icon=>icon.sizes===size+'x'+size&&icon.type==='image/png'&&icon.purpose.includes('any')),'Required install icon: '+size);
}
const html=await readFile(new URL('index.html',root),'utf8');
assert.match(html,/rel="manifest"/);
assert.match(html,/id="install-app-btn"/);
assert.match(html,/id="install-app-help"/);
const sw=await readFile(new URL('sw.js',root),'utf8');
assert.match(sw,/addEventListener\('fetch'/);
const multi=await readFile(new URL('js/ui/multi-cursor.js',root),'utf8');
assert.match(multi,/syntaxHighlighting\(markdownSourceHighlightStyle\)/);
assert(!multi.includes('defaultHighlightStyle'),'No typography-changing default Markdown highlight style');
assert.match(multi,/HighlightStyle\.define/);

const browser=new JSDOM('<!DOCTYPE html><button id="install-app-btn"></button><dialog id="install-app-help"><h2 id="install-app-help-title"></h2><p id="install-app-help-intro"></p><ol id="install-app-help-steps"></ol><button id="install-app-help-close"></button></dialog>',{url:'https://example.test/'});
globalThis.window=browser.window;globalThis.document=browser.window.document;
Object.defineProperty(globalThis,'navigator',{configurable:true,value:browser.window.navigator});
const dialog=document.getElementById('install-app-help');
dialog.showModal=()=>{dialog.open=true;};
dialog.close=()=>{dialog.open=false;};
const button=document.getElementById('install-app-btn');
const {initInstallApp,renderInstallAppLanguage}=await import('../js/ui/install-app.js');
initInstallApp(()=> 'ru');
assert.equal(button.textContent,'Установить приложение');
button.click();
assert(dialog.open,'Fallback installation instructions should open');
assert.equal(document.querySelectorAll('#install-app-help-steps li').length,3);
document.getElementById('install-app-help-close').click();
assert(!dialog.open);

let triggered=false;
const event=new browser.window.Event('beforeinstallprompt',{cancelable:true});
event.prompt=async()=>{triggered=true;};
event.userChoice=Promise.resolve({outcome:'accepted'});
window.dispatchEvent(event);
assert(!event.defaultPrevented,'Do not suppress Chrome’s native install promotion');
button.click();
await new Promise(resolve=>setTimeout(resolve,0));
assert(triggered,'Native install should be initiated by the user click');
window.dispatchEvent(new browser.window.Event('appinstalled'));
assert(button.disabled&&button.textContent==='Приложение установлено');
renderInstallAppLanguage('en');
assert.equal(button.textContent,'App installed');
console.log('PASS: PWA metadata, native install promotion, optional in-app installation and fallback.');
