import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const {version}=JSON.parse(await readFile(new URL('../../package.json',import.meta.url),'utf8'));

test('release parity: app version, editor input and live Markdown preview',async({page})=>{
 await page.goto('/');
 const versionLabel=page.locator('#app-version-status');
 await expect(versionLabel).toBeVisible();
 await expect(versionLabel).toContainText('v'+version);
 await page.locator('#markdown-input').fill('# Browser compatibility\n\n**Formatted** text.');
 await expect(page.locator('#markdown-preview h1')).toHaveText('Browser compatibility');
 await expect(page.locator('#markdown-preview strong')).toHaveText('Formatted');
});

test('release parity: source-backed visual table edit, undo and redo',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const original='| Product | Count |\n| --- | ---: |\n| Tablet | 12 |';
 await input.fill(original);
 const cell=page.locator('#markdown-preview table tbody td').first();
 await cell.focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('#table-edit-content-input')).toBeFocused();
 await page.locator('#table-edit-content-input').fill('Capsule');
 await page.locator('#table-edit-content-save').click();
 const changed=await input.inputValue();
 expect(changed).toContain('Capsule');
 await expect(cell).toHaveText('Capsule');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(original);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(changed);
});

test('release parity: unsafe HTML cannot execute or survive standalone export',async({page})=>{
 await page.goto('/');
 const source='# Safe document\n\n<p onclick="window.__attack=1">Visible text</p>\n\n<script>window.__attack=2</script>\n\n[bad](javascript:alert(1))';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await expect(page.locator('#markdown-preview')).toContainText('Visible text');
 await expect(page.locator('#markdown-preview script')).toHaveCount(0);
 expect(await page.evaluate(()=>window.__attack)).toBeUndefined();
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const download=await downloadPromise;
 const html=await readFile(await download.path(),'utf8');
 expect(html).not.toMatch(/<script[\s>]|onclick=|href=["']javascript:/i);
 expect(html).toContain('Visible text');
 await expect(input).toHaveValue(source);
});

test('release parity: small-screen version visibility and language switching',async({page})=>{
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const versionLabel=page.locator('#app-version-status');
 await expect(versionLabel).toHaveAttribute('aria-label',/^Версия /);
 await page.setViewportSize({width:360,height:740});
 await expect(versionLabel).toBeVisible();
 const position=await versionLabel.evaluate(element=>{
  const rect=element.getBoundingClientRect();
  return rect.width>0&&rect.left>=0&&rect.right<=window.innerWidth&&rect.bottom<=window.innerHeight;
 });
 expect(position).toBe(true);
});
