import {toggleSandbox} from './support/help-actions.js';
import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';
const help=page=>page.locator('#help-menu-trigger');
const action=(page,name)=>page.locator('#help-menu [data-help-action="'+name+'"]');
async function choose(page,name){await help(page).click();await action(page,name).click();}

test('Help links to the existing Cheat Sheet without duplicating its logic',async({page})=>{
 await page.goto('/');
 await choose(page,'cheats');
 await expect(page.locator('#cheatsheet-modal')).toBeVisible();
 await expect(page.locator('#markdown-input')).not.toHaveValue('');
});

test('Help Shortcuts is accessible, translated, dismissible and leaves Markdown untouched',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 const source='# Keep **Markdown** unchanged';
 await editor.fill(source);
 await choose(page,'shortcuts');
 await expect(page.locator('#help-info-dialog')).toBeVisible();
 await expect(page.locator('#help-info-content')).toContainText('Ctrl+F');
 await expect(page.locator('#help-info-content')).toContainText('Ctrl+S');
 await page.keyboard.press('Escape');
 await expect(page.locator('#help-info-dialog')).toBeHidden();
 await expect(help(page)).toBeFocused();
 await expect(editor).toHaveValue(source);
 for(const [lang,title] of [['en','Help'],['cs','Nápověda'],['uk','Довідка'],['ro','Ajutor'],['ru','Справка']]){
  await setAppLanguage(page,lang);
  await expect(help(page)).toHaveText(title);
  await choose(page,'shortcuts');
  await expect(page.locator('#help-info-title')).not.toBeEmpty();
  await page.locator('#help-info-close').click();
 }
});

test('Help About displays actual running build and repository link',async({page})=>{
 await page.goto('/');
 const version=(await page.locator('#app-version-status').innerText()).trim();
 await choose(page,'about');
 await expect(page.locator('#help-info-content')).toContainText(version);
 await expect(page.locator('#help-info-content a')).toHaveAttribute('href','https://github.com/shafranek-js/learning-markdown');
});

test('Help course action restores course access from Sandbox',async({page})=>{
 await page.goto('/');
 await toggleSandbox(page);
 await page.locator('#markdown-input').fill('# My Sandbox note');
 await choose(page,'guide');
 await expect(page.locator('#contents-drawer')).not.toHaveClass(/-translate-x-full/);
 await expect(page.locator('#theory-panel')).toBeVisible();
 await page.locator('#close-contents-btn').click();
 await toggleSandbox(page);
 await expect(page.locator('#markdown-input')).toHaveValue('# My Sandbox note');
});

test('Help menu fits on narrow screens and supports standard keyboard navigation',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const trigger=help(page);
 await trigger.focus();
 await page.keyboard.press('ArrowDown');
 await expect(action(page,'guide')).toBeFocused();
 await page.keyboard.press('End');
 await expect(action(page,'about')).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(trigger).toBeFocused();
 await choose(page,'shortcuts');
 const rect=await page.locator('#help-info-dialog .workspace-help-surface').boundingBox();
 expect(rect.x).toBeGreaterThanOrEqual(0);
 expect(rect.x+rect.width).toBeLessThanOrEqual(390);
});

test('Mobile header retains access to all four menus and right-side actions',async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await page.goto('/');
 for(const type of ['file','edit','view','help']){
  const trigger=page.locator('#'+type+'-menu-trigger');
  await trigger.scrollIntoViewIfNeeded();
  const rect=await trigger.boundingBox();
  expect(rect.x).toBeGreaterThanOrEqual(-1);
  expect(rect.x+rect.width).toBeLessThanOrEqual(361);
  await trigger.click();
  await expect(page.locator('#'+type+'-menu')).toBeVisible();
  await page.keyboard.press('Escape');
 }
 const actions=await page.locator('.app-header-actions').boundingBox();
 expect(actions.x).toBeGreaterThanOrEqual(0);
 expect(actions.x+actions.width).toBeLessThanOrEqual(361);
 await help(page).click();
 for(const item of ['sandbox','library','cheats'])await expect(action(page,item)).toBeVisible();
 await expect(page.locator('.app-header-actions #sandbox-mode-btn')).toHaveCount(0);
 await expect(page.locator('.app-header-actions #prompt-library-trigger')).toHaveCount(0);
 await expect(page.locator('.app-header-actions #cheatsheet-btn')).toHaveCount(0);
});

test('Workspace tools in Help open their original functions and restore focus',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.app-header-actions #sandbox-mode-btn')).toHaveCount(0);
 await expect(page.locator('.app-header-actions #prompt-library-trigger')).toHaveCount(0);
 await expect(page.locator('.app-header-actions #cheatsheet-btn')).toHaveCount(0);
 await choose(page,'library');
 await expect(page.locator('#prompt-library-dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('#prompt-library-dialog')).toBeHidden();
 await expect(help(page)).toBeFocused();
 await choose(page,'cheats');
 await expect(page.locator('#cheatsheet-modal')).toBeVisible();
 await page.locator('#close-cheatsheet-btn').click();
 await choose(page,'sandbox');
 await expect(page.locator('#document-tabs')).toBeVisible();
 await choose(page,'sandbox');
 await expect(page.locator('#document-tabs')).toBeHidden();
});

test('All moved actions are localized in Help without duplicates',async({page})=>{
 await page.goto('/');
 for(const lang of ['en','cs','uk','ro','ru']){
  await setAppLanguage(page,lang);
  await help(page).click();
  for(const key of ['sandbox','library','cheats']){
   await expect(action(page,key)).toBeVisible();
   await expect(action(page,key)).not.toBeEmpty();
  }
  await expect(action(page,'cheats')).toHaveCount(1);
  await page.keyboard.press('Escape');
 }
});
