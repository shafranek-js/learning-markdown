import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const {version}=JSON.parse(await readFile(new URL('../../package.json',import.meta.url),'utf8'));
const safeVersion=version.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g,'\\$&');

test('version and Git build remain visible in the status bar, including mobile and locale changes',async({page})=>{
 await page.goto('/');
 const indicator=page.locator('#app-version-status');
 await expect(indicator).toBeVisible();
 await expect(indicator).toHaveText(new RegExp(`^v${safeVersion} · (?:[a-f0-9]{7}|local)$`));
 await expect(indicator).toHaveAttribute('aria-label',new RegExp(`^Version ${safeVersion} · `));
 await page.locator('#lang-selector').selectOption('ru');
 await expect(indicator).toHaveAttribute('aria-label',new RegExp(`^Версия ${safeVersion} · `));
 await page.setViewportSize({width:360,height:740});
 await expect(indicator).toBeVisible();
 const withinViewport=await indicator.evaluate(element=>{
  const rect=element.getBoundingClientRect();
  return rect.width>0&&rect.left>=0&&rect.right<=window.innerWidth&&rect.bottom<=window.innerHeight;
 });
 expect(withinViewport).toBe(true);
});
