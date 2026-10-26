import {test,expect} from '@playwright/test';

async function activateWithCursorsAtLineEnds(page,source,count){
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await page.keyboard.press('Control+a');
 await page.keyboard.press('Shift+Alt+i');
 await expect(page.locator('#multi-cursor-count')).toContainText(String(count));
 return input;
}

test('Multi-cursor Enter continues each bullet in one undoable edit',async({page})=>{
 await page.goto('/');
 const input=await activateWithCursorsAtLineEnds(page,'- First\n- Second\n- Third',3);
 await page.keyboard.press('Enter');
 const updated='- First\n- \n- Second\n- \n- Third\n- ';
 await expect(input).toHaveValue(updated);
 await expect(page.locator('#multi-cursor-count')).toContainText('3');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('- First\n- Second\n- Third');
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(updated);
});

test('Multi-cursor Enter increments ordered lists and resets checked tasks',async({page})=>{
 await page.goto('/');
 let input=await activateWithCursorsAtLineEnds(page,'1. Alpha\n9. Beta',2);
 await page.keyboard.press('Enter');
 await expect(input).toHaveValue('1. Alpha\n2. \n9. Beta\n10. ');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('1. Alpha\n9. Beta');
 await page.locator('#multi-cursor-toggle').click();
 input=page.locator('#markdown-input');
 await input.fill('- [x] Done\n- [X] Again');
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+a');
 await page.keyboard.press('Shift+Alt+i');
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await page.keyboard.press('Enter');
 await expect(input).toHaveValue('- [x] Done\n- [ ] \n- [X] Again\n- [ ] ');
});

test('Multi-cursor Enter exits empty list items without rewriting neighboring source',async({page})=>{
 await page.goto('/');
 const original='- Content\n- ';
 const input=await activateWithCursorsAtLineEnds(page,original,2);
 await page.keyboard.press('Enter');
 await expect(input).toHaveValue('- Content\n- \n');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(original);
});

test('Multi-cursor Enter delegates mixed list and prose cursors to native CodeMirror',async({page})=>{
 await page.goto('/');
 const input=await activateWithCursorsAtLineEnds(page,'- List item\nPlain paragraph',2);
 await page.keyboard.press('Enter');
 const result=await input.inputValue();
 // The fallback is CodeMirror's own Markdown continuation rather than
 // applying our custom list-only transaction to only some cursors.
 expect(result).toContain('- List item');
 expect(result).toContain('Plain paragraph');
 expect(result).not.toBe('- List item\nPlain paragraph');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('- List item\nPlain paragraph');
});

test('Multi-cursor Enter does not treat fenced list-looking text as a real list',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('~~~markdown\n- code');
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await editor.click();
 await page.keyboard.press('Control+End');
 await page.keyboard.press('Enter');
 await expect(input).toHaveValue('~~~markdown\n- code\n');
});


test('CodeMirror single-caret Tab indents Markdown list at line start and preserves typing position',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('- One');
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await cm.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('ArrowRight');
 await page.keyboard.press('ArrowRight');
 await page.keyboard.press('ArrowRight');
 await page.keyboard.press('Tab');
 await expect(input).toHaveValue('  - One');
 await page.keyboard.insertText('!');
 await expect(input).toHaveValue('  - O!ne');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('  - One');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('- One');
});

test('CodeMirror Tab in ordinary prose still inserts two spaces at the caret',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Plain');
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await cm.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('ArrowRight');
 await page.keyboard.press('ArrowRight');
 await page.keyboard.press('Tab');
 await expect(input).toHaveValue('Pl  ain');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('Plain');
});
