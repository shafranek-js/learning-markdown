import {test,expect} from '@playwright/test';

const menu=page=>page.locator('#view-menu');
const trigger=page=>page.locator('#view-menu-trigger');
const item=(page,action)=>page.locator('#view-menu [data-view-action="'+action+'"]');
async function open(page){await trigger(page).click();await expect(menu(page)).toBeVisible();}
async function choose(page,action){await open(page);await item(page,action).click();await expect(menu(page)).toBeHidden();}

test('View menu reuses wrap, layout, font and reset controls without changing Markdown',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='# Test\n\n**Bold** and a long line '.repeat(9);
 await input.fill(source);
 await open(page);
 await expect(item(page,'wrap')).toHaveAttribute('aria-checked','true');
 await expect(item(page,'split')).toHaveAttribute('aria-checked','true');
 await item(page,'wrap').click();
 await expect(page.locator('#wrap-text-toggle')).toHaveAttribute('aria-pressed','false');
 await choose(page,'html');
 await expect(page.locator('#raw-html-preview')).toBeVisible();
 await open(page);
 await expect(item(page,'html')).toHaveAttribute('aria-checked','true');
 await expect(item(page,'split')).toHaveAttribute('aria-checked','false');
 await item(page,'smaller').click();
 const smaller=await page.locator('html').evaluate(el=>el.style.getPropertyValue('--editor-font-size'));
 await choose(page,'larger');
 expect(await page.locator('html').evaluate(el=>el.style.getPropertyValue('--editor-font-size'))).not.toBe(smaller);
 await choose(page,'reset');
 await expect(page.locator('#split-ratio-indicator')).toContainText('50% / 50%');
 await expect(input).toHaveValue(source);
 await page.reload();
 await open(page);
 await expect(item(page,'wrap')).toHaveAttribute('aria-checked','false');
 await expect(item(page,'html')).toHaveAttribute('aria-checked','true');
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('View menu follows Lesson Guide and Sandbox state',async({page})=>{
 await page.goto('/');
 await open(page);
 await expect(item(page,'guide')).toHaveAttribute('aria-checked','true');
 await item(page,'guide').click();
 await expect(page.locator('#theory-pane-toggle-btn')).toHaveAttribute('aria-pressed','false');
 await open(page);
 await expect(item(page,'guide')).toHaveAttribute('aria-checked','false');
 await item(page,'guide').click();
 await expect(page.locator('#theory-pane-toggle-btn')).toHaveAttribute('aria-pressed','true');
 await page.locator('#sandbox-mode-btn').click();
 await open(page);
 await expect(item(page,'guide')).toHaveAttribute('aria-checked','false');
 await item(page,'guide').click();
 await expect(page.locator('#theory-pane-toggle-btn')).toHaveAttribute('aria-pressed','true');
});

test('View menu supports keyboard, Escape, outside click and five languages',async({page})=>{
 await page.goto('/');
 await trigger(page).focus();
 await page.keyboard.press('ArrowDown');
 await expect(menu(page)).toBeVisible();
 await expect(item(page,'wrap')).toBeFocused();
 await page.keyboard.press('ArrowDown');
 await expect(item(page,'guide')).toBeFocused();
 await page.keyboard.press('End');
 await expect(item(page,'reset')).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(menu(page)).toBeHidden();
 await expect(trigger(page)).toBeFocused();
 await open(page);
 await page.keyboard.press('Tab');
 await expect(menu(page)).toBeHidden();
 await expect(page.locator('#sandbox-mode-btn')).toBeFocused();
 await open(page);
 await page.keyboard.press('Shift+Tab');
 await expect(menu(page)).toBeHidden();
 await expect(page.locator('#theory-pane-toggle-btn')).toBeFocused();
 await open(page);
 await page.locator('#sandbox-mode-btn').click();
 await expect(menu(page)).toBeHidden();
 for(const [lang,label] of [['en','View'],['cs','Zobrazení'],['uk','Вигляд'],['ro','Vizualizare'],['ru','Вид']]){
  await page.locator('#lang-selector').selectOption(lang);
  await expect(trigger(page)).toHaveText(label);
  await open(page);
  await expect(menu(page)).toHaveAttribute('aria-label',label);
  await expect(item(page,'wrap')).not.toBeEmpty();
  await page.keyboard.press('Escape');
 }
});

test('Mobile View menu remains inside the screen and switches preview safely',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#markdown-input').fill('# Mobile\n\nSample');
 await open(page);
 const rect=await menu(page).boundingBox();
 expect(rect.x).toBeGreaterThanOrEqual(0);
 expect(rect.x+rect.width).toBeLessThanOrEqual(390);
 expect(rect.y).toBeGreaterThanOrEqual(0);
 expect(rect.y+rect.height).toBeLessThanOrEqual(844);
 await item(page,'guide').click();
 await expect(page.locator('#theory-pane-toggle-btn')).toHaveAttribute('aria-pressed','false');
 await choose(page,'preview');
 await expect(page.locator('#workspace-container')).toHaveAttribute('data-mobile-tab','preview');
 await expect(page.locator('#preview-pane')).toBeVisible();
 await choose(page,'html');
 await expect(page.locator('#raw-html-preview')).toBeVisible();
 await choose(page,'split');
 await expect(page.locator('#workspace-container')).toHaveAttribute('data-mobile-tab','editor');
 await expect(page.locator('#markdown-input')).toHaveValue('# Mobile\n\nSample');
});
