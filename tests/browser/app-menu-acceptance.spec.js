import {test,expect} from '@playwright/test';

// Release gate for the unified File / Edit / View / Settings / Help navigation.
// These tests intentionally drive the same entry points as a user.
const menus=['file','edit','view','settings','help'];

async function assertInViewport(locator,width,height){
 const r=await locator.boundingBox();
 expect(r).not.toBeNull();
 expect(r.x).toBeGreaterThanOrEqual(-1);
 expect(r.y).toBeGreaterThanOrEqual(-1);
 expect(r.x+r.width).toBeLessThanOrEqual(width+1);
 expect(r.y+r.height).toBeLessThanOrEqual(height+1);
}
async function openAndDismiss(page,name,width,height){
 const trigger=page.locator('#'+name+'-menu-trigger');
 const popup=page.locator(name==='settings'?'#settings-panel':'#'+name+'-menu');
 await trigger.scrollIntoViewIfNeeded();
 await expect(trigger).toBeVisible();
 await trigger.click();
 await expect(popup).toBeVisible();
 await expect(trigger).toHaveAttribute('aria-expanded','true');
 await assertInViewport(popup,width,height);
 await page.keyboard.press('Escape');
 await expect(popup).toBeHidden();
 await expect(trigger).toHaveAttribute('aria-expanded','false');
 await expect(trigger).toBeFocused();
}

for(const [width,height] of [[360,780],[768,900],[1280,800],[1920,1080]]){
 test('Five menus remain usable without clipping at '+width+'px',async({page})=>{
  await page.setViewportSize({width,height});
  await page.goto('/');
  const editor=page.locator('#markdown-input');
  const source='# Keep this document\n\n**Untouched** text.';
  await editor.fill(source);
  await expect(page.locator('#theory-pane-toggle-btn')).toHaveCount(0);
  for(const name of menus)await openAndDismiss(page,name,width,height);
  await expect(editor).toHaveValue(source);
 });
}

test('Menu keyboard traversal has no focus trap after inserting Settings',async({page})=>{
 await page.goto('/');
 for(const [current,next] of [['file','edit'],['edit','view'],['view','settings'],['settings','help']]){
  const from=page.locator('#'+current+'-menu-trigger');
  const to=page.locator('#'+next+'-menu-trigger');
  await from.scrollIntoViewIfNeeded();
  await from.focus();
  await page.keyboard.press('Tab');
  await expect(to).toBeFocused();
 }
 const view=page.locator('#view-menu-trigger');
 await view.click();
 await page.locator('#view-menu [data-view-action="wrap"]').focus();
 await page.keyboard.press('Tab');
 await expect(page.locator('#view-menu')).toBeHidden();
 await expect(page.locator('#settings-menu-trigger')).toBeFocused();
});

test('Sandbox keeps source and five menus available while course-only Contents stays hidden',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#sandbox-mode-btn').click();
 const input=page.locator('#markdown-input');
 const source='# Sandbox\n\nA [link](https://example.org)';
 await input.fill(source);
 await expect(page.locator('#contents-toggle-btn')).toBeHidden();
 for(const name of menus)await openAndDismiss(page,name,390,844);
 await expect(input).toHaveValue(source);
 // Return to a lesson and back; Sandbox has its own locally saved draft.
 await page.locator('#help-menu-trigger').scrollIntoViewIfNeeded();
 await page.locator('#help-menu-trigger').click();
 await page.locator('#help-menu [data-help-action="guide"]').click();
 await expect(page.locator('#theory-panel')).toBeVisible();
 await page.locator('#close-contents-btn').click();
 await page.locator('#sandbox-mode-btn').click();
 await expect(input).toHaveValue(source);
});
