import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';

test('Shift+Alt+I creates one caret for each of 100 selected lines',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const lines=Array.from({length:100},(_,i)=>'Line '+(i+1));
 await input.fill(lines.join('\n'));
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await cm.click();
 await page.keyboard.press('Control+a');
 await page.keyboard.press('Shift+Alt+i');
 await expect(page.locator('#multi-cursor-count')).toContainText('100');
 await page.keyboard.type('!');
 await expect(input).toHaveValue(lines.map(line=>line+'!').join('\n'));
});

test('Shift+Alt+I limits cursors to selected lines, excluding next-line boundary',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('One\nTwo\nThree\nFour');
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await cm.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Shift+ArrowDown');
 await page.keyboard.press('Shift+ArrowDown');
 await page.keyboard.press('Shift+Alt+i');
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await page.keyboard.type('!');
 await expect(input).toHaveValue('One!\nTwo!\nThree\nFour');
});

test('multi-cursor Tab and Shift+Tab indent 100 lines once and preserve cursors',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const lines=Array.from({length:100},(_,i)=>'Item '+i);
 await input.fill(lines.join('\n'));
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+a');
 await page.keyboard.press('Shift+Alt+i');
 await expect(page.locator('#multi-cursor-count')).toContainText('100');
 await page.keyboard.press('Tab');
 await expect(input).toHaveValue(lines.map(s=>'  '+s).join('\n'));
 await expect(page.locator('#multi-cursor-count')).toContainText('100');
 await page.keyboard.press('Shift+Tab');
 await expect(input).toHaveValue(lines.join('\n'));
 await expect(page.locator('#multi-cursor-count')).toContainText('100');
 await page.keyboard.type('!');
 await expect(input).toHaveValue(lines.map(s=>s+'!').join('\n'));
});

test('multi-cursor partial selection indents only touched lines and excludes boundary',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('One\nTwo\nThree');
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Shift+ArrowDown');
 await page.keyboard.press('Shift+ArrowDown');
 await page.keyboard.press('Tab');
 await expect(input).toHaveValue('  One\n  Two\nThree');
 await page.keyboard.press('Shift+Tab');
 await expect(input).toHaveValue('One\nTwo\nThree');
});


test('100 line toolbar formatting retains carets across undo and redo',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const lines=Array.from({length:100},(_,i)=>'Topic '+(i+1));
 const original=lines.join('\n');
 const headed=lines.map(line=>'## '+line).join('\n');
 await input.fill(original);
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+a');
 await page.keyboard.press('Shift+Alt+i');
 await expect(page.locator('#multi-cursor-count')).toContainText('100');
 await page.locator('[data-action="h2"]').click();
 await expect(input).toHaveValue(headed);
 await expect(page.locator('#multi-cursor-count')).toContainText('100');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(original);
 await expect(page.locator('#multi-cursor-count')).toContainText('100');
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(headed);
 await expect(page.locator('#multi-cursor-count')).toContainText('100');
 await page.keyboard.type('!');
 await expect(input).toHaveValue(lines.map(line=>'## '+line+'!').join('\n'));
});

test('separate multi-cursor formatting actions have separate undo steps',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const original='Alpha\nBeta\nGamma',headings='## Alpha\n## Beta\n## Gamma';
 const numbered='1. ## Alpha\n2. ## Beta\n3. ## Gamma';
 await input.fill(original);
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+a');
 await page.keyboard.press('Shift+Alt+i');
 await page.locator('[data-action="h2"]').click();
 await expect(input).toHaveValue(headings);
 await page.locator('[data-action="ol"]').click();
 await expect(input).toHaveValue(numbered);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(headings);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(original);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(headings);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(numbered);
 await expect(page.locator('#multi-cursor-count')).toContainText('3');
});

test('switching to the textarea and back keeps unchanged multi-cursor session',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('First\nSecond\nThird');
 const toggle=page.locator('#multi-cursor-toggle');
 await toggle.click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+Alt+ArrowDown');
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await toggle.click();
 await expect(input).toBeVisible();
 await toggle.click();
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await page.keyboard.insertText('!');
 await expect(input).toHaveValue('!First\n!Second\nThird');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('First\nSecond\nThird');
});

test('textarea edits invalidate stale CodeMirror history when switching back',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input'),toggle=page.locator('#multi-cursor-toggle');
 await input.fill('Old\nOld');
 await toggle.click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+Alt+ArrowDown');
 await page.keyboard.insertText('!');
 await expect(input).toHaveValue('!Old\n!Old');
 await toggle.click();
 await input.fill('New content');
 await toggle.click();
 await expect(input).toHaveValue('New content');
 await expect(page.locator('#multi-cursor-count')).toContainText('1');
 await expect(page.locator('#undo-btn')).toBeDisabled();
});

test('Shift+Tab removes real leading tab characters on multiple lines',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('\tAlpha\n\tBeta\nGamma');
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+Alt+ArrowDown');
 await page.keyboard.press('Shift+Tab');
 await expect(input).toHaveValue('Alpha\nBeta\nGamma');
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('\tAlpha\n\tBeta\nGamma');
});


test('100 simultaneous inline Markdown wraps undo as one operation',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const lines=Array.from({length:100},(_,i)=>'Line '+(i+1));
 await input.fill(lines.join('\n'));
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+a');
 await page.keyboard.press('Shift+Alt+i');
 await page.locator('[data-action="bold"]').click();
 await expect(input).toHaveValue(lines.map(line=>line+'**bold text**').join('\n'));
 await expect(page.locator('#markdown-preview strong')).toHaveCount(100);
 await expect(page.locator('#multi-cursor-count')).toContainText('100');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(lines.join('\n'));
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(lines.map(line=>line+'**bold text**').join('\n'));
});


test('Ctrl+Shift+L selects all 100 occurrences for one replacement',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source=Array.from({length:100},(_,i)=>'tag '+(i+1)).join('\n');
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+d');
 await page.keyboard.press('Control+Shift+l');
 await expect(page.locator('#multi-cursor-count')).toContainText('100');
 await page.keyboard.insertText('label');
 await expect(input).toHaveValue(source.replaceAll('tag','label'));
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(source.replaceAll('tag','label'));
});

test('Escape collapses multiple selections without editing document',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('sun sun sun\nsun');
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+d');
 await page.keyboard.press('Control+Shift+l');
 await expect(page.locator('#multi-cursor-count')).toContainText('4');
 await page.keyboard.press('Escape');
 await expect(page.locator('#multi-cursor-count')).toContainText('1');
 await expect(input).toHaveValue('sun sun sun\nsun');
 await page.keyboard.insertText('!');
 await expect(input).toHaveValue('sun! sun sun\nsun');
});

test('new shortcut help is translated and includes line-end cursors',async({page})=>{
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const toggle=page.locator('#multi-cursor-toggle');
 await expect(toggle).toHaveAttribute('title',/Ctrl\+Shift\+L/);
 await expect(toggle).toHaveAttribute('title',/Shift\+Alt\+I/);
 await expect(toggle).toHaveAttribute('title',/Esc/);
 await expect(toggle).toHaveAttribute('title',/совпадения/);
 await expect(page.locator('#multi-cursor-count')).toHaveAttribute('aria-live','polite');
});


test('moving 100 CodeMirror cursors does not rewrite unchanged drafts',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const rows=Array.from({length:100},(_,i)=>'Row '+i);
 await input.fill(rows.join('\n'));
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+a');
 await page.keyboard.press('Shift+Alt+i');
 await expect(page.locator('#multi-cursor-count')).toContainText('100');
 await page.evaluate(()=>{
  const original=Storage.prototype.setItem;
  window.__draftWrites=0;
  Storage.prototype.setItem=function(key,value){
   if(key==='md_course_state_v1')window.__draftWrites++;
   return original.call(this,key,value);
  };
 });
 await page.keyboard.press('ArrowLeft');
 await page.keyboard.press('ArrowRight');
 await page.keyboard.press('Escape');
 await expect(input).toHaveValue(rows.join('\n'));
 expect(await page.evaluate(()=>window.__draftWrites)).toBe(0);
 await page.keyboard.insertText('!');
 expect(await page.evaluate(()=>window.__draftWrites)).toBeGreaterThan(0);
});

test('multi-cursor line transformations preserve cursor count through sequential operations',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('One\nTwo\nThree\nFour');
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+a');
 await page.keyboard.press('Shift+Alt+i');
 await expect(page.locator('#multi-cursor-count')).toContainText('4');
 await page.locator('[data-action="h2"]').click();
 await expect(input).toHaveValue('## One\n## Two\n## Three\n## Four');
 await page.locator('[data-action="ul"]').click();
 await expect(input).toHaveValue('- ## One\n- ## Two\n- ## Three\n- ## Four');
 await expect(page.locator('#multi-cursor-count')).toContainText('4');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('## One\n## Two\n## Three\n## Four');
 await expect(page.locator('#multi-cursor-count')).toContainText('4');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('One\nTwo\nThree\nFour');
 await page.locator('#redo-btn').click();
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue('- ## One\n- ## Two\n- ## Three\n- ## Four');
 await expect(page.locator('#multi-cursor-count')).toContainText('4');
});


test('reapplying task-list format preserves completed checkboxes',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const markdown='- [x] Completed\n- [ ] Pending\n- [X] Also completed';
 await input.fill(markdown);
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+a');
 await page.keyboard.press('Shift+Alt+i');
 await page.locator('[data-action="task"]').click();
 await expect(input).toHaveValue('- [x] Completed\n- [ ] Pending\n- [x] Also completed');
 await expect(page.locator('#markdown-preview input[type="checkbox"]:checked')).toHaveCount(2);
});

test('numbering restarts for independently selected nonadjacent lines',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Same\nMiddle\nSame');
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+d');
 await page.keyboard.press('Control+d');
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await page.locator('[data-action="ol"]').click();
 await expect(input).toHaveValue('1. Same\nMiddle\n1. Same');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('Same\nMiddle\nSame');
});


