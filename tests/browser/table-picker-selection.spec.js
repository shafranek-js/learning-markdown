import {test,expect} from '@playwright/test';
import {undo,redo} from './support/history-actions.js';

async function openTwoByTwo(page){
 await page.locator('#table-picker-trigger').click();
 await expect(page.locator('#table-picker-popup')).toBeVisible();
 await page.locator('.table-picker-cell[data-col="2"][data-row="2"]').click();
 await expect(page.locator('#table-picker-popup')).toBeHidden();
}

test('Word-style table picker preserves selected Markdown link and one-step history',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Before [important](https://example.org) after\n\nTail';
 await input.fill(source);
 await input.evaluate(el=>{
  const at=el.value.indexOf('important');
  el.focus();el.setSelectionRange(at,at+'important'.length);
 });
 await openTwoByTwo(page);
 const updated=await input.inputValue();
 expect(updated).toContain('Before [important](https://example.org) after\n\n');
 expect(updated).toContain('| Column 1 | Column 2 |');
 expect(updated).toContain('Tail');
 await expect(page.locator('#markdown-preview table')).toHaveCount(1);
 await undo(page);
 await expect(input).toHaveValue(source);
 await redo(page);
 await expect(input).toHaveValue(updated);
});

test('Word-style table picker preserves CodeMirror selections atomically',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Alpha\nAlpha\nAlpha';
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const content=page.locator('#codemirror-mount .cm-content');
 await expect(content).toBeVisible();
 await content.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Shift+End');
 await page.keyboard.press('Control+Shift+l');
 await expect(page.locator('#multi-cursor-count')).toContainText('3');
 await openTwoByTwo(page);
 const updated=await input.inputValue();
 expect((updated.match(/Alpha/g)||[]).length).toBe(3);
 expect((updated.match(/\| Column 1 \| Column 2 \|/g)||[]).length).toBe(3);
 await undo(page);
 await expect(input).toHaveValue(source);
 await redo(page);
 await expect(input).toHaveValue(updated);
});

test('Word-style picker rejects fenced-code selections without modifying source',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Intro\n\n~~~js\nconst source = 1;\n~~~\n\nEnd';
 await input.fill(source);
 await input.evaluate(el=>{
  const at=el.value.indexOf('const source');
  el.focus();el.setSelectionRange(at,at+'const source'.length);
 });
 const warning=page.waitForEvent('dialog').then(async dialog=>dialog.accept());
 await openTwoByTwo(page);
 await warning;
 await expect(input).toHaveValue(source);
 await expect(page.locator('#markdown-preview table')).toHaveCount(0);
});
