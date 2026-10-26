import {test,expect} from '@playwright/test';

const selectSource=(input,startText,endText)=>input.evaluate((el,{startText,endText})=>{
 el.focus();
 const start=el.value.indexOf(startText),end=el.value.indexOf(endText);
 if(start<0||end<start)throw new Error('Selection fixture not found');
 el.setSelectionRange(start,end);
 el.dispatchEvent(new Event('select',{bubbles:true}));
},{startText,endText});

test('native textarea transforms selected lists without losing Markdown, with Undo/Redo',async({page})=>{
 await page.goto('/');
 const source='Before\n\nAlpha\nBeta\n\nAfter';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await selectSource(input,'Alpha','\n\nAfter');
 await page.locator('.toolbar-btn[data-action="ul"]').click();
 const updated='Before\n\n- Alpha\n- Beta\n\nAfter';
 await expect(input).toHaveValue(updated);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(updated);
});

test('CodeMirror list toolbar uses the same source formatter for overlapping cursors',async({page})=>{
 await page.goto('/');
 const source='Alpha\nBeta\nGamma';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await page.keyboard.press('Control+a');
 await page.keyboard.press('Shift+Alt+i');
 await expect(page.locator('#multi-cursor-count')).toContainText('3');
 await page.locator('.toolbar-btn[data-action="ol"]').click();
 const updated='1. Alpha\n2. Beta\n3. Gamma';
 await expect(input).toHaveValue(updated);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(updated);
});

test('mixed prose and fenced code refuses entire selected-line transformation in both modes',async({page})=>{
 await page.goto('/');
 const source='Alpha\n~~~js\nx=1\n~~~\nBeta';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
 let messagePromise=page.waitForEvent('dialog');
 await page.locator('.toolbar-btn[data-action="task"]').click();
 let dialog=await messagePromise;
 expect(dialog.message()).toContain('fenced code block');
 await dialog.accept();
 await expect(input).toHaveValue(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await editor.click();
 await page.keyboard.press('Control+a');
 messagePromise=page.waitForEvent('dialog');
 await page.locator('.toolbar-btn[data-action="quote"]').click();
 dialog=await messagePromise;
 expect(dialog.message()).toContain('fenced code block');
 await dialog.accept();
 await expect(input).toHaveValue(source);
});
