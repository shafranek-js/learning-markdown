import {undo,redo} from './support/history-actions.js';
import {test,expect} from '@playwright/test';

test('Native Markdown list Enter handles bullets, tasks and numbers with Undo/Redo',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('- One');
 await editor.press('End');
 await editor.press('Enter');
 await expect(editor).toHaveValue('- One\n- ');
 await expect(editor).toBeFocused();
 await page.keyboard.insertText('Two');
 await editor.press('Enter');
 await expect(editor).toHaveValue('- One\n- Two\n- ');
 await undo(page);
 await expect(editor).toHaveValue('- One\n- Two');
 await redo(page);
 await expect(editor).toHaveValue('- One\n- Two\n- ');
 await editor.press('Enter');
 await expect(editor).toHaveValue('- One\n- Two\n');
 await editor.fill('9. Ordered');
 await editor.press('End');
 await editor.press('Enter');
 await expect(editor).toHaveValue('9. Ordered\n10. ');
 await editor.fill('- [x] Completed');
 await editor.press('End');
 await editor.press('Enter');
 await expect(editor).toHaveValue('- [x] Completed\n- [ ] ');
});

test('Native Tab and Shift+Tab adjust selected list lines without losing caret',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('- One\n- Two\nOutside');
 await editor.evaluate(el=>{el.focus();el.setSelectionRange(0,11);});
 await editor.press('Tab');
 await expect(editor).toHaveValue('  - One\n  - Two\nOutside');
 await expect(editor).toBeFocused();
 await editor.press('Shift+Tab');
 await expect(editor).toHaveValue('- One\n- Two\nOutside');
 await editor.fill('Ordinary');
 await editor.press('End');
 await editor.press('Tab');
 await expect(editor).toHaveValue('Ordinary  ');
 await editor.fill('- One\nPlain paragraph');
 await editor.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
 await editor.press('Tab');
 await expect(editor).toHaveValue('  - One\n  Plain paragraph');
 await editor.press('Shift+Tab');
 await expect(editor).toHaveValue('- One\nPlain paragraph');
});

test('Fenced Markdown and composition keydown are not rewritten as lists',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('~~~markdown\n- literal');
 await editor.press('End');
 await editor.press('Enter');
 await expect(editor).toHaveValue('~~~markdown\n- literal\n');
 const composed=await editor.evaluate(el=>{
  const event=new KeyboardEvent('keydown',{key:'Enter',isComposing:true,bubbles:true,cancelable:true});
  el.dispatchEvent(event);
  return {prevented:event.defaultPrevented,text:el.value};
 });
 expect(composed.prevented).toBe(false);
 expect(composed.text).toBe('~~~markdown\n- literal\n');
});
