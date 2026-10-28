import {undo,redo} from './support/history-actions.js';
import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';

const modal=page=>page.locator('#prompt-library-dialog');
async function openLibrary(page){
 await page.locator('#help-menu-trigger').click();
 await page.locator('#prompt-library-trigger').click();
 await expect(modal(page)).toBeVisible();
}
async function chooseTemplate(page,id){
 await page.locator('[data-prompt-id="'+id+'"]').click();
}
test('Template variable filling, Markdown export, safe append and Undo',async({page})=>{
 await page.goto('/');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 const editor=page.locator('#markdown-input');
 await editor.fill('# Existing work');
 await openLibrary(page);
 await expect(page.locator('#prompt-library-list [data-prompt-id]')).toHaveCount(60);
 await chooseTemplate(page,'coding-review');
 await expect(page.locator('#prompt-library-variables textarea')).toHaveCount(2);
 await page.locator('[data-variable="stack"]').fill('JavaScript');
 await page.locator('[data-variable="code"]').fill('const answer = 42;');
 await expect(page.locator('#prompt-library-output')).toHaveValue(/JavaScript/);
 await expect(page.locator('#prompt-library-output')).toHaveValue(/const answer = 42;/);
 await expect(page.locator('#prompt-library-rendered h1').first()).toHaveText('Role');
 await expect(page.locator('#prompt-library-rendered')).toContainText('JavaScript');
 const downloadEvent=page.waitForEvent('download');
 await page.locator('#prompt-library-download').click();
 const download=await downloadEvent;
 expect(download.suggestedFilename()).toBe('Code-review.md');
 await page.locator('#prompt-library-append').click();
 await expect(modal(page)).toBeHidden();
 await expect(editor).toHaveValue(/# Existing work/);
 await expect(editor).toHaveValue(/const answer = 42;/);
 await undo(page);
 await expect(editor).toHaveValue('# Existing work');
});

test('Replacement can be cancelled without switching course or damaging Sandbox draft',async({page})=>{
 await page.goto('/');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 const editor=page.locator('#markdown-input');
 await editor.fill('Sandbox data to keep');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 await editor.fill('# Lesson draft');
 await openLibrary(page);
 await chooseTemplate(page,'analysis-document');
 page.once('dialog',dialog=>dialog.dismiss());
 await page.locator('#prompt-library-replace').click();
 await expect(modal(page)).toBeVisible();
 await expect(editor).toHaveValue('# Lesson draft');
 await expect(page.locator('#active-tab-title')).not.toContainText('Sandbox');
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#prompt-library-replace').click();
 await expect(modal(page)).toBeHidden();
 await expect(editor).toHaveValue(/# Role/);
 await expect(page.locator('#active-tab-title')).toContainText('Sandbox');
 await page.reload();
 await expect(editor).toHaveValue(/# Role/);
});

test('Personal template CRUD and Favorites persist on reload',async({page})=>{
 await page.goto('/');
 await openLibrary(page);
 await page.locator('#prompt-library-new').click();
 await page.locator('#prompt-own-title').fill('Release checklist');
 await page.locator('#prompt-own-category').selectOption('Work');
 await page.locator('#prompt-own-description').fill('Custom release template');
 await page.locator('#prompt-own-body').fill('# {{project}}\n\n- [ ] {{test_name}}');
 await page.locator('#prompt-own-save').click();
 await expect(page.locator('#prompt-library-selected-title')).toHaveText('Release checklist');
 await page.locator('#prompt-library-star').click();
 await expect(page.locator('#prompt-library-star')).toHaveAttribute('aria-pressed','true');
 await page.locator('#prompt-library-close').click();
 await page.reload();
 await openLibrary(page);
 await page.locator('#prompt-library-favorites').click();
 await expect(page.locator('#prompt-library-selected-title')).toHaveText('Release checklist');
 await page.locator('#prompt-library-edit').click();
 await page.locator('#prompt-own-title').fill('Release UAT checklist');
 await page.locator('#prompt-own-save').click();
 await expect(page.locator('#prompt-library-selected-title')).toHaveText('Release UAT checklist');
 page.once('dialog',dialog=>dialog.dismiss());
 await page.locator('#prompt-library-delete').click();
 await expect(page.locator('#prompt-library-selected-title')).toHaveText('Release UAT checklist');
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#prompt-library-delete').click();
 await expect(page.locator('#prompt-library-count')).toContainText('0 templates');
});

test('Unsaved personal template editor warns before discarding',async({page})=>{
 await page.goto('/');
 await openLibrary(page);
 await page.locator('#prompt-library-new').click();
 await page.locator('#prompt-own-title').fill('Draft unsaved');
 page.once('dialog',dialog=>dialog.dismiss());
 await page.locator('#prompt-library-close').click();
 await expect(modal(page)).toBeVisible();
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#prompt-library-close').click();
 await expect(modal(page)).toBeHidden();
});

test('Search, locale and accessible mobile dialog',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 await openLibrary(page);
 await expect(page.locator('#prompt-library-title')).toHaveText('Библиотека промптов');
 await page.locator('#prompt-library-search').fill('flash');
 await expect(page.locator('#prompt-library-list [data-prompt-id]')).toHaveCount(1);
 await chooseTemplate(page,'learning-flashcards');
 await expect(page.locator('#prompt-library-output')).toHaveValue(/# Notes/);
 const box=await page.locator('.prompt-library-surface').boundingBox();
 expect(box.x).toBeGreaterThanOrEqual(0);
 expect(box.x+box.width).toBeLessThanOrEqual(391);
 await page.keyboard.press('Escape');
 await expect(modal(page)).toBeHidden();
 await expect(page.locator('#help-menu-trigger')).toBeFocused();
});

test('Prompt preview sanitizes user-controlled HTML while preserving raw Markdown',async({page})=>{
 await page.goto('/');
 await openLibrary(page);
 await chooseTemplate(page,'analysis-document');
 const payload='<img src=x onerror=alert(1)>';
 await page.locator('[data-variable="document"]').fill(payload);
 await expect(page.locator('#prompt-library-output')).toHaveValue(/onerror=alert/);
 await expect(page.locator('#prompt-library-rendered [onerror]')).toHaveCount(0);
 await expect(page.locator('#prompt-library-rendered')).toBeVisible();
});

test('Expanded catalog filters ten categories and supports multi-term search',async({page})=>{
 await page.goto('/');
 await openLibrary(page);
 const category=page.locator('#prompt-library-category');
 await expect(category.locator('option')).toHaveCount(11);
 await expect(page.locator('#prompt-library-list [data-prompt-id]')).toHaveCount(60);
 await category.selectOption('Research');
 await expect(page.locator('#prompt-library-list [data-prompt-id]')).toHaveCount(4);
 await expect(page.locator('#prompt-library-count')).toContainText('4 templates');
 await category.selectOption('Design & UX');
 await expect(page.locator('#prompt-library-list [data-prompt-id]')).toHaveCount(4);
 await chooseTemplate(page,'design-accessibility-plan');
 await expect(page.locator('#prompt-library-variables textarea')).toHaveCount(3);
 await category.selectOption('all');
 await page.locator('#prompt-library-search').fill('SQL join');
 await expect(page.locator('#prompt-library-list [data-prompt-id]')).toHaveCount(1);
 await expect(page.locator('#prompt-library-list [data-prompt-id]').first()).toHaveAttribute('data-prompt-id','coding-sql-review');
 await page.locator('#prompt-library-search').clear();
 await category.selectOption('Career');
 await expect(page.locator('#prompt-library-list [data-prompt-id]')).toHaveCount(4);
});

test('Favorites and custom templates from old and new categories survive catalog upgrade',async({page})=>{
 await page.addInitScript(()=>{
  // Seed once per browser tab; do not overwrite newly saved items on reload.
  if(!sessionStorage.getItem('md_prompt_upgrade_seeded')){
   localStorage.setItem('md_prompt_library_v1',JSON.stringify({
    personal:[{id:'own_saved04',title:'Pre-existing work note',category:'Work',description:'Stored before update',body:'# {{topic}}'}],
    favorites:['writing-blog','own_saved04']
   }));
   sessionStorage.setItem('md_prompt_upgrade_seeded','1');
  }
 });
 await page.goto('/');
 await openLibrary(page);
 await page.locator('#prompt-library-favorites').click();
 await expect(page.locator('#prompt-library-list [data-prompt-id]')).toHaveCount(2);
 await page.locator('#prompt-library-mine').click();
 await expect(page.locator('#prompt-library-selected-title')).toHaveText('Pre-existing work note');
 await page.locator('#prompt-library-new').click();
 await page.locator('#prompt-own-title').fill('New research note');
 await page.locator('#prompt-own-category').selectOption('Research');
 await page.locator('#prompt-own-body').fill('# {{question}}\n\n## Sources\n{{sources}}');
 await page.locator('#prompt-own-save').click();
 await expect(page.locator('#prompt-library-selected-title')).toHaveText('New research note');
 await page.locator('#prompt-library-close').click();
 await page.reload();
 await openLibrary(page);
 await page.locator('#prompt-library-mine').click();
 await expect(page.locator('#prompt-library-list [data-prompt-id]')).toHaveCount(2);
 await page.locator('#prompt-library-favorites').click();
 await expect(page.locator('#prompt-library-list [data-prompt-id]')).toHaveCount(2);
});

test('Expanded category names remain localizable without changing saved IDs',async({page})=>{
 await page.goto('/');
 for(const [lang,word] of [['en','Research'],['cs','Výzkum'],['uk','Дослідження'],['ro','Cercetare'],['ru','Исследования']]){
  await setAppLanguage(page,lang);
  await openLibrary(page);
  await expect(page.locator('#prompt-library-category option[value="Research"]')).toContainText(word);
  await page.locator('#prompt-library-category').selectOption('Research');
  await expect(page.locator('#prompt-library-list [data-prompt-id]')).toHaveCount(4);
  await page.keyboard.press('Escape');
  await expect(modal(page)).toBeHidden();
 }
});
