import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';

test('multi-cursor mode adds vertical cursors, edits lines together and uses native Undo',async({page})=>{
 await page.goto('/');
 const textarea=page.locator('#markdown-input');
 await textarea.fill('alpha\nbeta\ngamma');
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await expect(page.locator('#multi-cursor-toggle')).toHaveAttribute('aria-pressed','true');
 await editor.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+Alt+ArrowDown');
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await page.keyboard.insertText('!');
 await expect(textarea).toHaveValue('!alpha\n!beta\ngamma');
 await expect(page.locator('#markdown-preview')).toContainText('!alpha');
 await page.locator('#undo-btn').click();
 await expect(textarea).toHaveValue('alpha\nbeta\ngamma');
 await page.locator('#redo-btn').click();
 await expect(textarea).toHaveValue('!alpha\n!beta\ngamma');
 await page.locator('#multi-cursor-toggle').click();
 await expect(textarea).toBeVisible();
 await expect(textarea).toHaveValue('!alpha\n!beta\ngamma');
});

test('multi-cursor mode supports repeated occurrence selection via Ctrl+D',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('cat\ncat\ndog');
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await editor.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+d');
 await page.keyboard.press('Control+d');
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await page.keyboard.insertText('fox');
 await expect(page.locator('#markdown-input')).toHaveValue('fox\nfox\ndog');
});

test('multi-cursor mode wraps multiple selections with Markdown toolbar',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('one\ntwo');
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await editor.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+Alt+ArrowDown');
 await page.locator('[data-action="bold"]').click();
 const result=await page.locator('#markdown-input').inputValue();
 expect(result).toContain('**bold text**one');
 expect(result).toContain('**bold text**two');
 await expect(page.locator('#markdown-preview strong')).toHaveCount(2);
});

test('multi-cursor preference and Markdown source survive reload and fallback',async({page})=>{
 await page.goto('/');
 const textarea=page.locator('#markdown-input');
 await textarea.fill('# Saved heading\n\n- [x] Done');
 await page.locator('#multi-cursor-toggle').click();
 await expect(page.locator('#codemirror-mount .cm-editor')).toBeVisible();
 await page.reload();
 await expect(page.locator('#multi-cursor-toggle')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#codemirror-mount .cm-editor')).toBeVisible();
 await expect(textarea).toHaveValue('# Saved heading\n\n- [x] Done');
 await expect(page.locator('#markdown-preview h1')).toHaveText('Saved heading');
 await page.locator('#multi-cursor-toggle').click();
 await expect(textarea).toBeVisible();
 await expect(textarea).toHaveValue('# Saved heading\n\n- [x] Done');
});

test('multi-cursor editor loads without network after service worker precache',async({page,context})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('offline\nmulti-cursor');
 await page.locator('#multi-cursor-toggle').click();
 await page.waitForFunction(async()=>Boolean(navigator.serviceWorker.controller));
 await context.setOffline(true);
 try{
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#codemirror-mount .cm-editor')).toBeVisible({timeout:15000});
  await expect(page.locator('#markdown-input')).toHaveValue('offline\nmulti-cursor');
 }finally{
  await context.setOffline(false);
 }
});


test('multi-cursor mode switch localizes before the optional engine loads',async({page})=>{
 await page.goto('/');
 await setAppLanguage(page,'ru');
 await expect(page.locator('#multi-cursor-toggle')).toHaveText('Мультикурсор');
 await page.locator('#multi-cursor-toggle').click();
 await expect(page.locator('#multi-cursor-toggle')).toHaveText('Мультикурсор: ВКЛ');
 await page.locator('#multi-cursor-toggle').click();
 await expect(page.locator('#multi-cursor-toggle')).toHaveText('Мультикурсор');
});


test('Advanced inline presets apply to every CodeMirror selection with one Undo/Redo',async({page})=>{
 await page.goto('/');
 const src=page.locator('#markdown-input');
 await src.fill('Alpha\n\nAlpha\n\nUnchanged');
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await cm.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+d');
 await page.keyboard.press('Control+d');
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#advanced-color').selectOption('blue');
 await page.locator('[data-advanced-apply="color"]').click();
 await expect(page.locator('#markdown-preview .af-color-blue')).toHaveCount(2);
 const after=await src.inputValue();
 expect(after).toContain('<span class="af-color-blue">Alpha</span>');
 expect(after).toContain('Unchanged');
 await page.locator('#undo-btn').click();
 await expect(src).toHaveValue('Alpha\n\nAlpha\n\nUnchanged');
 await expect(page.locator('#markdown-preview .af-color-blue')).toHaveCount(0);
 await page.locator('#redo-btn').click();
 await expect(page.locator('#markdown-preview .af-color-blue')).toHaveCount(2);
});

test('Advanced paragraph formatting and H1–H6 act on all CodeMirror cursors',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('First\nSecond\nThird');
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await cm.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+Alt+ArrowDown');
 await page.locator('[data-action="h2"]').click();
 await expect(input).toHaveValue('## First\n## Second\nThird');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('First\nSecond\nThird');
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue('## First\n## Second\nThird');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#multi-cursor-toggle').click();
 await expect(input).toBeVisible();
});

test('Advanced rich callouts apply to both selected occurrences atomically',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Safety\n\nSafety');
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await cm.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+d');
 await page.keyboard.press('Control+d');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#rich-blocks').selectOption('warning');
 await page.locator('[data-rich-apply="blocks"]').click();
 await expect(page.locator('#markdown-preview .af-callout-warning')).toHaveCount(2);
 expect((await input.inputValue()).match(/af-callout-warning/g)).toHaveLength(2);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('Safety\n\nSafety');
});

test('multiple internal anchor insertions get distinct IDs and valid links',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Topic\n\nTopic');
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await cm.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+d');
 await page.keyboard.press('Control+d');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#rich-blocks').selectOption('anchor');
 await page.locator('[data-rich-apply="blocks"]').click();
 const markdown=await input.inputValue();
 expect(markdown).toContain('id="advanced-section"');
 expect(markdown).toContain('id="advanced-section-2"');
 await expect(page.locator('#markdown-preview #advanced-section')).toHaveCount(1);
 await expect(page.locator('#markdown-preview #advanced-section-2')).toHaveCount(1);
 await expect(page.locator('#markdown-preview a[href="#advanced-section"]')).toHaveCount(1);
 await expect(page.locator('#markdown-preview a[href="#advanced-section-2"]')).toHaveCount(1);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('Topic\n\nTopic');
});

test('multi-cursor rich numbered lists keep selected text and HTML safety',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Entry\n\nEntry');
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await cm.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+d');
 await page.keyboard.press('Control+d');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#rich-numbering').selectOption('a');
 await page.locator('[data-rich-apply="numbering"]').click();
 await expect(page.locator('#markdown-preview ol.af-list-lower-alpha')).toHaveCount(2);
 await expect(page.locator('#markdown-preview ol li')).toHaveCount(2);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('Entry\n\nEntry');
});


test('multi-cursor list tools format selected lines and undo atomically',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Apple\nBanana\nCherry');
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+Alt+ArrowDown');
 await page.locator('[data-action="task"]').click();
 await expect(input).toHaveValue('- [ ] Apple\n- [ ] Banana\nCherry');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('Apple\nBanana\nCherry');
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue('- [ ] Apple\n- [ ] Banana\nCherry');
});

test('multi-cursor ordered lists renumber chosen lines without duplicating markers',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('- Apple\n- Banana\nOther');
 await page.locator('#multi-cursor-toggle').click();
 await page.locator('#codemirror-mount .cm-content').click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+Alt+ArrowDown');
 await page.locator('[data-action="ol"]').click();
 await expect(input).toHaveValue('1. Apple\n2. Banana\nOther');
 await page.locator('[data-action="ul"]').click();
 await expect(input).toHaveValue('- Apple\n- Banana\nOther');
});

