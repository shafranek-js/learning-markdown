import {test,expect} from '@playwright/test';

const button=(page,kind)=>page.locator('.toolbar-btn[data-action="'+kind+'"]');
const revealAdvanced=async page=>{
 const toggle=page.locator('#advanced-tools-toggle');
 if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
 await expect(button(page,'adv-spoiler')).toBeVisible();
};
const select=async(input,text)=>{
 await input.evaluate((el,needle)=>{
  const pos=el.value.indexOf(needle);if(pos<0)throw new Error('Missing selection');
  el.focus();el.setSelectionRange(pos,pos+needle.length);
 },text);
};

test('native toolbar Horizontal Rule inserts after selected words without deleting source',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Before Alpha After';
 await input.fill(source);await select(input,'Alpha');
 await button(page,'hr').click();
 const expected='Before Alpha\n\n---\n\n After';
 await expect(input).toHaveValue(expected);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(expected);
});

test('native Details wraps selected lines, keeps source selection and Undo/Redo',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Before Alpha After';
 await input.fill(source);await select(input,'Alpha');
 await revealAdvanced(page);
 await button(page,'adv-spoiler').click();
 const expected='Before \n\n<details>\n<summary>More information</summary>\n\nAlpha\n</details>\n\n After';
 await expect(input).toHaveValue(expected);
 expect(await input.evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd))).toBe('Alpha');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(expected);
});

test('both editors preserve legacy examples for empty caret HR and Details',async({page})=>{
 const input=page.locator('#markdown-input');
 for(const multi of [false,true]){
  for(const kind of ['hr','adv-spoiler']){
   await page.goto('/');
   await input.fill('Prefix');
   await input.evaluate(el=>{el.focus();el.setSelectionRange(6,6);});
   if(multi){
    await page.locator('#multi-cursor-toggle').click();
    await expect(page.locator('#codemirror-mount .cm-content')).toBeVisible();
   }
   if(kind==='adv-spoiler')await revealAdvanced(page);
   await button(page,kind).click();
   const ending=kind==='hr'?'\n\n---\n\n':
    '\n\n<details>\n<summary>More information</summary>\n\nHidden content\n</details>\n';
   await expect(input).toHaveValue('Prefix'+ending);
   await page.locator('#undo-btn').click();
   await expect(input).toHaveValue('Prefix');
  }
 }
});

test('CodeMirror multi-cursor HR and Details are atomic and reversible',async({page})=>{
 const input=page.locator('#markdown-input');
 for(const kind of ['hr','adv-spoiler']){
  await page.goto('/');
  const source='Alpha\nAlpha\nAlpha';
  await input.fill(source);
  await page.locator('#multi-cursor-toggle').click();
  const cm=page.locator('#codemirror-mount .cm-content');
  await expect(cm).toBeVisible();
  await cm.click();
  await page.keyboard.press('Control+Home');
  await page.keyboard.press('Shift+End');
  await page.keyboard.press('Control+Shift+l');
  await expect(page.locator('#multi-cursor-count')).toContainText('3');
  if(kind==='adv-spoiler')await revealAdvanced(page);
  await button(page,kind).click();
  const output=await input.inputValue();
  expect((output.match(/Alpha/g)||[]).length).toBe(3);
  expect((output.match(kind==='hr'?/\n---\n/g:/<details>/g)||[]).length).toBe(3);
  await page.locator('#undo-btn').click();
  await expect(input).toHaveValue(source);
  await page.locator('#redo-btn').click();
  await expect(input).toHaveValue(output);
 }
});

test('mixed fenced code selection refuses HR and Details atomically',async({page})=>{
 const input=page.locator('#markdown-input'),source='Plain\n~~~js\nconst x=1;\n~~~\nLast';
 for(const multi of [false,true]){
  await page.goto('/');
  await input.fill(source);
  if(multi){
   await page.locator('#multi-cursor-toggle').click();
   const cm=page.locator('#codemirror-mount .cm-content');
   await expect(cm).toBeVisible();await cm.click();await page.keyboard.press('Control+a');
  }else{
   await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
  }
  await revealAdvanced(page);
  for(const kind of ['hr','adv-spoiler']){
   const dialog=page.waitForEvent('dialog').then(d=>{
    expect(d.message()).toContain('fenced code block');return d.accept();
   });
   await button(page,kind).click();
   await dialog;
   await expect(input).toHaveValue(source);
  }
 }
});

test('narrow Russian editor preserves selected text inside Details',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const input=page.locator('#markdown-input');
 await input.fill('Скрытый текст');
 await select(input,'Скрытый текст');
 await revealAdvanced(page);
 await button(page,'adv-spoiler').click();
 await expect(input).toHaveValue(/\<details\>[\s\S]*Скрытый текст[\s\S]*\<\/details\>/);
 expect(await input.evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd))).toBe('Скрытый текст');
});
