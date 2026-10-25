import {test,expect} from '@playwright/test';
import {mermaidSnippet} from '../../js/data/mermaid-templates.js';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

test('preview renders H1–H6 and a GFM table',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('# One\n## Two\n### Three\n#### Four\n##### Five\n###### Six\n\n| A | B |\n| --- | --- |\n| 1 | 2 |');
 for(let i=1;i<=6;i++)await expect(page.locator('#markdown-preview h'+i)).toHaveCount(1);
 await expect(page.locator('#markdown-preview table')).toHaveCount(1);
});

test('snippet Insert action is explicit, localized and edits the source',async({page})=>{
 await page.goto('/');
 const button=page.locator('#syntax-examples-container button').first();
 await expect(button).toContainText('Insert');
 await expect(button).not.toContainText(' +');
 await expect(button).toHaveAttribute('aria-label',/Insert:/);
 const input=page.locator('#markdown-input');
 const previous=await input.inputValue();
 await button.click();
 expect(await input.inputValue()).not.toBe(previous);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(previous);
 await page.locator('#redo-btn').click();
 expect(await input.inputValue()).not.toBe(previous);
});

test('standard switch changes rendering without rewriting Markdown',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='| A | B |\n| --- | --- |\n| 1 | 2 |\n\n~~removed~~';
 await input.fill(source);
 await expect(page.locator('#markdown-preview table')).toHaveCount(1);
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(page.locator('#markdown-preview table')).toHaveCount(0);
 await expect(input).toHaveValue(source);
 await page.locator('#dialect-selector').selectOption('gfm');
 await expect(page.locator('#markdown-preview table')).toHaveCount(1);
});

test('language, theme and chosen dialect survive a reload',async({page})=>{
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 await page.locator('#theme-selector').selectOption('nord');
 await page.locator('#dialect-selector').selectOption('commonmark');
 await page.reload();
 await expect(page.locator('#lang-selector')).toHaveValue('ru');
 await expect(page.locator('#theme-selector')).toHaveValue('nord');
 await expect(page.locator('#dialect-selector')).toHaveValue('commonmark');
 await expect(page.locator('#syntax-examples-container button').first()).toContainText('Вставить');
});

test('optional practice shows two exercises without altering certificate progress',async({page})=>{
 await page.goto('/');
 await page.locator('#deep-practice summary').click();
 await expect(page.locator('#deep-practice-items button')).toHaveCount(2);
 const before=await page.locator('#progress-label').innerText();
 await page.locator('#deep-practice-items button').first().click();
 await expect(page.locator('#deep-practice-progress')).toContainText('1 / 2');
 await expect(page.locator('#progress-label')).toHaveText(before);
});

test('Cheat Sheet insert is labeled and modal closes after insertion',async({page})=>{
 await page.goto('/');
 await page.locator('#cheatsheet-btn').click();
 const button=page.locator('#cheatsheet-grid button').first();
 await expect(button).toContainText('Insert');
 await expect(button).toHaveAttribute('aria-label',/Insert:/);
 await button.click();
 await expect(page.locator('#cheatsheet-modal')).toHaveClass(/hidden/);
 await expect(page.locator('#markdown-input')).toHaveValue(/Heading/);
});

test('narrow viewport keeps editor navigation available',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.locator('#mobile-tabs')).toBeVisible();
 await page.locator('#mobile-tabs button[data-mobile-tab="editor"]').click();
 await expect(page.locator('#markdown-input')).toBeVisible();
});


test('modern parser handles multiline Setext headings and hard line breaks',async({page})=>{
 await page.goto('/');
 await page.locator('#dialect-selector').selectOption('commonmark');
 const source='Foo *bar\nbaz*\n====\n\nFirst line\\\nSecond line\n';
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview h1')).toHaveCount(1);
 await expect(page.locator('#markdown-preview h1 em')).toContainText('bar');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
});

test('unsafe raw HTML is removed from rendered preview',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('<script>window.__markdownXss = true</script>\n\n<img src="missing-image.png" onerror="window.__markdownXss=true" alt="Demo">');
 await expect(page.locator('#markdown-preview script')).toHaveCount(0);
 await expect(page.locator('#markdown-preview img')).toHaveAttribute('alt','Demo');
 await expect(page.locator('#markdown-preview img')).not.toHaveAttribute('onerror',/./);
 expect(await page.evaluate(()=>window.__markdownXss)).toBeUndefined();
});


test('advanced HTML toolbar is separate, persists and supports undoable underlining',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await expect(page.locator('#advanced-toolbar')).toBeHidden();
 await page.locator('#advanced-tools-toggle').click();
 await expect(page.locator('#advanced-toolbar')).toBeVisible();
 await editor.fill('Demo');
 await editor.selectText();
 await page.locator('[data-action="adv-underline"]').click();
 await expect(editor).toHaveValue('<u>Demo</u>');
 await expect(page.locator('#markdown-preview u')).toHaveText('Demo');
 await page.locator('#undo-btn').click();
 await expect(editor).toHaveValue('Demo');
 await page.reload();
 await expect(page.locator('#advanced-toolbar')).toBeVisible();
});
test('advanced semantic HTML survives preview sanitization without unsafe attributes',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('<u>Underline</u> H<sub>2</sub>O and x<sup>2</sup> <mark>Highlight</mark>\n\n<details><summary>Expand</summary>\n\nHidden content\n</details>');
 await expect(page.locator('#markdown-preview u')).toHaveText('Underline');
 await expect(page.locator('#markdown-preview sub')).toHaveText('2');
 await expect(page.locator('#markdown-preview sup')).toHaveText('2');
 await expect(page.locator('#markdown-preview mark')).toHaveText('Highlight');
 await expect(page.locator('#markdown-preview details summary')).toHaveText('Expand');
 await page.locator('#markdown-input').fill('<u onclick="alert(1)">Test</u>');
 await expect(page.locator('#markdown-preview u')).not.toHaveAttribute('onclick',/./);
});
test('advanced HTML Lab is separate from course progress and localized',async({page})=>{
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 await page.locator('#advanced-lab summary').click();
 await expect(page.locator('#advanced-lab-examples button')).toHaveCount(5);
 await expect(page.locator('#advanced-lab-examples button').first()).toContainText('Вставить');
 const before=await page.locator('#progress-label').innerText();
 await page.locator('#advanced-lab-examples button').first().click();
 await expect(page.locator('#markdown-preview u')).toHaveCount(1);
 await expect(page.locator('#progress-label')).toHaveText(before);
});


test('Advanced presets apply foreground and highlight colors through safe classes, with Undo',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 const editor=page.locator('#markdown-input');
 await editor.fill('Sample');
 await editor.selectText();
 await page.locator('#advanced-color').selectOption('blue');
 await page.locator('[data-advanced-apply="color"]').click();
 await expect(editor).toHaveValue('<span class="af-color-blue">Sample</span>');
 await expect(page.locator('#markdown-preview span.af-color-blue')).toHaveText('Sample');
 const foreground=await page.locator('#markdown-preview span.af-color-blue').evaluate(el=>getComputedStyle(el).color);
 expect(foreground).toBe('rgb(23, 85, 165)');
 await page.locator('#undo-btn').click();
 await expect(editor).toHaveValue('Sample');
 await page.locator('#redo-btn').click();
 await expect(editor).toHaveValue('<span class="af-color-blue">Sample</span>');
 await editor.fill('Marked');
 await editor.selectText();
 await page.locator('#advanced-background').selectOption('yellow');
 await page.locator('[data-advanced-apply="background"]').click();
 await expect(page.locator('#markdown-preview .af-background-yellow')).toHaveText('Marked');
});

test('Font family, size and layout presets render using allowlisted styles',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 const editor=page.locator('#markdown-input');
 await editor.fill('Typography');
 await editor.selectText();
 await page.locator('#advanced-font').selectOption('serif');
 await page.locator('[data-advanced-apply="font"]').click();
 await expect(page.locator('#markdown-preview span.af-font-serif')).toHaveText('Typography');
 await editor.fill('Large text');
 await editor.selectText();
 await page.locator('#advanced-size').selectOption('xlarge');
 await page.locator('[data-advanced-apply="size"]').click();
 await expect(page.locator('#markdown-preview .af-size-xlarge')).toHaveText('Large text');
 await editor.fill('Centered paragraph');
 await editor.selectText();
 await page.locator('#advanced-align').selectOption('center');
 await page.locator('[data-advanced-apply="align"]').click();
 await expect(page.locator('#markdown-preview div.af-align-center')).toHaveText('Centered paragraph');
 await editor.fill('Indented text');
 await editor.selectText();
 await page.locator('#advanced-indent').selectOption('medium');
 await page.locator('[data-advanced-apply="indent"]').click();
 await expect(page.locator('#markdown-preview div.af-indent-medium')).toHaveText('Indented text');
 await editor.fill('Spaced');
 await editor.selectText();
 await page.locator('#advanced-spacing').selectOption('double');
 await page.locator('[data-advanced-apply="spacing"]').click();
 await expect(page.locator('#markdown-preview div.af-spacing-double')).toHaveText('Spaced');
});

test('Advanced preset values persist and localize without changing regular progress',async({page})=>{
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 await page.locator('#advanced-tools-toggle').click();
 const prior=await page.locator('#progress-label').innerText();
 await page.locator('#advanced-color').selectOption('purple');
 await page.reload();
 await expect(page.locator('#advanced-toolbar')).toBeVisible();
 await expect(page.locator('#advanced-color')).toHaveValue('purple');
 await expect(page.locator('[data-advanced-apply="color"]')).toHaveText('Применить');
 await expect(page.locator('#progress-label')).toHaveText(prior);
});

test('HTML export keeps safe preset CSS and print page breaks but strips unsafe HTML',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#markdown-input').fill('<span class="af-color-blue evil-class" style="color:red" onclick="alert(1)">Safe</span>\n\n<div class="af-page-break"></div>');
 const span=page.locator('#markdown-preview span.af-color-blue');
 await expect(span).toHaveText('Safe');
 await expect(span).toHaveAttribute('class','af-color-blue');
 await expect(span).not.toHaveAttribute('style',/./);
 await expect(span).not.toHaveAttribute('onclick',/./);
 await expect(page.locator('#markdown-preview div.af-page-break')).toHaveCount(1);
 const promise=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const dl=await promise;
 const {readFile}=await import('node:fs/promises');
 const exported=await readFile(await dl.path(),'utf8');
 expect(exported).toContain('class="md-preview"');
 expect(exported).toContain('.md-preview .af-color-blue');
 expect(exported).toContain('break-after:page');
 expect(exported).toContain('class="af-page-break"');
 expect(exported).not.toContain('onclick="alert');
 expect(exported).not.toContain('evil-class');
});


test('Advanced formatting remains accessible on a narrow mobile viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await expect(page.locator('#advanced-toolbar')).toBeVisible();
 await page.locator('#mobile-tabs button[data-mobile-tab="editor"]').click();
 const editor=page.locator('#markdown-input');
 await editor.fill('Mobile');
 await editor.selectText();
 await page.locator('#advanced-size').selectOption('large');
 await page.locator('[data-advanced-apply="size"]').click();
 await expect(editor).toHaveValue('<span class="af-size-large">Mobile</span>');
 await page.locator('#advanced-page-break').click();
 await expect(editor).toHaveValue(/af-page-break/);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await expect(page.locator('#markdown-preview .af-page-break')).toHaveCount(1);
});


test('rich HTML table templates render merged cells and preset decorations',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await expect(page.locator('#advanced-rich-toolbar')).toBeVisible();
 const input=page.locator('#markdown-input');
 await input.fill('');
 await page.locator('#rich-tables').selectOption('colspan');
 await page.locator('[data-rich-apply="tables"]').click();
 await expect(page.locator('#markdown-preview th[colspan="2"]')).toHaveText('Merged heading');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('');
 await page.locator('#rich-tables').selectOption('rowspan');
 await page.locator('[data-rich-apply="tables"]').click();
 await expect(page.locator('#markdown-preview th[rowspan="2"]')).toHaveText('Merged label');
 await input.fill('');
 await page.locator('#rich-tables').selectOption('colored');
 await page.locator('[data-rich-apply="tables"]').click();
 await expect(page.locator('#markdown-preview .af-cell-blue')).toHaveCount(1);
 await page.locator('#rich-tables').selectOption('borderless');
 await input.fill('');
 await page.locator('[data-rich-apply="tables"]').click();
 await expect(page.locator('#markdown-preview table.af-table-borderless')).toHaveCount(1);
});

test('translated rich HTML lab offers all 14 examples and does not change course progress',async({page})=>{
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 await page.locator('#advanced-lab summary').click();
 const items=page.locator('#advanced-rich-lab-examples button');
 await expect(items).toHaveCount(14);
 await expect(items.first()).toContainText('Вставить');
 const before=await page.locator('#progress-label').innerText();
 await page.locator('#markdown-input').fill('');
 await page.locator('[data-rich-example="blocks:warning"]').click();
 await expect(page.locator('#markdown-preview .af-callout-warning')).toHaveCount(1);
 await expect(page.locator('#progress-label')).toHaveText(before);
});

test('rich callout selection is HTML-escaped and settings are persisted',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 const editor=page.locator('#markdown-input');
 await editor.fill('Read < carefully & safely');
 await editor.selectText();
 await page.locator('#rich-blocks').selectOption('warning');
 await page.locator('[data-rich-apply="blocks"]').click();
 await expect(page.locator('#markdown-preview .af-callout-warning p')).toHaveText('Read < carefully & safely');
 await expect(page.locator('#markdown-preview .af-callout-warning script')).toHaveCount(0);
 await page.reload();
 await expect(page.locator('#advanced-toolbar')).toBeVisible();
 await expect(page.locator('#rich-blocks')).toHaveValue('warning');
});

test('internal anchors do not reset the lesson URL hash when clicked',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#markdown-input').fill('');
 const hash=await page.evaluate(()=>location.hash);
 await page.locator('#rich-blocks').selectOption('anchor');
 await page.locator('[data-rich-apply="blocks"]').click();
 await expect(page.locator('#markdown-preview #advanced-section')).toBeVisible();
 await page.locator('#markdown-preview a[href="#advanced-section"]').click();
 expect(await page.evaluate(()=>location.hash)).toBe(hash);
 await page.locator('[data-rich-apply="blocks"]').click();
 await expect(page.locator('#markdown-preview #advanced-section-2')).toHaveCount(1);
});

test('custom alphabetic and Roman lists use semantic ol type attributes',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 const editor=page.locator('#markdown-input');
 await editor.fill('Alpha\nBeta');
 await editor.selectText();
 await page.locator('#rich-numbering').selectOption('a');
 await page.locator('[data-rich-apply="numbering"]').click();
 await expect(page.locator('#markdown-preview ol[type="a"] li')).toHaveCount(2);
 await expect(page.locator('#markdown-preview ol[type="a"] li').first()).toHaveText('Alpha');
 await editor.fill('');
 await page.locator('#rich-numbering').selectOption('I');
 await page.locator('[data-rich-apply="numbering"]').click();
 await expect(page.locator('#markdown-preview ol[type="I"] li')).toHaveCount(3);
});

test('export retains rich styles, merged cells, callouts, list types and internal anchors',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('<table class="af-table-outline"><tr><td colspan="2" class="af-cell-sand">Merged</td></tr></table>\n\n<div class="af-callout-info">Info</div>\n\n<ol type="i"><li>One</li></ol>\n\n<div id="anchor-a">Target</div>\n\n[Jump](#anchor-a)');
 await expect(page.locator('#markdown-preview .af-cell-sand')).toHaveCount(1);
 const wait=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const dl=await wait;
 const {readFile}=await import('node:fs/promises');
 const source=await readFile(await dl.path(),'utf8');
 expect(source).toContain('.md-preview .af-cell-sand');
 expect(source).toContain('.md-preview .af-callout-info');
 expect(source).toContain('colspan="2"');
 expect(source).toContain('type="i"');
 expect(source).toContain('href="#anchor-a"');
 expect(source).toContain('id="anchor-a"');
});

test('mobile rich templates remain operable without expanding standard toolbar',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#mobile-tabs button[data-mobile-tab="editor"]').click();
 await expect(page.locator('#advanced-rich-toolbar')).toBeVisible();
 await page.locator('#markdown-input').fill('');
 await page.locator('#rich-blocks').selectOption('success');
 await page.locator('[data-rich-apply="blocks"]').click();
 await expect(page.locator('#markdown-input')).toHaveValue(/af-callout-success/);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await expect(page.locator('#markdown-preview .af-callout-success')).toBeVisible();
});


test('Advanced curriculum navigation keeps the base course progress separate',async({page})=>{
 await page.goto('/');
 const base=await page.locator('#progress-label').innerText();
 await page.locator('#advanced-course-btn').click();
 await expect(page.locator('#lesson-badge')).toContainText('1 / 7');
 await expect(page.locator('#lesson-nav-list button')).toHaveCount(15);
 await expect(page.locator('#lesson-title')).toContainText('Portability');
 await expect(page.locator('#advanced-toolbar')).toBeVisible();
 await expect(page.locator('#deep-practice')).toBeHidden();
 await expect(page.locator('#progress-label')).toHaveText(base);
 await expect(page.locator('#advanced-progress-label')).toContainText('0 / 7');
});

test('All seven Beyond Markdown lesson solutions earn an independent 7/7 certificate',async({page})=>{
 await page.goto('/');
 const basicProgress=await page.locator('#progress-label').innerText();
 await page.locator('#advanced-course-btn').click();
 for(let i=0;i<7;i++){
  if(i>0)await page.locator('#next-lesson-btn').click();
  await page.locator('#toggle-hint-btn').click();
  await page.locator('#insert-solution-btn').click();
  const count=i===6?6:3;
  await expect(page.locator('#tasks-counter-badge')).toHaveText(count+' / '+count);
  await expect(page.locator('#lesson-status-pill')).toContainText('Completed');
 }
 await expect(page.locator('#advanced-progress-label')).toContainText('7 / 7');
 await expect(page.locator('#progress-label')).toHaveText(basicProgress);
 await page.locator('#advanced-cert-top-btn').click();
 await expect(page.locator('#advanced-cert-count')).toHaveText('7 / 7');
 await expect(page.locator('#download-advanced-cert')).toBeEnabled();
 await expect(page.locator('#copy-advanced-cert')).toBeEnabled();
});

test('Advanced drafts and completion are independent and persist after reload',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-course-btn').click();
 await page.locator('#markdown-input').fill('<u>Persisted advanced draft</u>');
 await expect(page.locator('#tasks-counter-badge')).toHaveText('1 / 3');
 await page.reload();
 await expect(page.locator('#markdown-input')).toHaveValue('<u>Persisted advanced draft</u>');
 await expect(page.locator('#lesson-badge')).toContainText('1 / 7');
 await page.locator('#contents-toggle-btn').click();
 await expect(page.locator('#lesson-nav-list button')).toHaveCount(15);
 await page.locator('#lesson-nav-list button').first().click();
 await expect(page.locator('#markdown-input')).not.toHaveValue('<u>Persisted advanced draft</u>');
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#lesson-nav-list button').nth(8).click();
 await expect(page.locator('#markdown-input')).toHaveValue('<u>Persisted advanced draft</u>');
});

test('Advanced certificate cannot be downloaded before completion and escapes user name',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-cert-top-btn').click();
 await expect(page.locator('#download-advanced-cert')).toBeDisabled();
 await expect(page.locator('#copy-advanced-cert')).toBeDisabled();
 await page.locator('#close-advanced-certificate-btn').click();
 await page.evaluate(()=>{
  const state=JSON.parse(localStorage.getItem('md_course_state_v1'));
  state.completedAdvancedLessons=['04_01','04_02','04_03','04_04','04_05','04_06','04_07'];
  localStorage.setItem('md_course_state_v1',JSON.stringify(state));
 });
 await page.reload();
 await page.locator('#advanced-cert-top-btn').click();
 await page.locator('#advanced-cert-name').fill('<img src=x onerror=alert(1)>');
 const waiting=page.waitForEvent('download');
 await page.locator('#download-advanced-cert').click();
 const download=await waiting;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await download.path(),'utf8');
 expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
 expect(html).not.toContain('<img src=x');
 expect(html).toContain('7 / 7');
 expect(html).not.toContain('onclick=');
});

test('All advanced lessons translate into Czech, Ukrainian, Romanian and Russian',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-course-btn').click();
 for(const [lang,title] of [['ru','HTML и совместимость'],['cs','HTML a přenositelnost'],['uk','HTML і сумісність'],['ro','HTML și compatibilitate']]){
  await page.locator('#lang-selector').selectOption(lang);
  await expect(page.locator('#lesson-title')).toHaveText(title);
  await expect(page.locator('#tasks-counter-badge')).toHaveText('0 / 3');
 }
});


test('Resetting core course preserves advanced completion and advanced drafts',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-course-btn').click();
 await page.locator('#markdown-input').fill('<u>Saved advanced draft</u>');
 await expect(page.locator('#tasks-counter-badge')).toHaveText('1 / 3');
 await page.locator('#toggle-hint-btn').click();
 await page.locator('#insert-solution-btn').click();
 await expect(page.locator('#advanced-progress-label')).toContainText('1 / 7');
 const advancedDraft=await page.locator('#markdown-input').inputValue();
 await page.locator('#contents-toggle-btn').click();
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#reset-course-btn').click();
 await expect(page.locator('#progress-label')).toContainText('0');
 await expect(page.locator('#advanced-progress-label')).toContainText('1 / 7');
 await page.locator('#advanced-course-btn').click();
 await expect(page.locator('#markdown-input')).toHaveValue(advancedDraft);
});


test('Portability panel diagnoses Markdown differences without treating code as active HTML',async({page})=>{
 await page.goto('/');
 await page.locator('#compatibility-panel summary').click();
 const input=page.locator('#markdown-input');
 await input.fill('# Safe heading\n\n**Portable text**');
 await expect(page.locator('#compatibility-advanced-status')).toHaveText('Not detected');
 await input.fill('| A | B |\n| --- | --- |\n| 1 | 2 |');
 await expect(page.locator('#compatibility-gfm-status')).toHaveText('May differ');
 await input.fill('~~~html\n<span class="af-color-blue">Code only</span>\n~~~');
 await expect(page.locator('#compatibility-advanced-status')).toHaveText('Not detected');
 await input.fill('<u>Underlined</u>');
 await expect(page.locator('#compatibility-advanced-status')).toContainText('May be removed');
});

test('Markdown download warns about portability but keeps source bytes unchanged',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='<div class="af-align-center">Centered</div>';
 await input.fill(source);
 page.once('dialog',dialog=>dialog.dismiss());
 await page.locator('#download-md-btn').click();
 page.once('dialog',dialog=>{expect(dialog.message()).toContain('HTML/CSS');dialog.accept();});
 const pending=page.waitForEvent('download');
 await page.locator('#download-md-btn').click();
 const artifact=await pending;
 const {readFile}=await import('node:fs/promises');
 const file=await readFile(await artifact.path(),'utf8');
 expect(file).toBe(source);
 await input.fill('# Ordinary document');
 const second=page.waitForEvent('download');
 await page.locator('#download-md-btn').click();
 await second;
});

test('Standalone exported HTML uses strict CSP and preserves print-only page breaks',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('<h1>Printable document</h1>\n\n<div class="af-page-break"></div>\n\n<div class="af-align-center">Page two</div>\n\n<script>alert(1)</script>');
 const pending=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const result=await pending;
 const {readFile}=await import('node:fs/promises');
 const output=await readFile(await result.path(),'utf8');
 expect(output).toContain('script-src &#39;none&#39;');
 expect(output).toContain('object-src &#39;none&#39;');
 expect(output).toContain('break-after:page');
 expect(output).not.toContain('<script>alert(1)</script>');
 await page.setContent(output);
 await page.emulateMedia({media:'print'});
 const style=await page.locator('.af-page-break').evaluate(node=>getComputedStyle(node).breakAfter);
 expect(style).toBe('page');
 const pdf=await page.pdf({format:'A4',printBackground:true});
 expect(pdf.subarray(0,5).toString()).toBe('%PDF-');
 expect(pdf.length).toBeGreaterThan(1500);
});

test('Print / PDF opens a printable HTML copy rather than printing the application UI',async({page,context})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('<u>Print-only document</u>\n\n<div class="af-page-break"></div>');
 const nextPage=context.waitForEvent('page');
 await page.locator('#print-document-btn').click();
 const printable=await nextPage;
 await printable.waitForLoadState('domcontentloaded');
 await expect(printable.locator('main.md-preview u')).toHaveText('Print-only document');
 await expect(printable.locator('main.md-preview .af-page-break')).toHaveCount(1);
 await expect(printable.locator('#contents-toggle-btn')).toHaveCount(0);
 await printable.close();
});

test('Offline reload uses the versioned service-worker shell and still renders Markdown',async({page,context})=>{
 await page.goto('/');
 await page.waitForFunction(async()=>{
  if(!('serviceWorker' in navigator))return false;
  await navigator.serviceWorker.ready;
  return !!navigator.serviceWorker.controller;
 },null,{timeout:15000});
 const source='# Offline heading\n\n**Available without a connection**';
 await page.locator('#markdown-input').fill(source);
 await context.setOffline(true);
 try{
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#markdown-input')).toHaveValue(source);
  await expect(page.locator('#markdown-preview h1')).toHaveText('Offline heading');
 }finally{await context.setOffline(false);}
});


test('GFM checklist shows checked state and Preview clicks edit source with Undo/Redo',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('- [x] Completed task\n- [ ] Open task');
 const boxes=page.locator('#markdown-preview li input[type="checkbox"]');
 await expect(boxes).toHaveCount(2);
 await expect(boxes.first()).toBeChecked();
 await expect(boxes.nth(1)).not.toBeChecked();
 await expect(boxes.first()).toBeEnabled();
 await boxes.nth(1).check();
 await expect(editor).toHaveValue('- [x] Completed task\n- [x] Open task');
 await expect(boxes.nth(1)).toBeChecked();
 await boxes.first().uncheck();
 await expect(editor).toHaveValue('- [ ] Completed task\n- [x] Open task');
 await page.locator('#undo-btn').click();
 await expect(boxes.first()).toBeChecked();
 await page.locator('#redo-btn').click();
 await expect(boxes.first()).not.toBeChecked();
 await page.reload();
 await expect(boxes.first()).not.toBeChecked();
 await expect(boxes.nth(1)).toBeChecked();
});

test('GFM task clicks preserve nested lists and fenced-code examples',async({page})=>{
 await page.goto('/');
 const source='- [x] Same\n  - [ ] Same\n- [x] Same\n\n~~~md\n- [ ] Code only\n~~~';
 await page.locator('#markdown-input').fill(source);
 const boxes=page.locator('#markdown-preview input[data-task-index]');
 await expect(boxes).toHaveCount(3);
 await boxes.nth(1).check();
 await expect(page.locator('#markdown-input')).toHaveValue(source.replace('  - [ ] Same','  - [x] Same'));
 await expect(boxes.nth(0)).toBeChecked();
 await expect(boxes.nth(2)).toBeChecked();
});

test('exported checkboxes retain checked and disabled attributes while remaining safe',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('- [x] Done\n- [ ] Pending\n\n<input type="checkbox" onclick="alert(1)" checked>');
 const boxes=page.locator('#markdown-preview li input');
 await expect(boxes).toHaveCount(2);
 await expect(boxes.first()).toBeDisabled();
 const promise=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const file=await promise;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('checked=""');
 expect(html).toContain('disabled=""');
 expect(html).not.toContain('onclick=');
});

test('CommonMark treats GFM task markers as text, not interactive checkboxes',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('- [x] Done\n- [ ] Pending');
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(page.locator('#markdown-preview input[type="checkbox"]')).toHaveCount(0);
});


test('Word-like picker selects a 5 by 4 grid and generates an undoable GFM table',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('');
 await page.locator('#table-picker-trigger').click();
 await expect(page.locator('#table-picker-popup')).toBeVisible();
 await page.locator('.table-picker-cell[data-col="5"][data-row="4"]').hover();
 await expect(page.locator('#table-picker-size')).toContainText('5 × 4');
 await expect(page.locator('.table-picker-cell.selected')).toHaveCount(20);
 await page.locator('.table-picker-cell[data-col="5"][data-row="4"]').click();
 await expect(page.locator('#table-picker-popup')).toBeHidden();
 await expect(page.locator('#markdown-preview table th')).toHaveCount(5);
 await expect(page.locator('#markdown-preview table tbody tr')).toHaveCount(3);
 await expect(input).toHaveValue(/\| Column 5 \|/);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('');
 await page.locator('#redo-btn').click();
 await expect(page.locator('#markdown-preview table th')).toHaveCount(5);
});

test('picker restores the source caret and inserts table in the correct place',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Before\n\nAfter');
 await input.evaluate(x=>{x.focus();x.setSelectionRange(8,8);});
 await page.locator('#table-picker-trigger').click();
 await page.locator('.table-picker-cell[data-col="2"][data-row="2"]').click();
 const source=await input.inputValue();
 expect(source.indexOf('Column 1')).toBeGreaterThan(source.indexOf('Before'));
 expect(source.indexOf('Column 1')).toBeLessThan(source.indexOf('After'));
});

test('manual sizes, Russian labels and accessible arrow-key navigation',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('');
 await page.locator('#lang-selector').selectOption('ru');
 await page.locator('#table-picker-trigger').click();
 await expect(page.locator('#table-picker-title')).toHaveText('Вставить таблицу');
 await page.locator('#table-picker-columns').fill('12');
 await page.locator('#table-picker-rows').fill('9');
 await page.locator('#table-picker-insert').click();
 await expect(page.locator('#markdown-preview table th')).toHaveCount(12);
 await expect(page.locator('#markdown-preview table tbody tr')).toHaveCount(8);
 await page.locator('#table-picker-trigger').focus();
 await page.keyboard.press('ArrowDown');
 await expect(page.locator('#table-picker-popup')).toBeVisible();
 await page.keyboard.press('ArrowRight');
 await expect(page.locator('#table-picker-size')).toContainText('2 × 1');
 await page.keyboard.press('Escape');
 await expect(page.locator('#table-picker-popup')).toBeHidden();
});

test('picker remains accessible on mobile and warns in non-GFM mode',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#dialect-selector').selectOption('commonmark');
 await page.locator('#table-picker-trigger').click();
 await expect(page.locator('#table-picker-popup')).toBeInViewport();
 await expect(page.locator('#table-picker-mode-hint')).toBeVisible();
 await page.locator('#table-picker-cancel').click();
 await expect(page.locator('#table-picker-popup')).toBeHidden();
});


test('Preview table context menu inserts/deletes GFM rows and columns with Undo',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('| A | B |\n| --- | --- |\n| Alpha | Beta |');
 await page.locator('#markdown-preview tbody td').first().click();
 await expect(page.locator('#table-edit-bar')).toBeVisible();
 await page.locator('#table-edit-rows').selectOption('row-below');
 await expect(page.locator('#markdown-preview tbody tr')).toHaveCount(2);
 await expect(editor).toHaveValue(/\| Alpha \| Beta \|/);
 await page.locator('#undo-btn').click();
 await expect(page.locator('#markdown-preview tbody tr')).toHaveCount(1);
 await page.locator('#markdown-preview tbody td').first().click();
 await page.locator('#table-edit-cols').selectOption('column-right');
 await expect(page.locator('#markdown-preview thead th')).toHaveCount(3);
 await page.locator('#markdown-preview tbody td').first().click();
 await page.locator('#table-edit-cols').selectOption('delete-column');
 await expect(page.locator('#markdown-preview thead th')).toHaveCount(2);
});
test('Shift-selection merges GFM cells as safe HTML, supports split and Undo',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('| A | B |\n| --- | --- |\n| Alpha | Beta |');
 const cells=page.locator('#markdown-preview tbody td');
 await cells.first().click();
 await cells.nth(1).click({modifiers:['Shift']});
 await expect(page.locator('#markdown-preview .table-edit-selected')).toHaveCount(2);
 await page.locator('#table-edit-merge').selectOption('merge');
 await expect(page.locator('#markdown-preview td[colspan="2"]')).toHaveText('AlphaBeta');
 await expect(editor).toHaveValue(/<table/);
 await page.locator('#undo-btn').click();
 await expect(editor).not.toHaveValue(/<table/);
 await page.locator('#redo-btn').click();
 await expect(page.locator('#markdown-preview td[colspan="2"]')).toHaveCount(1);
 await page.locator('#markdown-preview td[colspan="2"]').click();
 await page.locator('#table-edit-merge').selectOption('split');
 await expect(page.locator('#markdown-preview td[colspan="2"]')).toHaveCount(0);
 await expect(page.locator('#markdown-preview tbody td')).toHaveCount(2);
});
test('HTML table formatting preserves cells, sanitizer and downloaded HTML',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('<table class="af-table-outline"><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>');
 await page.locator('#markdown-preview td').first().click();
 await page.locator('#table-edit-style').selectOption('cell-blue');
 await expect(page.locator('#markdown-preview td.af-cell-blue')).toHaveCount(1);
 await page.locator('#markdown-preview td').first().click();
 await page.locator('#table-edit-style').selectOption('borderless');
 await expect(page.locator('#markdown-preview table.af-table-borderless')).toHaveCount(1);
 const promise=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const download=await promise;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await download.path(),'utf8');
 expect(html).toContain('af-table-borderless');
 expect(html).toContain('af-cell-blue');
 expect(html).not.toContain('onclick=');
});
test('Existing table edit menu localizes and remains reachable on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 await page.locator('#markdown-input').fill('| A | B |\n| --- | --- |\n| One | Two |');
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview tbody td').first().click();
 await expect(page.locator('#table-edit-title')).toHaveText('Изменить таблицу');
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
 await page.locator('#table-edit-close').click();
 await expect(page.locator('#table-edit-bar')).toBeHidden();
});


test('editing an existing GFM table cell remains GFM, supports Undo/Redo and exports',async({page})=>{
 await page.goto('/');
 const source='Before\n\n| A | B |\n| --- | --- |\n| Alpha | Beta |\n\nAfter';
 await page.locator('#markdown-input').fill(source);
 await page.locator('#markdown-preview tbody td').first().click();
 await expect(page.locator('#table-edit-content-input')).toHaveValue('Alpha');
 await page.locator('#table-edit-content-input').fill('Changed | value <script>');
 await page.locator('#table-edit-content-save').click();
 const updated=await page.locator('#markdown-input').inputValue();
 expect(updated).toContain('Changed \\| value &lt;script&gt;');
 expect(updated).not.toContain('<table');
 expect(updated).toContain('Before');
 expect(updated).toContain('After');
 await expect(page.locator('#markdown-preview tbody td').first()).toHaveText('Changed | value <script>');
 await page.locator('#undo-btn').click();
 await expect(page.locator('#markdown-preview tbody td').first()).toHaveText('Alpha');
 await page.locator('#redo-btn').click();
 await expect(page.locator('#markdown-preview tbody td').first()).toHaveText('Changed | value <script>');
 const pending=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const file=await pending;
 const {readFile}=await import('node:fs/promises');
 const output=await readFile(await file.path(),'utf8');
 expect(output).not.toContain('<script>');
 expect(output).toContain('Changed');
});
test('editing a merged HTML cell retains rowspan/colspan and escapes entered HTML',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('<table class="af-table-outline"><tr><td colspan="2">Combined</td></tr><tr><td>Left</td><td>Right</td></tr></table>');
 await page.locator('#markdown-preview td[colspan="2"]').click();
 await expect(page.locator('#table-edit-content-input')).toHaveValue('Combined');
 await page.locator('#table-edit-content-input').fill('Safe <img onerror="alert(1)">');
 await page.locator('#table-edit-content-save').click();
 await expect(page.locator('#markdown-preview td[colspan="2"]')).toHaveText('Safe <img onerror="alert(1)">');
 const text=await page.locator('#markdown-input').inputValue();
 expect(text).toContain('colspan="2"');
 expect(text).toContain('&lt;img');
 expect(text).not.toContain('<img');
 await expect(page.locator('#markdown-preview tbody td')).toHaveCount(3);
});
test('table cell content editor works in Russian mobile Preview',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 await page.locator('#markdown-input').fill('| A |\n| --- |\n| Original |');
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview tbody td').click();
 await expect(page.locator('#table-edit-content-save')).toHaveText('Сохранить ячейку');
 await page.locator('#table-edit-content-input').fill('Изменено');
 await page.locator('#table-edit-content-input').press('Enter');
 await expect(page.locator('#markdown-preview tbody td')).toHaveText('Изменено');
});


test('Advanced formatting groups can filter ribbon controls and persist across reload',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await expect(page.locator('#advanced-category-nav button')).toHaveCount(6);
 await page.locator('[data-advanced-category="tables"]').click();
 await expect(page.locator('#rich-tables')).toBeVisible();
 await expect(page.locator('#advanced-color')).toBeHidden();
 await expect(page.locator('#rich-blocks')).toBeHidden();
 await page.reload();
 await expect(page.locator('[data-advanced-category="tables"]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#rich-tables')).toBeVisible();
 await page.locator('[data-advanced-category="paragraph"]').click();
 await expect(page.locator('#advanced-align')).toBeVisible();
 await expect(page.locator('#advanced-page-break')).toBeVisible();
 await expect(page.locator('#rich-tables')).toBeHidden();
 await page.locator('[data-advanced-category="all"]').click();
 await expect(page.locator('#advanced-color')).toBeVisible();
 await expect(page.locator('#rich-tables')).toBeVisible();
});


test('custom ordered-list types are case-sensitive in Preview and downloaded HTML',async({page})=>{
 await page.goto('/');
 const types=['a','A','i','I','1'];
 const styles=['lower-alpha','upper-alpha','lower-roman','upper-roman','decimal'];
 const source=types.map(t=>'<ol type="'+t+'"><li>First</li><li>Second</li><li>Third</li></ol>').join('\n\n');
 await page.locator('#markdown-input').fill(source);
 const lists=page.locator('#markdown-preview ol');
 await expect(lists).toHaveCount(types.length);
 for(let i=0;i<types.length;i++){
  await expect(lists.nth(i)).toHaveAttribute('type',types[i]);
  expect(await lists.nth(i).evaluate(el=>getComputedStyle(el).listStyleType)).toBe(styles[i]);
 }
 const pending=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const file=await pending;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('class="af-list-lower-alpha"');
 expect(html).toContain('class="af-list-upper-alpha"');
 await page.setContent(html);
 const exported=page.locator('main.md-preview ol');
 await expect(exported).toHaveCount(types.length);
 for(let i=0;i<types.length;i++)
  expect(await exported.nth(i).evaluate(el=>getComputedStyle(el).listStyleType)).toBe(styles[i]);
});


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
 await page.locator('#lang-selector').selectOption('ru');
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
 await page.locator('#lang-selector').selectOption('ru');
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


test('issue #8 GFM alignment survives live Preview, standalone HTML and print',async({page})=>{
 await page.goto('/');
 const source='| Product | Quantity | Price |\n| :--- | :---: | ---: |\n| Box | 12 | 99.50 |';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 const expected=['left','center','right'];
 for(const scope of ['thead th','tbody td']){
  const cells=page.locator('#markdown-preview '+scope);
  await expect(cells).toHaveCount(3);
  for(let i=0;i<3;i++){
   await expect(cells.nth(i)).toHaveAttribute('align',expected[i]);
   expect(await cells.nth(i).evaluate(el=>getComputedStyle(el).textAlign)).toBe(expected[i]);
  }
 }
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const download=await downloadPromise;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await download.path(),'utf8');
 for(const align of expected)expect(html).toContain('align="'+align+'"');
 // CSS is minified in production; verify actual computed styles below instead.
 expect(html).not.toContain('<script');
 await page.setContent(html);
 for(const scope of ['thead th','tbody td']){
  for(let i=0;i<3;i++){
   expect(await page.locator('main.md-preview '+scope).nth(i)
    .evaluate(el=>getComputedStyle(el).textAlign)).toBe(expected[i]);
  }
 }
 await page.emulateMedia({media:'print'});
 for(let i=0;i<3;i++)
  expect(await page.locator('main.md-preview tbody td').nth(i)
   .evaluate(el=>getComputedStyle(el).textAlign)).toBe(expected[i]);
});

test('issue #8 sanitizer rejects injected alignment and styling',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='<table><tr><td align="right" onclick="alert(1)" style="text-align:left">OK</td>'
 +'<td align="center;position:fixed" style="color:red">Bad</td></tr></table>';
 await input.fill(source);
 const cells=page.locator('#markdown-preview td');
 await expect(cells).toHaveCount(2);
 await expect(cells.first()).toHaveAttribute('align','right');
 await expect(cells.first()).not.toHaveAttribute('onclick',/./);
 await expect(cells.first()).not.toHaveAttribute('style',/./);
 await expect(cells.nth(1)).not.toHaveAttribute('align',/./);
 await expect(cells.nth(1)).not.toHaveAttribute('style',/./);
 await expect(input).toHaveValue(source);
 await page.locator('#dialect-selector').selectOption('commonmark');
 await input.fill('| A | B |\n| :--- | ---: |\n| x | y |');
 await expect(page.locator('#markdown-preview table')).toHaveCount(0);
});



test('issue #9 six fenced languages are highlighted and safely exported',async({page})=>{
 await page.goto('/');
 const source=[
  '~~~javascript','const n = 42;','~~~',
  '~~~json','{"active": true, "count": 3}','~~~',
  '~~~html','<div title="hi">& text</div>','~~~',
  '~~~css','.demo { color: red; }','~~~',
  '~~~sql','SELECT id FROM products;','~~~',
  '~~~python','def greet(name):','    return name','~~~',
  '~~~unknown','<script>alert(1)</script>','~~~'
 ].join('\n\n').replace(/\n\n(?=~~~)/g,'\n');
 const input=page.locator('#markdown-input');
 await input.fill(source);
 const blocks=page.locator('#markdown-preview pre > code');
 await expect(blocks).toHaveCount(7);
 for(let i=0;i<6;i++){
  await expect(blocks.nth(i).locator('span[class^="hljs-"]').first()).toBeVisible();
  // Check actual colored output, not a particular grammar's first token.
  const colors=await blocks.nth(i).locator('span[class^="hljs-"]')
   .evaluateAll(nodes=>nodes.map(el=>getComputedStyle(el).color));
  expect(colors.some(color=>color!=='rgb(248, 250, 252)')).toBe(true);
 }
 await expect(blocks.nth(6).locator('span[class^="hljs-"]')).toHaveCount(0);
 await expect(page.locator('#markdown-preview script')).toHaveCount(0);
 await expect(input).toHaveValue(source);
 for(const theme of ['codepen','midnight','daylight','dracula','nord','solarized']){
  await page.locator('#theme-selector').selectOption(theme);
  await expect(blocks.first().locator('.hljs-keyword')).toHaveCount(1);
 }
 await page.locator('#lang-selector').selectOption('ru');
 // Language switching loads the corresponding per-language draft.
 await input.fill(source);
 await expect(page.locator('#markdown-preview pre').first()).toHaveAttribute('title',/Офлайн-подсветка/);
 const promise=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const dl=await promise;
 const {readFile}=await import('node:fs/promises');
 const exported=await readFile(await dl.path(),'utf8');
 expect(exported).toContain('hljs-keyword');
 expect(exported).toContain('<style>'); // Computed styles are checked below; Vite minifies selectors.
 expect(exported).not.toContain('<script');
 expect(exported).toContain('Content-Security-Policy');
 await page.setContent(exported);
 expect(await page.locator('main pre code .hljs-keyword').count()).toBeGreaterThan(0);
 await page.emulateMedia({media:'print'});
 expect(await page.locator('main pre code .hljs-keyword').first()
  .evaluate(el=>getComputedStyle(el).color)).toBe('rgb(76, 29, 149)');
});

test('issue #9 highlighted Markdown remains available on offline reload',async({page,context})=>{
 await page.goto('/');
 await page.waitForFunction(async()=>{
  if(!('serviceWorker' in navigator))return false;
  await navigator.serviceWorker.ready;
  return !!navigator.serviceWorker.controller;
 },null,{timeout:15000});
 const source='~~~js\nconst ready = true;\n~~~';
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview .hljs-keyword')).toHaveCount(1);
 await context.setOffline(true);
 try{
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#markdown-input')).toHaveValue(source);
  await expect(page.locator('#markdown-preview .hljs-keyword')).toHaveCount(1);
 }finally{await context.setOffline(false);}
});


test('issue #10 opt-in line breaks persist by document and preserve standard dialects',async({page})=>{
 await page.goto('/');
 const source='First line\nSecond line';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#compatibility-panel summary').click();
 const toggle=page.locator('#extension-softbreaks-toggle');
 await expect(toggle).toHaveValue('off');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(0);
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
 await expect(input).toHaveValue(source);
 await expect(page.locator('#extension-matrix-body tr')).toHaveCount(8);
 await page.reload();
 await expect(toggle).toHaveValue('on');
 // The <details> panel intentionally collapses after a page reload.
 await page.locator('#compatibility-panel summary').click();
 await expect(toggle).toBeVisible();
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(toggle).toBeDisabled();
 await expect(page.locator('#markdown-preview p br')).toHaveCount(0);
 await page.locator('#dialect-selector').selectOption('original');
 await expect(toggle).toBeDisabled();
 await expect(page.locator('#markdown-preview p br')).toHaveCount(0);
 await page.locator('#dialect-selector').selectOption('gfm');
 await expect(toggle).toBeEnabled();
 await expect(toggle).toHaveValue('on');
 await page.locator('#sandbox-mode-btn').click();
 await expect(toggle).toHaveValue('off');
 await input.fill(source);
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
 await page.locator('#sandbox-mode-btn').click();
 await expect(toggle).toHaveValue('on');
 await page.locator('#lang-selector').selectOption('ru');
 await expect(toggle).toHaveValue('off');
 await expect(page.locator('#extension-softbreaks-label')).toContainText('переносы');
 await expect(page.locator('#extension-matrix-title')).toHaveText('Матрица совместимости');
 await input.fill(source);
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
});

test('issue #10 warns about nonstandard MD export without modifying Markdown',async({page})=>{
 await page.goto('/');
 const source='Hello\nWorld';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#compatibility-panel summary').click();
 await page.locator('#extension-softbreaks-toggle').selectOption('on');
 const messages=[];
 page.once('dialog',async dialog=>{messages.push(dialog.message());await dialog.accept();});
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#download-md-btn').click();
 const file=await downloadPromise;
 expect(messages).toHaveLength(1);
 expect(messages[0]).toContain('single newlines');
 const {readFile}=await import('node:fs/promises');
 expect(await readFile(await file.path(),'utf8')).toBe(source);
 const htmlPromise=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const htmlFile=await htmlPromise;
 const html=await readFile(await htmlFile.path(),'utf8');
 expect(html).toMatch(/Hello<br\s*\/?>World/);
 expect(html).not.toContain('<script');
 await expect(input).toHaveValue(source);
});



test('issue #11 footnotes are optional with repeated references and route-safe backlinks',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='One fact[^study], repeated[^study].\n\n[^study]: **Reliable** source.\n\n    More details.';
 await input.fill(source);
 const panel=page.locator('#compatibility-panel');
 await panel.locator('summary').click();
 const toggle=page.locator('#extension-footnotes-toggle');
 await expect(toggle).toHaveValue('off');
 await expect(page.locator('#markdown-preview .md-footnotes')).toHaveCount(0);
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview .md-footnotes')).toHaveCount(1);
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(2);
 await expect(page.locator('#markdown-preview .fn-backref')).toHaveCount(2);
 await expect(page.locator('#markdown-preview .md-footnotes strong')).toHaveText('Reliable');
 await expect(page.locator('#markdown-preview .md-footnotes p')).toHaveCount(2);
 const oldHash=await page.evaluate(()=>location.hash);
 await page.locator('#markdown-preview .fn-ref').first().click();
 expect(await page.evaluate(()=>location.hash)).toBe(oldHash);
 await page.locator('#markdown-preview .fn-backref').nth(1).click();
 expect(await page.evaluate(()=>location.hash)).toBe(oldHash);
 await expect(input).toHaveValue(source);
 await page.reload();
 await expect(toggle).toHaveValue('on');
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(2);
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(toggle).toBeDisabled();
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(0);
 await page.locator('#dialect-selector').selectOption('original');
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(0);
 await page.locator('#dialect-selector').selectOption('gfm');
 await expect(toggle).toBeEnabled();
 await expect(toggle).toHaveValue('on');
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(2);
});

test('issue #11 footnote exercise and safe standalone HTML / print export',async({page})=>{
 await page.goto('/');
 await page.locator('#compatibility-panel summary').click();
 const toggle=page.locator('#extension-footnotes-toggle');
 await toggle.selectOption('on');
 const input=page.locator('#markdown-input');
 await input.fill('');
 await page.locator('#extension-footnote-demo').click();
 await expect(input).toHaveValue(/A documented claim\[\^source\]/);
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(2);
 await expect(page.locator('#markdown-preview .fn-backref')).toHaveCount(2);
 await expect(page.locator('#extension-footnote-practice')).toContainText('Complete');
 await page.locator('#lang-selector').selectOption('ru');
 await expect(page.locator('#extension-footnotes-label')).toContainText('Сноски');
 await expect(toggle).toHaveValue('off'); // separate language document
 await toggle.selectOption('on');
 const source='Threat[^s].\n\n[^s]: <script>alert(1)</script> Plain text.';
 await input.fill(source);
 await expect(page.locator('#markdown-preview script')).toHaveCount(0);
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(1);
 const download=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const file=await download;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('fn-item-1');
 expect(html).toContain('fn-ref-1-1');
 expect(html).toContain('fn-backref');
 expect(html).not.toContain('<script');
 await page.setContent(html);
 await expect(page.locator('main.md-preview .md-footnotes')).toHaveCount(1);
 await expect(page.locator('main.md-preview .fn-backref')).toHaveCount(1);
 await page.emulateMedia({media:'print'});
 expect(await page.locator('main.md-preview .md-footnotes').evaluate(el=>getComputedStyle(el).borderTopStyle)).toBe('solid');
});

test('issue #11 MD export warns for non-GFM footnotes and leaves source intact',async({page})=>{
 await page.goto('/');
 await page.locator('#compatibility-panel summary').click();
 await page.locator('#extension-footnotes-toggle').selectOption('on');
 const source='A[^one].\n\n[^one]: Note.';
 await page.locator('#markdown-input').fill(source);
 const messages=[];
 page.once('dialog',async dialog=>{messages.push(dialog.message());await dialog.accept();});
 const downloading=page.waitForEvent('download');
 await page.locator('#download-md-btn').click();
 const file=await downloading;
 const {readFile}=await import('node:fs/promises');
 expect(await readFile(await file.path(),'utf8')).toBe(source);
 expect(messages).toHaveLength(1);
 expect(messages[0]).toContain('GitHub.com');
});


test('issue #12 safe heading IDs and live TOC across three Markdown dialects',async({page})=>{
 await page.goto('/');
 const source='# Intro\n\n## Details\n\n## Details\n\n### Привет, мир!\n\n#### 42 steps\n\n##### !!!';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 const expected=['intro','details','details-2','привет-мир','section-42-steps','section'];
 for(const mode of ['gfm','commonmark','original']){
  await page.locator('#dialect-selector').selectOption(mode);
  expect(await page.locator('#markdown-preview :is(h1,h2,h3,h4,h5,h6)').evaluateAll(els=>els.map(el=>el.id))).toEqual(expected);
 }
 await page.locator('#toc-panel summary').click();
 await expect(page.locator('#toc-list a')).toHaveCount(6);
 await page.locator('#toc-depth').selectOption('2');
 await expect(page.locator('#toc-list a')).toHaveCount(3);
 await expect(page.locator('#toc-list a').nth(2)).toHaveAttribute('href','#details-2');
 await expect(input).toHaveValue(source);
 await page.locator('#toc-insert').click();
 await expect(input).toHaveValue(/- \[Intro\]\(#intro\)/);
 await expect(input).toHaveValue(/- \[Details\]\(#details-2\)/);
 await expect(page.locator('#toc-list a')).toHaveCount(3);
});

test('issue #12 TOC keyboard navigation preserves lesson hash even with Unicode headings',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('# Start\n\n## Next\n\n## Next\n\n### 中文标题');
 await page.locator('#toc-panel summary').click();
 const hash=await page.evaluate(()=>location.hash);
 await page.locator('#toc-list a[href="#next-2"]').click();
 expect(await page.evaluate(()=>location.hash)).toBe(hash);
 await page.locator('#toc-list a[href="#中文标题"]').focus();
 await page.keyboard.press('Enter');
 expect(await page.evaluate(()=>location.hash)).toBe(hash);
 await expect(page.locator('#toc-list a')).toHaveCount(4);
 await page.reload();
 await expect(page.locator('#toc-panel')).toHaveAttribute('open','');
 await expect(page.locator('#toc-depth')).toHaveValue('6');
});

test('issue #12 opt-in custom heading IDs stay isolated and survive HTML export and print',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='# Title {#chosen-id}\n\n## Another {#chosen-id}\n\n## Защита {#безопасно}';
 await input.fill(source);
 await page.locator('#compatibility-panel summary').click();
 const toggle=page.locator('#extension-headingids-toggle');
 await expect(toggle).toHaveValue('off');
 await expect(page.locator('#markdown-preview h1')).not.toHaveAttribute('id','chosen-id');
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview h1')).toHaveAttribute('id','chosen-id');
 await expect(page.locator('#markdown-preview h2').first()).toHaveAttribute('id','chosen-id-2');
 await expect(page.locator('#markdown-preview h2').nth(1)).toHaveAttribute('id','безопасно');
 await expect(input).toHaveValue(source);
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(toggle).toBeDisabled();
 await expect(page.locator('#markdown-preview h1')).not.toHaveAttribute('id','chosen-id');
 await page.locator('#dialect-selector').selectOption('gfm');
 await expect(toggle).toBeEnabled();
 await expect(toggle).toHaveValue('on');
 const downloaded=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const file=await downloaded;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 for(const id of ['chosen-id','chosen-id-2','безопасно'])expect(html).toContain('id="'+id+'"');
 await page.setContent(html);
 await expect(page.locator('main h1#chosen-id')).toHaveCount(1);
 await page.emulateMedia({media:'print'});
 await expect(page.locator('main h2#chosen-id-2')).toHaveCount(1);
});

test('issue #12 mobile and 150-heading outline remains usable',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const source=Array.from({length:150},(_,i)=>'## Chapter '+(i+1)).join('\n\n');
 await page.locator('#markdown-input').fill(source);
 await page.locator('[data-mobile-tab="preview"]').click();
 await page.locator('#toc-panel summary').click();
 await expect(page.locator('#toc-list a')).toHaveCount(150);
 const ids=await page.locator('#markdown-preview h2').evaluateAll(els=>els.map(el=>el.id));
 expect(new Set(ids).size).toBe(150);
 await page.locator('#toc-depth').selectOption('1');
 await expect(page.locator('#toc-list a')).toHaveCount(0);
 await expect(page.locator('#toc-empty')).toBeVisible();
 await page.locator('#toc-depth').selectOption('2');
 await expect(page.locator('#toc-list a')).toHaveCount(150);
 await page.locator('#toc-example').click();
 await expect(page.locator('#markdown-input')).toHaveValue(/# Introduction/);
});


test('issue #13 advanced image builder creates accessible responsive figures with Undo/Redo',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('A short introduction.');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#figure-dialog-trigger').click();
 await expect(page.locator('#figure-dialog')).toBeVisible();
 await page.locator('#figure-url').fill('https://example.org/diagram.png');
 await page.locator('#figure-alt').fill('A flow diagram');
 await page.locator('#figure-width-preset').selectOption('custom');
 await page.locator('#figure-width-custom').fill('800');
 await page.locator('#figure-natural').uncheck();
 await page.locator('#figure-height').fill('340');
 await page.locator('#figure-caption').fill('Figure 1: A & B < C');
 await page.locator('#figure-insert').click();
 await expect(page.locator('#figure-dialog')).not.toBeVisible();
 await expect(input).toHaveValue(/<figure class="af-figure af-figure-fixed">/);
 await expect(input).toHaveValue(/width="800" height="340"/);
 const picture=page.locator('#markdown-preview figure.af-figure');
 await expect(picture).toHaveCount(1);
 await expect(picture.locator('img')).toHaveAttribute('alt','A flow diagram');
 await expect(picture.locator('img')).toHaveAttribute('width','800');
 await expect(picture.locator('img')).toHaveAttribute('height','340');
 await expect(picture.locator('figcaption')).toHaveText('Figure 1: A & B < C');
 expect(await picture.locator('img').evaluate(el=>getComputedStyle(el).objectFit)).toBe('contain');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('A short introduction.');
 await expect(page.locator('#markdown-preview figure')).toHaveCount(0);
 await page.locator('#redo-btn').click();
 await expect(picture).toHaveCount(1);
});

test('issue #13 image builder rejects invalid sizes and URLs, supports decorative alt',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#figure-dialog-trigger').click();
 await page.locator('#figure-url').fill('javascript:alert(1)');
 await page.locator('#figure-alt').fill('Test image');
 await page.locator('#figure-insert').click();
 await expect(page.locator('#figure-error')).not.toBeEmpty();
 await expect(page.locator('#figure-dialog')).toBeVisible();
 await page.locator('#figure-url').fill('https://example.org/test.png');
 await page.locator('#figure-width-preset').selectOption('custom');
 await page.locator('#figure-width-custom').fill('1601');
 await page.locator('#figure-insert').click();
 await expect(page.locator('#figure-error')).toContainText('1600');
 await page.locator('#figure-width-custom').fill('640');
 await page.locator('#figure-decorative').check();
 await expect(page.locator('#figure-alt')).toBeDisabled();
 await page.locator('#figure-insert').click();
 await expect(page.locator('#figure-dialog')).not.toBeVisible();
 await expect(page.locator('#markdown-preview figure img')).toHaveAttribute('alt','');
 await expect(page.locator('#markdown-preview figure img')).toHaveAttribute('width','640');
});

test('issue #13 figures survive standalone HTML and print, and portable Markdown remains untouched',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#figure-dialog-trigger').click();
 await page.locator('#figure-url').fill('https://example.org/photo.png');
 await page.locator('#figure-alt').fill('A photo');
 await page.locator('#figure-caption').fill('Simple caption');
 await page.locator('#figure-insert').click();
 const source=await page.locator('#markdown-input').inputValue();
 const download=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const file=await download;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('<figure class="af-figure">');
 expect(html).toContain('<figcaption>Simple caption</figcaption>');
 expect(html).toContain('af-figure'); // Browser layout is verified below.
 expect(html).not.toContain('<script');
 await page.setContent(html);
 await expect(page.locator('main.md-preview figure figcaption')).toHaveText('Simple caption');
 await page.emulateMedia({media:'print'});
 await expect(page.locator('main.md-preview figure img')).toHaveAttribute('width','640');
 // Print media hides the app editor after navigating back to the SPA.
 await page.emulateMedia({media:'screen'});
 await page.goto('/');
 await page.locator('#markdown-input').fill('');
 // Advanced mode is persisted: do not accidentally close an already open ribbon.
 if(await page.locator('#advanced-rich-toolbar').isHidden())
  await page.locator('#advanced-tools-toggle').click();
 await page.locator('#figure-dialog-trigger').click();
 await page.locator('#figure-url').fill('https://example.org/photo.png');
 await page.locator('#figure-alt').fill('A photo');
 await page.locator('#figure-markdown').click();
 await expect(page.locator('#markdown-input')).toHaveValue(/!\[A photo\]\(https:\/\/example.org\/photo.png\)/);
 await expect(page.locator('#markdown-preview figure')).toHaveCount(0);
 await expect(page.locator('#markdown-preview img')).toHaveCount(1);
 expect(source).not.toBe('');
});

test('issue #13 wide figures and captions never overflow the mobile preview',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#markdown-input').fill('<figure class="af-figure"><img src="https://example.org/diagram.png" width="1600" alt="Very wide diagram"><figcaption>Long explanatory caption associated with the image.</figcaption></figure>');
 await page.locator('[data-mobile-tab="preview"]').click();
 const measure=await page.locator('#markdown-preview figure').evaluate(el=>{
  const figure=el.getBoundingClientRect(),container=el.closest('#markdown-preview').getBoundingClientRect();
  return {figureWidth:figure.width,containerWidth:container.width,right:figure.right,containerRight:container.right};
 });
 expect(measure.figureWidth).toBeLessThanOrEqual(measure.containerWidth+1);
 expect(measure.right).toBeLessThanOrEqual(measure.containerRight+1);
 await expect(page.locator('#markdown-preview figure figcaption')).toContainText('Long explanatory caption');
});


test('issue #14 definition lists are opted in and persist per document without affecting base dialects',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Term A\nTerm B\n: First **definition**\n: Second *definition*\n  with continuation.\nAnother term\n: Final definition.';
 await input.fill(source);
 await expect(page.locator('#markdown-preview dl')).toHaveCount(0);
 await page.locator('#compatibility-panel summary').click();
 const toggle=page.locator('#extension-definitions-toggle');
 await expect(toggle).toHaveValue('off');
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview dl.md-definition-list')).toHaveCount(1);
 await expect(page.locator('#markdown-preview dl dt')).toHaveCount(3);
 await expect(page.locator('#markdown-preview dl dd')).toHaveCount(3);
 await expect(page.locator('#markdown-preview dl strong')).toHaveText('definition');
 await expect(page.locator('#markdown-preview dl em')).toHaveText('definition');
 await expect(page.locator('#extension-definitions-practice')).toContainText('Complete');
 await expect(input).toHaveValue(source);
 await page.reload();
 await expect(toggle).toHaveValue('on');
 await expect(page.locator('#markdown-preview dl')).toHaveCount(1);
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(toggle).toBeDisabled();
 await expect(page.locator('#markdown-preview dl')).toHaveCount(0);
 await page.locator('#dialect-selector').selectOption('original');
 await expect(page.locator('#markdown-preview dl')).toHaveCount(0);
 await page.locator('#dialect-selector').selectOption('gfm');
 await expect(toggle).toHaveValue('on');
 await expect(page.locator('#markdown-preview dl')).toHaveCount(1);
 await page.locator('#lang-selector').selectOption('ru');
 await expect(toggle).toHaveValue('off');
 await expect(page.locator('#extension-definitions-label')).toContainText('Списки определений');
 await expect(page.locator('#extension-matrix-body tr')).toHaveCount(8);
});

test('issue #14 Advanced HTML definition template is semantic, reversible and available across dialects',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 const input=page.locator('#markdown-input');
 await input.fill('');
 await page.locator('#definition-html-insert').click();
 await expect(page.locator('#markdown-preview dl')).toHaveCount(1);
 await expect(page.locator('#markdown-preview dl dt')).toHaveCount(2);
 await expect(page.locator('#markdown-preview dl dd')).toHaveCount(3);
 await expect(page.locator('#markdown-preview dl strong')).toHaveText('definition');
 await expect(input).toHaveValue(/<dl>/);
 const source=await input.inputValue();
 await page.locator('#undo-btn').click();
 await expect(page.locator('#markdown-preview dl')).toHaveCount(0);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(source);
 for(const dialect of ['commonmark','original','gfm']){
  await page.locator('#dialect-selector').selectOption(dialect);
  await expect(page.locator('#markdown-preview dl')).toHaveCount(1);
 }
 await page.locator('#lang-selector').selectOption('ru');
 await expect(page.locator('#definition-html-insert')).toContainText('HTML-список');
});

test('issue #14 example, standalone HTML and print keep sanitized definition list semantics',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('');
 await page.locator('#compatibility-panel summary').click();
 await page.locator('#extension-definitions-toggle').selectOption('on');
 await page.locator('#extension-definitions-demo').click();
 await expect(page.locator('#markdown-preview dl.md-definition-list')).toHaveCount(1);
 await expect(page.locator('#markdown-preview dl dd')).toHaveCount(3);
 await expect(page.locator('#extension-definitions-practice')).toContainText('Complete');
 const source=await input.inputValue();
 const download=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const file=await download;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('<dl class="md-definition-list">');
 expect(html).toContain('<dt>Term A</dt>');
 expect(html).not.toContain('<script');
 await page.setContent(html);
 await expect(page.locator('main.md-preview dl dd')).toHaveCount(3);
 await page.emulateMedia({media:'print'});
 expect(await page.locator('main.md-preview dl dt').first().evaluate(el=>getComputedStyle(el).fontWeight)).toMatch(/700|bold/);
 await page.emulateMedia({media:'screen'});
 await page.goto('/');
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('issue #14 definition syntax never creates executable markup from hostile terms or definitions',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Safe term\n: <script>window.__definitionXss=1</script> **safe definition**\n\nOrdinary: paragraph';
 await input.fill(source);
 await page.locator('#compatibility-panel summary').click();
 await page.locator('#extension-definitions-toggle').selectOption('on');
 await expect(page.locator('#markdown-preview dl')).toHaveCount(1);
 await expect(page.locator('#markdown-preview dl strong')).toHaveText('safe definition');
 await expect(page.locator('#markdown-preview script')).toHaveCount(0);
 expect(await page.evaluate(()=>window.__definitionXss)).toBeUndefined();
 await expect(page.locator('#markdown-preview')).toContainText('Ordinary: paragraph');
});


test('issue #15 Unicode picker searches offline and inserts at caret with Undo/Redo',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Price: ');
 await page.locator('#unicode-picker-trigger').click();
 await expect(page.locator('#unicode-picker-dialog')).toBeVisible();
 await page.locator('#unicode-search').fill('euro');
 await expect(page.locator('#unicode-results button[data-item-id="euro"]')).toHaveCount(1);
 await page.locator('#unicode-results button[data-item-id="euro"]').click();
 await expect(page.locator('#unicode-picker-dialog')).not.toBeVisible();
 await expect(input).toHaveValue('Price: €');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('Price: ');
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue('Price: €');
 await expect(page.locator('#markdown-preview')).toContainText('Price: €');
});

test('issue #15 Enter, Escape and keyboard search work in localized Unicode palette',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('');
 await page.locator('#lang-selector').selectOption('ru');
 await page.locator('#unicode-picker-trigger').click();
 await expect(page.locator('#unicode-picker-title')).toHaveText('Символы Unicode и emoji');
 await expect(page.locator('#unicode-categories')).toHaveAttribute('aria-label','Категории символов');
 await expect(page.locator('#unicode-results')).toHaveAttribute('aria-label','Результаты поиска');
 const search=page.locator('#unicode-search');
 await search.fill('стрелка');
 await expect(page.locator('#unicode-results button').first()).toBeVisible();
 // All seven category buttons and the results are reachable by Tab.
 for(let index=0;index<8;index++)await page.keyboard.press('Tab');
 await expect(page.locator('#unicode-results button').first()).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('#unicode-picker-dialog')).not.toBeVisible();
 await expect(input).not.toHaveValue('');
 await page.locator('#unicode-picker-trigger').click();
 await search.fill('совершенно-несуществующий');
 await expect(page.locator('#unicode-empty')).toBeVisible();
 await search.fill('copyright');
 await search.press('Enter');
 await expect(page.locator('#unicode-picker-dialog')).not.toBeVisible();
 await expect(input).toHaveValue(/©$/);
 await page.locator('#unicode-picker-trigger').click();
 await page.keyboard.press('Escape');
 await expect(page.locator('#unicode-picker-dialog')).not.toBeVisible();
});

test('issue #15 opt-in shortcodes expand only in selected GFM documents',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Hello :joy: :tent: :unknown:.\n\n'+String.fromCharCode(96)+':joy:'+String.fromCharCode(96)+'\n\n~~~text\n:tent:\n~~~';
 await input.fill(source);
 await expect(page.locator('#markdown-preview p').first()).toContainText(':joy:');
 await page.locator('#compatibility-panel summary').click();
 const toggle=page.locator('#extension-emoji-toggle');
 await expect(toggle).toHaveValue('off');
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview p').first()).toContainText('😂');
 await expect(page.locator('#markdown-preview p').first()).toContainText('⛺');
 await expect(page.locator('#markdown-preview p').first()).toContainText(':unknown:');
 await expect(page.locator('#markdown-preview code').first()).toHaveText(':joy:');
 await expect(page.locator('#markdown-preview pre')).toContainText(':tent:');
 await expect(input).toHaveValue(source);
 await page.reload();
 await expect(toggle).toHaveValue('on');
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(toggle).toBeDisabled();
 await expect(page.locator('#markdown-preview p').first()).toContainText(':joy:');
 await page.locator('#dialect-selector').selectOption('original');
 await expect(page.locator('#markdown-preview p').first()).toContainText(':joy:');
 await page.locator('#dialect-selector').selectOption('gfm');
 await expect(toggle).toHaveValue('on');
 await expect(page.locator('#markdown-preview p').first()).toContainText('😂');
 await page.locator('#sandbox-mode-btn').click();
 await expect(toggle).toHaveValue('off');
 await page.locator('#lang-selector').selectOption('ru');
 await expect(page.locator('#extension-emoji-label')).toContainText('shortcodes');
 await expect(page.locator('#extension-matrix-body tr')).toHaveCount(8);
});

test('issue #15 Unicode picker stays usable on 390px mobile screen and inserts symbols',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#markdown-input').fill('Road ');
 await page.locator('#unicode-picker-trigger').click();
 const dialog=page.locator('#unicode-picker-dialog');
 await expect(dialog).toBeVisible();
 const geometry=await dialog.evaluate(el=>{
  const rect=el.getBoundingClientRect();
  return {left:rect.left,right:rect.right,width:rect.width,viewport:innerWidth};
 });
 expect(geometry.left).toBeGreaterThanOrEqual(0);
 expect(geometry.right).toBeLessThanOrEqual(geometry.viewport+1);
 await page.locator('#unicode-categories button[data-category="arrows"]').click();
 await expect(page.locator('#unicode-results button').first()).toBeVisible();
 await page.locator('#unicode-results button[data-item-id="right"]').click();
 await expect(dialog).not.toBeVisible();
 await expect(page.locator('#markdown-input')).toHaveValue('Road →');
});

test('issue #15 Unicode sample and Markdown/HTML export preserve source and rendered output',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('');
 await page.locator('#unicode-picker-trigger').click();
 await page.locator('#unicode-lesson-example').click();
 await expect(input).toHaveValue(/Unicode: © € → π/);
 await expect(input).toHaveValue(/&copy; &euro; &rarr;/);
 await expect(input).toHaveValue(/\\\*literal asterisks\\\*/);
 await input.fill('One :joy: © €');
 await page.locator('#compatibility-panel summary').click();
 await page.locator('#extension-emoji-toggle').selectOption('on');
 const messages=[];
 page.once('dialog',async dialog=>{messages.push(dialog.message());await dialog.accept();});
 const download=page.waitForEvent('download');
 await page.locator('#download-md-btn').click();
 const file=await download;
 const {readFile}=await import('node:fs/promises');
 expect(await readFile(await file.path(),'utf8')).toBe('One :joy: © €');
 expect(messages).toHaveLength(1);
 expect(messages[0]).toContain('shortcode');
 const htmlDownload=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const htmlFile=await htmlDownload;
 const html=await readFile(await htmlFile.path(),'utf8');
 expect(html).toContain('One 😂 © €');
 expect(html).not.toContain('<script');
});

test('issue #16 Practical Hacks are labeled, localized and undoable',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('Existing content');
 await page.locator('#cheatsheet-btn').click();
 await expect(page.locator('#cheatsheet-grid [data-hack-id]')).toHaveCount(10);
 await expect(page.locator('[data-hack-id="table-pipe"] [data-portability]')).toContainText('GFM only');
 await expect(page.locator('[data-hack-id="author-html-comment"] [data-portability]')).toContainText('HTML');
 const before=await editor.inputValue();
 await page.locator('[data-hack-id="portable-callout"] button').click();
 await expect(page.locator('#cheatsheet-modal')).toHaveClass(/hidden/);
 await expect(editor).toHaveValue(/Keep the original Markdown source/);
 await expect(page.locator('#markdown-preview blockquote strong')).toContainText('Note:');
 await page.locator('#undo-btn').click();
 await expect(editor).toHaveValue(before);
 await page.locator('#lang-selector').selectOption('ru');
 await page.locator('#cheatsheet-btn').click();
 await expect(page.locator('[data-hack-id="portable-callout"] h5')).toHaveText('Переносимое примечание');
 await expect(page.locator('[data-hack-id="table-pipe"] [data-portability]')).toHaveText('Только GFM');
 await expect(page.locator('[data-hack-id="video-thumbnail"] p').last()).toContainText('интернет');
});

test('issue #16 GFM table tricks render safely and retain dialect semantics',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('');
 await page.locator('#cheatsheet-btn').click();
 await page.locator('[data-hack-id="table-pipe"] button').click();
 await expect(page.locator('#markdown-preview table')).toHaveCount(1);
 await expect(page.locator('#markdown-preview tbody td')).toHaveCount(4);
 await expect(page.locator('#markdown-preview tbody td').first()).toContainText('A | B');
 const source=await page.locator('#markdown-input').inputValue();
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(page.locator('#markdown-preview table')).toHaveCount(0);
 await expect(page.locator('#markdown-input')).toHaveValue(source);
 await page.locator('#dialect-selector').selectOption('gfm');
 await page.locator('#markdown-input').fill('| Term | Notes |\n| --- | --- |\n| **Alpha** | First<br>Second |');
 await expect(page.locator('#markdown-preview td br')).toHaveCount(1);
 await expect(page.locator('#markdown-preview td strong')).toContainText('Alpha');
});

test('issue #16 author notes stay in Markdown but not in safe HTML export; video links are not embeds',async({page})=>{
 await page.goto('/');
 const markdown='Public text.\n\n[editor-note]: # (Internal: not for publication)\n\n<!-- Editor: verify data -->\n\n[![Video preview](https://placehold.co/320x180/png)](https://example.com/watch)';
 await page.locator('#markdown-input').fill(markdown);
 await expect(page.locator('#markdown-preview')).not.toContainText('not for publication');
 await expect(page.locator('#markdown-preview')).not.toContainText('Editor: verify data');
 await expect(page.locator('#markdown-preview a[href="https://example.com/watch"] img')).toHaveCount(1);
 await expect(page.locator('#markdown-preview iframe')).toHaveCount(0);
 const pending=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const file=await pending;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('https://example.com/watch');
 expect(html).not.toContain('Internal: not for publication');
 expect(html).not.toContain('Editor: verify data');
 expect(html).not.toMatch(/<iframe|<script/i);
 await expect(page.locator('#markdown-input')).toHaveValue(markdown);
});

test('issue #16 practical hacks can be reached on a narrow viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#cheatsheet-btn').click();
 await expect(page.locator('[data-hack-id="entities-and-unicode"] button')).toBeAttached();
 await page.locator('[data-hack-id="entities-and-unicode"] button').click();
 await expect(page.locator('#markdown-input')).toHaveValue(/Unicode: © ® ™ € π ° →/);
});

test('issue #17 optional GFM lab validates rendered alignment and preserves isolated drafts',async({page})=>{
 await page.goto('/');
 const originalRoute=new URL(page.url()).hash;
 const main=page.locator('#markdown-input'),originalMarkdown=await main.inputValue();
 const coreProgress=await page.locator('#progress-label').textContent();
 const advancedProgress=await page.locator('#advanced-progress-label').textContent();
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const modal=page.locator('#extensions-lab-modal');
 await expect(modal).toBeVisible();
 await expect(page.locator('#extensions-lab-checks li')).toHaveCount(2);
 await expect(page.locator('#extensions-lab-progress')).toHaveText('0 / 13');
 await expect(page.locator('#extensions-lab-status')).toContainText('Keep editing');
 const source=page.locator('#extensions-lab-source');
 await source.fill('| Feature | Score |\n| :---: | ---: |\n| Markdown | 5 |');
 await expect(page.locator('#extensions-lab-preview th[align="center"]')).toHaveCount(1);
 await expect(page.locator('#extensions-lab-preview td[align="right"]')).toHaveText('5');
 await expect(page.locator('#extensions-lab-progress')).toHaveText('1 / 13');
 await page.locator('#extensions-lab-close').click();
 await expect(modal).toBeHidden();
 await expect(main).toHaveValue(originalMarkdown);
 expect(new URL(page.url()).hash).toBe(originalRoute);
 await expect(page.locator('#progress-label')).toHaveText(coreProgress);
 await expect(page.locator('#advanced-progress-label')).toHaveText(advancedProgress);
 await page.reload();
 await page.locator('#contents-toggle-btn').click();
 await expect(page.locator('#extensions-lab-open-progress')).toHaveText('1 / 13');
 await page.locator('#extensions-lab-open').click();
 await expect(source).toHaveValue('| Feature | Score |\n| :---: | ---: |\n| Markdown | 5 |');
 await expect(page.locator('#extensions-lab-status')).toContainText('All checks pass');
});

test('issue #17 fenced examples cannot pass without rendered highlighting; successful samples persist',async({page})=>{
 await page.goto('/');
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const selector=page.locator('#extensions-lab-select'),source=page.locator('#extensions-lab-source');
 await selector.selectOption('fenced-code-highlighting');
 await expect(source).toHaveValue(/^~~~\nconst answer/);
 await source.fill('~~~~markdown\n~~~javascript\nconst answer = 42;\n~~~\n~~~~');
 await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
 await page.locator('#extensions-lab-example').click();
 await expect(page.locator('#extensions-lab-preview code.language-javascript')).toHaveCount(1);
 await expect(page.locator('#extensions-lab-preview code.language-javascript .hljs-keyword')).toContainText('const');
 await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['✓ ','✓ ']);
 await expect(page.locator('#extensions-lab-progress')).toHaveText('1 / 13');
 await page.locator('#extensions-lab-reset').click();
 await expect(source).toHaveValue(/^~~~\nconst answer/);
 await expect(page.locator('#extensions-lab-status')).toContainText('Keep editing');
 await expect(page.locator('#extensions-lab-progress')).toHaveText('1 / 13'); // historical achievement persists
 await page.locator('#extensions-lab-close').click();
 await page.reload();
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 await expect(selector).toHaveValue('fenced-code-highlighting');
 await expect(source).toHaveValue(/^~~~\nconst answer/);
});

test('issue #17 optional lab supports all five locales and keyboard Escape',async({page})=>{
 await page.goto('/');
 for(const [lang,heading] of [
  ['en','Extensions & Hacks Lab'],
  ['cs','Laboratoř rozšíření a triků'],
  ['uk','Практикум розширень і прийомів'],
  ['ro','Laborator de extensii și trucuri'],
  ['ru','Практикум Extensions & Hacks']
 ]){
  await page.locator('#lang-selector').selectOption(lang);
  await page.locator('#contents-toggle-btn').click();
  const launch=page.locator('#extensions-lab-open');
  await launch.click();
  await expect(page.locator('#extensions-lab-title')).toHaveText(heading);
  await expect(page.locator('#extensions-lab-description')).not.toBeEmpty();
  await expect(page.locator('#extensions-lab-checks li')).toHaveCount(2);
  await page.keyboard.press('Escape');
  await expect(page.locator('#extensions-lab-modal')).toBeHidden();
  await expect(page.locator('#contents-toggle-btn')).toBeFocused();
 }
});

test('issue #17 lab stays usable on mobile and does not execute source HTML',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 await expect(page.locator('#extensions-lab-modal')).toBeVisible();
 const source=page.locator('#extensions-lab-source');
 await source.fill('<script>window.__labXss = 1</script>\n\n<img src="x" onerror="window.__labXss=2">');
 await expect(page.locator('#extensions-lab-preview script')).toHaveCount(0);
 await expect(page.locator('#extensions-lab-preview img')).not.toHaveAttribute('onerror',/./);
 expect(await page.evaluate(()=>window.__labXss)).toBeUndefined();
 await expect(page.locator('#extensions-lab-status')).toBeVisible();
 const size=await page.locator('#extensions-lab-modal > div').boundingBox();
 expect(size.width).toBeLessThanOrEqual(390);
 await page.locator('#extensions-lab-close').click();
 await expect(page.locator('#extensions-lab-modal')).toBeHidden();
});

test('issue #17 second learning wave: four opt-in exercises pass with real sanitized semantics',async({page})=>{
 await page.goto('/');
 const originalHash=new URL(page.url()).hash;
 const originalDraft=await page.locator('#markdown-input').inputValue();
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const select=page.locator('#extensions-lab-select');
 const source=page.locator('#extensions-lab-source');
 await expect(select.locator('option')).toHaveCount(16);
 for(const id of ['github-footnotes','custom-heading-toc','figure-caption','definition-list']){
  await select.selectOption(id);
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
  await page.locator('#extensions-lab-example').click();
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['✓ ','✓ ']);
  if(id==='github-footnotes'){
   await expect(page.locator('#extensions-lab-preview a.fn-ref')).toHaveCount(2);
   await expect(page.locator('#extensions-lab-preview a.fn-backref')).toHaveCount(2);
   await page.locator('#extensions-lab-preview a.fn-backref').first().click();
   expect(new URL(page.url()).hash).toBe(originalHash);
  }else if(id==='custom-heading-toc'){
   await expect(page.locator('#extensions-lab-preview h1#manual-overview')).toHaveCount(1);
   await page.locator('#extensions-lab-preview a[href="#manual-overview"]').click();
   expect(new URL(page.url()).hash).toBe(originalHash);
  }else if(id==='figure-caption'){
   await expect(page.locator('#extensions-lab-preview figure.af-figure figcaption')).toHaveText('Front of carton');
   await expect(page.locator('#extensions-lab-preview figure img')).toHaveAttribute('width','640');
  }else if(id==='definition-list'){
   await expect(page.locator('#extensions-lab-preview dl.md-definition-list dd')).toHaveCount(2);
  }
 }
 await expect(page.locator('#extensions-lab-progress')).toHaveText('4 / 13');
 await page.locator('#extensions-lab-close').click();
 await expect(page.locator('#markdown-input')).toHaveValue(originalDraft);
 expect(new URL(page.url()).hash).toBe(originalHash);
 await page.reload();
 await page.locator('#contents-toggle-btn').click();
 await expect(page.locator('#extensions-lab-open-progress')).toHaveText('4 / 13');
 await page.locator('#extensions-lab-open').click();
 await expect(select).toHaveValue('definition-list');
 await expect(source).toHaveValue(/First \*\*definition\*\*/);
});

test('issue #17 second wave ignores fenced examples, strips scripts and keeps opt-in local',async({page})=>{
 await page.goto('/');
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const select=page.locator('#extensions-lab-select');
 const source=page.locator('#extensions-lab-source');
 const examples={
  'github-footnotes':'Reference[^note].\n\n[^note]: **Text**.',
  'custom-heading-toc':'# Overview {#manual-overview}\n\n[Jump](#manual-overview)',
  'figure-caption':'<figure class="af-figure"><img src="https://example.org/a.png" alt="Test" width="640"><figcaption>Caption</figcaption></figure>',
  'definition-list':'Term\n: **First**\n: *Second*'
 };
 for(const [id,snippet] of Object.entries(examples)){
  await select.selectOption(id);
  await source.fill('~~~~markdown\n'+snippet+'\n~~~~');
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
 }
 await source.fill('Term\n: <script>window.__labAttack=1</script> **First**\n: *Second* <img src="javascript:alert(1)" onerror="window.__labAttack=2">');
 await expect(page.locator('#extensions-lab-preview script')).toHaveCount(0);
 await expect(page.locator('#extensions-lab-preview img')).toHaveCount(0);
 expect(await page.evaluate(()=>window.__labAttack)).toBeUndefined();
 await page.locator('#extensions-lab-close').click();
 await page.locator('#markdown-input').fill('An unhandled note[^x].\n\n[^x]: Source.');
 await expect(page.locator('#markdown-preview .md-footnotes')).toHaveCount(0);
});

test('issue #17 all exercises show localized titles and portability notes in five languages',async({page})=>{
 await page.goto('/');
 for(const language of ['en','cs','uk','ro','ru']){
  await page.locator('#lang-selector').selectOption(language);
  await page.locator('#contents-toggle-btn').click();
  await page.locator('#extensions-lab-open').click();
  await expect(page.locator('#extensions-lab-select option')).toHaveCount(16);
  for(const id of ['github-footnotes','custom-heading-toc','figure-caption','definition-list']){
   await page.locator('#extensions-lab-select').selectOption(id);
   await expect(page.locator('#extensions-lab-description')).not.toBeEmpty();
   await expect(page.locator('#extensions-lab-portability')).not.toBeEmpty();
   await expect(page.locator('#extensions-lab-checks li')).toHaveCount(2);
  }
  await page.locator('#extensions-lab-close').click();
 }
});

test('issue #17 practical lessons: seven complete by rendered effects and persist',async({page})=>{
 await page.goto('/');
 const mainBefore=await page.locator('#markdown-input').inputValue();
 const routeBefore=new URL(page.url()).hash;
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const source=page.locator('#extensions-lab-source'),select=page.locator('#extensions-lab-select');
 await expect(select.locator('option')).toHaveCount(16);
 const ids=['unicode-entities','emoji-shortcodes','gfm-table-tricks','html-table-list','portable-callout','author-notes','video-preview-links'];
 for(const id of ids){
  await select.selectOption(id);
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
  await page.locator('#extensions-lab-example').click();
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['✓ ','✓ ']);
  if(id==='unicode-entities'){
   await expect(page.locator('#extensions-lab-preview')).toContainText('العربية');
   await expect(page.locator('#extensions-lab-preview')).toContainText('עברית');
  }else if(id==='emoji-shortcodes'){
   await expect(page.locator('#extensions-lab-preview p > code')).toHaveText(':rocket:');
  }else if(id==='gfm-table-tricks'){
   await expect(page.locator('#extensions-lab-preview table tbody tr:first-child td')).toHaveCount(2);
   await expect(page.locator('#extensions-lab-preview td br')).toHaveCount(1);
  }else if(id==='html-table-list'){
   await expect(page.locator('#extensions-lab-preview table td ul > li')).toHaveText(['One','Two']);
  }else if(id==='portable-callout'){
   await expect(page.locator('#extensions-lab-preview blockquote blockquote')).toHaveCount(1);
  }else if(id==='author-notes'){
   await expect(page.locator('#extensions-lab-preview')).not.toContainText('Internal:');
   await expect(page.locator('#extensions-lab-preview')).not.toContainText('Editor:');
  }else if(id==='video-preview-links'){
   await expect(page.locator('#extensions-lab-preview a[href="https://example.com/watch"] img[alt="Video preview"]')).toHaveCount(1);
   await expect(page.locator('#extensions-lab-preview iframe')).toHaveCount(0);
  }
 }
 await expect(page.locator('#extensions-lab-progress')).toHaveText('7 / 16');
 await page.locator('#extensions-lab-close').click();
 await expect(page.locator('#markdown-input')).toHaveValue(mainBefore);
 expect(new URL(page.url()).hash).toBe(routeBefore);
 await page.reload();
 await page.locator('#contents-toggle-btn').click();
 await expect(page.locator('#extensions-lab-open-progress')).toHaveText('7 / 16');
 await page.locator('#extensions-lab-open').click();
 await expect(select).toHaveValue('video-preview-links');
 await expect(source).toHaveValue(/\[!\[Video preview\]/);
});

test('issue #17 practical lessons reject all code-fenced examples and embedded frames',async({page})=>{
 await page.goto('/');
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const source=page.locator('#extensions-lab-source'),select=page.locator('#extensions-lab-select');
 for(const id of ['unicode-entities','emoji-shortcodes','gfm-table-tricks','html-table-list','portable-callout','author-notes','video-preview-links']){
  await select.selectOption(id);
  await page.locator('#extensions-lab-example').click();
  const example=await source.inputValue();
  await source.fill('~~~~markdown\n'+example+'\n~~~~');
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
 }
 await select.selectOption('author-notes');
 await source.fill('Public text stays visible.\n\n<!-- Editor: draft note. -->');
 await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','✓ ']);
 await select.selectOption('video-preview-links');
 await source.fill('[Watch the video](https://example.com/watch)\n\n<iframe src="https://example.com/watch"></iframe>');
 await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['✓ ','○ ']);
 await expect(page.locator('#extensions-lab-preview iframe')).toHaveCount(0);
});

test('issue #17 practical instructions are complete across five locales on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 for(const lang of ['en','cs','uk','ro','ru']){
  await page.locator('#lang-selector').selectOption(lang);
  await page.locator('#contents-toggle-btn').click();
  await page.locator('#extensions-lab-open').click();
  await expect(page.locator('#extensions-lab-select option')).toHaveCount(16);
  for(const id of ['unicode-entities','emoji-shortcodes','gfm-table-tricks','html-table-list','portable-callout','author-notes','video-preview-links']){
   await page.locator('#extensions-lab-select').selectOption(id);
   await expect(page.locator('#extensions-lab-description')).not.toBeEmpty();
   await expect(page.locator('#extensions-lab-portability')).not.toBeEmpty();
   await expect(page.locator('#extensions-lab-checks li')).toHaveCount(2);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#extensions-lab-modal')).toBeHidden();
 }
});


test('Mermaid Advanced insertion creates editable source and safe live image',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await expect(page.locator('#mermaid-template-choice')).toBeVisible();
 await page.locator('#mermaid-template-choice').selectOption('flowchart');
 await page.locator('#mermaid-template-insert').click();
 const editor=page.locator('#markdown-input');
 await expect(editor).toHaveValue(/```mermaid\nflowchart LR/);
 const figure=page.locator('#markdown-preview figure.mermaid-diagram');
 await expect(figure).toHaveCount(1,{timeout:20000});
 const img=figure.locator('img');
 await expect(img).toHaveAttribute('src',/^data:image\/svg\+xml;charset=utf-8,/);
 await expect(img).toHaveJSProperty('complete',true);
 expect(await img.evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
 await figure.locator('summary').click();
 await expect(figure.locator('pre code')).toContainText('flowchart LR');
 await page.locator('#undo-btn').click();
 await expect(editor).not.toHaveValue(/```mermaid/);
});

test('Mermaid independently renders three blocks and preserves original Markdown',async({page})=>{
 await page.goto('/');
 const source=['```mermaid','flowchart LR',' A[One] --> B[Two]','```','','```mermaid',
 'sequenceDiagram',' Alice->>Bob: Hello','```','','```mermaid','pie showData',
 ' "Yes" : 60',' "No" : 40','```'].join('\n');
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview figure.mermaid-diagram')).toHaveCount(3,{timeout:30000});
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('Mermaid invalid input retains code and forbids inline configuration',async({page})=>{
 await page.goto('/');
 const source='```mermaid\n%%{init: { "securityLevel": "loose" }}%%\nflowchart LR\n A-->B\n```';
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview .mermaid-error')).toBeVisible({timeout:15000});
 await expect(page.locator('#markdown-preview pre code.language-mermaid')).toContainText('securityLevel');
 await expect(page.locator('#markdown-preview figure.mermaid-diagram')).toHaveCount(0);
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('Mermaid preview does not apply an outdated asynchronous render',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('```mermaid\nflowchart LR\n A[Old] --> B[Branch]\n```');
 await input.fill('```mermaid\nflowchart LR\n A[New] --> B[Branch]\n```');
 const diagram=page.locator('#markdown-preview figure.mermaid-diagram img');
 await expect(diagram).toBeVisible({timeout:20000});
 const svg=await diagram.getAttribute('src');
 expect(decodeURIComponent(svg.split(',')[1])).toContain('New');
 expect(decodeURIComponent(svg.split(',')[1])).not.toContain('>Old<');
});

test('Mermaid Advanced insertion labels are localized in all five languages',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 const expected={en:'Diagrams',cs:'Diagramy',uk:'Діаграми',ro:'Diagrame',ru:'Диаграммы'};
 for(const [lang,label] of Object.entries(expected)){
  await page.locator('#lang-selector').selectOption(lang);
  await expect(page.locator('#mermaid-insert-controls')).toContainText(label);
  await expect(page.locator('#mermaid-template-choice option')).toHaveCount(9);
 }
});


test('Mermaid diagram cache avoids re-rendering after unrelated Markdown changes',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='```mermaid\nflowchart LR\n A[Stable] --> B[Diagram]\n```';
 await input.fill(source);
 const diagram=page.locator('#markdown-preview figure.mermaid-diagram img');
 await expect(diagram).toBeVisible({timeout:20000});
 const previous=await diagram.getAttribute('src');
 await input.fill(source+'\n\nSome unrelated paragraph.');
 await expect(page.locator('#markdown-preview figure.mermaid-diagram img')).toHaveAttribute('src',previous);
 await expect(page.locator('#markdown-preview .mermaid-status')).toHaveCount(0);
});


test('issue #18 additional Mermaid types render as safe images',async({page})=>{
 test.setTimeout(120000);
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 for(const kind of ['class','state','er','gantt','mindmap','timeline']){
  const source=mermaidSnippet(kind);
  await editor.fill(source);
  const image=page.locator('#markdown-preview figure.mermaid-diagram img');
  await expect(image).toHaveCount(1,{timeout:25000});
  await expect(image).toHaveAttribute('src',/^data:image\/svg\+xml;charset=utf-8,/);
  await expect(image).toHaveJSProperty('complete',true);
  expect(await image.evaluate(el=>el.naturalWidth),kind).toBeGreaterThan(0);
  await expect(page.locator('#markdown-preview .mermaid-error')).toHaveCount(0);
  await expect(editor).toHaveValue(source);
 }
});

test('issue #18 Mermaid has accessible zoom, fit and source controls',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill(mermaidSnippet('flowchart'));
 const image=page.locator('#markdown-preview figure.mermaid-diagram img');
 await expect(image).toBeVisible({timeout:20000});
 const toolbar=page.locator('#markdown-preview .mermaid-zoom-controls');
 await expect(toolbar.locator('button')).toHaveCount(3);
 await toolbar.getByRole('button',{name:'Zoom in'}).click();
 await expect(toolbar.locator('output')).toHaveText('125%');
 await expect(image).toHaveAttribute('style',/width:\s*125%/);
 await toolbar.getByRole('button',{name:'Zoom out'}).click();
 await expect(toolbar.locator('output')).toHaveText('100%');
 await toolbar.getByRole('button',{name:'Zoom out'}).click();
 await expect(toolbar.getByRole('button',{name:'Zoom out'})).toBeDisabled();
 await toolbar.getByRole('button',{name:'Fit to width'}).click();
 await expect(toolbar.locator('output')).toHaveText('100%');
 const source=page.locator('#markdown-preview .mermaid-source');
 await source.locator('summary').click();
 await expect(source.locator('code.language-mermaid')).toContainText('flowchart LR');
});

test('issue #18 Mermaid zoom works on narrow mobile Preview',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#markdown-input').fill(mermaidSnippet('sequence'));
 await page.locator('#mobile-tabs [data-mobile-tab="preview"]').click();
 await expect(page.locator('#markdown-preview .mermaid-diagram img')).toBeVisible({timeout:25000});
 const viewport=page.locator('#markdown-preview .mermaid-viewport');
 const width=await viewport.evaluate(el=>el.getBoundingClientRect().width);
 expect(width).toBeGreaterThan(100);
 expect(width).toBeLessThanOrEqual(390);
 await page.locator('#markdown-preview .mermaid-zoom-controls').getByRole('button',{name:'Zoom in'}).click();
 await expect(page.locator('#markdown-preview .mermaid-zoom-level')).toHaveText('125%');
});

test('issue #18 Mermaid renders after an offline reload with precached chunks',async({page,context})=>{
 test.setTimeout(90000);
 await page.goto('/');
 const source=mermaidSnippet('flowchart');
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview .mermaid-diagram img')).toBeVisible({timeout:25000});
 await page.evaluate(async()=>{
  const registration=await navigator.serviceWorker.ready;
  if(!navigator.serviceWorker.controller)
   await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Service worker did not claim page')),15000);
    navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(timeout);resolve();},{once:true});
   });
  return registration.active?.state;
 });
 await context.setOffline(true);
 try{
  await page.reload();
  await expect(page.locator('#markdown-input')).toHaveValue(source);
  const diagram=page.locator('#markdown-preview .mermaid-diagram img');
  await expect(diagram).toBeVisible({timeout:25000});
  expect(await diagram.evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
 }finally{
  await context.setOffline(false);
 }
});


test('issue #19 exports validated Mermaid SVG without changing Markdown source',async({page})=>{
 await page.goto('/');
 const source=mermaidSnippet('flowchart');
 const editor=page.locator('#markdown-input');
 await editor.fill(source);
 await expect(page.locator('#markdown-preview .mermaid-diagram img')).toBeVisible({timeout:20000});
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#markdown-preview .mermaid-export-controls').getByRole('button',{name:'Export SVG'}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toBe('mermaid-diagram-1.svg');
 const svg=await readFile(await download.path(),'utf8');
 expect(svg).toContain('<svg');
 expect(svg).not.toMatch(/<script|<foreignObject|@import|href\s*=\s*["'](?:https?:|javascript:)/i);
 await expect(editor).toHaveValue(source);
});

test('issue #19 exports Mermaid PNG at 2x with no remote requests',async({page})=>{
 await page.goto('/');
 const source=mermaidSnippet('sequence');
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview .mermaid-diagram img')).toBeVisible({timeout:20000});
 const controls=page.locator('#markdown-preview .mermaid-export-controls');
 await controls.getByRole('combobox',{name:'PNG resolution'}).selectOption('2');
 const downloadPromise=page.waitForEvent('download');
 await controls.getByRole('button',{name:'Export PNG'}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toBe('mermaid-diagram-1.png');
 const file=await readFile(await download.path());
 expect(file.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
 expect(file.readUInt32BE(16)).toBeGreaterThan(100);
 expect(file.readUInt32BE(20)).toBeGreaterThan(80);
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('issue #19 copy Mermaid source is accessible and localized',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto('/');
 const source=mermaidSnippet('pie');
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview .mermaid-export-controls')).toBeVisible({timeout:20000});
 await page.locator('#markdown-preview .mermaid-export-controls').getByRole('button',{name:'Copy source'}).click();
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('pie showData');
 await expect(page.locator('#markdown-preview .mermaid-export-status')).toContainText('copied');
 await page.locator('#lang-selector').selectOption('ru');
 // Lessons have language-specific drafts: insert the same source into the RU draft.
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview .mermaid-export-controls')).toBeVisible({timeout:20000});
 await expect(page.locator('#markdown-preview .mermaid-export-controls')).toContainText('Экспорт SVG');
 await expect(page.locator('#markdown-preview .mermaid-export-controls')).toContainText('Экспорт PNG');
 await expect(page.locator('#markdown-preview .mermaid-export-controls')).toContainText('Копировать код');
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});


test('issue #19 standalone HTML embeds multiple Mermaid diagrams as safe offline images',async({page,context},testInfo)=>{
 test.setTimeout(90000);
 await page.goto('/');
 const source=mermaidSnippet('flowchart')+'\nBetween diagrams.\n'+mermaidSnippet('sequence');
 const editor=page.locator('#markdown-input');
 await editor.fill(source);
 // Export immediately: do not depend on Live Preview debounce.
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const download=await downloadPromise;
 // Chromium treats Playwright's extensionless temporary download as text/plain.
 // Save with a real .html extension to test the browser's HTML file handler.
 const path=testInfo.outputPath('offline-mermaid-export.html');
 await download.saveAs(path);
 const html=await readFile(path,'utf8');
 expect(html).toContain('Content-Security-Policy');
 expect(html).not.toMatch(/<script[\s>]|<iframe[\s>]|<foreignObject[\s>]/i);
 expect((html.match(/class="md-mermaid-export"/g)||[]).length).toBe(2);
 expect((html.match(/src="data:image\/svg\+xml;charset=utf-8,/g)||[]).length).toBe(2);
 expect(html).toContain('Between diagrams.');
 await context.setOffline(true);
 try{
  const local=await context.newPage();
  const outbound=[];
  local.on('request',request=>{if(/^https?:/i.test(request.url()))outbound.push(request.url());});
  await local.goto(pathToFileURL(path).href);
  await expect(local.locator('.md-mermaid-export img')).toHaveCount(2);
  for(const img of await local.locator('.md-mermaid-export img').all()){
   await expect(img).toHaveJSProperty('complete',true);
   expect(await img.evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
  }
  expect(outbound).toEqual([]);
  await expect(local.locator('script,iframe,foreignObject')).toHaveCount(0);
  await local.close();
 }finally{
  await context.setOffline(false);
 }
 await expect(editor).toHaveValue(source);
});

test('issue #19 print tab contains static diagrams and makes a valid PDF',async({page})=>{
 test.setTimeout(65000);
 await page.goto('/');
 const source=mermaidSnippet('pie')+'\n'+mermaidSnippet('flowchart');
 await page.locator('#markdown-input').fill(source);
 const popupPromise=page.waitForEvent('popup');
 await page.locator('#print-document-btn').click();
 const popup=await popupPromise;
 await expect(popup.locator('figure.md-mermaid-export img')).toHaveCount(2,{timeout:25000});
 const rendered=await popup.locator('figure.md-mermaid-export img').evaluateAll(list=>list.every(img=>img.complete&&img.naturalWidth>0));
 expect(rendered).toBe(true);
 await expect(popup.locator('.mermaid-zoom-controls,script')).toHaveCount(0);
 const pdf=await popup.pdf({format:'A4',printBackground:true});
 expect(pdf.subarray(0,5).toString()).toBe('%PDF-');
 expect(pdf.length).toBeGreaterThan(9000);
 await popup.close();
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('issue #19 failed Mermaid render keeps source visible and warns on HTML export',async({page})=>{
 await page.goto('/');
 const source='~~~mermaid\n%%{init: {"securityLevel":"loose"}}%%\nflowchart LR\n A-->B\n~~~\n\nSafe text';
 await page.locator('#markdown-input').fill(source);
 let warning='';
 page.on('dialog',dialog=>{warning=dialog.message();dialog.accept();});
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const download=await downloadPromise;
 const html=await readFile(await download.path(),'utf8');
 expect(html).toContain('md-mermaid-export-error');
 expect(html).toContain('securityLevel');
 expect(html).toContain('Safe text');
 expect(html).not.toContain('class="md-mermaid-export"');
 expect(warning).toMatch(/Mermaid/i);
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('issue #19 standalone HTML drops hostile inline SVG/image payloads',async({page},testInfo)=>{
 await page.goto('/');
 const source=mermaidSnippet('flowchart')+'\n<svg onload="window.__svgAttack=1"><script>window.__svgAttack=2</script></svg>\n\n'+
  '<img src="data:image/svg+xml,%3Csvg%20onload%3D%22alert(1)%22%3E" onerror="window.__svgAttack=3">';
 await page.locator('#markdown-input').fill(source);
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#download-html-btn').click();
 const dl=await downloadPromise;
 const exportedPath=testInfo.outputPath('safe-mermaid-export.html');
 await dl.saveAs(exportedPath);
 const html=await readFile(exportedPath,'utf8');
 expect((html.match(/class="md-mermaid-export"/g)||[]).length).toBe(1);
 expect(html).not.toMatch(/<script[\s>]|<svg[\s>]|onload=|onerror=|javascript:/i);
 const page2=await page.context().newPage();
 await page2.goto(pathToFileURL(exportedPath).href);
 await expect(page2.locator('.md-mermaid-export img')).toHaveCount(1);
 expect(await page2.evaluate(()=>window.__svgAttack)).toBeUndefined();
 await page2.close();
});


test('issue #19 optional Mermaid labs render real diagrams and persist separately',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/');
 const mainDraft=await page.locator('#markdown-input').inputValue();
 const progressBefore=await page.locator('#progress-label').innerText();
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 await expect(page.locator('#extensions-lab-select option')).toHaveCount(16);
 const ids=['mermaid-flowchart','mermaid-sequence','mermaid-pie'];
 const source=page.locator('#extensions-lab-source');
 for(const id of ids){
  await page.locator('#extensions-lab-select').selectOption(id);
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
  await page.locator('#extensions-lab-example').click();
  await expect(page.locator('#extensions-lab-preview figure.mermaid-diagram img')).toHaveCount(1,{timeout:25000});
  const image=page.locator('#extensions-lab-preview figure.mermaid-diagram img');
  expect(await image.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['✓ ','✓ '],{timeout:20000});
  await expect(source).toHaveValue(/~~~mermaid/);
 }
 await expect(page.locator('#extensions-lab-progress')).toHaveText('3 / 16');
 await page.locator('#extensions-lab-close').click();
 await expect(page.locator('#markdown-input')).toHaveValue(mainDraft);
 await expect(page.locator('#progress-label')).toHaveText(progressBefore);
 await page.reload();
 await page.locator('#contents-toggle-btn').click();
 await expect(page.locator('#extensions-lab-open-progress')).toHaveText('3 / 16');
 await page.locator('#extensions-lab-open').click();
 await expect(page.locator('#extensions-lab-select')).toHaveValue('mermaid-pie');
 await expect(source).toHaveValue(/pie showData/);
});

test('issue #19 Mermaid labs refuse code examples and invalid Mermaid input',async({page})=>{
 test.setTimeout(65000);
 await page.goto('/');
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const source=page.locator('#extensions-lab-source');
 for(const id of ['mermaid-flowchart','mermaid-sequence','mermaid-pie']){
  await page.locator('#extensions-lab-select').selectOption(id);
  await page.locator('#extensions-lab-example').click();
  const example=await source.inputValue();
  await source.fill('~~~~markdown\n'+example+'\n~~~~');
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
  await source.fill('~~~mermaid\nthisIsNotARealDiagram\n~~~');
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
  await expect(page.locator('#extensions-lab-preview figure.mermaid-diagram img')).toHaveCount(0);
 }
});

test('issue #19 Mermaid exercise descriptions and results are localized on mobile',async({page})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const titles={en:'Mermaid',cs:'Mermaid',uk:'Mermaid',ro:'Mermaid',ru:'Mermaid'};
 for(const lang of Object.keys(titles)){
  await page.locator('#lang-selector').selectOption(lang);
  await page.locator('#contents-toggle-btn').click();
  await page.locator('#extensions-lab-open').click();
  await expect(page.locator('#extensions-lab-select option')).toHaveCount(16);
  for(const id of ['mermaid-flowchart','mermaid-sequence','mermaid-pie']){
   await page.locator('#extensions-lab-select').selectOption(id);
   await expect(page.locator('#extensions-lab-description')).not.toBeEmpty();
   await expect(page.locator('#extensions-lab-portability')).toContainText('Mermaid');
   await expect(page.locator('#extensions-lab-checks li')).toHaveCount(2);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#extensions-lab-modal')).toBeHidden();
 }
});
