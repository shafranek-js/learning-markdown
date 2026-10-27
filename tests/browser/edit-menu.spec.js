import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';
const menu=page=>page.locator('#edit-menu');
const action=(page,name)=>page.locator('#edit-menu [data-edit-action="'+name+'"]');
async function choose(page,name){
 await page.locator('#edit-menu-trigger').click();
 await action(page,name).click();
}

test('Edit: source Find, next/previous, replace and single Undo preserve Markdown',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('# Alpha\n\n**alpha**\n\nThird alpha');
 await input.focus();
 await page.keyboard.press('Control+f');
 await expect(page.locator('#edit-find-panel')).toBeVisible();
 await page.locator('#edit-find-input').fill('alpha');
 await expect(page.locator('#edit-find-count')).toContainText('3');
 await page.locator('#edit-find-next').click();
 let text=await input.evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd));
 expect(text.toLowerCase()).toBe('alpha');
 await page.locator('#edit-find-prev').click();
 text=await input.evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd));
 expect(text.toLowerCase()).toBe('alpha');
 await page.locator('#edit-find-close').click();
 await choose(page,'replace');
 await expect(page.locator('#edit-replace-row')).toBeVisible();
 await page.locator('#edit-find-input').fill('alpha');
 await page.locator('#edit-replace-input').fill('Beta');
 await page.locator('#edit-replace-all').click();
 await expect(input).toHaveValue('# Beta\n\n**Beta**\n\nThird Beta');
 await choose(page,'undo');
 await expect(input).toHaveValue('# Alpha\n\n**alpha**\n\nThird alpha');
 await choose(page,'redo');
 await expect(input).toHaveValue('# Beta\n\n**Beta**\n\nThird Beta');
});

test('Edit: literal regex characters, case match and replacement dollars are safe',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('**a+b** and a+b\nAlpha alpha');
 await choose(page,'replace');
 await page.locator('#edit-find-input').fill('a+b');
 await page.locator('#edit-replace-input').fill('$&');
 await expect(page.locator('#edit-find-count')).toContainText('2');
 await page.locator('#edit-replace-all').click();
 await expect(input).toHaveValue('**$&** and $&\nAlpha alpha');
 await page.locator('#edit-find-input').fill('alpha');
 await page.locator('#edit-find-match-case').check();
 await expect(page.locator('#edit-find-count')).toContainText('1');
});

test('Edit: Select All and Multi-cursor operate on the current source document',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='First line\nSecond line';
 await input.fill(source);
 await choose(page,'select-all');
 expect(await input.evaluate(e=>e.selectionStart)).toBe(0);
 expect(await input.evaluate(e=>e.selectionEnd)).toBe(source.length);
 await choose(page,'multi-cursor');
 await expect(page.locator('#multi-cursor-toggle')).toHaveAttribute('aria-pressed','true');
 await choose(page,'select-all');
 await expect(page.locator('#codemirror-mount .cm-selectionBackground').first()).toBeAttached();
 await choose(page,'replace');
 await page.locator('#edit-find-input').fill('line');
 await page.locator('#edit-replace-input').fill('item');
 await page.locator('#edit-replace-all').click();
 await expect(input).toHaveValue('First item\nSecond item');
 await choose(page,'undo');
 await expect(input).toHaveValue(source);
 await choose(page,'multi-cursor');
 await expect(page.locator('#multi-cursor-toggle')).toHaveAttribute('aria-pressed','false');
 await expect(input).toHaveValue(source);
});

test('Edit keyboard menu and localized labels are accessible on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const trigger=page.locator('#edit-menu-trigger');
 await trigger.focus();
 await page.keyboard.press('ArrowDown');
 await expect(menu(page)).toBeVisible();
 await expect(action(page,'find')).toBeFocused();
 await page.keyboard.press('End');
 await expect(action(page,'multi-cursor')).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(trigger).toBeFocused();
 for(const [lang,label] of [['en','Edit'],['cs','Úpravy'],['uk','Редагування'],['ro','Editare'],['ru','Правка']]){
  await setAppLanguage(page,lang);
  await expect(trigger).toHaveText(label);
  await trigger.click();
  await expect(action(page,'replace')).not.toBeEmpty();
  await page.keyboard.press('Escape');
 }
 await page.locator('#markdown-input').focus();
 await page.keyboard.press('Control+h');
 await expect(page.locator('#edit-replace-row')).toBeVisible();
 const r=await page.locator('#edit-find-panel').boundingBox();
 expect(r.x).toBeGreaterThanOrEqual(0);
 expect(r.x+r.width).toBeLessThanOrEqual(390);
 await page.keyboard.press('Escape');
 await expect(page.locator('#edit-find-panel')).toBeHidden();
});
