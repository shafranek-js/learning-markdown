import {undo,redo} from './support/history-actions.js';
import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';

const select=async(input,needle)=>{
 await input.evaluate((el,text)=>{
  const start=el.value.indexOf(text);
  if(start<0)throw new Error('Selection text not found');
  el.focus();el.setSelectionRange(start,start+text.length);
 },needle);
};
async function advanced(page){
 const toggle=page.locator('#advanced-tools-toggle');
 if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
 await expect(page.locator('#advanced-toolbar')).toBeVisible();
}

test('advanced HTML example adds a standalone block after selected source without deleting it',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input'),original='Before selected After';
 await input.fill(original);await select(input,'selected');
 await page.locator('#advanced-lab summary').click();
 await page.locator('#advanced-lab-examples button').first().click();
 const updated=await input.inputValue();
 expect(updated).toContain('Before selected After\n\n');
 expect(updated).toContain('<u>Underlined text</u>');
 expect(updated).toContain('<u>Underlined text</u>\n');
 await undo(page);
 await expect(input).toHaveValue(original);
 await redo(page);
 await expect(input).toHaveValue(updated);
});

test('definition HTML template preserves selected Markdown and one native Undo step',async({page})=>{
 await page.goto('/');
 await advanced(page);
 const input=page.locator('#markdown-input'),original='Before important text After';
 await input.fill(original);await select(input,'important text');
 await page.locator('#definition-html-insert').click();
 const result=await input.inputValue();
 expect(result).toContain('Before important text After\n\n<dl>');
 expect(result).toContain('</dl>\n');
 expect(result).toContain('First <strong>definition</strong>');
 await undo(page);
 await expect(input).toHaveValue(original);
});

test('CodeMirror HTML template inserts after all selections atomically',async({page})=>{
 await page.goto('/');
 await advanced(page);
 const input=page.locator('#markdown-input'),original='Alpha\nAlpha\nAlpha';
 await input.fill(original);
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await expect(cm).toBeVisible();
 await cm.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Shift+End');
 await page.keyboard.press('Control+Shift+l');
 await expect(page.locator('#multi-cursor-count')).toContainText('3');
 await page.locator('#definition-html-insert').click();
 const updated=await input.inputValue();
 expect((updated.match(/Alpha/g)||[]).length).toBe(3);
 expect((updated.match(/<dl>/g)||[]).length).toBe(3);
 await undo(page);
 await expect(input).toHaveValue(original);
 await redo(page);
 await expect(input).toHaveValue(updated);
});

test('Mermaid insertion keeps selected prose and creates a separate preview diagram',async({page})=>{
 await page.goto('/');
 await advanced(page);
 const input=page.locator('#markdown-input'),original='Before GRAPH After';
 await input.fill(original);await select(input,'GRAPH');
 await page.locator('#mermaid-template-choice').selectOption('flowchart');
 await page.locator('#mermaid-template-insert').click();
 const result=await input.inputValue();
 expect(result).toContain('Before GRAPH After\n\n');
 expect(result).toContain('\x60\x60\x60mermaid');
 expect(result).toContain('\x60\x60\x60\n');
 await expect(page.locator('#markdown-preview figure.mermaid-diagram')).toHaveCount(1,{timeout:20000});
 await undo(page);
 await expect(input).toHaveValue(original);
});

test('Russian mobile and fenced selection guard prevent source loss with templates',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 await advanced(page);
 const input=page.locator('#markdown-input'),source='Текст\n~~~js\nconsole.log(1);\n~~~\nКонец';
 await input.fill(source);
 await select(input,'console.log(1);');
 const message=page.waitForEvent('dialog').then(d=>{
  expect(d.message()).toContain('Выделение содержит блок кода');return d.accept();
 });
 await page.locator('#definition-html-insert').click();
 await message;
 await expect(input).toHaveValue(source);
 await input.fill('Начало\nВажное\nКонец');
 await select(input,'Важное');
 await page.locator('#definition-html-insert').click();
 await expect(input).toHaveValue(/Начало\nВажное\n\n<dl>/);
 await expect(input).toHaveValue(/Конец$/);
});
