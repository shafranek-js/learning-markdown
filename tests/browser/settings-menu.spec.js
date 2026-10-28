import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';

test('Settings is the only location for Theme and Language and remembers changes',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.app-header-actions #theme-selector')).toHaveCount(0);
 await expect(page.locator('.app-header-actions #lang-selector')).toHaveCount(0);
 await expect(page.locator('#theme-selector')).toHaveCount(1);
 await expect(page.locator('#lang-selector')).toHaveCount(1);
 const editor=page.locator('#markdown-input');
 await editor.fill('# Notes\n\n**Important**');
 await setAppTheme(page,'nord');
 await expect(page.locator('html')).toHaveAttribute('data-theme','nord');
 await expect(editor).toHaveValue('# Notes\n\n**Important**');
 await setAppLanguage(page,'cs');
 await expect(page.locator('#settings-menu-trigger')).toHaveText('Nastavení');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-theme','nord');
 await expect(page.locator('#settings-menu-trigger')).toHaveText('Nastavení');
 await page.locator('#settings-menu-trigger').click();
 await expect(page.locator('#theme-selector')).toHaveValue('nord');
 await expect(page.locator('#lang-selector')).toHaveValue('cs');
 await expect(page.locator('#settings-panel')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('#settings-panel')).toBeHidden();
 await expect(page.locator('#settings-menu-trigger')).toBeFocused();
 await setAppLanguage(page,'en');
 await expect(editor).toHaveValue('# Notes\n\n**Important**');
});

test('Settings controls update immediately in all five languages',async({page})=>{
 await page.goto('/');
 for(const [lang,title] of [
  ['en','Settings'],['cs','Nastavení'],['uk','Налаштування'],
  ['ro','Setări'],['ru','Настройки']
 ]){
  await setAppLanguage(page,lang);
  await expect(page.locator('#settings-menu-trigger')).toHaveText(title);
  await page.locator('#settings-menu-trigger').click();
  await expect(page.locator('#settings-panel-title')).toHaveText(title);
  await expect(page.locator('label[for="theme-selector"]')).not.toBeEmpty();
  await expect(page.locator('label[for="lang-selector"]')).not.toBeEmpty();
  await expect(page.locator('#lang-selector')).toHaveValue(lang);
  await page.locator('#settings-close').click();
 }
});

test('Settings menu supports keyboard focus and mobile viewport without obscuring workspace',async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await page.goto('/');
 const trigger=page.locator('#settings-menu-trigger');
 await trigger.scrollIntoViewIfNeeded();
 await trigger.focus();
 await page.keyboard.press('ArrowDown');
 await expect(page.locator('#settings-panel')).toBeVisible();
 await expect(page.locator('#theme-selector')).toBeFocused();
 const rect=await page.locator('#settings-panel').boundingBox();
 expect(rect.x).toBeGreaterThanOrEqual(0);
 expect(rect.x+rect.width).toBeLessThanOrEqual(360);
 expect(rect.y).toBeGreaterThanOrEqual(0);
 expect(rect.y+rect.height).toBeLessThanOrEqual(780);
 await page.keyboard.press('Tab');
 await expect(page.locator('#lang-selector')).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(page.locator('#settings-panel')).toBeHidden();
 await expect(trigger).toBeFocused();
 await page.locator('#help-menu-trigger').click();
 await expect(page.locator('#help-menu [data-help-action="sandbox"]')).toBeVisible();
 await expect(page.locator('#help-menu [data-help-action="library"]')).toBeVisible();
 await expect(page.locator('#help-menu [data-help-action="cheats"]')).toBeVisible();
});
