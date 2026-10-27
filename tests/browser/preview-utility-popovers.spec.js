import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';

const paneTop=page=>page.evaluate(()=>{
 const editor=document.querySelector('#editor-pane .editor-container');
 const preview=document.querySelector('#markdown-preview').parentElement;
 return {editor:editor.getBoundingClientRect().top,preview:preview.getBoundingClientRect().top};
});
const expectAligned=async page=>{
 const {editor,preview}=await paneTop(page);
 expect(Math.abs(editor-preview)).toBeLessThanOrEqual(2);
};

test('Split View stays aligned while utility panels open and close',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('# One\n\n## Two\n\n### Three');
 await expectAligned(page);
 await page.locator('#outline-trigger').click();
 await expect(page.locator('#toc-panel')).toBeVisible();
 await expect(page.locator('#toc-list a')).toHaveCount(3);
 await expectAligned(page);
 await page.locator('#export-trigger').click();
 await expect(page.locator('#toc-panel')).toBeHidden();
 await expect(page.locator('#preview-export-menu')).toBeVisible();
 await expectAligned(page);
 await page.locator('#compatibility-trigger').click();
 await expect(page.locator('#preview-export-menu')).toBeHidden();
 await expect(page.locator('#compatibility-panel')).toBeVisible();
 await expectAligned(page);
 await page.keyboard.press('Escape');
 await expect(page.locator('#compatibility-panel')).toBeHidden();
 await expect(page.locator('#compatibility-trigger')).toBeFocused();
 await expectAligned(page);
});

test('Export menu preserves HTML and Markdown downloads and compatibility settings',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('# Exported\n\nSome **text**.');
 await page.locator('#export-trigger').click();
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#download-md-btn').click();
 const md=await downloadPromise;
 expect(md.suggestedFilename()).toMatch(/\.md$/);
 await expect(page.locator('#preview-export-menu')).toBeHidden();
 await page.locator('#export-trigger').click();
 const htmlPromise=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const html=await htmlPromise;
 expect(html.suggestedFilename()).toMatch(/\.html$/);
 await page.locator('#compatibility-trigger').click();
 await expect(page.locator('#extension-softbreaks-toggle')).toBeVisible();
 await page.locator('#extension-softbreaks-toggle').selectOption('on');
 await expect(input).toHaveValue('# Exported\n\nSome **text**.');
});

test('Small-screen Preview utility controls remain accessible without changing content height',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#mobile-tabs [data-mobile-tab="preview"]').click();
 await page.locator('#outline-trigger').click();
 await expect(page.locator('#toc-panel')).toBeVisible();
 const dimensions=await page.locator('#toc-panel').evaluate(node=>{
  const rect=node.getBoundingClientRect();
  return {left:rect.left,right:rect.right};
 });
 expect(dimensions.left).toBeGreaterThanOrEqual(0);
 expect(dimensions.right).toBeLessThanOrEqual(390);
 await page.keyboard.press('Escape');
 await expect(page.locator('#toc-panel')).toBeHidden();
 await page.locator('#export-trigger').click();
 await expect(page.locator('#preview-export-menu')).toBeVisible();
 await setAppLanguage(page,'ru');
 await expect(page.locator('#export-trigger')).toContainText('Экспорт');
});


test('very narrow Preview preserves all localized actions inside the pane',async({page})=>{
 await page.setViewportSize({width:320,height:760});
 await page.goto('/');
 await page.locator('#mobile-tabs [data-mobile-tab="preview"]').click();
 for(const lang of ['en','cs','uk','ro','ru']){
  await setAppLanguage(page,lang);
  const actionRow=page.locator('.preview-header-actions');
  const box=await actionRow.evaluate(element=>{
   const actions=element.getBoundingClientRect();
   const pane=document.querySelector('#preview-pane').getBoundingClientRect();
   const title=document.querySelector('.preview-header-title-group');
   return {actionsLeft:actions.left,actionsRight:actions.right,paneLeft:pane.left,paneRight:pane.right,
    titleText:title.textContent.trim(),titleHidden:window.getComputedStyle(title).position==='absolute'};
  });
  expect(box.titleText.length).toBeGreaterThan(0);
  expect(box.titleHidden).toBe(true);
  expect(box.actionsLeft).toBeGreaterThanOrEqual(box.paneLeft-1);
  expect(box.actionsRight).toBeLessThanOrEqual(box.paneRight+1);
  for(const id of ['#outline-trigger','#export-trigger','#copy-md-btn']){
   const button=page.locator(id);
   await button.scrollIntoViewIfNeeded();
   const visible=await button.evaluate(element=>{
    const button=element.getBoundingClientRect();
    const actions=document.querySelector('.preview-header-actions').getBoundingClientRect();
    return button.left>=actions.left-1&&button.right<=actions.right+1;
   });
   expect(visible,lang+' '+id+' clipped').toBe(true);
  }
 }
 await page.locator('#outline-trigger').click();
 await expect(page.locator('#toc-panel')).toBeVisible();
 await page.keyboard.press('Escape');
 await page.locator('#export-trigger').click();
 await expect(page.locator('#preview-export-menu')).toBeVisible();
});
