import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';

const fileTrigger=page=>page.locator('#file-menu-trigger');
const fileMenu=page=>page.locator('#file-menu');
const action=(page,name)=>page.locator('#file-menu [data-file-action="'+name+'"]');
async function select(page,name){await fileTrigger(page).click();await action(page,name).click();}

test('File menu imports UTF-8 Markdown into Sandbox and preserves course draft',async({page})=>{
 await page.goto('/');
 const source=page.locator('#markdown-input');
 await source.fill('# Lesson edits\n\nContent in course.');
 await select(page,'open');
 const upload=page.locator('#file-menu-open-input');
 await upload.setInputFiles({name:'My notes.markdown',mimeType:'text/plain',buffer:Buffer.from('# Imported\n\n**Strong**','utf8')});
 await expect(page.locator('#active-tab-title')).toContainText('Sandbox');
 await expect(source).toHaveValue('# Imported\n\n**Strong**');
 await fileTrigger(page).click();
 await expect(page.locator('#file-menu-current')).toContainText('My notes.md');
 await page.keyboard.press('Escape');
 await page.reload();
 await expect(source).toHaveValue('# Imported\n\n**Strong**');
 await expect(page.locator('#file-menu-current')).toHaveText('My notes.md');
});

test('New Markdown opens another tab without overwriting existing Sandbox text',async({page})=>{
 await page.goto('/');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 const source=page.locator('#markdown-input');
 await source.fill('Keep this **draft**');
 const first=await page.locator('#document-tab-list [data-document-id]').first().getAttribute('data-document-id');
 await select(page,'new');
 await expect(source).toHaveValue('');
 await expect(page.locator('#document-tab-list [data-document-id]')).toHaveCount(2);
 await page.locator('#document-tab-list [data-document-id="'+first+'"]').click();
 await expect(source).toHaveValue('Keep this **draft**');
 await fileTrigger(page).click();
 await expect(page.locator('#file-menu-current')).toHaveText('Untitled.md');
});

test('File downloads Markdown via existing export handler and supports a new filename',async({page})=>{
 await page.goto('/');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 const source=page.locator('#markdown-input');
 await source.fill('# Download\n\nUnicode čeština, українська.');
 let downloadEvent=page.waitForEvent('download');
 await select(page,'save');
 let download=await downloadEvent;
 expect(download.suggestedFilename()).toBe('Untitled.md');
 downloadEvent=page.waitForEvent('download');
 page.once('dialog',dialog=>dialog.accept('2026 project plan.md'));
 await select(page,'save-as');
 download=await downloadEvent;
 expect(download.suggestedFilename()).toBe('2026 project plan.md');
 await fileTrigger(page).click();
 await expect(page.locator('#file-menu-current')).toHaveText('2026 project plan.md');
 await page.keyboard.press('Escape');
 downloadEvent=page.waitForEvent('download');
 await page.keyboard.press('Control+s');
 download=await downloadEvent;
 expect(download.suggestedFilename()).toBe('2026 project plan.md');
 await expect(source).toHaveValue('# Download\n\nUnicode čeština, українська.');
});

test('File Open rejects invalid type and oversized files without replacing Markdown',async({page})=>{
 await page.goto('/');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 const source=page.locator('#markdown-input');
 await source.fill('Unchanged content');
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#file-menu-open-input').setInputFiles({name:'payload.exe',mimeType:'application/octet-stream',buffer:Buffer.from('unsafe')});
 await expect(source).toHaveValue('Unchanged content');
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#file-menu-open-input').setInputFiles({name:'huge.md',mimeType:'text/plain',buffer:Buffer.alloc(5*1024*1024+1,65)});
 await expect(source).toHaveValue('Unchanged content');
});

test('File menu is keyboard reachable, localized and mobile-safe',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const trigger=fileTrigger(page);
 await trigger.focus();
 await page.keyboard.press('ArrowDown');
 await expect(fileMenu(page)).toBeVisible();
 await expect(action(page,'new')).toBeFocused();
 await page.keyboard.press('End');
 await expect(action(page,'print')).toBeFocused();
 const rect=await fileMenu(page).boundingBox();
 expect(rect.x).toBeGreaterThanOrEqual(0);
 expect(rect.x+rect.width).toBeLessThanOrEqual(390);
 await page.keyboard.press('Escape');
 await expect(trigger).toBeFocused();
 for(const [lang,title] of [['en','File'],['cs','Soubor'],['uk','Файл'],['ro','Fișier'],['ru','Файл']]){
  await setAppLanguage(page,lang);
  await expect(trigger).toHaveText(title);
  await trigger.click();
  await expect(action(page,'open')).not.toBeEmpty();
  await page.keyboard.press('Escape');
 }
});
