import {test,expect} from '@playwright/test';

const longLine='A long Markdown paragraph with **bold words**, a link to [documentation](https://example.com), and many more words '.repeat(7);

test('Wrap text is enabled by default, keeps source unchanged and aligns line numbers',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input'),toggle=page.locator('#wrap-text-toggle');
 await expect(toggle).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#editor-pane')).toHaveClass(/wrap-text-enabled/);
 const source=longLine+'\nShort final line';
 await editor.fill(source);
 await expect(editor).toHaveValue(source);
 await expect(page.locator('#editor-highlight-backdrop .editor-wrap-line')).toHaveCount(2);
 await expect(page.locator('#line-gutter .editor-gutter-row')).toHaveCount(2);
 const metrics=await page.evaluate(()=>{
  const rows=[...document.querySelectorAll('#editor-highlight-backdrop .editor-wrap-line')];
  const nums=[...document.querySelectorAll('#line-gutter .editor-gutter-row')];
  const textarea=document.querySelector('#markdown-input');
  return {
   width:textarea.clientWidth,scrollWidth:textarea.scrollWidth,wrap:textarea.getAttribute('wrap'),
   rows:rows.map(n=>n.getBoundingClientRect().height),
   numbers:nums.map(n=>n.getBoundingClientRect().height),
   lineHeight:parseFloat(getComputedStyle(textarea).lineHeight)
  };
 });
 expect(metrics.wrap).toBe('soft');
 expect(metrics.rows[0]).toBeGreaterThan(metrics.lineHeight*2);
 expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width+2);
 metrics.rows.forEach((height,i)=>expect(Math.abs(metrics.numbers[i]-height)).toBeLessThan(1.5));
 await editor.evaluate(el=>el.setSelectionRange(13,13));
 await toggle.click();
 await expect(toggle).toHaveAttribute('aria-pressed','false');
 await expect(editor).toHaveAttribute('wrap','off');
 expect(await editor.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
 await expect(page.locator('#editor-highlight-backdrop .editor-wrap-line')).toHaveCount(0);
 await expect(editor).toHaveValue(source);
 expect(await editor.evaluate(el=>el.selectionStart)).toBe(13);
 await toggle.click();
 await expect(toggle).toHaveAttribute('aria-pressed','true');
 await expect(editor).toHaveValue(source);
});

test('Wrap preference survives reload, older stored states default on, and labels translate',async({page})=>{
 await page.goto('/');
 const toggle=page.locator('#wrap-text-toggle');
 await toggle.click();
 await page.locator('#lang-selector').selectOption('ru');
 await expect(toggle).toContainText('Перенос: Выкл');
 await expect(toggle).toHaveAttribute('aria-pressed','false');
 await page.reload();
 await expect(toggle).toHaveAttribute('aria-pressed','false');
 await expect(page.locator('#markdown-input')).toHaveAttribute('wrap','off');
 await toggle.click();
 await page.locator('#lang-selector').selectOption('cs');
 await expect(toggle).toContainText('Zalomení: Zap');
 await page.reload();
 await expect(toggle).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#markdown-input')).toHaveAttribute('wrap','soft');
 // Upgrades from prior releases had no wrapText field and must use the new default.
 await page.evaluate(()=>{
  const key='md_course_state_v1';
  const saved=JSON.parse(localStorage.getItem(key));
  delete saved.wrapText;
  localStorage.setItem(key,JSON.stringify(saved));
 });
 await page.reload();
 await expect(toggle).toHaveAttribute('aria-pressed','true');
});

test('CodeMirror wraps by default; toggling preserves cursors, Markdown and undo history',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input'),toggle=page.locator('#wrap-text-toggle');
 const source=longLine+'\n'+longLine;
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await expect(cm).toBeVisible();
 expect(await cm.evaluate(el=>getComputedStyle(el).whiteSpace)).toBe('pre-wrap');
 await cm.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+Alt+ArrowDown');
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await toggle.click();
 await expect(toggle).toHaveAttribute('aria-pressed','false');
 expect(await cm.evaluate(el=>getComputedStyle(el).whiteSpace)).toBe('pre');
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await expect(input).toHaveValue(source);
 await toggle.click();
 expect(await cm.evaluate(el=>getComputedStyle(el).whiteSpace)).toBe('pre-wrap');
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await cm.focus();
 await page.keyboard.insertText('!');
 await expect(input).toHaveValue('!'+longLine+'\n!'+longLine);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue('!'+longLine+'\n!'+longLine);
});
