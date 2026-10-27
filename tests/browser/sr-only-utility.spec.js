import {test,expect} from '@playwright/test';

// The CSS utility bundle is checked into the repository and may not include
// every Tailwind class. Verify the real compiled page, not just source CSS.
test('sr-only labels stay accessible without occupying editor or toolbar space',async({page})=>{
 await page.goto('/');
 const pickerLabel=page.locator('#table-picker-trigger .sr-only');
 const tabHelp=page.locator('#editor-tab-help');
 await expect(pickerLabel).toHaveText('Insert Table');
 await expect(tabHelp).toHaveAttribute('role','status');
 await expect(tabHelp).toHaveAttribute('aria-live','polite');
 await expect(page.locator('#markdown-input')).toHaveAttribute('aria-describedby','editor-tab-help');

 for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  for(const target of [pickerLabel,tabHelp]){
   const metrics=await target.evaluate(el=>{
    const style=getComputedStyle(el);
    const rect=el.getBoundingClientRect();
    return {
     position:style.position,
     overflow:style.overflow,
     clipPath:style.clipPath,
     width:rect.width,
     height:rect.height
    };
   });
   expect(metrics.position).toBe('absolute');
   expect(metrics.overflow).toBe('hidden');
   expect(metrics.clipPath).toBe('inset(50%)');
   expect(metrics.width).toBeLessThanOrEqual(1.5);
   expect(metrics.height).toBeLessThanOrEqual(1.5);
  }
 }
 // The help remains a live screen-reader description after its state changes.
 await page.locator('#tab-focus-toggle').click();
 await expect(tabHelp).toContainText('Tab moves focus');
 const metrics=await tabHelp.evaluate(el=>({
  width:el.getBoundingClientRect().width,
  height:el.getBoundingClientRect().height
 }));
 expect(metrics.width).toBeLessThanOrEqual(1.5);
 expect(metrics.height).toBeLessThanOrEqual(1.5);
});
