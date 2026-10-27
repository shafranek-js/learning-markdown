import {test,expect} from '@playwright/test';

test('native editor Ctrl+M lets Tab and Shift+Tab leave without changing Markdown',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const toggle=page.locator('#tab-focus-toggle');
 await input.fill('Alpha');
 await input.focus();
 await input.press('Tab');
 await expect(input).toHaveValue('Alpha  ');
 await input.press('Control+m');
 await expect(toggle).toHaveAttribute('aria-pressed','true');
 await expect(toggle).toHaveText('Tab: Focus');
 await input.press('Tab');
 await expect(input).not.toBeFocused();
 await expect(input).toHaveValue('Alpha  ');

 await input.focus();
 await input.press('Shift+Tab');
 await expect(page.locator('#clear-editor-btn')).toBeFocused();
 await expect(input).toHaveValue('Alpha  ');

 await toggle.click();
 await expect(toggle).toHaveAttribute('aria-pressed','false');
 await input.focus();
 await input.press('Tab');
 await expect(input).toHaveValue('Alpha    ');
 await expect(input).toBeFocused();
});

test('Tab focus preference persists across page refresh and does not enter Undo history',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Text');
 await input.focus();
 await input.press('Tab');
 await expect(input).toHaveValue('Text  ');
 await input.press('Control+m');
 await expect(page.locator('#tab-focus-toggle')).toHaveAttribute('aria-pressed','true');
 const saved=await page.evaluate(()=>{
  const stored=localStorage.getItem('md_course_state_v1');
  return JSON.parse(stored).tabFocusMode;
 });
 expect(saved).toBe(true);
 await page.reload();
 await expect(page.locator('#tab-focus-toggle')).toHaveAttribute('aria-pressed','true');
 await expect(input).toHaveValue('Text  ');
 await input.focus();
 await input.press('Tab');
 await expect(input).not.toBeFocused();
 await expect(input).toHaveValue('Text  ');
});

test('CodeMirror Ctrl+M enables native keyboard focus traversal without altering source',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='One\nTwo';
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await editor.press('Control+m');
 await expect(page.locator('#tab-focus-toggle')).toHaveAttribute('aria-pressed','true');
 await editor.press('Tab');
 await expect(editor).not.toBeFocused();
 await expect(input).toHaveValue(source);
 await editor.click();
 await editor.press('Shift+Tab');
 await expect(editor).not.toBeFocused();
 await expect(input).toHaveValue(source);

 await editor.click();
 await editor.press('Control+m');
 await expect(page.locator('#tab-focus-toggle')).toHaveAttribute('aria-pressed','false');
 await editor.press('Control+a');
 await editor.press('Tab');
 await expect(input).toHaveValue('  One\n  Two');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
});

test('Tab focus mode is shared when switching textarea and CodeMirror engines',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Shared');
 await input.focus();
 await input.press('Control+m');
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await editor.press('Tab');
 await expect(editor).not.toBeFocused();
 await expect(input).toHaveValue('Shared');
 await page.locator('#multi-cursor-toggle').click();
 await input.focus();
 await input.press('Tab');
 await expect(input).not.toBeFocused();
 await expect(input).toHaveValue('Shared');
});

test('Russian mobile status, keyboard traversal and IME guards are accessible',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const toggle=page.locator('#tab-focus-toggle');
 const input=page.locator('#markdown-input');
 await expect(toggle).toHaveText('Tab: Отступ');
 await input.fill('  Пример текста');
 const composing=await input.evaluate(el=>{
  el.focus();
  const event=new KeyboardEvent('keydown',{
   key:'m',code:'KeyM',ctrlKey:true,isComposing:true,bubbles:true,cancelable:true
  });
  el.dispatchEvent(event);
  return event.defaultPrevented;
 });
 expect(composing).toBe(false);
 await expect(toggle).toHaveAttribute('aria-pressed','false');
 await input.press('Control+m');
 await expect(toggle).toHaveText('Tab: Фокус');
 await expect(toggle).toHaveAttribute('aria-pressed','true');
 await expect(input).toHaveAttribute('aria-describedby','editor-tab-help');
 await expect(page.locator('#editor-tab-help')).toContainText('Ctrl+M');
 await input.press('Tab');
 await expect(input).not.toBeFocused();
 await expect(input).toHaveValue('  Пример текста');
});


test('Tab screen-reader description is never rendered as editor text or a flex item',async({page})=>{
 await page.goto('/');
 const help=page.locator('#editor-tab-help');
 const input=page.locator('#markdown-input');
 const container=page.locator('.editor-container');
 await expect(help).toHaveAttribute('role','status');
 await expect(help).toHaveAttribute('aria-live','polite');
 await expect(input).toHaveAttribute('aria-describedby','editor-tab-help');
 const check=async()=>{
  const metrics=await page.evaluate(()=>{
   const hint=document.querySelector('#editor-tab-help');
   const parent=document.querySelector('.editor-container');
   const multi=document.querySelector('#editor-pane').classList.contains('multi-cursor-active');
   const editor=document.querySelector(multi?'#codemirror-mount':'#markdown-input');
   const style=getComputedStyle(hint);
   return {
    position:style.position,
    clipPath:style.clipPath,
    overflow:style.overflow,
    hintWidth:hint.getBoundingClientRect().width,
    hintHeight:hint.getBoundingClientRect().height,
    editorWidth:editor.getBoundingClientRect().width,
    containerWidth:parent.getBoundingClientRect().width
   };
  });
  expect(metrics.position).toBe('absolute');
  expect(metrics.clipPath).toBe('inset(50%)');
  expect(metrics.overflow).toBe('hidden');
  expect(metrics.hintWidth).toBeLessThanOrEqual(1.5);
  expect(metrics.hintHeight).toBeLessThanOrEqual(1.5);
  expect(metrics.editorWidth).toBeGreaterThan(metrics.containerWidth-2);
 };
 await check();
 await expect(help).toContainText('Ctrl+M');
 await page.locator('#tab-focus-toggle').click();
 await expect(help).toContainText('Tab moves focus');
 await check();
 await page.locator('#multi-cursor-toggle').click();
 await expect(page.locator('#codemirror-mount .cm-content')).toBeVisible();
 await check();
 await page.locator('#multi-cursor-toggle').click();
 await check();
 await expect(container).toBeVisible();
});

test('localized Tab announcement stays visually clipped on a narrow mobile pane',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const help=page.locator('#editor-tab-help');
 await expect(help).toContainText('Ctrl+M');
 await expect(help).toContainText('Tab добавляет отступ');
 const geometry=await help.evaluate(el=>{
  const style=getComputedStyle(el);
  const rect=el.getBoundingClientRect();
  return {width:rect.width,height:rect.height,position:style.position,clip:style.clipPath};
 });
 expect(geometry).toMatchObject({position:'absolute',clip:'inset(50%)'});
 expect(geometry.width).toBeLessThanOrEqual(1.5);
 expect(geometry.height).toBeLessThanOrEqual(1.5);
 await page.locator('#tab-focus-toggle').click();
 await expect(help).toContainText('Tab переводит фокус');
 await expect(page.locator('#tab-focus-toggle')).toHaveAttribute('aria-pressed','true');
});
