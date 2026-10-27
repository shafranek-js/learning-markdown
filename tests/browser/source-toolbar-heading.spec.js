import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';

test('textarea H2 formats selected paragraphs, preserves blank separators and Undo/Redo',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Before\n\nFirst\n\nSecond\n\nAfter';
 await input.fill(source);
 await input.evaluate(el=>{
  el.focus();
  el.setSelectionRange(el.value.indexOf('First'),el.value.indexOf('\n\nAfter'));
 });
 await page.locator('.toolbar-btn[data-action="h2"]').click();
 const updated='Before\n\n## First\n\n## Second\n\nAfter';
 await expect(input).toHaveValue(updated);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(updated);
});

test('H1–H6 source buttons toggle headings without losing existing text',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('## Existing');
 await input.evaluate(el=>{el.focus();el.setSelectionRange(5,5);});
 await page.locator('.toolbar-btn[data-action="h2"]').click();
 await expect(input).toHaveValue('Existing');
 await page.locator('.toolbar-btn[data-action="h6"]').click();
 await expect(input).toHaveValue('###### Existing');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('Existing');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('## Existing');
});

test('empty source line creates useful heading with caret after placeholder',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('');
 await input.focus();
 await page.locator('.toolbar-btn[data-action="h3"]').click();
 await expect(input).toHaveValue('### Heading 3');
 expect(await input.evaluate(el=>el.selectionStart)).toBe('### Heading 3'.length);
});

test('single-caret heading formatting keeps the caret at end of the edited line',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('First\nSecond');
 await input.evaluate(el=>{el.focus();el.setSelectionRange(2,2);});
 await page.locator('.toolbar-btn[data-action="h1"]').click();
 await expect(input).toHaveValue('# First\nSecond');
 expect(await input.evaluate(el=>el.selectionStart)).toBe('# First'.length);
});

test('CodeMirror transforms multiline selected headings atomically and Undo restores exact source',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Alpha\n\n## Beta\nGamma';
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await page.keyboard.press('Control+a');
 await page.locator('.toolbar-btn[data-action="h3"]').click();
 const updated='### Alpha\n\n### Beta\n### Gamma';
 await expect(input).toHaveValue(updated);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(updated);
});

test('heading formatting rejects fenced blocks atomically in CodeMirror',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Before\n~~~md\nNot prose\n~~~\nAfter';
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await editor.click();
 await page.keyboard.press('Control+a');
 const handled=page.waitForEvent('dialog').then(dialog=>{
  expect(dialog.message()).toContain('fenced code block');
  return dialog.accept();
 });
 await page.locator('.toolbar-btn[data-action="h4"]').click();
 await handled;
 await expect(input).toHaveValue(source);
});

test('mobile RU heading toolbar refuses indented code and preserves draft',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const input=page.locator('#markdown-input');
 const source='Текст\n    indented code';
 await input.fill(source);
 await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
 const handled=page.waitForEvent('dialog').then(dialog=>{
  expect(dialog.message()).toContain('Форматирование не применено');
  return dialog.accept();
 });
 await page.locator('.toolbar-btn[data-action="h3"]').click();
 await handled;
 await expect(input).toHaveValue(source);
});
