import {test,expect} from '@playwright/test';

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
