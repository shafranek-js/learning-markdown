import {test,expect} from '@playwright/test';

test('textarea Tab/Shift+Tab indent mixed multi-line selections as one Undo step',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 const source='Before\n- One\n\nPlain paragraph\nAfter';
 const start=source.indexOf('- One'),end=source.indexOf('After');
 await editor.fill(source);
 await editor.evaluate((el,{start,end})=>{el.focus();el.setSelectionRange(start,end);},{start,end});
 await editor.press('Tab');
 const updated='Before\n  - One\n  \n  Plain paragraph\nAfter';
 await expect(editor).toHaveValue(updated);
 const selection=await editor.evaluate(el=>({
  start:el.selectionStart,end:el.selectionEnd,
  value:el.value.slice(el.selectionStart,el.selectionEnd)
 }));
 expect(selection.start).toBe(start+2);
 expect(selection.end).toBe(end+6);
 expect(selection.value).toBe('- One\n  \n  Plain paragraph\n');
 await editor.press('Shift+Tab');
 await expect(editor).toHaveValue(source);
 expect(await editor.evaluate(el=>[el.selectionStart,el.selectionEnd])).toEqual([start,end]);
 await page.locator('#undo-btn').click();
 await expect(editor).toHaveValue(updated);
 await page.locator('#undo-btn').click();
 await expect(editor).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(editor).toHaveValue(updated);
});

test('partial single-line selection indents the line instead of losing selected words',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('First\nA sentence\nLast');
 await editor.evaluate(el=>{
  el.focus();
  const start=el.value.indexOf('sentence');
  el.setSelectionRange(start,start+8);
 });
 await editor.press('Tab');
 await expect(editor).toHaveValue('First\n  A sentence\nLast');
 expect(await editor.evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd))).toBe('sentence');
 await editor.press('Shift+Tab');
 await expect(editor).toHaveValue('First\nA sentence\nLast');
});

test('CodeMirror multiline selection and native textarea produce the same text',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Heading\n\n- Bullet\nParagraph';
 await input.fill(source);
 await input.focus();
 await page.keyboard.press('Control+a');
 await input.press('Tab');
 const expected='  Heading\n  \n  - Bullet\n  Paragraph';
 await expect(input).toHaveValue(expected);
 await input.press('Shift+Tab');
 await expect(input).toHaveValue(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await page.keyboard.press('Control+a');
 await editor.press('Tab');
 await expect(input).toHaveValue(expected);
 await editor.press('Shift+Tab');
 await expect(input).toHaveValue(source);
});

test('CodeMirror overlapping line cursors are deduped and undo restores source',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='One\nTwo\nThree';
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await page.keyboard.press('Control+a');
 await page.keyboard.press('Shift+Alt+i');
 await expect(page.locator('#multi-cursor-count')).toContainText('3');
 await editor.press('Tab');
 await expect(input).toHaveValue('  One\n  Two\n  Three');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue('  One\n  Two\n  Three');
});

test('mobile textarea supports line indentation without breaking wrapping or focus',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 const source='První řádek\nDruhý řádek\nTřetí řádek';
 await editor.fill(source);
 await editor.focus();
 await page.keyboard.press('Control+a');
 await editor.press('Tab');
 await expect(editor).toHaveValue('  První řádek\n  Druhý řádek\n  Třetí řádek');
 await expect(editor).toBeFocused();
 await editor.press('Shift+Tab');
 await expect(editor).toHaveValue(source);
});

test('IME-composing Tab does not invoke selected-line formatting',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('Alpha\nBeta');
 const data=await editor.evaluate(el=>{
  el.focus();
  el.setSelectionRange(0,el.value.length);
  const event=new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true,isComposing:true});
  el.dispatchEvent(event);
  return {prevented:event.defaultPrevented,value:el.value};
 });
 expect(data).toEqual({prevented:false,value:'Alpha\nBeta'});
});
