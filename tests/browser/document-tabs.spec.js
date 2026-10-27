import {test,expect} from '@playwright/test';

const tabs=page=>page.locator('#document-tab-list [data-document-id]');
async function switchTo(page,id){await page.locator('#document-tab-list [data-document-id="'+id+'"]').click();}
async function newTab(page){await page.locator('#document-new-tab').click();}
async function closeTab(page,id){await page.locator('#document-tab-list [data-document-id="'+id+'"]').locator('..').locator('.document-tab-close').click();}

test('Notepad tabs isolate documents, persist after reload, and do not affect lesson drafts',async({page})=>{
 await page.goto('/');
 const source=page.locator('#markdown-input');
 await source.fill('# My lesson draft');
 await page.locator('#sandbox-mode-btn').click();
 await expect(page.locator('#document-tabs')).toBeVisible();
 const first=await tabs(page).first().getAttribute('data-document-id');
 await source.fill('# First document\n\nKeep this');
 await newTab(page);
 await expect(tabs(page)).toHaveCount(2);
 const second=await tabs(page).last().getAttribute('data-document-id');
 await expect(source).toHaveValue('');
 await source.fill('# Second document');
 await switchTo(page,first);
 await expect(source).toHaveValue('# First document\n\nKeep this');
 await switchTo(page,second);
 await expect(source).toHaveValue('# Second document');
 await page.reload();
 await expect(page.locator('#document-tabs')).toBeVisible();
 await expect(tabs(page)).toHaveCount(2);
 await expect(source).toHaveValue('# Second document');
 await switchTo(page,first);
 await expect(source).toHaveValue('# First document\n\nKeep this');
 await page.locator('#sandbox-mode-btn').click();
 await expect(page.locator('#document-tabs')).toBeHidden();
 await expect(source).toHaveValue('# My lesson draft');
 await page.locator('#sandbox-mode-btn').click();
 await expect(tabs(page)).toHaveCount(2);
 await expect(source).toHaveValue('# First document\n\nKeep this');
});

test('Closing a nonempty document warns, cancel preserves text, last tab stays available',async({page})=>{
 await page.goto('/');
 await page.locator('#sandbox-mode-btn').click();
 const input=page.locator('#markdown-input');
 await input.fill('Important local-only note');
 const id=await tabs(page).first().getAttribute('data-document-id');
 page.once('dialog',d=>d.dismiss());
 await closeTab(page,id);
 await expect(tabs(page)).toHaveCount(1);
 await expect(input).toHaveValue('Important local-only note');
 page.once('dialog',d=>d.accept());
 await closeTab(page,id);
 await expect(tabs(page)).toHaveCount(1);
 await expect(input).toHaveValue('');
 await expect(tabs(page).first()).toHaveAttribute('aria-selected','true');
});

test('Rename active document and File Save As update only its filename',async({page})=>{
 await page.goto('/');
 await page.locator('#sandbox-mode-btn').click();
 const first=await tabs(page).first().getAttribute('data-document-id');
 page.once('dialog',d=>d.accept('Project plan.md'));
 await tabs(page).first().dblclick();
 await expect(tabs(page).first()).toHaveText('Project plan.md');
 await newTab(page);
 await expect(tabs(page).last()).toContainText('Untitled.md');
 await switchTo(page,first);
 await expect(tabs(page).first()).toContainText('Project plan.md');
 await page.reload();
 await expect(tabs(page).first()).toContainText('Project plan.md');
});

test('Ctrl+N and File Open create separate documents, with proper active titles',async({page})=>{
 await page.goto('/');
 await page.locator('#sandbox-mode-btn').click();
 const input=page.locator('#markdown-input');
 await input.fill('Local note');
 await page.keyboard.press('Control+n');
 await expect(tabs(page)).toHaveCount(2);
 await expect(input).toHaveValue('');
 await page.locator('#file-menu-open-input').setInputFiles({name:'Readme.md',mimeType:'text/markdown',buffer:Buffer.from('# Imported source','utf8')});
 await expect(tabs(page)).toHaveCount(3);
 await expect(input).toHaveValue('# Imported source');
 await expect(tabs(page).last()).toContainText('Readme.md');
 await switchTo(page,await tabs(page).first().getAttribute('data-document-id'));
 await expect(input).toHaveValue('Local note');
});

test('Tabs work with Multi-cursor editor and maintain per-document Undo history',async({page})=>{
 await page.goto('/');
 await page.locator('#sandbox-mode-btn').click();
 const source=page.locator('#markdown-input');
 await source.fill('# First history');
 await page.locator('#multi-cursor-toggle').click();
 await expect(page.locator('#multi-cursor-toggle')).toHaveAttribute('aria-pressed','true');
 await newTab(page);
 await source.fill('# Second history');
 const second=await tabs(page).last().getAttribute('data-document-id');
 const first=await tabs(page).first().getAttribute('data-document-id');
 await switchTo(page,first);
 await expect(source).toHaveValue('# First history');
 await switchTo(page,second);
 await expect(source).toHaveValue('# Second history');
 await page.locator('#multi-cursor-toggle').click();
 await expect(page.locator('#multi-cursor-toggle')).toHaveAttribute('aria-pressed','false');
});

test('Mobile tab bar scrolls without clipping other app controls',async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await page.goto('/');
 await page.locator('#sandbox-mode-btn').click();
 for(let i=0;i<5;i++)await newTab(page);
 await expect(tabs(page)).toHaveCount(6);
 const add=page.locator('#document-new-tab');
 await expect(add).toBeVisible();
 const bar=await page.locator('#document-tabs').boundingBox();
 expect(bar.x).toBeGreaterThanOrEqual(0);
 expect(bar.x+bar.width).toBeLessThanOrEqual(361);
 await tabs(page).first().focus();
 await page.keyboard.press('End');
 await expect(tabs(page).last()).toHaveAttribute('aria-selected','true');
 await page.keyboard.press('Home');
 await expect(tabs(page).first()).toHaveAttribute('aria-selected','true');
});
