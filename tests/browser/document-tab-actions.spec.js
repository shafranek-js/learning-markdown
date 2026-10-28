import {test,expect} from '@playwright/test';

const tabButtons=page=>page.locator('#document-tab-list [data-document-id]');
const tabItems=page=>page.locator('.document-tab-item');
const menu=page=>page.locator('#document-tab-actions');
async function start(page){await page.goto('/');await page.locator('#sandbox-mode-btn').click();}
async function actions(page,index=0){await tabItems(page).nth(index).locator('.document-tab-more').click();await expect(menu(page)).toBeVisible();}
async function choose(page,action){await menu(page).locator('[data-tab-action="'+action+'"]').click();}

test('Duplicate tab copies source and compatibility options, then diverges safely',async({page})=>{
 await start(page);
 const input=page.locator('#markdown-input');
 await input.fill('First line\nSecond line');
 await page.locator('#compatibility-trigger').click();
 await page.locator('#extension-softbreaks-toggle').selectOption('on');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
 const first=await tabButtons(page).first().getAttribute('data-document-id');
 await actions(page);
 await choose(page,'duplicate');
 await expect(tabButtons(page)).toHaveCount(2);
 const second=await tabButtons(page).last().getAttribute('data-document-id');
 expect(second).not.toBe(first);
 await expect(tabButtons(page).last()).toContainText('copy');
 await expect(input).toHaveValue('First line\nSecond line');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
 await input.fill('Updated new document');
 // Switching documents closes the floating Compatibility panel by design.
 if(!(await page.locator('#compatibility-panel').evaluate(panel=>panel.open)))
  await page.locator('#compatibility-trigger').click();
 await page.locator('#extension-softbreaks-toggle').selectOption('off');
 await page.locator('#document-tab-list [data-document-id="'+first+'"]').click();
 await expect(input).toHaveValue('First line\nSecond line');
 await expect(page.locator('#extension-softbreaks-toggle')).toHaveValue('on');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
 await page.reload();
 await expect(tabButtons(page)).toHaveCount(2);
 await expect(input).toHaveValue('First line\nSecond line');
 await page.locator('#document-tab-list [data-document-id="'+second+'"]').click();
 await expect(input).toHaveValue('Updated new document');
 await expect(page.locator('#extension-softbreaks-toggle')).toHaveValue('off');
});

test('F2 renames a focused tab without losing keyboard focus',async({page})=>{
 await start(page);
 const tab=tabButtons(page).first();
 await tab.focus();
 page.once('dialog',dialog=>dialog.accept('Meeting Notes'));
 await page.keyboard.press('F2');
 await expect(tabButtons(page).first()).toContainText('Meeting Notes.md');
 await expect(tabButtons(page).first()).toBeFocused();
 await expect(page.locator('#file-menu-current')).toHaveText('Meeting Notes.md');
});

test('Tab actions support keyboard, Escape focus restoration and guarded close',async({page})=>{
 await start(page);
 const input=page.locator('#markdown-input');
 await input.fill('# Keep this document');
 await tabButtons(page).first().focus();
 await page.keyboard.press('Shift+F10');
 await expect(menu(page)).toBeVisible();
 await expect(menu(page).locator('[role="menuitem"]').first()).toBeFocused();
 await page.keyboard.press('End');
 await expect(menu(page).locator('[data-tab-action="close"]')).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(menu(page)).toBeHidden();
 await expect(tabButtons(page).first()).toBeFocused();
 await actions(page);
 page.once('dialog',dialog=>dialog.dismiss());
 await choose(page,'close');
 await expect(tabButtons(page)).toHaveCount(1);
 await expect(input).toHaveValue('# Keep this document');
 await actions(page);
 page.once('dialog',dialog=>dialog.accept());
 await choose(page,'close');
 await expect(tabButtons(page)).toHaveCount(1);
 await expect(input).toHaveValue('');
});

test('Actions work on mobile and duplication respects 20-tab limit',async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await start(page);
 await actions(page);
 const rect=await menu(page).boundingBox();
 expect(rect.x).toBeGreaterThanOrEqual(0);
 expect(rect.x+rect.width).toBeLessThanOrEqual(361);
 await choose(page,'duplicate');
 await expect(tabButtons(page)).toHaveCount(2);
 for(let i=2;i<20;i++)await page.locator('#document-new-tab').click();
 await expect(tabButtons(page)).toHaveCount(20);
 await actions(page);
 await expect(menu(page).locator('[data-tab-action="duplicate"]')).toBeDisabled();
 await page.keyboard.press('Escape');
 await expect(menu(page)).toBeHidden();
 await expect(page.locator('#document-new-tab')).toBeDisabled();
});

test('Context menu can rename an inactive tab without overwriting the active document',async({page})=>{
 await start(page);
 await page.locator('#markdown-input').fill('Original note');
 await page.locator('#document-new-tab').click();
 await page.locator('#markdown-input').fill('Second note');
 await tabButtons(page).first().click({button:'right'});
 await expect(menu(page)).toBeVisible();
 page.once('dialog',dialog=>dialog.accept('Renamed original.md'));
 await choose(page,'rename');
 await expect(tabButtons(page).first()).toContainText('Renamed original.md');
 await expect(page.locator('#markdown-input')).toHaveValue('Second note');
});
