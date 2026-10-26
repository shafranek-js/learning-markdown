import {test,expect} from '@playwright/test';

test('HTML formatting stays in one compact ribbon without duplicate headings',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#advanced-toolbar')).toBeHidden();
 await page.locator('#advanced-tools-toggle').click();

 const ribbon=page.locator('#advanced-toolbar');
 const rich=ribbon.locator('#advanced-rich-toolbar');
 await expect(ribbon).toBeVisible();
 await expect(rich).toBeVisible();
 await expect(page.locator('#advanced-toolbar-warning')).toHaveCount(0);
 await expect(page.locator('#advanced-rich-heading')).toHaveCount(0);
 await expect(page.locator('#advanced-rich-toolbar')).toHaveCount(1);

 await page.locator('[data-advanced-category="tables"]').click();
 await expect(rich).toBeVisible();
 await expect(page.locator('#rich-tables')).toBeVisible();
 await expect(page.locator('label:has(> #rich-tables) > span')).toBeHidden();
 await expect(page.locator('#rich-blocks')).toBeHidden();
 await expect(page.locator('#figure-dialog-trigger')).toBeHidden();
 await expect(page.locator('#definition-html-insert')).toBeHidden();

 const ribbonBox=await ribbon.boundingBox(),richBox=await rich.boundingBox();
 expect(ribbonBox).toBeTruthy();
 expect(richBox).toBeTruthy();
 expect(richBox.y).toBeGreaterThanOrEqual(ribbonBox.y-1);
 expect(richBox.y+richBox.height).toBeLessThanOrEqual(ribbonBox.y+ribbonBox.height+1);

 await page.locator('[data-advanced-category="blocks"]').click();
 await expect(page.locator('#rich-blocks')).toBeVisible();
 await expect(page.locator('#figure-dialog-trigger')).toBeVisible();
 await page.locator('[data-advanced-category="lists"]').click();
 await expect(page.locator('#definition-html-insert')).toBeVisible();

 await page.reload();
 await expect(ribbon).toBeVisible();
 await expect(ribbon.locator('#advanced-rich-toolbar')).toBeVisible();
 await expect(page.locator('[data-advanced-category="lists"]')).toHaveAttribute('aria-pressed','true');
});
