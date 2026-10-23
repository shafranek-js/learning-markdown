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
