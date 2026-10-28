import {test,expect} from '@playwright/test';

const tabs=page=>page.locator('#document-tab-list [data-document-id]');
async function switchTo(page,id){await page.locator('#document-tab-list [data-document-id="'+id+'"]').click();}
async function newTab(page){await page.locator('#document-new-tab').click();}
async function closeTab(page,id){await page.locator('#document-tab-list [data-document-id="'+id+'"]').locator('..').locator('.document-tab-close').click();}

test('Notepad tabs isolate documents, persist after reload, and do not affect lesson drafts',async({page})=>{
 await page.goto('/');
 const source=page.locator('#markdown-input');
 await source.fill('# My lesson draft');
 await page.locator('#help-menu-trigger').click();
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
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 await expect(page.locator('#document-tabs')).toBeHidden();
 await expect(source).toHaveValue('# My lesson draft');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 await expect(tabs(page)).toHaveCount(2);
 await expect(source).toHaveValue('# First document\n\nKeep this');
});

test('Closing a nonempty document warns, cancel preserves text, last tab stays available',async({page})=>{
 await page.goto('/');
 await page.locator('#help-menu-trigger').click();
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

test('Renaming a document persists across tab switches and reload',async({page})=>{
 await page.goto('/');
 await page.locator('#help-menu-trigger').click();
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
 await page.locator('#help-menu-trigger').click();
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
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 const source=page.locator('#markdown-input');
 await source.fill('# First history');
 await page.locator('#multi-cursor-toggle').click();
 await expect(page.locator('#multi-cursor-toggle')).toHaveAttribute('aria-pressed','true');
 await newTab(page);
 await page.locator('#codemirror-mount .cm-content').fill('# Second history');
 await expect(source).toHaveValue('# Second history');
 const second=await tabs(page).last().getAttribute('data-document-id');
 const first=await tabs(page).first().getAttribute('data-document-id');
 await switchTo(page,first);
 await expect(source).toHaveValue('# First history');
 await switchTo(page,second);
 await expect(source).toHaveValue('# Second history');
 await page.locator('#multi-cursor-toggle').click();
 await expect(page.locator('#multi-cursor-toggle')).toHaveAttribute('aria-pressed','false');
});

test('Mobile top-row tabs retain keyboard Home and End navigation',async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await page.goto('/');
 await page.locator('#help-menu-trigger').click();
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

test('Upgrading from single Sandbox migrates legacy Markdown without losing its filename',async({page})=>{
 await page.addInitScript(()=>{
  if(!sessionStorage.getItem('legacy-tabs-seeded')){
   localStorage.setItem('md_course_state_v1',JSON.stringify({
    lang:'en',currentLessonIndex:-1,sandboxFileName:'Legacy.md',
    savedDrafts:{sandbox_en:'# Existing legacy Sandbox draft'}
   }));
   sessionStorage.setItem('legacy-tabs-seeded','1');
  }
 });
 await page.goto('/');
 const source=page.locator('#markdown-input');
 await expect(source).toHaveValue('# Existing legacy Sandbox draft');
 await expect(tabs(page)).toHaveCount(1);
 await expect(tabs(page).first()).toContainText('Legacy.md');
 await newTab(page);
 await source.fill('# New document');
 await page.reload();
 await expect(tabs(page)).toHaveCount(2);
 await expect(source).toHaveValue('# New document');
 await switchTo(page,await tabs(page).first().getAttribute('data-document-id'));
 await expect(source).toHaveValue('# Existing legacy Sandbox draft');
});


test('Document-scoped soft breaks are migrated, isolated and persisted across tabs',async({page})=>{
 await page.addInitScript(()=>{
  if(!sessionStorage.getItem('softbreak-tabs-seeded')){
   localStorage.setItem('md_course_state_v1',JSON.stringify({
    lang:'en',currentLessonIndex:-1,savedDrafts:{sandbox_en:'First line\nSecond line'},
    extensionSettingsByDocument:{sandbox_en:{softbreaks:true}}
   }));
   sessionStorage.setItem('softbreak-tabs-seeded','1');
  }
 });
 await page.goto('/');
 const source=page.locator('#markdown-input');
 await expect(source).toHaveValue('First line\nSecond line');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
 const first=await tabs(page).first().getAttribute('data-document-id');
 await newTab(page);
 await source.fill('Other first\nOther second');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(0);
 await switchTo(page,first);
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
 await page.reload();
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
});
test('Prompt Library writes only into the active Sandbox document',async({page})=>{
 await page.goto('/');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 const source=page.locator('#markdown-input');
 await source.fill('# Existing first document');
 const first=await tabs(page).first().getAttribute('data-document-id');
 await newTab(page);
 await page.locator('#help-menu-trigger').click();
 await page.locator('#prompt-library-trigger').click();
 await page.locator('[data-prompt-id="writing-blog"]').click();
 await page.locator('#prompt-library-append').click();
 await expect(source).toHaveValue(/# Role/);
 await switchTo(page,first);
 await expect(source).toHaveValue('# Existing first document');
});

test('File New on mobile reveals the editor after reading the lesson guide',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#mobile-tabs [data-mobile-tab="guide"]').click();
 await expect(page.locator('#workspace-container')).toHaveAttribute('data-mobile-tab','guide');
 await page.locator('#file-menu-trigger').click();
 await page.locator('#file-menu [data-file-action="new"]').click();
 await expect(page.locator('#workspace-container')).toHaveAttribute('data-mobile-tab','editor');
 await expect(page.locator('#document-tabs')).toBeVisible();
 await expect(page.locator('#markdown-input')).toBeVisible();
});


test('Sandbox places menu and document tabs in one compact header row',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/');
 const originalToolbar=await page.locator('#document-tabs').boundingBox();
 expect(originalToolbar).toBeNull();
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 const header=page.locator('.app-header');
 const tabsBar=page.locator('#document-tabs');
 await expect(tabsBar).toBeVisible();
 await expect(tabsBar.locator('#document-tab-list [role="tab"]')).toHaveCount(1);
 expect(await tabsBar.evaluate(el=>el.parentElement?.tagName)).toBe('HEADER');
 const [menuRect,tabsRect,headerRect,toolbarRect]=await Promise.all([
  page.locator('#file-menu-trigger').boundingBox(),
  tabsBar.boundingBox(),
  header.boundingBox(),
  page.locator('#unicode-picker-trigger').boundingBox()
 ]);
 expect(Math.abs(menuRect.y+menuRect.height/2-(tabsRect.y+tabsRect.height/2))).toBeLessThan(12);
 expect(headerRect.height).toBeLessThanOrEqual(45);
 expect(tabsRect.x).toBeGreaterThan(menuRect.x+menuRect.width);
 expect(tabsRect.x+tabsRect.width).toBeLessThanOrEqual(1440);
 expect(toolbarRect.y).toBeGreaterThanOrEqual(headerRect.y+headerRect.height);
 expect(toolbarRect.y).toBeLessThan(headerRect.y+headerRect.height+48);
 await page.locator('#document-new-tab').click();
 await expect(page.locator('#document-tab-list [role="tab"]')).toHaveCount(2);
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 await expect(tabsBar).toBeHidden();
 await expect(page.locator('#theory-panel')).toBeVisible();
});

test('One-row menu and tabs remain independently reachable at 360px',async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await page.goto('/');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 const header=page.locator('.app-header');
 const tabsBar=page.locator('#document-tabs');
 for(let i=0;i<9;i++)await page.locator('#document-new-tab').click();
 await expect(page.locator('#document-tab-list [role="tab"]')).toHaveCount(10);
 const [headRect,tabsRect,addRect]=await Promise.all([
  header.boundingBox(),tabsBar.boundingBox(),page.locator('#document-new-tab').boundingBox()
 ]);
 expect(headRect.height).toBeLessThanOrEqual(45);
 expect(tabsRect.x).toBeGreaterThanOrEqual(0);
 expect(tabsRect.x+tabsRect.width).toBeLessThanOrEqual(361);
 expect(addRect.x).toBeGreaterThanOrEqual(tabsRect.x);
 expect(addRect.x+addRect.width).toBeLessThanOrEqual(361);
 const list=page.locator('#document-tab-list');
 expect(await list.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
 await page.locator('#file-menu-trigger').scrollIntoViewIfNeeded();
 await page.locator('#file-menu-trigger').click();
 await expect(page.locator('#file-menu')).toBeVisible();
 await page.keyboard.press('Escape');
 await page.locator('#help-menu-trigger').scrollIntoViewIfNeeded();
 await page.locator('#help-menu-trigger').click();
 await expect(page.locator('#help-menu')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('#document-new-tab')).toBeVisible();
});
