import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';
import {helpShortcutSections,HELP_SHORTCUT_TEXT} from '../../js/ui/help-shortcuts.js';
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
 await expect(page.locator('#help-info-content a[href="https://github.com/shafranek-js/learning-markdown"]')).toBeVisible();
 await expect(page.locator('#help-info-content a[href="mailto:pavel.p.popovic@gmail.com"]')).toHaveText('pavel.p.popovic@gmail.com');
 const telegram=page.locator('#help-info-content a[href="https://t.me/jsx_xsj"]');
 await expect(telegram).toHaveText('t.me/jsx_xsj');
 await expect(telegram).toHaveAttribute('target','_blank');
 await expect(telegram).toHaveAttribute('rel',/noopener noreferrer/);
});

test('Help course action restores course access from Sandbox',async({page})=>{
 await page.goto('/');
 await choose(page,'sandbox');
 await page.locator('#markdown-input').fill('# My Sandbox note');
 await choose(page,'guide');
 await expect(page.locator('#contents-drawer')).not.toHaveClass(/-translate-x-full/);
 await expect(page.locator('#theory-panel')).toBeVisible();
 await page.locator('#close-contents-btn').click();
 await choose(page,'sandbox');
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

test('Mobile header keeps all five menus and course actions accessible',async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await page.goto('/');
 for(const type of ['file','edit','view','settings','help']){
  const trigger=page.locator('#'+type+'-menu-trigger');
  await trigger.scrollIntoViewIfNeeded();
  const rect=await trigger.boundingBox();
  expect(rect.x).toBeGreaterThanOrEqual(-1);
  expect(rect.x+rect.width).toBeLessThanOrEqual(361);
  await trigger.click();
  await expect(page.locator(type==='settings'?'#settings-panel':'#'+type+'-menu')).toBeVisible();
  await page.keyboard.press('Escape');
 }
 const actions=await page.locator('.app-header-actions').boundingBox();
 expect(actions.x).toBeGreaterThanOrEqual(0);
 expect(actions.x+actions.width).toBeLessThanOrEqual(361);
 await help(page).scrollIntoViewIfNeeded();
 await help(page).click();
 await expect(page.locator('#sandbox-mode-btn')).toBeVisible();
 await expect(page.locator('#prompt-library-trigger')).toBeVisible();
 await expect(page.locator('#cheatsheet-btn')).toBeVisible();
});


test('Application menu is a compact text-only menubar, not outlined buttons',async({page})=>{
 await page.goto('/');
 const triggers=page.locator('.app-header-left .app-menubar-trigger');
 await expect(triggers).toHaveCount(5);
 for(const trigger of await triggers.all()){
  await expect(trigger).toHaveCSS('border-top-width','0px');
  await expect(trigger).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 }
 await expect(page.locator('.app-header-actions #sandbox-mode-btn')).toHaveCount(0);
 await expect(page.locator('.app-header-actions #prompt-library-trigger')).toHaveCount(0);
 await expect(page.locator('.app-header-actions #cheatsheet-btn')).toHaveCount(0);
});

test('Help opens Sandbox and Prompt Library with usable focus and retains all tools',async({page})=>{
 await page.goto('/');
 await choose(page,'sandbox');
 await expect(page.locator('#document-tabs')).toBeVisible();
 await expect(help(page)).toBeVisible();
 await choose(page,'prompts');
 await expect(page.locator('#prompt-library-dialog')).toBeVisible();
 await expect(page.locator('#prompt-library-search')).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(page.locator('#prompt-library-dialog')).toBeHidden();
 await expect(help(page)).toBeFocused();
 await choose(page,'cheats');
 await expect(page.locator('#cheatsheet-modal')).toBeVisible();
 await page.locator('#close-cheatsheet-btn').click();
 await choose(page,'sandbox');
 await expect(page.locator('#theory-panel')).toBeVisible();
});

test('Help workspace tools preserve localized menu labels',async({page})=>{
 await page.goto('/');
 for(const [lang,prompts] of [['en','Prompt Library'],['cs','Knihovna promptů'],['uk','Бібліотека промптів'],['ro','Biblioteca de prompturi'],['ru','Библиотека промптов']]){
  await setAppLanguage(page,lang);
  await help(page).click();
  await expect(action(page,'prompts')).toHaveText(prompts);
  await expect(action(page,'sandbox')).not.toBeEmpty();
  await expect(action(page,'cheats')).not.toBeEmpty();
  await page.keyboard.press('Escape');
 }
});


test('Sandbox mobile header does not keep an empty actions lane',async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await page.goto('/');
 await choose(page,'sandbox');
 await expect(page.locator('.app-header-actions')).toBeHidden();
 const menu=page.locator('.app-header-left');
 const viewport=await menu.boundingBox();
 // The menu now shares the same header row with Sandbox document tabs.
 // Its own scroll lane must stay usable without consuming the tabs' space.
 expect(viewport.width).toBeGreaterThan(110);
 expect(viewport.x+viewport.width).toBeLessThanOrEqual(361);
 const tabsBar=page.locator('#document-tabs');
 await expect(tabsBar).toBeVisible();
 const tabsRect=await tabsBar.boundingBox();
 expect(tabsRect.x).toBeGreaterThanOrEqual(viewport.x+viewport.width-1);
 await expect(page.locator('#document-new-tab')).toBeVisible();
 await help(page).scrollIntoViewIfNeeded();
 await expect(help(page)).toBeVisible();
});

test('GitHub Octicon stays at right of header in course and Sandbox on desktop and mobile',async({page})=>{
 for(const width of [1440,360]){
  await page.setViewportSize({width,height:800});
  await page.goto('/');
  const github=page.locator('#github-repository-link');
  await expect(github).toBeVisible();
  await expect(github).toHaveAttribute('href','https://github.com/shafranek-js/learning-markdown');
  await expect(github).toHaveAttribute('target','_blank');
  await expect(github).toHaveAttribute('rel',/noopener noreferrer/);
  await expect(github.locator('svg path')).toHaveCount(1);
  const checkRight=async()=>{
   const [headerRect,iconRect]=await Promise.all([
    page.locator('.app-header').boundingBox(),github.boundingBox()
   ]);
   expect(iconRect.x+iconRect.width).toBeLessThanOrEqual(headerRect.x+headerRect.width+1);
   expect(headerRect.x+headerRect.width-(iconRect.x+iconRect.width)).toBeLessThanOrEqual(26);
   expect(iconRect.x).toBeGreaterThanOrEqual(0);
  };
  await checkRight();
  // The same context retains Sandbox mode across page.goto() and viewport changes.
  // Only enter Sandbox when it is not already active; Help is a toggle.
  if(!(await page.locator('#document-tabs').isVisible())){
   await page.locator('#help-menu-trigger').scrollIntoViewIfNeeded();
   await page.locator('#help-menu-trigger').click();
   await page.locator('#sandbox-mode-btn').click();
  }
  await expect(page.locator('#document-tabs')).toBeVisible();
  await checkRight();
  const [plusRect,iconRect]=await Promise.all([
   page.locator('#document-new-tab').boundingBox(),github.boundingBox()
  ]);
  expect(plusRect.x+plusRect.width).toBeLessThanOrEqual(iconRect.x+1);
  await github.focus();
  await expect(github).toBeFocused();
 }
});

test('About contacts are localized and keyboard accessible without changing Markdown',async({page})=>{
 await page.goto('/');
 for(const [lang,heading] of [['en','Contact'],['cs','Kontakt'],['uk','Контакти'],['ro','Contact'],['ru','Контакты']]){
  await setAppLanguage(page,lang);
  // Locale switching legitimately loads translated course content; About must
  // leave the document untouched *after* the language has been selected.
  const source='## Contact test '+lang;
  await page.locator('#markdown-input').fill(source);
  await choose(page,'about');
  const content=page.locator('#help-info-content');
  await expect(content.locator('h3')).toHaveText(heading);
  const email=content.locator('a[href="mailto:pavel.p.popovic@gmail.com"]');
  const telegram=content.locator('a[href="https://t.me/jsx_xsj"]');
  await expect(email).toBeVisible();
  await expect(telegram).toBeVisible();
  await email.focus();
  await expect(email).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#help-info-dialog')).toBeHidden();
  await expect(page.locator('#markdown-input')).toHaveValue(source);
 }
});


test('Help documents every audited keyboard binding with its localized context',async({page})=>{
 await page.goto('/');
 for(const lang of ['en','cs','uk','ro','ru']){
  await setAppLanguage(page,lang);
  await choose(page,'shortcuts');
  const body=page.locator('#help-info-content');
  await expect(body.locator('table.workspace-shortcuts-table')).toHaveCount(8);
  await expect(body.locator('tr[data-shortcut-id]')).toHaveCount(43);
  const displayed=await body.locator('tr[data-shortcut-id]').evaluateAll(rows=>rows.map(row=>({
   id:row.dataset.shortcutId,
   label:row.querySelector('th[scope="row"]')?.textContent,
   keys:[...row.querySelectorAll('kbd')].map(key=>key.textContent)
  })));
  const expected=helpShortcutSections(lang).flatMap(group=>group.rows);
  expect(displayed).toEqual(expected);
  for(const group of helpShortcutSections(lang)){
   await expect(body.locator('table[aria-label="'+group.title+'"]')).toHaveCount(1);
  }
  await expect(body).toContainText(HELP_SHORTCUT_TEXT[lang].note);
  await expect(body).toContainText(HELP_SHORTCUT_TEXT[lang].os);
  await page.locator('#help-info-close').click();
 }
});

test('full Russian mobile shortcuts remain scrollable, readable and closable',async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const source='# Existing Markdown';
 await page.locator('#markdown-input').fill(source);
 await choose(page,'shortcuts');
 const surface=page.locator('#help-info-dialog .workspace-help-surface');
 await expect(surface).toBeVisible();
 const geometry=await page.locator('#help-info-content').evaluate(el=>({
  contentWidth:el.clientWidth,scrollWidth:el.scrollWidth,
  surfaceWidth:el.closest('.workspace-help-surface').getBoundingClientRect().width
 }));
 expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.contentWidth+1);
 expect(geometry.surfaceWidth).toBeLessThanOrEqual(360);
 await surface.evaluate(el=>{el.scrollTop=el.scrollHeight;});
 await expect(page.locator('#help-info-close')).toBeInViewport();
 await expect(page.locator('#help-info-content [data-shortcut-id="multi-line-ends"]'))
  .toContainText('Shift+Alt+I');
 await expect(page.locator('#help-info-content [data-shortcut-id="tabs-rename"]'))
  .toContainText('F2');
 await page.keyboard.press('Escape');
 await expect(page.locator('#help-info-dialog')).toBeHidden();
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('Help-listed link, heading and tab rename shortcuts perform their documented actions',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Example');
 await input.selectText();
 await input.press('Control+k');
 await expect(input).toHaveValue('[Example](https://example.com)');
 await input.fill('Heading');
 await input.press('Control+2');
 await expect(input).toHaveValue('## Heading');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 const first=page.locator('#document-tab-list [data-document-id]').first();
 await expect(first).toBeVisible();
 page.once('dialog',dialog=>dialog.accept('Help shortcut.md'));
 await first.focus();
 await first.press('F2');
 await expect(first).toContainText('Help shortcut.md');
});
